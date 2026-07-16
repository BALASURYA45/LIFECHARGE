import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]


def resolve_ml_path(path_value: str) -> str:
    path = Path(path_value)

    if path.is_absolute():
        return str(path)

    return str(BASE_DIR / path)


@dataclass(frozen=True)
class Settings:
    flask_env: str = os.getenv("FLASK_ENV", "development")
    host: str = os.getenv("ML_SERVICE_HOST", "127.0.0.1")
    port: int = int(os.getenv("ML_SERVICE_PORT", "8000"))
    model_artifact_dir: str = resolve_ml_path(os.getenv("MODEL_ARTIFACT_DIR", "app/artifacts"))
    default_training_dataset: str = resolve_ml_path(
        os.getenv("DEFAULT_TRAINING_DATASET", "app/data/sample/battery_training_sample.csv")
    )

    @property
    def is_development(self) -> bool:
        return self.flask_env == "development"


settings = Settings()
