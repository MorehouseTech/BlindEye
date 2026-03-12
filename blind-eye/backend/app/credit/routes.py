# Credit Score routes — Feature 3.
# GET /credit/score — returns the current weekly credit score for the logged-in business
# This calls the credit_engine service to compute the score.
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

credit_bp = Blueprint("credit", __name__)

@credit_bp.route("/score", methods=["GET"])
@jwt_required()
def get_score():
    business_id = get_jwt_identity()
    # TODO: call services/credit_engine/engine.py and return score
    return jsonify({"business_id": business_id, "score": None, "breakdown": {}}), 200
