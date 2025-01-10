// MonthYearSelector.js
import React from 'react';

const MonthYearSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const today = new Date();

  return (
    <div className="flex items-center">
      <select value={selectedMonth} onChange={onMonthChange} className="mr-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <option key={index} value={index}>
            {new Date(0, index).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>
      <select value={selectedYear} onChange={onYearChange}>
        {Array.from({ length: 20 }).map((_, index) => {
          const year = today.getFullYear() - 10 + index; // Show a range of 20 years
          return (
            <option key={index} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default MonthYearSelector;
