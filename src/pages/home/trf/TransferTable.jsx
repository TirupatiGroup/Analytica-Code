import React, { useState } from 'react';

const TransferTable = ({ trfData, searchTerm }) => {
  const { trfdate, batchno, arnprefix, arnnutra, arnayurveda, arnpharma, arnsports, pname, batchsize, samplestage, mfgdate, sampleqty, avgwtvol, expdate } = trfData;

  // Highlight the matching text based on the search term
  const highlightText = (text, term) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
    );
  };

  // Combine `arnprefix` with one of the other fields or 'N/A'
  const combinedArn = arnprefix + (arnnutra || arnayurveda || arnpharma || arnsports || 'N/A');
  return (
    <table className="table-auto w-full mt-4 text-xs">
      <tbody className="border border-1 border-black">
        <tr className="border border-1 border-black">
          <td className="p-1 font-medium border border-1 border-black">Date</td>
          <td className="p-1">{new Date(trfdate).toLocaleDateString('en-GB')}</td>
          <td className="p-2 font-medium border border-1 border-black">Batch No./Lot No.</td>
          <td className="p-2">{batchno || ' '}</td>
          <td className="p-2 font-medium border border-1 border-black">A.R. No.</td>
          <td className="p-2">{highlightText(combinedArn, searchTerm)}</td>
        </tr>
        <tr className="border border-1 border-black">
          <td className="p-1 font-medium border border-1 border-black">Product Name:</td>
          <td className="p-1">{pname || ' '}</td>
          <td className="p-2 font-medium border border-1 border-black">Batch Size:</td>
          <td className="p-2">{batchsize || ' '}</td>
          <td className="p-2 font-medium border border-1 border-black">Sampling Stage:</td>
          <td className="p-2">{samplestage || ' '}</td>
        </tr>
        <tr className="border border-1 border-black">
          <td className="p-1 font-medium border border-1 border-black">Mfg. Date:</td>
          <td className="p-1">{new Date(mfgdate).toLocaleDateString('en-GB') || ' '}</td>
          <td className="p-2 font-medium border border-1 border-black">Sample Qty.:</td>
          <td className="p-2">{sampleqty || ''}</td>
          <td className="p-2 font-medium border border-1 border-black">Average Wt./Volume:</td>
          <td className="p-2">{avgwtvol || ''}</td>
        </tr>
        <tr className="border border-1 border-black">
          {/* <td className="p-1 font-medium border border-1 border-black" colSpan="6">Expiry. Date: <span>{new Date(expdate).toLocaleDateString() || 'N.A.'}</span></td> */}
          <td className="p-1 font-medium border border-1 border-black" colSpan="6">
            Expiry. Date: <span className='font-normal'>
              {(!expdate || expdate === '0000-00-00' || expdate === '1899-11-29T18:38:50.000Z' || new Date(expdate).getFullYear() === 1899)
                ? 'N/A'
                : new Date(expdate).toLocaleDateString('en-GB')}
            </span>
          </td>



        </tr>
      </tbody>
    </table>
  );
};

export default TransferTable;
