import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => {
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
