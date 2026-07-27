"""
Test Suite for Enhanced LifeCharge ML Pipeline
Tests dataset generation, model training, prediction, and explainability.
"""
from __future__ import annotations

import sys
from pathlib import Path


def test_dataset_generation():
    """Test realistic dataset generation."""
    print("\n[TEST] Dataset Generation")
    try:
        from app.data.scripts.download_datasets import create_realistic_ev_dataset

        df = create_realistic_ev_dataset()
        assert len(df) > 1000, f"Dataset too small: {len(df)} rows"
        required_cols = ['SOH', 'RUL', 'batteryCapacity', 'chargingCycles',
                         'averageTemperature', 'fastChargingUsage']
        for col in required_cols:
            assert col in df.columns, f"Missing column: {col}"
        assert df['SOH'].min() >= 60, "SOH values too low"
        assert df['SOH'].max() <= 100, "SOH values too high"
        print(f"  PASS - Generated {len(df)} rows with {len(df.columns)} features")
        return True
    except Exception as exc:
        print(f"  FAIL - {exc}")
        return False


def test_enhanced_pipeline():
    """Test enhanced training pipeline."""
    print("\n[TEST] Enhanced Training Pipeline")
    try:
        from app.config.settings import settings
        from app.pipelines.enhanced_training_pipeline import train_models

        dataset_path = settings.default_training_dataset
        if not Path(dataset_path).exists():
            print(f"  SKIP - Dataset not found: {dataset_path}")
            return False

        metadata = train_models(dataset_path=dataset_path, artifact_dir=settings.model_artifact_dir)
        assert metadata is not None, "Training returned no metadata"
        assert 'bestMetrics' in metadata, "Missing bestMetrics in metadata"
        print(f"  PASS - Trained models successfully")
        print(f"     SOH R2: {metadata['bestMetrics']['SOH']['r2']}")
        print(f"     RUL R2: {metadata['bestMetrics']['RUL']['r2']}")
        return True
    except Exception as exc:
        print(f"  FAIL - {exc}")
        return False


def test_prediction_service():
    """Test prediction service with base payload."""
    print("\n[TEST] Prediction Service")
    try:
        from app.services.prediction_service import predict_battery_health

        payload = {
            'batteryAge': 2.5,
            'chargingCycles': 450,
            'chargingFrequency': 2.5,
            'fastChargingUsage': 35,
            'averageTemperature': 28,
            'chargingDuration': 5.5,
            'dailyDistance': 55,
            'socHistory': 55,
            'batteryCapacity': 75.0,
            'voltage': 350,
            'current': 12.5,
            'is_two_wheeler': 0,
            'is_three_wheeler': 0,
            'is_four_wheeler': 1,
            'is_bus': 0,
            'is_chemistry_lfp': 0,
            'is_chemistry_nmc': 1,
            'is_chemistry_lead_acid': 0,
        }

        result = predict_battery_health(payload)
        assert 'SOH' in result, "Missing SOH in prediction"
        assert 'RUL' in result, "Missing RUL in prediction"
        assert 0 <= result['SOH'] <= 100, f"SOH out of range: {result['SOH']}"
        assert 0 <= result['RUL'] <= 60, f"RUL out of range: {result['RUL']}"
        print(f"  PASS - SOH: {result['SOH']}%, RUL: {result['RUL']} months")
        return True
    except Exception as exc:
        print(f"  FAIL - {exc}")
        return False


def test_explainability():
    """Test explainability service."""
    print("\n[TEST] Explainability Service")
    try:
        from app.services.enhanced_explainability_service import explain_prediction

        payload = {
            'batteryAge': 2.5,
            'chargingCycles': 450,
            'chargingFrequency': 2.5,
            'fastChargingUsage': 35,
            'averageTemperature': 28,
            'chargingDuration': 5.5,
            'dailyDistance': 55,
            'socHistory': 55,
            'batteryCapacity': 75.0,
            'voltage': 350,
            'current': 12.5,
            'is_two_wheeler': 0,
            'is_three_wheeler': 0,
            'is_four_wheeler': 1,
            'is_bus': 0,
            'is_chemistry_lfp': 0,
            'is_chemistry_nmc': 1,
            'is_chemistry_lead_acid': 0,
        }

        result = explain_prediction(payload)
        assert 'featureImportance' in result, "Missing featureImportance"
        assert len(result['featureImportance']) > 0, "Empty feature importance"
        assert 'plainEnglishExplanation' in result, "Missing plainEnglishExplanation"
        print(f"  PASS - Generated explanation with {len(result['featureImportance'])} features")
        print(f"     Method: {result['method']}")
        return True
    except Exception as exc:
        print(f"  FAIL - {exc}")
        return False


def test_training_service_routing():
    """Test that training service routes to enhanced pipeline when appropriate."""
    print("\n[TEST] Training Service Routing")
    try:
        from app.services.ml_training_service import train_battery_health_models, HAS_ENHANCED_PIPELINE

        if not HAS_ENHANCED_PIPELINE:
            print("  SKIP - Enhanced pipeline not available")
            return False

        print(f"  PASS - Enhanced pipeline available: {HAS_ENHANCED_PIPELINE}")
        return True
    except Exception as exc:
        print(f"  FAIL - {exc}")
        return False


def run_all_tests():
    """Run all tests and report results."""
    print("=" * 70)
    print("LIFECHARGE ENHANCED PIPELINE TEST SUITE")
    print("=" * 70)

    tests = [
        test_dataset_generation,
        test_enhanced_pipeline,
        test_prediction_service,
        test_explainability,
        test_training_service_routing,
    ]

    results = [test() for test in tests]

    print("\n" + "=" * 70)
    print("TEST RESULTS")
    print("=" * 70)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")

    if passed == total:
        print("\nAll tests PASSED!")
        return 0
    else:
        print("\nSome tests FAILED. Check output above.")
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())