import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import ImageLoader, { SmallImageLoader } from '../components/ImageLoader';
import ServerStatus from '../components/ServerStatus';
import {
  FileText, CheckCircle, Layers, Plus,
  Home, Settings, LogOut, Bell, RotateCw, User,
  GraduationCap, BookOpen, Users, Activity, ChevronRight,
  ArrowUpRight, Save, CreditCard
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

  // Teacher specific navigation
  const navLinks = [
    { icon: Home,         label: 'Dashboard',      path: '/teacher-panel' },
    { icon: Layers,        label: 'Guruhlarim',     path: '/teacher-groups' },
    { icon: FileText,      label: 'Topshiriqlar',   path: '/teacher-homework' },
    { icon: CheckCircle,   label: 'Baholash',       path: '/teacher-grading' },
    { icon: Bell,         label: 'Davomat',        path: '/teacher-attendance' },
    { icon: Settings,      label: 'Sozlamalar',     path: '/settings' },
  ];

  // Dashboard stats for teacher
  const [stats, setStats] = useState({
    groups: { total: 0, active: 0 },
    students: { total: 0, active: 0 },
    attendance: { rate: 0, present: 0, total: 0 },
    homeworks: { total: 0, graded: 0 },
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // O'qituvchi guruhlari
      const groupsData = await apiService.getMyTeacherGroups().catch(() => []);
      let groups = [];

      if (Array.isArray(groupsData)) {
        groups = groupsData;
      } else if (groupsData?.groups && Array.isArray(groupsData.groups)) {
        groups = groupsData.groups;
      } else if (groupsData?.data && Array.isArray(groupsData.data)) {
        groups = groupsData.data;
      }

      // Faqat shu o'qituvchiga tegishli guruhlarni
      const teacherId = user?.id || user?.userId;
      if (teacherId) {
        groups = groups.filter(group => {
          return group.teacherId === teacherId || group.teacher?.id === teacherId;
        });
      }

      // Davomat ma'lumotlari
      let attendanceStats = { rate: 0, present: 0, total: 0 };
      try {
        const allAttendance = [];
        for (const group of groups) {
          try {
            const attData = await apiService.getGroupAttendanceRecords(group.id);
            const records = Array.isArray(attData) ? attData : attData?.data || [];
            allAttendance.push(...records);
          } catch (err) {
            console.log(`Guruh ${group.id} davomatini yuklashda xatolik:`, err);
          }
        }

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayAttendance = allAttendance.filter(r => r.date?.startsWith(todayStr));
        const totalToday = todayAttendance.length;
        const presentToday = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
        attendanceStats = {
          rate: totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0,
          present: presentToday,
          total: totalToday,
        };
      } catch (attErr) {
        console.log('Davomat statistikasini yuklashda xatolik:', attErr);
      }

      // Topshiriqlar
      const homeworkData = await apiService.getHomeworks().catch(() => []);
      const homeworks = Array.isArray(homeworkData) ? homeworkData : homeworkData?.homeworks || [];
      const gradedCount = homeworks.filter(hw => hw.graded).length || 0;

      // O'quvchilar soni
      let totalStudents = 0;
      let activeStudents = 0;
      groups.forEach(group => {
        const students = group.students?.length || group.currentStudents || 0;
        totalStudents += students;
        if (group.status === 'active') activeStudents += students;
      });

      setStats({
        groups: {
          total: groups.length,
          active: groups.filter(g => g.status === 'active').length,
        },
        students: {
          total: totalStudents,
          active: activeStudents,
        },
        attendance: attendanceStats,
        homeworks: {
          total: homeworks.length,
          graded: gradedCount,
        },
      });
    } catch (error) {
      console.error('Dashboard ma\'lumotlarini yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        .teacher-layout {}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: `1px solid ${sbord}` }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${BRAND}40`,
              flexShrink: 0,
            }}>
              <GraduationCap size={24} color="white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: tx, lineHeight: 1, marginBottom: '4px' }}>
                Codingclub
              </p>
              <p style={{ fontSize: '11px', color: mu }}>O'qituvchi Portal</p>
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              background: BRAND_PALE,
              marginBottom: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: `0 4px 12px ${BRAND}40`,
              }}>
                {(user?.name || 'T')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: tx,
                  marginBottom: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.name || 'O\'qituvchi'}
                </p>
                <p style={{ fontSize: '11px', color: mu }}>O'qituvchi</p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'transparent',
            }}>
              <button
                onClick={() => navigate('/settings')}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: tx,
                  border: `1px solid ${bord}`,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = BRAND_PALE;
                  e.currentTarget.style.borderColor = BRAND;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = bord;
                }}
              >
                <Settings size={14} />
                Sozlamalar
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                }}
              >
                <LogOut size={14} />
                Chiqish
              </button>
            </div>
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
            <div className="flex items-center gap-4">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${BRAND}40`,
              }}>
                <GraduationCap size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: tx, lineHeight: 1 }}>O'qituvchi Paneli</p>
                <p style={{ fontSize: '11px', color: mu, marginTop: '2px' }}>Boshqaruv Tizimi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: D ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)' }}>
                <ServerStatus />
                <span className="text-xs" style={{ color: mu }}>
                  {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <button
                onClick={() => navigate(location.pathname)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: BRAND_PALE,
                  color: BRAND,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                title="Yangilash"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = BRAND_PALE.replace('0.08', '0.15').replace('0.15', '0.25');
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = BRAND_PALE;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <RotateCw size={16} />
              </button>

              <button
                onClick={toggleDarkMode}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: BRAND_PALE,
                  color: BRAND,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                title={D ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = BRAND_PALE.replace('0.08', '0.15').replace('0.15', '0.25');
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = BRAND_PALE;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {D ? <span className="text-lg">☀️</span> : <span className="text-lg">🌙</span>}
              </button>

              <button
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: BRAND_PALE,
                  color: BRAND,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
                title="Bildirishnomalar"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = BRAND_PALE.replace('0.08', '0.15').replace('0.15', '0.25');
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = BRAND_PALE;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Bell size={16} />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '16px',
                  height: '16px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(239,68,68,0.3)',
                }}>
                  3
                </span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                title="Chiqish"
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                }}
              >
                <LogOut size={14} />
                Chiqish
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {location.pathname === '/teacher-panel' ? (
              // Teacher Dashboard
              <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 600, color: tx, marginBottom: '8px' }}>
                    O'qituvchi Dashboard
                  </h1>
                  <p style={{ fontSize: '14px', color: mu }}>
                    {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <SmallImageLoader size={32} />
                  </div>
                ) : (
                  <>
                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      {[
                        {
                          icon: Layers,
                          label: "Guruhlarim",
                          value: stats.groups.total,
                          sub: `${stats.groups.active} faol`,
                          color: BRAND,
                          onClick: () => navigate('/teacher-groups')
                        },
                        {
                          icon: Users,
                          label: "O'quvchilar",
                          value: stats.students.total,
                          sub: `${stats.students.active} faol`,
                          color: '#22c55e',
                          onClick: () => navigate('/teacher-groups')
                        },
                        {
                          icon: FileText,
                          label: 'Topshiriqlar',
                          value: stats.homeworks.total,
                          sub: `${stats.homeworks.graded} baholangan`,
                          color: '#f59e0b',
                          onClick: () => navigate('/teacher-homework')
                        },
                        {
                          icon: Bell,
                          label: 'Davomat',
                          value: `${stats.attendance.rate}%`,
                          sub: `${stats.attendance.present}/${stats.attendance.total}`,
                          color: '#ef4444',
                          onClick: () => navigate('/teacher-attendance')
                        },
                      ].map((card, i) => (
                        <div
                          key={i}
                          onClick={card.onClick}
                          style={{
                            background: card,
                            border: `1px solid ${bord}`,
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = D ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(99,102,241,0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              background: `${card.color}15`,
                              border: `1px solid ${card.color}30`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <card.icon size={18} color={card.color} />
                            </div>
                            <ChevronRight size={14} color={mu} />
                          </div>
                          <p style={{ fontSize: '32px', fontWeight: 600, color: card.color, lineHeight: 1, marginBottom: '4px' }}>
                            {card.value}
                          </p>
                          <p style={{ fontSize: '12px', fontWeight: 500, color: tx, marginBottom: '2px' }}>
                            {card.label}
                          </p>
                          <p style={{ fontSize: '11px', color: mu }}>
                            {card.sub}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                      background: card,
                      border: `1px solid ${bord}`,
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '24px',
                      boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)',
                    }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 600, color: tx, marginBottom: '16px' }}>
                        Tezkor amallar
                      </h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        {[
                          { icon: FileText, label: 'Topshiriq yaratish', onClick: () => navigate('/teacher-homework') },
                          { icon: Bell, label: 'Davomatni ko\'rish', onClick: () => navigate('/teacher-attendance') },
                          { icon: Users, label: 'Guruhlarni ko\'rish', onClick: () => navigate('/teacher-groups') },
                          { icon: Settings, label: 'Sozlamalar', onClick: () => navigate('/settings') },
                        ].map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={i}
                              onClick={action.onClick}
                              style={{
                                border: `1px solid ${bord}`,
                                borderRadius: '12px',
                                padding: '16px 12px',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = BRAND;
                                e.currentTarget.style.background = BRAND_PALE;
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = bord;
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 12px ${BRAND}40`,
                              }}>
                                <Icon size={16} color="white" />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 500, color: tx, textAlign: 'center' }}>
                                {action.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Attendance Overview */}
                    <div style={{
                      background: card,
                      border: `1px solid ${bord}`,
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: 600, color: tx, marginBottom: '8px' }}>
                            Bugungi Davomat
                          </h2>
                          <p style={{ fontSize: '14px', color: mu }}>
                            Mening guruhlarim bo'yicha
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/teacher-attendance')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: BRAND,
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Batafsil
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        {[
                          { label: 'Keldi', value: stats.attendance.present, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                          { label: 'Kelmadi', value: stats.attendance.total - stats.attendance.present, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                          { label: 'Kechikdi', value: '0', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                        ].map(({ label, value, color, bg }) => (
                          <div key={label} style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: bg,
                            border: `1px solid ${color}30`,
                            textAlign: 'center',
                          }}>
                            <p style={{ fontSize: '24px', fontWeight: 600, color, lineHeight: 1, marginBottom: '4px' }}>
                              {value}
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: mu }}>
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${bord}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: mu }}>Davomat ko'rsatkichi</span>
                          <span style={{ fontSize: '16px', fontWeight: 600, color: BRAND }}>
                            {stats.attendance.rate}%
                          </span>
                        </div>
                        <div style={{ height: '4px', borderRadius: '4px', background: D ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.1)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: '4px',
                            background: `linear-gradient(90deg, ${BRAND}, ${BRAND_LIGHT})`,
                            width: `${Math.min(stats.attendance.rate, 100)}%`,
                            transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Groups Overview */}
                    <div style={{
                      background: card,
                      border: `1px solid ${bord}`,
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h2 style={{ fontSize: '18px', fontWeight: 600, color: tx, marginBottom: '8px' }}>
                            Guruhlarim
                          </h2>
                          <p style={{ fontSize: '14px', color: mu }}>
                            Jami {stats.groups.total} ta guruh
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/teacher-groups')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: BRAND,
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Barcha guruhlar
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {stats.groups.total === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: mu }}>
                          <Layers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p style={{ fontSize: '14px', fontWeight: 500 }}>Hozircha guruhlar yo'q</p>
                          <p style={{ fontSize: '12px', marginTop: '8px' }}>Admin tomonidan guruh tayinlashini kutishingiz mumkin</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                          {Array.from({ length: Math.min(stats.groups.total, 3) }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                background: D ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)',
                                border: `1px solid ${bord}`,
                                borderRadius: '12px',
                                padding: '16px',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = BRAND;
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = bord;
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '12px',
                                  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '18px',
                                  boxShadow: `0 4px 12px ${BRAND}40`,
                                }}>
                                  {i + 1}
                                </div>
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 600, color: tx }}>Guruh {i + 1}</p>
                                  <p style={{ fontSize: '12px', color: mu }}>Frontend</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '16px' }}>
                                <div>
                                  <p style={{ fontSize: '12px', color: mu, marginBottom: '4px' }}>O'quvchilar</p>
                                  <p style={{ fontSize: '16px', fontWeight: 600, color: tx }}>{15 + i * 2}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '12px', color: mu, marginBottom: '4px' }}>Holat</p>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#22c55e',
                                    background: 'rgba(34,197,94,0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                  }}>
                                    Faol
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
