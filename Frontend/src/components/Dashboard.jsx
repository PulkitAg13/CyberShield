import React, { useState, useEffect } from 'react';
import UploadComponent from './upload/UploadComponent';
import FraudResultsTable from './data/FraudResultsTable';
import FraudVisualizationCharts from './charts/FraudVisualizationCharts';
import MadhyaPradeshGeoHeatmap from './maps/MadhyaPradeshGeoHeatmap';
import LiveMetricsDashboard from './dashboard/LiveMetricsDashboard';
import AIModelMonitoring from './monitoring/AIModelMonitoring';
import FraudInvestigation from './investigation/FraudInvestigation';
import { checkHealth } from '../services/api';

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Check API connectivity on component mount
    const checkApiConnection = async () => {
      try {
        await checkHealth();
        setApiStatus('connected');
      } catch (error) {
        console.error('API connection failed:', error);
        setApiStatus('disconnected');
      }
    };

    checkApiConnection();
    // Check API status every 30 seconds
    const interval = setInterval(checkApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (result) => {
    // Trigger refresh for all components that depend on new data
    setRefreshTrigger(prev => prev + 1);
    
    // Switch to results tab after successful upload
    setActiveTab('results');
  };

  const tabs = [
    { id: 'dashboard', name: 'Live Dashboard', icon: '📈' },
    { id: 'upload', name: 'Upload Data', icon: '📤' },
    { id: 'results', name: 'Fraud Results', icon: '🚨' },
    { id: 'investigation', name: 'Fraud Investigation', icon: '🔍' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'geomap', name: 'MP Heatmap', icon: '🗺️' },
    { id: 'monitoring', name: 'AI Monitoring', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fraud Detection Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Upload transaction data and analyze fraud patterns
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                apiStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : apiStatus === 'disconnected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apiStatus === 'connected' ? 'API Connected' : 
                 apiStatus === 'disconnected' ? 'API Disconnected' : 'Checking API...'}
              </div>
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh All</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <LiveMetricsDashboard />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-8">
            <UploadComponent onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-8">
            <FraudResultsTable refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'investigation' && (
          <div className="space-y-8">
            <FraudInvestigation refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <FraudVisualizationCharts refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'geomap' && (
          <div className="space-y-8">
            <MadhyaPradeshGeoHeatmap refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-8">
            <AIModelMonitoring />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2025 Fraud Detection System. Built with React & Python.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Last Updated: {new Date().toLocaleString()}</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>CyberShield API {apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
