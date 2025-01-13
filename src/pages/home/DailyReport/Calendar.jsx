
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = () => {
  const [reportedDates, setReportedDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  // Get userId and userName from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id);
      setUserName(user.ename);  // Assuming the user object contains a name
    }
  }, []);

  // Fetch reported dates for the logged-in user
  useEffect(() => {
    if (userId) {
      fetchReportedDates(userId).then((dates) => {
        setReportedDates(dates);
        // console.log("Reported Dates:", dates);  // Log only the reported dates here
      });
    }
  }, [userId]);

  // Fetch reported dates from the backend
  const fetchReportedDates = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:3000/reports/user/${userId}`);
      // console.log('Backend Response:', res.data);  // Log backend response for debugging

      // Map over the response and convert the date string to a valid Date object
      const reportedDates = res.data.map((dateString) => {
        const [day, month, year] = dateString.split('/');
        const formattedDate = new Date(year, month - 1, day);

        if (isNaN(formattedDate)) {
          console.error('Invalid date:', dateString);
          return null;
        }

        return formattedDate.toLocaleDateString('en-GB');
      }).filter(date => date !== null);

      // console.log("Formatted Reported Dates:", reportedDates);
      return reportedDates;
    } catch (err) {
      console.error('Error fetching reported dates:', err);
      return [];
    }
  };

  // Get the days in the current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = [];
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - startDate.getDay());  // Start from previous month's last few days if needed

    for (let day = 0; day < 42; day++) { // We can fit 6 rows (6 weeks) in a month view
      daysInMonth.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }

    return daysInMonth;
  };

  // Check if a date is Sunday
  const isSunday = (date) => date.getDay() === 0;

  // Check if a date is a reported date
  const isReported = (date) => {
    const formattedDate = date.toLocaleDateString('en-GB');
    return reportedDates.includes(formattedDate);
  };

  // Handle the previous and next month
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Get the name of the month and year
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-100 to-blue-300 p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="text-5xl text-blue-600 hover:text-blue-800 transition-all duration-300 transform active:scale-95">
          &lt;
        </button>
        <div className="text-center">
          <h2 className="text-md font-bold text-gray-700">{userName}'s Reporting</h2>
          <p className="text-sm text-gray-500">{monthName} {year}</p>
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="text-5xl text-blue-600 hover:text-blue-800 transition-all duration-300 transform active:scale-95">
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-gray-700">{day}</div>
        ))}

        {getDaysInMonth(currentDate).map((day) => {
          const isDaySunday = isSunday(day);
          const isDayReported = isReported(day);
          const isCurrentMonthDay = day.getMonth() === currentDate.getMonth();

          // Set background classes for different days
          let dayClass = 'bg-white text-gray-800 border shadow-md cursor-pointer';

          if (!isCurrentMonthDay) {
            dayClass = 'bg-gray-200 text-gray-400 cursor-not-allowed'; // Previous/Next month day
          } else if (isDayReported) {
            dayClass = 'bg-green-500 text-white shadow-lg cursor-pointer';
          } else if (isDaySunday) {
            dayClass = 'bg-red-500 text-white shadow-lg cursor-pointer';
          }

          return (
            <div key={day} className={`flex flex-col items-center justify-center p-2 border border-gray-300 rounded-lg ${dayClass}`}>
              <span className="text-lg font-semibold">
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
