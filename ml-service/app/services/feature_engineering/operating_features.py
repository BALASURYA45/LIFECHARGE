"""
Operating Condition Feature Extraction Module
LifeCharge-X Research Framework - Phase 5

Extracts stress metrics and operational condition features:
- Thermal stress index (Arrhenius penalty multiplier)
- Cyclic stress index (C-rate and DoD interaction penalty)
- Fast charging ratio
- Depth of discharge (DoD)
"""
from __future__ import annotations

import logging
from typing import Dict
import numpy as np

logger = logging.getLogger(__name__)

# Reference values for physics stress models
T_REF_KELVIN = 298.15  # 25 degrees C
EA_SEI_EV = 0.35  # Apparent activation energy for SEI growth in eV
KB_EV = 8.617e-5  # Boltzmann constant in eV/K


def extract_operating_condition_features(
    temperature_c: float,
    c_rate: float,
    dod_fraction: float,
    cycle_number: int,
    fast_charge_percent: float = 20.0,
) -> Dict[str, float]:
    """
    Computes thermal stress and cyclic stress indicators based on physical principles.
    """
    temp_c = float(temperature_c)
    crate = max(0.1, float(c_rate))
    dod = max(0.05, min(1.0, float(dod_fraction)))
    cycle = max(1, int(cycle_number))

    temp_k = temp_c + 273.15

    # Thermal Stress Index: Arrhenius acceleration factor relative to 25 deg C
    # factor = exp( (Ea / k) * (1/T_ref - 1/T) )
    try:
        arrhenius_factor = np.exp((EA_SEI_EV / KB_EV) * (1.0 / T_REF_KELVIN - 1.0 / temp_k))
    except OverflowError:
        arrhenius_factor = 5.0

    # Thermal stress score normalized [0 - 100]
    # Optimal temp = 25C (score 0), high temp (> 45C) or low temp (< 0C) increases stress score
    if 15.0 <= temp_c <= 30.0:
        thermal_stress_score = (abs(temp_c - 25.0) / 10.0) * 15.0
    elif temp_c > 30.0:
        thermal_stress_score = 15.0 + ((temp_c - 30.0) / 30.0) * 85.0
    else:
        thermal_stress_score = 15.0 + ((15.0 - temp_c) / 35.0) * 85.0

    thermal_stress_score = max(0.0, min(100.0, float(thermal_stress_score)))

    # Cyclic Stress Index: Function of C-rate squared and DoD^1.5 (empirically derived degradation scaling)
    cyclic_stress_raw = (crate ** 1.8) * (dod ** 1.5)
    cyclic_stress_score = max(0.0, min(100.0, float(cyclic_stress_raw * 45.0)))

    # Combined Physical Degradation Stress Multiplier
    degradation_stress_multiplier = float(arrhenius_factor * (1.0 + 0.5 * (crate - 1.0)) * (1.0 + 0.3 * (dod - 0.8)))
    degradation_stress_multiplier = max(0.2, min(10.0, degradation_stress_multiplier))

    return {
        "operating_temp_c": temp_c,
        "operating_temp_k": temp_k,
        "arrhenius_thermal_factor": float(arrhenius_factor),
        "thermal_stress_score": thermal_stress_score,
        "cyclic_stress_score": cyclic_stress_score,
        "c_rate": crate,
        "depth_of_discharge": dod,
        "cycle_number": float(cycle),
        "fast_charging_ratio": float(fast_charge_percent),
        "degradation_stress_multiplier": degradation_stress_multiplier,
    }
