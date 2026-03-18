from flask import Blueprint, jsonify
from data.kerala_locations import districts, local_bodies

location_bp = Blueprint("location", __name__)

# Get all districts
@location_bp.route("/locations/districts", methods=["GET"])
def get_districts():
    return jsonify(districts)


# Get local bodies by district + type
@location_bp.route("/locations/local-bodies/<district>/<body_type>")
def get_local_bodies(district, body_type):

    if district not in local_bodies:
        return jsonify([])

    # convert frontend names to dataset keys
    if body_type == "Panchayat":
        body_type = "Grama Panchayath"

    bodies = local_bodies[district].get(body_type, [])

    return jsonify(bodies)