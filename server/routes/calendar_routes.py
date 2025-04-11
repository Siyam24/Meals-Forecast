from flask import Blueprint, request, jsonify
from extensions import db
from models import CalendarEvent

calendar_bp = Blueprint('calendar', __name__)

# Get all events
@calendar_bp.route('/events', methods=['GET'])
def get_events():
    events = CalendarEvent.query.all()
    result = [{'id': e.id, 'title': e.title, 'start': e.start, 'end': e.end} for e in events]
    return jsonify(result), 200

# Add a new event
@calendar_bp.route('/events', methods=['POST'])
def add_event():
    data = request.get_json()
    new_event = CalendarEvent(title=data['title'], start=data['start'], end=data['end'])
    db.session.add(new_event)
    db.session.commit()
    return jsonify({'message': 'Event added successfully!', 'id': new_event.id}), 201

# Update an event by ID
@calendar_bp.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    event = CalendarEvent.query.get(event_id)  # Changed to support Flask-SQLAlchemy 1.x
    if not event:
        return jsonify({'error': 'Event not found!'}), 404

    data = request.get_json()
    event.title = data.get('title', event.title)
    event.start = data.get('start', event.start)
    event.end = data.get('end', event.end)

    db.session.commit()
    return jsonify({'message': 'Event updated successfully!'}), 200

# Delete an event by ID
@calendar_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    event = CalendarEvent.query.get(event_id)  # Changed to support Flask-SQLAlchemy 1.x
    if not event:
        return jsonify({'error': 'Event not found!'}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully!'}), 200
