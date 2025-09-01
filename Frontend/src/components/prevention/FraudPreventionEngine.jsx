import React, { useState, useEffect, useCallback } from 'react';
import { getFraudStats, getFraudulentTransactions } from '../../services/api';

const FraudPreventionEngine = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [preventionMetrics, setPreventionMetrics] = useState({
    totalPrevented: 0,
    amountSaved: 0,
    riskReduction: 0,
    implementationScore: 0
  });
  const [loading, setLoading] = useState(true);

  const generateRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch current fraud data
      const [statsData, transactionsData] = await Promise.all([
        getFraudStats(),
        getFraudulentTransactions(200)
      ]);

      const transactions = transactionsData.transactions || [];
      
      // Analyze patterns and generate intelligent recommendations
      const recommendations = [];
      
      // High-value transaction controls
      const highValueTransactions = transactions.filter(t => parseFloat(t.amount) > 500000);
      if (highValueTransactions.length > 0) {
        recommendations.push({
          id: 'high-value-controls',
          title: 'Enhanced High-Value Transaction Monitoring',
          category: 'Transaction Controls',
          priority: 'HIGH',
          impact: 'High',
          effort: 'Medium',
          description: 'Implement additional verification steps for transactions above ₹5L',
          details: [
            'Multi-factor authentication for high-value transfers',
            'Manager approval workflow for amounts > ₹5L',
            'Real-time identity verification',
            'Enhanced device fingerprinting'
          ],
          estimatedSavings: highValueTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) * 0.8,
          implementation: {
            timeframe: '2-3 weeks',
            resources: 'Development team + Security team',
            cost: '₹2-3L'
          },
          icon: '💰',
          color: 'red'
        });
      }

      // Frequency-based detection
      const transferTransactions = transactions.filter(t => t.type === 'TRANSFER');
      if (transferTransactions.length > 15) {
        recommendations.push({
          id: 'velocity-controls',
          title: 'Transaction Velocity Monitoring',
          category: 'Behavioral Analytics',
          priority: 'MEDIUM',
          impact: 'Medium',
          effort: 'Low',
          description: 'Implement velocity checking to detect rapid successive transactions',
          details: [
            'Set daily transaction limits per account',
            'Monitor transaction frequency patterns',
            'Flag accounts with unusual velocity spikes',
            'Implement cooling-off periods'
          ],
          estimatedSavings: transferTransactions.length * 25000,
          implementation: {
            timeframe: '1-2 weeks',
            resources: 'Development team',
            cost: '₹50K-1L'
          },
          icon: '⚡',
          color: 'orange'
        });
      }

      // Geographic analysis
      recommendations.push({
        id: 'geo-fencing',
        title: 'Geographic Risk Scoring',
        category: 'Location Intelligence',
        priority: 'MEDIUM',
        impact: 'Medium',
        effort: 'Medium',
        description: 'Implement location-based risk assessment for transactions',
        details: [
          'IP geolocation verification',
          'Known high-risk location blocking',
          'Travel pattern analysis',
          'Device location consistency checks'
        ],
        estimatedSavings: 1500000,
        implementation: {
          timeframe: '2-4 weeks',
          resources: 'Development + Data Science team',
          cost: '₹1-2L'
        },
        icon: '🌍',
        color: 'blue'
      });

      // Machine Learning Enhancement
      recommendations.push({
        id: 'ml-enhancement',
        title: 'Advanced ML Model Deployment',
        category: 'AI/ML Enhancement',
        priority: 'HIGH',
        impact: 'Very High',
        effort: 'High',
        description: 'Deploy ensemble models with deep learning for better fraud detection',
        details: [
          'Gradient boosting ensemble models',
          'Real-time feature engineering',
          'Anomaly detection using autoencoders',
          'Continuous model retraining pipeline'
        ],
        estimatedSavings: 5000000,
        implementation: {
          timeframe: '4-8 weeks',
          resources: 'Data Science + MLOps team',
          cost: '₹5-8L'
        },
        icon: '🤖',
        color: 'purple'
      });

      // Customer Education
      recommendations.push({
        id: 'customer-education',
        title: 'Customer Fraud Awareness Program',
        category: 'User Education',
        priority: 'LOW',
        impact: 'Medium',
        effort: 'Low',
        description: 'Educate customers about fraud prevention best practices',
        details: [
          'In-app security tips and notifications',
          'Phishing awareness campaigns',
          'Secure transaction guidelines',
          'Regular security updates and alerts'
        ],
        estimatedSavings: 800000,
        implementation: {
          timeframe: '1-2 weeks',
          resources: 'Marketing + UX team',
          cost: '₹25-50K'
        },
        icon: '🎓',
        color: 'green'
      });

      // Real-time alerting
      recommendations.push({
        id: 'realtime-alerts',
        title: 'Real-time Fraud Alert System',
        category: 'Monitoring & Alerts',
        priority: 'HIGH',
        impact: 'High',
        effort: 'Medium',
        description: 'Implement instant notifications for suspicious activities',
        details: [
          'SMS/Email alerts for high-risk transactions',
          'Push notifications for mobile app',
          'Dashboard real-time monitoring',
          'Integration with security team workflows'
        ],
        estimatedSavings: 2000000,
        implementation: {
          timeframe: '2-3 weeks',
          resources: 'Development + DevOps team',
          cost: '₹1-1.5L'
        },
        icon: '🚨',
        color: 'red'
      });

      setRecommendations(recommendations);

      // Calculate prevention metrics
      const totalSavings = recommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0);
      setPreventionMetrics({
        totalPrevented: recommendations.length * 45,
        amountSaved: totalSavings,
        riskReduction: 35,
        implementationScore: 78
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (color) => {
    const colors = {
      red: 'bg-red-50 border-red-200',
      orange: 'bg-orange-50 border-orange-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      green: 'bg-green-50 border-green-200'
    };
    return colors[color] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prevention Impact Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Fraud Prevention Impact Projection</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{preventionMetrics.totalPrevented}</div>
            <div className="text-sm text-gray-600 mt-1">Potential Cases Prevented</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">₹{(preventionMetrics.amountSaved / 10000000).toFixed(1)}Cr</div>
            <div className="text-sm text-gray-600 mt-1">Estimated Savings</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{preventionMetrics.riskReduction}%</div>
            <div className="text-sm text-gray-600 mt-1">Risk Reduction</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{preventionMetrics.implementationScore}</div>
            <div className="text-sm text-gray-600 mt-1">Implementation Score</div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">AI-Powered Prevention Recommendations</h3>
        {recommendations.map((rec) => (
          <div key={rec.id} className={`bg-white rounded-lg shadow-md border-l-4 ${getCategoryColor(rec.color)}`}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{rec.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    
                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Implementation Details:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {rec.details.map((detail, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-500 text-xs mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Project Overview:</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Timeframe:</strong> {rec.implementation.timeframe}</div>
                          <div><strong>Resources:</strong> {rec.implementation.resources}</div>
                          <div><strong>Cost:</strong> {rec.implementation.cost}</div>
                          <div><strong>Est. Savings:</strong> ₹{(rec.estimatedSavings / 1000000).toFixed(1)}M</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Impact</div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rec.impact === 'Very High' ? 'bg-red-100 text-red-800' :
                      rec.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.impact}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Effort</div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rec.effort === 'High' ? 'bg-red-100 text-red-800' :
                      rec.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.effort}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Category: {rec.category}</span>
                  <span className="text-sm text-green-600 font-medium">
                    ROI: {((rec.estimatedSavings / 1000000) / 2).toFixed(1)}x
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                    Schedule Implementation
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors">
                    More Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Implementation Roadmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Recommended Implementation Roadmap</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 font-bold">Phase 1 (Weeks 1-4)</div>
            <div className="text-sm text-gray-700">High-priority items: Real-time alerts, High-value controls</div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 font-bold">Phase 2 (Weeks 5-8)</div>
            <div className="text-sm text-gray-700">Medium-priority items: Velocity monitoring, Geographic scoring</div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600 font-bold">Phase 3 (Weeks 9-16)</div>
            <div className="text-sm text-gray-700">Long-term improvements: ML enhancement, Customer education</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudPreventionEngine;
