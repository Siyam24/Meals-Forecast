from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    role = data.get('role')
    password = data.get('password')
    confirmPassword = data.get('confirmPassword')

    if password != confirmPassword:
        return jsonify({'error': 'Passwords do not match!'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists!'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered!'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, role=role, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401  

    # Only pass the user ID as a string to avoid the "Subject must be a string" error
    access_token = create_access_token(identity=str(user.id))  # Pass the user ID as a string
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'username': user.username,
        'email': user.email,
        'role': user.role
    }), 200

@auth_bp.route('/user/details', methods=['GET'])
@jwt_required()
def get_user_details():
    user_id = get_jwt_identity()  # This will now be the user ID
    user = User.query.get(user_id)  # Fetch user from the database by ID
    if user:
        return jsonify({
            'username': user.username,
            'email': user.email,
            'role': user.role
        }), 200
    else:
        return jsonify({'error': 'User not found'}), 404
