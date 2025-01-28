
// import React, { useState, useEffect } from 'react';
// import api from '../../../api/axios';
// import Sidebar from '../../../components/HSidebar';
// import Qtr_Calendar from './Qtr_Calendar';
// import Select from 'react-select';

// const QuarterlyReport = () => {
//     const [users, setUsers] = useState([]);
//     const [prefixOptions, setPrefixOptions] = useState({
//         one_prefix_column: [],
//         two_prefix_column: [],
//         three_prefix_column: [],
//         four_prefix_column: [],
//     });
//     const [userData, setUserData] = useState({
//         username: '',
//         date: '',
//         one_prefix_column: '',
//         two_prefix_column: '',
//         three_prefix_column: '',
//         four_prefix_column: '',
//         onLeave: false,
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [calendarKey, setCalendarKey] = useState(0); // New state for triggering re-render

//     useEffect(() => {
//         // Fetch users when the component loads
//         api
//             .get('/api/pass-users')
//             .then((response) => setUsers(response.data))
//             .catch((error) => console.error('Error fetching users:', error));
//     }, []);

//     const fetchPrefixes = (inputValue, columnName) => {
//         if (!inputValue) return;

//         api
//             .get('/search-prefix-columns', { params: { search: inputValue } }) // Send inputValue to search both pname and prepix
//             .then((response) => {
//                 setPrefixOptions((prevOptions) => ({
//                     ...prevOptions,
//                     [columnName]: response.data.map((product) => ({
//                         value: product.prepix,
//                         label: `${product.pname} - ${product.prepix}`, // Format as pname - prepix
//                     })),
//                 }));
//             })
//             .catch((error) => console.error(`Error fetching prefixes for ${columnName}:`, error));
//     };

//     const handlePrefixChange = (selectedOption, columnName) => {
//         setUserData((prevData) => ({
//             ...prevData,
//             [columnName]: selectedOption ? selectedOption.value : '',
//         }));
//     };

//     const handleLeaveChange = () => {
//         setUserData((prevData) => {
//             if (!prevData.onLeave) {
//                 return {
//                     ...prevData,
//                     onLeave: true,
//                     one_prefix_column: 'On leave',
//                     two_prefix_column: 'On leave',
//                     three_prefix_column: 'On leave',
//                     four_prefix_column: 'On leave',
//                 };
//             } else {
//                 return {
//                     ...prevData,
//                     onLeave: false,
//                     one_prefix_column: '',
//                     two_prefix_column: '',
//                     three_prefix_column: '',
//                     four_prefix_column: '',
//                 };
//             }
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');
//         setLoading(true);

//         try {
//             // Submit the report
//             const reportData = userData.onLeave
//                 ? {
//                     ...userData,
//                     one_prefix_column: 'On leave',
//                     two_prefix_column: 'On leave',
//                     three_prefix_column: 'On leave',
//                     four_prefix_column: 'On leave',
//                 }
//                 : userData;

//             const response = await api.post('/qtr-report', reportData);

//             // Show success alert
//             alert(response.data.message);

//             // Clear the form data after successful submission
//             setUserData({
//                 username: '', // Clear the user data
//                 date: '',
//                 one_prefix_column: '',
//                 two_prefix_column: '',
//                 three_prefix_column: '',
//                 four_prefix_column: '',
//                 onLeave: false,
//             });

//             // Reset calendar (refresh calendar component by updating the key)
//             setCalendarKey(prevKey => prevKey + 1); // Increment the calendar key to trigger re-render

//         } catch (error) {
//             if (error.response && error.response.data && error.response.data.error) {
//                 // Show error alert
//                 alert(error.response.data.error);
//             } else {
//                 // Show generic error alert
//                 alert('An unexpected error occurred. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const userOptions = users.map((user) => ({
//         value: user.username,
//         label: `${user.username} - ${user.ename}`,
//     }));

//     return (
//         <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
//             <Sidebar />
//             <div className="flex-grow ml-60 p-8 bg-gray-50">
//                 <header className="text-center mb-8">
//                     <h1 className="text-3xl font-bold text-gray-800">Quarterly Report</h1>
//                     <p className="text-gray-600 mt-2">Manage and track your quarterly reports efficiently.</p>
//                 </header>
//                 <div className="flex flex-col lg:flex-row gap-8">
                    
//                     <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/2 space-y-6">
//                         {/* Display error or success messages */}
//                         {error && <p className="text-red-600">{error}</p>}
//                         {success && <p className="text-green-600">{success}</p>}
//                         <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Today's Reporting</h2>
//                         {/* User Selection */}
//                         <div className="flex items-center mb-4">

//                             <label className="text-gray-700 font-medium mr-4 w-1/4">User:</label>
//                             <div className="w-3/4">
//                                 <Select
//                                     options={userOptions}
//                                     value={userOptions.find((option) => option.value === userData.username) || null}
//                                     onChange={(selectedOption) =>
//                                         setUserData({ ...userData, username: selectedOption.value })
//                                     }
//                                     className="w-full"
//                                     placeholder="Select a User"
//                                     isSearchable
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Date Input */}
//                         <div className="flex items-center mb-4">
//                             <label className="text-gray-700 font-medium mr-4 w-1/4">Date:</label>
//                             <input
//                                 type="date"
//                                 name="date"
//                                 value={userData.date}
//                                 onChange={(e) => setUserData({ ...userData, date: e.target.value })}
//                                 required
//                                 className="w-3/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>

//                         {/* Quarterly Reporting Fields */}
//                         <div className="space-y-4">
//                             {['one_prefix_column', 'two_prefix_column', 'three_prefix_column', 'four_prefix_column']
//                                 .reduce((result, columnName, index, array) => {
//                                     if (index % 2 === 0) {
//                                         result.push(array.slice(index, index + 2)); // Group two items per row
//                                     }
//                                     return result;
//                                 }, [])
//                                 .map((pair, rowIndex) => (
//                                     <div key={rowIndex} className="flex gap-4">
//                                         {pair.map((columnName, index) => (
//                                             <div key={columnName} className="w-1/2">
//                                                 <label className="block text-gray-700 font-medium mb-1">
//                                                     {`${rowIndex * 2 + index + 1}${index === 0 ? 'st' : 'nd'} Qtr:`}
//                                                 </label>
//                                                 <Select
//                                                     options={prefixOptions[columnName]}
//                                                     onInputChange={(inputValue) => fetchPrefixes(inputValue, columnName)}
//                                                     value={
//                                                         userData[columnName]
//                                                             ? { value: userData[columnName], label: userData[columnName] }
//                                                             : null
//                                                     }
//                                                     onChange={(selectedOption) =>
//                                                         handlePrefixChange(selectedOption, columnName)
//                                                     }
//                                                     className="w-full"
//                                                     placeholder={`Add    ${rowIndex * 2 + index + 1}${index === 0 ? 'st' : 'nd'} Qtr Work`}
//                                                     isSearchable
//                                                     isDisabled={userData.onLeave}
//                                                     required={!userData.onLeave}
//                                                 />
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ))}
//                         </div>

//                         {/* On Leave Checkbox */}
//                         <div className="flex items-center mb-4">
//                             <input
//                                 type="checkbox"
//                                 id="onLeave"
//                                 name="onLeave"
//                                 checked={userData.onLeave}
//                                 onChange={handleLeaveChange}
//                                 className="mr-2"
//                             />
//                             <label htmlFor="onLeave" className="text-gray-700 font-medium">
//                                 On Leave
//                             </label>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex justify-between">
//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     setUserData({
//                                         ...userData,
//                                         one_prefix_column: '',
//                                         two_prefix_column: '',
//                                         three_prefix_column: '',
//                                         four_prefix_column: '',
//                                     })
//                                 }
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
//                                 disabled={loading}
//                             >
//                                 Clear
//                             </button>
//                             <button
//                                 type="submit"
//                                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
//                                 disabled={loading}
//                             >
//                                 {loading ? 'Submitting...' : 'Submit'}
//                             </button>
//                         </div>
//                     </form>


//                     <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full lg:w-1/2">
//                         <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Calendar</h2>
//                         <div className="max-h-[500px]">
//                             <Qtr_Calendar key={calendarKey} /> {/* Pass calendarKey to refresh the calendar */}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QuarterlyReport;
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import Sidebar from '../../../components/HSidebar';
import Qtr_Calendar from './Qtr_Calendar';
import Select from 'react-select';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const QuarterlyReport = () => {
    const [users, setUsers] = useState([]);
    const [prefixOptions, setPrefixOptions] = useState({
        one_prefix_column: [],
        two_prefix_column: [],
        three_prefix_column: [],
        four_prefix_column: [],
    });
    const [userData, setUserData] = useState({
        username: '',
        date: '',
        one_prefix_column: '',
        two_prefix_column: '',
        three_prefix_column: '',
        four_prefix_column: '',
        onLeave: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [calendarKey, setCalendarKey] = useState(0);
    const [reports, setReports] = useState([]);  // For storing reports data
    const [errorMessage, setErrorMessage] = useState(''); // For errors in fetching reports
    const [isLoading, setIsLoading] = useState(true);  // To track if reports are loading
    const [expandedReportId, setExpandedReportId] = useState(null); // For expanding/collapsing report details

    useEffect(() => {
        // Fetch users when the component loads
        api
            .get('/api/pass-users')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Error fetching users:', error));
        
        // Fetch reports
        api
            .get('/api/reports') // Adjust this endpoint as per your API
            .then((response) => {
                setReports(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                setErrorMessage('Error fetching reports.');
                setIsLoading(false);
            });
    }, []);

    const fetchPrefixes = (inputValue, columnName) => {
        if (!inputValue) return;

        api
            .get('/search-prefix-columns', { params: { search: inputValue } })
            .then((response) => {
                setPrefixOptions((prevOptions) => ({
                    ...prevOptions,
                    [columnName]: response.data.map((product) => ({
                        value: product.prepix,
                        label: `${product.pname} - ${product.prepix}`,
                    })),
                }));
            })
            .catch((error) => console.error(`Error fetching prefixes for ${columnName}:`, error));
    };

    const handlePrefixChange = (selectedOption, columnName) => {
        setUserData((prevData) => ({
            ...prevData,
            [columnName]: selectedOption ? selectedOption.value : '',
        }));
    };

    const handleLeaveChange = () => {
        setUserData((prevData) => {
            if (!prevData.onLeave) {
                return {
                    ...prevData,
                    onLeave: true,
                    one_prefix_column: 'On leave',
                    two_prefix_column: 'On leave',
                    three_prefix_column: 'On leave',
                    four_prefix_column: 'On leave',
                };
            } else {
                return {
                    ...prevData,
                    onLeave: false,
                    one_prefix_column: '',
                    two_prefix_column: '',
                    three_prefix_column: '',
                    four_prefix_column: '',
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const reportData = userData.onLeave
                ? {
                    ...userData,
                    one_prefix_column: 'On leave',
                    two_prefix_column: 'On leave',
                    three_prefix_column: 'On leave',
                    four_prefix_column: 'On leave',
                }
                : userData;

            const response = await api.post('/qtr-report', reportData);

            alert(response.data.message);
            setUserData({
                username: '',
                date: '',
                one_prefix_column: '',
                two_prefix_column: '',
                three_prefix_column: '',
                four_prefix_column: '',
                onLeave: false,
            });

            setCalendarKey((prevKey) => prevKey + 1);  // Refresh calendar
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (report) => {
        // Handle edit report logic
        alert(`Edit report ${report.report_id}`);
    };

    const handleDelete = (reportId) => {
        // Handle delete report logic
        alert(`Delete report ${reportId}`);
    };

    const handleToggleExpand = (reportId) => {
        setExpandedReportId((prevId) => (prevId === reportId ? null : reportId));
    };

    const userOptions = users.map((user) => ({
        value: user.username,
        label: `${user.username} - ${user.ename}`,
    }));

    return (
        <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-grow ml-60 p-8 bg-gray-50">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Quarterly Report</h1>
                    <p className="text-gray-600 mt-2">Manage and track your quarterly reports efficiently.</p>
                </header>
                <div className="flex flex-col lg:flex-row gap-8">
                    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/2 space-y-6">
                        {error && <p className="text-red-600">{error}</p>}
                        {success && <p className="text-green-600">{success}</p>}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Today's Reporting</h2>
                        <div className="flex items-center mb-4">
                            <label className="text-gray-700 font-medium mr-4 w-1/4">User:</label>
                            <div className="w-3/4">
                                <Select
                                    options={userOptions}
                                    value={userOptions.find((option) => option.value === userData.username) || null}
                                    onChange={(selectedOption) =>
                                        setUserData({ ...userData, username: selectedOption.value })
                                    }
                                    className="w-full"
                                    placeholder="Select a User"
                                    isSearchable
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center mb-4">
                            <label className="text-gray-700 font-medium mr-4 w-1/4">Date:</label>
                            <input
                                type="date"
                                name="date"
                                value={userData.date}
                                onChange={(e) => setUserData({ ...userData, date: e.target.value })}
                                required
                                className="w-3/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-4">
                            {['one_prefix_column', 'two_prefix_column', 'three_prefix_column', 'four_prefix_column']
                                .reduce((result, columnName, index, array) => {
                                    if (index % 2 === 0) {
                                        result.push(array.slice(index, index + 2));
                                    }
                                    return result;
                                }, [])
                                .map((pair, rowIndex) => (
                                    <div key={rowIndex} className="flex gap-4">
                                        {pair.map((columnName, index) => (
                                            <div key={columnName} className="w-1/2">
                                                <label className="block text-gray-700 font-medium mb-1">
                                                    {`${rowIndex * 2 + index + 1}${index === 0 ? 'st' : 'nd'} Qtr:`}
                                                </label>
                                                <Select
                                                    options={prefixOptions[columnName]}
                                                    onInputChange={(inputValue) => fetchPrefixes(inputValue, columnName)}
                                                    value={
                                                        userData[columnName]
                                                            ? { value: userData[columnName], label: userData[columnName] }
                                                            : null
                                                    }
                                                    onChange={(selectedOption) =>
                                                        handlePrefixChange(selectedOption, columnName)
                                                    }
                                                    className="w-full"
                                                    placeholder={`Add ${rowIndex * 2 + index + 1}${index === 0 ? 'st' : 'nd'} Qtr Work`}
                                                    isSearchable
                                                    isDisabled={userData.onLeave}
                                                    required={!userData.onLeave}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>

                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="onLeave"
                                name="onLeave"
                                checked={userData.onLeave}
                                onChange={handleLeaveChange}
                                className="mr-2"
                            />
                            <label htmlFor="onLeave" className="text-gray-700 font-medium">
                                On Leave
                            </label>
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() =>
                                    setUserData({
                                        ...userData,
                                        one_prefix_column: '',
                                        two_prefix_column: '',
                                        three_prefix_column: '',
                                        four_prefix_column: '',
                                    })
                                }
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                                disabled={loading}
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>

                    <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full lg:w-1/2">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Calendar</h2>
                        <div className="max-h-[500px]">
                            <Qtr_Calendar key={calendarKey} />
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
                            {reports.map((report) => {
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

export default QuarterlyReport;
