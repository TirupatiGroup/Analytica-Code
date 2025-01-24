import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios';
import BatchDetailsForm from './BatchDetailsForm';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // FaEdit for Edit icon, FaTrashAlt for Delete icon

const BatchDetailsList = ({ productId }) => {
    const [batchDetails, setBatchDetails] = useState([]);
    const [editingBatch, setEditingBatch] = useState(null);

    // Fetch batch details
    useEffect(() => {
        const fetchBatchDetails = async () => {
            try {
                const response = await api.get(`/api/stability/batch-details/${productId}`);
                setBatchDetails(response.data);
            } catch (err) {
                alert('Failed to fetch batch details.');
            }
        };

        fetchBatchDetails();
    }, [productId]);

    const handleDelete = async (id) => {

        try {
            // Send DELETE request with only id in the URL
            await api.delete(`/api/stability/batch-details/${id}`);

            // Update the state to remove the deleted batch
            setBatchDetails((prevBatchDetails) => prevBatchDetails.filter((batch) => batch.id !== id));
            alert('Batch details deleted successfully!');
        } catch (err) {
            alert('Failed to delete batch details.');
            console.error('Error:', err.message);
        }
    };


    const handleEdit = (batch) => {
        setEditingBatch(batch);
    };

    const refreshList = async () => {
        const response = await api.get(`/api/stability/batch-details/${productId}`);
        setBatchDetails(response.data);
    };

    const clearEditing = () => {
        setEditingBatch(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Batch Details</h2>
            {batchDetails.length > 0 ? (
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 px-2 py-2">Sr. No.</th>
                            <th className="border border-gray-300 px-2 py-2">Batch Number</th>
                            <th className="border border-gray-300 px-2 py-2">Manufacturing Date</th>
                            <th className="border border-gray-300 px-2 py-2">Batch Size</th>
                            <th className="border border-gray-300 px-2 py-2">Charging Date</th>
                            <th className="border border-gray-300 px-2 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batchDetails.map((batch, index) => (
                            <tr key={batch.id}>
                                <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-2 py-2">{batch.batchno}</td>
                                <td className="border border-gray-300 px-2 py-2">
                                    {new Date(batch.mfgdate).toLocaleDateString('en-GB')}
                                </td>
                                <td className="border border-gray-300 px-2 py-2">{batch.batchsize}</td>
                                <td className="border border-gray-300 px-2 py-2">
                                    {new Date(batch.chrdate).toLocaleDateString('en-GB')}
                                </td>
                                <td className="border border-gray-300 px-2 py-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(batch)}
                                        className="text-blue-500 hover:underline flex items-center"
                                    >
                                        <FaEdit className="mr-2" /> Edit
                                    </button>{' '}
                                    |{' '}
                                    <button
                                        onClick={() => handleDelete(batch.id)}
                                        className="text-red-500 hover:underline flex items-center"
                                    >
                                        <FaTrashAlt className="mr-2" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No batch details available.</p>
            )}
            <div className='mt-5'>
                <BatchDetailsForm
                    productId={productId}
                    onSuccess={refreshList}
                    editingBatch={editingBatch}
                    clearEditing={clearEditing}
                />
            </div>

        </div>
    );
};

export default BatchDetailsList;
