from __future__ import annotations

from typing import Any

import pandas as pd

from app.config.settings import settings
from app.models.model_registry import load_model_bundle
from app.pipelines.training_pipeline import FEATURE_COLUMNS


class PredictionError(ValueError):
    pass


def _validate_features(payload: dict[str, Any]) -> dict[str, float]:
    missing = [feature for feature in FEATURE_COLUMNS if feature not in payload]

    if missing:
        raise PredictionError(f"Missing required features: {', '.join(missing)}")

    features = {}

    for feature in FEATURE_COLUMNS:
        try:
            features[feature] = float(payload[feature])
        except (TypeError, ValueError) as error:
            raise PredictionError(f"{feature} must be a numeric value") from error

    return features


def _battery_status(soh: float) -> str:
    if soh >= 90:
        return "Excellent"
    if soh >= 80:
        return "Good"
    if soh >= 70:
        return "Warning"
    return "Critical"


def _degradation_trend(soh: float, rul: float) -> str:
    if soh >= 90 and rul >= 100:
        return "Stable"
    if soh >= 80 and rul >= 70:
        return "Moderate degradation"
    if soh >= 70 and rul >= 40:
        return "Accelerated degradation"
    return "High degradation risk"


def _confidence_score(soh: float) -> float:
    distance_from_boundary = min(abs(soh - boundary) for boundary in [70, 80, 90])
    confidence = 78 + min(distance_from_boundary * 2.2, 17)
    return round(float(confidence), 2)


def predict_battery_health(payload: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model_bundle(settings.model_artifact_dir)

    if bundle is None:
        raise PredictionError("No trained model found. Train models before running predictions.")

    features = _validate_features(payload)
    dataframe = pd.DataFrame([features], columns=FEATURE_COLUMNS)
    prediction = bundle["model"].predict(dataframe)[0]

    soh = round(float(max(0, min(100, prediction[0]))), 2)
    rul = round(float(max(0, prediction[1])), 2)

    return {
        "input": features,
        "SOH": soh,
        "RUL": rul,
        "batteryStatus": _battery_status(soh),
        "confidenceScore": _confidence_score(soh),
        "degradationTrend": _degradation_trend(soh, rul),
        "modelMetadata": bundle["metadata"],
    }
