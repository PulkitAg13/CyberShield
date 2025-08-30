import streamlit as st
import requests
import pandas as pd
from io import StringIO
import time

st.title("Real-Time Credit Card Fraud Detection System")

st.image("https://github.com/Nneji123/Credit-Card-Fraud-Detection/raw/main/image.png", use_column_width=True)

st.write("""
## About
This system processes CSV files containing credit card transactions in real-time, identifies fraudulent transactions using machine learning, and stores them in a database.

**Upload a CSV file with transaction data to get started.**
""")

# Initialize session state
if 'processing_complete' not in st.session_state:
    st.session_state.processing_complete = False

# Sidebar navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Upload & Process", "View Fraudulent Transactions", "View Processing Logs"])

# File upload and processing page
if page == "Upload & Process":
    st.header("Upload & Process Transactions")
    
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
                try:
                    files = {"file": uploaded_file.getvalue()}
                    response = requests.post(
                        "http://localhost:8000/predict-csv", 
                        files={"file": ("transactions.csv", uploaded_file.getvalue(), "text/csv")}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        st.success("Processing complete! Data stored in database.")
                        st.session_state.processing_complete = True
                        
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

# View fraudulent transactions page
elif page == "View Fraudulent Transactions":
    st.header("Fraudulent Transactions from Database")
    
    limit = st.slider("Number of transactions to display", 10, 500, 100)
    
    if st.button("Refresh Data"):
        st.experimental_rerun()
    
    try:
        response = requests.get(f"http://localhost:8000/fraudulent-transactions?limit={limit}")
        
        if response.status_code == 200:
            data = response.json()
            st.write(f"**Total fraudulent transactions in database:** {data['count']}")
            
            if data['count'] > 0:
                transactions_df = pd.DataFrame(data['transactions'])
                st.dataframe(transactions_df)
                
                # Download button
                csv = transactions_df.to_csv(index=False)
                st.download_button(
                    label="Download All Fraudulent Transactions",
                    data=csv,
                    file_name="all_fraudulent_transactions.csv",
                    mime="text/csv",
                )
            else:
                st.info("No fraudulent transactions found in the database.")
        else:
            st.error(f"Error retrieving data: {response.text}")
            
    except requests.exceptions.ConnectionError:
        st.error("Could not connect to the backend API.")
    except Exception as e:
        st.error(f"An error occurred: {str(e)}")

# View processing logs page
elif page == "View Processing Logs":
    st.header("Processing Logs")
    
    limit = st.slider("Number of logs to display", 5, 50, 10)
    
    if st.button("Refresh Logs"):
        st.experimental_rerun()
    
    try:
        response = requests.get(f"http://localhost:8000/processing-logs?limit={limit}")
        
        if response.status_code == 200:
            data = response.json()
            st.write(f"**Total processing logs:** {data['count']}")
            
            if data['count'] > 0:
                logs_df = pd.DataFrame(data['logs'])
                st.dataframe(logs_df)
            else:
                st.info("No processing logs found.")
        else:
            st.error(f"Error retrieving logs: {response.text}")
            
    except requests.exceptions.ConnectionError:
        st.error("Could not connect to the backend API.")
    except Exception as e:
        st.error(f"An error occurred: {str(e)}")

# Sidebar information
st.sidebar.header("API Information")
st.sidebar.info("""
The backend API is running on http://localhost:8000

Endpoints:
- `POST /predict-csv` - Process CSV file
- `GET /fraudulent-transactions` - Get fraudulent transactions
- `GET /processing-logs` - Get processing logs
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

# Health check button
if st.sidebar.button("Check API Health"):
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            st.sidebar.success(f"API is {response.json()['status']}")
        else:
            st.sidebar.error("API is not responding")
    except:
        st.sidebar.error("Could not connect to API")

# Clear data button (for testing)
if st.sidebar.button("Clear Database (Testing)"):
    try:
        response = requests.delete("http://localhost:8000/clear-data")
        if response.status_code == 200:
            st.sidebar.success("Database cleared successfully")
        else:
            st.sidebar.error("Error clearing database")
    except:
        st.sidebar.error("Could not connect to API")