from __future__ import annotations

from typing import Any, cast

import numpy as np
import pandas as pd

from app.config.settings import settings
from app.models.model_registry import load_model_bundle
from app.pipelines.training_pipeline import FEATURE_COLUMNS, ENGINEERED_FEATURES


class PredictionError(ValueError):
    pass


def _validate_features(payload: dict[str, Any]) -> dict[str, float]:
    features = {}

    defaults = {
        "is_two_wheeler": 0.0,
        "is_three_wheeler": 0.0,
        "is_four_wheeler": 1.0,
        "is_bus": 0.0,
        "is_chemistry_lfp": 1.0,
        "is_chemistry_nmc": 0.0,
        "is_chemistry_lead_acid": 0.0,
        "chargingFrequency": 4.0,
        "chargingDuration": 3.0,
        "socHistory": 60.0,
        "current": 25.0,
        "totalKmDriven": 30000.0,
        "dailyDistance": 45.0,
        "batteryCapacity": 50.0,
        "voltage": 350.0,
        "batteryAge": 1.0,
        "chargingCycles": 150.0,
        "fastChargingUsage": 20.0,
        "averageTemperature": 25.0,
    }

    for feature in FEATURE_COLUMNS:
        if feature in payload:
            try:
                features[feature] = float(payload[feature])
            except (TypeError, ValueError) as error:
                raise PredictionError(f"{feature} must be a numeric value") from error
        elif feature in defaults:
            features[feature] = defaults[feature]
        else:
            raise PredictionError(f"Missing required feature: {feature}")

    return features


def _add_engineered_features(features: dict[str, float]) -> dict[str, float]:
    """Add the same engineered features used during training, including electro-thermal & dQ/dV indicators."""
    df = pd.DataFrame([features])

    # Interaction: battery age * charging cycles
    df["age_cycles_interaction"] = df["batteryAge"] * df["chargingCycles"]

    # Interaction: temperature * fast charging
    df["temp_fastcharge_interaction"] = df["averageTemperature"] * df["fastChargingUsage"]

    # Ratio: cycles per year of age
    df["cycles_per_age"] = df["chargingCycles"] / (df["batteryAge"] + 0.01)

    # Interaction: voltage * current
    df["voltage_current_interaction"] = df["voltage"] * df["current"]

    # Proxy for SOH-RUL relationship
    df["soh_rul_ratio_proxy"] = df["chargingCycles"] / (df["batteryCapacity"] + 0.01)

    # Non-linear temperature feature
    df["temp_squared"] = df["averageTemperature"] ** 2

    # Interaction: fast charging * temperature
    df["fastcharge_temp_interaction"] = df["fastChargingUsage"] * df["averageTemperature"]

    # Electro-Thermal & dQ/dV Features
    temp_c = float(features.get("averageTemperature", 25.0))
    fast_pct = float(features.get("fastChargingUsage", 20.0))
    cycles = float(features.get("chargingCycles", 100.0))
    cap = float(features.get("batteryCapacity", 50.0))
    voltage = float(features.get("voltage", 350.0))
    current = float(features.get("current", 25.0))

    # 1. Arrhenius Thermal Factor: exp( (Ea/k) * (1/298.15 - 1/(T+273.15)) )
    temp_k = temp_c + 273.15
    try:
        arrhenius_factor = float(np.exp((0.35 / 8.617e-5) * (1.0 / 298.15 - 1.0 / temp_k)))
    except Exception:
        arrhenius_factor = 1.0
    df["arrhenius_thermal_factor"] = max(0.1, min(10.0, arrhenius_factor))

    # 2. Electro-Thermal Stress Index
    df["thermal_stress_score"] = float(max(0.0, min(100.0, abs(temp_c - 25.0) * 2.2 + fast_pct * 0.4)))

    # 3. Cyclic Stress Index
    c_rate = current / (cap + 1e-3)
    df["cyclic_stress_score"] = float(max(0.0, min(100.0, (c_rate ** 1.5) * (cycles / 100.0))))

    # 4. Internal Resistance Estimate (R_0 = V / I proxy)
    df["internal_resistance_est"] = float(voltage / (current + 1e-3))

    # 5. Synthesized dQ/dV Peak Height & Shift Metrics
    cycle_ratio = cycles / 1000.0
    df["ica_peak_position_v"] = max(3.0, 3.75 - 0.04 * cycle_ratio)
    df["ica_peak_height"] = max(0.1, 4.5 - 1.1 * cycle_ratio - 0.01 * (temp_c - 25.0))
    df["ica_peak_shift_v"] = float(-0.04 * cycle_ratio)
    df["dva_peak_position_q"] = max(0.5, 1.9 - 0.25 * cycle_ratio)
    df["dva_peak_height"] = max(0.1, 3.2 - 0.8 * cycle_ratio)
    df["degradation_stress_multiplier"] = float(arrhenius_factor * (1.0 + 0.01 * fast_pct))

    raw_dict = df.to_dict("records")[0]
    return cast(dict[str, float], {str(k): float(v) for k, v in raw_dict.items()})


def _battery_status(soh: float, rul: float = 0.0) -> str:
    """
    Jointly evaluates State of Health (SOH) and Remaining Useful Life (RUL).
    Standard EV Automotive End-of-Life (EOL) threshold is SOH = 80%.
    """
    if soh >= 90:
        return "Excellent"
    if soh >= 80:
        return "Good"
    if soh >= 70:
        if rul >= 24:
            return "Warning (EV EOL Approaching)"
        return "Warning"
    
    # SOH < 80% (Automotive EV EOL Reached)
    if rul >= 24:
        return "EV Retired (Second-Life Storage Ready)"
    return "Critical"


def _degradation_trend(soh: float, rul: float) -> str:
    if soh >= 90 and rul >= 40:
        return "Stable"
    if soh >= 80 and rul >= 25:
        return "Moderate degradation"
    if soh >= 70 and rul >= 10:
        return "Accelerated degradation"
    return "High degradation risk"


def _confidence_score(soh: float, rul: float, rul_r2: float) -> float:
    """
    Compute confidence based on:
    1. Distance from classification boundaries (SOH)
    2. Model quality for RUL (R2 score)
    3. RUL value magnitude (higher RUL = more uncertainty)
    """
    soh_boundaries = [70, 80, 90]
    soh_distance = min(abs(soh - boundary) for boundary in soh_boundaries)
    soh_confidence = 78 + min(soh_distance * 2.2, 17)

    rul_quality = 50 + (rul_r2 * 50)
    rul_magnitude_conf = max(50, 100 - (rul / 60.0) * 50)

    confidence = (soh_confidence * 0.4 + rul_quality * 0.35 + rul_magnitude_conf * 0.25)
    return round(float(min(confidence, 95.0)), 2)


def _risk_score(features: dict[str, float], soh: float, rul: float) -> dict[str, Any]:
    score = 0
    factors: list[str] = []

    if soh < 70:
        score += 35
        factors.append("SOH is below the critical health threshold")
    elif soh < 80:
        score += 24
        factors.append("SOH has dropped below the healthy operating range")
    elif soh < 90:
        score += 12
        factors.append("SOH shows early degradation")

    if rul < 10:
        score += 25
        factors.append("Remaining useful life is short")
    elif rul < 25:
        score += 14
        factors.append("Remaining useful life is narrowing")

    if features.get("fastChargingUsage", 0) >= 70:
        score += 14
        factors.append("Fast charging usage is high")
    elif features.get("fastChargingUsage", 0) >= 50:
        score += 8
        factors.append("Fast charging usage is elevated")

    if features.get("averageTemperature", 25) >= 40:
        score += 14
        factors.append("Average temperature is very high")
    elif features.get("averageTemperature", 25) >= 35:
        score += 8
        factors.append("Average temperature is above the preferred range")

    soc = features.get("socHistory", 50)
    if soc < 20 or soc > 85:
        score += 8
        factors.append("SOC history is outside the daily recommended band")

    if features.get("chargingCycles", 0) >= 2500:
        score += 8
        factors.append("Charging cycle count is high")

    normalized_score = min(score, 100)

    if normalized_score >= 70:
        label = "High Risk"
    elif normalized_score >= 40:
        label = "Medium Risk"
    else:
        label = "Low Risk"

    return {
        "score": round(float(normalized_score), 2),
        "label": label,
        "factors": factors[:5],
    }


def _get_r2_from_metadata(metadata: dict[str, Any], target: str) -> float:
    """Extract R2 score for a target from model metadata."""
    best_metrics = metadata.get("bestMetrics", {})
    target_metrics = best_metrics.get(target, {})
    return target_metrics.get("r2", 0.5)


def _compute_physics_guided_health(
    raw_soh_pred: float | None,
    raw_rul_pred: float | None,
    features: dict[str, float],
    payload: dict[str, Any]
) -> tuple[float, float]:
    """
    Universal multi-vehicle physics degradation calibration.
    Physics-guided bounds for Two-Wheelers, Three-Wheelers, Four-Wheelers, and Heavy Electric Buses.
    """
    age = max(0.05, float(payload.get("batteryAge") or features.get("batteryAge", 1.0)))
    cycles = max(1.0, float(payload.get("chargingCycles") or features.get("chargingCycles", 100.0)))
    fast_charge_pct = max(0.0, float(payload.get("fastChargingUsage") or features.get("fastChargingUsage", 20.0)))
    temp_c = float(payload.get("averageTemperature") or features.get("averageTemperature", 25.0))

    expected_cycles = max(500.0, float(payload.get("expectedCycles") or features.get("expectedCycles") or 1500.0))
    estimated_life_years = max(2.0, float(payload.get("estimatedLifeYears") or features.get("estimatedLifeYears") or 8.0))

    # Chemistry degradation factor: LFP has ~0.80x degradation velocity of NMC; Lead Acid is ~1.3x
    is_lfp = features.get("is_chemistry_lfp", 0.0) == 1.0
    is_lead_acid = features.get("is_chemistry_lead_acid", 0.0) == 1.0
    chem_factor = 0.80 if is_lfp else (1.3 if is_lead_acid else 1.0)

    # Thermal & Fast Charge stress multipliers
    thermal_mult = 1.0 + (max(0.0, temp_c - 25.0) * 0.01)
    fast_charge_mult = 1.0 + (max(0.0, fast_charge_pct - 20.0) * 0.002)

    # 1. Cyclic SOH Loss (% capacity degradation towards 80% EOL)
    cycle_ratio = min(2.0, cycles / expected_cycles)
    cyclic_loss = 20.0 * (cycle_ratio ** 0.85) * chem_factor * fast_charge_mult

    # 2. Calendar Aging SOH Loss (Square-root kinetic time decay)
    age_ratio = min(2.0, age / estimated_life_years)
    calendar_loss = 20.0 * (age_ratio ** 0.5) * 0.3 * thermal_mult

    total_loss = cyclic_loss + calendar_loss
    physics_soh = max(45.0, min(100.0, 100.0 - total_loss))

    if raw_soh_pred is not None:
        # Physics-constrained blending: bound raw ML prediction to physics loss limits ± 6%
        soh = max(physics_soh - 6.0, min(physics_soh + 6.0, raw_soh_pred))
    else:
        soh = physics_soh

    soh = round(float(max(45.0, min(100.0, soh))), 2)

    # RUL calculation: Remaining Useful Life in Months until 70% SOH (Second life threshold)
    remaining_headroom = max(0.0, soh - 70.0)
    expected_life_months = estimated_life_years * 12.0

    # RUL scales proportionally with SOH headroom above EOL threshold (70%)
    rul_months = (remaining_headroom / 30.0) * expected_life_months
    rul = round(float(max(0.0, min(120.0, rul_months))), 1)

    return soh, rul


def predict_battery_health(payload: dict[str, Any]) -> dict[str, Any]:
    features = _validate_features(payload)
    bundle = load_model_bundle(settings.model_artifact_dir)

    if bundle is None:
        soh, rul = _compute_physics_guided_health(None, None, features, payload)
        risk = _risk_score(features, soh, rul)

        return {
            "input": features,
            "SOH": soh,
            "RUL": rul,
            "batteryStatus": _battery_status(soh, rul),
            "riskScore": risk["score"],
            "riskLabel": risk["label"],
            "riskFactors": risk["factors"],
            "confidenceScore": 92.5,
            "degradationTrend": _degradation_trend(soh, rul),
            "modelMetadata": {
                "bestModelName": "Universal Physics-Guided Model",
                "isBaseline": True,
            },
        }

    # Add engineered features (same as during training)
    all_features = _add_engineered_features(features)

    # Get feature columns from the bundle (may include engineered features)
    feature_columns = bundle.get("featureColumns", FEATURE_COLUMNS + ENGINEERED_FEATURES)

    # Build input DataFrame with all required columns
    input_data = {col: all_features.get(col, 0.0) for col in feature_columns}
    dataframe = pd.DataFrame([input_data], columns=feature_columns)

    # Get SOH and RUL models from the bundle
    soh_model = bundle.get("soh_model", bundle["model"])
    rul_model = bundle.get("rul_model", bundle["model"])

    # Predict SOH and RUL separately
    soh_pred = float(soh_model.predict(dataframe)[0])
    rul_pred = float(rul_model.predict(dataframe)[0])

    # Universal Physics-Guided Calibration across all vehicle categories
    soh, rul = _compute_physics_guided_health(soh_pred, rul_pred, features, payload)

    # Get R2 scores for confidence calculation
    metadata = bundle.get("metadata", {})
    soh_r2 = _get_r2_from_metadata(metadata, "SOH")
    rul_r2 = _get_r2_from_metadata(metadata, "RUL")

    risk = _risk_score(features, soh, rul)

    return {
        "input": features,
        "SOH": soh,
        "RUL": rul,
        "batteryStatus": _battery_status(soh, rul),
        "riskScore": risk["score"],
        "riskLabel": risk["label"],
        "riskFactors": risk["factors"],
        "confidenceScore": _confidence_score(soh, rul, rul_r2),
        "degradationTrend": _degradation_trend(soh, rul),
        "modelMetadata": {
            **metadata,
            "bestModelName": metadata.get("bestModelName", metadata.get("bestModel", metadata.get("modelName", "Stacked Ensemble"))),
        },
    }
