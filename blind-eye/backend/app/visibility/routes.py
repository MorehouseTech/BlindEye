# AI Visibility Test routes — Feature 4.
# POST /visibility/run — takes a business_id and product_id, runs the full
# visibility pipeline across AI platforms, returns scored results.
import sys
import os

# Add services/ to the Python path so the engine can be imported directly.
# Works both locally (../../../services) and in Docker (/app/services).
_services_local = os.path.join(os.path.dirname(__file__), "..", "..", "..", "services")
_services_docker = "/app/services"
for _p in (_services_local, _services_docker):
    _resolved = os.path.realpath(_p)
    if _resolved not in sys.path:
        sys.path.insert(0, _resolved)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

visibility_bp = Blueprint("visibility", __name__)


@visibility_bp.route("/run", methods=["POST"])
@jwt_required()
def run_visibility_test():
    data = request.get_json() or {}

    business_id = data.get("business_id")
    product_id = data.get("product_id")

    if not business_id or not product_id:
        return jsonify({"error": "business_id and product_id are required"}), 400

    try:
        from visibility_engine.engine import run_visibility_test as run_test
        result = run_test(int(business_id), int(product_id))
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Visibility test failed: {exc}"}), 500
