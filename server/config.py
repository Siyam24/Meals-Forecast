import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'mysql+pymysql://root:siyam@localhost/meals_forecast')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '85c6ba0da1955db22ab5debce3e9be10071785b52bbf36ad88bb83bfc8842856')

