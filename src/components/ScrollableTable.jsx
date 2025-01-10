import React from 'react';

const ScrollableTable = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-auto mt-2 h-full ml-2 text-xs rounded-md">
      <table className="min-w-full border border-gray-300 text-center table-auto">
        <thead className="bg-gray-200">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-gray-300 p-2 sticky top-0 bg-gray-200 z-10"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}  className="hover:bg-gray-100 transition text-[85%] " >
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScrollableTable;
