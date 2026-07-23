from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import numpy as np
import pandas as pd
from sklearn.ensemble import (
    GradientBoostingRegressor,
    HistGradientBoostingRegressor,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, RandomizedSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

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
    # Vehicle-type one-hot encoding
    "is_two_wheeler",
    "is_three_wheeler",
    "is_four_wheeler",
    "is_bus",
    # Chemistry one-hot encoding
    "is_chemistry_lfp",
    "is_chemistry_nmc",
    "is_chemistry_lead_acid",
]

TARGET_COLUMNS = ["SOH", "RUL"]

# Engineered feature columns (added during preprocessing)
ENGINEERED_FEATURES = [
    "age_cycles_interaction",
    "temp_fastcharge_interaction",
    "cycles_per_age",
    "voltage_current_interaction",
    "soh_rul_ratio_proxy",
    "temp_squared",
    "fastcharge_temp_interaction",
]


class TrainingError(ValueError):
    pass


def _add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add domain-specific interaction features to improve model accuracy."""
    df = df.copy()

    # Interaction: battery age * charging cycles (captures cumulative wear)
    df["age_cycles_interaction"] = df["batteryAge"] * df["chargingCycles"]

    # Interaction: temperature * fast charging (captures thermal stress from fast charging)
    df["temp_fastcharge_interaction"] = df["averageTemperature"] * df["fastChargingUsage"]

    # Ratio: cycles per year of age (usage intensity)
    df["cycles_per_age"] = df["chargingCycles"] / (df["batteryAge"] + 0.01)

    # Interaction: voltage * current (power-related stress)
    df["voltage_current_interaction"] = df["voltage"] * df["current"]

    # Proxy for SOH-RUL relationship: cycles / capacity
    df["soh_rul_ratio_proxy"] = df["chargingCycles"] / (df["batteryCapacity"] + 0.01)

    # Non-linear temperature feature
    df["temp_squared"] = df["averageTemperature"] ** 2

    # Interaction: fast charging * temperature (combined thermal stress)
    df["fastcharge_temp_interaction"] = df["fastChargingUsage"] * df["averageTemperature"]

    return df


def _load_regressors(random_state: int) -> dict[str, Any]:
    """Load tree-based regressors with default hyperparameters (tuned later via RandomizedSearchCV)."""
    regressors: dict[str, Any] = {
        "Random Forest": RandomForestRegressor(
            n_estimators=300,
            random_state=random_state,
            min_samples_leaf=2,
            n_jobs=1,
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=5,
            min_samples_leaf=2,
            subsample=0.85,
            random_state=random_state,
        ),
        "Hist Gradient Boosting": HistGradientBoostingRegressor(
            max_iter=300,
            learning_rate=0.05,
            max_depth=8,
            min_samples_leaf=20,
            l2_regularization=0.1,
            random_state=random_state,
        ),
    }

    try:
        from xgboost import XGBRegressor

        regressors["XGBoost"] = XGBRegressor(
            n_estimators=300,
            learning_rate=0.04,
            max_depth=5,
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
            n_estimators=300,
            learning_rate=0.04,
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
    """Hyperparameter search spaces for RandomizedSearchCV."""
    return {
        "Random Forest": {
            "model__n_estimators": [200, 300, 500],
            "model__max_depth": [None, 10, 15, 20],
            "model__min_samples_leaf": [1, 2, 5],
            "model__max_features": ["sqrt", 0.5, None],
        },
        "Gradient Boosting": {
            "model__n_estimators": [200, 300, 500],
            "model__learning_rate": [0.03, 0.05, 0.1],
            "model__max_depth": [3, 5, 7],
            "model__min_samples_leaf": [2, 5, 10],
            "model__subsample": [0.7, 0.85, 1.0],
        },
        "Hist Gradient Boosting": {
            "model__max_iter": [200, 300, 500],
            "model__learning_rate": [0.03, 0.05, 0.1],
            "model__max_depth": [None, 6, 8, 10],
            "model__min_samples_leaf": [10, 20, 30],
            "model__l2_regularization": [0.0, 0.1, 0.5],
        },
        "XGBoost": {
            "model__n_estimators": [200, 300, 500],
            "model__learning_rate": [0.03, 0.04, 0.05, 0.1],
            "model__max_depth": [3, 5, 7, 9],
            "model__subsample": [0.7, 0.85, 1.0],
            "model__colsample_bytree": [0.7, 0.85, 1.0],
            "model__min_child_weight": [1, 3, 5],
        },
        "LightGBM": {
            "model__n_estimators": [200, 300, 500],
            "model__learning_rate": [0.03, 0.04, 0.05, 0.1],
            "model__num_leaves": [20, 31, 50, 100],
            "model__subsample": [0.7, 0.85, 1.0],
            "model__colsample_bytree": [0.7, 0.85, 1.0],
        },
    }


def _validate_dataset(dataframe: pd.DataFrame) -> None:
    missing_columns = [column for column in FEATURE_COLUMNS + TARGET_COLUMNS if column not in dataframe.columns]

    if missing_columns:
        raise TrainingError(f"Dataset is missing required columns: {', '.join(missing_columns)}")

    if len(dataframe) < 30:
        raise TrainingError("Dataset must contain at least 30 rows for model comparison")


def _clean_dataset(dataframe: pd.DataFrame) -> pd.DataFrame:
    selected = dataframe[FEATURE_COLUMNS + TARGET_COLUMNS].copy()

    for column in selected.columns:
        selected[column] = pd.to_numeric(selected[column], errors="coerce")

    selected = selected.drop_duplicates()
    selected = selected.dropna(subset=TARGET_COLUMNS)

    if selected.empty:
        raise TrainingError("Dataset has no valid target rows after cleaning")

    selected["SOH"] = selected["SOH"].clip(0, 100)
    selected["RUL"] = selected["RUL"].clip(lower=0)

    # Cap RUL at a realistic maximum (60 months = 5 years)
    selected["RUL"] = selected["RUL"].clip(upper=60)

    return selected


def _build_tree_pipeline(regressor: Any) -> Pipeline:
    """Build a pipeline for tree-based models (no scaling needed)."""
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("model", regressor),
        ]
    )


def _build_linear_pipeline(regressor: Any) -> Pipeline:
    """Build a pipeline for linear models (with scaling)."""
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", regressor),
        ]
    )


def _evaluate_model(
    pipeline: Pipeline,
    x_train: pd.DataFrame,
    x_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> dict[str, float]:
    """Evaluate a single-target model with proper cross-validation (before fitting final model)."""
    # Cross-validation on unfitted pipeline (no data leakage)
    cv_splits = min(5, len(x_train))
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=42)

    cv_scores = cross_val_score(
        pipeline,
        x_train,
        y_train,
        scoring="neg_mean_absolute_error",
        cv=cv,
        n_jobs=1,
    )

    # Fit on full training data and evaluate on test set
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    return {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 4),
        "r2": round(float(r2_score(y_test, predictions)), 4),
        "crossValidationMae": round(float(abs(cv_scores.mean())), 4),
    }


def _tune_and_evaluate(
    regressors: dict[str, Any],
    param_distributions: dict[str, dict[str, Any]],
    x_train: pd.DataFrame,
    x_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    target_name: str,
    random_state: int,
) -> tuple[dict[str, Any], dict[str, float]]:
    """Tune hyperparameters with RandomizedSearchCV and evaluate the best model for a single target."""
    best_model_name = ""
    best_pipeline: Pipeline | None = None
    best_metrics: dict[str, float] = {"mae": float("inf")}
    all_results: list[dict[str, Any]] = []

    cv_splits = min(5, len(x_train))
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=42)

    for model_name, regressor in regressors.items():
        pipeline = _build_tree_pipeline(regressor)
        params = param_distributions.get(model_name, {})

        if params:
            search = RandomizedSearchCV(
                pipeline,
                params,
                n_iter=10,
                cv=cv,
                scoring="neg_mean_absolute_error",
                random_state=random_state,
                n_jobs=1,
                refit=True,
            )
            search.fit(x_train, y_train)
            best_pipeline = search.best_estimator_
            best_params = search.best_params_
        else:
            pipeline.fit(x_train, y_train)
            best_pipeline = pipeline
            best_params = {}

        # Evaluate on test set
        predictions = best_pipeline.predict(x_test)
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

        # Select best by MAE (lower is better)
        if metrics["mae"] < best_metrics["mae"]:
            best_metrics = metrics
            best_model_name = model_name

    # Refit the best model's pipeline with best params
    best_regressor = regressors[best_model_name]
    best_pipeline = _build_tree_pipeline(best_regressor)
    best_pipeline.fit(x_train, y_train)

    return {"modelName": best_model_name, "pipeline": best_pipeline, "allResults": all_results}, best_metrics


def train_models(dataset_path: str | None = None, artifact_dir: str | None = None) -> dict[str, Any]:
    resolved_dataset_path = Path(dataset_path or settings.default_training_dataset)
    resolved_artifact_dir = artifact_dir or settings.model_artifact_dir

    if not resolved_dataset_path.exists():
        raise TrainingError(f"Training dataset not found: {resolved_dataset_path}")

    dataframe = pd.read_csv(resolved_dataset_path)
    _validate_dataset(dataframe)
    cleaned = _clean_dataset(dataframe)

    # Add engineered features
    cleaned = _add_engineered_features(cleaned)

    all_features = FEATURE_COLUMNS + ENGINEERED_FEATURES
    x = cleaned[all_features]
    y = cleaned[TARGET_COLUMNS]

    # Train/validation/test split: 64% train, 16% validation, 20% test
    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
    )

    # Further split train into train/validation for early stopping if needed
    x_train, x_val, y_train, y_val = train_test_split(
        x_train,
        y_train,
        test_size=0.2,
        random_state=42,
    )

    regressors = _load_regressors(random_state=42)
    param_distributions = _get_param_distributions(random_state=42)

    model_results = []
    trained_models: dict[str, Pipeline] = {}
    best_metrics_per_target: dict[str, dict[str, float]] = {}

    # Train separate models for each target (SOH and RUL)
    for target in TARGET_COLUMNS:
        result, metrics = _tune_and_evaluate(
            regressors,
            param_distributions,
            x_train,
            x_test,
            y_train[target],
            y_test[target],
            target,
            random_state=42,
        )

        model_name = result["modelName"]
        trained_models[model_name + "_" + target] = result["pipeline"]
        model_results.extend(result["allResults"])
        best_metrics_per_target[target] = metrics

        print(f"  [{target}] Best model: {model_name}, MAE: {metrics['mae']}, R2: {metrics['r2']}")

    # Select the overall best model name for each target
    best_soh_model = trained_models.get("Random Forest_SOH") or list(trained_models.values())[0]
    best_rul_model = trained_models.get("Random Forest_RUL") or list(trained_models.values())[1]

    # Find actual best models by checking results
    for target in TARGET_COLUMNS:
        target_results = [r for r in model_results if r["target"] == target]
        if target_results:
            best_result = sorted(target_results, key=lambda r: r["metrics"]["mae"])[0]
            model_name = best_result["modelName"]
            if target == "SOH":
                best_soh_model = trained_models[model_name + "_SOH"]
            else:
                best_rul_model = trained_models[model_name + "_RUL"]

    metadata = {
        "trainingId": str(uuid4()),
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "datasetPath": str(resolved_dataset_path),
        "rowCount": int(len(cleaned)),
        "featureColumns": all_features,
        "targetColumns": TARGET_COLUMNS,
        "bestModelNames": {
            "SOH": best_result["modelName"] if target_results else "Random Forest",
            "RUL": best_result["modelName"] if target_results else "Random Forest",
        },
        "bestMetrics": best_metrics_per_target,
        "modelResults": model_results,
        "engineeredFeatures": ENGINEERED_FEATURES,
        "separateModelsPerTarget": True,
    }

    # Store both models in the bundle
    bundle = {
        "model": best_soh_model,  # Primary model (SOH) for backward compatibility
        "soh_model": best_soh_model,
        "rul_model": best_rul_model,
        "featureColumns": all_features,
        "metadata": metadata,
    }

    saved_metadata = save_model_bundle(bundle, resolved_artifact_dir)

    return saved_metadata
