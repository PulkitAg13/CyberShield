import streamlit as st
import requests
import pandas as pd
from io import StringIO
import time

st.title("Real-Time Credit Card Fraud Detection System")

st.image("https://github.com/Nneji123/Credit-Card-Fraud-Detection/raw/main/image.png", use_column_width=True)

st.write("""
## About
This system processes CSV files containing credit card transactions in real-time and identifies fraudulent transactions using machine learning.

**Upload a CSV file with transaction data to get started.**
""")

# File upload section
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file is not None:
    # Read the file
    dataframe = pd.read_csv(uploaded_file)
    st.write("### Preview of Uploaded Data")
    st.dataframe(dataframe.head())
    
    st.write(f"Total transactions: {len(dataframe)}")
    
    if st.button("Process Transactions"):
        with st.spinner("Processing transactions..."):
            # Send to backend API
            files = {"file": uploaded_file.getvalue()}
            
            try:
                response = requests.post(
                    "http://localhost:8000/predict-csv", 
                    files={"file": ("transactions.csv", uploaded_file.getvalue(), "text/csv")}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    st.success("Processing complete!")
                    
                    # Display results
                    st.write(f"**Total transactions processed:** {result['total_transactions']}")
                    st.write(f"**Fraudulent transactions detected:** {result['fraudulent_transactions']}")
                    
                    if result['fraudulent_transactions'] > 0:
                        st.write("### Fraudulent Transactions Details")
                        fraud_df = pd.DataFrame(result['fraudulent_data'])
                        st.dataframe(fraud_df)
                        
                        # Download button for fraudulent transactions
                        csv = fraud_df.to_csv(index=False)
                        st.download_button(
                            label="Download Fraudulent Transactions as CSV",
                            data=csv,
                            file_name="fraudulent_transactions.csv",
                            mime="text/csv",
                        )
                    else:
                        st.info("No fraudulent transactions detected.")
                
                else:
                    st.error(f"Error: {response.text}")
                    
            except requests.exceptions.ConnectionError:
                st.error("Could not connect to the backend API. Make sure it's running on http://localhost:8000")
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

# Sidebar information
st.sidebar.header("API Information")
st.sidebar.info("""
The backend API is running on http://localhost:8000

Endpoints:
- `POST /predict-csv` - Process CSV file
- `GET /health` - Health check

Make sure to run the API before using this interface.
""")

st.sidebar.header("Expected CSV Format")
st.sidebar.text("""
The CSV should contain these columns:
- step
- type
- amount
- oldbalanceOrg
- newbalanceOrig
- oldbalanceDest
- newbalanceDest
- isFlaggedFraud
""")