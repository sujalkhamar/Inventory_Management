import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, AlertCircle, FileDown, ChevronLeft, ChevronRight, History, Clock, QrCode, Upload, BarChart3 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { AuthContext } from '../context/AuthContext';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [productActivities, setProductActivities] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || '';

    const [formData, setFormData] = useState({
        name: '', stock: '', price: '', costPrice: '', category: '', supplier: '', lowStockThreshold: 10, imageUrl: '', location: ''
    });

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm, location.search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const filter = queryParams.get('filter') || '';
            const res = await axios.get(`/products?page=${currentPage}&limit=8&search=${searchTerm}&filter=${filter}`);
            setProducts(res.data.data);
            setPagination(res.data.pagination);
            setTotalPages(Math.ceil(res.data.total / 8));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProduct) {
                await axios.put(`/products/${currentProduct._id}`, formData);
            } else {
                await axios.post('/products', formData);
            }
            fetchProducts();
            closeModal();
            toast.success(currentProduct ? 'Product updated' : 'Product added');
        } catch (error) {
            console.error(error);
            toast.error("Error saving product");
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name, stock: product.stock, price: product.price, costPrice: product.costPrice || '',
                category: product.category, supplier: product.supplier, 
                lowStockThreshold: product.lowStockThreshold,
                imageUrl: product.imageUrl || '', location: product.location || ''
            });
        } else {
            setCurrentProduct(null);
            setFormData({ name: '', stock: '', price: '', costPrice: '', category: '', supplier: '', lowStockThreshold: 10, imageUrl: '', location: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentProduct(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`/products/${id}`);
                fetchProducts();
                toast.success('Product deleted');
            } catch (error) {
                console.error(error);
                toast.error("Error deleting product. Admin rights required.");
            }
        }
    };

    const handleTimelineClick = async (product) => {
        setCurrentProduct(product);
        setTimelineLoading(true);
        setShowTimeline(true);
        try {
            const res = await axios.get(`/activities/ref/${product._id}`);
            setProductActivities(res.data.data);
        } catch (error) {
            toast.error("Error fetching timeline");
        } finally {
            setTimelineLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Category', 'Stock', 'Price', 'Supplier'];
        const csvContent = [
            headers.join(','),
            ...products.map(p => `${p.name},${p.category},${p.stock},${p.price},${p.supplier}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toLocaleDateString()}.csv`;
        a.click();
        toast.success('Exporting CSV...');
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        try {
            const res = await axios.post('/products/import', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`Imported ${res.data.count} products!`);
            fetchProducts();
        } catch (err) {
            toast.error('Error importing CSV');
        }
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
                {user?.role === 'admin' && (
                    <div className="flex gap-2">
                        <label className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Import CSV
                            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                        </label>
                        <button 
                            onClick={handleExportCSV}
                            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FileDown className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <button 
                            onClick={() => openModal()}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            placeholder="Search products by name or category..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-3/4" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-1/4" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-1/4" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-1/4" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No products found</td></tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                    <img className="h-10 w-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700" src={product.imageUrl || 'https://via.placeholder.com/150'} alt="" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">{product.location || 'No Location'}</div>
                                                </div>
                                                {product.stock <= product.lowStockThreshold && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                        <AlertCircle className="w-3 h-3 mr-1" /> Low Stock
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`font-medium ${product.stock <= product.lowStockThreshold ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user?.role === 'admin' && (
                                                <>
                                                    <button onClick={() => navigate(`/products/${product._id}/analytics`)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 mr-4" title="View Analytics">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleTimelineClick(product)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-4" title="View Timeline">
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openModal(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                                        {currentProduct ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                                                <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                                                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost ($)</label>
                                                <input type="number" name="costPrice" required min="0" step="0.01" value={formData.costPrice} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                            <input type="text" name="category" required value={formData.category} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                                            <input type="text" name="supplier" required value={formData.supplier} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Aisle 4" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                                                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                                        Save
                                    </button>
                                    <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Modal */}
            {showTimeline && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <History className="w-5 h-5 mr-2 text-indigo-500" />
                                Product Info & Timeline
                            </h2>
                            <button onClick={() => setShowTimeline(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex-shrink-0 bg-white p-2 rounded-lg border border-gray-100">
                                <QRCodeCanvas value={currentProduct?._id || ''} size={100} />
                                <p className="text-[10px] text-center text-gray-400 mt-1 font-mono uppercase">{currentProduct?._id.slice(-6)}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{currentProduct?.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{currentProduct?.category} • {currentProduct?.location}</p>
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">Stock: {currentProduct?.stock}</p>
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Activity Log</h4>
                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                            {timelineLoading ? (
                                <p className="text-center py-4">Loading timeline...</p>
                            ) : productActivities.length === 0 ? (
                                <p className="text-center py-4 text-gray-500">No history found for this product.</p>
                            ) : (
                                productActivities.map((act, i) => (
                                    <div key={act._id} className="relative pl-6 pb-4 border-l-2 border-gray-100 dark:border-gray-700 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{act.action}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {act.user?.name} • {new Date(act.createdAt).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 italic">{act.details}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowTimeline(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
