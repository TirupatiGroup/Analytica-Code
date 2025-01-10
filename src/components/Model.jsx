import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300  ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className={`bg-white text-black w-full max-w-3xl py-2 px-5 rounded-lg shadow-lg transition-transform duration-300 transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="flex justify-end items-center mb-4">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl font-bold text-center">Test Request Form</h2>
        <p className="mb-4 text-center">Please fill this form to create a Test request</p>
        
        <b className="block mb-2 text-center">From: Formulation Research Development/Nutra</b>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border border-gray-300 rounded-md">
          <div className="p-2">
            <label className="block mb-1">Product Name *</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="text" placeholder="Product Name" name="pname" required />
            
            <label className="block mb-1">Mfg. Date *</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="date" name="mfgdate" required />
            
            <label className="block mb-1">Expiry Date</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="date" name="expdate" />
          </div>
          
          <div className="p-2">
            <label className="block mb-1">Batch No. *</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="text" placeholder="Batch No." name="batchno" required />
            
            <label className="block mb-1">Batch Size</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="text" placeholder="Batch Size" name="batchsize" />
            
            <label className="block mb-1">Sample Qty.</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="text" placeholder="(e.g 50gm or 100ml)" name="sampleqty" />
          </div>

          <div className="p-2">
            <div className="mb-2">
              <b>To</b>
              <div className="flex items-center mb-1">
                <input className="mr-2" type="checkbox" name="toard" value="ARD" defaultChecked />
                <label>ARD</label>
              </div>
              <div className="flex items-center mb-1">
                <input className="mr-2" type="checkbox" name="toardmicro" value="ARD-Micro" />
                <label>ARD Micro</label>
              </div>
            </div>
            
            <label className="block mb-1">Sampling Stage *</label>
            <select className="w-full border border-gray-300 rounded-lg p-3 mb-3" name="samplestage" required>
              <option value="" disabled>Choose Sampling Stage</option>
              <option value="Raw Material">Raw Material</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Semi-Finished">Semi-Finished</option>
              <option value="Finished Good">Finished Good</option>
            </select>

            <label className="block mb-1">Average Wt./Volume</label>
            <input className="w-full border border-gray-300 rounded-lg p-3 mb-3" type="text" placeholder="Average Wt./Volume" name="avgwtvol" />
            <input className="w-full border border-gray-300 rounded-lg p-3 hidden" type="text" placeholder="Requested By" name="reqby" value="FRD Analyst 1(101)" />
          </div>
        </form>

        <p className="mb-4 text-red-600"><b>Remark:</b> Required field *</p>
        <p className="mb-4"><b>Requested By:</b> <br />FRD Analyst 1(101)</p>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2">Save</button>
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>  
  );
};

export default Modal;
