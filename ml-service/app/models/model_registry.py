from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib


MODEL_FILE = "best_model.joblib"
METADATA_FILE = "model_metadata.json"
HISTORY_FILE = "training_history.json"


def ensure_artifact_dir(artifact_dir: str) -> Path:
    path = Path(artifact_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_model_bundle(bundle: dict[str, Any], artifact_dir: str) -> dict[str, Any]:
    path = ensure_artifact_dir(artifact_dir)
    model_path = path / MODEL_FILE
    metadata_path = path / METADATA_FILE
    history_path = path / HISTORY_FILE

    joblib.dump(bundle, model_path)

    metadata = bundle["metadata"] | {"modelPath": str(model_path)}
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    history = []
    if history_path.exists():
      history = json.loads(history_path.read_text(encoding="utf-8"))

    history.insert(0, metadata)
    history_path.write_text(json.dumps(history[:25], indent=2), encoding="utf-8")

    return metadata


def load_current_metadata(artifact_dir: str) -> dict[str, Any] | None:
    metadata_path = Path(artifact_dir) / METADATA_FILE

    if not metadata_path.exists():
        return None

    return json.loads(metadata_path.read_text(encoding="utf-8"))


def load_training_history(artifact_dir: str) -> list[dict[str, Any]]:
    history_path = Path(artifact_dir) / HISTORY_FILE

    if not history_path.exists():
        return []

    return json.loads(history_path.read_text(encoding="utf-8"))
