import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'; // Import the react-select component
import Sidebar from '../../../components/HSidebar';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Calendar from './Calendar';

const DailyReport = () => {
  const [reports, setReports] = useState([]);
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]); // Store all users
  const [selectedUser, setSelectedUser] = useState(null); // Store the selected user
  const [reportDetails, setReportDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editReportId, setEditReportId] = useState(null);
  const [editReportDetails, setEditReportDetails] = useState('');
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [limit, setLimit] = useState(5); // Initially show 5 reports
  const [calendarKey, setCalendarKey] = useState(0); // State to force re-render of the calendar

  // Fetch all users for the dropdown
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pass-users');
      const userOptions = res.data.map((user) => ({
        value: user.id,
        label: `${user.username} - ${user.ename}`,
      }));
      setUsers(userOptions);
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorMessage('Failed to fetch users. Please try again.');
    }
  };

  // Fetch reports based on date
  const fetchReports = async (date) => {
    setIsLoading(true);
    setErrorMessage(''); // Clear previous errors
    try {
      const res = await axios.get(`http://localhost:3000/reports/${date}`);

      if (res.data.length === 0) {
        // If no reports are found, show this message
        setReports([]);
        setErrorMessage('No reports found for the selected date.');
      } else {
        setReports(res.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Specific handling for 404 error
        setReports([]);
        setErrorMessage('No reports found for the selected date.');
      } else {
        console.error('Error fetching reports:', err);
        setErrorMessage('Failed to fetch reports. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user selection from the dropdown
  const handleUserSelect = (selectedOption) => {
    setSelectedUser(selectedOption);
    setUserId(selectedOption.value);
  };

  // Reset form fields
  const resetForm = () => {
    setUserId('');
    setSelectedUser(null);
    setReportDetails('');
    setEditReportDetails('');
    setIsEditing(false);
    setEditReportId(null);
  };

  // Handle form submission (create or update report)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editReportId && (!date || !userId)) {
      alert('Please ensure both date and user are selected.');
      return;
    }

    const data = {
      user_id: userId,
      report_date: date,
      report_details: isEditing ? editReportDetails : reportDetails,
    };

    try {
      if (editReportId) {
        await axios.put(`http://localhost:3000/reports/${editReportId}`, {
          report_details: editReportDetails,
        });
        alert('Report updated successfully!');
      } else {
        await axios.post('http://localhost:3000/reports', data);
        alert('Report submitted successfully!');
      }
      resetForm();
      fetchReports(date);

      // Trigger re-render of the calendar by updating the key
      setCalendarKey((prevKey) => prevKey + 1); // Increment the key to refresh the calendar

    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to submit the report. Please try again.');
    }
  };

  // Delete report
  const handleDelete = async (reportId) => {
    try {
      await axios.delete(`http://localhost:3000/reports/${reportId}`);
      alert('Report deleted successfully!');
      fetchReports(date);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete the report. Please try again.');
    }
  };

  // Edit report
  const handleEdit = (report) => {
    setIsEditing(true);
    setEditReportId(report.report_id);
    setEditReportDetails(report.report_details);
    setSelectedUser({ value: report.user_id, label: `${report.username} - ${report.ename}` });
    setUserId(report.user_id);
  };

  // Toggle report details visibility
  const handleToggleExpand = (reportId) => {
    setExpandedReportId((prevId) => (prevId === reportId ? null : reportId));
  };

  // Handle date changes
  useEffect(() => {
    if (date) {
      fetchReports(date);
    }
  }, [date]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-grow ml-60 p-8 bg-gray-50">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Daily Reporting</h1>
          <p className="text-gray-600 mt-2">Manage and track your daily reports efficiently.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/2 space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Report' : 'Submit Report'}
            </h2>
            {/* User Dropdown */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Select User
              </label>
              <Select
                options={users}
                value={selectedUser}
                onChange={handleUserSelect}
                isDisabled={isEditing}
                placeholder="Search and select a user..."
              />
            </div>
            {/* Date Picker */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>



            {/* Report Details */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Report Details</label>
              <textarea
                value={isEditing ? editReportDetails : reportDetails}
                onChange={(e) =>
                  isEditing ? setEditReportDetails(e.target.value) : setReportDetails(e.target.value)
                }
                required
                rows="5"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              {isEditing ? 'Update Report' : isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>

          {/* Calendar Section */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full lg:w-1/2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Calendar</h2>
            <div className="max-h-[500px]">
              <Calendar key={calendarKey} /> {/* Pass calendarKey to refresh the calendar */}
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full mt-8 overflow-auto max-h-[500px]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Other Users Reports</h2>
          {isLoading ? (
            <p className="text-center text-gray-600">Loading reports...</p>
          ) : errorMessage ? (
            <p className="text-center text-red-600">{errorMessage}</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-600">No reports found for the selected date.</p>
          ) : (
            <ul className="space-y-4">
              {reports.slice(0, limit).map((report) => {
                const formattedDate = new Date(report.report_date).toLocaleDateString('en-GB');
                return (
                  <li
                    key={report.report_id}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-md"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">{`${report.username} - ${report.ename}`}</h3>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(report)}
                          aria-label="Edit report"
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(report.report_id)}
                          aria-label="Delete report"
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onClick={() => handleToggleExpand(report.report_id)}
                          aria-label="Expand/Collapse details"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          {expandedReportId === report.report_id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>
                    {expandedReportId === report.report_id && (
                      <p className="mt-2 text-gray-700">{report.report_details}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
