from flask import Blueprint, request, jsonify
from extensions import db
from models import Inventory

inventory_bp = Blueprint('inventory', __name__)

# Get all inventory items
@inventory_bp.route('/get_inventory', methods=['GET'])
def get_inventory():
    items = Inventory.query.all()
    result = [
        {'id': item.id, 'name': item.name, 'quantity': item.quantity, 
         'threshold': item.threshold, 'unit': item.unit} 
        for item in items
    ]
    return jsonify(result), 200

# Add a new item
@inventory_bp.route('/add_item', methods=['POST'])
def add_item():
    data = request.get_json()
    name = data.get('name')
    quantity = int(data.get('quantity', 0))
    threshold = int(data.get('threshold', 5))
    unit = data.get('unit', "")

    if not name or quantity < 0:
        return jsonify({'error': 'Invalid item details'}), 400

    new_item = Inventory(name=name, quantity=quantity, threshold=threshold, unit=unit)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'Item added successfully!'}), 201

# Update item quantity
@inventory_bp.route('/update_quantity/<int:id>', methods=['PUT'])
def update_quantity(id):
    data = request.get_json()
    item = Inventory.query.get_or_404(id)

    new_quantity = int(data.get('quantity', item.quantity))
    if new_quantity < 0:
        return jsonify({'error': 'Quantity cannot be negative'}), 400

    item.quantity = new_quantity
    db.session.commit()
    return jsonify({'message': 'Quantity updated successfully!'}), 200

# Delete an item
@inventory_bp.route('/delete_item/<int:id>', methods=['DELETE'])
def delete_item(id):
    item = Inventory.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully!'}), 200

# Check low stock items
@inventory_bp.route('/low_stock', methods=['GET'])
def check_low_stock():
    low_stock_items = Inventory.query.filter(Inventory.quantity <= Inventory.threshold).all()
    
    if not low_stock_items:
        return jsonify({'message': 'No low stock items'}), 200

    result = [{'id': item.id, 'name': item.name, 'quantity': item.quantity, 'threshold': item.threshold, 'unit': item.unit} 
              for item in low_stock_items]

    return jsonify({'low_stock': result}), 200
