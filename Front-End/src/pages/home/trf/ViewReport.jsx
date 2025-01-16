import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Tic from '../../../assets/tichead.jpg'; // Image path
import Sidebar from '../../../components/HSidebar';
import Skeleton from 'react-loading-skeleton'; // Skeleton loader
import 'react-loading-skeleton/dist/skeleton.css'; // Import the skeleton styles
import api from '../../../api/axios';
const Report = () => {
  const { vertical, trfid } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!vertical || !trfid) {
      setError("Invalid vertical or trfid.");
      setLoading(false);
      return;
    }

    const apiUrl = `/trfs/${vertical}/${trfid}`;

    const fetchData = async () => {
      try {
        const response = await api.get(apiUrl);
        const data = response.data;
        setReportData(data);
        setDataLoaded(true); // Mark data as loaded
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vertical, trfid]);

  const arnPrefixMap = {
    ay: 'arnayurveda',
    nt: 'arnnutra',
    ph: 'arnpharma',
    sp: 'arnsports',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Skeleton count={5} height={30} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (reportData) {
    const arnColumnName = arnPrefixMap[vertical];
    const arnValue = reportData.trfData[arnColumnName] || 'Not Available';

    // Check if approvedby is present in the data
    const isApproved = reportData.trfData.approvedby;

    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-grow ml-60 p-5" >
          {/* Main content styled like a document */}
          <div className={`document-container p-6 ${isApproved ? 'bg-white' : 'bg-gray-50'}`} style={{ border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div className="header my-4 border border-black text-sm">
              <img
                src={Tic}
                alt="Report Header"
                className="mx-auto mb-2"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <h1 className="text-xl font-bold text-gray-800 text-center">FORMAT</h1>
              <table className="table-auto w-full mt-4">
                <tbody>
                  <tr className="border-y border-black">
                    <td className="font-medium text-black p-2">Format Name: ANALYTICAL REPORT</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-black border-r border-black p-2">
                      Format Number: TIC/ARD/022/F/06-02
                    </td>
                    <td className="font-medium text-black border-t border-black p-2">
                      Effective Date: 03/06/2024
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Test Table */}
            <div className="test-table my-6 relative" style={{ position: 'relative' }}>
              {/* Watermark inside the test table */}
              {!isApproved && (
                <div
                className="watermark absolute top-0 left-0 w-full h-full text-center text-7xl text-gray-500 font-bold"
                style={{
                  transform: 'rotate(-45deg)',  // Rotate watermark
                  opacity: 0.2, // Lighter opacity for the watermark
                  pointerEvents: 'none', // Ensure watermark doesn't block interaction
                  zIndex: 0, // Keep watermark in the background
                  whiteSpace: 'normal', // Allow text to wrap
                  wordWrap: 'break-word', // Ensure text wraps inside the container
                  display: 'flex', // Use flexbox to center watermark
                  justifyContent: 'center', // Align watermark horizontally
                  alignItems: 'center', // Align watermark vertically
                  padding: '15px', // Adjust padding for better spacing if needed
                  height: '100%', // Ensure watermark takes up full height of the container
                }}
              >
                <span>UNDER ANALYSIS</span>
              </div>
              
              )}

              {/* Table content */}
              <table className="table-auto w-full mt-4 border-collapse border border-black text-[12px]">
                <thead className="border border-black">
                  <tr>
                    <th className="p-1 font-medium border border-black">SR. NO.</th>
                    <th className="p-1 font-medium border border-black">Test Name</th>
                    <th className="p-1 font-medium border border-black">Observation/Results</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.testData.map((test, index) => {
                    const subTests = reportData.subTestResults.filter(
                      (subTest) => String(subTest.testid) === String(test.id)
                    );

                    const mainTestSerialNumber = index + 1;

                    return (
                      <React.Fragment key={test.id}>
                        <tr className="border border-black">
                          <td className="p-1 font-semibold border border-black">{mainTestSerialNumber}</td>
                          <td className="p-1 font-semibold border border-black">{test.test}</td>
                          <td className="p-1">{test.results || ' '}</td>
                        </tr>
                        {subTests.length > 0 &&
                          subTests.map((subTest, subIndex) => {
                            const subTestSerialNumber = `${mainTestSerialNumber}.${subIndex + 1}`;

                            return (
                              <tr key={subTest.id} className="border-b bg-gray-50 border-black">
                                <td className="p-1 pl-6 border border-black">{subTestSerialNumber}</td>
                                <td className="p-1 pl-6 border border-black">{subTest.test}</td>
                                <td className="p-1">{subTest.results || ' '}</td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Section */}
            <div className="footer mt-8 text-sm">
              <h5>Remark:</h5>
              <ul className="list-disc pl-5">
                <li>The above-mentioned material/product complies/does not comply as per specification limit.</li>
                <li>For information purposes only.</li>
              </ul>
            </div>
            <div className='flex mt-10 justify-between px-1 py-1'>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Prepared By: </span>
                <br />
                <span className="italic">(Sign & Date)</span>
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Reviewed By: </span>
               <br />
                <span className="italic">(Sign & Date)</span>
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Received By: </span>
                <br />
                <span className="italic">(Sign & Date)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Report;
