from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import io
from typing import List, Dict
from datetime import datetime
import uvicorn
import sqlite3
import database_setup as db

app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="API for real-time credit card fraud detection with database storage",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize database
db.setup_database()

# Load the pre-trained model and expected columns
try:
    model = joblib.load('credit_fraud.pkl')
    expected_columns = joblib.load('expected_columns.pkl')
    print("Model loaded successfully!")
    print(f"Expected columns: {expected_columns}")
except FileNotFoundError as e:
    print(f"Error: {e}")
    print("Please run the training script first to generate the model files.")
    model = None
    expected_columns = []

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess the incoming data to match training format"""
    if model is None:
        raise ValueError("Model not loaded. Cannot preprocess data.")
    
    # Create a copy to avoid modifying the original
    data = df.copy()
    
    # Drop columns that were not used in training
    if 'nameOrig' in data.columns:
        data.drop('nameOrig', axis=1, inplace=True)
    if 'nameDest' in data.columns:
        data.drop('nameDest', axis=1, inplace=True)
    
    # Convert categorical columns to numerical (if present)
    catCols = [col for col in data.columns if data[col].dtype == "O"]
    lb_make = LabelEncoder()
    
    for col in catCols:
        if col in data.columns:
            data[col] = lb_make.fit_transform(data[col])
    
    # Add missing columns with default values
    for col in expected_columns:
        if col not in data.columns:
            if col == 'isFlaggedFraud':
                data[col] = 0  # Default value
            else:
                data[col] = 0  # Default value for other missing columns
    
    # Reorder columns to match training data
    data = data[expected_columns]
    
    return data

@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    """Process a CSV file, detect fraud, and store results in database"""
    if model is None:
        raise HTTPException(
            status_code=500, 
            detail="Model not loaded. Please ensure the model file exists."
        )
    
    try:
        # Read the CSV file
        contents = await file.read()
        csv_data = io.StringIO(contents.decode('utf-8'))
        df = pd.read_csv(csv_data)
        
        # Store original data for response
        original_df = df.copy()
        
        # Preprocess the data
        processed_df = preprocess_data(df)
        
        # Make predictions
        predictions = model.predict(processed_df)
        
        # Add predictions to original dataframe
        original_df['isFraudPrediction'] = predictions
        
        # Filter only fraudulent transactions
        fraudulent_df = original_df[original_df['isFraudPrediction'] == 1]
        
        # Convert to JSON
        fraudulent_transactions = fraudulent_df.to_dict(orient='records')
        
        # Prepare response data
        result = {
            "total_transactions": len(df),
            "fraudulent_transactions": len(fraudulent_df),
            "fraudulent_data": fraudulent_transactions,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store results in database
        db.insert_fraudulent_transactions(result, file.filename)
        
        return JSONResponse(result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/fraudulent-transactions")
async def get_fraudulent_transactions(limit: int = 100):
    """Get fraudulent transactions from database"""
    try:
        transactions = db.get_fraudulent_transactions(limit)
        return JSONResponse({
            "count": len(transactions),
            "transactions": transactions,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving transactions: {str(e)}")

@app.get("/processing-logs")
async def get_processing_logs(limit: int = 10):
    """Get processing logs from database"""
    try:
        logs = db.get_processing_logs(limit)
        return JSONResponse({
            "count": len(logs),
            "logs": logs,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving logs: {str(e)}")

@app.delete("/clear-data")
async def clear_data():
    """Clear all data from database (for testing purposes)"""
    try:
        conn = sqlite3.connect('fraud_detection.db')
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM fraudulent_transactions')
        cursor.execute('DELETE FROM processing_logs')
        
        conn.commit()
        conn.close()
        
        return {"message": "All data cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing data: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = "healthy" if model is not None else "model not loaded"
    return {"status": status, "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)