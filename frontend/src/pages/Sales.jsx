import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ShoppingCart, FileDown, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        product: '',
        quantity: 1
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, productsRes] = await Promise.all([
                axios.get('/sales'),
                axios.get('/products')
            ]);
            setSales(salesRes.data.data);
            setProducts(productsRes.data.data);
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
            await axios.post('/sales', formData);
            toast.success('Sale recorded successfully!');
            setFormData({ product: '', quantity: 1 });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Error recording sale");
        }
    };

        }
    };

    const downloadInvoice = (sale) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('INVENTORY SYSTEM', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Sales Invoice', 105, 22, { align: 'center' });
        
        // Info
        doc.setFontSize(12);
        doc.text(`Invoice ID: ${sale._id}`, 20, 40);
        doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, 20, 47);
        doc.text(`Customer: Cash Customer`, 20, 54);

        // Table
        const tableColumn = ["Product", "Quantity", "Unit Price", "Total"];
        const tableRows = [
            [
                sale.product?.name || 'Product',
                sale.quantity,
                `$${(sale.totalPrice / sale.quantity).toFixed(2)}`,
                `$${sale.totalPrice.toFixed(2)}`
            ]
        ];

        doc.autoTable({
            startY: 65,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });

        // Footer
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text(`Total Amount: $${sale.totalPrice.toFixed(2)}`, 140, finalY);
        
        doc.setFontSize(10);
        doc.text('Thank you for your business!', 105, finalY + 30, { align: 'center' });

        doc.save(`invoice_${sale._id}.pdf`);
        toast.success('Invoice downloaded');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales & Transactions</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Record Sale Form */}
                {user?.role !== 'staff' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-1 h-fit">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-indigo-500" />
                            Record New Sale
                        </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Product</label>
                            <select 
                                name="product" 
                                required
                                value={formData.product}
                                onChange={handleInputChange}
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">-- Select --</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id} disabled={p.stock === 0}>
                                        {p.name} (Stock: {p.stock}) - ${p.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                required 
                                min="1" 
                                value={formData.quantity} 
                                onChange={handleInputChange} 
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Record Sale
                        </button>
                    </form>
                </div>
                )}

                {/* Sales History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Price</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sold By</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td></tr>
                                ) : sales.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No sales recorded yet</td></tr>
                                ) : (
                                    sales.map(sale => (
                                        <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {sale.product?.name || 'Deleted Product'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {sale.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                                ${sale.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {sale.soldBy?.name || 'Unknown'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
