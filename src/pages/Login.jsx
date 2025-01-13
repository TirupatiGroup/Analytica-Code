import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const LoginPage = () => {
    const { login } = useAuth();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        const regex = /^[0-9]*$/;
        if (!regex.test(value)) {
            setUsernameError('Employee ID must be numeric.');
        } else {
            setUsernameError('');
        }
        setUsername(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

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
            const response = await axios.post('http://localhost:3000/login', { username, password });
            const userData = response.data.user;

            if (response.status === 200 && userData) {
                toast.success('Login Successful!', {
                    autoClose: 800,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                localStorage.setItem('user', JSON.stringify(userData));
                login(userData);

                setTimeout(() => {
                    navigate('/home');
                }, 2000);
            }
        } catch (err) {
            setError('Invalid Employee ID or password.');
            toast.error('Invalid Employee ID or password.', {
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            setUsername('');
            setPassword('');
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-r from-orange-400 to-orange-500 p-5 sm:p-2 md:p-12 relative">
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

            <img
                src="./src/assets/tlogo.png"
                alt="TWL logo"
                className="absolute bottom-0 right-0 w-[95%] h-auto opacity-60 -z-0 md:w-[50%]"
            />

            <motion.div
                className="flex flex-col items-center w-full max-w-md p-6 md:p-10 backdrop-blur-sm bg-white/70 rounded-lg shadow-lg md:m-10 flex-shrink-0 h-auto md:h-[70vh] z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center text-[#333333]">Log In</h2>
                <form onSubmit={handleSubmit} className="w-full">
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

                    <div className="flex items-center justify-between mb-6">
                        <a href="/forgot-password" className="text-sm text-orange-500 hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    >
                        Log In
                    </button>
                </form>
            </motion.div>

            <ToastContainer position="top-center" />
        </div>
    );
};

export default LoginPage;
