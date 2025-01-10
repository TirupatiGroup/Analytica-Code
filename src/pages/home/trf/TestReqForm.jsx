import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../../components/HSidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const TestRequestForm = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const vertical = user ? user.vertical : '';
    const ename = user ? user.ename : 'Unknown User';

    const [toard, setToard] = useState(true);
    const [toardmicro, setToardMicro] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Add new state for product names and search functionality
    const [productNames, setProductNames] = useState([]);
    const [filteredNames, setFilteredNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for fetching product names
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
    const [isProductSelected, setIsProductSelected] = useState(false); // New state to track if a product is selected

    const formRef = useRef();
    const navigate = useNavigate(); // Initialize useNavigate hook

    // Debounce hook
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm); // Set the debounced term after a delay
        }, 500); // Adjust delay as needed (500ms here)

        return () => clearTimeout(timer); // Cleanup the timer on every render
    }, [searchTerm]);

    // Fetch product names from the API based on the selected vertical
    useEffect(() => {
        const fetchProductNames = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/trfs/${vertical}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', errorText);
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                const names = data.map(item => item.pname); // Extract product names
                setProductNames(names);
                setFilteredNames(names); // Initialize filtered names with all names
            } catch (error) {
                console.error('Network error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductNames();
    }, [vertical]);

    // Filter product names based on the debounced search term
    useEffect(() => {
        if (debouncedSearchTerm) {
            const filtered = productNames.filter(name =>
                name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
            setFilteredNames(filtered);
        } else {
            setFilteredNames([]); // Hide suggestions if searchTerm is empty
        }
    }, [debouncedSearchTerm, productNames]);

    const submitRequestData = async (data) => {
        try {
            const response = await fetch(`http://localhost:3000/trfs/${vertical}/test-request-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            return result; // Return the response if successful
        } catch (error) {
            console.error('Network error:', error);
            throw new Error('Network response was not ok');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!toard && !toardmicro) {
            setErrorMessage('At least one of ARD or ARD Micro must be selected.');
            return;
        }

        setErrorMessage('');
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        const requestData = {
            pname: data.pname,
            mfgdate: data.mfgdate,
            expdate: data.expdate,
            batchno: data.batchno,
            batchsize: data.batchsize,
            sampleqty: data.sampleqty,
            toard: toard ? 'ARD' : '',
            toardmicro: toardmicro ? 'ARD-Micro' : '',
            samplestage: data.samplestage,
            avgwtvol: data.avgwtvol,
            reqby: ename,
        };

        try {
            const response = await submitRequestData(requestData);

            // If successful, show a success toast
            toast.success('Form submitted successfully!');
            const generatedId = response.id; // Extract the ID from the response

            // Redirect to the new page using the generated ID
            setTimeout(() => {
                // Redirect to /trfs/{vertical}/view/{id}
                navigate(`/trfs/${vertical}/view/${generatedId}`);
            }, 2000); // Add a 2-second delay before redirection

        } catch (error) {
            if (error.message === 'Failed to fetch') {
                toast.error('Network error: Failed to connect to the server.');
            } else {
                toast.error(`Server error: ${error.message}`);
            }
            setErrorMessage(error.message);
        }
    };

    const handleProductSelect = (name) => {
        setSearchTerm(name); // Set the search term to the selected name
        setFilteredNames([]); // Clear the filtered names after selection
        setIsProductSelected(true); // Mark that a product has been selected
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsProductSelected(false); // Reset the product selected flag when the user starts typing
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow ml-60 p-5">
                <div className="p-2">
                    <div className="bg-white shadow-lg rounded-lg p-3 md:p-6 max-w-4xl">
                        <h2 className="text-3xl font-bold text-center text-indigo-600">Test Request Form</h2>
                        <p className="mb-4 text-center text-gray-600">
                            Please fill this form to create a Test request <span className="text-red-600 font-medium">(Required fields *)</span>
                        </p>
                        <p className="text-center mb-6 text-gray-500">From: Formulation Research Development /{vertical}</p>

                        {errorMessage && <p className="text-red-600 text-center mb-4">{errorMessage}</p>}

                        <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={handleSubmit} ref={formRef}  autocomplete="off">
                            <div className="p-4">
                                <label className="block mb-2 text-sm font-medium">Product Name *</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    type="text"
                                    name="pname"
                                    value={searchTerm}
                                    onChange={handleInputChange} // Handle user input
                                    required
                                     
                                />

                                {/* Show filtered product names only if there's a search term and no product selected */}
                                {searchTerm && !isProductSelected && (
                                    <div className="relative">
                                        {loading ? (
                                            <p>Loading...</p>
                                        ) : (
                                            filteredNames.length > 0 && (
                                                <div className="absolute inset-0 bg-black opacity-50 z-0"></div> // Backdrop blur
                                            )
                                        )}
                                        {filteredNames.length > 0 && (
                                            <ul className="absolute mt-1 w-full bg-white border border-gray-300 max-h-60 overflow-y-auto rounded-lg z-10">
                                                {filteredNames.map((name, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                                                        onClick={() => handleProductSelect(name)} // Handle product selection
                                                    >
                                                        {name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                <label className="block mb-2 text-sm font-medium">Mfg. Date *</label>
                                <input className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" type="date" name="mfgdate" required />

                                <label className="block mb-2 text-sm font-medium">Expiry Date *</label>
                                <input className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" type="date" name="expdate" />
                            </div>

                            <div className="p-4">
                                <label className="block mb-2 text-sm font-medium">Batch No. *</label>
                                <input className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" type="text" name="batchno" required />

                                <label className="block mb-2 text-sm font-medium">Batch Size</label>
                                <input className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" type="text" name="batchsize" />

                                <label className="block mb-2 text-sm font-medium">Sample Qty.</label>
                                <input className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" type="text" name="sampleqty" />
                            </div>

                            <div className="p-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Select Test Type</label>
                                    <div className="flex items-center mb-3">
                                        <input
                                            className="mr-2"
                                            type="checkbox"
                                            checked={toard}
                                            onChange={() => setToard(!toard)}
                                        />
                                        <label className="text-sm text-gray-700">ARD</label>
                                    </div>
                                    <div className="flex items-center mb-3">
                                        <input
                                            className="mr-2"
                                            type="checkbox"
                                            checked={toardmicro}
                                            onChange={() => setToardMicro(!toardmicro)}
                                        />
                                        <label className="text-sm text-gray-700">ARD Micro</label>
                                    </div>
                                </div>

                                <label className="block mb-2 text-sm font-medium">Sampling Stage *</label>
                                <select className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" name="samplestage" required>
                                    <option value="" disabled>Choose Sampling Stage</option>
                                    <option value="Raw Material">Raw Material</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Semi-Finished">Semi-Finished</option>
                                    <option value="Finished Good">Finished Good</option>
                                </select>

                                <label className="block mb-2 text-sm font-medium">Average Wt./Volume</label>
                                <input className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" type="text" name="avgwtvol" />

                                <input className="w-full border border-gray-300 rounded-lg p-3 hidden" type="text" name="reqby" value={ename} readOnly />
                            </div>

                            <div className="flex justify-between mt-3">
                                <p className="mb-4 text-gray-600"><b>Requested By:</b> <br />{ename}</p>
                                <div className="relative mt-6">
                                    <button
                                        type="submit"
                                        className="absolute bottom-0 right-0 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <ToastContainer position="top-center" autoClose={1500} />
        </div>
    );
};

export default TestRequestForm;
