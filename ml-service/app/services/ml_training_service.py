from app.config.settings import settings
from app.models.model_registry import load_current_metadata, load_training_history
from app.pipelines.training_pipeline import train_models


def train_battery_health_models(dataset_path: str | None = None):
    return train_models(dataset_path=dataset_path, artifact_dir=settings.model_artifact_dir)


def get_current_model_metadata():
    return load_current_metadata(settings.model_artifact_dir)


def get_training_history():
    return load_training_history(settings.model_artifact_dir)
