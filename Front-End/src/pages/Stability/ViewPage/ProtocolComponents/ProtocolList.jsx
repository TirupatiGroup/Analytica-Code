import React, { useState, useEffect } from 'react';
import ProtocolUploadForm from './ProtocolUploadForm';

const ProtocolList = ({ protocols, selectedFile, isLoading, handleFileClick, closeModal }) => {
    const [activeTab, setActiveTab] = useState('Protocols');
    const [protocolList, setProtocolList] = useState(protocols);

    const handleUploadSuccess = () => {
        // Fetch the protocols again after a successful upload to update the list
        fetchProtocols();
    };

    const fetchProtocols = async () => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails'));
        const pid = productDetails ? productDetails.id : null;  // Get Product ID from localStorage

        if (pid) {
            try {
                const response = await fetch(`/api/stability/protocols/${pid}`); // Use pid in the URL
                const data = await response.json();
                setProtocolList(data);
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
    const handleUpdateProtocol = async (updatedProtocol) => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails'));
        const pid = productDetails ? productDetails.id : null;  // Get Product ID from localStorage
    
        if (pid) {
            try {
                const response = await fetch(`/api/stability/protocols/${updatedProtocol.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        pname: updatedProtocol.pname,
                        protocol: updatedProtocol.protocol,
                        vertical: updatedProtocol.vertical,
                        updateby: updatedProtocol.updateby,
                        pid: pid,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    fetchProtocols();  // Refresh the list
                    alert('Protocol updated successfully');
                } else {
                    alert(data.error || 'Failed to update protocol');
                }
            } catch (error) {
                console.error('Error updating protocol:', error);
                alert('Failed to update protocol');
            }
        }
    };
    const handleDeleteClick = async (protocolId) => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails'));
        const pid = productDetails ? productDetails.id : null;  // Get Product ID from localStorage
    
        if (pid) {
            try {
                const response = await fetch(`/api/stability/protocols/${protocolId}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (response.ok) {
                    fetchProtocols();  // Refresh the list after deletion
                    alert('Protocol deleted successfully');
                } else {
                    alert(data.error || 'Failed to delete protocol');
                }
            } catch (error) {
                console.error('Error deleting protocol:', error);
                alert('Failed to delete protocol');
            }
        }
    };
        
    return (
        <div>
            {/* Tab buttons */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setActiveTab('Protocols')}
                    className={`px-4 py-2 ${activeTab === 'Protocols' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Protocols
                </button>
                <button
                    onClick={() => setActiveTab('Upload')}
                    className={`px-4 py-2 ${activeTab === 'Upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Upload Protocol
                </button>
            </div>

            {/* Conditional rendering based on active tab */}
            {activeTab === 'Protocols' && (
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
                                        <span className="mr-2">&#128462;</span> {/* Icon for PDF */}
                                        {protocol.file}
                                    </button>
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => handleEditClick(protocol)}
                                        className="text-yellow-500 hover:text-yellow-700 ml-4"
                                    >
                                        Edit
                                    </button>
                                    {/* Delete Button */}
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
                </div>
            )}

            {activeTab === 'Upload' && (
                <ProtocolUploadForm onSubmit={handleUploadSuccess} closeModal={closeModal} />
            )}

            {/* Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative bg-white p-6 rounded shadow-lg w-3/4 h-3/4">
                        {/* Close Button */}
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
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        )}

                        {/* PDF Viewer */}
                        <iframe
                            src={`http://172.16.27.20/ard/stability/upload_protocols/${selectedFile}`}
                            className="w-full h-full"
                            title="Protocol File"
                            onLoad={() => setIsLoading(false)} // Stop loading once iframe is loaded
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProtocolList;
