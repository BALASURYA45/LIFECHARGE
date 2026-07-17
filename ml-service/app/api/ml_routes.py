from flask import Blueprint, jsonify, request

from app.pipelines.training_pipeline import TrainingError
from app.services.ml_training_service import (
    get_current_model_metadata,
    get_training_history,
    train_battery_health_models,
)
from app.services.prediction_service import PredictionError, predict_battery_health

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
