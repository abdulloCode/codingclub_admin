import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart3, GraduationCap, Users, Layers,
  BookOpen, CreditCard, Sun, Moon,
  LogOut, ChevronRight, Sparkles, ClipboardList,
  LayoutDashboard, Settings, Bell
} from 'lucide-react';
import icon from '../assets/image.png';

/* ─── BRAND COLORS ────────────────────────────────────────── */
const B  = '#427A43';
const BL = '#5a9e5b';
const BD = '#2d5630';

/* ─── STYLES ──────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *{box-sizing:border-box;margin:0;padding:0; font-family: 'Plus Jakarta Sans', sans-serif;}
  
  :root{
    --b:${B};--bl:${BL};--bd:${BD};
    --transition: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .al-sidebar::-webkit-scrollbar { width: 4px; }
  .al-sidebar::-webkit-scrollbar-thumb { background: rgba(66, 122, 67, 0.1); border-radius: 10px; }

  .al-nav-item {
    display: flex; align-items: center; gap: 14px;
    width: 100%; padding: 12px 16px; border-radius: 16px;
    border: none; cursor: pointer; text-align: left;
    font-size: 14.5px; font-weight: 500;
    transition: all 0.25s var(--transition);
    position: relative; text-decoration: none;
    margin-bottom: 4px;
  }

  .al-nav-item:hover:not(.active) {
    background: rgba(66, 122, 67, 0.06);
    transform: translateX(5px);
  }

  .al-nav-item.active {
    background: linear-gradient(135deg, var(--bd), var(--bl));
    color: #fff !important;
    box-shadow: 0 8px 20px -6px rgba(66, 122, 67, 0.4);
  }

  .al-logo-container:hover .al-logo-icon {
    transform: rotate(-6deg) scale(1.1);
  }

  .al-page {
    animation: fadeIn 0.4s var(--transition);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media(max-width:1023px){
    .al-sidebar { display: none !important; }
    .al-mobile-nav { display: flex !important; }
    .al-page::-webkit-scrollbar { display: none; }
    .al-page { -ms-overflow-style: none; scrollbar-width: none; padding-bottom: 80px !important; }
  }

  /* Mobile bottom navigation */
  .al-mobile-nav {
    padding: 8px 12px;
    padding-bottom: env(safe-area-inset-bottom, 8px);
    box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  }

  .al-mobile-item {
    flex: 1;
    min-width: 0;
    padding: 6px 4px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .al-mobile-item:active {
    transform: scale(0.95);
  }

  .al-mobile-item.active {
    background: rgba(66, 122, 67, 0.08);
  }
`;

const NAV_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/admin-panel' },
  { icon: GraduationCap,   label: "O'quvchilar",    path: '/student'    },
  { icon: Users,           label: "O'qituvchilar",  path: '/teachers'    },
  { icon: Layers,          label: 'Guruhlar',       path: '/groups'      },
  { icon: BookOpen,        label: 'Kurslar',        path: '/courses'     },
  { icon: ClipboardList,   label: 'Davomat',        path: '/attendance'  },
  { icon: BarChart3,       label: "To'lovlar",      path: '/admin-payments' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDarkMode: D, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const bg   = D ? '#09090b' : '#f4f7f4';
  const side = D ? '#121215' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tx   = D ? '#fafafa' : '#18181b';
  const mu   = D ? '#a1a1aa' : '#71717a';

  const userInitial = (user?.name || 'A')[0].toUpperCase();

  const handleLogout = () => {
    if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: bg, color: tx }}>

        {/* ── SIDEBAR (280px) ─────────────────────────────── */}
        <aside className="al-sidebar" style={{
          width: 280, height: '100vh', position: 'sticky', top: 0,
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: side, borderRight: `1px solid ${bord}`, zIndex: 50,
        }}>

          {/* Header / Logo */}
          <div className="al-logo-container" style={{
            padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer'
          }} onClick={() => navigate('/admin-panel')}>
            <div className="al-logo-icon" style={{
              width: 48, height: 48, borderRadius: 16, overflow: 'hidden',
              background: '#fff', boxShadow: '0 10px 25px -5px rgba(66,122,67,0.3)',
              transition: 'transform 0.3s var(--transition)'
            }}>
              <img src={icon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: B, letterSpacing: '-0.02em' }}>CodingClub</h1>
              <p style={{ fontSize: 11, fontWeight: 600, color: mu, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: mu, margin: '10px 12px 12px', textTransform: 'uppercase' }}>Menyu</p>
            
            {NAV_LINKS.map((n, i) => {
              const Icon = n.icon;
              const isActive = location.pathname === n.path || (n.path !== '/admin-panel' && location.pathname.startsWith(n.path));
              return (
                <button key={i} 
                  className={`al-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(n.path)}
                  style={{ color: isActive ? '#fff' : tx }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {isActive && <ChevronRight size={16} />}
                </button>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div style={{ padding: '20px 16px', borderTop: `1px solid ${bord}`, background: D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
            
            {/* User Profile Card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
              borderRadius: 20, background: D ? '#1c1c21' : '#f8faf8',
              border: `1px solid ${bord}`, marginBottom: 16
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: `linear-gradient(135deg, ${B}, ${BL})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 12px rgba(66,122,67,0.2)'
              }}>
                {userInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
                <p style={{ fontSize: 11, color: mu }}>{user?.role || 'Bosh admin'}</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleDarkMode} style={{
                flex: 1, height: 44, borderRadius: 14, border: `1px solid ${bord}`,
                background: side, color: tx, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}>
                {D ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleLogout} style={{
                flex: 1, height: 44, borderRadius: 14, border: 'none',
                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600
              }}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          
          {/* Top Navbar (Desktop only, for extra context) */}
          <header style={{
            height: 70, borderBottom: `1px solid ${bord}`, display: 'flex', 
            alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', gap: 20,
            background: side
          }} className="al-sidebar">
             <div style={{ color: mu, fontSize: 13, fontWeight: 500 }}>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
             <div style={{ width: 1, height: 20, background: bord }}></div>
             <button style={{ background: 'none', border: 'none', color: mu, cursor: 'pointer' }}><Bell size={20} /></button>
          </header>

          <main className="al-page" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <Outlet />
          </main>
        </div>

        {/* ── MOBILE NAV ──────────────────────────────────── */}
        <nav className="al-mobile-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: side, borderTop: `1px solid ${bord}`,
          display: 'none', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000
        }}>
          {NAV_LINKS.map((n, i) => {
            const Icon = n.icon;
            const isActive = location.pathname === n.path || (n.path !== '/admin-panel' && location.pathname.startsWith(n.path));
            return (
              <button key={i} onClick={() => navigate(n.path)} className={`al-mobile-item ${isActive ? 'active' : ''}`} style={{
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: isActive ? B : mu, minWidth: 0, flex: 1
              }}>
                <Icon size={18} />
                <span style={{ fontSize: 8, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{n.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </>
  );
}