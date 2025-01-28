import React, { useState, useEffect } from "react";
import api from "../../../api/axios"; // Ensure your axios instance is set up correctly
import RepoDetails from "../../../components/ReportDetailsModal"; // Import the RepoDetails modal

// Helper function to generate dates for the calendar grid
const generateDatesInMonth = (month, year) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  });
  return dates;
};

const ArdHome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-based
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [datesInMonth, setDatesInMonth] = useState([]);
  const [reports, setReports] = useState({}); // Store reports for each user and date
  const [selectedReport, setSelectedReport] = useState(null); // To store the selected report details

  useEffect(() => {
    // Fetch users based on department (default to 'ard')
    const fetchUsers = async () => {
      try {
        const response = await api.get("/reportusers", {
          params: { depart: "ard" },
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Generate dates for the current month
    const dates = generateDatesInMonth(currentMonth, currentYear);
    setDatesInMonth(dates);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/department/reports", {
          params: { month: currentMonth + 1, year: currentYear },
        });
        const allReports = response.data.reduce((acc, report) => {
          const reportDate = new Date(report.report_date).toISOString().split('T')[0]; // YYYY-MM-DD
          if (!acc[report.user_id]) {
            acc[report.user_id] = {};
          }
          acc[report.user_id][reportDate] = report.report_details;
          return acc;
        }, {});
        setReports(allReports);
      } catch (err) {
        setError(err.message);
      }
    };

    if (users.length > 0 && datesInMonth.length > 0) {
      fetchReports();
    }
  }, [users, datesInMonth, currentMonth, currentYear]);

  const handleMonthChange = (event) => {
    setCurrentMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event) => {
    setCurrentYear(parseInt(event.target.value, 10));
  };

  const handleReportClick = (userId, date) => {
    const userReports = reports[userId];
    if (userReports && userReports[date]) {
      const reportDetails = userReports[date];
      const user = users.find((user) => user.id === userId);
      const reportDate = date;
      setSelectedReport({ reportDetails, username: user.username, ename: user.ename, reportDate });
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading data...</p>
      </div>
    );
  }
  
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return <p>No users found in ARD department.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">ARD Daily Reports Tracker</h1>

      <div className="flex space-x-4 mb-6">
        <div>
          <label htmlFor="month" className="block">
            Select Month:
          </label>
          <select
            id="month"
            value={currentMonth}
            onChange={handleMonthChange}
            className="p-2 border border-gray-300"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={index}>
                {new Date(2021, index).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block">
            Select Year:
          </label>
          <input
            type="number"
            id="year"
            value={currentYear}
            onChange={handleYearChange}
            className="p-2 border border-gray-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-300 text-left sticky left-0 bg-white z-10">Username</th>
              <th className="px-4 py-2 border border-gray-300 text-center whitespace-nowrap sticky left-0  bg-white z-30">Employee Name</th>
              {datesInMonth.map((date) => (
                <th
                  key={date}
                  className="px-4 py-2 border border-gray-300 text-center text-xs whitespace-nowrap sticky top-0 bg-white z-20"
                >
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 border border-gray-300 whitespace-nowrap sticky left-0 bg-white z-10">{user.username}</td>
                <td className="px-4 py-2 border border-gray-300 whitespace-nowrap sticky left-0 bg-white z-10">{user.ename}</td>
                {datesInMonth.map((date) => (
                  <td
                    key={date}
                    className="px-4 py-2 border border-gray-300 text-center text-xs text-white"
                    onClick={() => handleReportClick(user.id, date)}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        reports[user.id] && reports[user.id][date] ? "#22C55E" : "#f9f9f9",
                    }}
                  >
                    {reports[user.id] && reports[user.id][date] ? "Reported" : " "}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <RepoDetails
        reportDetails={selectedReport?.reportDetails}
        username={selectedReport?.username}
        ename={selectedReport?.ename}
        reportDate={selectedReport?.reportDate}
        onClose={closeModal}
      />
    </div>
  );
};

export default ArdHome;
