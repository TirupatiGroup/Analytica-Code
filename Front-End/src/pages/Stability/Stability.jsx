import React, { useEffect, useState } from 'react';
import AddProductModal from '../Stability/ViewPage/ProductComponents/AddProductModal';
import EditProductModal from '../Stability/ViewPage/ProductComponents/EditProductModal';
import { FaPills, FaHandHoldingHeart, FaBasketballBall, FaLeaf, FaFilter, FaPlus } from 'react-icons/fa';
import Sidebar from '../../components/HSidebar';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { IoEyeSharp } from 'react-icons/io5';
import { FaEdit, FaTrash } from 'react-icons/fa';
const Stability = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();

    const viewProduct = (id) => {
        navigate(`/stability/product/${id}`);
    };

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/api/stability');
                const sortedProducts = response.data.sort((a, b) => b.id - a.id); // Sort in descending order
                setProducts(sortedProducts);
                setFilteredProducts(sortedProducts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Open and close modals
    const openAddModal = () => setAddModalOpen(true);
    const closeAddModal = () => setAddModalOpen(false);
    const openEditModal = (product) => {
        setEditProduct(product);
        setEditModalOpen(true);
    };
    const closeEditModal = () => setEditModalOpen(false);

    // Handle adding a new product
    const handleAddProduct = async (data) => {
        try {
            // Temporary: Immediately add the new product to the table before waiting for server response
            const temporaryNewProduct = {
                ...data,
                id: Date.now(), // Use timestamp as a temporary ID (or you can use a UUID)
                reqdate: new Date().toISOString(), // Ensure ISO string format for reqdate
            };

            // Optimistically update the products list and filtered products
            setProducts((prevProducts) => {
                const updatedProducts = [temporaryNewProduct, ...prevProducts];
                setFilteredProducts(updatedProducts); // Update filtered products as well
                return updatedProducts;
            });

            // Now, call the API to add the product to the database
            const response = await api.post('/api/stability', data);

            // Once the server returns the data, update the product with the actual server response ID
            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product.id === temporaryNewProduct.id
                        ? { ...product, id: response.data.id } // Update with actual ID
                        : product
                )
            );

            setFilteredProducts((prevFilteredProducts) =>
                prevFilteredProducts.map((product) =>
                    product.id === temporaryNewProduct.id
                        ? { ...product, id: response.data.id } // Update with actual ID
                        : product
                )
            );

            // Close the modal after successful addition
            closeAddModal();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        }
    };


    // Handle editing a product
    const handleEditProduct = async (data) => {
        try {
            await api.put(`/api/stability/${data.id}`, data);
            const updatedProducts = products.map((product) =>
                product.id === data.id ? data : product
            );
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
            closeEditModal();
        } catch (error) {
            console.error('Error editing product:', error);
        }
    };

    // Handle deleting a product
    const handleDeleteProduct = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this product?');
        if (!confirmed) return;

        try {
            // Optimistically update the UI
            const updatedProducts = products.filter((product) => product.id !== id);
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);

            // Delete from the server
            await api.delete(`/api/stability/${id}`);
            alert(`Product with ID ${id} deleted successfully!`);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    // Handle filtering products by vertical
    const filterProducts = (vertical) => {
        setActiveFilter(vertical);
        if (vertical === 'All') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter((product) => product.vertical === vertical));
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow ml-60 py-4 px-2">
                {/* Filter Buttons */}
                <div className="flex justify-between items-center mb-4">
                    {/* Filter Buttons Group */}
                    <div className="flex gap-4">
                        {[
                            { label: 'All', icon: <FaFilter />, bgColor: 'bg-gray-200', textColor: 'text-gray-800' },
                            { label: 'Pharma', icon: <FaPills />, bgColor: 'bg-blue-500', textColor: 'text-white' },
                            { label: 'Nutra', icon: <FaHandHoldingHeart />, bgColor: 'bg-orange-500', textColor: 'text-white' },
                            { label: 'Sports', icon: <FaBasketballBall />, bgColor: 'bg-yellow-500', textColor: 'text-white' },
                            { label: 'Ayurveda', icon: <FaLeaf />, bgColor: 'bg-green-500', textColor: 'text-white' },
                        ].map(({ label, icon, bgColor, textColor }) => (
                            <button
                                key={label}
                                onClick={() => filterProducts(label)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md border-2 ${activeFilter === label
                                    ? `${bgColor} ${textColor} border-transparent`
                                    : `border-${bgColor.split('-')[1]}-500 text-${bgColor.split('-')[1]}-500 bg-transparent`
                                    }`}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Add Product Button */}
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-teal-custom text-white px-4 py-2 rounded-md"
                    >
                        <FaPlus /> {/* Add Icon */}
                        Add Product
                    </button>
                </div>

                {/* Add Product Modal */}
                <AddProductModal
                    isOpen={isAddModalOpen}
                    onClose={closeAddModal}
                    onSubmit={handleAddProduct}
                />

                {/* Edit Product Modal */}
                <EditProductModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={handleEditProduct}
                    product={editProduct}
                />

                {/* Product Table */}
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : (
                    <div className="overflow-x-auto mt-1">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-teal-custom text-white ">
                                    <th className="border px-4 py-2">ID</th>
                                    <th className="border px-4 py-2">Date</th>
                                    <th className="border px-4 py-2">Product Name</th>
                                    <th className="border px-4 py-2">Protocol</th>
                                    <th className="border px-4 py-2">Vertical</th>
                                    <th className="border px-4 py-2">Packing</th>
                                    <th className="border px-4 py-2">File</th>
                                    <th className="border px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-2">
                                            No products available
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="text-xs">
                                            <td className="border px-2 py-1">{product.id}</td>
                                            <td className="border px-2 py-1">{new Date(product.reqdate).toLocaleDateString('en-GB')}</td>
                                            <td className="border px-2 py-1">{product.pname}</td>
                                            <td className="border px-2 py-1">{product.protocol}</td>
                                            <td className="border px-2 py-1">{product.vertical}</td>
                                            <td className="border px-2 py-1">{product.ppacking}</td>
                                            <td className="border px-2 py-1">#</td>
                                            <td className="border px-2 py-1 flex gap-1">
                                                <button
                                                    className="text-teal-custom hover:text-teal-500 p-2 rounded-md"
                                                    onClick={() => viewProduct(product.id)}
                                                >
                                                    <IoEyeSharp className="w-5 h-6" /> {/* View Icon */}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="text-blue-500 hover:text-blue-400 p-2 rounded-md"
                                                >
                                                    <FaEdit className="w-5 h-5" /> {/* Edit Icon */}
                                                </button>
                                                {activeFilter === 'All' && (
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="text-red-500 hover:text-red-400 p-2 rounded-md"
                                                    >
                                                        <FaTrash className="w-5 h-5" /> {/* Delete Icon */}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stability;
