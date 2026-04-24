import React, { useState, useContext } from 'react';
import axios from 'axios';
import { User, Lock, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);
    
    const [details, setDetails] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleDetailsChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>

            {message.text && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

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
