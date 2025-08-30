# File: train_model_simple.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def load_and_preprocess_data(file_path):
    """Load and preprocess the dataset"""
    print("Loading dataset...")
    df = pd.read_csv(file_path)
    print(f"Dataset shape: {df.shape}")
    
    # Drop unnecessary columns
    df.drop(['nameOrig', 'nameDest'], axis=1, inplace=True)
    
    # Convert categorical columns to numerical
    catCols = [col for col in df.columns if df[col].dtype == "O"]
    lb_make = LabelEncoder()
    
    for item in catCols:
        df[item] = lb_make.fit_transform(df[item])
    
    return df

def evaluate_model(y_test, y_pred):
    """Evaluate model performance"""
    print("Accuracy Score: ", accuracy_score(y_test, y_pred))
    print("Precision Score: ", precision_score(y_test, y_pred))
    print("Recall Score: ", recall_score(y_test, y_pred))
    print("F1 Score: ", f1_score(y_test, y_pred))
    print("Confusion Matrix: \n", confusion_matrix(y_test, y_pred))

def train_model():
    """Train and save the fraud detection model"""
    file_path = 'PS_20174392719_1491204439457_log.csv'
    
    # Load and preprocess data
    data = load_and_preprocess_data(file_path)
    
    # Prepare features and target
    X = data.drop('isFraud', axis=1)
    y = data.isFraud

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=27
    )
    
    # Train Random Forest model
    print("Training Random Forest model...")
    rfc = RandomForestClassifier(n_estimators=10, random_state=42)
    rfc.fit(X_train, y_train)
    
    # Make predictions and evaluate
    predictions = rfc.predict(X_test)
    print("\nModel Evaluation:")
    evaluate_model(y_test, predictions)
    
    # Save the model directly (not wrapped in a dictionary)
    joblib.dump(rfc, 'credit_fraud.pkl')
    print("Model saved as credit_fraud.pkl")
    
    # Also save the expected columns for preprocessing
    joblib.dump(X_train.columns.tolist(), 'expected_columns.pkl')
    print("Expected columns saved as expected_columns.pkl")
    
    return rfc, X_test, y_test

if __name__ == "__main__":
    train_model()