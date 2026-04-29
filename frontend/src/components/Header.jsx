import React, { useContext, useState, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const [lowStockCount, setLowStockCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await axios.get('/products?filter=lowstock&limit=1');
        setLowStockCount(res.data.total || 0);
      } catch (err) {
        console.error("Error fetching low stock", err);
      }
    };
    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                className={`p-2 rounded-lg transition-colors ${showNotifications ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">Notifications</span>
                <Bell className="w-5 h-5" />
                {lowStockCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Alerts</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {lowStockCount > 0 ? (
                      <Link 
                        to="/inventory?filter=lowstock" 
                        className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-3">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Low Stock Warning</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{lowStockCount} items are below threshold.</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">All stock levels are healthy.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setDarkMode(!darkMode)}
            >
              <span className="sr-only">Toggle dark mode</span>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
