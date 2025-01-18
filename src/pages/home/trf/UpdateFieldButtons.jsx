
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios'; // Import the Axios API module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowDown, faEdit } from '@fortawesome/free-solid-svg-icons';
import Skeleton from 'react-loading-skeleton'; // Import the Skeleton component

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Ensure day is 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure month is 2 digits
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const UpdateFieldButtons = ({ vertical, trfid }) => {
    // Manage the state for TRF data
    const [data, setData] = useState(null);
    const [userRole, setUserRole] = useState(null); // Store user role
    const [loading, setLoading] = useState(true); // Add loading state

    // Fetch the TRF data when the component mounts
    const fetchData = () => {
        setLoading(true); // Set loading to true before fetching data
        const url = `/trfs/${vertical}/${trfid}`;
        api.get(url)
            .then(response => {
                setData(response.data);
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch(error => {
                console.error('Error fetching TRF data:', error);
                setLoading(false); // Set loading to false if there's an error
            });
    };

    // Initially fetch the data and role
    useEffect(() => {
        // Fetch user data from localStorage
        const userDataString = localStorage.getItem('user');
        const user = userDataString ? JSON.parse(userDataString) : null;
        const role = user ? user.auth_role : null;
        setUserRole(role); // Set user role state

        fetchData(); // Fetch the TRF data
    }, [vertical, trfid]); // Re-fetch if vertical or trfid changes

    const updateField = (field) => {
        const userDataString = localStorage.getItem('user');
        const user = userDataString ? JSON.parse(userDataString) : null;
        const username = user ? user.ename : null;

        if (!username) {
            alert('User is not logged in.');
            return;
        }

        const url = `/trfs/${vertical}/${trfid}/${field}`;
        api.put(url, { [field]: username })
            .then(response => {
                alert(response.data.message);
                fetchData(); // Refresh data after update
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error updating: ' + error.response?.data?.message || error.message);
            });
    };

    const isFieldUpdated = (field) => {
        return data && data.trfData && data.trfData[field] !== null && data.trfData[field] !== '';
    };

    if (loading || !data || userRole === null) {
        return (
            <div className="flex space-x-4 mt-4 p-6 bg-white rounded-lg shadow-xl border border-10">
                <Skeleton width="200px" height="40px" className="mt-4" />
                <Skeleton width="200px" height="40px" className="mt-4" />
                <Skeleton width="200px" height="40px" className="mt-4" />
                <Skeleton width="200px" height="40px" className="mt-4" />
            </div>
        );
    }

    return (
        <div className="flex space-x-4 mt-4 p-6 bg-white rounded-lg shadow-xl border border-10">
            {/* Requested By Section */}
            <span className="text-sm text-gray-800">
                Requested By: <strong>{data?.trfData?.reqby}</strong>{' '}
                {data?.trfData?.chkdate ? `(${formatDate(data.trfData.trfdate)})` : ''}
            </span>

            {/* Role-based Rendering of 'Checked' Button for Role 2 */}
            {userRole === 2 && !isFieldUpdated('checkedby') ? (
                <div className="items-center space-x-3 p-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out">
                    <p className="text-xs text-gray-700 my-2 text-center">Click to Check this TRF</p>
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => updateField('checkedby')}
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                        <span>Checked</span>
                    </button>
                </div>
            ) : isFieldUpdated('checkedby') ? (
                <span className="text-sm text-gray-800">
                    Checked By: <strong>{data?.trfData?.checkedby}</strong>{' '}
                    {data?.trfData?.chkdate ? `(${formatDate(data.trfData.chkdate)})` : ''}
                </span>
            ) : null}

            {/* Role-based Rendering of 'Received' Button for Role 1, 3, and 4 */}
            {(userRole === 1 || userRole === 3 || userRole === 4) && isFieldUpdated('checkedby') && !isFieldUpdated('receivedby') ? (
                <div className="items-center space-x-3 p-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out">
                    <p className="text-xs text-gray-700 my-2 text-center">Click to Receive this TRF</p>
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => updateField('receivedby')}
                    >
                        <FontAwesomeIcon icon={faArrowDown} className="text-lg" />
                        <span>Received</span>
                    </button>
                </div>
            ) : !isFieldUpdated('receivedby') ? (
                <p className="text-sm text-gray-800">
                    Received By: <br />
                    <span className="text-sm text-red-500">Not Yet Received</span>
                </p>
            ) : (
                <span className="text-sm text-gray-800">
                    Received By: <strong>{data?.trfData?.receivedby}</strong>{' '}
                    {data?.trfData?.receivedate ? `(${formatDate(data.trfData.receivedate)})` : ''}
                </span>
            )}

            {/* Role-based Rendering of 'Reviewed' Button for Role 1, 3, and 4 */}
            {(userRole === 1 || userRole === 3 || userRole === 4) && isFieldUpdated('prepby') && !isFieldUpdated('reviewby') ? (
                <div className="items-center space-x-3 p-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out">
                    <p className="text-xs text-gray-700 my-2 text-center">Click to Review this TRF</p>
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => updateField('reviewby')}
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-md" />
                        <span>Reviewed</span>
                    </button>
                </div>
            ) : !isFieldUpdated('reviewby') ? (
                <p className="text-sm text-gray-800">
                    Reviewed By: <br />
                    <span className="text-sm text-red-500">Not Yet Reviewed</span>
                </p>
            ) : (
                <span className="text-sm text-gray-800">
                    Reviewed By: <strong>{data?.trfData?.reviewby}</strong>{' '}
                    {data?.trfData?.reviewdate ? `(${formatDate(data.trfData.reviewdate)})` : ''}
                </span>
            )}

            {/* Role-based Rendering of 'Approved' Button for Role 1 and 4 */}
            {(userRole === 1 || userRole === 4) && isFieldUpdated('reviewby') && !isFieldUpdated('approvedby') ? (
                <div className="items-center space-x-3 p-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out">
                    <p className="text-xs text-gray-700 my-2 text-center">Click to Approve this TRF</p>
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => updateField('approvedby')}
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="text-md" />
                        <span>Approve</span>
                    </button>
                </div>
            ) : !isFieldUpdated('approvedby') ? (
                <p className="text-sm text-gray-800">
                    Approved By: <br />
                    <span className="text-sm text-red-500">Not Yet Approved</span>
                </p>
            ) : (
                <span className="text-sm text-gray-800">
                    Approved By: <strong>{data?.trfData?.approvedby}</strong>{' '}
                    {data?.trfData?.approvedate ? `(${formatDate(data.trfData.approvedate)})` : ''}
                </span>
            )}
        </div>
    );
};

export default UpdateFieldButtons;
