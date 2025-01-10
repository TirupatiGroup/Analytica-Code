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
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-96">
                <h3 className="text-xl mb-4">Edit Product</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Product Name</label>
                        <input
                            type="text"
                            name="pname"
                            value={formData.pname}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>
                    {/* Add the rest of the fields similarly */}
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Save Changes
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4 ml-2"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default EditProductModal;
