import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/HSidebar';
// import axios from 'axios'; // For making API calls

const DataEvaluate = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');

  // Function to fetch data from backend (mocked here)
  const fetchData = async () => {
    // Replace with your API call
    // const response = await axios.get(`/api/data?start=${startDate}&end=${endDate}`);
    // setData(response.data);

    // Mock data for demonstration
    setData([
      { code: 'P001', name: 'Product A', qtr: 1, day: 5 },
      { code: 'P002', name: 'Product B', qtr: 2, day: 3 },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(`Data Generated From: ${startDate} To: ${endDate}`);
    fetchData();
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar/>
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold">ARD - Data Evaluate</h2>
        <form className="mb-5" onSubmit={handleSubmit}>
          <label className="block mb-2">Start Date:</label>
          <input
            type="date"
            className="border p-2 mb-4 w-full"
            min="2023-01-01"
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <label className="block mb-2">End Date:</label>
          <input
            type="date"
            className="border p-2 mb-4 w-full"
            min="2023-01-01"
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Get Data
          </button>
        </form>
        {message && <p className="text-green-600">{message}</p>}
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">P.Code</th>
              <th className="border border-gray-300 p-2">Product Name</th>
              <th className="border border-gray-300 p-2">Qtr</th>
              <th className="border border-gray-300 p-2">Day</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{item.code}</td>
                <td className="border border-gray-300 p-2">{item.name}</td>
                <td className="border border-gray-300 p-2">{item.qtr}</td>
                <td className="border border-gray-300 p-2">{item.day}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataEvaluate;
