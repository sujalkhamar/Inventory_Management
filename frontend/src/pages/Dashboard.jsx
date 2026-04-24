import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from '../components/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp, Activity as ActivityIcon, Clock, CreditCard } from 'lucide-react';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

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
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area type="monotone" dataKey="dailyRevenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
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
        </div>
    );
};

export default Dashboard;
