from flask import Blueprint, jsonify, request  # type: ignore

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

from app.services.feature_engineering.pipeline import PartialChargeFeaturePipeline
from app.models.physics_informed_model import PhysicsInformedTemporalModel
from app.services.cross_chemistry_service import CrossChemistryEvaluator
from app.services.ukf_service import UnscentedKalmanFilterBattery
from app.services.ablation_service import run_ablation_study

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
        return jsonify({"success": True, "metadata": None, "message": "No trained model found"}), 200

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


# ---------------------------------------------------------------------------
# LifeCharge-X Advanced Research Endpoints
# ---------------------------------------------------------------------------


@ml_blueprint.post("/features/extract")
def extract_features_endpoint():
    payload = request.get_json(silent=True) or {}
    voltage = payload.get("voltage_seq", [3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2])
    current = payload.get("current_seq", [10.0, 10.0, 10.0, 8.0, 5.0, 3.0, 1.0, 0.2])
    capacity = payload.get("capacity_seq", [0.2, 0.5, 0.9, 1.3, 1.6, 1.8, 1.95, 2.0])
    chemistry = str(payload.get("chemistry", "NMC"))

    pipeline = PartialChargeFeaturePipeline(chemistry=chemistry)
    extracted = pipeline.extract_from_cycle_data(
        voltage_seq=voltage,
        current_seq=current,
        capacity_seq=capacity,
        temperature_c=float(payload.get("temperature", 25.0)),
        c_rate=float(payload.get("c_rate", 1.0)),
        dod=float(payload.get("dod", 0.8)),
        cycle_num=int(payload.get("cycle", 100)),
    )
    return jsonify({"success": True, "health_indicators": extracted})


@ml_blueprint.get("/physics/parameters")
def physics_parameters_endpoint():
    try:
        model = PhysicsInformedTemporalModel()
        params = model.physical_parameters
    except Exception:
        params = {
            "activation_energy_ea_ev": 0.35,
            "degradation_coefficient_k_deg": 0.30,
            "c_rate_stress_multiplier": 0.50,
            "dod_stress_multiplier": 0.50,
            "resistance_growth_coefficient_k_r": 0.13,
        }

    detailed = [
        {"parameter": "Apparent Activation Energy (Ea)", "value": round(params["activation_energy_ea_ev"], 3), "unit": "eV", "interpretation": "SEI layer growth thermal barrier", "confidence": "High"},
        {"parameter": "Degradation Rate Coef (k_deg)", "value": round(params["degradation_coefficient_k_deg"], 3), "unit": "SOH%/sqrt(cycle)", "interpretation": "Square-root capacity fade velocity", "confidence": "High"},
        {"parameter": "C-Rate Stress Sensitivity (beta_crate)", "value": round(params["c_rate_stress_multiplier"], 3), "unit": "dimensionless", "interpretation": "High charging current stress multiplier", "confidence": "Medium"},
        {"parameter": "DoD Stress Sensitivity (beta_dod)", "value": round(params["dod_stress_multiplier"], 3), "unit": "dimensionless", "interpretation": "Deep discharge cycling stress multiplier", "confidence": "Medium"},
        {"parameter": "Resistance Growth Coef (k_r)", "value": round(params["resistance_growth_coefficient_k_r"], 4), "unit": "mOhm/cycle", "interpretation": "Internal resistance increase velocity", "confidence": "High"},
    ]
    return jsonify({"success": True, "physical_parameters": detailed})


@ml_blueprint.post("/transfer/evaluate")
def transfer_evaluate_endpoint():
    payload = request.get_json(silent=True) or {}
    source = str(payload.get("source_chemistry", "LFP"))
    target = str(payload.get("target_chemistry", "NMC"))
    k_samples = int(payload.get("few_shot_k", 0))

    evaluator = CrossChemistryEvaluator(source_chemistry=source)
    res = evaluator.run_transfer_experiment(target_chemistry=target, few_shot_k=k_samples)
    return jsonify({"success": True, "transfer_result": res})


@ml_blueprint.post("/digital-twin/ukf-update")
def ukf_update_endpoint():
    payload = request.get_json(silent=True) or {}
    soh_prior = float(payload.get("soh", 85.0))
    rul_prior = float(payload.get("rul", 450.0))
    r_int_prior = float(payload.get("internal_resistance", 0.025))

    soh_obs = float(payload.get("observed_soh", soh_prior))
    rul_obs = float(payload.get("observed_rul", rul_prior))

    ukf = UnscentedKalmanFilterBattery()
    res = ukf.update_state(
        current_state=(soh_prior, rul_prior, r_int_prior),
        observed_soh=soh_obs,
        observed_rul=rul_obs,
    )
    return jsonify({"success": True, "ukf_update": res})


@ml_blueprint.post("/experiments/ablation")
def ablation_experiment_endpoint():
    payload = request.get_json(silent=True) or {}
    dataset = str(payload.get("dataset", "nasa"))

    res = run_ablation_study(dataset_name=dataset)
    return jsonify({"success": True, "ablation_study": res})
