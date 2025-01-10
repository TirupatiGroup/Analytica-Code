import React, { Component } from 'react';
import Sidebar from '../../../components/HSidebar'; // Ensure Sidebar is correctly imported
import ScrollableTable from '../../../components/ScrollableTable'; // Ensure this is needed
import MonthYearSelector from '../../../components/MonthYearSelector'; // Import MonthYearSelector
// Import any other necessary components or data

export default class Nutra extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
      selectedMonth: today.getMonth(),
      selectedYear: today.getFullYear(),
    };
  }

  handleMonthChange = (event) => {
    this.setState({ selectedMonth: Number(event.target.value) });
  };

  handleYearChange = (event) => {
    this.setState({ selectedYear: Number(event.target.value) });
  };

  getCurrentMonthRange = (year, month) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return { startDate, endDate };
  };

  getDateHeaders = (startDate, endDate) => {
    const headers = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      headers.push(currentDate.toLocaleDateString('en-GB')); // Format as dd/mm/yyyy
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return headers;
  };

  render() {
    const { selectedMonth, selectedYear } = this.state;
    const { startDate, endDate } = this.getCurrentMonthRange(selectedYear, selectedMonth);
    const headers = this.getDateHeaders(startDate, endDate);

    return (
      <div className='flex'>
        <Sidebar />
        <div className="w-[80%] p-4 bg-gray-50 rounded-lg shadow-md flex-1 h-screen">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-300 p-2 flex justify-between items-center">
            <h1 className="text-2xl font-bold">ARD - Daily Work Report</h1>
            <MonthYearSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={this.handleMonthChange}
              onYearChange={this.handleYearChange}
            />
          </div>
          <ScrollableTable headers={headers} />
        </div>
      </div>
    );
  }
}
