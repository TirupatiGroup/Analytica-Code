import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './AuthContext';
import About from './pages/About';
import Login from './pages/Login';
import Home from './pages/Home';
import ProfileDetails from './pages/profile/ProfileDetails';
import DailyReport from './pages/home/DailyReport/DailyReport';
import TrfHomeP from './pages/home/trf/Home';
import TestRequestForm from './pages/home/trf/TestReqForm';
import EmpInfo from './pages/home/EmpInfo/Home';
import ArdRp from './pages/home/ARD-Report/Home';
import FrdRp from './pages/home/FRD-Report/Home';
import RepPro from './pages/home/Reporting-Products/Home';
import AllProducts from './pages/home/Reporting-Products/AllProducts';
import DataEvaluate from './pages/home/DataEvaluate/Home';
import TicProjects from './pages/home/Project/Home';
import SubProjectPage from './pages/home/Project/SubProjectPage';
import OldDashBoard from './pages/home/OldDashBoard/Home';
import Nutra from './pages/home/OldDashBoard/Nutra';
import ViewReport from './pages/home/trf/ViewReport';
import ViewFrom from './pages/home/trf/ViewForm';
import Register from './pages/Register';
import QuarterlyReport from './pages/home/DailyReport/QuarterlyReport';
import BRM from './pages/home/BRM/BRM';
import SampleFlow from './pages/home/Sample-Flow/SampleFlow';
import Stability from './pages/Stability/Stability';
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    // Check for user in local storage if user is null
    const isAuthenticated = user || localStorage.getItem('user');

    return isAuthenticated ? children : <Navigate to="/" />;
};

const Layout = ({ children }) => {
    const location = useLocation();
    const noNavbarPaths = ['/'];
    const isNoNavbar = noNavbarPaths.includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen">
            {!isNoNavbar && <Navbar />}
            <div className="flex-1">
                <main className={`flex-grow ${isNoNavbar ? 'pt-0' : 'pt-20'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

const App = () => {
    useEffect(() => {
        // Clear localStorage and reset state when redirected to root
        const location = window.location.pathname;
        if (location === '/') {
            localStorage.clear();  
        }
    }, []);

    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/trfs/:vertical" element={<ProtectedRoute><TrfHomeP /></ProtectedRoute>} />
                        <Route path="/trfs/:vertical/test-request-form" element={<ProtectedRoute><TestRequestForm /></ProtectedRoute>} />
                        <Route path="/employee-info" element={<ProtectedRoute><EmpInfo /></ProtectedRoute>} />
                        <Route path="/daily-reporting" element={<ProtectedRoute><DailyReport /></ProtectedRoute>} />
                        <Route path="/daily-reporting/quarterly-reporting" element={<ProtectedRoute><QuarterlyReport /></ProtectedRoute>} />
                        <Route path="/ARD-daily-reporting" element={<ProtectedRoute><ArdRp /></ProtectedRoute>} />
                        <Route path="/FRD-daily-reporting" element={<ProtectedRoute><FrdRp /></ProtectedRoute>} />
                        <Route path="/Products-reporting" element={<ProtectedRoute><RepPro /></ProtectedRoute>} />
                        <Route path="/Products-reporting/all-products" element={<ProtectedRoute><AllProducts /></ProtectedRoute>} />
                        <Route path="/Data-Evaluate" element={<ProtectedRoute><DataEvaluate /></ProtectedRoute>} />
                        <Route path="/AddProjects" element={<ProtectedRoute><TicProjects /></ProtectedRoute>} />
                        <Route path="/sub-projects/:id" element={<ProtectedRoute><SubProjectPage /></ProtectedRoute>} />
                        <Route path="/OldDashBoard" element={<ProtectedRoute><OldDashBoard /></ProtectedRoute>} />
                        <Route path="/OldDashBoard/Nutra" element={<ProtectedRoute><Nutra /></ProtectedRoute>} />
                        <Route path="/OldDashBoard/Sports" element={<ProtectedRoute><Nutra /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfileDetails /></ProtectedRoute>}/>
                        <Route path="/report" element={<ProtectedRoute><DailyReport /></ProtectedRoute>} />
                        <Route path="/trfs/:vertical/:trfid" element={<ProtectedRoute><ViewReport /></ProtectedRoute>} />
                        <Route path="/trfs/:vertical/view/:trfid" element={<ProtectedRoute><ViewFrom /></ProtectedRoute>} />
                        <Route path='/BRM' element={<ProtectedRoute><BRM/></ProtectedRoute>}/>
                        <Route path='/SampleFlow' element={<ProtectedRoute><SampleFlow/></ProtectedRoute>}/>
                        <Route path='/stability' element={<ProtectedRoute><Stability/></ProtectedRoute>}/>
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App;
