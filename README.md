# AI-Based Fraud Detection System  
### National CyberShield Hackathon 2025

An AI-powered fraud detection and monitoring system developed as part of the **National CyberShield Hackathon 2025**. The project focuses on identifying suspicious financial transactions in real time using machine learning, enabling banks, fintech platforms, and cybercrime units to respond faster and more effectively to digital fraud.

---

## 🏆 Hackathon Details
- **Hackathon:** National CyberShield Hackathon 2025  
- **Problem Statement:** AI Model for Flagging Suspicious Transactions  
- **Team Name:** CyberCops  
- **Institution:** VIT Bhopal University  

---

## 🚨 Problem Statement
With the rapid growth of digital payments, financial fraud has increased significantly. Traditional manual monitoring systems are:
- Slow and error-prone  
- Reactive rather than proactive  
- Unable to provide real-time alerts  

There is a strong need for an **automated, intelligent, and scalable fraud detection system**.

---

## 💡 Proposed Solution
This project introduces an **AI-based fraud detection dashboard** that:
- Monitors financial transactions in real time  
- Uses machine learning to detect anomalous patterns  
- Assigns fraud probability scores to transactions  
- Generates alerts, reports, and audit logs for quick decision-making  

---

## ✨ Key Features
- 🔍 Real-time transaction monitoring  
- 🤖 Machine Learning–based fraud prediction  
- 📊 Interactive dashboard with fraud alerts and trends  
- 🚨 Instant flagging of suspicious transactions  
- 📄 Downloadable reports and audit logs  
- ⚡ Lightweight, scalable, and cost-effective prototype  

---

## 🧠 System Architecture

**Flow:**  
Transaction Data → ML Model → Fraud Probability Scoring → Alert Generation → Dashboard & Reports

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- HTML5, JavaScript  
- Tailwind CSS  
- Chart.js / Recharts (visualization)

### Backend
- Python 3.8+  
- FastAPI  
- Uvicorn (ASGI Server)

### Databases & Tools
- SQLite (transaction storage)  
- MySQL / MongoDB (optional extensions)  
- Power BI (analysis & visualization)  

### Machine Learning
- Scikit-learn  
- Random Forest Classifier  
- Pandas, NumPy  

### Deployment
- Docker  
- AWS (scalable deployment ready)

---

## 📡 API Endpoints
- `POST /predict-csv` – Upload CSV file for fraud prediction  
- `GET /fraudulent-transactions` – Retrieve flagged transactions  
- `GET /processing-logs` – Access processing history  
- `GET /health` – Health check  
- `DELETE /clear-data` – Clear stored data (testing)

---

## 📈 Model Details

- **Model:** Random Forest Classifier  
- **Dataset:** PaySim synthetic mobile money transaction dataset  
- **Performance Metrics:**
  - Accuracy: **99.97%**
  - Precision: **98.12%**
  - Recall: **77.87%**
  - F1-Score: **86.83%**

The ensemble-based Random Forest approach reduces overfitting and improves robustness against noisy transaction data.

---

## 🔐 Security Considerations
- Secure API endpoints  
- Controlled access to transaction data  
- Designed with financial data privacy in mind  
- Ready for compliance extensions (GDPR, PCI-DSS)

---

## 🌍 Impact & Benefits

### Banks & Financial Institutions
- Reduced fraud losses  
- Faster fraud investigation  
- Improved customer trust  

### End Users
- Safer digital transactions  
- Increased confidence in online payments  

### Law Enforcement
- Faster access to fraud evidence  
- Better collaboration with financial institutions  

---

## 🔮 Future Scope
- Handling concept drift with periodic retraining  
- Reducing false positives using ensemble tuning  
- Integration with real banking transaction systems  
- Cloud-native scaling for high-volume transactions  

---

## 🔗 Resources
- GitHub Repository: https://github.com/PulkitAg13/CyberShield  
- Dataset: https://www.kaggle.com/datasets/ealaxi/paysim1  

---

## 👥 Team CyberCops
- Pulkit Agrawal  
- Harshit Arora  
- Sameer Chaudhary  
- Tejas Ranjeet  
- Vidhi Shukla  

**Mentor:** Dr. Sajjad Ahmed, Cyber Division, SCAI

---

## 📜 License
This project was developed for academic and hackathon purposes.
