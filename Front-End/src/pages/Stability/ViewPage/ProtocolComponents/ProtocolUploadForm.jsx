import React, { useState, useEffect } from 'react';

const ProtocolUploadForm = ({ handleFileClick, closeModal }) => {
    const [file, setFile] = useState(null);
    const [pname, setPname] = useState('');
    const [protocol, setProtocol] = useState('');
    const [vertical, setVertical] = useState('');
    const [updateby, setUpdateby] = useState('');
    const [pid, setPid] = useState('');
    
    // Fetch product details from localStorage
    useEffect(() => {
        const productDetails = JSON.parse(localStorage.getItem('productDetails'));
        if (productDetails) {
            setPname(productDetails.pname);
            setProtocol(productDetails.protocol);  
            setVertical(productDetails.vertical);
            setPid(productDetails.id);
        }
        const userDetails = JSON.parse(localStorage.getItem('user'));
        if (userDetails) {
            setUpdateby(userDetails.ename || userDetails.username);
        }
    }, []);
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);  // The file is appended as binary data
        formData.append('pname', pname);
        formData.append('protocol', protocol);
        formData.append('vertical', vertical);
        formData.append('updateby', updateby);
        formData.append('pid', pid);
    
        try {
            const response = await fetch('/api/stability/protocols', {
                method: 'POST',
                body: formData,  // Sending file as binary data in the body
            });
    
            if (response.ok) {
                alert('Protocol uploaded successfully!');
                closeModal();
            } else {
                const data = await response.json();
                alert(data.error || 'Error uploading protocol');
            }
        } catch (error) {
            console.error('Error uploading protocol:', error);
            alert('Error uploading protocol');
        }
    };
    

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Upload Protocol</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                
                <div className="mb-4">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">Protocol File</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                        required
                    />
                </div>

                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Upload</button>
            </form>
        </div>
    );
};

export default ProtocolUploadForm;
