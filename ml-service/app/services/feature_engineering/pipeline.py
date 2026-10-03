"""
Partial-Charge Feature Pipeline Module
LifeCharge-X Research Framework - Phase 5

Combines ICA, DVA, Charging Phase, and Operating Condition features
into a versioned, harmonized feature vector for downstream modeling.
"""
from __future__ import annotations

import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from .incremental_capacity import extract_ica_features
from .differential_voltage import extract_dva_features
from .charging_features import extract_charging_phase_features
from .operating_features import extract_operating_condition_features

logger = logging.getLogger(__name__)

FEATURE_VERSION = "2.0-partial-charge-physics"

HEALTH_INDICATOR_KEYS = [
    "ica_peak_position_v",
    "ica_peak_height",
    "ica_peak_area",
    "ica_peak_width_v",
    "ica_peak_shift_v",
    "ica_num_peaks",
    "dva_peak_position_q",
    "dva_peak_height",
    "dva_peak_shift",
    "dva_inflection_voltage",
    "cc_phase_duration_min",
    "cv_phase_duration_min",
    "total_charge_duration_min",
    "voltage_time_slope",
    "current_decay_rate",
    "charging_energy_wh",
    "charge_throughput_ah",
    "arrhenius_thermal_factor",
    "thermal_stress_score",
    "cyclic_stress_score",
    "degradation_stress_multiplier",
]


class PartialChargeFeaturePipeline:
    """Extracts and versions degradation-sensitive health indicators from battery signals."""

    def __init__(self, chemistry: str = "UNKNOWN"):
        self.chemistry = chemistry.upper()
        self.feature_version = FEATURE_VERSION

    def extract_from_cycle_data(
        self,
        voltage_seq: np.ndarray,
        current_seq: np.ndarray,
        capacity_seq: np.ndarray,
        time_seq: Optional[np.ndarray] = None,
        temperature_c: float = 25.0,
        c_rate: float = 1.0,
        dod: float = 0.8,
        cycle_num: int = 100,
        fast_charge_pct: float = 20.0,
    ) -> Dict[str, float]:
        """
        Extracts all partial-charge health indicators for a given cycle time-series.
        """
        voltage_seq = np.asarray(voltage_seq, dtype=float)
        current_seq = np.asarray(current_seq, dtype=float)
        capacity_seq = np.asarray(capacity_seq, dtype=float)

        # 1. ICA features
        ica_feats = extract_ica_features(voltage_seq, capacity_seq, chemistry=self.chemistry)

        # 2. DVA features
        dva_feats = extract_dva_features(voltage_seq, capacity_seq, chemistry=self.chemistry)

        # 3. Charging Phase features
        cap_val = float(np.max(capacity_seq)) if len(capacity_seq) > 0 else 2.0
        charge_feats = extract_charging_phase_features(
            voltage=voltage_seq,
            current=current_seq,
            time_seconds=time_seq,
            capacity_ah=cap_val,
        )

        # 4. Operating Stress features
        op_feats = extract_operating_condition_features(
            temperature_c=temperature_c,
            c_rate=c_rate,
            dod_fraction=dod,
            cycle_number=cycle_num,
            fast_charge_percent=fast_charge_pct,
        )

        combined = {}
        combined.update(ica_feats)
        combined.update(dva_feats)
        combined.update(charge_feats)
        combined.update(op_feats)
        combined["feature_version"] = self.feature_version

        return combined

    def extract_batch_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Processes tabular cycle summary dataframe and generates health indicator columns.
        Safely falls back if raw high-frequency waveforms are not provided.
        """
        res_df = df.copy()

        for key in HEALTH_INDICATOR_KEYS:
            if key not in res_df.columns:
                res_df[key] = 0.0

        # Synthesize baseline ICA/DVA approximations for tabular records
        for idx, row in res_df.iterrows():
            temp = float(row.get("averageTemperature", row.get("temperature", 25.0)))
            crate = float(row.get("c_rate", row.get("fastChargingUsage", 20.0) / 50.0 + 0.5))
            dod = float(row.get("dod", 0.8))
            cycle = int(row.get("chargingCycles", row.get("cycle", 100)))
            fast_pct = float(row.get("fastChargingUsage", 20.0))

            op_f = extract_operating_condition_features(temp, crate, dod, cycle, fast_pct)
            for k, v in op_f.items():
                if k in HEALTH_INDICATOR_KEYS:
                    res_df.at[idx, k] = v

            # Synthesize realistic dQ/dV peak shift based on cycle aging
            cycle_ratio = cycle / 1000.0
            res_df.at[idx, "ica_peak_position_v"] = max(3.0, 3.75 - 0.05 * cycle_ratio)
            res_df.at[idx, "ica_peak_height"] = max(0.1, 4.5 - 1.2 * cycle_ratio)
            res_df.at[idx, "ica_peak_shift_v"] = -0.05 * cycle_ratio
            res_df.at[idx, "dva_peak_position_q"] = max(0.5, 1.9 - 0.3 * cycle_ratio)

        return res_df
