from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from bson import ObjectId
import bcrypt


department_bp = Blueprint("department", __name__)

mongo = None  # will be assigned from app.py

# =========================
# Seed Department Mappings
# =========================

@department_bp.route("/seed-departments", methods=["POST"])
@jwt_required()
def seed_departments():

    claims = get_jwt()
    role = claims.get("role")

    # Allow only admin
    if role != "admin":
        return jsonify({"error": "Only admin can seed departments"}), 403

    # Default category → department mappings
    default_mappings = [
        {"category": "Water", "department_name": "Kerala Water Authority"},
        {"category": "Road", "department_name": "Public Works Department"},
        {"category": "Electricity", "department_name": "KSEB"},
        {"category": "Health", "department_name": "Health Department"},
        {"category": "Revenue", "department_name": "Revenue Office"}
    ]

    inserted_count = 0

    for mapping in default_mappings:
        existing = mongo.db.department_mappings.find_one(
            {"category": mapping["category"]}
        )
        if not existing:
            mongo.db.department_mappings.insert_one(mapping)
            inserted_count += 1

    return jsonify({
        "message": "Department mappings seeded successfully",
        "inserted_count": inserted_count
    }), 201

# =========================
# Create Officer
# =========================
@department_bp.route("/create-officer", methods=["POST"])
@jwt_required()
def create_officer():

    claims = get_jwt()
    role = claims.get("role")

    if role != "admin":
        return jsonify({"error": "Only admin can create officers"}), 403

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    department = data.get("department")
    district = data.get("district")

    if not all([name, email, password, department, district]):
        return jsonify({"error": "All fields are required"}), 400

    existing_user = mongo.db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

   

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
)

    officer = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "officer",
        "department": department,
        "district": district,
        "created_at": datetime.utcnow()
    }

    mongo.db.users.insert_one(officer)

    return jsonify({
        "message": "Officer created successfully"
    }), 201

@department_bp.route("/officers", methods=["GET"])
@jwt_required()
def get_officers():

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin allowed"}), 403

    officers = list(mongo.db.users.find({"role": "officer"}))

    for o in officers:
        o["_id"] = str(o["_id"])
        o["password"] = None   # hide password

    return jsonify({
        "officers": officers
    })
@department_bp.route("/officer/<officer_id>", methods=["DELETE"])
@jwt_required()
def delete_officer(officer_id):

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin allowed"}), 403

    mongo.db.users.delete_one({"_id": ObjectId(officer_id)})

    return jsonify({
        "message": "Officer removed successfully"
    })

# Update Officer
# =========================

@department_bp.route("/officer/<officer_id>", methods=["PUT"])
@jwt_required()
def update_officer(officer_id):

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin allowed"}), 403

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    district = data.get("district")
    department = data.get("department")

    mongo.db.users.update_one(
        {"_id": ObjectId(officer_id), "role": "officer"},
        {
            "$set": {
                "name": name,
                "email": email,
                "district": district,
                "department": department
            }
        }
    )

    return jsonify({
        "message": "Officer updated successfully"
    })

@department_bp.route("/departments", methods=["GET"])
@jwt_required()
def get_departments():

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error":"Only admin allowed"}),403

    departments = mongo.db.department_mappings.distinct("department_name")

    return jsonify({
        "departments": departments
    })

@department_bp.route("/departments", methods=["POST"])
@jwt_required()
def add_department():

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error":"Only admin allowed"}),403

    data = request.get_json()

    department = data.get("department_name")
    category = data.get("category")

    if not department or not category:
        return jsonify({"error":"department and category required"}),400

    existing = mongo.db.department_mappings.find_one({
        "department_name": department
    })

    if existing:
        return jsonify({"error":"Department already exists"}),400

    mongo.db.department_mappings.insert_one({
        "department_name": department,
        "category": category
    })

    return jsonify({
        "message":"Department created successfully"
    })

@department_bp.route("/departments/<department>", methods=["DELETE"])
@jwt_required()
def delete_department(department):

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error":"Only admin allowed"}),403

    mongo.db.department_mappings.delete_many({
        "department_name": department
    })

    return jsonify({
        "message":"Department deleted successfully"
    })