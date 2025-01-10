import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrfData,
  setSearchTerm,
  setStatusFilter,
  deleteTrfData,
  setVertical,
  selectTrfData,
  selectLoading,
  selectError,
  selectSearchTerm,
  selectStatusFilter,
  selectVertical,
  setCurrentMonth, selectCurrentMonth
} from '../../../redux/trfSlice';
import Sidebar from '../../../components/HSidebar';
import ScrollableTable from '../../../components/ScrollableTable';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faBasketballBall, faHandHoldingHeart, faPills, faTrash, faChartPie, faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';


const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span key={index} className="bg-yellow-200">{part}</span>
    ) : (
      part
    )
  );
};

const renderRow = (item, index, vertical, searchTerm, handleDelete, userRole, department) => {
  const trfid = item.arnnutra || item.arnayurveda || item.arnpharma || item.arnsports;
  const srn = vertical === 'nt' ? item.ntsrn :
    vertical === 'ay' ? item.aysrn :
      vertical === 'ph' ? item.phsrn :
        vertical === 'sp' ? item.spsrn : '';

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      handleDelete(vertical, trfid);
    }
  };
  //  const isBlurred = !item.receivedby ;
  const isBlurred = !item.receivedby && userRole !== 2;


  return (
    <>
      <td className="border border-gray-300 p-1">{srn}</td>
      <td className="border border-gray-300 p-1">
        {item.trfdate.split('T')[0].split('-').reverse().join('/')}
      </td>
      <td
        className={`border border-gray-300 p-1 ${isBlurred ? 'filter blur-sm opacity-50' : ''
          }`}
        style={isBlurred ? { userSelect: 'none' } : {}}
      >
        {highlightText(
          item.arnprefix +
          (item.arnnutra || item.arnayurveda || item.arnpharma || item.arnsports || 'N/A'),
          searchTerm
        )}
      </td>
      <td className="border border-gray-300 p-1">{highlightText(item.pname, searchTerm)}</td>
      <td className="border border-gray-300 p-1">{item.batchno}</td>

      {/* ARD Status Column */}
      <td className="border border-gray-300 p-1">
        {item.approvedby ? `Approved by: ${item.approvedby}` : 'Not Approved Yet'}
      </td>

      {/* Action Column - Open Button Always Visible */}
      <td className="border border-gray-300 p-1">
        {trfid && (
          <Link to={`/trfs/${vertical}/${trfid}`}>
            <button className="bg-green-500 text-white px-2 py-1 rounded">Open</button>
          </Link>
        )}
      </td>

      {/* Additional Actions */}
      <td className="border-b border-gray-300 py-4 px-2 flex">
        {(userRole === 1 || userRole === 3) && department !== 'frd' && (
          <Link to={`/trfs/${vertical}/view/${trfid}`}>
            <button className="text-blue-500 border border-blue-500 px-2 py-1 rounded">View</button>
          </Link>
        )}
        {userRole === 2 && department === 'frd' && (
          <Link to={`/trfs/${vertical}/view/${trfid}`}>
            <button className="text-blue-500 border border-blue-500 px-2 py-1 rounded">View</button>
          </Link>
        )}
        {userRole === 1 && (
          <button
            onClick={handleDeleteClick}
            className="text-red-500 border border-red-500 px-2 py-1 rounded flex items-center ml-2"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </td>

      {/* Status Cell for UserRoles 1, 3, or 4 */}
      {(userRole === 1 || userRole === 3 || userRole === 4) && department !== 'frd' && (
        <td
          className={`border border-gray-300 p-2 ${!item.receivedby
            ? 'bg-orange-500 text-white'
            : !item.approvedby && item.receivedby && !item.reviewby
              ? 'bg-red-500 text-white'
              : item.reviewby && !item.approvedby
                ? 'bg-green-400 text-white'
                : item.approvedby
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300'
            }`}
        >
          {!item.receivedby
            ? 'Not Received'
            : !item.approvedby && item.receivedby && !item.reviewby
              ? 'Pending'
              : item.reviewby && !item.approvedby
                ? 'Reviewed'
                : item.approvedby
                  ? 'Completed'
                  : 'Unknown'}
        </td>
      )}
    </>


  );
};
// const TrfHomeP = () => {
//   const dispatch = useDispatch();
//   const user = JSON.parse(localStorage.getItem('user'));
//   const userRole = user ? user.auth_role : 4;
//   const department = user ? user.depart : 'frd';
//   const vertical = useSelector(selectVertical);
//   const data = useSelector(selectTrfData);
//   const loading = useSelector(selectLoading);
//   const error = useSelector(selectError);
//   const searchTerm = useSelector(selectSearchTerm);
//   const statusFilter = useSelector(selectStatusFilter);
//   const userVertical = user ? user.vertical : null;
//   const savedMonth = useSelector(selectCurrentMonth);
//   const [currentMonth, setCurrentMonthState] = useState(savedMonth);


//   const handleVerticalChange = (selectedVertical) => {
//     dispatch(setVertical(selectedVertical));
//     localStorage.setItem('vertical', selectedVertical);
//   };

//   useEffect(() => {
//     if (userRole === 2 && userVertical) {
//       dispatch(setVertical(userVertical));
//     }
//   }, [dispatch, userRole, userVertical]);

//   useEffect(() => {
//     if (vertical) {
//       dispatch(fetchTrfData(vertical));
//     }
//   }, [dispatch, vertical]);

//   const filteredData = useMemo(() => {
//     const searchString = searchTerm.toLowerCase();

//     return data.filter(item => {
//       // Date filtering: Matches the current month and year
//       const itemDate = new Date(item.trfdate);
//       const isSameMonthAndYear =
//         itemDate.getMonth() === currentMonth.getMonth() &&
//         itemDate.getFullYear() === currentMonth.getFullYear();

//       // Status filtering: Matches the selected status filter
//       const statusMatch = statusFilter
//         ? (statusFilter === 'Not Received' && !item.receivedby) ||
//         (statusFilter === 'Pending' && item.receivedby && !item.reviewby) ||
//         (statusFilter === 'Reviewed' && item.reviewby) ||
//         (statusFilter === 'Completed' && item.approvedby)
//         : true;

//       // Search filtering: Matches any relevant fields, including ARN numbers
//       const matchesSearch = [
//         item.pname,       // Product name
//         item.arnnutra,    // ARN Nutra
//         item.arnayurveda, // ARN Ayurveda
//         item.arnpharma,   // ARN Pharma
//         item.arnsports    // ARN Sports
//       ].some(
//         field =>
//           typeof field === 'string' && field.toLowerCase().includes(searchString)
//       );

//       // Combine all filters
//       return isSameMonthAndYear && statusMatch && matchesSearch;
//     });
//   }, [data, currentMonth, searchTerm, statusFilter]);

//   const statusCounts = useMemo(() => {
//     const totals = {
//       total: filteredData.length,
//       notReceived: 0,
//       pending: 0,
//       completed: 0
//     };

//     filteredData.forEach(item => {
//       if (!item.receivedby) {
//         totals.notReceived++;
//       } else if (
//         item.receivedby &&
//         (!item.reviewby || !item.approvedby) // Combine logic for reviewby and approvedby
//       ) {
//         totals.pending++;
//       } else if (item.approvedby) {
//         totals.completed++;
//       }
//     });

//     return totals;
//   }, [filteredData]);


//   useEffect(() => {
//     // Load the saved currentMonth from localStorage if available
//     const savedMonth = localStorage.getItem('currentMonth');
//     if (savedMonth) {
//       setCurrentMonthState(new Date(savedMonth));
//       dispatch(setCurrentMonth(new Date(savedMonth)));
//     } else {
//       setCurrentMonthState(new Date());
//     }
//   }, [dispatch]);

//   const changeMonth = (direction) => {
//     const newMonth = new Date(currentMonth);
//     newMonth.setMonth(newMonth.getMonth() + direction);
//     setCurrentMonthState(newMonth);
//     dispatch(setCurrentMonth(newMonth));
//     localStorage.setItem('currentMonth', newMonth.toISOString());
//   };

//   const sortedData = useMemo(() => {
//     return filteredData.sort((a, b) => {
//       const srnA = vertical === 'nt' ? a.ntsrn : vertical === 'ay' ? a.aysrn : vertical === 'ph' ? a.phsrn : a.spsrn;
//       const srnB = vertical === 'nt' ? b.ntsrn : vertical === 'ay' ? b.aysrn : vertical === 'ph' ? b.phsrn : b.spsrn;
//       return srnB - srnA;
//     });
//   }, [filteredData, vertical]);

//   const handleDelete = (vertical, trfid) => {
//     dispatch(deleteTrfData({ vertical, trfid }));
//   };
//   const headers = [
//     'Sr.No.',
//     'Date',
//     'A.R. Number',
//     'Product Name',
//     'Batch No.',
//     'ARD Status',
//     'ROA', // Always displayed
//     'Action', // Always displayed
//     ...(userRole === 1 || userRole === 2 || userRole === 3 || userRole === 4
//       ? department !== 'frd'
//         ? [
//           <div className="flex items-center" key="status-filter">
//             <select
//               value={statusFilter}
//               onChange={(e) => dispatch(setStatusFilter(e.target.value))}
//               className="ml-2 border border-gray-300 rounded-md p-1 bg-gray-50"
//             >
//               <option value="">All Status</option>
//               <option value="Not Received">Not Received</option>
//               <option value="Pending">Pending</option>
//               <option value="Reviewed">Reviewed</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>,
//         ]
//         : []
//       : []),
//   ];
//   const getButtonStyles = (type) => {
//     const labels = {
//       nt: { color: 'orange', label: 'Nutra' },
//       sp: { color: 'yellow', label: 'Sports' },
//       ay: { color: 'green', label: 'Ayurveda' },
//       ph: { color: 'blue', label: 'Pharma' },
//     };
//     return labels[type]; // Return the entire object
//   };
//   const verticalButtons = [
//     { type: 'nt', icon: faHandHoldingHeart },
//     { type: 'sp', icon: faBasketballBall },
//     { type: 'ay', icon: faLeaf },
//     { type: 'ph', icon: faPills },
//   ];
//   const isCurrentMonth = new Date().getMonth() === currentMonth.getMonth() &&
//     new Date().getFullYear() === currentMonth.getFullYear();

//   return (

//     <div className="flex">
//       <Sidebar />
//       <div className="flex-grow ml-60 py-4 px-2 h-screen">
//       <div className="mb-4 flex items-center justify-between space-x-4">

//         <div className="flex space-x-4">
//           {(userRole === 2 && userVertical ? [userVertical] : verticalButtons.map(({ type }) => type)).map((type) => {
//             const { color, label } = getButtonStyles(type);

//             const bgColor = {
//               orange: 'bg-orange-500',
//               yellow: 'bg-yellow-500',
//               green: 'bg-green-500',
//               blue: 'bg-blue-500',
//             }[color];

//             const textColor = {
//               orange: 'text-orange-500',
//               yellow: 'text-yellow-500',
//               green: 'text-green-500',
//               blue: 'text-blue-500',
//             }[color];
//             const borderColor = {
//               orange: 'border-orange-500',
//               yellow: 'border-yellow-500',
//               green: 'border-green-500',
//               blue: 'border-blue-500',
//             }[color];

//             const isSelected = vertical === type;

//             return (
//               <button
//                 key={type}
//                 onClick={() => handleVerticalChange(type)}
//                 className={`py-2 px-2 rounded-md transition ${isSelected ? `${bgColor} text-white border ${borderColor}` : `bg-white ${textColor} border ${borderColor}`}`}
//               >
//                 <FontAwesomeIcon
//                   icon={verticalButtons.find((v) => v.type === type)?.icon || userVertical && type === userVertical && verticalButtons.find((v) => v.type === userVertical)?.icon}
//                   className="mr-2"
//                 />
//                 {label}
//               </button>
//             );
//           })}
//         </div>
//         <div className="relative flex items-center justify-between bg-gray-100 p-2 rounded-md">
//           <button
//             onClick={() => changeMonth(-1)}
//             className="transition"
//           >
//             <FontAwesomeIcon icon={faChevronLeft} />
//           </button>
//           {/* Middle content with fixed width */}
//           <div className="flex items-center justify-center space-x-3 text-[9px] font-normal text-gray-100 flex-1">
//             {/* Fixed width and center-aligned text for the month */}
//             <div className="text-sm text-gray-700 w-32 text-center truncate">
//               {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
//             </div>
//             <div className="bg-blue-400 p-1.5 rounded-md w-20 text-center">
//               Total: <span className="font-normal">{statusCounts.total}</span>
//             </div>
//             <div className="bg-orange-500 p-1.5 rounded-md w-20 text-center">
//               Not Received: <span className="font-normal">{statusCounts.notReceived}</span>
//             </div>
//             <div className="bg-red-500 p-1.5 rounded-md w-20 text-center">
//               Pending: <span className="font-normal">{statusCounts.pending}</span>
//             </div>
//             <div className="bg-green-500 p-1.5 rounded-md w-20 text-center">
//               Completed: <span className="font-normal">{statusCounts.completed}</span>
//             </div>
//           </div>
//           <button
//             onClick={() => changeMonth(1)}
//             className={`ml-2 transition ${isCurrentMonth ? 'cursor-not-allowed opacity-50' : ''}`}
//             disabled={isCurrentMonth}
//           >
//             <FontAwesomeIcon icon={faChevronRight} />
//           </button>
//         </div>


//       </div>
//       {/* Check if no vertical is selected and display message */}
//       {!vertical ? (
//         <div className="text-center text-red-500 font-semibold mt-8">
//           Please select a vertical to continue.
//         </div>
//       ) : loading ? (
//         <Skeleton count={20} />
//       ) : error ? (
//         <div className="text-red-500">{error}</div>
//       ) : (
//         <ScrollableTable
//           headers={headers}
//           data={sortedData}
//           renderRow={(item, index) => renderRow(item, index, vertical, searchTerm, handleDelete, userRole, department)}
//           vertical={vertical}
//           searchTerm={searchTerm}
//         />
//       )}
//     </div>
//     </div>
//   );
// };

// export default TrfHomeP;
const TrfHomeP = () => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user ? user.auth_role : 4;
  const department = user ? user.depart : 'frd';
  const vertical = useSelector(selectVertical);
  const data = useSelector(selectTrfData);
  const error = useSelector(selectError);
  const searchTerm = useSelector(selectSearchTerm);
  const statusFilter = useSelector(selectStatusFilter);
  const userVertical = user ? user.vertical : null;
  const savedMonth = useSelector(selectCurrentMonth);
  const [currentMonth, setCurrentMonthState] = useState(savedMonth);

  const handleVerticalChange = (selectedVertical) => {
    dispatch(setVertical(selectedVertical));
    localStorage.setItem('vertical', selectedVertical);
  };

  useEffect(() => {
    if (userRole === 2 && userVertical) {
      dispatch(setVertical(userVertical));
    }
  }, [dispatch, userRole, userVertical]);

  useEffect(() => {
    if (vertical) {
      dispatch(fetchTrfData(vertical));
    }
  }, [dispatch, vertical]);

  const filteredData = useMemo(() => {
    const searchString = searchTerm.toLowerCase();

    return data.filter(item => {
      const itemDate = new Date(item.trfdate);
      const isSameMonthAndYear =
        itemDate.getMonth() === currentMonth.getMonth() &&
        itemDate.getFullYear() === currentMonth.getFullYear();

      const statusMatch = statusFilter
        ? (statusFilter === 'Not Received' && !item.receivedby) ||
          (statusFilter === 'Pending' && item.receivedby && !item.reviewby) ||
          (statusFilter === 'Reviewed' && item.reviewby) ||
          (statusFilter === 'Completed' && item.approvedby)
        : true;

      const matchesSearch = [
        item.pname, item.arnnutra, item.arnayurveda, item.arnpharma, item.arnsports
      ].some(field => typeof field === 'string' && field.toLowerCase().includes(searchString));

      return isSameMonthAndYear && statusMatch && matchesSearch;
    });
  }, [data, currentMonth, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    const totals = {
      total: filteredData.length,
      notReceived: 0,
      pending: 0,
      completed: 0
    };

    filteredData.forEach(item => {
      if (!item.receivedby) {
        totals.notReceived++;
      } else if (item.receivedby && (!item.reviewby || !item.approvedby)) {
        totals.pending++;
      } else if (item.approvedby) {
        totals.completed++;
      }
    });

    return totals;
  }, [filteredData]);

  useEffect(() => {
    const savedMonth = localStorage.getItem('currentMonth');
    if (savedMonth) {
      setCurrentMonthState(new Date(savedMonth));
      dispatch(setCurrentMonth(new Date(savedMonth)));
    } else {
      setCurrentMonthState(new Date());
    }
  }, [dispatch]);

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonthState(newMonth);
    dispatch(setCurrentMonth(newMonth));
    localStorage.setItem('currentMonth', newMonth.toISOString());
  };

  const sortedData = useMemo(() => {
    return filteredData.sort((a, b) => {
      const srnA = vertical === 'nt' ? a.ntsrn : vertical === 'ay' ? a.aysrn : vertical === 'ph' ? a.phsrn : a.spsrn;
      const srnB = vertical === 'nt' ? b.ntsrn : vertical === 'ay' ? b.aysrn : vertical === 'ph' ? b.phsrn : b.spsrn;
      return srnB - srnA;
    });
  }, [filteredData, vertical]);

  const handleDelete = (vertical, trfid) => {
    dispatch(deleteTrfData({ vertical, trfid }));
  };

  const headers = [
    'Sr.No.',
    'Date',
    'A.R. Number',
    'Product Name',
    'Batch No.',
    'ARD Status',
    'ROA',
    'Action',
    ...(userRole === 1 || userRole === 2 || userRole === 3 || userRole === 4
      ? department !== 'frd'
        ? [
          <div className="flex items-center" key="status-filter">
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="ml-2 border border-gray-300 rounded-md p-1 bg-gray-50"
            >
              <option value="">All Status</option>
              <option value="Not Received">Not Received</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>,
        ]
        : []
      : []),
  ];

  const getButtonStyles = (type) => {
    const labels = {
      nt: { color: 'orange', label: 'Nutra' },
      sp: { color: 'yellow', label: 'Sports' },
      ay: { color: 'green', label: 'Ayurveda' },
      ph: { color: 'blue', label: 'Pharma' },
    };
    return labels[type];
  };

  const verticalButtons = [
    { type: 'nt', icon: faHandHoldingHeart },
    { type: 'sp', icon: faBasketballBall },
    { type: 'ay', icon: faLeaf },
    { type: 'ph', icon: faPills },
  ];

  const isCurrentMonth = new Date().getMonth() === currentMonth.getMonth() &&
    new Date().getFullYear() === currentMonth.getFullYear();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow ml-60 py-4 px-2 h-screen">
        <div className="mb-4 flex items-center justify-between space-x-4">
          <div className="flex space-x-4">
            {(userRole === 2 && userVertical ? [userVertical] : verticalButtons.map(({ type }) => type)).map((type) => {
              const { color, label } = getButtonStyles(type);
              const bgColor = {
                orange: 'bg-orange-500',
                yellow: 'bg-yellow-500',
                green: 'bg-green-500',
                blue: 'bg-blue-500',
              }[color];

              const textColor = {
                orange: 'text-orange-500',
                yellow: 'text-yellow-500',
                green: 'text-green-500',
                blue: 'text-blue-500',
              }[color];
              const borderColor = {
                orange: 'border-orange-500',
                yellow: 'border-yellow-500',
                green: 'border-green-500',
                blue: 'border-blue-500',
              }[color];

              const isSelected = vertical === type;

              return (
                <button
                  key={type}
                  onClick={() => handleVerticalChange(type)}
                  className={`py-2 px-2 rounded-md transition ${isSelected ? `${bgColor} text-white border ${borderColor}` : `bg-white ${textColor} border ${borderColor}`}`}
                >
                  <FontAwesomeIcon
                    icon={verticalButtons.find((v) => v.type === type)?.icon || userVertical && type === userVertical && verticalButtons.find((v) => v.type === userVertical)?.icon}
                    className="mr-2"
                  />
                  {label}
                </button>
              );
            })}
          </div>
          <div className="relative flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <button
              onClick={() => changeMonth(-1)}
              className="transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="flex items-center justify-center space-x-3 text-[9px] font-normal text-gray-100 flex-1">
              <div className="text-sm text-gray-700 w-32 text-center truncate">
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
              </div>
              <div className="bg-blue-400 p-1.5 rounded-md w-20 text-center">
                Total: <span className="font-normal">{statusCounts.total}</span>
              </div>
              <div className="bg-orange-500 p-1.5 rounded-md w-20 text-center">
                Not Received: <span className="font-normal">{statusCounts.notReceived}</span>
              </div>
              <div className="bg-red-500 p-1.5 rounded-md w-20 text-center">
                Pending: <span className="font-normal">{statusCounts.pending}</span>
              </div>
              <div className="bg-green-500 p-1.5 rounded-md w-20 text-center">
                Completed: <span className="font-normal">{statusCounts.completed}</span>
              </div>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className={`ml-2 transition ${isCurrentMonth ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={isCurrentMonth}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        {/* Conditional rendering based on error */}
        {!vertical ? (
          <div className="text-center text-red-500 font-semibold mt-8">
            Please select a vertical to continue.
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ScrollableTable
            headers={headers}
            data={sortedData}
            renderRow={(item, index) => renderRow(item, index, vertical, searchTerm, handleDelete, userRole, department)}
            vertical={vertical}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default TrfHomeP;
