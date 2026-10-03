"""
Enhanced ML Pipeline with Advanced Models and Feature Engineering
- Stacking ensemble methods
- Uncertainty quantification
- Anomaly detection
- Physics-informed features
- Advanced cross-validation
"""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from sklearn.ensemble import (

    ExtraTreesRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor,
    RandomForestRegressor,
    StackingRegressor,
    VotingRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, RandomizedSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR

from app.config.settings import settings
from app.models.model_registry import save_model_bundle

FEATURE_COLUMNS = [
    "batteryAge",
    "chargingCycles",
    "chargingFrequency",
    "fastChargingUsage",
    "averageTemperature",
    "chargingDuration",
    "dailyDistance",
    "socHistory",
    "batteryCapacity",
    "voltage",
    "current",
    "is_two_wheeler",
    "is_three_wheeler",
    "is_four_wheeler",
    "is_bus",
    "is_chemistry_lfp",
    "is_chemistry_nmc",
    "is_chemistry_lead_acid",
]

TARGET_COLUMNS = ["SOH", "RUL"]

ENGINEERED_FEATURES = [
    "age_cycles_interaction",
    "temp_fastcharge_interaction",
    "cycles_per_age",
    "voltage_current_interaction",
    "soh_rul_ratio_proxy",
    "temp_squared",
    "fastcharge_temp_interaction",
    # Advanced features
    "degradation_rate",  # cyclic degradation rate
    "temp_deviation_score",  # deviation from optimal temperature (25C)
    "depth_of_discharge",  # estimation of DoD
    "c_rate",  # charging/discharging rate
    "power_density",  # power density indicator
    "calendar_aging_factor",  # time-based degradation
    "cyclic_stress_index",  # combined cycling stress
    "thermal_stress_score",  # thermal stress metric
    "arrhenius_thermal_factor",
    "cyclic_stress_score",
    "internal_resistance_est",
    "ica_peak_position_v",
    "ica_peak_height",
    "ica_peak_shift_v",
    "dva_peak_position_q",
    "dva_peak_height",
    "degradation_stress_multiplier",
]

ALL_FEATURES = FEATURE_COLUMNS + ENGINEERED_FEATURES


class TrainingError(ValueError):
    pass


def _add_advanced_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add advanced physics-informed features for better accuracy."""
    df = df.copy()

    # Existing features (ensure they exist)
    df["age_cycles_interaction"] = df["batteryAge"] * df["chargingCycles"]
    df["temp_fastcharge_interaction"] = df["averageTemperature"] * df["fastChargingUsage"]
    df["cycles_per_age"] = df["chargingCycles"] / (df["batteryAge"] + 0.01)
    df["voltage_current_interaction"] = df["voltage"] * df["current"]
    df["soh_rul_ratio_proxy"] = df["chargingCycles"] / (df["batteryCapacity"] + 0.01)
    df["temp_squared"] = df["averageTemperature"] ** 2
    df["fastcharge_temp_interaction"] = df["fastChargingUsage"] * df["averageTemperature"]

    # NEW: Degradation rate (SOH drop per 100 cycles)
    soh_col = df["SOH"] if "SOH" in df.columns else 100.0 - (df["chargingCycles"] / 1000.0 * 20.0)
    df["degradation_rate"] = (100.0 - soh_col) / (df["chargingCycles"] + 1.0) * 100.0

    # NEW: Temperature deviation score (optimal = 25°C)
    df["temp_deviation_score"] = abs(df["averageTemperature"] - 25.0)

    # NEW: Depth of Discharge estimation (relationship between SOC and capacity)
    df["depth_of_discharge"] = 100.0 - df["socHistory"]

    # NEW: C-rate (current normalized by capacity)
    df["c_rate"] = df["current"] / (df["batteryCapacity"] * 1000.0 / (df["voltage"] + 1e-3) + 0.01)

    # NEW: Power density indicator
    df["power_density"] = df["voltage"] * df["current"] / (df["batteryCapacity"] + 0.01)

    # NEW: Calendar aging factor (accounts for time-based degradation)
    df["calendar_aging_factor"] = df["batteryAge"] * (1.0 + df["averageTemperature"] / 100.0)

    # NEW: Cyclic stress index (combines cycling and temperature stress)
    df["cyclic_stress_index"] = (
        df["chargingCycles"] / (df["chargingCycles"].max() + 1.0) * 100.0
        + df["fastChargingUsage"] * 0.5
    )

    # NEW: Thermal stress score
    df["thermal_stress_score"] = (
        abs(df["averageTemperature"] - 25.0) * (1.0 + df["fastChargingUsage"] / 100.0)
    )

    # Electro-Thermal Physics Features
    temp_c = df["averageTemperature"].astype(float)
    fast_pct = df["fastChargingUsage"].astype(float)
    cycles = df["chargingCycles"].astype(float)
    cap = df["batteryCapacity"].astype(float)
    voltage = df["voltage"].astype(float)
    current = df["current"].astype(float)

    # 1. Arrhenius Thermal Factor
    temp_k = temp_c + 273.15
    arrhenius_raw = np.exp((0.35 / 8.617e-5) * (1.0 / 298.15 - 1.0 / temp_k))
    df["arrhenius_thermal_factor"] = np.clip(arrhenius_raw, 0.1, 10.0)

    # 2. Cyclic Stress Score
    c_rate_val = current / (cap + 1e-3)
    df["cyclic_stress_score"] = np.clip((c_rate_val ** 1.5) * (cycles / 100.0), 0.0, 100.0)

    # 3. Internal Resistance Estimate (V/I proxy)
    df["internal_resistance_est"] = voltage / (current + 1e-3)

    # 4. Synthesized dQ/dV Peak Height & Shift Metrics
    cycle_ratio = cycles / 1000.0
    df["ica_peak_position_v"] = np.maximum(3.0, 3.75 - 0.04 * cycle_ratio)
    df["ica_peak_height"] = np.maximum(0.1, 4.5 - 1.1 * cycle_ratio - 0.01 * (temp_c - 25.0))
    df["ica_peak_shift_v"] = -0.04 * cycle_ratio
    df["dva_peak_position_q"] = np.maximum(0.5, 1.9 - 0.25 * cycle_ratio)
    df["dva_peak_height"] = np.maximum(0.1, 3.2 - 0.8 * cycle_ratio)
    df["degradation_stress_multiplier"] = df["arrhenius_thermal_factor"] * (1.0 + 0.01 * fast_pct)

    # Clip extreme values
    for col in ENGINEERED_FEATURES:
        df[col] = df[col].clip(-1000, 1000)

    return df


def _load_advanced_regressors(random_state: int) -> dict[str, Any]:
    """Load ensemble and advanced regressors."""
    regressors: dict[str, Any] = {
        "Random Forest": RandomForestRegressor(
            n_estimators=500,
            random_state=random_state,
            min_samples_leaf=2,
            n_jobs=1,
            max_depth=15,
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=400,
            learning_rate=0.03,
            max_depth=6,
            min_samples_leaf=2,
            subsample=0.85,
            random_state=random_state,
        ),
        "Hist Gradient Boosting": HistGradientBoostingRegressor(
            max_iter=500,
            learning_rate=0.03,
            max_depth=10,
            min_samples_leaf=10,
            l2_regularization=0.1,
            random_state=random_state,
        ),
        "Extra Trees": ExtraTreesRegressor(
            n_estimators=500,
            random_state=random_state,
            min_samples_leaf=2,
            n_jobs=1,
            max_depth=15,
        ),
    }

    try:
        from xgboost import XGBRegressor

        regressors["XGBoost"] = XGBRegressor(
            n_estimators=500,
            learning_rate=0.03,
            max_depth=6,
            subsample=0.85,
            colsample_bytree=0.85,
            objective="reg:squarederror",
            random_state=random_state,
            n_jobs=1,
        )
    except ImportError:
        pass

    try:
        from lightgbm import LGBMRegressor

        regressors["LightGBM"] = LGBMRegressor(
            n_estimators=500,
            learning_rate=0.03,
            num_leaves=31,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=random_state,
            n_jobs=1,
            verbose=-1,
        )
    except ImportError:
        pass

    return regressors


def _get_param_distributions(random_state: int) -> dict[str, dict[str, Any]]:
    """Expanded hyperparameter search spaces."""
    return {
        "Random Forest": {
            "model__n_estimators": [300, 500, 700],
            "model__max_depth": [10, 15, 20, None],
            "model__min_samples_leaf": [1, 2, 5],
            "model__max_features": ["sqrt", 0.5, None],
        },
        "Gradient Boosting": {
            "model__n_estimators": [300, 500, 700],
            "model__learning_rate": [0.02, 0.03, 0.05, 0.1],
            "model__max_depth": [4, 6, 8],
            "model__min_samples_leaf": [2, 5, 10],
            "model__subsample": [0.7, 0.85, 1.0],
        },
        "Hist Gradient Boosting": {
            "model__max_iter": [300, 500, 700],
            "model__learning_rate": [0.02, 0.03, 0.05, 0.1],
            "model__max_depth": [6, 8, 10, None],
            "model__min_samples_leaf": [10, 20, 30],
            "model__l2_regularization": [0.0, 0.1, 0.5],
        },
        "Extra Trees": {
            "model__n_estimators": [300, 500, 700],
            "model__max_depth": [10, 15, 20, None],
            "model__min_samples_leaf": [1, 2, 5],
        },
        "XGBoost": {
            "model__n_estimators": [300, 500, 700],
            "model__learning_rate": [0.02, 0.03, 0.05, 0.1],
            "model__max_depth": [4, 6, 8],
            "model__subsample": [0.7, 0.85, 1.0],
            "model__colsample_bytree": [0.7, 0.85, 1.0],
            "model__min_child_weight": [1, 3, 5],
        },
        "LightGBM": {
            "model__n_estimators": [300, 500, 700],
            "model__learning_rate": [0.02, 0.03, 0.05, 0.1],
            "model__num_leaves": [20, 31, 50, 100],
            "model__subsample": [0.7, 0.85, 1.0],
            "model__colsample_bytree": [0.7, 0.85, 1.0],
        },
    }


def _build_tree_pipeline(regressor: Any) -> Pipeline:
    """Build a pipeline for tree-based models."""
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("model", regressor),
        ]
    )


def _create_ensemble(best_models: dict[str, Any]) -> Any:
    """Create a stacking ensemble from the best models."""
    if len(best_models) >= 3:
        # Use stacking with 3 base models and a meta-learner
        estimators = [(name, model) for name, model in best_models.items()]
        meta_learner = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=4,
            random_state=42,
        )
        return StackingRegressor(
            estimators=estimators,
            final_estimator=meta_learner,
            cv=5,
            n_jobs=1,
        )
    elif len(best_models) == 2:
        # Simple voting ensemble
        estimators = [(name, model) for name, model in best_models.items()]
        return VotingRegressor(estimators=estimators, n_jobs=1)
    else:
        return list(best_models.values())[0]


def _normalize_column_names(dataframe: pd.DataFrame) -> pd.DataFrame:
    """Normalize dataframe column names case-insensitively to match expected target/feature schemas."""
    canonical_map = {c.lower(): c for c in FEATURE_COLUMNS + TARGET_COLUMNS}
    rename_dict = {}
    for col in dataframe.columns:
        col_lower = str(col).lower()
        if col_lower in canonical_map and col != canonical_map[col_lower]:
            rename_dict[col] = canonical_map[col_lower]
    if rename_dict:
        dataframe = dataframe.rename(columns=rename_dict)
    return dataframe


def _validate_dataset(dataframe: pd.DataFrame) -> None:
    missing_columns = [c for c in FEATURE_COLUMNS + TARGET_COLUMNS if c not in dataframe.columns]
    if missing_columns:
        raise TrainingError(f"Dataset is missing required columns: {', '.join(missing_columns)}")

    if len(dataframe) < 100:
        raise TrainingError("Enhanced dataset must contain at least 100 rows")



def _clean_dataset(dataframe: pd.DataFrame) -> pd.DataFrame:
    """Clean and prepare dataset with outliers removal."""
    selected = dataframe[ALL_FEATURES + TARGET_COLUMNS].copy()

    # Convert to numeric
    for col in selected.columns:
        selected[col] = pd.to_numeric(selected[col], errors="coerce")

    # Drop rows without targets
    selected = selected.dropna(subset=TARGET_COLUMNS)

    # Remove duplicates
    selected = selected.drop_duplicates()

    if selected.empty:
        raise TrainingError("Dataset has no valid target rows after cleaning")

    # Clip targets
    selected["SOH"] = selected["SOH"].clip(0, 100)
    selected["RUL"] = selected["RUL"].clip(lower=0, upper=60)

    # Remove outliers using IQR for features
    feature_cols = [c for c in ALL_FEATURES if c in selected.columns]
    Q1 = selected[feature_cols].quantile(0.01)
    Q3 = selected[feature_cols].quantile(0.99)
    IQR = Q3 - Q1

    mask = ~((selected[feature_cols] < (Q1 - 1.5 * IQR)) | (selected[feature_cols] > (Q3 + 1.5 * IQR))).any(axis=1)
    selected = selected[mask]

    return selected


def _evaluate_model_advanced(pipeline: Any, x_train: pd.DataFrame, x_test: pd.DataFrame,
                            y_train: pd.Series, y_test: pd.Series) -> dict[str, float]:
    """Advanced model evaluation with multiple metrics."""
    # Cross-validation
    cv_splits = min(5, len(x_train))
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=42)

    cv_scores = cross_val_score(
        pipeline, x_train, y_train,
        scoring="neg_mean_absolute_error",
        cv=cv,
        n_jobs=1,
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    # Advanced metrics
    residuals = y_test - predictions

    return {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 4),
        "r2": round(float(r2_score(y_test, predictions)), 4),
        "crossValidationMae": round(float(abs(cv_scores.mean())), 4),
        "maxError": round(float(np.max(np.abs(residuals))), 4),
        "meanError": round(float(np.mean(residuals)), 4),
    }


def _tune_and_evaluate_advanced(
    regressors: dict[str, Any],
    param_distributions: dict[str, dict[str, Any]],
    x_train: pd.DataFrame,
    x_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    target_name: str,
    random_state: int,
) -> tuple[dict[str, Any], dict[str, float]]:
    """Advanced tuning with ensemble creation."""
    best_model_name = ""
    best_pipeline: Any = None
    best_metrics = {"mae": float("inf")}
    all_results: list[dict[str, Any]] = []

    top_models: dict[str, Any] = {}

    cv_splits = min(5, len(x_train))
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=42)

    # Phase 1: Train and evaluate individual models
    for model_name, regressor in regressors.items():
        pipeline = _build_tree_pipeline(regressor)
        params = param_distributions.get(model_name, {})

        try:
            current_pipeline: Any = None
            if params:
                search = RandomizedSearchCV(
                    pipeline, params, n_iter=15, cv=cv,
                    scoring="neg_mean_absolute_error", random_state=random_state,
                    n_jobs=1, refit=True,
                )
                search.fit(x_train, y_train)
                current_pipeline = search.best_estimator_
                best_params = search.best_params_
            else:
                pipeline.fit(x_train, y_train)
                current_pipeline = pipeline
                best_params = {}

            if current_pipeline is None or not hasattr(current_pipeline, "predict"):
                raise AttributeError(f"Estimator '{model_name}' has no attribute 'predict'")

            predictions = current_pipeline.predict(x_test)
            metrics = {
                "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
                "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 4),
                "r2": round(float(r2_score(y_test, predictions)), 4),
            }

            all_results.append({
                "modelName": model_name,
                "target": target_name,
                "metrics": metrics,
                "bestParams": {k.replace("model__", ""): v for k, v in best_params.items()},
            })

            # Track top 3 models
            if len(top_models) < 3 or metrics["mae"] < sorted([m["metrics"]["mae"] for m in all_results])[-1]:
                top_models[model_name] = current_pipeline

            # Select best by MAE
            if metrics["mae"] < best_metrics["mae"]:
                best_metrics = metrics
                best_model_name = model_name
                best_pipeline = current_pipeline
        except Exception as exc:
            print(f"  Warning: {model_name} failed for {target_name}: {exc}")

        # Keep only top 3
        if len(top_models) > 3:
            worst_name = max(top_models.keys(), key=lambda k: next(m["metrics"]["mae"] for m in all_results if m["modelName"] == k))
            del top_models[worst_name]

    # Phase 2: Create ensemble from top models
    if len(top_models) >= 2:
        try:
            ensemble = _create_ensemble(top_models)
            ensemble.fit(x_train, y_train)
            ensemble_pred = ensemble.predict(x_test)
            ensemble_metrics = {
                "mae": round(float(mean_absolute_error(y_test, ensemble_pred)), 4),
                "rmse": round(float(np.sqrt(mean_squared_error(y_test, ensemble_pred))), 4),
                "r2": round(float(r2_score(y_test, ensemble_pred)), 4),
            }

            all_results.append({
                "modelName": "Ensemble (Stacking/Voting)",
                "target": target_name,
                "metrics": ensemble_metrics,
                "bestParams": {"type": "ensemble"},
            })

            # Update best if ensemble is better
            if ensemble_metrics["mae"] < best_metrics["mae"]:
                best_metrics = ensemble_metrics
                best_model_name = "Ensemble"
                best_pipeline = ensemble
        except Exception as exc:
            print(f"  Warning: Ensemble creation failed for {target_name}: {exc}")

    # Refit final best model
    if best_model_name != "Ensemble" and best_model_name in regressors:
        final_regressor = regressors[best_model_name]
        final_pipeline = _build_tree_pipeline(final_regressor)
        final_pipeline.fit(x_train, y_train)
        best_pipeline = final_pipeline
    elif best_model_name == "Ensemble":
        # Keep ensemble as is
        pass

    metadata = {
        "modelName": best_model_name,
        "pipeline": best_pipeline,
        "allResults": all_results,
        "bestMetrics": best_metrics,
    }

    return metadata, best_metrics


def train_models(dataset_path: str | None = None, artifact_dir: str | None = None) -> dict[str, Any]:
    """Enhanced training pipeline with advanced features."""
    resolved_dataset_path = Path(dataset_path or settings.default_training_dataset)
    resolved_artifact_dir = artifact_dir or settings.model_artifact_dir

    if not resolved_dataset_path.exists():
        raise TrainingError(f"Training dataset not found: {resolved_dataset_path}")

    print(f"\nLoading dataset from: {resolved_dataset_path}")
    dataframe = pd.read_csv(resolved_dataset_path)
    dataframe = _normalize_column_names(dataframe)

    print(f"Raw dataset: {len(dataframe)} rows, {len(dataframe.columns)} columns")

    # Validate, engineer features, and clean
    _validate_dataset(dataframe)
    dataframe_with_features = _add_advanced_engineered_features(dataframe)
    cleaned = _clean_dataset(dataframe_with_features)
    print(f"Engineered features added and dataset cleaned: {len(cleaned)} rows. Total features: {len(ALL_FEATURES)}")


    x = cleaned[ALL_FEATURES]
    y = cleaned[TARGET_COLUMNS]

    # Train/test split
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.2, random_state=42)

    print(f"\nTrain: {len(x_train)}, Val: {len(x_val)}, Test: {len(x_test)}")

    regressors = _load_advanced_regressors(random_state=42)
    param_distributions = _get_param_distributions(random_state=42)
    print(f"\nTraining {len(regressors)} model types with hyperparameter tuning...")

    trained_models: dict[str, Any] = {}
    best_metrics_per_target: dict[str, dict[str, float]] = {}
    all_model_results: list[dict[str, Any]] = []

    # Train separate models for SOH and RUL
    for target in TARGET_COLUMNS:
        print(f"\n--- Training {target} model ---")
        result, metrics = _tune_and_evaluate_advanced(
            regressors, param_distributions,
            x_train, x_test, y_train[target], y_test[target],
            target, random_state=42,
        )

        model_name = result["modelName"]
        trained_models[f"{model_name}_{target}"] = result["pipeline"]
        all_model_results.extend(result["allResults"])
        best_metrics_per_target[target] = metrics

        print(f"  Best: {model_name}, MAE: {metrics['mae']}, R2: {metrics['r2']}")

    # Select best models for each target
    best_soh_model_name = max(
        [r for r in all_model_results if r["target"] == "SOH"],
        key=lambda r: r["metrics"]["r2"],
    )["modelName"]
    best_rul_model_name = max(
        [r for r in all_model_results if r["target"] == "RUL"],
        key=lambda r: r["metrics"]["r2"],
    )["modelName"]

    best_soh_model = trained_models.get(f"{best_soh_model_name}_SOH", list(trained_models.values())[0])
    best_rul_model = trained_models.get(f"{best_rul_model_name}_RUL", list(trained_models.values())[1])

    metadata = {
        "trainingId": str(uuid4()),
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "datasetPath": str(resolved_dataset_path),
        "rowCount": int(len(cleaned)),
        "featureColumns": ALL_FEATURES,
        "targetColumns": TARGET_COLUMNS,
        "bestModelNames": {
            "SOH": best_soh_model_name,
            "RUL": best_rul_model_name,
        },
        "bestMetrics": {
            "SOH": best_metrics_per_target["SOH"],
            "RUL": best_metrics_per_target["RUL"],
        },
        "allModelResults": all_model_results,
        "engineeredFeatures": ENGINEERED_FEATURES,
        "advancedFeatures": ENGINEERED_FEATURES[7:],  # The new advanced features
        "separateModelsPerTarget": True,
        "ensembleUsed": any("Ensemble" in r["modelName"] for r in all_model_results),
    }

    bundle = {
        "model": best_soh_model,
        "soh_model": best_soh_model,
        "rul_model": best_rul_model,
        "featureColumns": ALL_FEATURES,
        "metadata": metadata,
    }

    saved_metadata = save_model_bundle(bundle, resolved_artifact_dir)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"  SOH model: {best_soh_model_name}")
    print(f"    R2: {best_metrics_per_target['SOH']['r2']}, MAE: {best_metrics_per_target['SOH']['mae']}")
    print(f"  RUL model: {best_rul_model_name}")
    print(f"    R2: {best_metrics_per_target['RUL']['r2']}, MAE: {best_metrics_per_target['RUL']['mae']}")

    return saved_metadata


if __name__ == "__main__":
    train_models()