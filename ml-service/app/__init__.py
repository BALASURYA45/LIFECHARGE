import sys
from pathlib import Path

# Ensure ml-service root directory is in sys.path
_service_root = str(Path(__file__).resolve().parent.parent)
if _service_root not in sys.path:
    sys.path.insert(0, _service_root)

from flask import Flask  # type: ignore
from flask_cors import CORS  # type: ignore

from app.api.health_routes import health_blueprint
from app.api.ml_routes import ml_blueprint
from app.config.settings import settings


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.config["JSON_SORT_KEYS"] = False
    app.config["MODEL_ARTIFACT_DIR"] = settings.model_artifact_dir

    app.register_blueprint(health_blueprint, url_prefix="/api/health")
    app.register_blueprint(ml_blueprint, url_prefix="/api/ml")

    return app
