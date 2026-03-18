from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

mongo = None  # will be assigned from app.py


# -----------------------------
# REGISTER USER
# -----------------------------
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    required_fields = ["name", "email", "password", "role"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Check if user already exists
    existing_user = mongo.db.users.find_one({"email": data["email"]})
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password,
        "role": data["role"],
        "department": data.get("department", None),
        "district": data.get("district", None)
    }

    mongo.db.users.insert_one(user)

    return jsonify({"message": "User registered successfully"}), 201


# -----------------------------
# LOGIN USER
# -----------------------------
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    if "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password required"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user["password"]
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    # Create JWT token
    access_token = create_access_token(
    identity=str(user["_id"]),
    additional_claims={
        "role": user["role"],
        "department": user.get("department"),
        "district": user.get("district")
    },
    expires_delta=timedelta(hours=2)
)

    return jsonify({
    "message": "Login successful",
    "access_token": access_token,
    "role": user["role"],
    "user": {
        "name": user["name"],
        "department": user.get("department"),
        "district": user.get("district")
    }
}), 200