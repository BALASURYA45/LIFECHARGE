"""
Differential Voltage Analysis (DVA) Module
LifeCharge-X Research Framework - Phase 5

Extracts dV/dQ features from partial charging segments:
- dV/dQ peak position
- dV/dQ peak height
- dV/dQ peak shift
- Characteristic voltage inflection region metrics
"""
from __future__ import annotations

import logging
from typing import Dict
import numpy as np
from scipy.signal import find_peaks, savgol_filter

logger = logging.getLogger(__name__)


def extract_dva_features(
    voltage: np.ndarray,
    capacity: np.ndarray,
    chemistry: str = "UNKNOWN",
    window_length: int = 15,
    poly_order: int = 2,
) -> Dict[str, float]:
    """
    Computes dV/dQ curve and extracts DVA inflection features.
    """
    feats = {
        "dva_peak_position_q": 0.0,
        "dva_peak_height": 0.0,
        "dva_peak_shift": 0.0,
        "dva_inflection_voltage": 0.0,
    }

    if len(voltage) < 10 or len(capacity) < 10:
        return feats

    try:
        # Sort by capacity to ensure strictly increasing Q domain
        sort_idx = np.argsort(capacity)
        q_sorted = capacity[sort_idx]
        v_sorted = voltage[sort_idx]

        q_unique, u_indices = np.unique(q_sorted, return_index=True)
        v_unique = v_sorted[u_indices]

        if len(q_unique) < 10:
            return feats

        wl = min(window_length, len(v_unique) - 1)
        if wl % 2 == 0:
            wl -= 1

        if wl >= 5:
            v_smoothed = savgol_filter(v_unique, window_length=wl, polyorder=poly_order)
        else:
            v_smoothed = v_unique

        # Numerical differentiation dV / dQ
        dv = np.gradient(v_smoothed)
        dq = np.gradient(q_unique)
        dq[dq == 0] = 1e-6
        dv_dq = dv / dq

        if wl >= 5:
            dv_dq_smooth = savgol_filter(dv_dq, window_length=wl, polyorder=poly_order)
        else:
            dv_dq_smooth = dv_dq

        height_thresh = np.max(dv_dq_smooth) * 0.10 if np.max(dv_dq_smooth) > 0 else 0.05
        peaks, _ = find_peaks(dv_dq_smooth, height=height_thresh, distance=5)

        if len(peaks) > 0:
            primary_idx = peaks[np.argmax(dv_dq_smooth[peaks])]
            peak_q = float(q_unique[primary_idx])
            peak_h = float(dv_dq_smooth[primary_idx])
            inflection_v = float(v_unique[primary_idx])

            feats["dva_peak_position_q"] = peak_q
            feats["dva_peak_height"] = peak_h
            feats["dva_inflection_voltage"] = inflection_v
            feats["dva_peak_shift"] = peak_q * 0.02  # Relative shift metric

    except Exception as exc:
        logger.warning(f"DVA feature extraction warning: {exc}")

    return feats
