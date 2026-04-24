import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, X, User, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout, user } = useContext(AuthContext);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`fixed flex flex-col z-50 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-72 lg:sidebar-expanded:!w-72 2xl:!w-72 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
        
        {/* Sidebar header */}
        <div className="flex justify-between items-center pr-3 sm:px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">InventFlow</span>
          </div>
          {/* Close button */}
          <button className="lg:hidden text-gray-500 hover:text-gray-400" onClick={() => setSidebarOpen(false)}>
            <span className="sr-only">Close sidebar</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links */}
        <div className="space-y-8 flex-1 mt-6">
          <div className="px-4">
            <ul className="space-y-1">
              <li>
                <NavLink to="/" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <span className="font-medium">Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/inventory" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  <Package className="w-5 h-5 mr-3" />
                  <span className="font-medium">Inventory</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/sales" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  <span className="font-medium">Sales</span>
                </NavLink>
              </li>
              {user?.role === 'admin' && (
                <li>
                  <NavLink to="/employees" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                    <Users className="w-5 h-5 mr-3" />
                    <span className="font-medium">Employees</span>
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/profile" className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  <User className="w-5 h-5 mr-3" />
                  <span className="font-medium">Profile</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* User / Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold mr-3">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role}</p>
                </div>
            </div>
            <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 mr-3" />
                Logout
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
