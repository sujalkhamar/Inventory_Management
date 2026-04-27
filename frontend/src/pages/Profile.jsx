import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { User, Lock, Save, BadgeCheck, Activity, RefreshCw, Sparkles, AlertTriangle, ClipboardList } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Profile = () => {
    const { user } = useContext(AuthContext);
    
    const [details, setDetails] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [summary, setSummary] = useState(null);
    const [activities, setActivities] = useState([]);
    const [trend, setTrend] = useState([]);
    const [rangeDays, setRangeDays] = useState(parseInt(localStorage.getItem('profile_range_days') || '30', 10));
    const [prefs, setPrefs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('profile_prefs') || '{}');
        } catch {
            return {};
        }
    });
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState({ reorder: [], anomalies: [] });

    const handleDetailsChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [summaryRes, activitiesRes, trendRes, intelRes, anomRes] = await Promise.all([
                    axios.get(`/analytics/users/me/summary?days=${rangeDays}`),
                    axios.get('/activities/me?limit=15'),
                    axios.get(`/analytics/users/me/activity-trend?days=${rangeDays}`),
                    axios.get('/intelligence/overview?days=30').catch(() => ({ data: { data: null } })),
                    axios.get('/analytics/products/anomalies?spikeDays=7&baselineDays=28&spikeFactor=2.5&adjustAbs=50').catch(() => ({ data: { data: null } }))
                ]);
                setSummary(summaryRes.data.data);
                setActivities(activitiesRes.data.data || []);
                setTrend(trendRes.data.data?.trend || []);

                const intel = intelRes.data?.data;
                const anomalies = anomRes.data?.data;
                setActions({
                    reorder: (intel?.reorderRecommendations || []).slice(0, 5),
                    anomalies: (anomalies?.anomalies || []).slice(0, 5)
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [rangeDays]);

    const refresh = async () => {
        setLoading(true);
        try {
            const [summaryRes, activitiesRes, trendRes, intelRes, anomRes] = await Promise.all([
                axios.get(`/analytics/users/me/summary?days=${rangeDays}`),
                axios.get('/activities/me?limit=15'),
                axios.get(`/analytics/users/me/activity-trend?days=${rangeDays}`),
                axios.get('/intelligence/overview?days=30').catch(() => ({ data: { data: null } })),
                axios.get('/analytics/products/anomalies?spikeDays=7&baselineDays=28&spikeFactor=2.5&adjustAbs=50').catch(() => ({ data: { data: null } }))
            ]);
            setSummary(summaryRes.data.data);
            setActivities(activitiesRes.data.data || []);
            setTrend(trendRes.data.data?.trend || []);
            const intel = intelRes.data?.data;
            const anomalies = anomRes.data?.data;
            setActions({
                reorder: (intel?.reorderRecommendations || []).slice(0, 5),
                anomalies: (anomalies?.anomalies || []).slice(0, 5)
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('profile_range_days', String(rangeDays));
    }, [rangeDays]);

    useEffect(() => {
        localStorage.setItem('profile_prefs', JSON.stringify(prefs));
    }, [prefs]);

    const updateDetails = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/auth/updatedetails', details);
            setMessage({ type: 'success', text: 'Profile details updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error updating profile' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/auth/updatepassword', passwords);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswords({ currentPassword: '', newPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error updating password' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile, security, and view your activity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={rangeDays}
                        onChange={(e) => setRangeDays(parseInt(e.target.value, 10))}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
                        title="Time range"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <button
                        type="button"
                        onClick={refresh}
                        className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <BadgeCheck className="w-5 h-5 mr-2 text-emerald-500" />
                        Account Overview
                    </h2>
                    <span className="text-xs px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 capitalize">
                        {user?.role || 'user'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        {user?.lastLoginAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Last login: {new Date(user.lastLoginAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales Recorded</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary?.sales?.count ?? 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Units: {summary?.sales?.unitsSold ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchase Orders Created</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary?.purchaseOrders?.count ?? 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Movements: {summary?.movements?.count ?? 0}</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                    {Object.entries(summary?.purchaseOrders?.byStatus || {}).length === 0 ? (
                        <div className="sm:col-span-4 text-xs text-gray-500 dark:text-gray-400">No purchase orders in this range.</div>
                    ) : (
                        Object.entries(summary.purchaseOrders.byStatus).map(([status, count]) => (
                            <div key={status} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white/60 dark:bg-gray-900/10">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{status}</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Activity Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                    Activity Trend (Last {rangeDays} Days)
                </h2>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                            <Area type="monotone" dataKey="count" stroke="#4f46e5" fillOpacity={0.25} fill="#4f46e5" name="Actions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-emerald-500" />
                    Actions To Take
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Top Reorder Suggestions</p>
                            <ClipboardList className="w-4 h-4 text-gray-400" />
                        </div>
                        {actions.reorder.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No reorder recommendations right now.</p>
                        ) : (
                            <div className="space-y-2">
                                {actions.reorder.map((r) => (
                                    <div key={r.productId} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-900 dark:text-white truncate">{r.name}</span>
                                        <span className="ml-3 text-xs px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 whitespace-nowrap">
                                            Reorder {r.restock?.recommendedQuantity ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Anomalies To Review</p>
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </div>
                        {actions.anomalies.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No anomalies detected.</p>
                        ) : (
                            <div className="space-y-2">
                                {actions.anomalies.map((a) => (
                                    <div key={a.productId} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-900 dark:text-white truncate">{a.name}</span>
                                        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            Stock {a.stock}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Dashboard Range</label>
                        <select
                            value={prefs.dashboardRangeDays || 30}
                            onChange={(e) => setPrefs({ ...prefs, dashboardRangeDays: parseInt(e.target.value, 10) })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white"
                        >
                            <option value={7}>7 days</option>
                            <option value={30}>30 days</option>
                            <option value={90}>90 days</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alert Sensitivity (Spike Factor)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={prefs.spikeFactor || 2.5}
                            onChange={(e) => setPrefs({ ...prefs, spikeFactor: parseFloat(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Preferences are saved locally on this device.
                </p>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                    Your Recent Activity
                </h2>
                {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading activity…</p>
                ) : activities.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
                ) : (
                    <div className="space-y-3">
                        {activities.map((act) => (
                            <div key={act._id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{act.action}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{act.details}</p>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {new Date(act.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-indigo-500" />
                        Update Profile
                    </h2>
                    <form onSubmit={updateDetails} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" name="name" required value={details.name} onChange={handleDetailsChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" name="email" required value={details.email} onChange={handleDetailsChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Save className="w-4 h-4 mr-2" /> Save Profile
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-indigo-500" />
                        Change Password
                    </h2>
                    <form onSubmit={updatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                            <input type="password" name="currentPassword" required value={passwords.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <input type="password" name="newPassword" required minLength="6" value={passwords.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Save className="w-4 h-4 mr-2" /> Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
