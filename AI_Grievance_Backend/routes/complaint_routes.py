from flask import Blueprint, request, jsonify
from datetime import datetime
from services.ml_service import predict_complaint
from services.duplicate_service import check_duplicate_and_escalate
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from werkzeug.utils import secure_filename
from data.kerala_locations import districts, local_bodies, district_coordinates
from services.geocoding_service import get_coordinates
import os

complaint_bp = Blueprint("complaint", __name__)
location_bp = Blueprint("locations", __name__)

mongo = None


def get_departments_from_categories(categories):
    departments = []

    for category in categories:
        mapping = mongo.db.department_mappings.find_one(
            {"category": category}
        )

        if mapping:
            departments.append({
                "name": mapping["department_name"],
                "status": "Assigned"
            })

    return departments


@complaint_bp.route("/submit-complaint", methods=["POST"])
@jwt_required()
def submit_complaint():

    current_user = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")

    if role != "citizen":
        return jsonify({
            "error": "Only citizens are allowed to submit complaints"
        }), 403

    # =========================
    # Get form data
    # =========================
    complaint_text = request.form.get("complaint_text")
    district = request.form.get("district").title()
    local_body_type = request.form.get("local_body_type")
    local_body = request.form.get("local_body").title()
    ward = request.form.get("ward")
    address = request.form.get("address")

    # =========================
    # Get coordinates
    # =========================
    location_query = f"{address}, {local_body}, {district}, Kerala, India"
    lat, lng = get_coordinates(location_query)

    if not lat or not lng:
        lat, lng = get_coordinates(f"{local_body}, {district}, Kerala, India")

    if not complaint_text:
        return jsonify({"error": "Complaint text is required"}), 400

    # =========================
    # Handle image upload
    # =========================
    file = request.files.get("image")
    image_path = None

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join("uploads", filename)
        file.save(file_path)
        image_path = file_path

    # =========================
    # TEXT PREPROCESS
    # =========================
    text = complaint_text.lower()


    electricity_keywords = [
        "electricity","power","current","voltage","transformer",
        "electric line","power cut","power failure","kseb","electric pole"
    ]

    water_keywords = [
        "water","pipe","tap","leak","leaking","pipeline","pipeline burst","pipe burst",
        "drinking water","water supply","water authority","kwa",
    ]

    road_keywords = [
        "road","pothole","hole","road damage","road broken",
        "road repair","bad road","damaged road"
    ]

    waste_keywords = [
        "garbage","waste","trash","waste collection",
        "garbage truck","waste management"
    ]

    streetlight_keywords = [
        "streetlight","street light","light not working",
        "broken street light","lamp post"
    ]

    animal_keywords = [
        "dog","street dog","stray dog","dog attack","dogs attacking"
    ]

    prediction = None

    categories = []
    priority = 50

    # Electricity
    for word in electricity_keywords:
        if word in text:
            categories.append("Electricity")
            priority = max(priority, 80)

    # Water
    for word in water_keywords:
        if word in text:
            categories.append("Water")
            priority = max(priority, 70)

    # Road
    for word in road_keywords:
        if word in text:
            categories.append("Road")
            priority = max(priority, 70)

    # Waste
    for word in waste_keywords:
        if word in text:
            categories.append("Waste")
            priority = max(priority, 65)

    # Streetlight
    for word in streetlight_keywords:
        if word in text:
            categories.append("Streetlight")
            priority = max(priority, 60)

    # Animal
    for word in animal_keywords:
        if word in text:
            categories.append("Animal")
            priority = max(priority, 70)

    categories = list(set(categories))

    if categories:
        prediction = {
            "predicted_categories": categories,
            "predicted_priority": priority
        }

    # fallback to AI model
    if not prediction:
        prediction = predict_complaint(text)

    print("Predicted Categories:", prediction["predicted_categories"])

    # =========================
    # Duplicate Detection
    # =========================
    duplicate_info = check_duplicate_and_escalate(
        text,
        prediction["predicted_priority"]
    )

    # =========================
    # Department Mapping
    # =========================
    departments = get_departments_from_categories(
        prediction["predicted_categories"]
    )

    overall_status = "Assigned" if departments else "Pending"

    complaint = {
    "user_id": current_user,
    "complaint_text": complaint_text,
    "district": district,
    "local_body": local_body,
    "ward": ward,
    "address": address,
    "lat": lat,
    "lng": lng,

    "predicted_categories": prediction["predicted_categories"],
    "predicted_priority": prediction["predicted_priority"],
    "final_priority": duplicate_info["final_priority"],

    "is_duplicate": duplicate_info["is_duplicate"],
    "duplicate_count": duplicate_info["duplicate_count"],

    "overall_status": "Assigned",

    "image_path": image_path,
    "created_at": datetime.utcnow()
}

    result = mongo.db.complaints.insert_one(complaint)
    complaint_id = result.inserted_id

    for dept in departments:

        mongo.db.assignments.insert_one({
            "complaint_id": complaint_id,
            "department": dept["name"],
            "district": district,
            "status": "Assigned",
            "assigned_at": datetime.utcnow()
        })

        # ADD TIMELINE LOG FOR INITIAL ASSIGNMENT
        mongo.db.complaint_logs.insert_one({
            "complaint_id": complaint_id,
            "department": dept["name"],
            "old_status": "Submitted",
            "new_status": "Assigned",
            "timestamp": datetime.utcnow()
        })
    

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint_id": str(result.inserted_id),
        "ai_prediction": prediction,
        "duplicate_info": duplicate_info
    }), 201

@complaint_bp.route("/officer/complaints", methods=["GET"])
@jwt_required()
def get_officer_complaints():

    claims = get_jwt()
    role = claims.get("role")

    # Only officers allowed
    if role != "officer":
        return jsonify({"error": "Only officers can access this route"}), 403

    officer_department = claims.get("department")
    officer_district = claims.get("district")

    if not officer_department or not officer_district:
        return jsonify({"error": "Officer department or district missing"}), 400

    assignments = list(mongo.db.assignments.find({
        "department": officer_department,
        "district": officer_district
    }))

    results = []

    for a in assignments:

        complaint = mongo.db.complaints.find_one({
            "_id": a["complaint_id"]
        })

        if not complaint:
            continue

        results.append({
            "_id": str(a["_id"]),
            "complaint_id": str(complaint["_id"]),
            "complaint_text": complaint["complaint_text"],
            "district": complaint["district"],
            "final_priority": complaint.get("final_priority"),
            "status": a["status"]
        })

    return jsonify({
        "count": len(results),
        "complaints": results
    }), 200

@complaint_bp.route("/officer/update-status/<assignment_id>", methods=["PUT"])
@jwt_required()
def update_assignment_status(assignment_id):

    claims = get_jwt()

    if claims.get("role") != "officer":
        return jsonify({"error": "Only officers can update status"}), 403

    officer_department = claims.get("department")
    officer_district = claims.get("district")

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["Assigned", "In Progress", "Resolved"]:
        return jsonify({"error": "Invalid status"}), 400

    assignment = mongo.db.assignments.find_one({
        "_id": ObjectId(assignment_id)
    })

    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404

    if assignment["department"] != officer_department:
        return jsonify({"error": "Not authorized for this department"}), 403

    mongo.db.assignments.update_one(
        {"_id": ObjectId(assignment_id)},
        {"$set": {"status": new_status}}
    )

    # ADD TIMELINE LOG

    mongo.db.complaint_logs.insert_one({
        "complaint_id": assignment["complaint_id"],
        "department": assignment["department"],
        "old_status": assignment["status"],
        "new_status": new_status,
        "timestamp": datetime.utcnow()
    })

    # recalculate complaint overall status
    complaint_id = assignment["complaint_id"]

    assignments = list(mongo.db.assignments.find({
        "complaint_id": complaint_id
    }))

    statuses = [a["status"] for a in assignments]

    if all(s == "Resolved" for s in statuses):
        overall_status = "Resolved"
    elif any(s == "In Progress" for s in statuses):
        overall_status = "In Progress"
    else:
        overall_status = "Assigned"

    mongo.db.complaints.update_one(
        {"_id": complaint_id},
        {"$set": {"overall_status": overall_status}}
    )

    return jsonify({
        "message": "Status updated successfully",
        "overall_status": overall_status
    }), 200

@complaint_bp.route("/admin/complaints", methods=["GET"])
@jwt_required()
def get_all_complaints_admin():

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin can access this route"}), 403

    # Query Parameters
    district = request.args.get("district")
    local_body = request.args.get("local_body")
    ward = request.args.get("ward")
    department = request.args.get("department")
    status = request.args.get("status")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))

    skip = (page - 1) * limit

    query = {}

    if district:
        query["district"] = district
    
    if local_body:
        query["local_body"] = local_body
    
    if ward:
        query["ward"] = ward

    if department:
        complaint_ids = mongo.db.assignments.distinct(
            "complaint_id",
            {"department": department}
        )

        query["_id"] = {"$in": complaint_ids}

    if status:
        query["overall_status"] = status

    total_count = mongo.db.complaints.count_documents(query)

    complaints_cursor = mongo.db.complaints.find(query) \
        .sort("final_priority", -1) \
        .skip(skip) \
        .limit(limit)

    complaints = list(complaints_cursor)

    for complaint in complaints:
        complaint["_id"] = str(complaint["_id"])

    return jsonify({
        "total_count": total_count,
        "current_page": page,
        "total_pages": (total_count + limit - 1) // limit,
        "complaints": complaints
    }), 200

@complaint_bp.route("/admin/analytics/overview", methods=["GET"])
@jwt_required()
def admin_overview_analytics():

    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin can access analytics"}), 403

    district = request.args.get("district")

    query = {}

    if district:
        query["district"] = district

    total = mongo.db.complaints.count_documents(query)

    assigned = mongo.db.complaints.count_documents(
        {**query, "overall_status": "Assigned"}
    )

    in_progress = mongo.db.complaints.count_documents(
        {**query, "overall_status": "In Progress"}
    )

    resolved = mongo.db.complaints.count_documents(
        {**query, "overall_status": "Resolved"}
    )

    duplicate_count = mongo.db.complaints.count_documents(
        {**query, "is_duplicate": True}
    )

    # =========================
    # Average Priority
    # =========================

    complaints = list(
        mongo.db.complaints.find(query, {"final_priority": 1})
    )

    if complaints:
        total_priority = sum(c.get("final_priority", 0) for c in complaints)
        average_priority = round(total_priority / len(complaints), 1)
    else:
        average_priority = 0

    return jsonify({
        "total_complaints": total,
        "assigned": assigned,
        "in_progress": in_progress,
        "resolved": resolved,
        "duplicate_complaints": duplicate_count,
        "average_priority": average_priority
    })

@complaint_bp.route("/admin/analytics/by-district", methods=["GET"])
@jwt_required()
def complaints_by_district():

    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin can access analytics"}), 403

    pipeline = [
        {
            "$group": {
                "_id": "$district",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"count": -1}
        }
    ]

    result = list(mongo.db.complaints.aggregate(pipeline))

    return jsonify({
        "district_analysis": result
    }), 200

@complaint_bp.route("/admin/analytics/by-department", methods=["GET"])
@jwt_required()
def complaints_by_department():

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin can access analytics"}), 403

    district = request.args.get("district")

    pipeline = []

    # Apply district filter
    if district:
        pipeline.append({
            "$match": {"district": district}
        })

    pipeline.extend([
        {
            "$group": {
                "_id": "$department",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"count": -1}
        }
    ])

    result = list(mongo.db.assignments.aggregate(pipeline))

    return jsonify({
        "department_analysis": result
    })

@complaint_bp.route("/complaint/<complaint_id>/timeline", methods=["GET"])
@jwt_required()
def complaint_timeline(complaint_id):

    logs = list(mongo.db.complaint_logs.find({
        "complaint_id": ObjectId(complaint_id)
    }).sort("timestamp", 1))

    for log in logs:
        log["_id"] = str(log["_id"])
        log["complaint_id"] = str(log["complaint_id"])

    return jsonify({
        "timeline": logs
    }), 200

@complaint_bp.route("/citizen/complaints", methods=["GET"])
@jwt_required()
def get_citizen_complaints():

    user_id = get_jwt_identity()

    complaints = list(
    mongo.db.complaints.find({
        "user_id": user_id
    }).sort("created_at", -1)
)
    for c in complaints:
        c["_id"] = str(c["_id"])

    return jsonify({
        "complaints": complaints
    }), 200

@complaint_bp.route("/admin/complaint/<complaint_id>", methods=["GET"])
@jwt_required()
def get_complaint_by_id(complaint_id):

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin allowed"}), 403

    complaint = mongo.db.complaints.find_one({
        "_id": ObjectId(complaint_id)
    })

    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    complaint["_id"] = str(complaint["_id"])

    # fetch departments handling this complaint
    assignments = list(mongo.db.assignments.find({
        "complaint_id": ObjectId(complaint_id)
    }))

    departments = []

    for a in assignments:
        departments.append({
            "name": a["department"],
            "status": a["status"]
        })

    complaint["departments"] = departments

    return jsonify(complaint), 200

@complaint_bp.route("/admin/complaints/map", methods=["GET"])
@jwt_required()
def get_complaints_map():

    complaints = list(mongo.db.complaints.find())

    results = []

    for c in complaints:

        lat = c.get("lat")
        lng = c.get("lng")

        # If complaint has no coordinates, use district center
        if not lat or not lng:
            district = c.get("district")
            coords = district_coordinates.get(district)

            if coords:
                lat = coords[0]
                lng = coords[1]
            else:
                continue

        results.append({
            "complaint_id": str(c["_id"]),
            "district": c.get("district"),
            "local_body": c.get("local_body"),
            "ward": c.get("ward"),
            "address": c.get("address"), 
            "complaint_text": c.get("complaint_text"),
            "priority": c.get("final_priority"),
            "status": c.get("overall_status"),
            "duplicate_count": c.get("duplicate_count", 0),
            "lat": lat,
            "lng": lng
        })

    return jsonify(results)


@location_bp.route("/locations/districts", methods=["GET"])
def get_districts():
    return jsonify(districts)


@location_bp.route("/locations/local-bodies/<district>/<body_type>", methods=["GET"])
def get_local_bodies(district, body_type):

    if district not in local_bodies:
        return jsonify([])

    bodies = local_bodies[district].get(body_type, [])

    return jsonify(bodies)



@complaint_bp.route("/admin/analytics/trend", methods=["GET"])
@jwt_required()
def complaints_trend():

    claims = get_jwt()

    if claims.get("role") != "admin":
        return jsonify({"error": "Only admin allowed"}), 403

    district = request.args.get("district")

    match_stage = {}

    if district:
        match_stage["district"] = district

    pipeline = []

    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.extend([
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ])

    result = list(mongo.db.complaints.aggregate(pipeline))

    trend = []

    for r in result:
        trend.append({
            "year": r["_id"]["year"],
            "month": r["_id"]["month"],
            "count": r["count"]
        })

    return jsonify({"trend": trend})

@complaint_bp.route("/officer/complaint/<complaint_id>", methods=["GET"])
@jwt_required()
def get_complaint_for_officer(complaint_id):

    claims = get_jwt()

    if claims.get("role") != "officer":
        return jsonify({"error": "Only officers allowed"}), 403

    complaint = mongo.db.complaints.find_one({
        "_id": ObjectId(complaint_id)
    })

    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    complaint["_id"] = str(complaint["_id"])

    # fetch departments handling this complaint
    assignments = list(mongo.db.assignments.find({
        "complaint_id": ObjectId(complaint_id)
    }))

    departments = []

    for a in assignments:
        departments.append({
            "name": a["department"],
            "status": a["status"]
        })

    complaint["departments"] = departments

    return jsonify(complaint), 200
