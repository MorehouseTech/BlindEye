# AI Visibility Test routes — Feature 4.
# POST /visibility/run — takes a search query, runs it across AI platforms, returns results
# This calls the visibility_engine service to handle the actual AI queries.
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

visibility_bp = Blueprint("visibility", __name__)

@visibility_bp.route("/run", methods=["POST"])
@jwt_required()
def run_visibility_test():
    data = request.get_json()
    query = data.get("query")
    # TODO: call services/visibility_engine/engine.py with query and return results
    return jsonify({"query": query, "results": []}), 200
