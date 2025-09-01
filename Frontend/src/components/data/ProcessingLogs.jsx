import React, { useState, useEffect } from 'react';
import { getProcessingLogs } from '../../services/api';

const ProcessingLogs = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getProcessingLogs(20);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch processing logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Logs</h3>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Logs</h3>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchLogs}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Processing Logs</h3>
        <button
          onClick={fetchLogs}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No processing logs</h3>
          <p className="mt-1 text-sm text-gray-500">Upload files to see processing history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={log.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {log.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.processed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Transactions</p>
                      <p className="font-semibold text-gray-900">{log.total_transactions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fraudulent</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-red-600">{log.fraudulent_count.toLocaleString()}</p>
                        <span className="text-xs text-gray-500">
                          ({((log.fraudulent_count / log.total_transactions) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar for fraud ratio */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Fraud Detection Rate</span>
                  <span>{((log.fraudulent_count / log.total_transactions) * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((log.fraudulent_count / log.total_transactions) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing latest {logs.length} processing logs
        </div>
      )}
    </div>
  );
};

export default ProcessingLogs;
