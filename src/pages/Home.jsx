import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logos from '../pages/Data'; // Your logos data

const LogoCard = ({ logoSrc, text, link, index }) => {
    return (
        <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 10,
            }}
            whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 }
            }}
            className="w-1/6 text-center border border-gray-300 p-5 bg-gray-100 shadow-lg hover:shadow-2xl transition-shadow duration-200 rounded-md flex flex-col items-center"
        >
            <Link to={link} className="flex flex-col items-center">
                <img src={logoSrc} alt={text} className="max-w-full h-[20vh] object-contain" />
                <p className="mt-2 text-gray-800 text-sm">{text}</p>
            </Link>
        </motion.div>
    );
};

const LogoGrid = () => {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    const auth_role = parsedUser ? parsedUser.auth_role : null;

    let filteredLogos = [];

    // Filter logos based on the role
    if (auth_role === 1) {
        filteredLogos = logos.filter(logo =>
            ['Trf', 'Dashboard2022', 'Daily Reporting', 'ARD Daily Reporting', 'FRD Daily Reporting', 'Products For Reporting', 'Projects','Sample In-Flow', 'BRM Report', 'Data Evaluate', 'Summary Sheets', 'Stability Samples', 'PIF', 'Employee Info', 'GLP', 'Data Comparison', 'Register Users'].includes(logo.text)
        );
    } else if (auth_role === 2) {
        filteredLogos = logos.filter(logo =>
            ['Trf', 'Employee Info', 'Daily Reporting',].includes(logo.text)
       );
    } else if (auth_role === 3) {
        filteredLogos = logos.filter(logo =>
            ['Trf', 'Dashboard2022', 'Daily Reporting', 'ARD Daily Reporting', 'FRD Daily Reporting', 'Products For Reporting', 'Projects','Sample In-Flow', 'BRM Report','Data Evaluate', 'Employee Info','Summary Sheets' ].includes(logo.text)
        );
    } else {
        filteredLogos = logos.filter(logo =>
            [ 'Trf', 'Employee Info', 'Daily Reporting'].includes(logo.text)
        );
    }

    return (
        <div className="flex flex-wrap justify-center p-10 gap-8 bg-white">
            {filteredLogos.map((logo, index) => (
                <LogoCard key={index} logoSrc={logo.src} text={logo.text} link={logo.link} index={index} />
            ))}
        </div>
    );
};

export default LogoGrid;
