import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({ name: '', location: '', manager: '', capacity: '' });

    useEffect(() => { fetchWarehouses(); }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/warehouses');
            setWarehouses(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentWarehouse) {
                await axios.put(`/warehouses/${currentWarehouse._id}`, formData);
            } else {
                await axios.post('/warehouses', formData);
            }
            fetchWarehouses();
            closeModal();
            toast.success(currentWarehouse ? 'Warehouse updated' : 'Warehouse created');
        } catch (err) { toast.error('Error saving warehouse'); }
    };

    const openModal = (wh = null) => {
        if (wh) {
            setCurrentWarehouse(wh);
            setFormData({ name: wh.name, location: wh.location, manager: wh.manager || '', capacity: wh.capacity || '' });
        } else {
            setCurrentWarehouse(null);
            setFormData({ name: '', location: '', manager: '', capacity: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setCurrentWarehouse(null); };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this warehouse?')) {
            await axios.delete(`/warehouses/${id}`);
            fetchWarehouses();
            toast.success('Warehouse deleted');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouses</h1>
                {user?.role === 'admin' && (
                    <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4 mr-2" /> Add Warehouse
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-40" />) : warehouses.length === 0 ? (
                    <p className="col-span-full text-center py-10 text-gray-500">No warehouses found. Add your first one!</p>
                ) : warehouses.map(wh => (
                    <div key={wh._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group relative">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-3">
                                    <WarehouseIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{wh.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" />{wh.location}</p>
                                </div>
                            </div>
                            {user?.role === 'admin' && (
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(wh)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(wh._id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>Manager: <span className="font-medium">{wh.manager || 'Unassigned'}</span></p>
                            <p>Capacity: <span className="font-medium">{wh.capacity ? `${wh.capacity} units` : 'Unlimited'}</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{currentWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Warehouse Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">City / Location</label>
                                <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Manager</label>
                                    <input type="text" name="manager" value={formData.manager} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Capacity</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Warehouses;
