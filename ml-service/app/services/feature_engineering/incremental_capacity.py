"""
Incremental Capacity Analysis (ICA) Module
LifeCharge-X Research Framework - Phase 5

Extracts dQ/dV degradation indicators from partial charging segments:
- Peak position (V_peak)
- Peak height (dQ/dV_max)
- Peak area
- Peak width (FWHM)
- Peak shift relative to nominal
- Number of significant peaks
"""
from __future__ import annotations

import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
from scipy.signal import find_peaks, savgol_filter

logger = logging.getLogger(__name__)

# Nominal peak voltage baseline for standard Lithium-Ion chemistries
NOMINAL_ICA_PEAKS = {
    "LFP": 3.42,
    "NMC": 3.75,
    "NCA": 3.70,
    "LCO": 3.90,
    "UNKNOWN": 3.70,
}


def extract_ica_features(
    voltage: np.ndarray,
    capacity: np.ndarray,
    chemistry: str = "UNKNOWN",
    window_length: int = 15,
    poly_order: int = 2,
) -> Dict[str, float]:
    """
    Computes dQ/dV curve and extracts ICA peak metrics.
    Handles partial charge curves safely.
    """
    feats = {
        "ica_peak_position_v": 0.0,
        "ica_peak_height": 0.0,
        "ica_peak_area": 0.0,
        "ica_peak_width_v": 0.0,
        "ica_peak_shift_v": 0.0,
        "ica_num_peaks": 0.0,
    }

    if len(voltage) < 10 or len(capacity) < 10:
        return feats

    try:
        # Sort by voltage to ensure monotonically increasing V domain
        sort_idx = np.argsort(voltage)
        v_sorted = voltage[sort_idx]
        q_sorted = capacity[sort_idx]

        # Remove duplicate voltages for smooth dQ/dV estimation
        v_unique, u_indices = np.unique(v_sorted, return_index=True)
        q_unique = q_sorted[u_indices]

        if len(v_unique) < 10:
            return feats

        # Smooth capacity signal if enough data points
        wl = min(window_length, len(q_unique) - 1)
        if wl % 2 == 0:
            wl -= 1

        if wl >= 5:
            q_smoothed = savgol_filter(q_unique, window_length=wl, polyorder=poly_order)
        else:
            q_smoothed = q_unique

        # Numerical differentiation dQ / dV
        dq = np.gradient(q_smoothed)
        dv = np.gradient(v_unique)
        dv[dv == 0] = 1e-6  # Prevent division by zero
        dq_dv = dq / dv

        # Smooth dQ/dV curve
        if wl >= 5:
            dq_dv_smooth = savgol_filter(dq_dv, window_length=wl, polyorder=poly_order)
        else:
            dq_dv_smooth = dq_dv

        # Find significant peaks
        height_thresh = np.max(dq_dv_smooth) * 0.15 if np.max(dq_dv_smooth) > 0 else 0.1
        peaks, props = find_peaks(dq_dv_smooth, height=height_thresh, distance=5)

        num_peaks = len(peaks)
        feats["ica_num_peaks"] = float(num_peaks)

        if num_peaks > 0:
            primary_idx = peaks[np.argmax(dq_dv_smooth[peaks])]
            peak_v = float(v_unique[primary_idx])
            peak_h = float(dq_dv_smooth[primary_idx])

            # Baseline reference shift
            nominal_ref = NOMINAL_ICA_PEAKS.get(chemistry.upper(), 3.70)
            peak_shift = peak_v - nominal_ref

            # Peak area estimation (trapz around primary peak window)
            half_window = max(2, len(v_unique) // 10)
            p_start = max(0, primary_idx - half_window)
            p_end = min(len(v_unique), primary_idx + half_window)
            peak_area = float(np.trapz(dq_dv_smooth[p_start:p_end], v_unique[p_start:p_end]))

            # Peak width estimation (FWHM)
            half_height = peak_h / 2.0
            above_half = np.where(dq_dv_smooth >= half_height)[0]
            if len(above_half) > 1:
                peak_width = float(v_unique[above_half[-1]] - v_unique[above_half[0]])
            else:
                peak_width = 0.05

            feats["ica_peak_position_v"] = peak_v
            feats["ica_peak_height"] = peak_h
            feats["ica_peak_area"] = abs(peak_area)
            feats["ica_peak_width_v"] = abs(peak_width)
            feats["ica_peak_shift_v"] = peak_shift

    except Exception as exc:
        logger.warning(f"ICA extraction encountered numerical issue: {exc}")

    return feats
