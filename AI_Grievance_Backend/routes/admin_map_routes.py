from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

admin_map_bp = Blueprint("admin_map", __name__)

# temporary coordinates
district_coordinates = {
 "Thiruvananthapuram":[8.5241,76.9366],
 "Kollam":[8.8932,76.6141],
 "Pathanamthitta":[9.2648,76.7870],
 "Alappuzha":[9.4981,76.3388],
 "Kottayam":[9.5916,76.5222],
 "Idukki":[9.8490,76.9720],
 "Ernakulam":[9.9816,76.2999],
 "Thrissur":[10.5276,76.2144],
 "Palakkad":[10.7867,76.6548],
 "Malappuram":[11.0510,76.0711],
 "Kozhikode":[11.2588,75.7804],
 "Wayanad":[11.6854,76.1320],
 "Kannur":[11.8745,75.3704],
 "Kasaragod":[12.4996,74.9869]
}

mongo = None  # will be injected from app.py


@admin_map_bp.route("/admin/complaints/map", methods=["GET"])
def get_complaints_map():

    complaints = list(mongo.db.complaints.find())

    results = []

    for c in complaints:

        lat = c.get("lat")
        lng = c.get("lng")

        # skip old complaints that don't have coordinates
        if not lat or not lng:
            continue

        results.append({
        "complaint_id": str(c["_id"]),
        "district": c.get("district"),

        "local_body": c.get("local_body", "Unknown Area"),
        "ward": c.get("ward", "N/A"),

        "complaint_text": c.get("complaint_text") or c.get("text"),

        "priority": c.get("final_priority") or c.get("priority"),
        "status": c.get("overall_status") or c.get("status"),

        "lat": lat,
        "lng": lng
})

    return jsonify(results)