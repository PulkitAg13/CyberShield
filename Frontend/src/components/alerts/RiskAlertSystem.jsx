import React, { useState, useEffect, useCallback } from 'react';
import { getFraudulentTransactions } from '../../services/api';

const RiskAlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [showNotification, setShowNotification] = useState(false);

  const generateRiskAlerts = useCallback(async () => {
    try {
      const response = await getFraudulentTransactions(50);
      const transactions = response.transactions || [];

      // Generate intelligent alerts based on transaction patterns
      const newAlerts = [];
      
      // High-value transaction alert
      const highValueTransactions = transactions.filter(t => parseFloat(t.amount) > 1000000);
      if (highValueTransactions.length > 0) {
        newAlerts.push({
          id: `high-value-${Date.now()}`,
          type: 'HIGH_VALUE',
          severity: 'CRITICAL',
          title: 'High-Value Fraud Detection',
          message: `${highValueTransactions.length} transactions over ₹10L detected`,
          timestamp: new Date(),
          count: highValueTransactions.length,
          totalAmount: highValueTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
        });
      }

      // Frequency-based alerts
      const recentTransactions = transactions.filter(t => {
        const transactionTime = new Date(t.timestamp || Date.now());
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return transactionTime > hourAgo;
      });

      if (recentTransactions.length > 20) {
        newAlerts.push({
          id: `frequency-${Date.now()}`,
          type: 'HIGH_FREQUENCY',
          severity: 'WARNING',
          title: 'Unusual Transaction Frequency',
          message: `${recentTransactions.length} fraudulent transactions in the last hour`,
          timestamp: new Date(),
          count: recentTransactions.length
        });
      }

      // Geographic concentration alert
      const transferTransactions = transactions.filter(t => t.type === 'TRANSFER');
      if (transferTransactions.length > 15) {
        newAlerts.push({
          id: `transfer-spike-${Date.now()}`,
          type: 'TRANSFER_SPIKE',
          severity: 'WARNING',
          title: 'Transfer Fraud Spike',
          message: `High concentration of fraudulent transfers detected`,
          timestamp: new Date(),
          count: transferTransactions.length
        });
      }

      // Pattern recognition alert
      const cashOutTransactions = transactions.filter(t => t.type === 'CASH_OUT');
      if (cashOutTransactions.length > 10) {
        newAlerts.push({
          id: `cashout-pattern-${Date.now()}`,
          type: 'CASHOUT_PATTERN',
          severity: 'HIGH',
          title: 'Cash-Out Pattern Detected',
          message: `Suspicious cash-out pattern identified`,
          timestamp: new Date(),
          count: cashOutTransactions.length
        });
      }

      // Determine overall risk level
      const criticalAlerts = newAlerts.filter(a => a.severity === 'CRITICAL').length;
      const highAlerts = newAlerts.filter(a => a.severity === 'HIGH').length;
      const warningAlerts = newAlerts.filter(a => a.severity === 'WARNING').length;

      let newRiskLevel = 'LOW';
      if (criticalAlerts > 0) newRiskLevel = 'CRITICAL';
      else if (highAlerts > 0) newRiskLevel = 'HIGH';
      else if (warningAlerts > 0) newRiskLevel = 'MEDIUM';

      setAlerts(prevAlerts => {
        const allAlerts = [...newAlerts, ...prevAlerts].slice(0, 20); // Keep last 20 alerts
        return allAlerts;
      });

      if (newRiskLevel !== riskLevel) {
        setRiskLevel(newRiskLevel);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }

    } catch (error) {
      console.error('Error generating risk alerts:', error);
    }
  }, [riskLevel]);

  useEffect(() => {
    generateRiskAlerts();
    const interval = setInterval(generateRiskAlerts, 45000); // Check every 45 seconds
    return () => clearInterval(interval);
  }, [generateRiskAlerts]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 border-red-500 text-red-800';
      case 'HIGH': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'WARNING': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'HIGH_VALUE':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'HIGH_FREQUENCY':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'TRANSFER_SPIKE':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Level Indicator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${getRiskLevelColor(riskLevel)}`}>
              RISK LEVEL: {riskLevel}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                riskLevel === 'CRITICAL' ? 'bg-red-500' :
                riskLevel === 'HIGH' ? 'bg-orange-500' :
                riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-sm text-gray-600">Live Monitoring Active</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total Alerts: {alerts.length}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 animate-slide-in-right">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Risk Level Changed</p>
              <p className="text-sm text-gray-500">Current risk level: {riskLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Alert Timeline</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No security alerts at this time</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span>Count: {alert.count}</span>
                        {alert.totalAmount && (
                          <span>Amount: ₹{(alert.totalAmount / 1000000).toFixed(1)}M</span>
                        )}
                        <span>Severity: {alert.severity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Response Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-3 px-4 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <span>Block Suspicious IPs</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-3 px-4 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Increase Security</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-3 px-4 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAlertSystem;
