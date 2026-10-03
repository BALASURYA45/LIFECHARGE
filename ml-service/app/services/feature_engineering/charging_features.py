"""
Charging Phase Feature Extraction Module
LifeCharge-X Research Framework - Phase 5

Extracts detailed charging phase features from partial-charge time-series segments:
- Constant-Current (CC) phase duration
- Constant-Voltage (CV) phase duration
- Partial charge duration
- Voltage-time slope
- Current decay rate in CV phase
- Charge energy (kWh/Ah)
"""
from __future__ import annotations

import logging
from typing import Dict
import numpy as np

logger = logging.getLogger(__name__)


def extract_charging_phase_features(
    voltage: np.ndarray,
    current: np.ndarray,
    time_seconds: np.ndarray = None,
    capacity_ah: float = 2.0,
) -> Dict[str, float]:
    """
    Extracts CC and CV charging phase duration and slope features.
    """
    feats = {
        "cc_phase_duration_min": 0.0,
        "cv_phase_duration_min": 0.0,
        "total_charge_duration_min": 0.0,
        "voltage_time_slope": 0.0,
        "current_decay_rate": 0.0,
        "charging_energy_wh": 0.0,
        "charge_throughput_ah": 0.0,
    }

    if len(voltage) < 5 or len(current) < 5:
        return feats

    try:
        if time_seconds is None or len(time_seconds) != len(voltage):
            # Assume 1 second sample intervals if time is not specified
            time_seconds = np.arange(len(voltage)) * 1.0

        total_time_min = float((time_seconds[-1] - time_seconds[0]) / 60.0)
        feats["total_charge_duration_min"] = max(0.1, total_time_min)

        # Detect Constant Current vs Constant Voltage threshold
        # CC phase: Current is high (> 80% of max charging current), Voltage is rising
        max_curr = np.max(current)
        if max_curr > 0.05:
            cc_mask = current >= (0.80 * max_curr)
            cv_mask = (current < (0.80 * max_curr)) & (current > 0.05)
        else:
            cc_mask = np.ones_like(current, dtype=bool)
            cv_mask = np.zeros_like(current, dtype=bool)

        cc_indices = np.where(cc_mask)[0]
        cv_indices = np.where(cv_mask)[0]

        if len(cc_indices) > 1:
            cc_dt = time_seconds[cc_indices[-1]] - time_seconds[cc_indices[0]]
            feats["cc_phase_duration_min"] = float(max(0.0, cc_dt / 60.0))

            # Voltage-time slope in CC phase (V/min)
            v_cc = voltage[cc_indices]
            if cc_dt > 0:
                feats["voltage_time_slope"] = float((v_cc[-1] - v_cc[0]) / max(0.1, cc_dt / 60.0))

        if len(cv_indices) > 1:
            cv_dt = time_seconds[cv_indices[-1]] - time_seconds[cv_indices[0]]
            feats["cv_phase_duration_min"] = float(max(0.0, cv_dt / 60.0))

            # Current decay rate in CV phase
            i_cv = current[cv_indices]
            if cv_dt > 0 and i_cv[0] > 0:
                feats["current_decay_rate"] = float((i_cv[0] - i_cv[-1]) / max(0.1, cv_dt / 60.0))

        # Charge energy (Wh) = integral(V * I dt) / 3600
        power_w = voltage * current
        dt_s = np.gradient(time_seconds)
        energy_wh = float(np.sum(power_w * dt_s) / 3600.0)
        feats["charging_energy_wh"] = max(0.0, energy_wh)

        # Charge throughput (Ah) = integral(I dt) / 3600
        throughput_ah = float(np.sum(current * dt_s) / 3600.0)
        feats["charge_throughput_ah"] = max(0.0, throughput_ah)

    except Exception as exc:
        logger.warning(f"Charging phase feature extraction warning: {exc}")

    return feats
