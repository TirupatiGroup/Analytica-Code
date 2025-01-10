import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const PreparationFieldButtons = ({ vertical, trfid, userRole }) => {
    // Manage the state for TRF data
    const [data, setData] = useState(null);

    // Fetch the TRF data when the component mounts
    const fetchData = () => {
        const url = `http://localhost:3000/trfs/${vertical}/${trfid}`;
        axios.get(url)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching TRF data:', error);
            });
    };

    // Initially fetch the data
    useEffect(() => {
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

        const url = `http://localhost:3000/trfs/${vertical}/${trfid}/${field}`;
        axios.put(url, { [field]: username })
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

    if (!data || userRole === null) {
        return <div>Loading...</div>;
    }

    // Check if 'receivedby' and 'receivedate' exist
    const isReceived = isFieldUpdated('receivedby') && isFieldUpdated('receivedate');

    return (
        <div className="flex space-x-4 mt-4 p-6 bg-white rounded-lg shadow-xl border border-10">
            {/* Check if Received Fields are Present */}
            {!isReceived ? (
                <p className="text-sm text-gray-800">
                    Received By: <br />
                    <span className="text-sm text-red-500">Not Yet Received</span>
                </p>
            ) : (
                <>
                    {/* Role-based Rendering of 'Prep' Button for Role 1, 3, and 4 */}
                    {(userRole === 1 || userRole === 3 || userRole === 4) && !isFieldUpdated('prepby') ? (
                        <div className="items-center space-x-3 p-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out">
                            <p className="text-xs text-gray-700 my-2 text-center">Click to Prepare this TRF</p>
                            <button
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
                                onClick={() => updateField('prepby')}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                                <span>Prepared</span>
                            </button>
                        </div>
                    ) : isFieldUpdated('prepby') ? (
                        <span className="text-sm text-gray-800">
                            Prepared By: <strong>{data?.trfData?.prepby}</strong>{' '}
                            {data?.trfData?.prepdate ? `(${formatDate(data.trfData.prepdate)})` : ''}
                        </span>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default PreparationFieldButtons;
