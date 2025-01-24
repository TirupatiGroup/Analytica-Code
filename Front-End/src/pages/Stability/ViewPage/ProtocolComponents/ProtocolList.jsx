import React, { useState, useEffect } from 'react';
import ProtocolUploadForm from './ProtocolUploadForm';
import api from '../../../../api/axios'; // Ensure you have the `api` instance properly configured for Axios or similar library.

const ProtocolList = ({ selectedFile, isLoading, handleFileClick, closeModal }) => {
    const [protocolList, setProtocolList] = useState([]);

    const fetchProtocols = async () => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails'));
        const pid = productDetails ? productDetails.id : null;

        if (pid) {
            try {
                const response = await api.get(`/api/stability/protocols/${pid}`);
                setProtocolList(response.data); // Assuming the response data is an array of protocols
            } catch (error) {
                console.error('Error fetching protocols:', error);
            }
        } else {
            console.error('Product ID not found in localStorage');
        }
    };

    useEffect(() => {
        fetchProtocols();
    }, []);

    const handleUploadSuccess = () => {
        fetchProtocols(); // Refresh the protocol list after a successful upload
    };

    const handleDeleteClick = async (protocolId) => {
        try {
            const response = await api.delete(`/api/stability/protocols/${protocolId}`);
            if (response.status === 200) {
                fetchProtocols();
                alert('Protocol deleted successfully');
            } else {
                alert('Failed to delete protocol');
            }
        } catch (error) {
            console.error('Error deleting protocol:', error);
            alert('Failed to delete protocol');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">All Protocols</h2>
            {protocolList.length > 0 ? (
                <ul className="list-decimal pl-6 space-y-4">
                    {protocolList.map((protocol) => (
                        <li key={protocol.id} className="flex justify-between items-center">
                            <button
                                onClick={() => handleFileClick(protocol.file)}
                                className="flex items-center text-blue-500 underline"
                            >
                                <span className="mr-2">&#128462;</span>
                                {protocol.file}
                            </button>
                            <button
                                onClick={() => handleDeleteClick(protocol.id)}
                                className="text-red-500 hover:text-red-700 ml-4"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No protocol files available.</p>
            )}

            <div className="mt-8">
                <ProtocolUploadForm onUploadSuccess={handleUploadSuccess} />
            </div>

            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative bg-white p-6 rounded shadow-lg w-3/4 h-3/4">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 bg-gray-100 text-gray-600 hover:text-red-500 transition-transform transform hover:scale-125"
                            aria-label="Close Modal"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        )}

                        <iframe
                            src={`http://172.16.27.20/ard/stability/upload_protocols/${selectedFile}`}
                            className="w-full h-full"
                            title="Protocol File"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProtocolList;
