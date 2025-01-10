import React from 'react';
import Sidebar from '../../../components/HSidebar';

const Home = () => {
  return (
    <div className='flex bg-gray-100'>
      <Sidebar />
      <main className='flex-grow ml-60 py-4 px-2 h-screen'>
        <div className='bg-white rounded-lg shadow-lg p-10'>
          <h1 className='text-center text-3xl font-bold text-gray-800 mb-4'>Welcome to the Old Analytical Reference Number System!</h1>
          <p className='text-center text-gray-600 mb-6'>
            Here, you can check all department old Analytical Reference Numbers using the sidebar.
          </p>
          <div className='flex justify-center'>
            <button className='bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition'>
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
