import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Received: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

const statusIcons = {
    Pending: <Clock className="w-4 h-4" />,
    Shipped: <Truck className="w-4 h-4" />,
    Received: <CheckCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />
};

const PurchaseOrders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        supplier: '', warehouse: '', items: [{ product: '', quantity: 1, costPrice: 0 }]
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, productsRes, suppliersRes, warehousesRes] = await Promise.all([
                axios.get('/purchase-orders'),
                axios.get('/products?limit=999'),
                axios.get('/suppliers'),
                axios.get('/warehouses')
            ]);
            setOrders(ordersRes.data.data);
            setProducts(productsRes.data.data);
            setSuppliers(suppliersRes.data.data);
            setWarehouses(warehousesRes.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/purchase-orders', formData);
            fetchData();
            setShowModal(false);
            setFormData({ supplier: '', warehouse: '', items: [{ product: '', quantity: 1, costPrice: 0 }] });
            toast.success('Purchase Order created!');
        } catch (err) { toast.error('Error creating PO'); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/purchase-orders/${id}/status`, { status });
            fetchData();
            toast.success(`Order marked as ${status}`);
        } catch (err) { toast.error('Error updating status'); }
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { product: '', quantity: 1, costPrice: 0 }] });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
                {user?.role === 'admin' && (
                    <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4 mr-2" /> New Order
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                ) : orders.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">No purchase orders yet.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Cost</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                {user?.role === 'admin' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">{order.orderId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.supplier?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{order.items?.length} items</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${order.totalCost?.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium gap-1 ${statusColors[order.status]}`}>
                                            {statusIcons[order.status]} {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 text-right text-sm space-x-2">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => updateStatus(order._id, 'Shipped')} className="text-blue-600 hover:underline text-xs">Mark Shipped</button>
                                                    <button onClick={() => updateStatus(order._id, 'Cancelled')} className="text-red-600 hover:underline text-xs">Cancel</button>
                                                </>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <button onClick={() => updateStatus(order._id, 'Received')} className="text-green-600 hover:underline text-xs font-semibold">Mark Received</button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Create Purchase Order</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Supplier</label>
                                    <select name="supplier" required value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Destination Warehouse</label>
                                    <select name="warehouse" value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} — {w.location}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold dark:text-gray-300">Order Items</label>
                                    <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:underline">+ Add Item</button>
                                </div>
                                {formData.items.map((item, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                                        <div className="col-span-5">
                                            <select value={item.product} onChange={(e) => updateItem(i, 'product', e.target.value)} required className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                <option value="">Product</option>
                                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} placeholder="Qty" className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="col-span-3">
                                            <input type="number" min="0" step="0.01" value={item.costPrice} onChange={(e) => updateItem(i, 'costPrice', parseFloat(e.target.value))} placeholder="Cost" className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="col-span-1">
                                            <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-500 hover:text-red-700 text-sm">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
