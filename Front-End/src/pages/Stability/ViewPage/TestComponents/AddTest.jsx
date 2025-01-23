import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';

const AddTestForm = ({ onTestAdded }) => {
    const [pid, setPid] = useState('');
    const [testDetails, setTestDetails] = useState({
        test: '',
        claim: '',
        spes: '',
        results: '',
        file: '',
        updateby: '',
        resultupdateon: '',
        reqby: '',
        unit: '',
        upby: '',
        updateon: '',
        inirupby: '',
        inirupdateon: ''
    });

    useEffect(() => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails')) || {};
        const userDetails = JSON.parse(localStorage.getItem('user')) || {};

        if (productDetails.id) {
            setPid(productDetails.id);
        }

        if (userDetails.ename && userDetails.username) {
            setTestDetails((prevDetails) => ({
                ...prevDetails,
                reqby: `${userDetails.ename} ${userDetails.username}`
            }));
        }
    }, []);

    const handleTestDetailsChange = (e) => {
        const { name, value } = e.target;
        setTestDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Prepare new test object before sending the request
        const newTest = {
            id: Date.now(), // Generate unique ID using timestamp
            test: testDetails.test || '',
            claim: testDetails.claim || '',
            spes: testDetails.spes || '',
            subtests: [], // Empty subtests initially
            reqby: testDetails.reqby || '',
            unit: testDetails.unit || ''
        };
    
        // Immediately add the new test to the table (state)
        onTestAdded(newTest);  // Pass newTest to parent to update table immediately
    
        // Prepare request data
        const requestData = {
            pid,
            testDetails: {
                test: newTest.test,
                claim: newTest.claim,
                spes: newTest.spes,
                results: '',
                file: '',
                updateby: '',
                resultupdateon: '',
                reqby: newTest.reqby,
                unit: newTest.unit || '',
                upby: '',
                updateon: '',
                inirupby: '',
                inirupdateon: ''
            }
        };
    
        try {
            // Send request to API to save the new test
            const response = await api.post('/api/stability/tests', requestData);
            // alert('Test added successfully!');
            
            // Optionally, update the test with the data from the response if necessary
            // onTestAdded(response.data); 
    
            // Reset the form fields after successful submission
            setTestDetails({
                test: '',
                claim: '',
                spes: '',
                results: '',
                file: '',
                updateby: '',
                resultupdateon: '',
                reqby: testDetails.reqby,
                unit: '',
                upby: '',
                updateon: '',
                inirupby: '',
                inirupdateon: ''
            });
        } catch (error) {
            console.error('Error adding test:', error);
            alert('Failed to add test.');
        }
    };


    return (
        <div className="border p-4 rounded-xl m-3">
            <h2 className="text-2xl font-semibold mb-4 text-center">Add Test Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="block mb-2">Test Name</label>
                        <input
                            type="text"
                            name="test"
                            value={testDetails.test}
                            onChange={handleTestDetailsChange}
                            className="border p-2 w-full"
                            required
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block mb-2">Claim</label>
                        <input
                            type="text"
                            name="claim"
                            value={testDetails.claim}
                            onChange={handleTestDetailsChange}
                            className="border p-2 w-full"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block mb-2">Unit</label>
                        <select
                            name="unit"
                            value={testDetails.unit}
                            onChange={handleTestDetailsChange}
                            className="border p-2 w-full"
                        >
                            <option value="">Select Unit</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="lbs">lbs</option>
                            <option value="oz">oz</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block mb-2">Specification</label>
                        <input
                            type="text"
                            name="spes"
                            value={testDetails.spes}
                            onChange={handleTestDetailsChange}
                            className="border p-2 w-full"
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                        Add Test
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTestForm;