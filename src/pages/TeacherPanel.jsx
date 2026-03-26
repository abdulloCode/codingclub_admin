import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  FileText, CheckCircle, Plus, Trash2, RotateCw,
  Calendar, BookOpen, Users, Layers, Clock,
  Menu, X, Bell, Search, Settings,
  Home, LogOut, ChevronDown, TrendingUp,
  Award, Target, AlertTriangle, Play, Pause
} from 'lucide-react';

const BRAND = '#6366f1';
const BRAND_LIGHT = '#818cf8';
const BRAND_DARK = '#4f46e5';

export default function TeacherPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode: D } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0, present: 0, absent: 0, late: 0, rate: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sectionTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'assignments', label: 'Topshiriqlar', icon: FileText },
    { id: 'grading', label: 'Baholash', icon: CheckCircle },
    { id: 'groups', label: 'Guruhlar', icon: Layers },
  ];

  const [form, setForm] = useState({
    title: '', description: '', groupId: '', dueDate: '', points: 100
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHomeworks().catch(() => []);
      const hw = Array.isArray(data) ? data : data?.homeworks || data?.data || [];
      setAssignments(hw);
    } catch (err) {
      console.error('Yuklashda xatolik:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      const data = await apiService.getHomeworkSubmissions(assignmentId);
      const subs = Array.isArray(data) ? data : data?.submissions || data?.data || [];
      setSubmissions(subs);
    } catch (err) {
      console.error('Topshiriqlarni yuklashda xatolik:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await apiService.getMyTeacherGroups();
      let grps = [];
      if (Array.isArray(data)) {
        grps = data;
      } else if (data?.groups && Array.isArray(data.groups)) {
        grps = data.groups;
      } else if (data?.data && Array.isArray(data.data)) {
        grps = data.data;
      }
      const teacherId = user?.id || user?.userId;
      if (teacherId) {
        grps = grps.filter(group =>
          group.teacherId === teacherId || group.teacher?.id === teacherId
        );
      }
      setGroups(grps);
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err);
      setGroups([]);
    }
  };

  const loadTeacherAttendance = async () => {
    try {
      const allAttendance = [];
      if (groups.length > 0) {
        for (const group of groups) {
          try {
            const data = await apiService.getGroupAttendanceRecords(group.id);
            const records = Array.isArray(data) ? data : data?.data || [];
            allAttendance.push(...records);
          } catch (err) {
            console.log(`Guruh ${group.id} davomatini yuklashda xatolik:`, err);
          }
        }
      }
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayAttendance = allAttendance.filter(r => r.date?.startsWith(todayStr));
      const totalToday = todayAttendance.length;
      const presentToday = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
      const absentToday = todayAttendance.filter(r => r.status === 'absent').length;
      const lateToday = todayAttendance.filter(r => r.status === 'late').length;
      const rate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;
      setAttendanceStats({ total: totalToday, present: presentToday, absent: absentToday, late: lateToday, rate });
    } catch (err) {
      console.error('Davomat statistikasini yuklashda xatolik:', err);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) loadTeacherAttendance();
  }, [groups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createHomework(form);
      alert('Topshiriq muvaffaqiyatli yaratildi!');
      setShowCreateModal(false);
      setForm({ title: '', description: '', groupId: '', dueDate: '', points: 100 });
      loadAssignments();
    } catch (err) {
      console.error('Yaratishda xatolik:', err);
      alert('Xatolik yuz berdi!');
    } finally {
      setModalLoading(false);
    }
  };

  const gradeSubmission = async (assignmentId, submissionId, points) => {
    if (!points || points < 0 || points > 100) {
      alert('Ballni 0 dan 100 gacha kiritishingiz kerak!');
      return;
    }
    try {
      await apiService.gradeHomework(assignmentId, submissionId, parseInt(points));
      alert('Muvaffaqiyatli baholandi!');
      loadSubmissions(assignmentId);
    } catch (err) {
      console.error('Baholashda xatolik:', err);
      alert('Xatolik yuz berdi!');
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!confirm("Ushbu topshiriqni o'chirmoqchimisiz?")) return;
    try {
      await apiService.deleteHomework(assignmentId);
      alert("Topshiriq o'chirildi!");
      loadAssignments();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const bg     = D ? '#0a0a0f' : '#f8fafc';
  const card   = D ? '#1e1e24' : '#ffffff';
  const bord   = D ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const tx     = D ? '#f1f5f9' : '#1e293b';
  const mu     = D ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.5)';
  const bgItem = D ? '#1e1e24' : '#ffffff';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
        body { background: ${bg}; color: ${tx}; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .smooth-scroll { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide { animation: slideIn 0.3s ease-out forwards; }
        .card-hover { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(99,102,241,0.15); }
        .btn-primary { background: linear-gradient(135deg,${BRAND},${BRAND_LIGHT}); transition: all 0.2s ease; }
        .btn-primary:hover { background: linear-gradient(135deg,${BRAND_LIGHT},${BRAND_DARK}); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
        .btn-secondary { background: transparent; border: 1px solid ${bord}; color: ${tx}; transition: all 0.2s ease; }
        .btn-secondary:hover { background: ${D ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)'}; }
        .input-field { background: ${D ? '#2a2a35' : '#f8fafc'}; border: 1px solid ${bord}; color: ${tx}; transition: all 0.2s ease; }
        .input-field:focus { border-color: ${BRAND}; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); outline: none; }
        .sidebar-item { transition: all 0.2s ease; border-left: 3px solid transparent; }
        .sidebar-item:hover { background: ${D ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)'}; border-left-color: ${BRAND}; }
        .sidebar-item.active { background: linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.05)); border-left-color: ${BRAND}; }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { background: ${D ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)'}; }
        .progress-bar { background: ${D ? '#374151' : '#e2e8f0'}; border-radius: 9999px; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg,${BRAND},${BRAND_LIGHT}); height: 100%; transition: width 0.5s ease; }
        @media (max-width: 768px) { .desktop-only { display: none !important; } }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: bg }}>

        {/* ── SIDEBAR ── */}
        <div
          className="desktop-only"
          style={{
            width: sidebarOpen ? '280px' : '80px',
            background: card,
            borderRight: `1px solid ${bord}`,
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0, top: 0, bottom: 0,
            zIndex: 40,
            overflow: 'hidden',
          }}
        >
          {/* Logo */}
          <div style={{ padding: '24px', borderBottom: `1px solid ${bord}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: `linear-gradient(135deg,${BRAND},${BRAND_LIGHT})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={20} color="white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: tx, margin: 0 }}>O'qituvchi</h2>
                <p style={{ fontSize: '11px', color: mu, margin: '4px 0 0 0' }}>{user?.name || "O'qituvchi"}</p>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '12px', background: 'none', border: 'none', color: mu, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderBottom: `1px solid ${bord}`,
            }}
          >
            {sidebarOpen ? <ChevronDown size={20} /> : <Menu size={20} />}
          </button>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            {sectionTabs.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '10px', marginBottom: '4px',
                    cursor: 'pointer', border: 'none', background: 'transparent',
                    color: tx, fontSize: '14px', fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <Icon size={18} />
                  {sidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>{section.label}</span>}
                  {sidebarOpen && isActive && <ChevronDown size={16} style={{ color: BRAND }} />}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          {sidebarOpen && (
            <div style={{ padding: '16px', borderTop: `1px solid ${bord}` }}>
              <button
                onClick={() => { localStorage.removeItem('accessToken'); navigate('/teacher-login'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px', borderRadius: '10px', border: 'none',
                  background: D ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.1)',
                  color: D ? '#fca5a5' : '#ef4444', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500,
                }}
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{
          flex: 1,
          marginLeft: sidebarOpen ? '280px' : '80px',
          background: bg,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
        }}>

          {/* TOP NAVBAR */}
          <div style={{
            position: 'sticky', top: 0, background: card,
            borderBottom: `1px solid ${bord}`, padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="desktop-only nav-btn"
                style={{
                  padding: '8px', borderRadius: '8px',
                  background: D ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)',
                  border: 'none', color: tx, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Menu size={20} />
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: tx, margin: 0, letterSpacing: '-0.02em' }}>
                {activeSection === 'dashboard' && 'Dashboard'}
                {activeSection === 'assignments' && 'Topshiriqlar'}
                {activeSection === 'grading' && 'Baholash'}
                {activeSection === 'groups' && 'Guruhlar'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: mu, cursor: 'pointer', position: 'relative' }}>
                <Bell size={18} />
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%',
                }} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-only nav-btn"
                style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: tx, cursor: 'pointer' }}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0,
              background: card, borderBottom: `1px solid ${bord}`,
              padding: '16px', zIndex: 50, boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: tx }}>Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px', background: 'transparent', border: 'none', color: mu, cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {sectionTabs.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => { setActiveSection(section.id); setMobileMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '16px 20px', borderRadius: '10px', border: 'none',
                        background: isActive ? `linear-gradient(135deg,${BRAND},${BRAND_LIGHT})` : 'transparent',
                        color: isActive ? 'white' : tx, cursor: 'pointer',
                        fontSize: '14px', fontWeight: 500,
                      }}
                    >
                      <Icon size={18} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { localStorage.removeItem('accessToken'); navigate('/teacher-login'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px', borderRadius: '10px', border: 'none', marginTop: '12px',
                  background: D ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.1)',
                  color: D ? '#fca5a5' : '#ef4444', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500,
                }}
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          )}

          {/* CONTENT AREA */}
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <RotateCw size={40} color={BRAND} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* ── DASHBOARD ── */}
                {activeSection === 'dashboard' && (
                  <div className="animate-fade">
                    {/* Attendance */}
                    <div style={{ background: card, borderRadius: '16px', padding: '24px', border: `1px solid ${bord}`, marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: tx, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={20} color={BRAND} />
                        Bugungi Davomat
                      </h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '16px', marginBottom: '20px' }}>
                        {[
                          { label: 'Keldi',   value: attendanceStats.present, color: '#22c55e', icon: CheckCircle },
                          { label: 'Kelmadi', value: attendanceStats.absent,  color: '#ef4444', icon: X         },
                          { label: 'Kechikdi',value: attendanceStats.late,    color: '#f59e0b', icon: Clock      },
                          { label: 'Jami',    value: attendanceStats.total,   color: BRAND,     icon: Users      },
                        ].map(({ label, value, color, icon: Icon }) => (
                          <div key={label} style={{ padding: '20px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}30`, textAlign: 'center' }}>
                            <Icon size={28} style={{ color, marginBottom: '12px' }} />
                            <p style={{ fontSize: '32px', fontWeight: 700, color, margin: 0 }}>{value}</p>
                            <p style={{ fontSize: '12px', fontWeight: 500, color: mu, margin: '4px 0 0 0' }}>{label}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: `1px solid ${bord}` }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: mu }}>Davomat foizi</p>
                          <p style={{ fontSize: '28px', fontWeight: 700, color: tx, margin: '4px 0 0 0' }}>{attendanceStats.rate}%</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingUp size={20} color={BRAND} />
                          <span style={{ fontSize: '13px', color: mu }}>
                            {attendanceStats.rate >= 80 ? "A'lo" : attendanceStats.rate >= 60 ? 'Yaxshi' : 'Yaxshilanadi'}
                          </span>
                        </div>
                      </div>
                    </div>

                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '16px' }}>
                
                      <div style={{ background: card, borderRadius: '16px', padding: '20px', border: `1px solid ${bord}` }} className="card-hover">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color={BRAND} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: mu }}>Jami o'quvchilar</p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: tx }}>
                              {groups.reduce((t, g) => t + (g.students?.length || g.currentStudents || 0), 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Active groups */}
                      <div style={{ background: card, borderRadius: '16px', padding: '20px', border: `1px solid ${bord}` }} className="card-hover">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={20} color="#22c55e" />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: mu }}>Faol guruhlar</p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: tx }}>{groups.filter(g => g.status === 'active').length}</p>
                          </div>
                        </div>
                      </div>
                      {/* Pending grading */}
                      <div style={{ background: card, borderRadius: '16px', padding: '20px', border: `1px solid ${bord}` }} className="card-hover">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={20} color="#f59e0b" />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: mu }}>Baholash kutilmoqda</p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: tx }}>{submissions.filter(s => !s.graded).length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ASSIGNMENTS ── */}
                {activeSection === 'assignments' && (
                  <div className="animate-fade">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: tx }}>Mening Topshiriqlarim</h2>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={16} />
                        Yaratish
                      </button>
                    </div>

                    {assignments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 20px', background: card, borderRadius: '16px', border: `1px solid ${bord}` }}>
                        <FileText size={48} color={mu} style={{ marginBottom: '16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Hozircha topshiriqlar yo'q</p>
                        <p style={{ fontSize: '14px', color: mu }}>Yangi topshiriq yaratish uchun "Yaratish" tugmasini bosing</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
                        {assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            style={{ background: bgItem, borderRadius: '16px', padding: '20px', border: `1px solid ${bord}`, cursor: 'pointer' }}
                            className="card-hover"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              loadSubmissions(assignment.id);
                              setActiveSection('grading');
                            }}
                          >
                            {/* Title row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, color: tx, margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '8px' }}>
                                {assignment.title}
                              </h3>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteAssignment(assignment.id); }}
                                style={{ padding: '6px', borderRadius: '6px', background: D ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.1)', border: 'none', color: D ? '#fca5a5' : '#ef4444', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Meta */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color={mu} />
                                <span style={{ fontSize: '12px', color: mu }}>{assignment.dueDate || 'Belgilanmagan'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BookOpen size={14} color={mu} />
                                <span style={{ fontSize: '12px', color: mu }}>{assignment.points || 100} ball</span>
                              </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '3px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px' }} />

                            {/* Description */}
                            <p style={{
                              fontSize: '13px', color: mu, lineHeight: 1.5,
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {assignment.description || "Tavsif yo'q"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── GRADING ── */}
                {activeSection === 'grading' && (
                  <div className="animate-fade">
                    {!selectedAssignment ? (
                      <div style={{ textAlign: 'center', padding: '60px 20px', background: card, borderRadius: '16px', border: `1px solid ${bord}` }}>
                        <CheckCircle size={48} color={mu} style={{ marginBottom: '16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Topshiriq tanlanmagan</p>
                        <p style={{ fontSize: '14px', color: mu }}>Baholash uchun "Topshiriqlar" bo'limidan birini tanlang</p>
                        <button
                          onClick={() => setActiveSection('assignments')}
                          className="btn-primary"
                          style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}
                        >
                          Topshiriqlarga o'tish
                        </button>
                      </div>
                    ) : (
                      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <button
                          onClick={() => setActiveSection('assignments')}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: `1px solid ${bord}`, background: 'transparent', color: tx, cursor: 'pointer', fontSize: '13px', fontWeight: 500, marginBottom: '20px' }}
                        >
                          <span style={{ fontSize: '16px' }}>←</span>
                          Orqaga qaytish
                        </button>

                        <div style={{ background: card, borderRadius: '16px', padding: '24px', border: `1px solid ${bord}`, marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <h2 style={{ fontSize: '20px', fontWeight: 700, color: tx, marginBottom: '8px' }}>{selectedAssignment.title}</h2>
                              <p style={{ fontSize: '13px', color: mu }}>{selectedAssignment.description}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '12px', color: mu, marginBottom: '4px' }}>Ball: {selectedAssignment.points || 100}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color={mu} />
                                <span style={{ fontSize: '12px', color: mu }}>{selectedAssignment.dueDate || 'Belgilanmagan'}</span>
                              </div>
                            </div>
                          </div>

                          <h3 style={{ fontSize: '16px', fontWeight: 600, color: tx, marginBottom: '16px' }}>
                            Topshiriq yuborilgan ({submissions.length})
                          </h3>

                          {submissions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: D ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '12px' }}>
                              <CheckCircle size={32} color={mu} style={{ marginBottom: '12px' }} />
                              <p style={{ fontSize: '14px', color: mu }}>Hali topshiriq yuborilmagan</p>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                              {submissions.map((submission) => (
                                <div key={submission.id} style={{ background: bgItem, borderRadius: '12px', padding: '16px', border: `1px solid ${bord}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'rgba(99,102,241,0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px', fontWeight: 700, color: BRAND,
                                      }}>
                                        {(submission.studentName || "O'quvchi")[0].toUpperCase()}
                                      </div>
                                      <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: tx, margin: 0 }}>{submission.studentName || "O'quvchi"}</p>
                                        <p style={{ fontSize: '12px', color: mu, margin: 0 }}>{new Date(submission.submittedAt).toLocaleDateString('uz-UZ')}</p>
                                      </div>
                                    </div>
                                    {submission.graded && (
                                      <div style={{
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                                        background: submission.points >= 80 ? 'rgba(34,197,94,0.1)' : submission.points >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                        color: submission.points >= 80 ? '#22c55e' : submission.points >= 60 ? '#f59e0b' : '#ef4444',
                                      }}>
                                        {submission.points} ball
                                      </div>
                                    )}
                                  </div>

                                  <p style={{ fontSize: '13px', color: tx, lineHeight: 1.5, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                                    {submission.content}
                                  </p>

                                  {!submission.graded && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      <input
                                        id={`grade-${submission.id}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Ball (0-100)"
                                        className="input-field"
                                        style={{ width: '130px', padding: '8px 12px', borderRadius: '8px' }}
                                      />
                                      <button
                                        onClick={() => {
                                          const input = document.getElementById(`grade-${submission.id}`);
                                          if (input && input.value) gradeSubmission(selectedAssignment.id, submission.id, input.value);
                                        }}
                                        className="btn-primary"
                                        style={{ padding: '8px 16px', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                                      >
                                        Baholash
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── GROUPS ── */}
                {activeSection === 'groups' && (
                  <div className="animate-fade">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: tx }}>Mening Guruhlarim</h2>
                      <p style={{ fontSize: '14px', color: mu }}>{groups.length} ta guruh</p>
                    </div>

                    {groups.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 20px', background: card, borderRadius: '16px', border: `1px solid ${bord}` }}>
                        <Layers size={48} color={mu} style={{ marginBottom: '16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Sizda hali guruhlar yo'q</p>
                        <p style={{ fontSize: '14px', color: mu }}>Admin tomondan guruh yaratilishi mumkin</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
                        {groups.map((group) => {
                          const studentsCount = group.students?.length || group.currentStudents || 0;
                          const maxStudents   = group.maxStudents || 20;
                          const spotsLeft     = maxStudents - studentsCount;
                          const isFull        = spotsLeft <= 0;
                          const progress      = maxStudents > 0 ? Math.round((studentsCount / maxStudents) * 100) : 0;

                          return (
                            <div key={group.id} style={{ background: bgItem, borderRadius: '16px', padding: '20px', border: `1px solid ${bord}` }} className="card-hover">
                              {/* Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                <div style={{
                                  width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                                  background: `linear-gradient(135deg,${BRAND},${BRAND_LIGHT})`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontSize: '16px', fontWeight: 700,
                                }}>
                                  {group.name?.substring(0, 2)?.toUpperCase() || 'GR'}
                                </div>
                                <span style={{
                                  padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                  background: group.status === 'active' ? '#22c55e' : '#ef4444', color: 'white',
                                }}>
                                  {group.status === 'active' ? 'FAOL' : 'NOFAOL'}
                                </span>
                              </div>

                              <h3 style={{ fontSize: '18px', fontWeight: 700, color: tx, marginBottom: '12px' }}>{group.name}</h3>

                              {/* Course */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <BookOpen size={16} color={mu} />
                                <span style={{ fontSize: '13px', color: mu }}>{group.courseTitle || group.course?.title || 'Kurs'}</span>
                              </div>

                              {/* Students count */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Users size={16} color={mu} />
                                <span style={{ fontSize: '13px', color: mu }}>
                                  {studentsCount}/{maxStudents} o'quvchi
                                  {isFull && (
                                    <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                      TO'LIQ
                                    </span>
                                  )}
                                </span>
                              </div>

                              {/* Time slot */}
                              {group.timeSlot && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <Clock size={16} color={mu} />
                                  <span style={{ fontSize: '13px', color: mu }}>{group.timeSlot}</span>
                                </div>
                              )}

                              {/* Dates */}
                              {group.startDate && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: D ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                                  <Calendar size={14} color={BRAND} />
                                  <span style={{ fontSize: '12px', color: mu }}>
                                    {new Date(group.startDate).toLocaleDateString('uz-UZ')}
                                    {group.endDate && ` - ${new Date(group.endDate).toLocaleDateString('uz-UZ')}`}
                                  </span>
                                </div>
                              )}

                              {/* Progress */}
                              <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: mu, marginBottom: '6px' }}>Joy egalligi</p>
                                <div className="progress-bar" style={{ height: '8px' }}>
                                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <div style={{ marginTop: '6px', fontSize: '12px', color: mu, display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{progress}%</span>
                                  <span style={{ color: isFull ? '#ef4444' : progress >= 80 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>
                                    {isFull ? "To'liq" : spotsLeft < 5 ? 'Ostona' : spotsLeft < 10 ? 'Kam joy' : "Ko'p joy bor"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── CREATE MODAL ── */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}>
            <div style={{ background: card, borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', padding: '24px', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${bord}`, paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: tx, marginBottom: '4px' }}>Yangi Topshiriq Yaratish</h3>
                  <p style={{ fontSize: '13px', color: mu }}>O'quvchilarga topshiriq berish</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', color: mu, cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Topshiriq nomi</label>
                  <input
                    required
                    placeholder="Topshiriq nomini kiriting..."
                    className="input-field"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Tavsif</label>
                  <textarea
                    required
                    placeholder="Topshiriq tavsifini kiriting..."
                    className="input-field"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Guruh</label>
                    <select
                      required
                      className="input-field"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                      value={form.groupId}
                      onChange={e => setForm({ ...form, groupId: e.target.value })}
                    >
                      <option value="">Guruhni tanlang</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name} ({g.currentStudents || 0}/{g.maxStudents || 20})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Muddat</label>
                    <input
                      required
                      type="date"
                      className="input-field"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: tx, marginBottom: '8px' }}>Ball (0-100)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Maksimum ball"
                    className="input-field"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                    value={form.points}
                    onChange={e => setForm({ ...form, points: parseInt(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="btn-primary"
                    style={{ flex: 2, padding: '12px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                  >
                    {modalLoading ? 'Saqlanmoqda...' : 'Yaratish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}