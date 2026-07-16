import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    flask_env: str = os.getenv("FLASK_ENV", "development")
    host: str = os.getenv("ML_SERVICE_HOST", "127.0.0.1")
    port: int = int(os.getenv("ML_SERVICE_PORT", "8000"))
    model_artifact_dir: str = os.getenv("MODEL_ARTIFACT_DIR", "app/artifacts")

    @property
    def is_development(self) -> bool:
        return self.flask_env == "development"


settings = Settings()
