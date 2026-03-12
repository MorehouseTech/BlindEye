# Auth routes — register and login for businesses.
# POST /auth/register — create a new business account
# POST /auth/login — returns a JWT token on success
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db
from ..models import Business

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed = generate_password_hash(data["password"])
    business = Business(name=data["name"], email=data["email"], password_hash=hashed)
    db.session.add(business)
    db.session.commit()
    return jsonify({"message": "Registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    business = Business.query.filter_by(email=data["email"]).first()
    if not business or not check_password_hash(business.password_hash, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(identity=business.id)
    return jsonify({"token": token}), 200
