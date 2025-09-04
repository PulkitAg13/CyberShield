from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sqlite3
import os
from datetime import datetime
import numpy as np
from werkzeug.utils import secure_filename

# Import your database functions
from api import (
    setup_database, 
    insert_fraudulent_transactions, 
    get_fraudulent_transactions, 
    get_processing_logs
)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_fraud(df):
    """
    Simple fraud detection logic - replace with your ML model
    This is a basic rule-based approach for demonstration
    """
    fraudulent_transactions = []
    
    for _, row in df.iterrows():
        fraud_score = 0
        
        # Rule 1: Large amount transfers
        if row.get('type') == 'TRANSFER' and row.get('amount', 0) > 100000:
            fraud_score += 30
            
        # Rule 2: Cash out with high amounts
        if row.get('type') == 'CASH_OUT' and row.get('amount', 0) > 50000:
            fraud_score += 25
            
        # Rule 3: Balance inconsistencies
        if (row.get('oldbalanceOrg', 0) - row.get('amount', 0)) != row.get('newbalanceOrig', 0):
            fraud_score += 40
            
        # Rule 4: Zero destination balance after receiving money
        if row.get('type') in ['TRANSFER', 'CASH_IN'] and row.get('newbalanceDest', 0) == 0:
            fraud_score += 35
            
        # Mark as fraud if score > 50
        if fraud_score > 50:
            transaction_dict = row.to_dict()
            transaction_dict['isFlaggedFraud'] = 1
            transaction_dict['prediction_confidence'] = min(fraud_score, 100)
            fraudulent_transactions.append(transaction_dict)
    
    return fraudulent_transactions

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload CSV or Excel files.'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read the file
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(filepath)
            else:
                df = pd.read_excel(filepath)
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
        
        # Validate required columns
        required_columns = ['step', 'type', 'amount', 'oldbalanceOrg', 'newbalanceOrig']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing required columns: {missing_columns}'}), 400
        
        # Run fraud detection
        fraudulent_transactions = detect_fraud(df)
        
        # Prepare data for database insertion
        transaction_data = {
            'fraudulent_data': fraudulent_transactions,
            'total_transactions': len(df)
        }
        
        # Insert into database
        insert_fraudulent_transactions(transaction_data, filename)
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'message': 'File processed successfully',
            'total_transactions': len(df),
            'fraudulent_count': len(fraudulent_transactions),
            'fraud_rate': f"{(len(fraudulent_transactions) / len(df) * 100):.2f}%",
            'preview_data': df.head(10).to_dict('records')  # First 10 rows for preview
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/fraud-transactions', methods=['GET'])
def get_fraud_transactions():
    try:
        limit = request.args.get('limit', 100, type=int)
        transactions = get_fraudulent_transactions(limit)
        return jsonify(transactions)
    except Exception as e:
        return jsonify({'error': f'Error fetching transactions: {str(e)}'}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        limit = request.args.get('limit', 10, type=int)
        logs = get_processing_logs(limit)
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': f'Error fetching logs: {str(e)}'}), 500

@app.route('/api/fraud-stats', methods=['GET'])
def get_fraud_statistics():
    try:
        # Get all fraudulent transactions for statistics
        transactions = get_fraudulent_transactions(1000)
        
        if not transactions:
            return jsonify({
                'fraudByStep': [],
                'fraudByType': [],
                'amountRanges': [],
                'totalFraud': 0,
                'totalAmount': 0
            })
        
        df = pd.DataFrame(transactions)
        
        # Fraud by step
        fraud_by_step = df.groupby('step').agg({
            'id': 'count',
            'amount': 'sum'
        }).reset_index()
        fraud_by_step.columns = ['step', 'fraudCount', 'totalAmount']
        fraud_by_step['totalTransactions'] = fraud_by_step['fraudCount'] * 2  # Estimate
        
        # Fraud by type
        fraud_by_type = df.groupby('type').agg({
            'id': 'count',
            'amount': 'sum'
        }).reset_index()
        fraud_by_type.columns = ['type', 'count', 'amount']
        
        # Amount ranges
        def categorize_amount(amount):
            if amount < 1000:
                return '0-1K'
            elif amount < 10000:
                return '1K-10K'
            elif amount < 50000:
                return '10K-50K'
            elif amount < 100000:
                return '50K-100K'
            else:
                return '100K+'
        
        df['amount_range'] = df['amount'].apply(categorize_amount)
        amount_ranges = df.groupby('amount_range').agg({
            'id': 'count',
            'prediction_confidence': 'mean'
        }).reset_index()
        amount_ranges.columns = ['range', 'count', 'avgRisk']
        
        return jsonify({
            'fraudByStep': fraud_by_step.to_dict('records'),
            'fraudByType': fraud_by_type.to_dict('records'),
            'amountRanges': amount_ranges.to_dict('records'),
            'totalFraud': len(transactions),
            'totalAmount': df['amount'].sum()
        })
        
    except Exception as e:
        return jsonify({'error': f'Error generating statistics: {str(e)}'}), 500

@app.route('/api/fraud-geo-data', methods=['GET'])
def get_fraud_geo_data():
    try:
        # Get all fraudulent transactions for geo mapping
        transactions = get_fraudulent_transactions(1000)
        
        if not transactions:
            return jsonify([])
        
        # Madhya Pradesh cities with coordinates
        mp_cities = {
            'Bhopal': {'lat': 23.2599, 'lng': 77.4126, 'district': 'Bhopal'},
            'Indore': {'lat': 22.7196, 'lng': 75.8577, 'district': 'Indore'},
            'Jabalpur': {'lat': 23.1815, 'lng': 79.9864, 'district': 'Jabalpur'},
            'Gwalior': {'lat': 26.2183, 'lng': 78.1828, 'district': 'Gwalior'},
            'Ujjain': {'lat': 23.1765, 'lng': 75.7885, 'district': 'Ujjain'},
            'Sagar': {'lat': 23.8388, 'lng': 78.7378, 'district': 'Sagar'},
            'Dewas': {'lat': 22.9676, 'lng': 76.0534, 'district': 'Dewas'},
            'Satna': {'lat': 24.5670, 'lng': 80.8320, 'district': 'Satna'},
            'Ratlam': {'lat': 23.3315, 'lng': 75.0367, 'district': 'Ratlam'},
            'Rewa': {'lat': 24.5364, 'lng': 81.2964, 'district': 'Rewa'},
            'Singrauli': {'lat': 24.1992, 'lng': 82.6739, 'district': 'Singrauli'},
            'Burhanpur': {'lat': 21.3009, 'lng': 76.2291, 'district': 'Burhanpur'},
            'Khandwa': {'lat': 21.8343, 'lng': 76.3569, 'district': 'Khandwa'},
            'Bhind': {'lat': 26.5653, 'lng': 78.7875, 'district': 'Bhind'},
            'Chhindwara': {'lat': 22.0572, 'lng': 78.9315, 'district': 'Chhindwara'},
            'Guna': {'lat': 24.6537, 'lng': 77.3112, 'district': 'Guna'},
            'Shivpuri': {'lat': 25.4244, 'lng': 77.6581, 'district': 'Shivpuri'},
            'Vidisha': {'lat': 23.5251, 'lng': 77.8081, 'district': 'Vidisha'},
            'Chhatarpur': {'lat': 24.9178, 'lng': 79.5941, 'district': 'Chhatarpur'}
        }
        
        # Group transactions by simulated cities
        city_keys = list(mp_cities.keys())
        grouped_data = {}
        
        for i, transaction in enumerate(transactions):
            # Simulate city assignment based on transaction characteristics
            city_index = abs(
                (transaction.get('id', i)) + 
                int(transaction.get('amount', 0)) + 
                int(transaction.get('step', 0))
            ) % len(city_keys)
            
            city_name = city_keys[city_index]
            
            if city_name not in grouped_data:
                grouped_data[city_name] = {
                    'city': city_name,
                    'coordinates': mp_cities[city_name],
                    'transactions': [],
                    'total_amount': 0,
                    'avg_risk_score': 0,
                    'count': 0
                }
            
            grouped_data[city_name]['transactions'].append(transaction)
            grouped_data[city_name]['total_amount'] += transaction.get('amount', 0)
            grouped_data[city_name]['count'] += 1
        
        # Calculate averages and risk scores
        for city_data in grouped_data.values():
            if city_data['count'] > 0:
                city_data['avg_risk_score'] = sum(
                    t.get('prediction_confidence', 0) for t in city_data['transactions']
                ) / city_data['count']
                city_data['avg_amount'] = city_data['total_amount'] / city_data['count']
        
        return jsonify(list(grouped_data.values()))
        
    except Exception as e:
        return jsonify({'error': f'Error generating geo data: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected'
    })

if __name__ == '__main__':
    # Setup database on startup
    setup_database()
    print("Fraud Detection API Server Starting...")
    print("Database initialized successfully!")
    print("Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
