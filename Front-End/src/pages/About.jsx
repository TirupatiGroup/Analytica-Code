import React from 'react';
import Image1 from '../assets/h-icon1.png';
import Image2 from '../assets/h-icon2.png';
import Image3 from '../assets/h-icon3.png';
import StepImage1 from '../assets/h-icon1.png'; // Assuming these are correct
import StepImage2 from '../assets/h-icon2.png'; // Update with the correct path
import StepImage3 from '../assets/h-icon3.png'; // Update with the correct path

const About = () => {
    return (
        <div className="bg-gray-100 min-h-screen mx-auto">
            {/* Hero Section */}
            <section className="bg-gradient-to-l from-sky-900 to-indigo-600 text-white py-40">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-semibold">Transform Your Data into Actionable Insights</h2>
                    <p className="mt-4 text-lg">Generate AR Numbers, Daily Reports, and Manage Employee Details with Ease</p>
                    <button className="mt-6 bg-white text-blue-600 py-2 px-4 rounded">Get Started</button>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: "Effortless AR Number Generation",
                        description: "Generate accurate Accounts Receivable numbers instantly with our intuitive tool.",
                        image: Image1
                    },
                    {
                        title: "Daily Reporting Made Simple",
                        description: "Access comprehensive daily reports tailored to your business needs.",
                        image: Image2
                    },
                    {
                        title: "Streamlined Employee Details",
                        description: "Manage and track employee information efficiently.",
                        image: Image3
                    }
                ].map((feature, index) => (
                    <div key={index} className="bg-white p-5 rounded shadow flex">
                        <img src={feature.image} alt={feature.title} className="w-1/3 h-auto mr-6" /> {/* Increased margin */}
                        <div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="mt-2">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* How It Works Section */}
            <section className="bg-gray-200 py-10">
                <div className="container mx-auto text-center">
                    <h2 className="text-5xl font-semibold mb-8">How It Works</h2>
                    <div className="relative flex flex-col items-center">
                        {/* Overall connecting line */}
                        <div className="absolute w-1 h-28 bg-green-500 left-1/2 transform -translate-x-1/2 top-0"></div>

                        {[
                            {
                                step: "Step 1: Sign Up / Log In",
                                description: "Create an account or log in to access your dashboard.",
                                image: StepImage1,
                            },
                            {
                                step: "Step 2: Input Your Data",
                                description: "Easily input your data into our user-friendly interface.",
                                image: StepImage2,
                            },
                            {
                                step: "Step 3: Generate Reports & Insights",
                                description: "Get instant reports and insights tailored to your needs.",
                                image: StepImage3,
                            }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-center mb-12 relative bg-white p-8 rounded-lg shadow-lg w-full max-w-xl z-10 border-2 border-green-500">
                                {/* Alternate image positions */}
                                {index % 2 === 0 ? (
                                    <>
                                        <img src={item.image} alt={item.step} className="w-full md:w-1/2 h-auto mb-4 md:mb-0 md:mr-4" />
                                        <div className="flex flex-col items-start">
                                            <p className="text-lg font-semibold text-gray-800">{item.step}</p>
                                            <p className="mt-2 text-gray-600">{item.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-start">
                                            <p className="text-lg font-semibold text-gray-800">{item.step}</p>
                                            <p className="mt-2 text-gray-600">{item.description}</p>
                                        </div>
                                        <img src={item.image} alt={item.step} className="w-full md:w-1/2 h-auto mb-4 md:mb-0 md:ml-4" />
                                    </>
                                )}

                                {/* Connecting line between steps */}
                                {index < 2 && (
                                    <div className="absolute w-1 h-16 bg-green-500 left-1/2 transform -translate-x-1/2 top-full"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Call to Action Section */}
            <section className="bg-blue-600 text-white py-10 text-center">
                <h2 className="text-2xl font-semibold">Ready to Elevate Your Data Management?</h2>
                <button className="mt-4 bg-white text-blue-600 py-2 px-4 rounded">Start Your Free Trial</button>
            </section>
        </div>
    );
};

export default About;
