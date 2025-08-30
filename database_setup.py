import sqlite3
import pandas as pd
from datetime import datetime

def setup_database():
    """Setup SQLite database with tables for fraudulent transactions"""
    conn = sqlite3.connect('fraud_detection.db')
    cursor = conn.cursor()
    
    # Create table for fraudulent transactions
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS fraudulent_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        step INTEGER,
        type TEXT,
        amount REAL,
        oldbalanceOrg REAL,
        newbalanceOrig REAL,
        oldbalanceDest REAL,
        newbalanceDest REAL,
        isFlaggedFraud INTEGER,
        prediction_confidence REAL,
        detected_at TIMESTAMP,
        processed BOOLEAN DEFAULT FALSE
    )
    ''')
    
    # Create table for processing logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS processing_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        total_transactions INTEGER,
        fraudulent_count INTEGER,
        processed_at TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Database setup completed successfully!")

def insert_fraudulent_transactions(transactions, filename):
    """Insert fraudulent transactions into database"""
    conn = sqlite3.connect('fraud_detection.db')
    cursor = conn.cursor()
    
    # Log the processing
    cursor.execute('''
    INSERT INTO processing_logs (filename, total_transactions, fraudulent_count, processed_at)
    VALUES (?, ?, ?, ?)
    ''', (filename, transactions['total_transactions'], len(transactions['fraudulent_data']), datetime.now()))
    
    # Insert each fraudulent transaction
    for transaction in transactions['fraudulent_data']:
        cursor.execute('''
        INSERT INTO fraudulent_transactions 
        (step, type, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest, isFlaggedFraud, detected_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            transaction.get('step', 0),
            transaction.get('type', ''),
            transaction.get('amount', 0),
            transaction.get('oldbalanceOrg', 0),
            transaction.get('newbalanceOrig', 0),
            transaction.get('oldbalanceDest', 0),
            transaction.get('newbalanceDest', 0),
            transaction.get('isFlaggedFraud', 0),
            datetime.now()
        ))
    
    conn.commit()
    conn.close()
    return True

def get_fraudulent_transactions(limit=100):
    """Retrieve fraudulent transactions from database"""
    conn = sqlite3.connect('fraud_detection.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM fraudulent_transactions 
    ORDER BY detected_at DESC 
    LIMIT ?
    ''', (limit,))
    
    columns = [description[0] for description in cursor.description]
    transactions = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    conn.close()
    return transactions

def get_processing_logs(limit=10):
    """Retrieve processing logs from database"""
    conn = sqlite3.connect('fraud_detection.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM processing_logs 
    ORDER BY processed_at DESC 
    LIMIT ?
    ''', (limit,))
    
    columns = [description[0] for description in cursor.description]
    logs = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    conn.close()
    return logs

if __name__ == "__main__":
    setup_database()