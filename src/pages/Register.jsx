import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/HSidebar';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        ename: '',
        des: '',
        depart: '',
        vertical: '',
        auth_role: '',
        profile_pic: '',
        regby: ''
    });

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fileError, setFileError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'username' && !/^[0-9]*$/.test(value)) {
            setError('Username must contain only numbers.');
        } else {
            setError(null);
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setFileError('Only JPG and PNG files are allowed.');
                setFormData({
                    ...formData,
                    [name]: ''
                });
            } else {
                setFileError('');
                setFormData({
                    ...formData,
                    [name]: file
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Retrieve the 'user' object from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.ename) {
            setError('User not found in localStorage or user name (ename) is missing.');
            return;
        }

        // Validate passwords and other fields
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Validate username (numeric only)
        if (!/^[0-9]+$/.test(formData.username)) {
            setError('Username must contain only numbers.');
            return;
        }

        // Validate required fields
        if (!formData.ename) {
            setError('Please fill out all required fields.');
            return;
        }

        try {
            // Prepare FormData to be sent
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('ename', formData.ename);
            formDataToSend.append('des', formData.des);
            formDataToSend.append('depart', formData.depart);
            formDataToSend.append('vertical', formData.vertical);
            formDataToSend.append('auth_role', formData.auth_role);

            // Set 'regby' to the logged-in user's 'ename'
            formDataToSend.append('regby', user.ename);

            // Append profile pic if selected
            if (formData.profile_pic) {
                formDataToSend.append('profile_pic', formData.profile_pic);
            }

            // Send POST request to the backend
            const response = await axios.post('http://localhost:3000/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccessMessage('User successfully registered!');
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                ename: '',
                des: '',
                depart: '',
                vertical: '',
                auth_role: '',
                profile_pic: '',
                regby: ''
            });
        } catch (error) {
            setError('Error registering user. Please try again.');
            console.error('Error during registration:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow ml-60 py-4 px-2 h-screen">
                <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register User</h2>

                    {successMessage && <div className="bg-green-500 text-white p-3 mb-4 rounded">{successMessage}</div>}
                    {error && !successMessage && <div className="bg-red-500 text-white p-3 mb-4 rounded">{error}</div>}
                    {fileError && <div className="bg-red-500 text-white p-3 mb-4 rounded">{fileError}</div>}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {/* Employee ID */}
                            <div>
                                <label htmlFor="username" className="block text-gray-700">Employee ID (Username)</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* Employee Name */}
                            <div>
                                <label htmlFor="ename" className="block text-gray-700">Employee Name</label>
                                <input
                                    type="text"
                                    id="ename"
                                    name="ename"
                                    value={formData.ename}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Authorization Role */}
                            <div>
                                <label htmlFor="auth_role" className="block text-gray-700">Authorization Role</label>
                                <select
                                    id="auth_role"
                                    name="auth_role"
                                    value={formData.auth_role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Authorization Role</option>
                                    <option value="1">Admin</option>
                                    <option value="2">Editor</option>
                                    <option value="3">Manager</option>
                                    <option value="4">User</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {/* Department */}
                            <div>
                                <label htmlFor="depart" className="block text-gray-700">Department</label>
                                <select
                                    id="depart"
                                    name="depart"
                                    value={formData.depart}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Department</option>
                                    <option value="ard">ARD</option>
                                    <option value="frd">FRD</option>
                                </select>
                            </div>

                            {/* Vertical */}
                            <div>
                                <label htmlFor="vertical" className="block text-gray-700">Vertical</label>
                                <select
                                    id="vertical"
                                    name="vertical"
                                    value={formData.vertical}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Vertical</option>
                                    <option value="nt">Nutra</option>
                                    <option value="sp">Sports</option>
                                    <option value="ph">Pharma</option>
                                    <option value="ay">Ayurveda</option>
                                    <option value="glp">GLP</option>
                                    <option value="doc">Documentation</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="profile_pic" className="block text-gray-700">Profile Picture</label>
                                <input
                                    type="file"
                                    id="profile_pic"
                                    name="profile_pic"
                                    onChange={handleFileChange}
                                    className="w-full px-4 p-2 border rounded"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-2 text-gray-600"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-2 text-gray-600"
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 w-full rounded"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
