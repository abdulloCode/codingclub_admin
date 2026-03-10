import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import img from '../assets/image.png';
import {
  Home,
  Users,
  Layers,
  GraduationCap,
  Settings as SettingsIcon,
  FileText,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  RefreshCw,
  UserCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, isRefreshing, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Bosh sahifa', path: '/profile', icon: Home },
    { name: "O'qituvchilar", path: '/teachers', icon: Users },
    { name: "O'quvchilar", path: '/students', icon: GraduationCap },
    { name: 'Guruhlar', path: '/groups', icon: Layers },
    { name: 'Kurslar', path: '/courses', icon: BookOpen },
    { name: 'Hisobotlar', path: '/reports', icon: FileText },
    { name: 'Sozlamalar', path: '/settings', icon: SettingsIcon },
  ];

  const activeMenu = menuItems.find(item => item.path === location.pathname);

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
    
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
           <img src={img} alt="" className='w-[40px] h-[40px]'/>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Codingclub</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Boshqaruv tizimi</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 ml-9">
            {menuItems.map((item) => (  
              <button
                key={item.path}
                onClick={() => handleMenuClick(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200
                  text-[14px] font-medium whitespace-nowrap group relative
                  ${activeMenu?.path === item.path
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
                {activeMenu?.path === item.path && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

         
          <div className="flex items-center gap-2">
        {isRefreshing && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                <span>Yangilanmoqda</span>
              </div>
            )}

  
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || user?.phone?.charAt(0) || '?'}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Foydalanuvchi'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="hidden sm:flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDarkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              title="Chiqish"
            >
              <LogOut size={20} className="text-red-600 dark:text-red-400" />
            </button>

            <button className="lg:hidden flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <UserCircle size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="lg:hidden border-t dark:border-gray-700 py-2">
          <div className="grid grid-cols-2 gap-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                  text-[13px] font-medium
                  ${activeMenu?.path === item.path
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;