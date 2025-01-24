import React, { useState, useEffect } from 'react';
import api from '../../../../api/axios'; // Ensure `api` is imported from the correct file

const ProtocolUploadForm = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [pname, setPname] = useState('');
    const [protocol, setProtocol] = useState('');
    const [vertical, setVertical] = useState('');
    const [updateby, setUpdateby] = useState('');
    const [pid, setPid] = useState('');

    // Load initial data from localStorage
    useEffect(() => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails'));
        if (productDetails) {
            setPname(productDetails.pname || '');
            setProtocol(productDetails.protocol || '');
            setVertical(productDetails.vertical || '');
            setPid(productDetails.id || '');
        }
        const userDetails = JSON.parse(localStorage.getItem('user'));
        if (userDetails) {
            setUpdateby(userDetails.ename || userDetails.username || '');
        }
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('pname', pname);
        formData.append('protocol', protocol);
        formData.append('vertical', vertical);
        formData.append('updateby', updateby);
        formData.append('pid', pid);

        try {
            const response = await api.post('/api/stability/protocols', formData);

            if (response.status === 200 || response.status === 201) {
                alert('Protocol uploaded successfully!');
                setFile(null); // Clear file state
                onUploadSuccess(); // Notify parent to refresh protocol list

                // Explicitly reset the file input value
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.value = '';
                }
            } else {
                const data = response.data;
                alert(data.error || 'Error uploading protocol');
            }
        } catch (error) {
            console.error('Error uploading protocol:', error);
            alert('Error uploading protocol. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="mt-4">
            <div className="mb-4">
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700">
                    Protocol File
                </label>
                <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    required
                />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
                Upload Protocol
            </button>
        </form>
    );
};

export default ProtocolUploadForm;
