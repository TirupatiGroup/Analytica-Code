import React, { useState } from 'react';
import { useAuth } from '../AuthContext'; // Import AuthContext
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify styles
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import '../index.css';

const LoginPage = () => {
    const { login } = useAuth(); // Use the AuthContext to access the login function
    const [passwordVisible, setPasswordVisible] = useState(false); // For password visibility toggle
    const [username, setUsername] = useState(''); // Employee ID state
    const [password, setPassword] = useState(''); // Password state
    const [error, setError] = useState(''); // For managing error messages
    const [usernameError, setUsernameError] = useState(''); // To manage username-specific error message
    const navigate = useNavigate(); // React Router hook for navigation

    // Handle employee ID input validation
    const handleUsernameChange = (e) => {
        const value = e.target.value;
        // Allow only numbers (Employee ID should be numeric)
        const regex = /^[0-9]*$/;
        if (!regex.test(value)) {
            setUsernameError('Employee ID must be numeric.');
        } else {
            setUsernameError('');
        }
        setUsername(value);
    };

    // Handles the form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate that both fields are filled out and username is numeric
        if (username === '' || password === '') {
            setError('Please enter a valid Employee ID and password.');
            toast.error('Please enter a valid Employee ID and password.');
            return;
        }

        if (usernameError) {
            setError('Please fix the errors before submitting.');
            toast.error('Please fix the errors before submitting.');
            return;
        }

        try {
            // Make POST request to the server for login
            const response = await axios.post('http://localhost:3000/login', { username, password });
            const userData = response.data.user;

            // If login is successful, show success toast and store user data
            if (response.status === 200 && userData) {
                toast.success('Login Successful!', {
                    autoClose: 800,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                // Store the user data in localStorage
                localStorage.setItem('user', JSON.stringify(userData));

                // Call the login function from AuthContext
                login(userData);

                // Delay the redirect to give the toast time to show (2 seconds delay)
                setTimeout(() => {
                    navigate('/home'); // Redirect to home page
                }, 2000); // Delay of 2 seconds
            }
        } catch (err) {
            // Handle login error
            setError('Invalid Employee ID or password.');
            toast.error('Invalid Employee ID or password.', {
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Clear the form fields if login fails
            setUsername(''); // Clear Employee ID field
            setPassword(''); // Clear Password field
        }
    };

    // Toggles password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-orange-500 p-5 sm:p-2 md:p-12 relative">
            {/* Left Side Text */}
            <motion.div
                className="flex-1 flex flex-col justify-center items-center md:items-start"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-4xl md:text-6xl lg:text-9xl font-bold mb-6 animated-gradient text-center md:text-left">
                    Analytica
                </h2>
                <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4 text-white text-center md:text-left">
                    Tirupati Innovation Centre
                </h1>
                <i className="text-base md:text-lg lg:text-xl text-white mb-6 text-center md:text-left">
                    Fostering life through Innovation
                </i>
            </motion.div>

            {/* Background Image */}
            <img
                src="./src/assets/tlogo.png"
                alt="TWL logo"
                className="absolute bottom-0 right-0 w-[95%] h-auto opacity-60 -z-0 md:w-[50%]"
            />

            {/* Right Side Login Form */}
            <motion.div
                className="flex flex-col items-center w-full max-w-md p-6 md:p-10 backdrop-blur-sm bg-white/55 rounded-lg shadow-md md:m-10 flex-shrink-0 h-auto md:h-[70vh] z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center text-[#333333]">Log In</h2>
                <form onSubmit={handleSubmit} className="w-full">
                    {/* Employee ID Input */}
                    <div className="mb-4">
                        <label className="block text-[#333333] text-sm font-bold mb-2" htmlFor="empId">
                            Employee ID
                        </label>
                        <input
                            type="text"
                            id="empId"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Enter your Employee ID"
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-[#333333] leading-tight focus:outline-none focus:shadow-outline ${error || usernameError ? 'border-red-500' : ''}`}
                            required
                            autoComplete="off"
                        />
                        {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-6 relative">
                        <label className="block text-[#333333] text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333333] leading-tight focus:outline-none focus:shadow-outline"
                            required
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-1 top-12 transform -translate-y-1/2 text-gray-500 focus:outline-none p-2"
                        >
                            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-between mb-6">
                        <a href="/forgot-password" className="text-sm text-orange-500 hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    >
                        Log In
                    </button>
                </form>
            </motion.div>

            {/* ToastContainer to render toast notifications */}
            <ToastContainer

            position="top-center"
            />
        </div>
    );
};

export default LoginPage;
