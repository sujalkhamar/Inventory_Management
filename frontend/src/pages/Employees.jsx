import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, Edit2, Shield, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchEmployees();
        }
    }, [user]);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/users');
            setEmployees(res.data.data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.put(`/users/${id}/role`, { role: newRole });
            fetchEmployees();
        } catch (error) {
            console.error("Error updating role", error);
            alert("Failed to update role");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to completely remove this employee account?")) {
            try {
                await axios.delete(`/users/${id}`);
                fetchEmployees();
            } catch (error) {
                console.error("Error deleting user", error);
                alert("Failed to delete user");
            }
        }
    };

    if (user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-500" />
                Employee Management
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td></tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {emp.name} {emp._id === user._id && <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full">You</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {emp._id === user._id ? (
                                                <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
                                                    <Shield className="w-4 h-4 mr-1 text-indigo-500" /> Admin
                                                </span>
                                            ) : (
                                                <select
                                                    value={emp.role}
                                                    onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                                                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="staff">Staff</option>
                                                    <option value="worker">Worker</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(emp.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {emp._id !== user._id && (
                                                <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;
