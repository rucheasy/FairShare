from flask import Blueprint, request, jsonify
from models.db import groups_collection
from bson import ObjectId
from datetime import datetime

groups_bp = Blueprint('groups', __name__)

def serialize_doc(doc):
    if doc:
        doc['_id'] = str(doc['_id'])
    return doc

@groups_bp.route('/create-group', methods=['POST'])
def create_group():
    data = request.json
    name = data.get('name')
    members = data.get('members', []) # List of names/objects
    
    if not name:
        return jsonify({'error': 'Group name is required'}), 400
        
    group = {
        'name': name,
        'members': members,
        'created_at': datetime.utcnow()
    }
    
    result = groups_collection.insert_one(group)
    group['_id'] = str(result.inserted_id)
    return jsonify({'message': 'Group created successfully', 'group': group}), 201

@groups_bp.route('/add-member', methods=['POST'])
def add_member():
    data = request.json
    group_id = data.get('group_id')
    member_name = data.get('member_name')
    
    if not group_id or not member_name:
        return jsonify({'error': 'group_id and member_name are required'}), 400
        
    result = groups_collection.update_one(
        {'_id': ObjectId(group_id)},
        {'$push': {'members': member_name}}
    )
    
    if result.modified_count > 0:
        return jsonify({'message': 'Member added successfully'}), 200
    return jsonify({'error': 'Group not found'}), 404

@groups_bp.route('/groups', methods=['GET'])
def get_groups():
    groups = list(groups_collection.find())
    return jsonify({'groups': [serialize_doc(g) for g in groups]}), 200

@groups_bp.route('/group/<group_id>', methods=['GET'])
def get_group(group_id):
    try:
        group = groups_collection.find_one({'_id': ObjectId(group_id)})
        if group:
            return jsonify({'group': serialize_doc(group)}), 200
        return jsonify({'error': 'Group not found'}), 404
    except Exception:
        return jsonify({'error': 'Invalid group ID'}), 400
