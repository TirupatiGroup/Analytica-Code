
import React, { useState, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import api from '../../../api/axios';
const ArdHome = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch data whenever the selectedMonth or selectedYear changes
  useEffect(() => {
    fetchDataForArdDepartment(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear]);

  const fetchDataForArdDepartment = async (year, month) => {
    setLoading(true);
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}`;
    
    try {
      const response = await api.fetch(`/reports/ard/${formattedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const { startDate, endDate } = getCurrentMonthRange(selectedYear, selectedMonth);
  const headers = getDateHeaders(startDate, endDate);

  // Handle the double-click event to start editing a report
  const handleDoubleClick = (item, header) => {
    // Find the report that matches the header date
    const report = item.reports.find((report) =>
      formatDateForComparison(report.report_date) === formatDateForComparison(header)
    );
  
    if (report) {
      setEditData({
        itemIndex: data.indexOf(item),
        header,
        value: report.report_details,
        id: report.report_id,  // Ensure the ID is being set here
        report_date: report.report_date
      });
      setIsEditing(true); // Trigger editing mode
    }
  };

  // Handle save event for updated report data
  const handleSave = async () => {
    const updatedData = [...data];
    const { itemIndex, header, value, id, report_date } = editData;
  
    const reportIndex = updatedData[itemIndex].reports.findIndex((report) =>
      formatDateForComparison(report.report_date) === formatDateForComparison(header)
    );
  
    if (reportIndex !== -1) {
      const report = updatedData[itemIndex].reports[reportIndex];
      report.report_details = value; // Update report details
  
      const body = {
        id,                    // ID of the report
        report_date,           // Report date (will not be updated)
        report_details: value, // Updated report details
      };
  
      // Log the request body for debugging
      console.log("Request body for PUT:", JSON.stringify(body));
  
      try {
        const response = await fetch('http://localhost:3000/update-report', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const responseData = await response.json();
        console.log("Response from API:", responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Error updating report');
        }
  
        setData(updatedData); // Update state with new data
        alert('Report updated successfully');
      } catch (error) {
        console.error('Error saving report:', error);
        alert('Failed to save report: ' + error.message);
      }
    }
  
    // Reset the editing state after save
    setIsEditing(false);
    setEditData(null);
  };

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  // Handle input changes while editing
  const handleInputChange = (e) => {
    setEditData({ ...editData, value: e.target.value });
  };

  // Handle blur event for saving when focus is lost
  const handleBlur = () => {
    if (editData) {
      handleSave();
    }
  };

  // Handle keyboard events (Enter to save, Escape to cancel)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Check if the selected month is the current month
  const isCurrentMonth = selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear();

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      <div className="w-[80%] p-4 bg-gray-50 rounded-lg shadow-md flex-1 h-screen overflow-x-auto">
        {/* Navigation Controls */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setSelectedMonth(selectedMonth - 1)}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Previous Month
          </button>
          <div className="flex items-center">
            <span className="mr-2 font-semibold text-lg">
              {getFormattedMonthYear(selectedMonth, selectedYear)}
            </span>
          </div>
          <button
            onClick={() => setSelectedMonth(selectedMonth + 1)}
            disabled={isCurrentMonth}
            className={`px-4 py-2 rounded-md ${isCurrentMonth ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-300'}`}
          >
            Next Month
          </button>
        </div>

        {/* Loading indicator */}
        {loading && <div className="text-center py-4">Loading data...</div>}

        {/* Table */}
        <div className="overflow-x-auto max-h-screen overflow-y-auto">
          <table className="min-w-full border border-gray-300 table-auto text-xs">
            <thead className="bg-gray-200">
              <tr>
                <th className="sticky left-0 top-0 bg-gray-200 border border-gray-300 p-2 z-30">
                  Emp Name
                </th>
                <th className="sticky left-[3rem] top-0 bg-gray-200 border border-gray-300 p-2 z-30">
                  Section
                </th>
                {headers.map((header, idx) => (
                  <th key={idx} className="sticky top-0 bg-gray-200 border border-gray-300 p-2 z-10">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 2} className="text-center p-4">
                    No data available for the selected month.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index}>
                    <td className="sticky left-0 bg-white border border-gray-300 p-2">{item.ename}</td>
                    <td className="sticky left-[3rem] bg-white border border-gray-300 p-2">{item.vertical}</td>
                    {headers.map((header, idx) => (
                      <td
                        key={idx}
                        className="border border-gray-300 p-2 cursor-pointer"
                        onDoubleClick={() => handleDoubleClick(item, header)}
                      >
                        {isEditing && editData && editData.itemIndex === data.indexOf(item) && editData.header === header ? (
                          <ResizableBox
                            width={200}
                            height={80}
                            axis="both"
                            minConstraints={[100, 60]}
                            maxConstraints={[400, 200]}
                            resizeHandles={['se']}
                          >
                            <textarea
                              value={editData.value}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              onKeyDown={handleKeyDown}
                              className="border p-2 rounded w-full h-full resize-none"
                              style={{ resize: 'both', overflow: 'auto', minHeight: '60px', maxHeight: '200px' }}
                              autoFocus
                            />
                          </ResizableBox>
                        ) : (
                          item.reports.find((report) =>
                            formatDateForComparison(report.report_date) === formatDateForComparison(header)
                          ) ? (
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis block">
                              {item.reports.find((report) =>
                                formatDateForComparison(report.report_date) === formatDateForComparison(header)
                              ).report_details.slice(0, 20) + '...'}
                            </span>
                          ) : (
                            ' '
                          )
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getCurrentMonthRange = (year, month) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));
  return { startDate, endDate };
};

const getFormattedMonthYear = (month, year) => {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toISOString().slice(0, 7); // Returns 'YYYY-MM'
};


const getDateHeaders = (startDate, endDate) => {
  const headers = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    headers.push(currentDate.toISOString().slice(0, 10)); // Format as YYYY-MM-DD
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);  // Ensure using UTC
  }
  return headers;
};

const formatDateForComparison = (dateString) => {
  // Convert dateString to Date object in UTC
  const date = new Date(dateString);
  
  // Return the date in the 'YYYY-MM-DD' format (UTC, no timezone shift)
  return date.toISOString().slice(0, 10);  // Slicing to get 'YYYY-MM-DD' format
};

export default ArdHome;
