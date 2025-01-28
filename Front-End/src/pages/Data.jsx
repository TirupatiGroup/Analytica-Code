import logo from '../assets/logo.png';
import avatar from '../assets/home/Avatar.jpg';

export const logoData = [
    {
        src: logo,
        alt: 'Company Logo',
        
    },
    {
        src : avatar,
        alt : 'emp',
    }
];

// Home page data 
import logo1 from '../assets/home/h-icon1.png';
import logo2 from '../assets/home/group.png';
import logo3 from '../assets/home/daily-report.png';
import logo4 from '../assets/home/ard.png';
import logo5 from '../assets/home/frd.png';
import logo6 from '../assets/home/productR.png';
// import logo7 from '../assets/home/dataeval.png';
// import logo8 from '../assets/home/project.png';
// import logo9 from '../assets/home/dashboard.png';
import logo10 from '../assets/home/statistics.png';
import logo11 from '../assets/home/brm.png';
// import logo12 from '../assets/home/sheet.png';
import logo13 from '../assets/home/researc.png';
// import logo14 from '../assets/home/pif.png';
// import logo15 from '../assets/home/pdf1.png';
// import logo16 from '../assets/home/gpl1.png';
// import logo17 from '../assets/home/compa.png';
import logo18 from '../assets/home/adduser.png'
    const getTrfLink = () => {
        const user = localStorage.getItem('user');
        const parsedUser = user ? JSON.parse(user) : null;
        const vertical = parsedUser ? parsedUser.vertical : 'nt'; 
        return `/trfs/${vertical}`;
    };

    // Update your logos array as needed
    const logos = [
        // common pages
        { src: logo1, text: 'Trf', link: getTrfLink() },
    { src: logo2, text: 'Employee Info', link: '/employee-info' },
    { src: logo3, text: 'Daily Reporting', link: '/daily-reporting' },
    // TIC dashboard (PMT)
    { src: logo4, text: 'ARD Daily Reporting', link: '/ARD-daily-reporting' },
    { src: logo5, text: 'FRD Daily Reporting', link: '/FRD-daily-reporting' },
    { src: logo6, text: 'Products For Reporting', link: '/Products-reporting' },
    // { src: logo7, text: 'Data Evaluate', link: '/Data-Evaluate' },
    // { src: logo8, text: 'Projects', link: '/AddProjects' },
    // Admin 
    // { src: logo9, text: 'Dashboard2022', link: '/OldDashBoard' },
    // { src: logo9, text: 'Dashboard2022' },
    { src: logo10, text: 'Sample In-Flow' ,link: '/SampleFlow' },
    { src: logo11, text: 'BRM Report', link: '/BRM' },
    // { src: logo12, text: 'Summary Sheets' },
    // { src: logo13, text: 'Stability Samples' , link: '/stability' },
    // { src: logo14, text: 'PIF' },
    // { src: logo16, text: 'GLP' },
    // { src: logo17, text: 'Data Comparison' },
    { src: logo18, text: 'Register Users',link:'/register' },
];

export default logos;


