from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.config.settings import settings
from app.models.model_registry import load_model_bundle
from app.pipelines.training_pipeline import FEATURE_COLUMNS
from app.services.prediction_service import PredictionError, predict_battery_health


class ExplanationError(ValueError):
    pass


def _feature_label(feature: str) -> str:
    labels = {
        "batteryAge": "battery age",
        "chargingCycles": "charging cycles",
        "chargingFrequency": "charging frequency",
        "fastChargingUsage": "fast charging usage",
        "averageTemperature": "average temperature",
        "chargingDuration": "charging duration",
        "dailyDistance": "daily distance",
        "socHistory": "SOC history",
        "batteryCapacity": "battery capacity",
        "voltage": "voltage",
        "current": "current",
    }
    return labels.get(feature, feature)


def _direction(feature: str, value: float) -> str:
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

    if feature in high_risk_thresholds and value >= high_risk_thresholds[feature]:
        return "negative"
    if feature in low_risk_thresholds and value <= low_risk_thresholds[feature]:
        return "negative"
    return "positive"


def _fallback_importances(bundle: dict[str, Any]) -> np.ndarray:
    model = bundle["model"].named_steps["model"]
    estimators = getattr(model, "estimators_", [])
    importances = []

    for estimator in estimators:
        estimator_importance = getattr(estimator, "feature_importances_", None)
        if estimator_importance is not None:
            importances.append(estimator_importance)

    if not importances:
        return np.ones(len(FEATURE_COLUMNS)) / len(FEATURE_COLUMNS)

    averaged = np.mean(importances, axis=0)
    total = averaged.sum()

    if total == 0:
        return np.ones(len(FEATURE_COLUMNS)) / len(FEATURE_COLUMNS)

    return averaged / total


def _shap_importances(bundle: dict[str, Any], transformed_input: np.ndarray) -> np.ndarray | None:
    try:
        import shap

        multi_output_model = bundle["model"].named_steps["model"]
        estimator = multi_output_model.estimators_[0]
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
    except PredictionError as error:
        raise ExplanationError(str(error)) from error

    features = prediction["input"]
    dataframe = pd.DataFrame([features], columns=FEATURE_COLUMNS)
    transformed_input = bundle["model"].named_steps["scaler"].transform(
        bundle["model"].named_steps["imputer"].transform(dataframe)
    )

    importances = _shap_importances(bundle, transformed_input)
    method = "SHAP"

    if importances is None:
        importances = _fallback_importances(bundle)
        method = "Feature Importance"

    feature_importance = []

    for feature, importance in zip(FEATURE_COLUMNS, importances):
        value = features[feature]
        direction = _direction(feature, value)
        feature_importance.append(
            {
                "feature": feature,
                "label": _feature_label(feature),
                "value": value,
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
