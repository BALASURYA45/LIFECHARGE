"""
Unscented Kalman Filter (UKF) Module for Battery State Assimilation
LifeCharge-X Research Framework - Phase 14

Mathematical UKF implementation for online battery digital twin updates:
- State vector x = [SOH, RUL, R_internal]^T
- Scaled Unscented Transform (alpha=1e-3, beta=2.0, kappa=0.0)
- Predict, Measurement Innovation, Kalman Gain, Posterior Covariance Update
"""
from __future__ import annotations

import logging
from typing import Dict, Tuple, Any, List, Optional
import numpy as np
from scipy.linalg import cholesky

logger = logging.getLogger(__name__)


class UnscentedKalmanFilterBattery:
    """
    Mathematical Unscented Kalman Filter for battery SOH, RUL, and Internal Resistance.
    """

    def __init__(
        self,
        dim_x: int = 3,
        dim_z: int = 2,
        alpha: float = 1e-3,
        beta: float = 2.0,
        kappa: float = 0.0,
    ):
        self.n = dim_x
        self.m = dim_z
        self.alpha = alpha
        self.beta = beta
        self.kappa = kappa

        # Lambda parameter for Scaled Unscented Transform
        self.lam = alpha**2 * (self.n + kappa) - self.n
        self.num_sigmas = 2 * self.n + 1

        # Sigma point weights
        self.wm = np.zeros(self.num_sigmas)
        self.wc = np.zeros(self.num_sigmas)

        self.wm[0] = self.lam / (self.n + self.lam)
        self.wc[0] = self.wm[0] + (1.0 - alpha**2 + beta)

        for i in range(1, self.num_sigmas):
            self.wm[i] = 1.0 / (2.0 * (self.n + self.lam))
            self.wc[i] = self.wm[i]

        # Initial State Covariance P (3x3)
        self.P = np.diag([4.0, 400.0, 0.005])

        # Process Noise Covariance Q (3x3)
        self.Q = np.diag([0.05, 4.0, 0.0001])

        # Measurement Noise Covariance R (2x2) [Voltage, Capacity measurement noise]
        self.R = np.diag([0.25, 10.0])

    def generate_sigma_points(self, x: np.ndarray, P: np.ndarray) -> np.ndarray:
        """
        Generates 2n+1 sigma points using matrix square root (Cholesky).
        """
        sigmas = np.zeros((self.num_sigmas, self.n))
        sigmas[0] = x

        # Regularization for numerical stability
        P_reg = P + 1e-6 * np.eye(self.n)
        try:
            L = cholesky((self.n + self.lam) * P_reg, lower=True)
        except Exception:
            L = np.sqrt(np.maximum(1e-6, np.diag((self.n + self.lam) * P_reg))) * np.eye(self.n)

        for i in range(self.n):
            sigmas[i + 1] = x + L[i]
            sigmas[i + 1 + self.n] = x - L[i]

        return sigmas

    def state_transition_function(self, x: np.ndarray, dt_cycles: float = 1.0) -> np.ndarray:
        """
        Non-linear state transition f(x_k-1):
        SOH_k = SOH_k-1 - degradation_rate
        RUL_k = RUL_k-1 - dt_cycles
        R_int_k = R_int_k-1 + resistance_growth
        """
        soh = x[0]
        rul = x[1]
        r_int = x[2]

        # Empirical degradation step
        soh_next = max(0.0, soh - 0.015 * dt_cycles)
        rul_next = max(0.0, rul - dt_cycles)
        r_int_next = r_int + 0.00005 * dt_cycles

        return np.array([soh_next, rul_next, r_int_next])

    def measurement_function(self, x: np.ndarray) -> np.ndarray:
        """
        Non-linear measurement function h(x_k): Maps latent state to observed [SOH_obs, RUL_obs].
        """
        soh_obs = x[0]
        rul_obs = x[1]
        return np.array([soh_obs, rul_obs])

    def update_state(
        self,
        current_state: Tuple[float, float, float],
        observed_soh: float,
        observed_rul: float,
        dt_cycles: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Full UKF Predict -> Measurement Innovation -> Kalman Gain -> State Update.
        """
        x_prior = np.array(current_state, dtype=float)

        # 1. Generate prior sigma points
        sigmas_f = self.generate_sigma_points(x_prior, self.P)

        # 2. Propagate sigma points through state transition model
        sigmas_x = np.zeros_like(sigmas_f)
        for i in range(self.num_sigmas):
            sigmas_x[i] = self.state_transition_function(sigmas_f[i], dt_cycles=dt_cycles)

        # 3. Predicted state mean x_pred and covariance P_pred
        x_pred = np.zeros(self.n)
        for i in range(self.num_sigmas):
            x_pred += self.wm[i] * sigmas_x[i]

        P_pred = np.copy(self.Q)
        for i in range(self.num_sigmas):
            dx = sigmas_x[i] - x_pred
            P_pred += self.wc[i] * np.outer(dx, dx)

        # 4. Measurement projection h(sigmas_x)
        sigmas_z = np.zeros((self.num_sigmas, self.m))
        for i in range(self.num_sigmas):
            sigmas_z[i] = self.measurement_function(sigmas_x[i])

        # Predicted measurement mean z_pred
        z_pred = np.zeros(self.m)
        for i in range(self.num_sigmas):
            z_pred += self.wm[i] * sigmas_z[i]

        # 5. Measurement Innovation Covariance P_zz and Cross Covariance P_xz
        P_zz = np.copy(self.R)
        P_xz = np.zeros((self.n, self.m))

        for i in range(self.num_sigmas):
            dz = sigmas_z[i] - z_pred
            dx = sigmas_x[i] - x_pred
            P_zz += self.wc[i] * np.outer(dz, dz)
            P_xz += self.wc[i] * np.outer(dx, dz)

        # 6. Kalman Gain K
        try:
            K = np.matmul(P_xz, np.linalg.inv(P_zz))
        except np.linalg.LinAlgError:
            K = np.zeros((self.n, self.m))

        # 7. Measurement observation z
        z_obs = np.array([observed_soh, observed_rul], dtype=float)
        innovation = z_obs - z_pred

        # 8. Posterior State x_post and Covariance P_post
        x_post = x_pred + np.dot(K, innovation)
        P_post = P_pred - np.matmul(K, np.matmul(P_zz, K.T))

        # Save updated covariance
        self.P = P_post

        # Ensure physical bounds
        x_post[0] = max(0.0, min(100.0, x_post[0]))
        x_post[1] = max(0.0, x_post[1])
        x_post[2] = max(0.001, x_post[2])

        return {
            "prior_state": {
                "soh": round(float(x_pred[0]), 2),
                "rul": round(float(x_pred[1]), 1),
                "internal_resistance_ohm": round(float(x_pred[2]), 5),
            },
            "posterior_state": {
                "soh": round(float(x_post[0]), 2),
                "rul": round(float(x_post[1]), 1),
                "internal_resistance_ohm": round(float(x_post[2]), 5),
            },
            "innovation": {
                "soh_residual": round(float(innovation[0]), 3),
                "rul_residual": round(float(innovation[1]), 2),
            },
            "covariance_trace": round(float(np.trace(P_post)), 4),
            "kalman_gain_norm": round(float(np.linalg.norm(K)), 4),
            "is_ukf_converged": bool(np.trace(P_post) < 50.0),
        }
