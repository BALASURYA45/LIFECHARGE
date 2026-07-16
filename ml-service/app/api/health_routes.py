from datetime import datetime, timezone

from flask import Blueprint, jsonify

from app.config.settings import settings

health_blueprint = Blueprint("health", __name__)


@health_blueprint.get("")
def health_check():
    return jsonify(
        {
            "success": True,
            "service": "lifecharge-ml-service",
            "environment": settings.flask_env,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
