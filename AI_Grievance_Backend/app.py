from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
from config import Config
from flask_jwt_extended import JWTManager
from routes.test_routes import test_bp
from routes.complaint_routes import complaint_bp
from routes.auth_routes import auth_bp
from routes.department_routes import department_bp
from routes.location_routes import location_bp
from routes.admin_map_routes import admin_map_bp
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# =========================
# Upload Configuration
# =========================

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

jwt = JWTManager(app)

mongo = PyMongo(app)

# Pass mongo to modules
import routes.test_routes as test_module
import routes.complaint_routes as complaint_module
import services.duplicate_service as duplicate_module
import routes.auth_routes as auth_module
import routes.department_routes as department_module
import routes.admin_map_routes as admin_map_module

test_module.mongo = mongo
complaint_module.mongo = mongo
duplicate_module.mongo = mongo
auth_module.mongo = mongo
department_module.mongo = mongo
admin_map_module.mongo = mongo

app.register_blueprint(test_bp)
app.register_blueprint(complaint_bp)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(department_bp, url_prefix="/admin")
app.register_blueprint(location_bp)
app.register_blueprint(admin_map_bp)

@app.route("/")
def home():
    return "AI Smart Grievance Backend Running Successfully!"

# ✅ Route to serve uploaded images
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

# =========================

if __name__ == "__main__":
    app.run(debug=True)