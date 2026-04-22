import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { colors, spacing, borderRadius, shadows, transitions, glassmorphism } from '../styles/design-tokens';
import {
  LayoutDashboard, GraduationCap, Users, Layers,
  BookOpen, CreditCard, Sun, Moon,
  LogOut, ChevronRight, ChevronLeft, Search, Menu, X,
  BarChart3
} from 'lucide-react';
import icon from '../assets/image.png';

/* ─── NAVIGATION LINKS ────────────────────────────────────────── */
const NAV_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/admin-panel' },
  { icon: GraduationCap,   label: "O'quvchilar",      path: '/admin-students'    },
  { icon: Users,           label: "O'qituvchilar",    path: '/teachers'    },
  { icon: Layers,          label: 'Guruhlar',         path: '/groups'      },
  { icon: BookOpen,        label: 'Kurslar',          path: '/courses'     },
  { icon: CreditCard,      label: "To'lov hisoblar",  path: '/admin-payments' },
  { icon: BarChart3,       label: "Hisobotlar",       path: '/reports' },
];

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme colors
  const bg = isDarkMode ? colors.dark.background : colors.light.background;
  const sidebarBg = isDarkMode ? 'rgba(20, 20, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const border = isDarkMode ? colors.dark.border : colors.light.border;
  const text = isDarkMode ? colors.dark.text : colors.light.text;
  const textMuted = isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary;
  const cardBg = isDarkMode ? colors.dark.card : colors.light.card;

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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Mobile Header */}
      <header
        className="mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: sidebarBg,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${border}`,
          zIndex: 1030,
          padding: `0 ${spacing[4]}`,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/admin-panel')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: borderRadius.md,
              overflow: 'hidden',
              background: colors.brand.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            <img src={icon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: text, margin: 0, lineHeight: 1 }}>
              CodingClub
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          {/* Menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: borderRadius.md,
              background: 'transparent',
              border: 'none',
              color: text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: '100vh', background: bg }}>
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <aside
          className="al-sidebar"
          style={{
            width: sidebarCollapsed ? '72px' : '280px',
            height: '100vh',
            position: 'sticky',
            top: 0,
            flexShrink: 0,
            display: window.innerWidth >= 1024 ? 'flex' : mobileMenuOpen ? 'flex' : 'none',
            flexDirection: 'column',
            background: sidebarBg,
            backdropFilter: 'blur(12px)',
            borderRight: `1px solid ${border}`,
            zIndex: 1020,
            transition: `width ${transitions.base}`,
            ...window.innerWidth < 1024 && {
              position: 'fixed',
              left: 0,
              top: 0,
            },
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              padding: spacing[5],
              borderBottom: `1px solid ${border}`,
            }}
          >
            <div
              onClick={() => navigate('/admin-panel')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  background: colors.brand.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '16px',
                  flexShrink: 0,
                  boxShadow: shadows.brand,
                }}
              >
                <img src={icon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {!sidebarCollapsed && (
                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                  <h1 style={{ fontSize: '18px', fontWeight: 700, color: text, margin: 0, lineHeight: 1 }}>
                    CodingClub
                  </h1>
                  <p style={{ fontSize: '11px', color: textMuted, margin: '2px 0 0', fontWeight: 600 }}>
                    ADMIN PANEL
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: spacing[4], overflowY: 'auto' }}>
            {!sidebarCollapsed && (
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: textMuted,
                  margin: `0 0 ${spacing[3]} ${spacing[2]}`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Menyu
              </p>
            )}

            {NAV_LINKS.map((link, idx) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              const isExternal = link.path.startsWith('http');

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isExternal) {
                      window.open(link.path, '_blank');
                    } else {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`al-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: sidebarCollapsed ? '0' : spacing[3],
                    width: '100%',
                    padding: sidebarCollapsed ? '10px' : '12px 16px',
                    borderRadius: borderRadius.xl,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: `all ${transitions.base}`,
                    position: 'relative',
                    marginBottom: spacing[1],
                    background: isActive ? colors.brand.gradient : 'transparent',
                    color: isActive ? '#fff' : textMuted,
                    boxShadow: isActive ? shadows.brand : 'none',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      flexShrink: 0,
                      strokeWidth: isActive ? 2.5 : 2,
                    }}
                  />
                  {!sidebarCollapsed && (
                    <span style={{ flex: 1, animation: 'fadeIn 0.2s ease' }}>{link.label}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <ChevronRight size={14} style={{ animation: 'fadeIn 0.2s ease' }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div
            style={{
              padding: spacing[4],
              borderTop: `1px solid ${border}`,
            }}
          >
            {/* User Profile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                padding: spacing[3],
                borderRadius: borderRadius.xl,
                background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                marginBottom: spacing[3],
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: borderRadius.lg,
                  background: colors.brand.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                  boxShadow: shadows.sm,
                }}
              >
                {userInitial}
              </div>
              {!sidebarCollapsed && (
                <div style={{ flex: 1, minWidth: 0, animation: 'fadeIn 0.2s ease' }}>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      margin: 0,
                    }}
                  >
                    {user?.name || 'Admin'}
                  </p>
                  <p style={{ fontSize: '11px', color: textMuted, margin: '2px 0 0' }}>
                    {user?.role || 'Bosh admin'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                onClick={toggleDarkMode}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: borderRadius.md,
                  border: `1px solid ${border}`,
                  background: 'transparent',
                  color: textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: `all ${transitions.fast}`,
                }}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: borderRadius.md,
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: textMuted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${transitions.fast}`,
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  height: '36px',
                  borderRadius: borderRadius.md,
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: colors.semantic.error,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  transition: `all ${transitions.fast}`,
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Desktop Header */}
          <header
            style={{
              height: '64px',
              borderBottom: `1px solid ${border}`,
              display: window.innerWidth >= 1024 ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `0 ${spacing[6]}`,
              background: sidebarBg,
              backdropFilter: 'blur(12px)',
              position: 'sticky',
              top: 0,
              zIndex: 1010,
            }}
          >
            {/* Toggle & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: borderRadius.md,
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>

              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: text, margin: 0, lineHeight: 1 }}>
                  {NAV_LINKS.find(link => location.pathname === link.path)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '280px',
              }}
            >
              <Search
                size={16}
                color={textMuted}
                style={{
                  position: 'absolute',
                  left: spacing[3],
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: `8px ${spacing[3]} 8px ${spacing[9]}`,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${border}`,
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  color: text,
                  fontSize: '13px',
                  outline: 'none',
                  transition: `all ${transitions.fast}`,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDarkMode
                    ? colors.dark.borderFocus
                    : colors.light.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px ${
                    isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(66, 122, 67, 0.1)'
                  }`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: spacing[3],
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: spacing[1],
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          <main
            className="al-page"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: spacing[6],
              background: bg,
            }}
          >
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav
          className="al-mobile-nav"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: sidebarBg,
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${border}`,
            display: window.innerWidth < 1024 ? 'flex' : 'none',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1020,
            padding: spacing[2],
            paddingBottom: `calc(${spacing[2]} + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          {NAV_LINKS.slice(0, 5).map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <button
                key={idx}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`al-mobile-item ${isActive ? 'active' : ''}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: spacing[2],
                  borderRadius: borderRadius.md,
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing[1],
                  color: isActive ? colors.brand.primary : textMuted,
                  cursor: 'pointer',
                  transition: `all ${transitions.fast}`,
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {link.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* ─── STYLES ──────────────────────────────────────────────────── */
const STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .al-sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .al-sidebar::-webkit-scrollbar-thumb {
    background: rgba(66, 122, 67, 0.2);
    border-radius: 10px;
  }

  .al-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(66, 122, 67, 0.3);
  }

  .al-page {
    animation: fadeIn 0.3s ease;
  }

  @media (max-width: 1023px) {
    .mobile-header {
      display: flex !important;
    }

    .al-page {
      padding-bottom: 80px !important;
    }
  }
`;
