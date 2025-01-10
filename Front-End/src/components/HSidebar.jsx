import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faClipboardList, faFileAlt, faHome, faUser, faList, faLeaf, faRunning, faCapsules, faUserMd, faPrescriptionBottleMedical, faScaleBalanced } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  // Default links
  const defaultLinks = [
    { path: '/home', icon: faHome, label: 'Home' },
    { path: '/profile', icon: faUser, label: 'Profile' },
  ];

  // Route-specific links
  const routeSpecificLinks = {
    '/Products-reporting': [
      { path: '/Products-reporting', label: 'Add Product', icon: faPlus },
      { path: '/Products-reporting/all-products', label: 'All Products', icon: faList },
    ],
    '/daily-reporting': [
      { path: '/daily-reporting', label: 'Reporting', icon: faFileAlt },
      { path: '/daily-reporting/quarterly-reporting', label: 'Quarterly Report', icon: faClipboardList },
    ],
    '/trfs': (vertical) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const username = user ? user.username : '';
      const allowedUsernames = ['101', '201', '301', '401'];
      const canGenerateTRF = allowedUsernames.includes(username);

      const links = [];
      if (canGenerateTRF) {
        links.push({ path: `/trfs/${vertical}/test-request-form`, label: 'Generate TRF Number', icon: faPlus });
      }
      return links;
    },
    '/OldDashBoard': [
      { path: '/OldDashBoard/Nutra', label: 'Nutra', icon: faLeaf },
      { path: '/OldDashBoard/Sports', label: 'Sports', icon: faRunning },
      { path: '/OldDashBoard/ayurveda', label: 'Ayurveda', icon: faUserMd },
      { path: '/OldDashBoard/pharma-fp', label: 'Pharma FP', icon: faCapsules },
      { path: '/OldDashBoard/pharma-ip', label: 'Pharma IP', icon: faPrescriptionBottleMedical },
      { path: '/OldDashBoard/raw-material', label: 'Raw Material', icon: faList },
      { path: '/OldDashBoard/stability', label: 'Stability', icon: faScaleBalanced },
      { path: '/OldDashBoard/ni-value', label: 'Ni Value', icon: faList },
    ],
  };

  // Determine the current path
  const currentPath = location.pathname.includes('/trfs/test-request-form') ? '/trfs' : location.pathname;

  let specificLinks;
  if (currentPath.startsWith('/Products-reporting')) {
    specificLinks = routeSpecificLinks['/Products-reporting'];
  } else if (currentPath.startsWith('/daily-reporting')) {
    specificLinks = routeSpecificLinks['/daily-reporting'];
  } else if (currentPath.startsWith('/OldDashBoard')) {
    specificLinks = routeSpecificLinks['/OldDashBoard'];
  } else if (currentPath.startsWith('/trfs')) {
    const vertical = JSON.parse(localStorage.getItem('user'))?.vertical || 'default';
    specificLinks = routeSpecificLinks['/trfs'](vertical);
  } else {
    specificLinks = routeSpecificLinks[currentPath] || [];
  }

  // User department and background color logic
  const user = JSON.parse(localStorage.getItem('user'));
  const vertical = user ? user.vertical : 'default';
  const department = user ? user.depart : 'default';

  let title, description, bgColor;
  if (department === 'frd') {
    title = 'F.R.D.';
    description = 'Formulation Research and Development';
    bgColor = 'bg-orange-500';
  } else if (department === 'ard') {
    title = 'A.R.D.';
    description = 'Analytical Research Development';
    bgColor = 'bg-gradient-to-l from-sky-800 to-indigo-600';
  } else {
    title = 'T.I.C.';
    description = 'Tirupati Innovation Centre';
    bgColor = 'bg-gradient-to-l from-sky-800 to-indigo-600';
  }

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed top-20 left-0 flex-col w-60 h-full ${bgColor} text-white p-5 shadow-md`}>
      <h1 className="text-5xl font-bold mb-2 text-white text-center">{title}</h1>
      <p className="text-sm text-center mb-3">{description}</p>
      <hr className="w-full pb-6" />

      {/* Links Container */}
      <div className="flex-grow ">
        {/* Default Links */}
        {defaultLinks.map(({ path, icon, label }) => (
          <div className="mb-6" key={path}>
            <Link
              to={path}
              className={`flex items-center p-2 mb-2 rounded-lg transition-colors w-full ${isActive(path) ? 'bg-white text-gray-600' : 'bg-gray-700 text-white'} hover:bg-white hover:text-gray-600`}
            >
              <FontAwesomeIcon icon={icon} className="mr-2" />
              <span className="text-sm">{label}</span>
            </Link>
          </div>
        ))}

        {/* Route-Specific Links */}
        {specificLinks.map(({ path, label, icon }) => (
          <div className="mb-6" key={path}>
            <Link
              to={path}
              className={`flex items-center p-2 mb-2 rounded-lg transition-colors w-full ${isActive(path) ? 'bg-white text-gray-600' : 'bg-gray-700 text-white'} hover:bg-white hover:text-gray-600`}
            >
              <FontAwesomeIcon icon={icon} className="mr-2" />
              <span className="text-sm">{label}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
