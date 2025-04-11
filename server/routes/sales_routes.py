from flask import Blueprint, request, jsonify
from extensions import db
from models import SalesData

sales_bp = Blueprint('sales', __name__)

# Existing routes
@sales_bp.route('/get_data', methods=['GET'])
def get_data():
    data = SalesData.query.all()
    result = [{'id': row.id, 'date': row.date, 'day': row.day, 'item': row.item, 'category': row.category, 
               'price': row.price, 'quantitySold': row.quantitySold, 'totalSales': row.totalSales} for row in data]
    return jsonify(result), 200

@sales_bp.route('/add_data', methods=['POST'])
def add_data():
    data = request.get_json()
    date = data.get('date')
    day = data.get('day')
    item = data.get('item')
    category = data.get('category')
    price = float(data.get('price'))  # Ensure price is a float
    quantitySold = int(data.get('quantitySold'))  # Ensure quantitySold is an integer
    totalSales = price * quantitySold

    new_data = SalesData(date=date, day=day, item=item, category=category, price=price, quantitySold=quantitySold, totalSales=totalSales)
    db.session.add(new_data)
    db.session.commit()

    return jsonify({'message': 'Sales data added successfully!'}), 201

# New route for updating data
@sales_bp.route('/update_data/<int:id>', methods=['PUT'])
def update_data(id):
    data = request.get_json()
    row = SalesData.query.get_or_404(id)

    row.date = data.get('date', row.date)
    row.day = data.get('day', row.day)
    row.item = data.get('item', row.item)
    row.category = data.get('category', row.category)
    row.price = float(data.get('price', row.price))  # Ensure price is a float
    row.quantitySold = int(data.get('quantitySold', row.quantitySold))  # Ensure quantitySold is an integer
    row.totalSales = row.price * row.quantitySold

    db.session.commit()
    return jsonify({'message': 'Sales data updated successfully!'}), 200