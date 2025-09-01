import React, { useState, useEffect } from 'react';
import { getFraudStats } from '../../services/api';

const FraudInvestigation = ({ refreshTrigger }) => {
  const [fraudTransactions, setFraudTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [investigationDetails, setInvestigationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState('riskScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [assignedInvestigator, setAssignedInvestigator] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [similarCases, setSimilarCases] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock fraud transactions data
  const mockFraudTransactions = [
    {
      id: 'TXN001',
      amount: 850000,
      type: 'TRANSFER',
      originAccount: 'ACC123456789',
      destAccount: 'ACC987654321',
      timestamp: '2025-09-01 14:30:25',
      location: 'Bhopal, MP',
      coordinates: [77.4126, 23.2599],
      riskScore: 95,
      status: 'FLAGGED',
      customerName: 'Rajesh Kumar',
      suspiciousPattern: 'Large amount, unusual time',
      ipAddress: '192.168.1.45',
      deviceFingerprint: 'MOB_ANDROID_SM-G973',
      merchantCategory: 'Financial Services',
      accountAge: '3 years',
      previousFraudHistory: 'None',
      customerRiskProfile: 'Medium',
      transactionChannel: 'Mobile App',
      authenticationMethod: 'PIN + Biometric',
      geoLocation: 'Bhopal Central, MP',
      merchantMCC: '6012',
      cardPresent: false,
      recurringPattern: false
    },
    {
      id: 'TXN002',
      amount: 1250000,
      type: 'CASH_OUT',
      originAccount: 'ACC456789123',
      destAccount: 'ATM_MP_001',
      timestamp: '2025-09-01 02:15:45',
      location: 'Indore, MP',
      coordinates: [75.8577, 22.7196],
      riskScore: 88,
      status: 'UNDER_REVIEW',
      customerName: 'Priya Sharma',
      suspiciousPattern: 'Night transaction, high amount',
      ipAddress: '10.0.0.123',
      deviceFingerprint: 'ATM_TERMINAL_4521',
      merchantCategory: 'ATM Withdrawal',
      accountAge: '1.5 years',
      previousFraudHistory: '1 incident (6 months ago)',
      customerRiskProfile: 'High',
      transactionChannel: 'ATM',
      authenticationMethod: 'PIN Only',
      geoLocation: 'Indore IT Park, MP',
      merchantMCC: '6011',
      cardPresent: true,
      recurringPattern: true
    },
    {
      id: 'TXN003',
      amount: 675000,
      type: 'PAYMENT',
      originAccount: 'ACC789123456',
      destAccount: 'MERCH_E_COMM_789',
      timestamp: '2025-08-31 23:45:12',
      location: 'Gwalior, MP',
      coordinates: [78.1828, 26.2183],
      riskScore: 82,
      status: 'FLAGGED',
      customerName: 'Amit Verma',
      suspiciousPattern: 'Multiple rapid transactions',
      ipAddress: '203.45.67.89',
      deviceFingerprint: 'WEB_CHROME_WINDOWS',
      merchantCategory: 'E-commerce',
      accountAge: '5 years',
      previousFraudHistory: 'None',
      customerRiskProfile: 'Low',
      transactionChannel: 'Web Browser',
      authenticationMethod: 'OTP + Password',
      geoLocation: 'Gwalior Mall, MP',
      merchantMCC: '5411',
      cardPresent: false,
      recurringPattern: true
    },
    {
      id: 'TXN004',
      amount: 2100000,
      type: 'TRANSFER',
      originAccount: 'ACC321654987',
      destAccount: 'ACC147258369',
      timestamp: '2025-08-31 16:20:33',
      location: 'Jabalpur, MP',
      coordinates: [79.9864, 23.1815],
      riskScore: 98,
      status: 'BLOCKED',
      customerName: 'Sunita Patel',
      suspiciousPattern: 'Unusual beneficiary, large amount',
      ipAddress: '172.16.0.98',
      deviceFingerprint: 'MOB_IOS_IPHONE12',
      merchantCategory: 'Person to Person',
      accountAge: '7 years',
      previousFraudHistory: 'None',
      customerRiskProfile: 'Low',
      transactionChannel: 'Mobile App',
      authenticationMethod: 'Face ID + PIN',
      geoLocation: 'Jabalpur Railway Station, MP',
      merchantMCC: '6538',
      cardPresent: false,
      recurringPattern: false
    },
    {
      id: 'TXN005',
      amount: 450000,
      type: 'CASH_OUT',
      originAccount: 'ACC654987321',
      destAccount: 'ATM_MP_089',
      timestamp: '2025-08-30 11:55:20',
      location: 'Ujjain, MP',
      coordinates: [75.7849, 23.1765],
      riskScore: 76,
      status: 'INVESTIGATING',
      customerName: 'Vikram Singh',
      suspiciousPattern: 'Cross-border pattern detected',
      ipAddress: '192.168.5.201',
      deviceFingerprint: 'ATM_TERMINAL_8901',
      merchantCategory: 'ATM Withdrawal',
      accountAge: '2 years',
      previousFraudHistory: 'None',
      customerRiskProfile: 'Medium',
      transactionChannel: 'ATM',
      authenticationMethod: 'PIN Only',
      geoLocation: 'Ujjain Temple Area, MP',
      merchantMCC: '6011',
      cardPresent: true,
      recurringPattern: false
    }
  ];

  useEffect(() => {
    const loadFraudData = async () => {
      setLoading(true);
      try {
        // Try to get real data, fallback to mock data
        const data = await getFraudStats();
        // For now, use mock data since API might not have detailed transaction info
        setFraudTransactions(mockFraudTransactions);
      } catch (error) {
        console.warn('Using mock fraud transaction data');
        setFraudTransactions(mockFraudTransactions);
      }
      setLoading(false);
    };

    loadFraudData();
  }, [refreshTrigger]);

  const generateInvestigationReport = (transaction) => {
    const timeline = [
      { time: transaction.timestamp, event: 'Transaction Initiated', details: `${transaction.type} transaction for ₹${transaction.amount.toLocaleString()}`, type: 'transaction' },
      { time: new Date(new Date(transaction.timestamp).getTime() + 1000).toISOString(), event: 'Fraud Detection', details: 'ML model flagged transaction as suspicious', type: 'system' },
      { time: new Date(new Date(transaction.timestamp).getTime() + 30000).toISOString(), event: 'Risk Assessment', details: `Risk score calculated: ${transaction.riskScore}%`, type: 'system' },
      { time: new Date(new Date(transaction.timestamp).getTime() + 120000).toISOString(), event: 'Investigation Started', details: 'Case assigned to fraud investigation team', type: 'investigation' },
      { time: new Date().toISOString(), event: 'Currently Under Review', details: 'Awaiting investigator action', type: 'pending' }
    ];

    const similarCases = mockFraudTransactions
      .filter(t => t.id !== transaction.id && 
             (t.customerName === transaction.customerName || 
              t.deviceFingerprint === transaction.deviceFingerprint ||
              t.ipAddress === transaction.ipAddress ||
              Math.abs(t.amount - transaction.amount) < 100000))
      .slice(0, 5);

    return {
      transactionId: transaction.id,
      riskFactors: [
        `High amount: ₹${transaction.amount.toLocaleString()}`,
        `Risk Score: ${transaction.riskScore}/100`,
        `Pattern: ${transaction.suspiciousPattern}`,
        `Time: ${new Date(transaction.timestamp).toLocaleString()}`,
        `Location: ${transaction.location}`,
        `Device: ${transaction.deviceFingerprint}`,
        `Authentication: ${transaction.authenticationMethod}`,
        `Channel: ${transaction.transactionChannel}`,
        `Customer Risk Profile: ${transaction.customerRiskProfile}`
      ],
      recommendedActions: [
        transaction.riskScore > 90 ? 'Immediate account freeze recommended' : 'Enhanced monitoring required',
        'Contact customer for verification',
        'Review transaction history for patterns',
        'Check device and IP reputation',
        'Verify merchant legitimacy',
        'Cross-reference with fraud databases',
        'Coordinate with local branch if needed',
        'Document all investigation steps'
      ],
      investigationNotes: [
        'Transaction flagged by ML model',
        'Requires manual verification',
        'Customer notification pending',
        'Compliance team alerted',
        'Geographic location verified',
        'Device fingerprint analysis completed'
      ],
      relatedTransactions: mockFraudTransactions
        .filter(t => t.id !== transaction.id && 
               (t.originAccount === transaction.originAccount || 
                t.customerName === transaction.customerName))
        .slice(0, 3),
      timeline: timeline,
      similarCases: similarCases,
      riskAssessment: {
        deviceRisk: transaction.deviceFingerprint.includes('ATM') ? 'Medium' : 'High',
        locationRisk: transaction.geoLocation.includes('Railway') || transaction.geoLocation.includes('Mall') ? 'High' : 'Medium',
        behaviorRisk: transaction.recurringPattern ? 'Low' : 'High',
        amountRisk: transaction.amount > 1000000 ? 'Critical' : transaction.amount > 500000 ? 'High' : 'Medium'
      }
    };
  };

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    const details = generateInvestigationReport(transaction);
    setInvestigationDetails(details);
    setTimeline(details.timeline);
    setSimilarCases(details.similarCases);
    setCaseStatus(transaction.status);
    setAssignedInvestigator('Current User');
  };

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = fraudTransactions.filter(transaction => {
      const matchesSearch = transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'ALL' || transaction.status === filterStatus;
      
      const matchesRisk = filterRiskLevel === 'ALL' || 
                         (filterRiskLevel === 'CRITICAL' && transaction.riskScore >= 90) ||
                         (filterRiskLevel === 'HIGH' && transaction.riskScore >= 75 && transaction.riskScore < 90) ||
                         (filterRiskLevel === 'MEDIUM' && transaction.riskScore >= 60 && transaction.riskScore < 75) ||
                         (filterRiskLevel === 'LOW' && transaction.riskScore < 60);

      return matchesSearch && matchesStatus && matchesRisk;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const addInvestigationNote = () => {
    if (investigationNotes.trim() && selectedTransaction) {
      const newNote = {
        time: new Date().toISOString(),
        event: 'Investigation Note',
        details: investigationNotes.trim(),
        type: 'note',
        investigator: assignedInvestigator || 'Current User'
      };
      
      setTimeline(prev => [...prev, newNote]);
      setInvestigationNotes('');
    }
  };

  const updateCaseStatus = (newStatus) => {
    setCaseStatus(newStatus);
    if (selectedTransaction) {
      const statusNote = {
        time: new Date().toISOString(),
        event: 'Status Update',
        details: `Case status changed to: ${newStatus}`,
        type: 'status',
        investigator: assignedInvestigator || 'Current User'
      };
      setTimeline(prev => [...prev, statusNote]);
    }
  };

  const exportCaseReport = () => {
    if (!selectedTransaction || !investigationDetails) return;
    
    const report = {
      caseId: selectedTransaction.id,
      customerName: selectedTransaction.customerName,
      amount: selectedTransaction.amount,
      riskScore: selectedTransaction.riskScore,
      status: caseStatus,
      investigator: assignedInvestigator,
      timeline: timeline,
      riskFactors: investigationDetails.riskFactors,
      recommendedActions: investigationDetails.recommendedActions,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fraud_case_${selectedTransaction.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FLAGGED': return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED': return 'bg-red-200 text-red-900';
      case 'INVESTIGATING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (score) => {
    if (score >= 90) return 'text-red-600 font-bold';
    if (score >= 75) return 'text-orange-600 font-semibold';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading fraud investigations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fraud Investigation Center</h2>
            <p className="text-gray-600">Advanced tools for bank employees to investigate fraud cases</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Mock Investigation Data</span>
            <span className="text-sm font-semibold text-gray-700">
              {getFilteredAndSortedTransactions().length} Cases
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Customer, ID, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="FLAGGED">Flagged</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="INVESTIGATING">Investigating</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              value={filterRiskLevel}
              onChange={(e) => setFilterRiskLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="ALL">All Levels</option>
              <option value="CRITICAL">Critical (90+)</option>
              <option value="HIGH">High (75-89)</option>
              <option value="MEDIUM">Medium (60-74)</option>
              <option value="LOW">Low (&lt;60)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="riskScore">Risk Score</option>
              <option value="amount">Amount</option>
              <option value="timestamp">Time</option>
              <option value="customerName">Customer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Flagged Transactions</h3>
            <p className="text-sm text-gray-600">Click on a transaction to investigate ({getFilteredAndSortedTransactions().length} results)</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {getFilteredAndSortedTransactions().map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleSelectTransaction(transaction)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTransaction?.id === transaction.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{transaction.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Customer:</strong> {transaction.customerName}</p>
                      <p><strong>Amount:</strong> ₹{transaction.amount.toLocaleString()}</p>
                      <p><strong>Type:</strong> {transaction.type}</p>
                      <p><strong>Location:</strong> {transaction.location}</p>
                      <p><strong>Channel:</strong> {transaction.transactionChannel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRiskColor(transaction.riskScore)}`}>
                      {transaction.riskScore}%
                    </div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investigation Details */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Investigation Details</h3>
                {selectedTransaction && (
                  <p className="text-sm text-gray-600">Case: {selectedTransaction.id}</p>
                )}
              </div>
              {selectedTransaction && (
                <div className="flex space-x-2">
                  <button
                    onClick={exportCaseReport}
                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    Export Report
                  </button>
                  <select
                    value={caseStatus}
                    onChange={(e) => updateCaseStatus(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="FLAGGED">Flagged</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="FALSE_POSITIVE">False Positive</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {!selectedTransaction ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2">Select a transaction to view investigation details</p>
              </div>
            ) : (
              <div>
                {/* Investigation Tabs */}
                <div className="flex space-x-1 mb-6">
                  {[
                    { id: 'overview', name: 'Overview', icon: '📋' },
                    { id: 'timeline', name: 'Timeline', icon: '⏰' },
                    { id: 'similar', name: 'Similar Cases', icon: '🔍' },
                    { id: 'risk', name: 'Risk Analysis', icon: '⚠️' },
                    { id: 'notes', name: 'Notes', icon: '📝' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-md text-sm flex items-center space-x-1 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && investigationDetails && (
                  <div className="space-y-6">
                    {/* Transaction Overview */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Transaction Overview</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                          <div><strong>Customer:</strong> {selectedTransaction.customerName}</div>
                          <div><strong>Amount:</strong> ₹{selectedTransaction.amount.toLocaleString()}</div>
                          <div><strong>Type:</strong> {selectedTransaction.type}</div>
                          <div><strong>Timestamp:</strong> {new Date(selectedTransaction.timestamp).toLocaleString()}</div>
                          <div><strong>Location:</strong> {selectedTransaction.location}</div>
                          <div><strong>Origin Account:</strong> {selectedTransaction.originAccount}</div>
                          <div><strong>Destination:</strong> {selectedTransaction.destAccount}</div>
                          <div><strong>Channel:</strong> {selectedTransaction.transactionChannel}</div>
                          <div><strong>Authentication:</strong> {selectedTransaction.authenticationMethod}</div>
                          <div><strong>Account Age:</strong> {selectedTransaction.accountAge}</div>
                          <div><strong>Risk Profile:</strong> {selectedTransaction.customerRiskProfile}</div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Risk Factors</h4>
                      <ul className="space-y-2">
                        {investigationDetails.riskFactors.map((factor, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {investigationDetails.recommendedActions.map((action, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Investigation Timeline</h4>
                    <div className="space-y-3">
                      {timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            event.type === 'transaction' ? 'bg-purple-500' :
                            event.type === 'system' ? 'bg-blue-500' :
                            event.type === 'investigation' ? 'bg-orange-500' :
                            event.type === 'note' ? 'bg-green-500' :
                            event.type === 'status' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{event.event}</p>
                                <p className="text-sm text-gray-600">{event.details}</p>
                                {event.investigator && (
                                  <p className="text-xs text-gray-500">by {event.investigator}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(event.time).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'similar' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Similar Cases</h4>
                    <div className="space-y-3">
                      {similarCases.map((similar) => (
                        <div key={similar.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{similar.id} - {similar.customerName}</p>
                              <p className="text-sm text-gray-600">₹{similar.amount.toLocaleString()} • {similar.type}</p>
                              <p className="text-xs text-gray-500">{new Date(similar.timestamp).toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${getRiskColor(similar.riskScore)}`}>
                              {similar.riskScore}% Risk
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'risk' && investigationDetails && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Risk Assessment Matrix</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(investigationDetails.riskAssessment).map(([category, level]) => (
                        <div key={category} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm capitalize">{category.replace('Risk', ' Risk')}</p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            level === 'Critical' ? 'bg-red-100 text-red-800' :
                            level === 'High' ? 'bg-orange-100 text-orange-800' :
                            level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Investigation Notes</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Investigator</label>
                        <input
                          type="text"
                          value={assignedInvestigator}
                          onChange={(e) => setAssignedInvestigator(e.target.value)}
                          placeholder="Enter investigator name"
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add Investigation Note</label>
                        <textarea
                          value={investigationNotes}
                          onChange={(e) => setInvestigationNotes(e.target.value)}
                          placeholder="Enter investigation notes, findings, or actions taken..."
                          rows="4"
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={addInvestigationNote}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                        >
                          Add Note
                        </button>
                      </div>
                      
                      {/* Display existing notes from timeline */}
                      <div className="border-t pt-4">
                        <h5 className="font-medium text-gray-700 mb-2">Previous Notes</h5>
                        {timeline.filter(event => event.type === 'note').map((note, index) => (
                          <div key={index} className="p-3 bg-yellow-50 rounded-lg mb-2">
                            <p className="text-sm">{note.details}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.time).toLocaleString()} - {note.investigator}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudInvestigation;
