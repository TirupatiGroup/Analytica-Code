
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import Avatar from '../../../assets/home/Avatar.jpg';
import { FaTimes, FaTrashAlt } from 'react-icons/fa';

const Home = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToView, setEmployeeToView] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [editFields, setEditFields] = useState({});
    const [loadingModal, setLoadingModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [userAuthRole, setUserAuthRole] = useState(null);

    // Fetch the user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')); // Assuming the user object is stored as 'user'
        if (user) {
            setUserAuthRole(user.auth_role);
        }
    }, []);

    // Fetch employee data
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://localhost:3000/employees');
                setEmployees(response.data);
            } catch (err) {
                setError('Error fetching employees');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    // Open modal for viewing employee details
    const openViewModal = async (employeeId) => {
        setLoadingModal(true);
        try {
            const response = await axios.get(`http://localhost:3000/employees/${employeeId}`);
            setEmployeeToView(response.data);
            setIsViewModalOpen(true);
        } catch (error) {
            setError('Error fetching employee details');
        } finally {
            setLoadingModal(false);
        }
    };

    // Open modal for editing employee details
    const openEditModal = async (employeeId) => {
        setLoadingModal(true);
        try {
            const response = await axios.get(`http://localhost:3000/employees/${employeeId}`);
            setEmployeeToEdit(response.data);
            setEditFields(response.data); // Prepopulate form fields
            setIsEditModalOpen(true);
        } catch (error) {
            setError('Error fetching employee details');
        } finally {
            setLoadingModal(false);
        }
    };

    // Handle input changes for edit form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFields({ ...editFields, [name]: value });
    };

    // Submit the update
    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const response = await axios.put(
                `http://localhost:3000/employees/${employeeToEdit.id}`,
                editFields
            );
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === employeeToEdit.id ? response.data : emp
                )
            );
            setIsEditModalOpen(false); // Close modal after update
        } catch (err) {
            setError('Error updating employee details');
        } finally {
            setUpdating(false);
        }
    };
    // Handle employee deletion
    const handleDelete = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await axios.delete(`http://localhost:3000/employees/${employeeId}`);
                setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
            } catch (err) {
                setError('Error deleting employee');
            }
        }
    };


    // Close modals
    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setEmployeeToView(null);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEmployeeToEdit(null);
    };
    const getVerticalName = (verticalCode) => {
        const verticalMapping = {
            ay: 'Ayurveda',
            sp: 'Sports',
            nt: 'Nutra',
            ph: 'Pharma',
            doc: 'Documentation',
            glp: 'G.L.P.',
            micro: 'Micro',
        };

        return verticalMapping[verticalCode] || 'N/A'; // Default to 'Unknown' if no match is found
    };
    const getDepName = (depCode) => {
        const depMapping = {
            ard: 'ARD',
            frd: 'FRD',
        };

        return depMapping[depCode] || 'N/A'; // Default to 'Unknown' if no match is found
    };

    if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;
    if (error) return <div className="text-center text-lg font-semibold text-red-600">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-center mb-6">Employee Directory</h1>

            {employees.length === 0 ? (
                <p className="text-center text-lg">No employees found</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{employee.ename}</h3>
                            <p><strong>Username:</strong> {employee.username}</p>
                            <p><strong>Department:</strong> {getDepName(employee.depart)}</p>
                            <p><strong>Vertical:</strong> {getVerticalName(employee.vertical)}</p>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openViewModal(employee.id)}
                                    className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition-all"
                                >
                                    View
                                </button>
                                {userAuthRole === 1 && (
                                    <>

                                        <button
                                            onClick={() => openEditModal(employee.id)}
                                            className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)} // Call delete function
                                            className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition-all"
                                        >
                                            <FaTrashAlt /> {/* Trash icon */}
                                        </button>
                                    </>

                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            <ReactModal
                isOpen={isViewModalOpen}
                onRequestClose={closeViewModal}
                contentLabel="View Employee"
                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                ariaHideApp={false}
            >
                {loadingModal ? (
                    <div className="text-center p-6">Loading employee details...</div>
                ) : (
                    employeeToView && (
                        <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto relative">
                            {/* Close Button in Top-Right Corner */}
                            <button
                                onClick={closeViewModal}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                aria-label="Close"
                            >
                                <FaTimes className="text-gray-500" />
                            </button>

                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-28 h-28 mb-4">
                                    <img
                                        src={employeeToView.profile_pic || Avatar}
                                        alt="Employee Avatar"
                                        className="w-full h-full rounded-full border-4 border-gray-200 shadow-md object-cover"
                                    />
                                </div>
                            </div>

                            {/* Profile Details Section */}
                            <div className="text-gray-700">
                                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                                    Hi, {employeeToView.ename}
                                </h2>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium">
                                        <strong>Username:</strong> <span className="text-gray-600">{employeeToView.username}</span>
                                    </p>
                                    <p className="text-lg font-medium">
                                        <strong>Department:</strong> <span className="text-gray-600">{getDepName(employeeToView.depart)}</span>
                                    </p>
                                    <p className="text-lg font-medium">
                                        <strong>Vertical:</strong> <span className="text-gray-600">{getVerticalName(employeeToView.vertical)}</span>
                                    </p>
                                    <p className="text-lg font-medium">
                                        <strong>Role:</strong> <span className="text-gray-600">{employeeToView.des}</span>
                                    </p>
                                    <p className="text-lg font-medium">
                                        <strong>Email:</strong> <span className="text-gray-600">{employeeToView.email || 'N/A'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </ReactModal>

            {/* Edit Modal */}
            <ReactModal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Employee"
                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                ariaHideApp={false}
            >
                {employeeToEdit && (
                    <div className="relative">
                        <button
                            onClick={closeEditModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label="Close"
                        >
                            <FaTimes className="text-gray-500" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-center">Edit Employee</h2>
                        <div className="flex gap-4">
                            <div className="w-full">
                                <label className="block text-xs font-medium mb-1">Name:</label>
                                <input
                                    type="text"
                                    name="ename"
                                    value={editFields.ename || ''}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-xs font-medium mb-1">Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editFields.username || ''}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                                />
                            </div>
                        </div>

                        {/* Flexbox for Vertical and Department */}
                        <div className="flex gap-4 mt-4">
                            <div className="w-full">
                                <label className="block text-xs font-medium">Vertical:</label>
                                <select
                                    name="vertical"
                                    value={editFields.vertical || ''}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                                >
                                    <option value="ay">Ayurveda</option>
                                    <option value="sp">Sports</option>
                                    <option value="nt">Nutra</option>
                                    <option value="ph">Pharma</option>
                                    <option value="doc">Documentation</option>
                                    <option value="glp">G.L.P.</option>
                                    <option value="micro">Micro</option>
                                </select>
                            </div>

                            <div className="w-full">
                                <label className="block text-xs font-medium">Department:</label>
                                <select
                                    name="depart"
                                    value={editFields.depart || ''}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                                >
                                    <option value="frd">FRD</option>
                                    <option value="ard">ARD</option>
                                </select>
                            </div>
                        </div>

                        {/* Other fields remain as they are */}
                        <label className="block text-xs font-medium mt-4">Email:</label>
                        <input
                            type="text"
                            name="email"
                            value={editFields.email || ''}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                        />

                        {/* <label className="block text-xs font-medium mt-4">Password:</label>
                        <input
                            type="text"
                            name="password"
                            value={editFields.password || ''}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                        /> */}
                        <label className="block text-xs font-medium mt-4">Auth Role:</label>
                        <select
                            name="auth_role"
                            value={editFields.auth_role || ''}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                        >
                            <option value="1">Admin</option>
                            <option value="2">Editor</option>
                            <option value="3">Manager</option>
                            <option value="4">User</option>
                        </select>

                        <label className="block text-xs font-medium mt-4">Designation:</label>
                        <input
                            type="text"
                            name="des"
                            value={editFields.des || ''}
                            onChange={handleInputChange}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
                        />


                        <button
                            onClick={handleUpdate}
                            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all w-full"
                            disabled={updating}
                        >
                            {updating ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                )}
            </ReactModal>
        </div>
    );
};

export default Home;
