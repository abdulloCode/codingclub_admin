import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import appleIcon from '../assets/imgq/apple-style-icon.svg';
import ImageLoader, { SmallImageLoader } from '../components/ImageLoader';
import ServerStatus from '../components/ServerStatus';
import {
  BarChart3, GraduationCap, Users, Layers, BookOpen,
  CreditCard, Activity, Download, Sun, Moon, ChevronRight, RotateCw
} from 'lucide-react';

// ── Image Loading Animation for Download Button ──
function AppleDownloadAnimation() {
  return <SmallImageLoader size={16} />;
}

// ── Image Loading Animation for Status ──
function AppleLoadingAnimation() {
  return <SmallImageLoader size={20} />;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const D = isDarkMode;

  const BRAND = '#427A43';
  const BRAND_LIGHT = '#4a8c4b';
  const BRAND_PALE = D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)';

  const navLinks = [
    { icon: BarChart3,     label: 'Dashboard',      path: '/admin-panel' },
    { icon: GraduationCap, label: "O'quvchilar",    path: '/student'    },
    { icon: Users,         label: "O'qituvchilar",  path: '/teachers'   },
    { icon: Layers,        label: 'Guruhlar',        path: '/groups'     },
    { icon: BookOpen,      label: 'Kurslar',         path: '/courses'    },
    { icon: CreditCard,    label: "To'lovlar",       path: '/payments'   },
  ];

  const bg   = D ? '#000000' : '#f5f5f7';
  const card = D ? '#1c1c1e' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const tx   = D ? '#f5f5f7' : '#1d1d1f';
  const mu   = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';
  const sbg  = D ? '#1c1c1e' : '#ffffff';
  const sbord= D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
        .admin-layout { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif; }

        .nav-btn {
          padding: 10px 14px;
          border-radius: 10px;
          color: ${mu};
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
          border: none;
          cursor: pointer;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-btn:hover {
          background: ${BRAND_PALE};
          color: ${tx};
        }
        .nav-btn.active {
          background: ${BRAND};
          color: white;
        }

        .apple-icon-btn {
          width: 32px;
          height: 32px;
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
        }
      `}</style>

      <div className="admin-layout flex min-h-screen" style={{ background: bg }}>

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 z-40 flex-shrink-0 p-4"
          style={{ background: sbg, borderRight: `1px solid ${sbord}` }}>

          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-6"
            style={{ borderBottom: `1px solid ${sbord}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: BRAND }}>
              <img
                src={appleIcon}
                alt="CodingClub Logo"
                className="w-6 h-6"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold leading-none" style={{ color: tx }}>CodingClub</p>
              <p className="text-xs mt-1" style={{ color: mu }}>Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navLinks.map((n, i) => {
              const Icon = n.icon;
              const isActive = location.pathname.startsWith(n.path);
              return (
                <button key={i} onClick={() => window.location.href = n.path}
                  className={`nav-btn w-full ${isActive ? 'active' : ''}`}>
                  <Icon size={16} />
                  <span>{n.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'white' }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="px-2 py-4" style={{ borderTop: `1px solid ${sbord}` }}>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-3"
              style={{ background: BRAND_PALE }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: BRAND }}>
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: tx }}>{user?.name || 'Admin'}</p>
                <p className="text-xs" style={{ color: mu }}>Administrator</p>
              </div>
            </div>
            <button onClick={() => window.confirm('Chiqmoqchimisiz?') && logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
              style={{ background: BRAND, color: 'white' }}>
              <AppleDownloadAnimation />
              Chiqish
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header className="sticky top-0 z-30 px-6 h-14 flex items-center justify-between"
            style={{ background: sbg, borderBottom: `1px solid ${sbord}` }}>
            <div className="flex items-center gap-2.5">
              <ServerStatus />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.reload()}
                className="apple-icon-btn">
                <RotateCw size={14} />
              </button>
              <button onClick={toggleDarkMode}
                className="apple-icon-btn">
                {D ? <Sun size={14} /> : <Moon size={14} />}
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