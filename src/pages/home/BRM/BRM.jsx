import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';  // Import the custom axios instance
import Table from './Table';  // Import Table component

const BRM = () => {
  // Get the current date
  const currentDate = new Date();

  // Calculate the date 30 days ago
  const previous30Days = new Date();
  previous30Days.setDate(currentDate.getDate() - 28);

  // Format dates in 'YYYY-MM-DD' format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default dates
  const [firstDate, setFirstDate] = useState(formatDate(previous30Days));
  const [lastDate, setLastDate] = useState(formatDate(currentDate));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/category-data', {
        params: { firstdate: firstDate, lastdate: lastDate },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData(); // Fetch data initially when the component loads
  }, [firstDate, lastDate]); // Rerun fetch when dates change

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component mounts
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">BRM Report</h1>

      <div className="mb-4 text-center">
        <label className="mr-4">
          Start Date:
          <input
            type="date"
            value={firstDate}
            onChange={(e) => setFirstDate(e.target.value)}
            className="ml-2 p-2 border border-gray-300 rounded"
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
            className="ml-2 p-2 border border-gray-300 rounded"
          />
        </label>
        <button
          onClick={handleSubmit}
          className="ml-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
          {data && data.map((categoryData) => (
            <div key={categoryData.category} className="w-full">
              <Table categoryData={categoryData} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BRM;
