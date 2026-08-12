from __future__ import annotations

from typing import Any

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
    """Add the same engineered features used during training."""
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

    result = df.to_dict("records")[0]
    # Ensure all values are float
    for key in result:
        result[key] = float(result[key])
    return result


def _battery_status(soh: float) -> str:
    if soh >= 90:
        return "Excellent"
    if soh >= 80:
        return "Good"
    if soh >= 70:
        return "Warning"
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
    # SOH boundary distance component (0-100 scale)
    soh_boundaries = [70, 80, 90]
    soh_distance = min(abs(soh - boundary) for boundary in soh_boundaries)
    soh_confidence = 78 + min(soh_distance * 2.2, 17)

    # RUL model quality component (based on R2 score)
    rul_quality = 50 + (rul_r2 * 50)  # R2 of 0 -> 50%, R2 of 1 -> 100%

    # RUL magnitude component (lower RUL = higher confidence)
    rul_magnitude_conf = max(50, 100 - (rul / 60.0) * 50)

    # Weighted average
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


def predict_battery_health(payload: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model_bundle(settings.model_artifact_dir)

    if bundle is None:
        raise PredictionError("No trained model found. Train models before running predictions.")

    # Validate and prepare features
    features = _validate_features(payload)

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

    # Clip predictions to valid ranges
    soh = round(max(0.0, min(100.0, soh_pred)), 2)
    rul = round(max(0.0, min(60.0, rul_pred)), 2)

    # Get R2 scores for confidence calculation
    metadata = bundle.get("metadata", {})
    soh_r2 = _get_r2_from_metadata(metadata, "SOH")
    rul_r2 = _get_r2_from_metadata(metadata, "RUL")

    risk = _risk_score(features, soh, rul)

    return {
        "input": features,
        "SOH": soh,
        "RUL": rul,
        "batteryStatus": _battery_status(soh),
        "riskScore": risk["score"],
        "riskLabel": risk["label"],
        "riskFactors": risk["factors"],
        "confidenceScore": _confidence_score(soh, rul, rul_r2),
        "degradationTrend": _degradation_trend(soh, rul),
        "modelMetadata": metadata,
    }
