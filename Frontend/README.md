# Fraud Detection Dashboard

A comprehensive fraud detection system with React frontend and Python Flask backend.

## Features

🔹 **Upload Component**
- File picker for CSV/Excel files
- File validation and preview
- Multi-part form data upload

🔹 **Data Preview Component** 
- Interactive data table with first few rows
- Responsive design with react-data-table-component

🔹 **Fraud Results Table**
- Display detected fraudulent transactions
- Advanced filtering by type, amount, and confidence
- Real-time data refresh

🔹 **Processing Logs**
- Track upload history and processing statistics
- Visual progress indicators for fraud detection rates

🔹 **Analytics & Visualizations**
- 📊 Bar/Line Charts: Fraud count over time (steps)
- 🥧 Pie Charts: Fraud distribution by transaction type  
- 🌡️ Heatmap: Fraud probability vs amount/step analysis
- Interactive chart switching and real-time updates

## Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **Vite** - Fast development server and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for data visualization
- **React Data Table Component** - Feature-rich data tables
- **Axios** - HTTP client for API communication

### Backend  
- **Python Flask** - Lightweight web framework
- **SQLite** - Embedded database for transaction storage
- **Pandas** - Data manipulation and analysis
- **Flask-CORS** - Cross-origin resource sharing

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Frontend Setup

```bash
# Install dependencies
npm install

# Install Tailwind CSS (if needed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm run dev
```

### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python flask_app.py
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## Database Schema

The system uses SQLite with two main tables:

### fraudulent_transactions
- `id` - Primary key
- `step` - Transaction step/time
- `type` - Transaction type (TRANSFER, CASH_OUT, etc.)
- `amount` - Transaction amount
- `oldbalanceOrg` - Original account balance before
- `newbalanceOrig` - Original account balance after  
- `oldbalanceDest` - Destination account balance before
- `newbalanceDest` - Destination account balance after
- `isFlaggedFraud` - Fraud flag (0/1)
- `prediction_confidence` - ML model confidence score
- `detected_at` - Timestamp of detection

### processing_logs  
- `id` - Primary key
- `filename` - Uploaded file name
- `total_transactions` - Total transactions processed
- `fraudulent_count` - Number of fraudulent transactions detected
- `processed_at` - Processing timestamp

## API Endpoints

- `POST /api/upload` - Upload and process CSV/Excel files
- `GET /api/fraud-transactions?limit=100` - Get fraudulent transactions
- `GET /api/logs?limit=10` - Get processing logs
- `GET /api/fraud-stats` - Get fraud statistics for charts
- `GET /api/health` - Health check endpoint

## File Upload Support

Supported formats:
- **CSV** (.csv)
- **Excel** (.xlsx, .xls)

Required columns in uploaded files:
- `step` - Transaction sequence number
- `type` - Transaction type
- `amount` - Transaction amount
- `oldbalanceOrg` - Sender's balance before transaction
- `newbalanceOrig` - Sender's balance after transaction

## Fraud Detection Logic

The system includes a rule-based fraud detection algorithm that flags transactions based on:

1. **Large Transfer Amounts** - Transfers > ₹100,000
2. **High Cash-Out Values** - Cash withdrawals > ₹50,000  
3. **Balance Inconsistencies** - Mathematical errors in balance calculations
4. **Suspicious Destination Patterns** - Zero balance after receiving funds

*Note: Replace with your own ML model for production use.*

## Development

### Project Structure
```
fraud2/
├── src/
│   ├── components/
│   │   ├── upload/UploadComponent.jsx
│   │   ├── data/DataPreviewComponent.jsx
│   │   ├── data/FraudResultsTable.jsx
│   │   ├── data/ProcessingLogs.jsx
│   │   ├── charts/FraudVisualizationCharts.jsx
│   │   └── Dashboard.jsx
│   ├── services/api.js
│   └── App.jsx
├── api.py (database functions)
├── flask_app.py (Flask server)
└── requirements.txt
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## License

MIT License - see LICENSE file for details.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
