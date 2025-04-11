from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# ✅ Update with your MySQL credentials
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:siyam@localhost/meals_forecast'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)