import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';

const BatchDetailsForm = ({ productId, onSuccess, editingBatch, clearEditing }) => {
    // Get product details from localStorage (e.g., pid, vertical, pname, etc.)
    const productDetails = JSON.parse(localStorage.getItem('productDetails')) || {};
    const userDetails = JSON.parse(localStorage.getItem('user')) || {};

    // Ensure pid is set correctly
    const pid = productDetails.pid || productId;

    const [formData, setFormData] = useState({
        id: editingBatch ? editingBatch.id : '', // Initialize id for editing
        pid: pid,
        vertical: productDetails.vertical || '',
        pname: productDetails.pname || '',
        protocol: productDetails.protocol || '',
        ppacking: productDetails.ppacking || '',
        psize: productDetails.packsize || '',
        spacking: productDetails.spacking || '',
        batchno: '',
        mfgdate: '',
        batchsize: '',
        expdate: 'N/A',
        reqby: userDetails.ename + (userDetails.username) || '',
        chrdate: '',
    });

    useEffect(() => {
        if (editingBatch) {
            let formattedMfgDate = '';
            if (editingBatch.mfgdate) {
                // Create a date object
                const mfgDateObj = new Date(editingBatch.mfgdate);
                
                // Adjust to ensure correct date
                mfgDateObj.setMinutes(mfgDateObj.getMinutes() - mfgDateObj.getTimezoneOffset());
    
                // Format to YYYY-MM-DD
                formattedMfgDate = mfgDateObj.toISOString().split('T')[0];
            }
    
            // Set the formatted date in the form data
            setFormData({
                ...editingBatch,
                mfgdate: formattedMfgDate, // Ensure it's properly formatted
            });
        }
    }, [editingBatch]);
    
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if pid is available
        if (!formData.pid) {
            alert('Product ID is missing.');
            return;
        }

        try {
            if (editingBatch) {
                // Update batch details
                await api.put(`/api/stability/batch-details/${formData.id}`, formData);
                alert('Batch details updated successfully!');
            } else {
                // Add new batch details
                await api.post('/api/stability/batch-details', formData);
                alert('Batch details added successfully!');
            }

            onSuccess(); // Refresh the list

            // Reset form data
            setFormData({
                id: '',
                pid: productDetails.pid || productId, // Ensure pid is always set
                vertical: productDetails.vertical,
                pname: productDetails.pname,
                protocol: productDetails.protocol,
                ppacking: productDetails.ppacking,
                psize: productDetails.packsize,
                spacking: productDetails.spacking,
                batchno: '',
                mfgdate: '',
                batchsize: '',
                expdate: 'N/A',
                reqby: userDetails.ename + (userDetails.username) || '',
                chrdate: '',
            });

            if (editingBatch) clearEditing(); // Clear editing state

        } catch (err) {
            alert('Failed to save batch details.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-300 rounded">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                {editingBatch ? 'Edit Batch Details' : 'Add Batch Details'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block">Batch Number</label>
                    <input
                        type="text"
                        name="batchno"
                        value={formData.batchno}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        required
                    />
                </div>
                <div>
                    <label className="block">Batch Size</label>
                    <input
                        type="text"
                        name="batchsize"
                        value={formData.batchsize}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        required
                    />
                </div>
                <div>
                    <label className="block">Manufacturing Date</label>
                    <input
                        type="date"
                        name="mfgdate"
                        value={formData.mfgdate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        required
                    />
                </div>

                <div>
                    <label className="block">Charging Date</label>
                    <input
                        type="date"
                        name="chrdate"
                        value={formData.chrdate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        required
                    />
                </div>
            </div>
            <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                {editingBatch ? 'Update Batch Details' : 'Add Batch Details'}
            </button>
        </form>
    );
};

export default BatchDetailsForm;
