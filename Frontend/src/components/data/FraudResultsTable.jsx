import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { getFraudulentTransactions } from '../../services/api';

const FraudResultsTable = ({ refreshTrigger }) => {
  const [fraudData, setFraudData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    fetchFraudData();
  }, [refreshTrigger]);

  const fetchFraudData = async () => {
    try {
      setLoading(true);
      const response = await getFraudulentTransactions(500);
      // The API returns {count, transactions, timestamp}
      setFraudData(response.transactions || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch fraud data');
      console.error('Error fetching fraud data:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Step',
      selector: row => row.step,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Type',
      selector: row => row.type,
      sortable: true,
      width: '100px',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === 'TRANSFER' ? 'bg-blue-100 text-blue-800' :
          row.type === 'CASH_OUT' ? 'bg-red-100 text-red-800' :
          row.type === 'CASH_IN' ? 'bg-green-100 text-green-800' :
          row.type === 'PAYMENT' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      name: 'Amount',
      selector: row => row.amount,
      sortable: true,
      width: '140px',
      cell: row => `₹${row.amount.toLocaleString()}`,
    },
    {
      name: 'Old Balance (Orig)',
      selector: row => row.oldbalanceOrg,
      sortable: true,
      width: '140px',
      cell: row => `₹${row.oldbalanceOrg.toLocaleString()}`,
    },
    {
      name: 'New Balance (Orig)',
      selector: row => row.newbalanceOrig,
      sortable: true,
      width: '140px',
      cell: row => `₹${row.newbalanceOrig.toLocaleString()}`,
    },
    {
      name: 'Old Balance (Dest)',
      selector: row => row.oldbalanceDest,
      sortable: true,
      width: '140px',
      cell: row => `₹${row.oldbalanceDest.toLocaleString()}`,
    },
    {
      name: 'New Balance (Dest)',
      selector: row => row.newbalanceDest,
      sortable: true,
      width: '140px',
      cell: row => `₹${row.newbalanceDest.toLocaleString()}`,
    },
    {
      name: 'Detected At',
      selector: row => row.detected_at,
      sortable: true,
      width: '160px',
      cell: row => new Date(row.detected_at).toLocaleString(),
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: 'white',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    headCells: {
      style: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    cells: {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  };

  const filteredData = fraudData.filter(row => {
    if (filters.type && row.type !== filters.type) return false;
    if (filters.minAmount && row.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && row.amount > parseFloat(filters.maxAmount)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading fraud data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">{error}</h3>
          <button
            onClick={fetchFraudData}
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
        <h3 className="text-lg font-semibold text-gray-800">Fraudulent Transactions</h3>
        <button
          onClick={fetchFraudData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="TRANSFER">Transfer</option>
            <option value="CASH_OUT">Cash Out</option>
            <option value="CASH_IN">Cash In</option>
            <option value="PAYMENT">Payment</option>
            <option value="DEBIT">Debit</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Min Amount</label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Amount</label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
            placeholder="1000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationPerPage={25}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          customStyles={customStyles}
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              No fraudulent transactions found
            </div>
          }
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total fraudulent transactions: {filteredData.length}
      </div>
    </div>
  );
};

export default FraudResultsTable;
