import React from 'react';

const DataSourceInfo = () => {
  const dataSources = [
    {
      component: 'Live Dashboard',
      realData: [
        'Total fraud transactions count (from database)',
        'Recent fraud detections (from fraud_detection.db)',
        'Processing logs and times (from processing_logs table)',
        'Total fraud amount (calculated from real transactions)'
      ],
      simulatedData: [
        '24-hour detection patterns (demo analytics)',
        'Hourly fraud statistics (simulated for visualization)',
        'Some performance metrics (estimated values)'
      ],
      dataSource: 'Mixed: Real database + Demo analytics',
      refreshRate: 'Every 30 seconds',
      accuracy: '70% Real Data'
    },
    {
      component: 'Fraud Results Table',
      realData: [
        'All fraud transaction records',
        'Transaction amounts, types, IDs',
        'ML model predictions and confidence scores',
        'Timestamps from actual processing'
      ],
      simulatedData: [],
      dataSource: 'Real database (fraud_detection.db)',
      refreshRate: 'Real-time on upload',
      accuracy: '100% Real Data'
    },
    {
      component: 'Fraud Analytics Charts',
      realData: [
        'Transaction type distribution',
        'Amount range analysis',
        'Total fraud statistics',
        'All metrics from fraud stats API'
      ],
      simulatedData: [],
      dataSource: 'Real backend API (/fraud-stats)',
      refreshRate: 'On tab load + manual refresh',
      accuracy: '100% Real Data'
    },
    {
      component: 'MP Heatmap',
      realData: [
        'Fraud transaction counts',
        'Geographic distribution logic',
        'City-wise fraud patterns'
      ],
      simulatedData: [
        'Realistic city demographics (population, economic activity)',
        'Geographic coordinates and city profiles',
        'Risk score calculations based on transaction patterns'
      ],
      dataSource: 'Real transactions + Realistic geographic modeling',
      refreshRate: 'On tab load',
      accuracy: '60% Real Data'
    },
    {
      component: 'AI Model Monitoring',
      realData: [
        'Processing logs and times',
        'Model loading status',
        'Actual ML model performance metrics'
      ],
      simulatedData: [
        'Performance history trends (24-hour)',
        'Feature importance analysis',
        'Model accuracy metrics (realistic estimates)',
        'Prediction confidence distributions'
      ],
      dataSource: 'Real processing logs + Simulated ML metrics',
      refreshRate: 'Every minute',
      accuracy: '30% Real Data'
    },
    {
      component: 'Risk Alert System',
      realData: [
        'Alert generation based on real transaction patterns',
        'High-value transaction detection',
        'Transaction frequency analysis',
        'Actual fraud case counts'
      ],
      simulatedData: [
        'Risk level calculations',
        'Alert timing and notifications',
        'Some pattern recognition logic'
      ],
      dataSource: 'Real transaction analysis + Alert simulation',
      refreshRate: 'Every 45 seconds',
      accuracy: '80% Real Data'
    },
    {
      component: 'Prevention Engine',
      realData: [
        'Analysis of actual fraud patterns',
        'Transaction volume and amounts',
        'Fraud type distribution for recommendations'
      ],
      simulatedData: [
        'ROI calculations and projections',
        'Implementation timelines and costs',
        'Prevention strategy recommendations'
      ],
      dataSource: 'Real fraud analysis + Expert recommendations',
      refreshRate: 'On component load',
      accuracy: '40% Real Data'
    }
  ];

  const getAccuracyColor = (accuracy) => {
    const percentage = parseInt(accuracy.replace('%', ''));
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Source Transparency</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Core Fraud Detection</div>
            <div className="text-xs text-gray-500 mt-1">Real ML model & database</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">60%</div>
            <div className="text-sm text-gray-600">Analytics & Monitoring</div>
            <div className="text-xs text-gray-500 mt-1">Real data + Demo insights</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">Enterprise</div>
            <div className="text-sm text-gray-600">Ready Architecture</div>
            <div className="text-xs text-gray-500 mt-1">Production-grade components</div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Why Mixed Data?</h4>
          <p className="text-sm text-blue-700">
            For hackathon demonstration, we combine real fraud detection (100% functional) with 
            simulated analytics to showcase enterprise capabilities. In production, all components 
            would use real data streams from your banking infrastructure.
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-800">Component-wise Data Sources</h4>
        {dataSources.map((source, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h5 className="font-semibold text-gray-900 text-lg">{source.component}</h5>
                <p className="text-sm text-gray-600">{source.dataSource}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getAccuracyColor(source.accuracy)}`}>
                  {source.accuracy}
                </span>
                <span className="text-xs text-gray-500">Updates: {source.refreshRate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real Data */}
              <div>
                <h6 className="font-medium text-green-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real Data Sources
                </h6>
                <ul className="text-sm text-gray-700 space-y-1">
                  {source.realData.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Simulated Data */}
              <div>
                <h6 className="font-medium text-orange-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo/Simulated Elements
                </h6>
                {source.simulatedData.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    {source.simulatedData.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-700 italic">No simulated data - 100% real!</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Technical Implementation Notes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Real Components</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• FastAPI backend with SQLite database</li>
              <li>• Scikit-learn RandomForest ML model</li>
              <li>• CSV file processing and fraud detection</li>
              <li>• Database storage and retrieval</li>
              <li>• API endpoints returning real transaction data</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Demo Enhancements</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Historical trends (would need time-series data)</li>
              <li>• Advanced ML metrics visualization</li>
              <li>• Geographic fraud distribution modeling</li>
              <li>• Business intelligence analytics</li>
              <li>• Enterprise monitoring dashboards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceInfo;
