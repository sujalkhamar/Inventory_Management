import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from '../components/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, Activity as ActivityIcon, Clock, CreditCard, Sparkles, Package, TrendingUp } from 'lucide-react';
import { fetchIntelligenceOverview } from '../api/intelligence';
import { fetchSupplierLeadTimes, fetchProductAnomalies } from '../api/analytics';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [intelligence, setIntelligence] = useState(null);
    const [leadTimes, setLeadTimes] = useState(null);
    const [anomalies, setAnomalies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [intelLoading, setIntelLoading] = useState(true);
    const [leadLoading, setLeadLoading] = useState(true);
    const [anomalyLoading, setAnomalyLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/sales/analytics');
                setAnalytics(res.data.data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    useEffect(() => {
        const fetchIntel = async () => {
            try {
                const data = await fetchIntelligenceOverview(30);
                setIntelligence(data);
            } catch (error) {
                console.error('Error fetching intelligence', error);
            } finally {
                setIntelLoading(false);
            }
        };

        fetchIntel();
    }, []);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const data = await fetchSupplierLeadTimes(180);
                setLeadTimes(data);
            } catch (error) {
                console.error('Error fetching supplier lead times', error);
            } finally {
                setLeadLoading(false);
            }
        };

        fetchLeads();
    }, []);

    useEffect(() => {
        const fetchAnoms = async () => {
            try {
                let spikeFactor = 2.5;
                try {
                    const prefs = JSON.parse(localStorage.getItem('profile_prefs') || '{}');
                    if (typeof prefs.spikeFactor === 'number' && Number.isFinite(prefs.spikeFactor) && prefs.spikeFactor >= 1) {
                        spikeFactor = prefs.spikeFactor;
                    }
                } catch {
                    // ignore
                }

                const data = await fetchProductAnomalies({ spikeDays: 7, baselineDays: 28, spikeFactor, adjustAbs: 50 });
                setAnomalies(data);
            } catch (error) {
                console.error('Error fetching anomalies', error);
            } finally {
                setAnomalyLoading(false);
            }
        };

        fetchAnoms();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96" />
                    <Skeleton className="h-96" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }
    if (!analytics) return <div className="text-gray-900 dark:text-white">Failed to load analytics data.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/sales" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">${analytics.totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </Link>
                
                <Link to="/sales" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.totalSales}</p>
                        </div>
                    </div>
                </Link>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">${analytics.totalProfit.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <Link to="/inventory?filter=lowstock" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.lowStockCount}</p>
                        </div>
                    </div>
                </Link>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Product</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {analytics.topProducts.length > 0 ? analytics.topProducts[0].name : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.revenueOverTime}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area type="monotone" dataKey="dailyRevenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                <Area type="monotone" dataKey="dailyProfit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <ActivityIcon className="w-5 h-5 mr-2 text-indigo-500" />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {analytics.recentActivities.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No activity logged yet.</p>
                        ) : (
                            analytics.recentActivities.map((act) => (
                                <div key={act._id} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg mr-3">
                                        <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {act.action}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {act.user?.name} • {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 italic">
                                            {act.details}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Top Products Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Products</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.topProducts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="totalSold" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Predictive Intelligence */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                    Predictive Inventory Insights (Beta)
                </h2>

                {intelLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
                    </div>
                ) : !intelligence ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Couldn’t load intelligence insights.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/inventory?filter=lowstock" className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow bg-gray-50 dark:bg-gray-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Critical Alerts</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{intelligence.summary.criticalAlerts}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>

                            <Link to="/inventory" className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow bg-gray-50 dark:bg-gray-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Watch + Warning</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {intelligence.summary.watchAlerts + intelligence.summary.warningAlerts}
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>

                            <Link to="/purchase-orders" className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow bg-gray-50 dark:bg-gray-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reorder Candidates</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{intelligence.summary.reorderCandidates}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                        <Package className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="mt-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Reorder Suggestions</h3>
                                <Link to="/inventory" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View inventory</Link>
                            </div>
                            {intelligence.reorderRecommendations.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No reorder recommendations right now.</p>
                            ) : (
                                <div className="space-y-2">
                                    {intelligence.reorderRecommendations.slice(0, 5).map((rec) => (
                                        <div key={rec.productId} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{rec.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Stock: {rec.stock} • Incoming: {rec.restock.incomingStock} • Avg/day: {rec.forecast.averageDailyDemand}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                                                    Reorder {rec.restock.recommendedQuantity}
                                                </span>
                                                {rec.alert.level !== 'healthy' && (
                                                    <span className="text-[11px] px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40">
                                                        {rec.alert.level}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Supplier Lead Times */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                    Supplier Lead Times (Received POs)
                </h2>

                {leadLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                ) : !leadTimes ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Couldn’t load supplier lead times yet.</p>
                ) : leadTimes.suppliers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No received purchase orders found in the last {leadTimes.daysBack} days.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                    <th className="py-2 pr-4">Supplier</th>
                                    <th className="py-2 pr-4">POs</th>
                                    <th className="py-2 pr-4">Avg Days</th>
                                    <th className="py-2 pr-4">Min Days</th>
                                    <th className="py-2 pr-4">Max Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {leadTimes.suppliers.slice(0, 8).map((s) => (
                                    <tr key={s.supplierId} className="text-sm text-gray-900 dark:text-gray-100">
                                        <td className="py-2 pr-4 whitespace-nowrap">
                                            {s.supplierName || 'Unknown Supplier'}
                                        </td>
                                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{s.count}</td>
                                        <td className="py-2 pr-4 font-semibold">{s.avgLeadTimeDays}</td>
                                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{s.minLeadTimeDays}</td>
                                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{s.maxLeadTimeDays}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {leadTimes.suppliers.length > 8 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                Showing top 8 suppliers by fastest average lead time.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Anomalies */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                    Demand & Stock Anomalies
                </h2>

                {anomalyLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                ) : !anomalies ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Couldn’t load anomaly signals.</p>
                ) : anomalies.count === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No anomalies detected in the last {anomalies.spikeDays} days.</p>
                ) : (
                    <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Spike window: {anomalies.spikeDays}d • Baseline: {anomalies.baselineDays}d • Spike factor: {anomalies.spikeFactor}
                        </p>
                        <div className="space-y-2">
                            {anomalies.anomalies.slice(0, 6).map((a) => (
                                <div key={a.productId} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Stock: {a.stock} • Spike/day: {a.demand.spikePerDay} • Baseline/day: {a.demand.baselinePerDay}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {a.flags.stockout && (
                                            <span className="text-[11px] px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/40">
                                                stockout
                                            </span>
                                        )}
                                        {a.flags.lowStock && (
                                            <span className="text-[11px] px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40">
                                                low stock
                                            </span>
                                        )}
                                        {a.flags.demandSpike && (
                                            <span className="text-[11px] px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                                                spike x{a.demand.spikeFactor ?? '-'}
                                            </span>
                                        )}
                                        {a.flags.largeManualAdjustments && (
                                            <span className="text-[11px] px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                                adjustments
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {anomalies.count > 6 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                Showing 6 of {anomalies.count}.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
