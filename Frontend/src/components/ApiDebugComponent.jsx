import React, { useState, useEffect } from 'react';
import { checkHealth, getFraudStats, getFraudulentTransactions, getFraudGeoData } from '../services/api';

const ApiDebugComponent = () => {
  const [tests, setTests] = useState({
    health: { status: 'pending', data: null, error: null },
    stats: { status: 'pending', data: null, error: null },
    transactions: { status: 'pending', data: null, error: null },
    geoData: { status: 'pending', data: null, error: null }
  });

  const runTest = async (testName, testFunc) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status: 'loading', data: null, error: null }
    }));

    try {
      const result = await testFunc();
      setTests(prev => ({
        ...prev,
        [testName]: { status: 'success', data: result, error: null }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        [testName]: { status: 'error', data: null, error: error.message }
      }));
    }
  };

  const runAllTests = () => {
    runTest('health', checkHealth);
    runTest('stats', getFraudStats);
    runTest('transactions', () => getFraudulentTransactions(10));
    runTest('geoData', getFraudGeoData);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'loading': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '⏸️';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">API Debug Console</h3>
        <button
          onClick={runAllTests}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Run All Tests
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(tests).map(([testName, test]) => (
          <div key={testName} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getStatusIcon(test.status)}</span>
                <h4 className="font-medium text-gray-900 capitalize">{testName} Test</h4>
              </div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(test.status)}`}>
                {test.status}
              </span>
            </div>

            {test.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                <p className="text-red-700 text-sm font-medium">Error:</p>
                <p className="text-red-600 text-sm">{test.error}</p>
              </div>
            )}

            {test.data && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-gray-700 text-sm font-medium mb-2">Response:</p>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={() => {
                const testFunctions = {
                  health: checkHealth,
                  stats: getFraudStats,
                  transactions: () => getFraudulentTransactions(10),
                  geoData: getFraudGeoData
                };
                runTest(testName, testFunctions[testName]);
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Run {testName} test
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Connection Info:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Backend URL: http://localhost:8000</li>
          <li>• Frontend URL: {window.location.origin}</li>
          <li>• CORS: Enabled for all origins</li>
          <li>• Content-Type: application/json</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiDebugComponent;
