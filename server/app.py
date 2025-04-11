from flask import Flask
from config import Config
from extensions import db, jwt
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.sales_routes import sales_bp
from routes.calendar_routes import calendar_bp
from routes.inventory_routes import inventory_bp
from routes.report_routes import report_bp

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt.init_app(app)

# Enhanced CORS configuration
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:5173"],  # Fixed typo: "origins" (not "origins")
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "User-Id"],  # Add "User-Id"
             "supports_credentials": True,
             "expose_headers": ["Content-Disposition"]
         }
     })

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(sales_bp, url_prefix='/sales')
app.register_blueprint(calendar_bp, url_prefix='/calendar')
app.register_blueprint(inventory_bp, url_prefix='/inventory')
app.register_blueprint(report_bp, url_prefix='/reports')

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)