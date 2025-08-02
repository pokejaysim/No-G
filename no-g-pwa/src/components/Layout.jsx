import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: '📷', label: 'Scan' },
    { path: '/history', icon: '📋', label: 'History' },
    { path: '/favorites', icon: '⭐', label: 'Favorites' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 safe-area-inset">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">No G</h1>
            <p className="text-sm text-gray-500">Gluten & Allergen Checker</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 px-4 py-6 safe-area-inset">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-500 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;