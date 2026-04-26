from flask import Blueprint, request, jsonify
from models.db import expenses_collection, groups_collection
from utils.settlement import minimize_transactions
from utils.pdf_generator import generate_expense_report
from bson import ObjectId
from datetime import datetime
from flask import send_file

expenses_bp = Blueprint('expenses', __name__)

def serialize_doc(doc):
    if doc:
        doc['_id'] = str(doc['_id'])
        if 'group_id' in doc:
            doc['group_id'] = str(doc['group_id'])
    return doc

@expenses_bp.route('/add-expense', methods=['POST'])
def add_expense():
    data = request.json
    group_id = data.get('group_id')
    paid_by = data.get('paid_by')
    amount = data.get('amount')
    split_between = data.get('split_between')
    description = data.get('description', 'Expense')
    category = data.get('category', 'Misc')
    
    if not all([group_id, paid_by, amount, split_between]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    expense = {
        'group_id': ObjectId(group_id),
        'paid_by': paid_by,
        'amount': float(amount),
        'split_between': split_between,
        'description': description,
        'category': category,
        'date': datetime.utcnow()
    }
    
    result = expenses_collection.insert_one(expense)
    expense['_id'] = str(result.inserted_id)
    expense['group_id'] = str(expense['group_id'])
    
    return jsonify({'message': 'Expense added successfully', 'expense': expense}), 201

@expenses_bp.route('/group/<group_id>/expenses', methods=['GET'])
def get_group_expenses(group_id):
    try:
        expenses = list(expenses_collection.find({'group_id': ObjectId(group_id)}).sort('date', -1))
        return jsonify({'expenses': [serialize_doc(e) for e in expenses]}), 200
    except Exception:
        return jsonify({'error': 'Invalid group ID'}), 400

@expenses_bp.route('/balances/<group_id>', methods=['GET'])
def get_balances(group_id):
    try:
        expenses = list(expenses_collection.find({'group_id': ObjectId(group_id)}))
        
        # Serialize for the settlement function which expects string inputs for user IDs/names
        formatted_expenses = []
        for e in expenses:
            formatted_expenses.append({
                'paid_by': e['paid_by'],
                'amount': e['amount'],
                'split_between': e['split_between']
            })
            
        transactions = minimize_transactions(formatted_expenses)
        return jsonify({'settlements': transactions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@expenses_bp.route('/settle', methods=['POST'])
def settle():
    data = request.json
    group_id = data.get('group_id')
    from_user = data.get('from')
    to_user = data.get('to')
    amount = data.get('amount')
    
    if not all([group_id, from_user, to_user, amount]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    # Create a settlement expense (A pays B)
    expense = {
        'group_id': ObjectId(group_id),
        'paid_by': from_user,
        'amount': float(amount),
        'split_between': [to_user],
        'description': 'Settlement',
        'category': 'Settlement',
        'date': datetime.utcnow(),
        'is_settlement': True
    }
    
    result = expenses_collection.insert_one(expense)
    return jsonify({'message': 'Settlement recorded successfully'}), 201

@expenses_bp.route('/export/<group_id>', methods=['GET'])
def export_report(group_id):
    try:
        group = groups_collection.find_one({'_id': ObjectId(group_id)})
        expenses = list(expenses_collection.find({'group_id': ObjectId(group_id)}).sort('date', 1))
        
        # Calculate settlements
        formatted_expenses = []
        for e in expenses:
            formatted_expenses.append({
                'paid_by': e['paid_by'],
                'amount': e['amount'],
                'split_between': e['split_between']
            })
        settlements = minimize_transactions(formatted_expenses)
        
        pdf_buffer = generate_expense_report(group, expenses, settlements)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"{group['name'].replace(' ', '_')}_report.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400
