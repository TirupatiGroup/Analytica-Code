import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClipboard, faUpload } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ user, onUpload }) => {
  // Default user data in case user is undefined
  const defaultUser = {
    photo: 'https://via.placeholder.com/150',
    name: 'Guest User',
    designation: 'N/A',
    department: 'N/A',
  };

  // Use the provided user data or fallback to defaultUser
  const displayUser = user || defaultUser;

  return (
    <div className="flex flex-col w-64 bg-gray-100 p-4 shadow-lg h-screen">
      <div className="flex flex-col items-center mb-6">
        <img
          src={displayUser.photo}
          alt="Profile"
          className="w-24 h-24 rounded-full mb-2 cursor-pointer"
          onClick={onUpload}
        />
        <h2 className="text-lg font-semibold">{displayUser.name}</h2>
        <p className="text-sm text-gray-600">{displayUser.designation}</p>
        <p className="text-sm text-gray-600">{displayUser.department}</p>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link to="/profile/details" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded">
          <FontAwesomeIcon icon={faUser} className="mr-2" />
          Profile Details
        </Link>
        <Link to="/profile/report" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded">
          <FontAwesomeIcon icon={faClipboard} className="mr-2" />
          Create Daily Report
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
