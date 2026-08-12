"""
Multi-Task Learning Model for Joint SOH, RUL, and Degradation Trend Prediction.
Uses a shared feature extraction layer with multi-head regression targets.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Any
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import ExtraTreesRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


class MultiTaskBatteryModel(BaseEstimator, RegressorMixin):
    """
    Multi-Task Learning Architecture for Joint Battery Prognostics.
    Jointly predicts:
    1. SOH (%)
    2. RUL (Cycles)
    3. Degradation Trend Rate (% drop per 100 cycles)
    """

    def __init__(self, n_estimators: int = 300, max_depth: int = 12, random_state: int = 42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        self.scaler = StandardScaler()
        # Shared multi-output base regressor representing joint latent space
        self.base_model = MultiOutputRegressor(
            ExtraTreesRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                random_state=self.random_state,
                n_jobs=-1,
            )
        )
        self.is_fitted = False

    def _calculate_degradation_rate(self, soh: np.ndarray | pd.Series, cycles: np.ndarray | pd.Series) -> np.ndarray:
        """Calculate degradation trend rate (% loss per 100 cycles)."""
        soh_arr = np.asarray(soh, dtype=float)
        cycles_arr = np.asarray(cycles, dtype=float)
        soh_loss = np.maximum(0.0, 100.0 - soh_arr)
        # Avoid division by zero
        safe_cycles = np.maximum(1.0, cycles_arr)
        trend_rate = (soh_loss / safe_cycles) * 100.0
        return trend_rate

    def fit(self, X: pd.DataFrame | np.ndarray, y_soh: np.ndarray, y_rul: np.ndarray, cycles: np.ndarray | None = None):
        """Fit joint multi-task model on shared features."""
        if isinstance(X, pd.DataFrame):
            X_mat = X.values
        else:
            X_mat = np.asarray(X, dtype=float)

        y_soh_arr = np.asarray(y_soh, dtype=float)
        y_rul_arr = np.asarray(y_rul, dtype=float)

        if cycles is None:
            # Estimate cycles from feature matrix if available or default
            cycles = X_mat[:, 1] if X_mat.shape[1] > 1 else np.ones_like(y_soh_arr) * 100

        y_trend = self._calculate_degradation_rate(y_soh_arr, cycles)

        # Multi-target matrix shape: (N, 3) -> [SOH, RUL, TrendRate]
        Y_joint = np.column_stack([y_soh_arr, y_rul_arr, y_trend])

        X_scaled = self.scaler.fit_transform(X_mat)
        self.base_model.fit(X_scaled, Y_joint)
        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame | np.ndarray) -> dict[str, np.ndarray]:
        """Predict SOH, RUL, and Degradation Trend jointly."""
        if not self.is_fitted:
            raise RuntimeError("MultiTaskBatteryModel is not fitted yet.")

        if isinstance(X, pd.DataFrame):
            X_mat = X.values
        else:
            X_mat = np.asarray(X, dtype=float)

        X_scaled = self.scaler.transform(X_mat)
        preds = self.base_model.predict(X_scaled)

        soh_pred = np.clip(preds[:, 0], 0.0, 100.0)
        rul_pred = np.maximum(0.0, preds[:, 1])
        trend_pred = np.maximum(0.0, preds[:, 2])

        # Convert trend rate into categorical trend label
        trend_labels = []
        for rate in trend_pred:
            if rate < 0.8:
                trend_labels.append("Stable Low Loss")
            elif rate < 1.8:
                trend_labels.append("Linear Moderate Aging")
            elif rate < 3.5:
                trend_labels.append("Accelerated Degradation")
            else:
                trend_labels.append("Severe Nonlinear Capacity Loss")

        return {
            "soh": soh_pred,
            "rul": rul_pred,
            "degradationRate": trend_pred,
            "trendLabels": np.array(trend_labels),
        }

    def evaluate(self, X_test: pd.DataFrame | np.ndarray, y_soh_test: np.ndarray, y_rul_test: np.ndarray) -> dict[str, Any]:
        """Compute evaluation metrics for Multi-Task architecture."""
        res = self.predict(X_test)
        soh_pred = res["soh"]
        rul_pred = res["rul"]

        soh_mae = float(mean_absolute_error(y_soh_test, soh_pred))
        soh_rmse = float(np.sqrt(mean_squared_error(y_soh_test, soh_pred)))
        soh_r2 = float(r2_score(y_soh_test, soh_pred))

        rul_mae = float(mean_absolute_error(y_rul_test, rul_pred))
        rul_rmse = float(np.sqrt(mean_squared_error(y_rul_test, rul_pred)))
        rul_r2 = float(r2_score(y_rul_test, rul_pred))

        return {
            "modelName": "Multi-Task Learning Model",
            "soh": {"mae": round(soh_mae, 4), "rmse": round(soh_rmse, 4), "r2": round(soh_r2, 4)},
            "rul": {"mae": round(rul_mae, 4), "rmse": round(rul_rmse, 4), "r2": round(rul_r2, 4)},
        }
