import React, { useState } from 'react';

const EditTestModal = ({ test, onClose, onUpdate }) => {
    const [testDetails, setTestDetails] = useState(test);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTestDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(testDetails);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2 className="text-2xl font-semibold mb-4">Edit Test Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block mb-2">Test Name</label>
                            <input
                                type="text"
                                name="test"
                                value={testDetails.test}
                                onChange={handleChange}
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
                                onChange={handleChange}
                                className="border p-2 w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block mb-2">Unit</label>
                            <select
                                name="unit"
                                value={testDetails.unit}
                                onChange={handleChange}
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
                                onChange={handleChange}
                                className="border p-2 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                            Update Test
                        </button>
                        <button type="button" className="bg-gray-500 text-white p-2 rounded ml-2" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTestModal;