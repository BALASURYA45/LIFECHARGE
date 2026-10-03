"""
BMS Edge Deployment Feasibility & Latency Profiling Script
Measures runtime execution latency (ms) and memory consumption (KB/MB)
for UKF state assimilation and physics-informed model inference.
"""

import time
import sys
import os
import numpy as np
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    psutil = None

# Ensure app package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.models.physics_informed_model import PhysicsInformedLoss, PhysicsInformedTemporalModel
from app.services.ukf_service import UnscentedKalmanFilterBattery


def get_memory_mb() -> float:
    if PSUTIL_AVAILABLE and psutil is not None:
        return psutil.Process().memory_info().rss / 1024.0 / 1024.0
    return 0.0


def profile_ukf_performance(n_iterations: int = 1000):
    ukf = UnscentedKalmanFilterBattery(dim_x=3, dim_z=2)
    state_curr = (85.0, 150.0, 0.05)

    mem_before = get_memory_mb()

    start_time = time.perf_counter()
    for i in range(n_iterations):
        obs_soh = 84.8 + 0.001 * (i % 10)
        obs_rul = 148.0 - 0.1 * (i % 10)
        res = ukf.update_state(state_curr, obs_soh, obs_rul, dt_cycles=1.0)
        p_st = res["posterior_state"]
        state_curr = (p_st["soh"], p_st["rul"], p_st["internal_resistance_ohm"])
    end_time = time.perf_counter()

    mem_after = get_memory_mb()

    total_time_ms = (end_time - start_time) * 1000.0
    avg_latency_ms = total_time_ms / n_iterations

    print(f"=== UKF State Assimilation Profile ({n_iterations} cycles) ===")
    print(f"Total Execution Time: {total_time_ms:.2f} ms")
    print(f"Average Latency per Step: {avg_latency_ms:.4f} ms")
    print(f"Memory RSS Usage: {mem_after:.2f} MB (Delta: {mem_after - mem_before:.4f} MB)")
    return avg_latency_ms, mem_after


def profile_pinn_performance(n_iterations: int = 500):
    model = PhysicsInformedTemporalModel(input_dim=15, hidden_dim=64, num_layers=2)
    dummy_input = np.random.randn(1, 30, 15).astype(np.float32)

    mem_before = get_memory_mb()

    start_time = time.perf_counter()
    for _ in range(n_iterations):
        _ = model.forward(dummy_input)
    end_time = time.perf_counter()

    mem_after = get_memory_mb()

    total_time_ms = (end_time - start_time) * 1000.0
    avg_latency_ms = total_time_ms / n_iterations

    print(f"\n=== PINN Inference Profile ({n_iterations} steps) ===")
    print(f"Total Execution Time: {total_time_ms:.2f} ms")
    print(f"Average Latency per Forward Pass: {avg_latency_ms:.4f} ms")
    print(f"Memory RSS Usage: {mem_after:.2f} MB")
    return avg_latency_ms, mem_after


if __name__ == "__main__":
    print("Running BMS Edge Feasibility Micro-benchmark...\n")
    ukf_lat, ukf_mem = profile_ukf_performance(1000)
    pinn_lat, pinn_mem = profile_pinn_performance(500)
    print("\n[SUCCESS] BMS feasibility metrics collected successfully!")
