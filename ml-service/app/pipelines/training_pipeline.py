from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.multioutput import MultiOutputRegressor
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
]

TARGET_COLUMNS = ["SOH", "RUL"]


class TrainingError(ValueError):
    pass


def _load_regressors(random_state: int) -> dict[str, Any]:
    regressors: dict[str, Any] = {
        "Random Forest": RandomForestRegressor(
            n_estimators=250,
            random_state=random_state,
            min_samples_leaf=2,
            n_jobs=1,
        )
    }

    try:
        from xgboost import XGBRegressor

        regressors["XGBoost"] = XGBRegressor(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.9,
            colsample_bytree=0.9,
            objective="reg:squarederror",
            random_state=random_state,
            n_jobs=1,
        )
    except ImportError:
        pass

    try:
        from lightgbm import LGBMRegressor

        regressors["LightGBM"] = LGBMRegressor(
            n_estimators=250,
            learning_rate=0.05,
            num_leaves=24,
            random_state=random_state,
            n_jobs=1,
            verbose=-1,
        )
    except ImportError:
        pass

    return regressors


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

    return selected


def _build_pipeline(regressor: Any) -> Pipeline:
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", MultiOutputRegressor(regressor, n_jobs=1)),
        ]
    )


def _evaluate_model(model: Pipeline, x_train: pd.DataFrame, x_test: pd.DataFrame, y_train: pd.DataFrame, y_test: pd.DataFrame) -> dict[str, float]:
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)

    cv_splits = min(5, len(x_train))
    cv = KFold(n_splits=cv_splits, shuffle=True, random_state=42)

    cv_scores = cross_val_score(
        model,
        x_train,
        y_train,
        scoring="neg_mean_absolute_error",
        cv=cv,
        n_jobs=1,
    )

    return {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 4),
        "r2": round(float(r2_score(y_test, predictions)), 4),
        "crossValidationMae": round(float(abs(cv_scores.mean())), 4),
    }


def train_models(dataset_path: str | None = None, artifact_dir: str | None = None) -> dict[str, Any]:
    resolved_dataset_path = Path(dataset_path or settings.default_training_dataset)
    resolved_artifact_dir = artifact_dir or settings.model_artifact_dir

    if not resolved_dataset_path.exists():
        raise TrainingError(f"Training dataset not found: {resolved_dataset_path}")

    dataframe = pd.read_csv(resolved_dataset_path)
    _validate_dataset(dataframe)
    cleaned = _clean_dataset(dataframe)

    x = cleaned[FEATURE_COLUMNS]
    y = cleaned[TARGET_COLUMNS]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
    )

    model_results = []
    trained_models: dict[str, Pipeline] = {}

    for model_name, regressor in _load_regressors(random_state=42).items():
        pipeline = _build_pipeline(regressor)
        metrics = _evaluate_model(pipeline, x_train, x_test, y_train, y_test)
        model_results.append({"modelName": model_name, "metrics": metrics})
        trained_models[model_name] = pipeline

    best_result = sorted(
        model_results,
        key=lambda result: (result["metrics"]["mae"], result["metrics"]["rmse"], -result["metrics"]["r2"]),
    )[0]
    best_model_name = best_result["modelName"]
    best_model = trained_models[best_model_name]

    metadata = {
        "trainingId": str(uuid4()),
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "datasetPath": str(resolved_dataset_path),
        "rowCount": int(len(cleaned)),
        "featureColumns": FEATURE_COLUMNS,
        "targetColumns": TARGET_COLUMNS,
        "bestModelName": best_model_name,
        "bestMetrics": best_result["metrics"],
        "modelResults": model_results,
    }

    bundle = {
        "model": best_model,
        "metadata": metadata,
    }

    saved_metadata = save_model_bundle(bundle, resolved_artifact_dir)

    return saved_metadata
