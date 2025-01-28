import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/HSidebar';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { logoData } from '../../pages/Data'; 

const ProfileDetails = () => {
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(logoData[1].src);
    const [userName, setUserName] = useState('');
    const [designation, setDesignation] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [vertical, setVertical] = useState('');
    const [depart, setDepart] = useState('');
    const navigate = useNavigate();

    // const baseURL = "http://172.16.27.20/image/userpic/";
    const baseURL = "http://172.16.29.53:3000/uploads/profile_pics/";


    // Fetch user data from localStorage on component mount
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            const profileURL = storedUser.profile_pic
                ? `${baseURL}${storedUser.profile_pic}`
                : logoData[1].src;

            setProfileImage(profileURL);
            setUserName(storedUser.ename || 'John Doe');
            setDesignation(storedUser.des || 'Tirupati Innovation Center');
            setEmail(storedUser.email || 'xyz@email.com');
            setPhone(storedUser.mno || 'Demo Number');
            setVertical(formatVertical(storedUser.vertical));
            setDepart(formatDepart(storedUser.depart));
            setUser(storedUser);
        } else {
            console.log('No user data found in localStorage');
        }

        // Show notification if the profile is incomplete
        if (storedUser && (!storedUser.email || !storedUser.mno)) {
            toast.info("Please complete your profile by adding your email and phone number.", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }, []);

    // Functions to format fields as in the Navbar
    const formatVertical = (vertical) => {
        switch (vertical) {
            case 'nt': return 'NUTRA';
            case 'sp': return 'Sport';
            case 'ay': return 'Ayurveda';
            case 'ph': return 'Pharma';
            default: return vertical || '';
        }
    };

    const formatDepart = (depart) => {
        switch (depart) {
            case 'frd': return 'F.R.D.';
            case 'ard': return 'A.R.D.';
            default: return depart || '';
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Loading user profile...</p>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow ml-60 p-5">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Profile Details</h2>

                <div className="flex justify-center md:justify-start mb-8">
                    {/* Profile Image */}
                    <img
                        src={profileImage}
                        alt="User Photo"
                        className="w-36 h-36 rounded-full border-4 border-gray-300 shadow-lg hover:shadow-2xl transition duration-300"
                        onError={(e) => (e.target.src = logoData[1].src)} // Fallback in case of error
                    />
                    <div className="ml-6 flex flex-col justify-center">
                        <h3 className="text-3xl font-bold text-gray-800">{userName}</h3>
                        <p className="text-lg text-gray-600 italic">{designation}</p>
                        <p className="text-md text-gray-500">{depart}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8">
                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-700"><strong>Employee ID:</strong> {user.username}</p>
                            <p className="text-gray-700"><strong>Email:</strong> {email}</p>
                            <p className="text-gray-700"><strong>Phone:</strong> {phone}</p>
                        </div>
                        <div>
                            <p className="text-gray-700"><strong>Department:</strong> {depart}</p>
                            <p className="text-gray-700"><strong>Vertical:</strong> {vertical}</p>
                        </div>
                    </div>
                </div>
{/*<div className="mt-8 flex justify-end">
                    <button
                        onClick={() => navigate('/edit-profile')}
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-600 transition duration-300"
                    >
                        Edit Profile
                    </button>
                </div> */}
                
            </div>

            <ToastContainer />
        </div>
    );
};

export default ProfileDetails;
