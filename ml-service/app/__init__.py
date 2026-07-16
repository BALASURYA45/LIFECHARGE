from flask import Flask
from flask_cors import CORS

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
