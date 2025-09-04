import axios from 'axios';

// Updated to connect to CyberShield FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Upload CSV file for fraud detection (matches /predict-csv endpoint)
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/predict-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Get fraudulent transactions (matches /fraudulent-transactions endpoint)
export const getFraudulentTransactions = async (limit = 100) => {
  const response = await api.get(`/fraudulent-transactions?limit=${limit}`);
  return response.data;
};

// Get processing logs (matches /processing-logs endpoint)
export const getProcessingLogs = async (limit = 10) => {
  const response = await api.get(`/processing-logs?limit=${limit}`);
  return response.data;
};

// Health check endpoint
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Clear all data (for testing purposes)
export const clearData = async () => {
  const response = await api.delete('/clear-data');
  return response.data;
};

// Get fraud statistics for charts (matches /fraud-stats endpoint)
export const getFraudStats = async () => {
  const response = await api.get('/fraud-stats');
  return response.data;
};

// Get geo-mapped fraud data for Madhya Pradesh (matches /fraud-geo-data endpoint)
export const getFraudGeoData = async () => {
  const response = await api.get('/fraud-geo-data');
  return response.data;
};

export default api;
