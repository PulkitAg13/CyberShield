import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';

const DataPreviewComponent = ({ data, title = "Data Preview" }) => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // Generate columns from the first row
      const firstRow = data[0];
      const generatedColumns = Object.keys(firstRow).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        selector: row => row[key],
        sortable: true,
        cell: row => {
          const value = row[key];
          // Format numbers and handle different data types
          if (typeof value === 'number') {
            if (key.includes('amount') || key.includes('balance')) {
              return `₹${value.toLocaleString()}`;
            }
            return value.toLocaleString();
          }
          if (key === 'detected_at' && value) {
            return new Date(value).toLocaleString();
          }
          return value || 'N/A';
        },
        width: key.includes('amount') || key.includes('balance') ? '140px' : 'auto',
      }));

      setColumns(generatedColumns);
      setRows(data.slice(0, 100)); // Show first 100 rows for preview
    }
  }, [data]);

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
        paddingLeft: '12px',
        paddingRight: '12px',
      },
    },
    cells: {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        paddingLeft: '12px',
        paddingRight: '12px',
      },
    },
  };

  const conditionalRowStyles = [
    {
      when: row => row.isFlaggedFraud === 1,
      style: {
        backgroundColor: '#fef2f2',
        '&:hover': {
          backgroundColor: '#fee2e2',
        },
      },
    },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a file to see data preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600">
          Showing {Math.min(rows.length, 100)} of {data.length} records
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              No data to display
            </div>
          }
        />
      </div>

      {data.length > 100 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          * Preview limited to first 100 rows. Full data is processed in the background.
        </div>
      )}
    </div>
  );
};

export default DataPreviewComponent;
