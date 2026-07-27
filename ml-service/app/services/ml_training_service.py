from app.config.settings import settings
from app.models.model_registry import load_current_metadata, load_training_history
from app.pipelines.training_pipeline import train_models as train_models_standard

try:
    from app.pipelines.enhanced_training_pipeline import train_models as train_models_enhanced
    HAS_ENHANCED_PIPELINE = True
except ImportError:
    HAS_ENHANCED_PIPELINE = False


def _is_enhanced_dataset(dataset_path: str | None) -> bool:
    if not dataset_path:
        dataset_path = settings.default_training_dataset
    return "realistic_ev_battery" in dataset_path or "enhanced_ev_battery" in (dataset_path or "")


def train_battery_health_models(dataset_path: str | None = None):
    resolved = dataset_path or settings.default_training_dataset
    if HAS_ENHANCED_PIPELINE and _is_enhanced_dataset(resolved):
        return train_models_enhanced(dataset_path=dataset_path, artifact_dir=settings.model_artifact_dir)
    return train_models_standard(dataset_path=dataset_path, artifact_dir=settings.model_artifact_dir)


def get_current_model_metadata():
    return load_current_metadata(settings.model_artifact_dir)


def get_training_history():
    return load_training_history(settings.model_artifact_dir)
