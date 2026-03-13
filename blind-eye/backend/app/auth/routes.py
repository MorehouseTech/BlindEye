# Auth routes — simple plaintext login for MVP demo.
# No JWT, no DB. Just checks hardcoded credentials.
from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)

# Hardcoded demo accounts
DEMO_ACCOUNTS = {
    "business": {"username": "admin", "password": "123", "role": "business", "name": "Solebound Inc."},
    "user": {"username": "user", "password": "123", "role": "user", "name": "Demo User"},
}


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "")
    password = data.get("password", "")

    for account_key, account in DEMO_ACCOUNTS.items():
        if account["username"] == username and account["password"] == password:
            return jsonify({
                "success": True,
                "role": account["role"],
                "name": account["name"],
            }), 200

    return jsonify({"success": False, "error": "Invalid credentials"}), 401
