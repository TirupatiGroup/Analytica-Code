import React from 'react';
import { BeatLoader } from 'react-spinners'; 

const Preloader = () => (
  <div className="preloader-container fixed inset-0 bg-transparent flex items-center justify-center z-50 backdrop-blur-sm">
    <BeatLoader size={20} color="#4F46E5" />
  </div>
);

export default Preloader;
