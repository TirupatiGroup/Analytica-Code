import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../../components/HSidebar';
import Qtr_Calendar from './Qtr_Calendar';
import Select from 'react-select';

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
    const [calendarKey, setCalendarKey] = useState(0); // New state for triggering re-render

    useEffect(() => {
        // Fetch users when the component loads
        axios
            .get('http://localhost:3000/api/pass-users')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    const fetchPrefixes = (inputValue, columnName) => {
        if (!inputValue) return;

        axios
            .get('http://localhost:3000/search-prefix-columns', { params: { search: inputValue } }) // Send inputValue to search both pname and prepix
            .then((response) => {
                setPrefixOptions((prevOptions) => ({
                    ...prevOptions,
                    [columnName]: response.data.map((product) => ({
                        value: product.prepix,
                        label: `${product.pname} - ${product.prepix}`, // Format as pname - prepix
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
            // Submit the report
            const reportData = userData.onLeave
                ? {
                    ...userData,
                    one_prefix_column: 'On leave',
                    two_prefix_column: 'On leave',
                    three_prefix_column: 'On leave',
                    four_prefix_column: 'On leave',
                }
                : userData;

            const response = await axios.post('http://localhost:3000/qtr-report', reportData);

            // Show success alert
            alert(response.data.message);

            // Clear the form data after successful submission
            setUserData({
                username: '', // Clear the user data
                date: '',
                one_prefix_column: '',
                two_prefix_column: '',
                three_prefix_column: '',
                four_prefix_column: '',
                onLeave: false,
            });

            // Reset calendar (refresh calendar component by updating the key)
            setCalendarKey(prevKey => prevKey + 1); // Increment the calendar key to trigger re-render

        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                // Show error alert
                alert(error.response.data.error);
            } else {
                // Show generic error alert
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
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
                        {/* Display error or success messages */}
                        {error && <p className="text-red-600">{error}</p>}
                        {success && <p className="text-green-600">{success}</p>}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Today's Reporting</h2>
                        {/* User Selection */}
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

                        {/* Date Input */}
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

                        {/* Quarterly Reporting Fields */}
                        <div className="space-y-4">
                            {['one_prefix_column', 'two_prefix_column', 'three_prefix_column', 'four_prefix_column']
                                .reduce((result, columnName, index, array) => {
                                    if (index % 2 === 0) {
                                        result.push(array.slice(index, index + 2)); // Group two items per row
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
                                                    placeholder={`Add    ${rowIndex * 2 + index + 1}${index === 0 ? 'st' : 'nd'} Qtr Work`}
                                                    isSearchable
                                                    isDisabled={userData.onLeave}
                                                    required={!userData.onLeave}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>

                        {/* On Leave Checkbox */}
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

                        {/* Action Buttons */}
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
                            <Qtr_Calendar key={calendarKey} /> {/* Pass calendarKey to refresh the calendar */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuarterlyReport;
