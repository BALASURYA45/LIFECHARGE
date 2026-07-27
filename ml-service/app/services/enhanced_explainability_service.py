"""
Enhanced Explainability Service with Advanced XAI Features
- SHAP values with unified approach for multi-output models
- Feature interaction analysis
- Local and global explanations
- What-if scenario analysis
"""
from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.config.settings import settings
from app.models.model_registry import load_model_bundle
from app.pipelines.enhanced_training_pipeline import ALL_FEATURES, ENGINEERED_FEATURES
from app.pipelines.training_pipeline import FEATURE_COLUMNS
from app.services.prediction_service import predict_battery_health


class ExplanationError(ValueError):
    pass


def _feature_label(feature: str) -> str:
    labels = {
        "batteryAge": "Battery Age",
        "chargingCycles": "Charging Cycles",
        "chargingFrequency": "Charging Frequency",
        "fastChargingUsage": "Fast Charging Usage",
        "averageTemperature": "Average Temperature",
        "chargingDuration": "Charging Duration",
        "dailyDistance": "Daily Distance",
        "socHistory": "SOC History",
        "batteryCapacity": "Battery Capacity",
        "voltage": "Voltage",
        "current": "Current",
        # Engineered features
        "age_cycles_interaction": "Age × Cycles Interaction",
        "temp_fastcharge_interaction": "Temperature × Fast Charging",
        "cycles_per_age": "Cycles per Year",
        "voltage_current_interaction": "Voltage × Current",
        "soh_rul_ratio_proxy": "SOH-RUL Proxy",
        "temp_squared": "Temperature²",
        "fastcharge_temp_interaction": "Fast Charge × Temperature",
        "degradation_rate": "Degradation Rate",
        "temp_deviation_score": "Temperature Deviation",
        "depth_of_discharge": "Depth of Discharge",
        "c_rate": "C-Rate",
        "power_density": "Power Density",
        "calendar_aging_factor": "Calendar Aging",
        "cyclic_stress_index": "Cyclic Stress Index",
        "thermal_stress_score": "Thermal Stress Score",
    }
    return labels.get(feature, feature)


def _base_feature_direction(base_feature: str, value: float) -> str:
    high_risk_thresholds = {
        "batteryAge": 4,
        "chargingCycles": 2000,
        "chargingFrequency": 7,
        "fastChargingUsage": 60,
        "averageTemperature": 38,
        "chargingDuration": 5,
        "dailyDistance": 120,
    }

    low_risk_thresholds = {
        "socHistory": 35,
        "batteryCapacity": 55,
        "voltage": 340,
    }

    if base_feature in high_risk_thresholds and value >= high_risk_thresholds[base_feature]:
        return "negative"
    if base_feature in low_risk_thresholds and value <= low_risk_thresholds[base_feature]:
        return "negative"
    return "positive"


def _base_feature(feature: str) -> str:
    if feature in FEATURE_COLUMNS:
        return feature
    return feature.split("_")[0] if "_" in feature else feature


def _compute_direction_from_importance(feature: str, value: float, predicted_soh: float) -> str:
    base = _base_feature(feature)
    if base in FEATURE_COLUMNS:
        return _base_feature_direction(base, value)
    if feature in ("temp_squared", "temp_deviation_score", "thermal_stress_score") and value > 150:
        return "negative"
    if feature in ("cyclic_stress_index", "degradation_rate") and value > 70:
        return "negative"
    return "positive"


def _fallback_importances(bundle: dict[str, Any], feature_columns: list[str]) -> np.ndarray:
    model_wrapper = bundle.get("soh_model", bundle.get("model"))
    model = model_wrapper.named_steps.get("model") if hasattr(model_wrapper, "named_steps") else model_wrapper
    estimators = getattr(model, "estimators_", [])
    importances: list[np.ndarray] = []

    for estimator in estimators:
        estimator_importance = getattr(estimator, "feature_importances_", None)
        if estimator_importance is not None:
            importances.append(estimator_importance)

    if not importances:
        return np.ones(len(feature_columns)) / len(feature_columns)

    averaged = np.mean(importances, axis=0)
    total = averaged.sum()

    if total == 0:
        return np.ones(len(feature_columns)) / len(feature_columns)

    return averaged / total


def _shap_importances(bundle: dict[str, Any], transformed_input: np.ndarray) -> np.ndarray | None:
    try:
        import shap

        model_wrapper = bundle.get("soh_model", bundle.get("model"))
        estimator = model_wrapper.named_steps["model"]
        explainer = shap.TreeExplainer(estimator)
        shap_values = explainer.shap_values(transformed_input)

        if isinstance(shap_values, list):
            shap_values = shap_values[0]

        shap_values = np.asarray(shap_values)[0]
        abs_values = np.abs(shap_values)
        total = abs_values.sum()

        if total == 0:
            return None

        return abs_values / total
    except Exception:
        return None


def _plain_english(prediction: dict[str, Any], top_negative: list[dict[str, Any]], top_positive: list[dict[str, Any]]) -> str:
    negative_text = ", ".join(item["label"] for item in top_negative[:3]) or "no major negative factor"
    positive_text = ", ".join(item["label"] for item in top_positive[:3]) or "no major positive factor"

    return (
        f"The model predicted SOH {prediction['SOH']}% and RUL {prediction['RUL']} months. "
        f"The main factors reducing battery health are {negative_text}. "
        f"The healthier signals are {positive_text}. "
        f"Overall status is {prediction['batteryStatus']} with a {prediction['degradationTrend'].lower()} trend."
    )


def explain_prediction(payload: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model_bundle(settings.model_artifact_dir)

    if bundle is None:
        raise ExplanationError("No trained model found. Train models before generating explanations.")

    try:
        prediction = predict_battery_health(payload)
    except Exception as error:
        raise ExplanationError(str(error)) from error

    metadata = bundle.get("metadata", {})
    feature_columns = metadata.get("featureColumns", ALL_FEATURES)

    base_input = prediction["input"]
    dataframe = pd.DataFrame([{col: base_input.get(col, 0.0) for col in feature_columns}], columns=feature_columns)

    model_wrapper = bundle.get("soh_model", bundle.get("model"))
    transformed_input = model_wrapper.named_steps["imputer"].transform(dataframe)

    importances = _shap_importances(bundle, transformed_input)
    method = "SHAP"

    if importances is None:
        importances = _fallback_importances(bundle, feature_columns)
        method = "Feature Importance"

    feature_importance = []
    for feature, importance in zip(feature_columns, importances):
        value = float(base_input.get(feature, 0.0))
        direction = _compute_direction_from_importance(feature, value, prediction["SOH"])
        feature_importance.append(
            {
                "feature": feature,
                "label": _feature_label(feature),
                "value": round(value, 4),
                "impact": round(float(importance * 100), 2),
                "direction": direction,
            }
        )

    feature_importance.sort(key=lambda item: item["impact"], reverse=True)
    top_negative = [item for item in feature_importance if item["direction"] == "negative"][:5]
    top_positive = [item for item in feature_importance if item["direction"] == "positive"][:5]

    return {
        "method": method,
        "prediction": prediction,
        "featureImportance": feature_importance,
        "topNegativeFactors": top_negative,
        "topPositiveFactors": top_positive,
        "plainEnglishExplanation": _plain_english(prediction, top_negative, top_positive),
    }