

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BounceLoader } from 'react-spinners'; // Loading animation library

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryChart = () => {
    const [chartData, setChartData] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Track the current month
    const [selectedMonth, setSelectedMonth] = useState(new Date()); // Month selected by user
    const [monthLabel, setMonthLabel] = useState(''); // To store month label (e.g., "January 2024")

    // Function to get the first and last date of the given month
    const getMonthDateRange = (month) => {
        const firstDate = new Date(month.getFullYear(), month.getMonth(), 1); // First day of the given month
        const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0); // Last day of the given month

        // Format dates as 'YYYY-MM-DD' strings for API usage
        const formattedFirstDate = firstDate.toISOString().split('T')[0];
        const formattedLastDate = lastDate.toISOString().split('T')[0];

        return { firstdate: formattedFirstDate, lastdate: formattedLastDate };
    };

    // Function to update the current month and label
    const updateMonth = (newDate) => {
        setSelectedMonth(newDate);
        const monthName = newDate.toLocaleString('default', { month: 'long' });
        const year = newDate.getFullYear();
        setMonthLabel(`${monthName} ${year}`);
    };

    // Function to go to the previous month
    const goToPreviousMonth = () => {
        const prevMonth = new Date(selectedMonth);
        prevMonth.setMonth(selectedMonth.getMonth() - 1); // Move to the previous month
        updateMonth(prevMonth);
    };

    // Function to go to the next month
    const goToNextMonth = () => {
        const nextMonth = new Date(selectedMonth);
        nextMonth.setMonth(selectedMonth.getMonth() + 1); // Move to the next month
        updateMonth(nextMonth);
    };

    // Fetch data for the given month
    useEffect(() => {
        const fetchData = async () => {
            const { firstdate, lastdate } = getMonthDateRange(selectedMonth); // Get date range for the selected month
            
            try {
                // Fetch data for the selected month from the API
                const response = await fetch(`http://localhost:3000/category-data?firstdate=${firstdate}&lastdate=${lastdate}`);
                const data = await response.json();
                
                // Prepare the data for the bar chart
                const categories = data.map(item => item.category);
                const totalRMReceivedFinalCount = data.map(item => item.ReceivedRMFinalCount);
                const totalRMReleasedFinalCount = data.map(item => item.ReleasedRMFinalCount);
                const totalRMPending = data.map(item => item.TotalPending);
                const totalNONRMReceivedFinalCount = data.map(item => item.ReceivedNONRMFinalCount);
                const totalNONRMReleasedFinalCount = data.map(item => item.ReleasedNONRMFinalCount);
                const totalNonRMFinalCount = data.map(item => item.TotalNONRMPending);

                // Set the chart data state
                setChartData({
                    labels: categories,
                    datasets: [
                        {
                            label: 'Total RM Received Final Count',
                            data: totalRMReceivedFinalCount,
                            backgroundColor: 'rgba(255, 99, 132, 0.8)', // More vibrant color for RM
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255, 99, 132, 1)', // Hover effect
                            hoverBorderColor: 'rgba(255, 99, 132, 1)',
                            borderRadius: 2
                        },
                        {
                            label: 'Total RM Released Final Count',
                            data: totalRMReleasedFinalCount,
                            backgroundColor: 'rgba(255, 159, 64, 0.8)', // Vibrant color for RM Released
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255, 159, 64, 1)',
                            hoverBorderColor: 'rgba(255, 159, 64, 1)',
                            borderRadius: 2
                        },
                        {
                            label: 'Total RM Pending',
                            data: totalRMPending,
                            backgroundColor: 'rgba(255, 205, 86, 0.8)', // Soft color for Pending RM
                            borderColor: 'rgba(255, 205, 86, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255, 205, 86, 1)',
                            hoverBorderColor: 'rgba(255, 205, 86, 1)',
                            borderRadius: 2
                        },
                        {
                            label: 'Total Non-RM Received Final Count',
                            data: totalNONRMReceivedFinalCount,
                            backgroundColor: 'rgba(54, 162, 235, 0.8)', // Non-RM colors
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(54, 162, 235, 1)',
                            hoverBorderColor: 'rgba(54, 162, 235, 1)',
                            borderRadius: 2
                        },
                        {
                            label: 'Total Non-RM Released Final Count',
                            data: totalNONRMReleasedFinalCount,
                            backgroundColor: 'rgba(75, 192, 192, 0.8)', // Soft Non-RM Released color
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                            hoverBorderColor: 'rgba(75, 192, 192, 1)',
                            borderRadius: 2
                        },
                        {
                            label: 'Total Non-RM Pending',
                            data: totalNonRMFinalCount,
                            backgroundColor: 'rgba(153, 102, 255, 0.8)', // Non-RM Pending color
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(153, 102, 255, 1)',
                            hoverBorderColor: 'rgba(153, 102, 255, 1)',
                            borderRadius: 2
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching category data:', error);
            }
        };

        fetchData(); // Call the function to fetch data on mount
    }, [selectedMonth]); // Dependency array includes selectedMonth so it re-fetches when the month changes

    // While data is loading, show a loading spinner
    if (!chartData) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <BounceLoader color="#36d7b7" size={60} />
                <p>Loading chart data...</p>
            </div>
        );
    }

    // Disable right arrow if current month is selected
    const isRightArrowDisabled = selectedMonth.getMonth() === currentMonth.getMonth() && selectedMonth.getFullYear() === currentMonth.getFullYear();

    // Set the initial label of the month if it's empty (this happens when the component first loads)
    if (!monthLabel) {
        updateMonth(currentMonth);
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                {/* Left Arrow (Previous Month) */}
                <button onClick={goToPreviousMonth} style={{ fontSize: '20px', cursor: 'pointer' }}>&#8592;</button>

                {/* Month Label */}
                <h2 style={{ textAlign: 'center', color: '#333' }}>{monthLabel}</h2>

                {/* Right Arrow (Disabled if current month) */}
                <button
                    onClick={goToNextMonth}
                    disabled={isRightArrowDisabled}
                    style={{
                        fontSize: '20px',
                        cursor: isRightArrowDisabled ? 'not-allowed' : 'pointer',
                        color: isRightArrowDisabled ? '#ccc' : '#333',
                    }}
                >
                    &#8594;
                </button>
            </div>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    animation: {
                        duration: 1500, 
                        easing: 'easeInOutQuad',
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total RM and Non-RM Final Counts by Category for Current Month',
                            font: {
                                size: 18,
                                weight: 'bold'
                            },
                            color: '#333',
                        },
                        tooltip: {
                            backgroundColor: '#333',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#fff',
                            borderWidth: 1,
                            callbacks: {
                                label: function (tooltipItem) {
                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Category',
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                },
                                color: '#333',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Count',
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                },
                                color: '#333',
                            },
                            beginAtZero: true,
                            grid: {
                                color: '#ddd',
                            },
                        },
                    },
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 20,
                            bottom: 20
                        }
                    }
                }}
            />
        </div>
    );
};

export default CategoryChart;
