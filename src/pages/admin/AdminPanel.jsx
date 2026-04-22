import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Users, BookOpen, Layers, GraduationCap,
  CreditCard, UserPlus, RotateCw, TrendingUp,
  ChevronRight, X,
  CheckCircle, XCircle, BarChart2,
  Filter, MoreHorizontal,
  Clock, Award, Calendar,
  ArrowUpRight, ArrowDownRight, Plus,
} from 'lucide-react';

/* ─── Auth guard ─────────────────────────────────────────── */
const useRequireAuth = (requiredRole) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== requiredRole) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user?.role, isLoading, navigate]);
  return { isAuthenticated, user };
};

/* ─── Constants ──────────────────────────────────────────── */
const B  = '#427A43';
const BL = '#5a9e5b';
const BD = '#2d5630';
const fmt = n => new Intl.NumberFormat('uz-UZ').format(n ?? 0);

const DAYS_OF_WEEK = [
  { name: 'Dushanba', short: 'Dush' },
  { name: 'Seshanba', short: 'Sesh' },
  { name: 'Chorshanba', short: 'Chor' },
  { name: 'Payshanba', short: 'Pay' },
  { name: 'Juma', short: 'Juma' },
  { name: 'Shanba', short: 'Shan' },
  { name: 'Yakshanba', short: 'Yak' },
];

/* ─── Spinner ────────────────────────────────────────────── */
const Spin = ({ size = 28, color = B }) => (
  <RotateCw size={size} color={color} style={{ animation: 'spin .9s linear infinite' }} />
);

/* ═════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════ */
export default function AdminPanel() {
  const { isAuthenticated, user, isLoading } = useRequireAuth('admin');

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f12', gap: 12 }}>
        <Spin size={30} />
        <p style={{ color: '#fff' }}>Ruxsat tekshirilmoqda...</p>
      </div>
    );
  }

  return <Dashboard />;
}

/* ═════════════════════════════════════════════════════════
   DASHBOARD (renders only when auth is confirmed)
═════════════════════════════════════════════════════════════ */
function Dashboard() {
  const { isDarkMode: D } = useTheme();
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [stats, setStats] = useState({
    students: { total: 0, active: 0 },
    teachers: { total: 0, active: 0 },
    groups: { total: 0, active: 0 },
    courses: { total: 0, active: 0 },
    attendance: { total: 0, present: 0, absent: 0, late: 0 },
    teacherFinance: { totalBalance: 0, monthlyEarnings: 0, studentBalance: 0, lessonPrice: 0, commissionPercent: 0 },
    studentFinance: { totalPayments: 0, lessonPayments: [] },
  });
  const [toast, setToast] = useState(null);

  /* ── Helpers ───────────────────────────────────────────── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch functions ───────────────────────────────────── */
  const fetchGroups = useCallback(async () => {
    try {
      const r = await apiService.getGroups();
      const d = Array.isArray(r) ? r : r?.groups ?? [];
      setGroups(d);
    } catch (e) { console.error('Groups:', e); }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const r = await apiService.getStudents();
      setStudents(Array.isArray(r) ? r : r?.students ?? []);
    } catch (e) { console.error('Students:', e); }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const r = await apiService.getTeachers();
      setTeachers(Array.isArray(r) ? r : r?.teachers ?? []);
    } catch (e) { console.error('Teachers:', e); }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const r = await apiService.getCourses();
      const d = Array.isArray(r) ? r : r?.courses ?? [];
      setCourses(d);
    } catch (e) { console.error('Courses:', e); }
  }, []);

  const fetchAttendanceData = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const allAttendance = await apiService.getAttendances();
      const attendanceList = Array.isArray(allAttendance) ? allAttendance : (allAttendance?.data || []);

      // Bugungi davomatni olish
      const todayAttendance = attendanceList.filter(a => a.date === today);

      // Umumiy statistika hisoblash
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;

      todayAttendance.forEach(record => {
        if (record.attendanceData && Array.isArray(record.attendanceData)) {
          record.attendanceData.forEach(ar => {
            if (ar.status === 'present') totalPresent++;
            else if (ar.status === 'absent') totalAbsent++;
            else if (ar.status === 'late') totalLate++;
          });
        }
      });

      setAttendanceData(todayAttendance);
      setStats(prev => ({
        ...prev,
        attendance: {
          total: totalPresent + totalAbsent + totalLate,
          present: totalPresent,
          absent: totalAbsent,
          late: totalLate
        }
      }));
    } catch (e) {
      console.error('Attendance fetch error:', e);
      setAttendanceData([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  const fetchFinanceData = useCallback(async () => {
    try {
      // Fetch teacher financial data
      let totalTeacherBalance = 0;
      let totalMonthlyEarnings = 0;
      let teacherLessonPrice = 0;

      // Get data for each teacher
      for (const teacher of teachers) {
        try {
          const teacherId = teacher.id || teacher.teacherId;
          if (teacherId) {
            const earningsData = await apiService.getTeacherEarnings(teacherId).catch(() => null);
            if (earningsData) {
              totalTeacherBalance += earningsData.totalEarnings || 0;
              totalMonthlyEarnings += earningsData.monthlyEarnings || 0;
            }
          }
        } catch (err) {
          console.error(`Error fetching earnings for teacher ${teacher.id}:`, err);
        }
      }

      // Calculate lesson price from groups
      if (groups.length > 0) {
        const firstGroup = groups[0];
        const monthlyPrice = firstGroup.monthlyPrice || 0;
        const lessonsPerMonth = firstGroup.lessonsPerMonth || 8;
        teacherLessonPrice = Math.round(monthlyPrice / lessonsPerMonth);
      }

      // Fetch student payment data
      let totalStudentPayments = 0;
      let lessonPayments = [];

      try {
        const allPayments = await apiService.getPayments().catch(() => []);
        const paymentsList = Array.isArray(allPayments) ? allPayments : (allPayments?.payments || []);

        // Filter lesson payments
        lessonPayments = paymentsList.filter(p => p.typeId === 'LESSON' || p.description?.includes('Dars'));
        totalStudentPayments = lessonPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      } catch (err) {
        console.error('Error fetching student payments:', err);
      }

      setStats(prev => ({
        ...prev,
        teacherFinance: {
          totalBalance: totalTeacherBalance,
          monthlyEarnings: totalMonthlyEarnings,
          studentBalance: 0, // Will be calculated from student data
          lessonPrice: teacherLessonPrice,
          commissionPercent: 20, // Default commission percentage
        },
        studentFinance: {
          totalPayments: totalStudentPayments,
          lessonPayments: lessonPayments,
        },
      }));
    } catch (e) {
      console.error('Finance fetch error:', e);
    }
  }, [teachers, groups]);

 
  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchGroups(), fetchStudents(), fetchTeachers(), fetchCourses(), fetchAttendanceData()]);
    setLoading(false);
  }, [fetchGroups, fetchStudents, fetchTeachers, fetchCourses, fetchAttendanceData]);

  // Fetch finance data when teachers and groups are loaded
  useEffect(() => {
    if (teachers.length > 0 && groups.length > 0) {
      fetchFinanceData();
    }
  }, [teachers, groups, fetchFinanceData]);

  /* ── Effects ───────────────────────────────────────────── */
useEffect(() => {
  const init = async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchGroups(), fetchStudents(), fetchTeachers(), fetchCourses()
    ]);
    setLoading(false);
  };
  init();
}, []); // ← faqat bitta marta// ✅ TO'G'RI - groups ni parameter sifatida oling
const fetchScheduleData = useCallback(async (activeGroups) => {
  if (!activeGroups?.length) return;
  setLoadingSchedule(true);
  try {
    const year = selectedWeek.getFullYear();
    const month = selectedWeek.getMonth() + 1;

    const results = await Promise.all(
      activeGroups
        .filter(g => g.status === 'active')
        .map(async (group) => {
          try {
            const calendarData = await apiService.getGroupAttendanceCalendar(
              group.id, year, month
            );
            return { group, calendar: calendarData || [] };
          } catch {
            return { group, calendar: [] }; // 500 xatoni yutib yuborish
          }
        })
    );
    setScheduleData(results);
  } catch (e) {
    console.error('Schedule fetch error:', e);
    setScheduleData([]);
  } finally {
    setLoadingSchedule(false);
  }
}, [selectedWeek]); // ← faqat selectedWeek

// groups tayyor bo'lganda schedule yuklash
useEffect(() => {
  if (groups.length > 0) {
    fetchScheduleData(groups); // ← groups ni parameter sifatida uzatish
  }
}, [groups, fetchScheduleData]);
useEffect(() => {
  setStats(prev => ({           // ← spread previous state
    ...prev,                    // ← keeps attendance intact
    students: { total: students.length, active: students.filter(s => s.status === 'active').length },
    teachers: { total: teachers.length, active: teachers.filter(t => t.status === 'active').length },
    groups:   { total: groups.length,   active: groups.filter(g => g.status === 'active').length   },
    courses:  { total: courses.length,  active: courses.filter(c => c.status === 'active').length  },
  }));
}, [students, teachers, groups, courses]);

  /* ── Theme tokens ──────────────────────────────────────── */
  const bg   = D ? '#0f0f12'            : '#f5f6fa';
  const card = D ? 'rgba(22,22,28,0.96)': '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const tx   = D ? '#f5f5f7'            : '#18181b';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';

  /* ── Loading screen ────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
      <Spin size={28} />
    </div>
  );

  /* ─────────────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Global styles ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family:'Plus Jakarta Sans',sans-serif; box-sizing:border-box; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .adp-root { -webkit-font-smoothing:antialiased; }
        .adp-card-hover { transition:transform .2s,box-shadow .2s; cursor:pointer; }
        .adp-card-hover:hover { transform:translateY(-2px); }
        .adp-row-hover:hover  { background:rgba(66,122,67,0.04) !important; }
        .adp-qa:hover         { background:rgba(66,122,67,0.06) !important; }
        ::-webkit-scrollbar       { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(66,122,67,0.18); border-radius:99px; }
      `}</style>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '12px 18px', borderRadius: 14,
          background: toast.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)', animation: 'slideUp .25s ease both',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={14} color="#22c55e" />
            : <XCircle    size={14} color="#ef4444" />}
          <span style={{ fontSize: 13, fontWeight: 600, color: toast.type === 'success' ? '#22c55e' : '#ef4444' }}>
            {toast.msg}
          </span>
        </div>
      )}

      {/* ── Root ──────────────────────────────────────────── */}
      <div className="adp-root" style={{ background: bg, minHeight: '100%', animation: 'fadeIn .4s ease both' }}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <div style={{ padding: '22px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: tx, letterSpacing: '-0.02em' }}>Admin Dashboard</p>
            <p style={{ fontSize: 12, color: mu, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <BarChart2 size={11} color={B} />
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={fetchData} style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${bord}`, background: card,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
            }}>
              <RotateCw size={14} />
            </button>
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────── */}
        <div style={{ padding: '18px 28px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── WEEK SELECTOR & DARS JADVALI HEADER ──────────────── */}
          <div style={{
            background: card, border: `1px solid ${bord}`, borderRadius: 20,
            padding: '22px 24px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'slideUp .4s ease .0s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: tx, letterSpacing: '-0.01em' }}>Dars jadvali</p>
                <p style={{ fontSize: 11, color: mu, marginTop: 3 }}>
                  {selectedWeek.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => {
                  const prevWeek = new Date(selectedWeek);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setSelectedWeek(prevWeek);
                }} style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${bord}`, background: card,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
                }}>
                  <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button onClick={() => setSelectedWeek(new Date())} style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${bord}`, background: card,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
                  fontSize: 11, fontWeight: 600,
                }}>
                  Bugun
                </button>
                <button onClick={() => {
                  const nextWeek = new Date(selectedWeek);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedWeek(nextWeek);
                }} style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${bord}`, background: card,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
                }}>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => fetchScheduleData(groups)} style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${bord}`, background: card,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
                }}>
                  <RotateCw size={14} style={loadingSchedule ? { animation: 'spin .9s linear infinite' } : {}} />
                </button>
              </div>
            </div>

            {/* Hafta kunlari */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {DAYS_OF_WEEK.map((dayInfo, index) => {
                const currentDate = new Date(selectedWeek);
                const dayOfWeek = currentDate.getDay();
                const isToday = (index + 1) % 7 === dayOfWeek;
                const targetDate = new Date(currentDate);
                const diff = index - ((dayOfWeek + 6) % 7);
                targetDate.setDate(currentDate.getDate() + diff);

                return (
                  <div key={dayInfo.name} style={{
                    minWidth: 140, flexShrink: 0,
                    padding: '12px 16px', borderRadius: 12,
                    background: isToday ? `${BD}20` : card,
                    border: `1px solid ${isToday ? B : bord}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }} onMouseEnter={e => !isToday && (e.currentTarget.style.transform = 'translateY(-2px)')}
                     onMouseLeave={e => !isToday && (e.currentTarget.style.transform = 'translateY(0)')}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: isToday ? B : mu, marginBottom: 6, textAlign: 'center' }}>{dayInfo.name}</p>
                    <p style={{ fontSize: 10, color: mu, textAlign: 'center' }}>{targetDate.getDate()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── STAT CARDS ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
            {[
              { icon: GraduationCap, label: "O'quvchilar", value: stats.students.total, sub: `${stats.students.active} ta faol`, color: B,        path: '/admin-students' },
              { icon: Users,         label: "O'qituvchilar", value: stats.teachers.total, sub: `${stats.teachers.active} ta faol`, color: '#3b82f6', path: '/teachers' },
              { icon: Layers,        label: "Guruhlar",      value: stats.groups.total,  sub: `${stats.groups.active} ta faol`,   color: '#8b5cf6', path: '/groups' },
              { icon: BookOpen,       label: "Kurslar",        value: stats.courses.total,  sub: `${stats.courses.active} ta faol`,  color: '#e57373', path: '/courses' },
            ].map((s, i) => (
              <div key={i} onClick={() => navigate(s.path)} style={{
                padding: 20, borderRadius: 16, background: card, border: `1px solid ${bord}`,
                cursor: 'pointer', transition: 'all 0.2s', animation: `slideUp .4s ease ${i * 0.07}s both`,
                boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: `${s.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <s.icon size={20} color={s.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: tx, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: mu, marginBottom: 0 }}>{s.label}</p>
                    <p style={{ fontSize: 10, color: mu, marginTop: 2 }}>{s.sub}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: mu }}>Batafsil ko'rish</span>
                  <ChevronRight size={14} color={B} />
                </div>
              </div>
            ))}
          </div>

          {/* ── DARS JADVALI TABLE ──────────────────────────────── */}
          <div style={{
            background: card, border: `1px solid ${bord}`, borderRadius: 20,
            padding: '24px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'slideUp .4s ease .1s both',
          }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em', marginBottom: 18 }}>
              Hafta dars jadvali
            </p>

            {loadingSchedule ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <RotateCw size={32} color={B} style={{ animation: 'spin .9s linear infinite', marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: mu }}>Dars jadvali yuklanmoqda...</p>
                </div>
              </div>
            ) : scheduleData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: mu }}>
                <Calendar size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>Faol darslar topilmadi</p>
                <button onClick={() => navigate('/groups')} style={{
                  marginTop: 16, padding: '10px 20px', borderRadius: 10,
                  background: `linear-gradient(135deg,${BD},${BL})`,
                  border: 'none', fontSize: 12, fontWeight: 700, color: '#fff',
                  cursor: 'pointer',
                }}>
                  Guruhlar yaratish
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {scheduleData.map((groupSchedule, groupIndex) => (
                  <div key={groupSchedule.group.id} style={{
                    background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa',
                    border: `1px solid ${bord}`, borderRadius: 12,
                    padding: '16px', transition: 'all 0.2s',
                  }}>
                    {/* Guruh header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `linear-gradient(135deg,${BD},${BL})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(66,122,67,0.28)',
                        }}>
                          <Layers size={16} color="#fff" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: tx }}>{groupSchedule.group.name}</p>
                          <p style={{ fontSize: 11, color: mu }}>
                            {groupSchedule.group.currentStudents || 0} / {groupSchedule.group.maxStudents || 20} o'quvchi
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6, background: groupSchedule.group.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)', color: groupSchedule.group.status === 'active' ? '#22c55e' : '#94a3b8' }}>
                          {groupSchedule.group.status === 'active' ? 'Faol' : 'Nofaol'}
                        </span>
                        <button onClick={() => navigate(`/groups`)} style={{
                          padding: '5px 10px', borderRadius: 8,
                          background: D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)', color: B,
                          border: `1px solid ${D ? 'rgba(66,122,67,0.25)' : 'rgba(66,122,67,0.18)'}`, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        }}>
                          Batafsil
                        </button>
                      </div>
                    </div>

                    {/* Dars jadvali - kun vaqtlar */}
                    {groupSchedule.calendar && groupSchedule.calendar.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10 }}>
                        {groupSchedule.calendar.slice(0, 7).map((classItem, classIndex) => (
                          <div key={classIndex} style={{
                            padding: '14px 16px', borderRadius: 10,
                            background: D ? 'rgba(255,255,255,0.03)' : '#f8faf8',
                            border: `1px solid ${bord}`, display: 'flex', flexDirection: 'column', gap: 8,
                            transition: 'all 0.2s',
                          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                             onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: `linear-gradient(135deg,${BD},${BL})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Clock size={14} color="#fff" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: tx, marginBottom: 2 }}>
                                  {DAYS_OF_WEEK[classIndex % 7]?.name}, {classItem.day}/{classItem.month}
                                </p>
                                <p style={{ fontSize: 11, color: mu }}>
                                  {classItem.time || '14:00 - 16:00'}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: `${BD}15`, color: B, fontWeight: 600 }}>
                                {classIndex + 1}-dars
                              </span>
                              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: '#3b82f620', color: '#3b82f6', fontWeight: 600 }}>
                                {classItem.topic || classItem.description || 'Dars mavzusi'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: mu, lineHeight: 1.4 }}>
                              <p>O'qituvchi: <span style={{ fontWeight: 600, color: tx }}>{groupSchedule.group.teacher?.user?.name || groupSchedule.group.teacher?.name || 'Belgilanmagan'}</span></p>
                              <p>Xona: <span style={{ fontWeight: 600, color: tx }}>{classItem.room || '2-xona'}</span></p>
                              <p>Kurs: <span style={{ fontWeight: 600, color: tx }}>{groupSchedule.group.course?.title || groupSchedule.group.courseTitle || 'React va Next.js'}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: mu, background: D ? 'rgba(255,255,255,0.01)' : '#f8faf8', borderRadius: 8 }}>
                        <p style={{ fontSize: 12 }}>Bu hafta darslar belgilanmagan</p>
                        <button onClick={() => navigate(`/attendance?groupId=${groupSchedule.group.id}`)} style={{
                          marginTop: 12, padding: '8px 16px', borderRadius: 10,
                          background: `linear-gradient(135deg,${BD},${BL})`,
                          border: 'none', fontSize: 11, fontWeight: 700, color: '#fff',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          Davomat belgilash
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ATTENDANCE STATISTICS ────────────────────────────── */}
          <div style={{
            background: card, border: `1px solid ${bord}`, borderRadius: 20,
            padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'slideUp .4s ease .3s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: tx, marginBottom: 3, letterSpacing: '-0.01em' }}>Bugungi davomat</p>
                <p style={{ fontSize: 11, color: mu }}>
                  {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={fetchAttendanceData} style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${bord}`, background: card,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
              }}>
                <RotateCw size={14} style={loadingAttendance ? { animation: 'spin .9s linear infinite' } : {}} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
              {[
                { label: "Jami", value: stats.attendance.total, color: tx, bg: D ? 'rgba(255,255,255,0.05)' : '#f8faf8' },
                { label: "Keldi", value: stats.attendance.present, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                { label: "Kelmadi", value: stats.attendance.absent, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
                { label: "Kechikdi", value: stats.attendance.late, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '16px', borderRadius: 12, background: s.bg,
                  border: `1px solid ${bord}`, display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'all 0.2s',
                }}>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: mu }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Guruh bo'yicha davomat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: tx, marginBottom: 4 }}>Guruh bo'yicha davomat</p>
              {attendanceData.length === 0 ? (
                <div style={{
                  padding: '20px', textAlign: 'center',
                  background: D ? 'rgba(255,255,255,0.02)' : '#f8faf8',
                  borderRadius: 10, color: mu, border: `1px solid ${bord}`
                }}>
                  <Calendar size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p style={{ fontSize: 12 }}>Bugungi davomat ma'lumotlari yo'q</p>
                </div>
              ) : (
                attendanceData.map((attendanceRecord, index) => {
                  const group = groups.find(g => g.id === attendanceRecord.groupId);
                  if (!group) return null;

                  const presentCount = attendanceRecord.attendanceData?.filter(a => a.status === 'present').length || 0;
                  const absentCount = attendanceRecord.attendanceData?.filter(a => a.status === 'absent').length || 0;
                  const lateCount = attendanceRecord.attendanceData?.filter(a => a.status === 'late').length || 0;
                  const totalStudents = presentCount + absentCount + lateCount;
                  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

                  return (
                    <div key={attendanceRecord.id || index} style={{
                      padding: '16px', borderRadius: 12,
                      background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa',
                      border: `1px solid ${bord}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `linear-gradient(135deg,${BD},${BL})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Layers size={18} color="#fff" />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: tx, marginBottom: 2 }}>
                            {group.name}
                          </p>
                          <p style={{ fontSize: 10, color: mu }}>
                            {presentCount}/{totalStudents} o'quvchi · {attendanceRate}% ishtirok
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{
                          padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <CheckCircle size={12} color="#22c55e" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>{presentCount}</span>
                        </div>
                        <div style={{
                          padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <XCircle size={12} color="#ef4444" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>{absentCount}</span>
                        </div>
                        <div style={{
                          padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)',
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <Clock size={12} color="#f59e0b" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>{lateCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── FINANCIAL STATISTICS ────────────────────────────── */}
          <div style={{
            background: card, border: `1px solid ${bord}`, borderRadius: 20,
            padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'slideUp .4s ease .4s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: tx, marginBottom: 3, letterSpacing: '-0.01em' }}>Moliyaviy hisobot</p>
                <p style={{ fontSize: 11, color: mu }}>
                  O'qituvchi va o'quvchi to'lovlari
                </p>
              </div>
              <button onClick={fetchFinanceData} style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${bord}`, background: card,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: B,
              }}>
                <RotateCw size={14} />
              </button>
            </div>

            {/* Teacher Finance Section */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: tx, marginBottom: 10 }}>O'qituvchi daromadlari</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { label: "Jami balans", value: `${fmt(stats.teacherFinance.totalBalance)} so'm`, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                  { label: "Oylik daromad", value: `${fmt(stats.teacherFinance.monthlyEarnings)} so'm`, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                  { label: "Dars narxi", value: `${fmt(stats.teacherFinance.lessonPrice)} so'm`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                  { label: "Komissiya", value: `${stats.teacherFinance.commissionPercent}%`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '16px', borderRadius: 12, background: s.bg,
                    border: `1px solid ${bord}`, display: 'flex', flexDirection: 'column', gap: 6,
                    transition: 'all 0.2s',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: mu }}>{s.label}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Finance Section */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: tx, marginBottom: 10 }}>O'quvchi to'lovlari</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { label: "Jami to'lovlar", value: `${fmt(stats.studentFinance.totalPayments)} so'm`, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                  { label: "Dars to'lovlari", value: stats.studentFinance.lessonPayments.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '16px', borderRadius: 12, background: s.bg,
                    border: `1px solid ${bord}`, display: 'flex', flexDirection: 'column', gap: 6,
                    transition: 'all 0.2s',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: mu }}>{s.label}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Lesson Payments */}
              {stats.studentFinance.lessonPayments.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: mu, marginBottom: 8 }}>So'nggi dars to'lovlari</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stats.studentFinance.lessonPayments.slice(0, 5).map((payment, index) => (
                      <div key={index} style={{
                        padding: '12px', borderRadius: 8,
                        background: D ? 'rgba(255,255,255,0.02)' : '#f8faf8',
                        border: `1px solid ${bord}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: tx }}>
                            {payment.description || 'Dars to\'lovi'}
                          </p>
                          <p style={{ fontSize: 10, color: mu }}>
                            {new Date(payment.date || payment.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
                          {fmt(payment.amount)} so'm
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── QUICK ACTIONS ──────────────────────────────────── */}
          <div style={{
            background: card, border: `1px solid ${bord}`, borderRadius: 20,
            padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'slideUp .4s ease .2s both',
          }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: tx, marginBottom: 14, letterSpacing: '-0.01em' }}>Tezkor amallar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {[
                { icon: UserPlus,   label: "O'quvchi qo'shish",  onClick: () => navigate('/admin-students'),    color: B         },
                { icon: Users,      label: "O'qituvchi qo'shish", onClick: () => navigate('/teachers'),      color: '#3b82f6' },
                { icon: Layers,     label: 'Guruh yaratish',      onClick: () => navigate('/groups'),        color: '#8b5cf6' },
                { icon: BookOpen,   label: 'Kurs yaratish',      onClick: () => navigate('/courses'),       color: '#e57373' },
                { icon: CreditCard, label: "To'lovlar",           onClick: () => navigate('/admin-payments'), color: '#f59e0b' },
              ].map(({ icon: Ic, label, onClick, color }, i) => (
                <button key={i} onClick={onClick} style={{
                  border: `1px solid ${bord}`, borderRadius: 14, padding: '16px 14px', background: 'transparent',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10,
                  transition: 'background .14s,transform .18s',
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}25` }}>
                    <Ic size={16} color={color} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tx, lineHeight: 1.3 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>{/* /CONTENT */}
      </div>{/* /ROOT */}
    </>
  );
}