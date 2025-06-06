import os
from pathlib import Path

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'mysql+pymysql://root:siyam@localhost/meals_forecast')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '85c6ba0da1955db22ab5debce3e9be10071785b52bbf36ad88bb83bfc8842856')

    # Existing config...
    FORECAST_MODELS_DIR = Path(__file__).parent / 'models'
    MODEL_FILES = {
        'main': 'main_model.json',
        'chicken_koththu': 'Chicken Koththu_model.json',
        'egg_koththu': 'Egg Koththu_model.json',
        'fried_rice': 'Fried Rice_model.json',
        'noodles': 'Noodles_model.json',
        'veg_koththu': 'Veg Koththu_model.json'
    }