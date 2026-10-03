import numpy as np
from scipy.stats import ks_2samp, wasserstein_distance

class TelematicsDriftDetector:
    """
    Monitors statistical distribution drift between reference training dataset
    and incoming operational telemetry batches.
    """
    def __init__(self, significance_level=0.05):
        self.p_threshold = significance_level

    def detect_feature_drift(self, reference_data: np.ndarray, current_batch: np.ndarray) -> dict:
        """
        Runs Kolmogorov-Smirnov test and calculates Wasserstein distance per feature column.
        """
        drift_results = {}
        drift_detected_count = 0

        num_features = reference_data.shape[1] if len(reference_data.shape) > 1 else 1
        
        for i in range(num_features):
            ref_col = reference_data[:, i] if num_features > 1 else reference_data
            cur_col = current_batch[:, i] if num_features > 1 else current_batch

            ks_stat, p_val = ks_2samp(ref_col, cur_col)
            w_dist = wasserstein_distance(ref_col, cur_col)
            has_drift = p_val < self.p_threshold

            if has_drift:
                drift_detected_count += 1

            drift_results[f"feature_{i}"] = {
                "ks_statistic": float(ks_stat),
                "p_value": float(p_val),
                "wasserstein_distance": float(w_dist),
                "drift_detected": bool(has_drift)
            }

        overall_drift = drift_detected_count > (num_features * 0.3)
        return {
            "overall_drift_detected": overall_drift,
            "drifted_features_ratio": drift_detected_count / num_features,
            "feature_details": drift_results,
            "action_recommended": "Trigger ML pipeline retraining" if overall_drift else "No action required"
        }

drift_detector = TelematicsDriftDetector()
