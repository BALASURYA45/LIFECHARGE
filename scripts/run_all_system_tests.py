"""
LITHYX Master End-to-End System Test Suite
Executes comprehensive verification across all project modules:
1. Python ML Service & Physics Models Test
2. ONNX Model Export & INT8 Quantizer Test
3. Sensor Fault Resilience & Noise Attenuation Test
4. BMS Edge Deployment Latency Benchmark
5. Node.js Backend API Syntax Check
6. React Frontend Production Build Verification
"""

import sys
import os
import subprocess
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
ML_DIR = ROOT_DIR / "ml-service"
VENV_PYTHON = ML_DIR / ".venv" / "Scripts" / "python.exe"
if not VENV_PYTHON.exists():
    VENV_PYTHON = Path(sys.executable)


def print_banner(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def run_command_check(cmd, cwd=ROOT_DIR, description=""):
    print(f"\n[RUNNING] {description}...")
    start_time = time.time()
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=True)
    elapsed = time.time() - start_time

    if res.returncode == 0:
        print(f"[PASSED] {description} ({elapsed:.2f}s)")
        return True, res.stdout
    else:
        print(f"[FAILED] {description} ({elapsed:.2f}s)")
        print("Standard Output:\n", res.stdout[-1000:] if res.stdout else "None")
        print("Standard Error:\n", res.stderr[-1000:] if res.stderr else "None")
        return False, res.stderr


def main():
    print_banner("LITHYX MASTER END-TO-END SYSTEM TEST SUITE")
    start_total = time.time()
    results = {}

    # Test 1: ML Service Model Import & Fallback Check
    cmd1 = f'"{VENV_PYTHON}" -c "from app.models.physics_informed_model import PhysicsInformedTemporalModel, PhysicsInformedLoss; from app.services.ukf_service import UnscentedKalmanFilterBattery; print(\'ML Imports Successful\')"'
    ok1, out1 = run_command_check(cmd1, cwd=ML_DIR, description="Test 1: Python ML Model & UKF Imports")
    results["Python ML Models Import"] = ok1

    # Test 2: ONNX Model Export & INT8 Quantization
    cmd2 = f'"{VENV_PYTHON}" -m app.data.scripts.export_onnx'
    ok2, out2 = run_command_check(cmd2, cwd=ML_DIR, description="Test 2: ONNX Export & INT8 Quantizer")
    results["ONNX Export & Quantization"] = ok2

    # Test 3: Sensor Fault Resilience Test Suite
    cmd3 = f'"{VENV_PYTHON}" -m app.data.scripts.test_sensor_resilience'
    ok3, out3 = run_command_check(cmd3, cwd=ML_DIR, description="Test 3: Telemetry Sensor Fault Resilience")
    results["Sensor Fault Resilience"] = ok3

    # Test 4: BMS Edge Latency & Memory Benchmark
    cmd4 = f'"{VENV_PYTHON}" -m app.data.scripts.benchmark_bms_feasibility'
    ok4, out4 = run_command_check(cmd4, cwd=ML_DIR, description="Test 4: BMS Edge Latency Benchmark")
    results["BMS Edge Latency Benchmark"] = ok4

    # Test 5: Node.js Backend API Syntax Check
    cmd5 = "node -c src/server.js"
    ok5, out5 = run_command_check(cmd5, cwd=ROOT_DIR / "backend", description="Test 5: Node.js Backend Server Syntax Check")
    results["Node.js Backend Syntax Check"] = ok5

    # Test 6: React Frontend Production Build Check
    cmd6 = "npm run build --prefix frontend"
    ok6, out6 = run_command_check(cmd6, cwd=ROOT_DIR, description="Test 6: React Frontend Vite Production Build")
    results["React Frontend Production Build"] = ok6

    # Summary Output
    total_elapsed = time.time() - start_total
    print_banner("SYSTEM TEST SUITE SUMMARY RESULT")

    passed_count = sum(1 for v in results.values() if v)
    total_count = len(results)

    for test_name, status in results.items():
        status_str = "PASSED" if status else "FAILED"
        print(f" - {test_name:<40}: [{status_str}]")

    print(f"\nOverall Result: {passed_count}/{total_count} Tests Passed in {total_elapsed:.2f}s!")

    if passed_count == total_count:
        print("\n[SUCCESS] LITHYX System Test Suite Passed 100%!")
        sys.exit(0)
    else:
        print(f"\n[FAILURE] {total_count - passed_count} Test(s) Failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
