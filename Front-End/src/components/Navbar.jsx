import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faArrowLeft, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { logoData } from '../pages/Data'; // Import logo data
import { useAuth } from '../AuthContext';
import { useDispatch } from 'react-redux'; // Import useDispatch to dispatch actions
import { resetState } from '../redux/trfSlice'; // Import the resetState action
import Preloader from './Preloader'; // Import Preloader component

const Navbar = () => {
    const { logout } = useAuth();
    const dispatch = useDispatch(); // Hook for dispatching actions
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');
    const [profileImage, setProfileImage] = useState(logoData[1].src); // Default to avatar image
    const [userName, setUserName] = useState('');
    const [designation, setDesignation] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [loading, setLoading] = useState(false); // State to track loading
    const profileMenuRef = useRef(null); // Ref for profile menu

    const baseURL = "http://172.16.27.20/image/userpic/";
    // const baseURL = " http://localhost:3000/uploads/profile_pics/";


    const getGreetingMessage = () => {
        const hours = new Date().getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        return "Good Evening";
    };

    useEffect(() => {
        setGreeting(getGreetingMessage());

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            const profileURL = storedUser.profile_pic
                ? `${baseURL}${storedUser.profile_pic}`
                : logoData[1].src;
            // console.log("Profile URL:", profileURL);
            setProfileImage(profileURL);
            setUserName(storedUser.ename || 'John Doe');
            setDesignation(storedUser.des || 'Tirupati Innovation Center');
        }
    }, []);

    const handleLogout = () => {
        logout(); // Clear user from AuthContext
        dispatch(resetState()); // Reset Redux state
        navigate('/login'); // Redirect to login page
        setShowProfileMenu(false);
    };

    const handleProfileClick = () => {
        setShowProfileMenu(false);
    };

    const handleMenuToggle = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    // Handle clicks outside of the profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleBackClick = () => {
        setLoading(true); // Start showing the preloader
        setTimeout(() => {
            navigate(-1); // Go back to the previous page
            setLoading(false); // Stop showing the preloader
        }, 1000); // Simulate a delay for the preloader (adjust as needed)
    };

    return (
        <>
            {loading && <Preloader />} {/* Show preloader if loading is true */}

            <nav className="flex items-center justify-between fixed top-0 left-0 w-full bg-white text-gray-800 p-4 shadow-lg z-50">
                {/* Logo */}
                <Link to="/home" className="flex items-center">
                    <div className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-md shadow-lg">
                        <span className="text-2xl font-extrabold tracking-wide text-white">Analytica</span>
                    </div>
                </Link>

                {/* User Actions */}
                <div className="flex items-center space-x-6">
                    {/* Profile Menu */}
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={handleMenuToggle} className="relative flex items-center focus:outline-none">
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-gray-200"
                                onError={(e) => (e.target.src = logoData[1].src)} // Fallback to default avatar
                            />
                        </button>
                        {showProfileMenu && (
                            <div
                                className="absolute right-0 mt-2 w-60 bg-white text-gray-700 rounded-lg shadow-md p-4 animate-fadeIn"
                                style={{ animationDuration: "300ms" }}
                            >
                                <h3 className="text-lg font-medium">{greeting}, {userName}!</h3>
                                <p className="text-sm text-gray-500">{designation}</p>
                                <div className="mt-3">
                                    <Link
                                        to="/profile"
                                        onClick={handleProfileClick}
                                        className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition duration-200"
                                    >
                                        <FontAwesomeIcon icon={faCircleUser} className="mr-2" />
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center mt-3 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-500 transition duration-200 w-full"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={handleBackClick} // Handle back button click with loading
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
