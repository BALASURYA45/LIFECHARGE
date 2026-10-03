"""
Comprehensive API & Service Test Suite for LifeCharge ML Service
Tests all Flask endpoints, data pipelines, model predictions, and research features.
"""
import sys
import os
from pathlib import Path

# Ensure ml-service root is in sys.path
ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ML_ROOT))
os.chdir(str(ML_ROOT))

from app import create_app

def run_comprehensive_tests():
    app = create_app()
    client = app.test_client()
    
    print("=" * 70)
    print("COMPREHENSIVE LIFECHARGE ML SERVICE TEST SUITE")
    print("=" * 70)
    
    passed = 0
    failed = 0

    def test(name, func):
        nonlocal passed, failed
        print(f"\n[TEST] {name}")
        try:
            func()
            print("  PASS")
            passed += 1
        except Exception as exc:
            print(f"  FAIL - {exc}")
            import traceback
            traceback.print_exc()
            failed += 1

    # 1. Health Endpoint
    def t_health():
        res = client.get("/api/health/")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.get_json()
        assert data.get("status") == "ok"

    test("Health Check Endpoint", t_health)

    # 2. Current Model Endpoint
    def t_current_model():
        res = client.get("/api/ml/models/current")
        assert res.status_code in [200, 404], f"Unexpected status {res.status_code}"

    test("Current Model Metadata Endpoint", t_current_model)

    # 3. Training History Endpoint
    def t_training_history():
        res = client.get("/api/ml/training-history")
        assert res.status_code == 200
        data = res.get_json()
        assert data.get("success") is True

    test("Training History Endpoint", t_training_history)

    # 4. Predict Endpoint
    def t_predict():
        payload = {
            "batteryAge": 2.0,
            "chargingCycles": 300,
            "chargingFrequency": 2.0,
            "fastChargingUsage": 25.0,
            "averageTemperature": 28.0,
            "chargingDuration": 5.0,
            "dailyDistance": 45.0,
            "socHistory": 60.0,
            "batteryCapacity": 60.0,
            "voltage": 350.0,
            "current": 45.0,
            "is_two_wheeler": 0,
            "is_three_wheeler": 0,
            "is_four_wheeler": 1,
            "is_bus": 0,
            "is_chemistry_lfp": 1,
            "is_chemistry_nmc": 0,
            "is_chemistry_lead_acid": 0,
        }
        res = client.post("/api/ml/predict", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "prediction" in data
        pred = data["prediction"]
        assert "SOH" in pred and "RUL" in pred

    test("Prediction Endpoint", t_predict)

    # 5. Explain Endpoint
    def t_explain():
        payload = {
            "batteryAge": 2.0,
            "chargingCycles": 300,
            "chargingFrequency": 2.0,
            "fastChargingUsage": 25.0,
            "averageTemperature": 28.0,
            "chargingDuration": 5.0,
            "dailyDistance": 45.0,
            "socHistory": 60.0,
            "batteryCapacity": 60.0,
            "voltage": 350.0,
            "current": 45.0,
        }
        res = client.post("/api/ml/explain", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "explanation" in data

    test("Explainability Endpoint", t_explain)

    # 6. Early-Life Endpoint
    def t_early_life():
        payload = {"chargingCycles": 150, "batteryAge": 1.0, "averageTemperature": 25.0}
        res = client.post("/api/ml/early-life", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert data.get("success") is True

    test("Early-Life Prognostics Endpoint", t_early_life)

    # 7. Uncertainty Endpoint
    def t_uncertainty():
        payload = {"soh": 88.5, "rul": 520.0}
        res = client.post("/api/ml/uncertainty", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "uncertainty" in data

    test("Conformal Uncertainty Endpoint", t_uncertainty)

    # 8. Anomaly Endpoint
    def t_anomaly():
        payload = {"averageTemperature": 48.0, "fastChargingUsage": 85.0}
        res = client.post("/api/ml/anomaly", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "anomaly" in data

    test("Anomaly Detection Endpoint", t_anomaly)

    # 9. Health Indicator Feature Extraction Endpoint
    def t_features():
        payload = {
            "voltage_seq": [3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1],
            "current_seq": [10.0, 10.0, 10.0, 8.0, 5.0, 3.0, 1.0, 0.2],
            "capacity_seq": [0.2, 0.5, 0.8, 1.2, 1.5, 1.7, 1.9, 2.0],
            "chemistry": "LFP"
        }
        res = client.post("/api/ml/features/extract", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "health_indicators" in data

    test("Partial-Charge Feature Extraction Endpoint", t_features)

    # 10. Physics Parameters Endpoint
    def t_physics():
        res = client.get("/api/ml/physics/parameters")
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "physical_parameters" in data

    test("Physical Parameters Endpoint", t_physics)

    # 11. Cross-Chemistry Transfer Endpoint
    def t_transfer():
        payload = {"source_chemistry": "LFP", "target_chemistry": "NMC", "few_shot_k": 25}
        res = client.post("/api/ml/transfer/evaluate", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "transfer_result" in data

    test("Cross-Chemistry Domain Alignment Endpoint", t_transfer)

    # 12. UKF Online Digital Twin Update Endpoint
    def t_ukf():
        payload = {"soh": 90.0, "rul": 550.0, "observed_soh": 89.5, "observed_rul": 540.0}
        res = client.post("/api/ml/digital-twin/ukf-update", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "ukf_update" in data

    test("Mathematical UKF Update Endpoint", t_ukf)

    # 13. Ablation Study Endpoint
    def t_ablation():
        payload = {"dataset": "nasa"}
        res = client.post("/api/ml/experiments/ablation", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "ablation_study" in data

    test("Ablation Study Suite Endpoint", t_ablation)

    # 14. Research Experiment Endpoint
    def t_research_exp():
        payload = {"dataset": "NASA Battery Aging Dataset"}
        res = client.post("/api/ml/experiments/run", json=payload)
        assert res.status_code == 200, f"Got {res.status_code}: {res.data}"
        data = res.get_json()
        assert "experiment" in data

    test("Research Experiment Runner Endpoint", t_research_exp)

    print("\n" + "=" * 70)
    print(f"FINAL SUMMARY: Passed: {passed}/{passed+failed}, Failed: {failed}/{passed+failed}")
    print("=" * 70)
    return failed == 0

if __name__ == "__main__":
    success = run_comprehensive_tests()
    if not success:
        sys.exit(1)
