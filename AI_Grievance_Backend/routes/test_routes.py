from flask import Blueprint, jsonify
from flask_pymongo import PyMongo

test_bp = Blueprint("test", __name__)

mongo = None  # Will be assigned from app

@test_bp.route("/test-db")
def test_db():
    mongo.db.test_collection.insert_one({"message": "MongoDB Atlas Connected Successfully"})
    return jsonify({"message": "Data inserted into MongoDB Atlas!"})