import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Skeleton from '../components/Skeleton';
import { fetchProductInsights } from '../api/intelligence';
import { fetchMovements } from '../api/analytics';

const ProductAnalytics = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSold: 0, totalRevenue: 0, totalProfit: 0, avgPerDay: 0 });
    const [intel, setIntel] = useState(null);
    const [movements, setMovements] = useState([]);
    const [movementsLoading, setMovementsLoading] = useState(true);

    useEffect(() => {
        fetchProductData();
    }, [id]);

    useEffect(() => {
        const loadMovements = async () => {
            setMovementsLoading(true);
            try {
                const res = await fetchMovements({ productId: id, page: 1, limit: 25 });
                setMovements(res.data || []);
            } catch (err) {
                console.error(err);
                setMovements([]);
            } finally {
                setMovementsLoading(false);
            }
        };

        loadMovements();
    }, [id]);

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const [productRes, salesRes, intelRes] = await Promise.all([
                axios.get(`/products/${id}`),
                axios.get('/sales'),
                fetchProductInsights(id, 30).catch(() => null)
            ]);

            const prod = productRes.data.data;
            setProduct(prod);
            setIntel(intelRes || null);

            // Filter sales for this product and compute analytics
            const productSales = salesRes.data.data.filter(s => s.product?._id === id);

            // Build daily sales map (last 30 days)
            const dailyMap = {};
            const now = new Date();
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                dailyMap[key] = { date: key, quantity: 0, revenue: 0, profit: 0 };
            }

            let totalSold = 0;
            let totalRevenue = 0;
            let totalProfit = 0;

            productSales.forEach(sale => {
                const key = new Date(sale.date).toISOString().split('T')[0];
                if (dailyMap[key]) {
                    dailyMap[key].quantity += sale.quantity;
                    dailyMap[key].revenue += sale.totalPrice;
                    dailyMap[key].profit += sale.profit || 0;
                }
                totalSold += sale.quantity;
                totalRevenue += sale.totalPrice;
                totalProfit += sale.profit || 0;
            });

            const chartData = Object.values(dailyMap);
            setSalesData(chartData);

            const daysWithSales = chartData.filter(d => d.quantity > 0).length || 1;
            setStats({
                totalSold,
                totalRevenue,
                totalProfit,
                avgPerDay: (totalSold / 30).toFixed(1),
                daysUntilOut: totalSold > 0 ? Math.floor(prod.stock / (totalSold / 30)) : '∞'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
            <Skeleton className="h-72" />
        </div>
    );

    if (!product) return <p className="text-center py-10 text-gray-500">Product not found.</p>;

    const movementBadge = (reason) => {
        const map = {
            sale: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40',
            purchase_order_received: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40',
            manual_adjustment: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40',
            import: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40'
        };
        return map[reason] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-100 dark:border-gray-700';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link to="/inventory" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.category} • {product.supplier}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{product.stock}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sold</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.totalSold}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Profit</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">${stats.totalProfit.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days Until Out</p>
                    <p className={`text-2xl font-bold mt-1 ${stats.daysUntilOut <= 7 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{stats.daysUntilOut} days</p>
                </div>
            </div>

            {intel && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Predictive Insights (Beta)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alert Level</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{intel.alert?.level || 'healthy'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{intel.alert?.message}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Daily Demand</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{intel.forecast?.averageDailyDemand ?? 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lookback: {intel.forecast?.lookbackDays} days</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recommended Reorder</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{intel.restock?.recommendedQuantity ?? 0}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Incoming: {intel.restock?.incomingStock ?? 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Movements */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Movements</h3>
                {movementsLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                ) : movements.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No movement history yet for this product.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                    <th className="py-2 pr-4">When</th>
                                    <th className="py-2 pr-4">Reason</th>
                                    <th className="py-2 pr-4">Delta</th>
                                    <th className="py-2 pr-4">Warehouse</th>
                                    <th className="py-2 pr-4">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {movements.map((m) => (
                                    <tr key={m._id} className="text-sm text-gray-900 dark:text-gray-100">
                                        <td className="py-2 pr-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {new Date(m.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-2 pr-4 whitespace-nowrap">
                                            <span className={`text-[11px] px-2 py-1 rounded-md ${movementBadge(m.reason)}`}>
                                                {m.reason}
                                            </span>
                                        </td>
                                        <td className={`py-2 pr-4 font-semibold whitespace-nowrap ${m.quantityDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
                                            {m.quantityDelta}
                                        </td>
                                        <td className="py-2 pr-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {m.warehouse?.name || '-'}
                                        </td>
                                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">
                                            {m.note || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Sales Volume Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Volume (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                        <Bar dataKey="quantity" fill="#4f46e5" radius={[4,4,0,0]} name="Units Sold" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue & Profit Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue vs Profit (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={false} name="Revenue" />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} name="Profit" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Product Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Selling Price:</span> <span className="font-semibold text-gray-900 dark:text-white ml-1">${product.price}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Cost Price:</span> <span className="font-semibold text-gray-900 dark:text-white ml-1">${product.costPrice}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Margin:</span> <span className="font-semibold text-green-600 ml-1">{((product.price - product.costPrice) / product.price * 100).toFixed(1)}%</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Avg/Day:</span> <span className="font-semibold text-gray-900 dark:text-white ml-1">{stats.avgPerDay} units</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Location:</span> <span className="font-semibold text-gray-900 dark:text-white ml-1">{product.location}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Low Stock Alert:</span> <span className="font-semibold text-gray-900 dark:text-white ml-1">{product.lowStockThreshold} units</span></div>
                </div>
            </div>
        </div>
    );
};

export default ProductAnalytics;
