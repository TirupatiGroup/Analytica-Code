import React, { useState, useEffect } from 'react';

const EditProductModal = ({ isOpen, onClose, onSubmit, product }) => {
    const [formData, setFormData] = useState({
        pname: '',
        ppacking: '',
        protocol: '',
        spacking: '',
        packsize: '',
        reqby: '',
        reqdate: '',
        vertical: '',
        sampleby: '',
        samplercby: '',
        labelc: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({ ...product });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // Pass the updated data to the parent component
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full sm:max-w-3xl shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-700 mb-2 text-center">Add Product to Stability</h3>
                <p className="text-xs font-semibold text-gray-700 mb-6 text-center">Please fill this form to add product in stability.</p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 border border-blue-100 rounded-md p-5">
                        {/* Align Three Inputs in One Line */}
                        <div className="flex space-x-4 ">
                            <div className="w-1/3">
                                <label htmlFor="pname" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input
                                    type="text"
                                    id="pname"
                                    name="pname"
                                    value={formData.pname}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="protocol" className="block text-sm font-medium text-gray-700">Protocol No.</label>
                                <input
                                    type="text"
                                    id="protocol"
                                    name="protocol"
                                    value={formData.protocol}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="vertical" className="block text-sm font-medium text-gray-700">Vertical</label>
                                <select
                                    id="vertical"
                                    name="vertical"
                                    value={formData.vertical}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Vertical</option>
                                    <option value="Nutra">Nutra</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Ayurveda">Ayurveda</option>
                                    <option value="Pharma">Pharma</option>
                                </select>
                            </div>
                           
                        </div>

                        {/* Align Three Inputs in One Line (Next Set) */}
                        <div className="flex space-x-4">
                        <div className="w-1/3">
                                <label htmlFor="ppacking" className="block text-sm font-medium text-gray-700">Primary Packing</label>
                                <input
                                    type="text"
                                    id="ppacking"
                                    name="ppacking"
                                    value={formData.ppacking}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="spacking" className="block text-sm font-medium text-gray-700">Secondary Packing</label>
                                <input
                                    type="text"
                                    id="spacking"
                                    name="spacking"
                                    value={formData.spacking}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="packsize" className="block text-sm font-medium text-gray-700">Pack Size/Strength</label>
                                <input
                                    type="text"
                                    id="packsize"
                                    name="packsize"
                                    value={formData.packsize}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                           
                        </div>

                        {/* Align Three Inputs in One Line (Next Set) */}
                        <div className="flex space-x-4">
                            <div className="w-1/3">
                                <label htmlFor="samplercby" className="block text-sm font-medium text-gray-700">Sample Received by</label>
                                <input
                                    type="text"
                                    id="samplercby"
                                    name="samplercby"
                                    value={formData.samplercby}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="sampleby" className="block text-sm font-medium text-gray-700">Sample by</label>
                                <input
                                    type="text"
                                    id="sampleby"
                                    name="sampleby"
                                    value={formData.sampleby}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="labelc" className="block text-sm font-medium text-gray-700">Label C</label>
                                <input
                                    type="text"
                                    id="labelc"
                                    name="labelc"
                                    value={formData.labelc}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                           
                        </div>
                    </div>

                    {/* Submit and Close Buttons */}
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            Save Changes
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;
