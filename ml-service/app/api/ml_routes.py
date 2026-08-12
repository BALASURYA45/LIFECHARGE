from flask import Blueprint, jsonify, request

from app.pipelines.training_pipeline import TrainingError
from app.services.ml_training_service import (
    get_current_model_metadata,
    get_training_history,
    train_battery_health_models,
)
from app.services.explainability_service import ExplanationError, explain_prediction
from app.services.prediction_service import PredictionError, predict_battery_health
from app.services.early_life_service import predict_early_life
from app.services.uncertainty_service import compute_conformal_uncertainty
from app.services.anomaly_service import detect_battery_anomalies
from app.services.research_experiment_service import run_research_experiment
from app.models.multitask_model import MultiTaskBatteryModel

ml_blueprint = Blueprint("ml", __name__)


@ml_blueprint.post("/train")
def train_models_endpoint():
    payload = request.get_json(silent=True) or {}

    try:
        metadata = train_battery_health_models(dataset_path=payload.get("datasetPath"))
    except TrainingError as error:
        return jsonify({"success": False, "message": str(error)}), 400

    return jsonify({"success": True, "metadata": metadata}), 201


@ml_blueprint.get("/models/current")
def current_model_endpoint():
    metadata = get_current_model_metadata()

    if metadata is None:
        return jsonify({"success": False, "message": "No trained model found"}), 404

    return jsonify({"success": True, "metadata": metadata})


@ml_blueprint.get("/training-history")
def training_history_endpoint():
    return jsonify({"success": True, "history": get_training_history()})


@ml_blueprint.post("/predict")
def predict_endpoint():
    payload = request.get_json(silent=True) or {}

    try:
        prediction = predict_battery_health(payload)
    except PredictionError as error:
        return jsonify({"success": False, "message": str(error)}), 400

    return jsonify({"success": True, "prediction": prediction})


@ml_blueprint.post("/explain")
def explain_endpoint():
    payload = request.get_json(silent=True) or {}

    try:
        explanation = explain_prediction(payload)
    except ExplanationError as error:
        return jsonify({"success": False, "message": str(error)}), 400

    return jsonify({"success": True, "explanation": explanation})


@ml_blueprint.post("/early-life")
def early_life_endpoint():
    payload = request.get_json(silent=True) or {}
    battery_features = payload.get("battery", payload)
    cycles_used = int(payload.get("cyclesUsed", 100))

    try:
        res = predict_early_life(battery_features, cycles_used=cycles_used)
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 400

    return jsonify({"success": True, "data": res})


@ml_blueprint.post("/uncertainty")
def uncertainty_endpoint():
    payload = request.get_json(silent=True) or {}
    soh = float(payload.get("soh", 85.0))
    rul = float(payload.get("rul", 450.0))
    features = payload.get("features", {})

    res = compute_conformal_uncertainty(soh, rul, feature_vector=features)
    return jsonify({"success": True, "uncertainty": res})


@ml_blueprint.post("/anomaly")
def anomaly_endpoint():
    payload = request.get_json(silent=True) or {}
    features = payload.get("features", payload)

    res = detect_battery_anomalies(features)
    return jsonify({"success": True, "anomaly": res})


@ml_blueprint.post("/experiments/run")
def experiment_run_endpoint():
    payload = request.get_json(silent=True) or {}

    try:
        res = run_research_experiment(payload)
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 400

    return jsonify({"success": True, "experiment": res})
