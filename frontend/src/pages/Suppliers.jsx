import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Phone, Mail, User, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '', contactPerson: '', email: '', phone: '', address: '', category: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/suppliers');
            setSuppliers(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentSupplier) {
                await axios.put(`/suppliers/${currentSupplier._id}`, formData);
            } else {
                await axios.post('/suppliers', formData);
            }
            fetchSuppliers();
            closeModal();
            toast.success(currentSupplier ? 'Supplier updated' : 'Supplier added');
        } catch (error) {
            console.error(error);
            toast.error("Error saving supplier");
        }
    };

    const openModal = (supplier = null) => {
        if (supplier) {
            setCurrentSupplier(supplier);
            setFormData({
                name: supplier.name, contactPerson: supplier.contactPerson || '', 
                email: supplier.email || '', phone: supplier.phone || '', 
                address: supplier.address || '', category: supplier.category || ''
            });
        } else {
            setCurrentSupplier(null);
            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', category: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentSupplier(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This cannot be undone.")) {
            try {
                await axios.delete(`/suppliers/${id}`);
                fetchSuppliers();
                toast.success('Supplier removed');
            } catch (error) {
                toast.error("Error deleting supplier");
            }
        }
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
                {user?.role === 'admin' && (
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            className="pl-10 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)
                    ) : filteredSuppliers.length === 0 ? (
                        <p className="col-span-full text-center py-10 text-gray-500">No suppliers found.</p>
                    ) : (
                        filteredSuppliers.map(s => (
                            <div key={s._id} className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-100 dark:border-gray-600 relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{s.name}</h3>
                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{s.category || 'General'}</span>
                                    </div>
                                    {user?.role === 'admin' && (
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(s)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(s._id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-400" /> {s.contactPerson || 'N/A'}</div>
                                    <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" /> {s.email || 'N/A'}</div>
                                    <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> {s.phone || 'N/A'}</div>
                                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {s.address || 'N/A'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            {currentSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contact Person</label>
                                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Electronics" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                                <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
