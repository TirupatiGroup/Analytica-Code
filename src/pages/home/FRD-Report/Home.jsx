// MainComponent.js (or your main file)
import React, { useState } from 'react';
import Sidebar from '../../../components/HSidebar';
import MonthYearSelector from '../../../components/MonthYearSelector'; // Adjust the path as needed
import ScrollableTable from '../../../components/ScrollableTable'; // Adjust the path as needed

const FrdHome = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  // Get the start and end date of the current month based on selected year and month
  const { startDate, endDate } = getCurrentMonthRange(selectedYear, selectedMonth);

  // Get the date headers (e.g., the days of the month)
  const headers = getDateHeaders(startDate, endDate);

  // Generate some dummy data for illustration (this would be replaced by real data)
  const data = generateDataForMonth(startDate, endDate);

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-[80%] p-4 bg-gray-50 rounded-lg shadow-md flex-1 h-screen overflow-x-auto">
        <div className="overflow-x-auto max-h-screen overflow-y-auto">
          <table className="min-w-full border border-gray-300 table-auto text-xs">
            <thead className="bg-gray-200">
              <tr>
                {/* Sticky Header for "Emp Name" and "Section" columns */}
                <th className="sticky left-0 top-0 bg-gray-200 border border-gray-300 p-2 z-30">Emp Name</th>
                <th className="sticky left-[3rem] top-0 bg-gray-200 border border-gray-300 p-2 z-30">Section</th>

                {/* Render the date headers */}
                {headers.map((header, idx) => (
                  <th key={idx} className="sticky top-0 bg-gray-200 border border-gray-300 p-2 z-10">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Render the rows */}
              {data.map((item, index) => (
                <tr key={index}>
                  {/* Sticky columns for Emp Name and Section */}
                  <td className="sticky left-0 bg-white border border-gray-300 p-2">{item.empName}</td>
                  <td className="sticky left-[3rem] bg-white border border-gray-300 p-2">{item.section}</td>

                  {/* Render the daily data columns */}
                  {headers.map((header, idx) => (
                    <td key={idx} className="border border-gray-300 p-2">
                      {item[header] || 'No Data'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the range of dates for the selected month
const getCurrentMonthRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of the month
  return { startDate, endDate };
};

// Helper function to generate headers for the table (the days of the month)
const getDateHeaders = (startDate, endDate) => {
  const headers = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    headers.push(currentDate.toLocaleDateString('en-GB')); // Format as dd/mm/yyyy
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return headers;
};

// Example function to generate data for each day (replace this with real data fetching logic)
const generateDataForMonth = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toLocaleDateString('en-GB'); // Format as dd/mm/yyyy
    data.push({
      empName: 'John Doe', // Example employee name
      section: 'Development', // Example section
      [dateStr]: `Work for ${dateStr}`, // Example daily data for each date
    });
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return data;
};

export default FrdHome;
