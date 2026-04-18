import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GraduationCap, LogOut, Menu, X, Sun, Moon, LayoutDashboard, Users, Layers, BookOpen, ClipboardList, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';


const BRAND_COLOR = '#427A43';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode: D, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { icon: LayoutDashboard, path: '/admin-panel', label: 'Dashboard' },
    { icon: Users, path: '/student', label: "O'quvchilar" },
    { icon: Users, path: '/teachers', label: "O'qituvchilar" },
    { icon: Layers, path: '/groups', label: 'Guruhlar' },
    { icon: BookOpen, path: '/courses', label: 'Kurslar' },
    { icon: ClipboardList, path: '/attendance', label: 'Davomat' },
    { icon: CreditCard, path: '/payments', label: "To'lovlar" },
    { icon: SettingsIcon, path: '/settings', label: 'Sozlamalar' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Desktop Navbar - hidden on mobile */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-panel')}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ color: D ? BRAND_COLOR : BRAND_COLOR }}>
                  CodingClub
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {D ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              </button>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                  {(user?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Administrator'}</p>
                </div>
              </div>

          
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                title="Chiqish"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Only visible on mobile/tablet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <style>{`
          .mobile-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px 4px;
            min-width: 0;
            transition: all 0.2s ease;
          }
          .mobile-nav-item:active {
            transform: scale(0.95);
          }
          .mobile-nav-item.active {
            background: rgba(66, 122, 67, 0.08);
          }
          .mobile-nav-icon {
            width: 24px;
            height: 24px;
            margin-bottom: 2px;
          }
          .mobile-nav-label {
            font-size: 9px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}</style>
        <div className="flex justify-around items-center px-2 py-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <button
                key={index}
                onClick={() => navigate(link.path)}
                className={`mobile-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className={`mobile-nav-icon ${active ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`mobile-nav-label ${active ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                  {link.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}