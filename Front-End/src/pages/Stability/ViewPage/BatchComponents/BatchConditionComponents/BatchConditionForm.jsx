import React, { useState, useEffect } from 'react';
import api from '../../../../../api/axios';

const BatchConditionForm = ({ pid, vertical, pname, protocol, ppacking, psize, spacking, onSave }) => {
    const [formData, setFormData] = useState({
        scondition: '',
        sampleqty: '',
        reqby: '',
        batches: [], // Store selected batch numbers as an array
        testStations: {
            initial: false,
            onemonth: false,
            twomonth: false,
            threemonth: false,
            sixmonth: false,
            ninemonth: false,
            onetwomonth: false,
            oneeightmonth: false,
            twofourmonth: false,
            threesixmonth: false,
        },
        extra: '',
    });

    const [batches, setBatches] = useState([]);

    // Fetch only batch numbers
    // useEffect(() => {
    //     const fetchBatchNumbers = async () => {
    //         try {
    //             const response = await api.get(`/api/stability/batch-details/${pid}`);
    //             if (response.data && Array.isArray(response.data)) {
    //                 // Extract only the batchno values from the API response
    //                 const batchNumbers = response.data.map((batch) => batch.batchno);
    //                 setBatches(batchNumbers); // Store the batch numbers in state
    //             } else {
    //                 console.error("Unexpected API response format:", response.data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching batch numbers:', error);
    //         }
    //     };

    //     fetchBatchNumbers();
    // }, [pid]);
    useEffect(() => {
        const fetchBatchNumbers = async () => {
            try {
                // Get pid from local storage
                const productDetails = JSON.parse(localStorage.getItem('productDetails'));
                const pid = productDetails?.id;

                if (!pid) {
                    console.error('No pid found in local storage');
                    return;
                }

                const response = await api.get(`/api/stability/batch-details/${pid}`);
                if (response.data && Array.isArray(response.data)) {
                    // Extract only the batchno values from the API response
                    const batchNumbers = response.data.map((batch) => batch.batchno);
                    setBatches(batchNumbers); // Store the batch numbers in state
                } else {
                    console.error("Unexpected API response format:", response.data);
                }
            } catch (error) {
                console.error('Error fetching batch numbers:', error);
            }
        };

        fetchBatchNumbers();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && batches.includes(value)) {
            // Toggle batch selection
            setFormData((prevData) => ({
                ...prevData,
                batches: checked
                    ? [...prevData.batches, value]
                    : prevData.batches.filter((batch) => batch !== value),
            }));
        } else if (type === 'checkbox') {
            // Update test stations
            setFormData((prevData) => ({
                ...prevData,
                testStations: {
                    ...prevData.testStations,
                    [name]: checked,
                },
            }));
        } else {
            // Update other fields
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/stability/conditions', formData);
            onSave();
        } catch (error) {
            console.error('Error saving condition details:', error);
            alert('Failed to save condition details.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded bg-white">
            <h2 className="text-2xl font-semibold mb-4">Add Condition Details</h2>
            <input type="hidden" name="pid" value={pid} />
            <input type="hidden" name="vertical" value={vertical} />
            <input type="hidden" name="pname" value={pname} />
            <input type="hidden" name="protocol" value={protocol} />
            <input type="hidden" name="ppacking" value={ppacking} />
            <input type="hidden" name="psize" value={psize} />
            <input type="hidden" name="spacking" value={spacking} />

            <div className="flex  gap-4">
                <div className="w-full md:w-1/2">
                    <label className="block mb-1 font-medium">Stability Condition</label>
                    <select
                        name="scondition"
                        value={formData.scondition}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2"
                        required
                    >
                        <option value="" disabled>
                            Choose Stability Condition
                        </option>
                        <option value="25°C/60% RH">25°C/60% RH</option>
                        <option value="30°C/75% RH">30°C/75% RH</option>
                        <option value="40°C/75% RH">40°C/75% RH</option>
                        <option value="Stress 60°C">Stress 60°C</option>
                    </select>
                </div>
                <div className="w-full md:w-1/2">
                    <label className="block mb-1 font-medium">Sample Qty.</label>
                    <input
                        type="text"
                        name="sampleqty"
                        value={formData.sampleqty}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2"
                        required
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Select Your Batches</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batchno) => (
                        <div key={batchno} className="flex items-center">
                            <input
                                type="checkbox"
                                name="batch"
                                value={batchno}
                                checked={formData.batches.includes(batchno)}
                                onChange={(e) => {
                                    const { value, checked } = e.target;
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        batches: checked
                                            ? [...prevData.batches, value]
                                            : prevData.batches.filter((batch) => batch !== value),
                                    }));
                                }}
                                className="mr-2 w-5 h-5" // Adjust checkbox size
                            />
                            <label className="text-sm">{batchno}</label>
                        </div>
                    ))}
                </div>
            </div>


            <div>
                <h3 className="text-lg font-semibold mb-2">Test Station</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(formData.testStations).map((station) => (
                        <div key={station} className="flex items-center">
                            <input
                                type="checkbox"
                                name={station}
                                checked={formData.testStations[station]}
                                onChange={handleChange}
                                className="mr-2"
                                style={{ width: '25px', height: '25px' }} // Increase the size of the checkbox
                            />
                            <label>{station.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</label>
                        </div>
                    ))}
                </div>
            </div>


            <div>
                <label className="block">Extra Info</label>
                <textarea
                    type="text"
                    name="extra"
                    value={formData.extra}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                />
            </div>

            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onSave} className="bg-gray-500 text-white px-4 py-2 rounded">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Save
                </button>
            </div>
        </form>
    );
};

export default BatchConditionForm;
