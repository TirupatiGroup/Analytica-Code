import React from 'react';

const Table = ({ categoryData }) => {
    // Define background color based on category
    const getCategoryBackgroundColor = (category) => {
        switch (category) {
            case 'nutra':
                return 'bg-orange-500'; // Nutra - Orange
            case 'pharma':
                return 'bg-blue-500'; // Pharma - Blue
            case 'ayurveda':
                return 'bg-green-500'; // Ayurveda - Green
            case 'sports':
                return 'bg-yellow-500'; // Sport - Yellow
            default:
                return 'bg-gray-200'; // Default background
        }
    };

    const categoryBackgroundColor = getCategoryBackgroundColor(categoryData.category.toLowerCase());

    return (
        <div className="bg-white shadow-md rounded-sm overflow-hidden">
            {/* Apply category-specific background color to the heading */}
            <h2 className={`p-2 text-xl font-semibold text-center ${categoryBackgroundColor}`}>
                {categoryData.category.charAt(0).toUpperCase() + categoryData.category.slice(1)}
            </h2>
            <table className="min-w-full table-auto text-center">
                <thead>
                    {/* Table headers */}
                    <tr className="bg-gray-100 text-[11px]">
                        <th className="border border-black">{categoryData.category.charAt(0).toUpperCase() + categoryData.category.slice(1)}</th>
                        <th colSpan="2" className="border  border-black text-center bg-yellow-300">Received</th>
                        <th colSpan="2" className="border  border-black text-center bg-green-300">Released</th>
                        <th colSpan="2" className="border  border-black text-center bg-red-300">Pending</th>
                    </tr>
                    <tr className="bg-gray-100 text-[8px]">
                        <th className="border border-black">Category</th>
                        <th className="border border-black bg-yellow-200">Current+Cumulative</th>
                        <th className="border border-black bg-yellow-200">Total</th>
                        <th className="border border-black bg-green-200">Current+Cumulative</th>
                        <th className="border border-black bg-green-200">Total</th>
                        <th className="border border-black bg-red-200">Total Pending</th>
                    </tr>
                </thead>
                <tbody>
                    {/* RM Data Row */}
                    <tr className="bg-gray-50 text-sm">
                        <td className=" border border-black ">Raw Mat.</td>
                        <td className="border border-black bg-yellow-200">{categoryData.totalRMReceived} + {categoryData.totalRMApprovedPendingIncludingOld}</td>
                        <td className="border border-black bg-yellow-200">{categoryData.ReceivedRMFinalCount}</td>
                        <td className="border border-black bg-green-200">{categoryData.totalRMApproved} + {categoryData.totalRMApprovedNow}</td>
                        <td className="border border-black bg-green-200">{categoryData.ReleasedRMFinalCount}</td>
                        <td className="border border-black bg-red-200">{categoryData.TotalPending}</td>
                    </tr>

                    {/* Non-RM Data Row */}
                    <tr className="bg-gray-100 text-sm">
                        <td className="border border-black">Routine</td>
                        <td className="border border-black bg-yellow-200">{categoryData.totalNonRMReceived} + {categoryData.totalNonRMApprovedPendingIncludingOld}</td>
                        <td className="border border-black bg-yellow-200">{categoryData.ReceivedNONRMFinalCount}</td>
                        <td className="border border-black bg-green-200">{categoryData.totalNonRMApproved} + {categoryData.totalNonRMApprovedNow}</td>
                        <td className="border border-black bg-green-200">{categoryData.ReleasedNONRMFinalCount}</td>
                        <td className="border border-black bg-red-200">{categoryData.TotalNONRMPending}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Table;
