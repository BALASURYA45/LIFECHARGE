from datetime import datetime, timezone

from flask import Blueprint, jsonify  # type: ignore

from app.config.settings import settings

health_blueprint = Blueprint("health", __name__)


@health_blueprint.route("", methods=["GET"], strict_slashes=False)
@health_blueprint.route("/", methods=["GET"], strict_slashes=False)
def health_check():

    return jsonify(
        {
            "success": True,
            "status": "ok",
            "service": "lifecharge-ml-service",
            "environment": settings.flask_env,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

