import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ImageLoader, { SmallImageLoader } from '../components/ImageLoader';
import ServerStatus from '../components/ServerStatus';
import {
  FileText, CheckCircle, Layers, Plus,
  Home, Settings, LogOut, Bell, RotateCw, User
} from 'lucide-react';

// ── Image Loading Animation for Teacher Layout ──
function AppleLoadingAnimation() {
  return <SmallImageLoader size={20} />;
}

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const D = isDarkMode;

  const BRAND = '#6366f1'; // Indigo for teacher
  const BRAND_LIGHT = '#818cf8';
  const BRAND_PALE = D ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';

  // Teacher specific navigation - faqat topshiriqlar, guruhlar
  const navLinks = [
    { icon: Home,         label: 'Dashboard',      path: '/teacher-panel' },
    { icon: FileText,      label: 'Topshiriqlar',   path: '/teacher-panel' },
    { icon: CheckCircle,   label: 'Baholash',       path: '/teacher-panel' },
    { icon: Layers,        label: 'Guruhlar',       path: '/teacher-panel' },
    { icon: Settings,      label: 'Sozlamalar',     path: '/settings' },
  ];

  const bg   = D ? '#000000' : '#f5f5f7';
  const card = D ? '#1c1c1e' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const tx   = D ? '#f5f5f7' : '#1d1d1f';
  const mu   = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';
  const sbg  = D ? '#1c1c1e' : '#ffffff';
  const sbord= D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const handleLogout = () => {
    if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
      logout();
      navigate('/teacher-login');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
        .teacher-layout { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif; }

        .nav-btn {
          padding: 12px 16px;
          border-radius: 12px;
          color: ${mu};
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          justify-content: flex-start;
        }
        .nav-btn:hover {
          background: ${BRAND_PALE};
          color: ${tx};
          transform: translateX(4px);
        }
        .nav-btn.active {
          background: ${BRAND};
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .apple-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${BRAND_PALE};
          color: ${BRAND};
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .apple-icon-btn:hover {
          background: ${BRAND_PALE.replace('0.08', '0.15').replace('0.15', '0.25')};
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${D ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${D ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
        }
      `}</style>

      <div className="teacher-layout flex min-h-screen" style={{ background: bg }}>

        {/* ── TEACHER SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 z-40 flex-shrink-0 p-4"
          style={{ background: sbg, borderRight: `1px solid ${sbord}` }}>

          {/* Logo */}
          <div className="flex items-center gap-4 px-4 py-6 mb-4"
            style={{ borderBottom: `1px solid ${sbord}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-none" style={{ color: tx }}>O'qituvchi Paneli</p>
              <p className="text-xs mt-1.5" style={{ color: mu }}>Boshqaruv Tizimi</p>
            </div>
          </div>

          {/* Navigation - Faqat teacher specific */}
          <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
            {navLinks.map((n, i) => {
              const Icon = n.icon;
              const isActive = location.pathname.startsWith(n.path);
              return (
                <button key={i} onClick={() => navigate(n.path)}
                  className={`nav-btn ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span className="flex-1 text-left">{n.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-lg" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="px-2 py-4" style={{ borderTop: `1px solid ${sbord}` }}>
            <div className="flex items-center gap-3 p-4 rounded-xl mb-4"
              style={{ background: BRAND_PALE }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: BRAND }}>
                {(user?.name || 'T')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: tx }}>{user?.name || 'O\'qituvchi'}</p>
                <p className="text-xs" style={{ color: mu }}>O'qituvchi</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
              style={{
                background: BRAND,
                color: 'white',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
              }}>
              <LogOut size={18} />
              Chiqish
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 px-6 h-16 flex items-center justify-between backdrop-blur-lg"
            style={{
              background: sbg,
              borderBottom: `1px solid ${sbord}`,
              backgroundOpacity: D ? '0.95' : '0.98'
            }}>
            <div className="flex items-center gap-3">
              <ServerStatus />
              <span className="text-xs" style={{ color: mu }}>
                {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="apple-icon-btn"
                title="Yangilash">
                <RotateCw size={16} />
              </button>
              <button
                onClick={toggleDarkMode}
                className="apple-icon-btn"
                title={D ? 'Yorug\' rejim' : 'Qorong\'u rejim'}>
                {D ? <span className="text-lg">☀️</span> : <span className="text-lg">🌙</span>}
              </button>
              <button className="apple-icon-btn relative" title="Bildirishnomalar">
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
