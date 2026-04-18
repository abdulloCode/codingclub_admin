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
  Calendar, Clock, Award,
  ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import ScoreChart from './components/ScoreChart';
import TopCard from './components/TopCard';
import Modal from './components/Modal';

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
const DAYS = ['Yak', 'Du', 'Se', 'Chor', 'Pa', 'Ju', 'Sha'];

/* ─── Spinner ────────────────────────────────────────────── */
const Spin = ({ size = 28, color = B }) => (
  <RotateCw size={size} color={color} style={{ animation: 'spin .9s linear infinite' }} />
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   DASHBOARD (renders only when auth is confirmed)
═══════════════════════════════════════════════════════════ */
function Dashboard() {
  const { isDarkMode: D } = useTheme();
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────── */
  const [stats, setStats] = useState({
    students:   { total: 0, active: 0 },
    teachers:   { total: 0, active: 0 },
    groups:     { total: 0, active: 0 },
    courses:    { total: 0, active: 0 },
    revenue:    0,
    payments:   0,
    attendance: { total: 0, present: 0, absent: 0, late: 0, rate: 0 },
  });
  const [loading,    setLoading]    = useState(true);
  const [groups,     setGroups]     = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [students,   setStudents]   = useState([]);
  const [teachers,   setTeachers]   = useState([]);
  const [period,     setPeriod]     = useState('Weekly');
  const [toast,      setToast]      = useState(null);
  const [mLoading,   setMLoading]   = useState(false);

  /* modals */
  const [sModal, setSModal] = useState(false);
  const [tModal, setTModal] = useState(false);
  const [gModal, setGModal] = useState(false);
  const [selectedTeacher,          setSelectedTeacher]          = useState(null);
  const [selectedGroupsForTeacher, setSelectedGroupsForTeacher] = useState([]);

  /* forms */
  const [sForm, setSForm] = useState({ name: '', email: '', phone: '', password: '', groupId: '', status: 'active' });
  const [tForm, setTForm] = useState({
    name: '', email: '', phone: '', password: '',
    specialization: 'Frontend Developer (React/Next.js)',
    qualification: "Oliy ma'lumotli",
    commissionPercentage: 20,
    status: 'active',
  });

  /* schedule */
  const [scheduleDay,  setScheduleDay]  = useState(DAYS[new Date().getDay()]);
  const [scheduleView, setScheduleView] = useState('xona');
  const [schedule,     setSchedule]     = useState([]);
  const [schedLoading, setSchedLoading] = useState(false);

  /* payments */
  const [payData, setPayData] = useState({ income: 0, expense: 0, list: [] });
  const [payLoading, setPayLoading] = useState(false);

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
      setGroupsList(d);
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

  const fetchSchedule = useCallback(async (day) => {
    setSchedLoading(true);
    try {
      const dayIndex = DAYS.indexOf(day);
      const r = await apiService.getAttendances({ day: dayIndex, limit: 20 });
      const list = Array.isArray(r) ? r : r?.attendances ?? [];
      setSchedule(list);
    } catch { setSchedule([]); }
    finally { setSchedLoading(false); }
  }, []);

  const fetchPayments = useCallback(async () => {
    setPayLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const r = await apiService.getPayments({ startDate: today, endDate: today, limit: 8 });
      const list = Array.isArray(r) ? r : r?.payments ?? [];
      const income  = list.filter(p => p.type === 'credit').reduce((s, p) => s + (p.amount || 0), 0);
      const expense = list.filter(p => p.type === 'debit').reduce((s, p) => s + (p.amount || 0), 0);
      setPayData({ income, expense, list: list.slice(0, 6) });
    } catch { setPayData({ income: 0, expense: 0, list: [] }); }
    finally { setPayLoading(false); }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchGroups(), fetchStudents(), fetchTeachers(), fetchPayments()]);
    setLoading(false);
  }, [fetchGroups, fetchStudents, fetchTeachers, fetchPayments]);

  /* ── Effects ───────────────────────────────────────────── */
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetchSchedule(scheduleDay);
  }, [scheduleDay, fetchSchedule]);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      students: { total: students.length, active: students.filter(s => s.status === 'active').length },
      teachers: { total: teachers.length, active: teachers.filter(t => t.status === 'active').length },
      groups:   { total: groups.length,   active: groups.filter(g => g.status === 'active').length },
    }));
  }, [students, teachers, groups]);

  /* ── Submit handlers ───────────────────────────────────── */
  const handleStudentSubmit = useCallback(async e => {
    e.preventDefault();
    setMLoading(true);
    try {
      const payload = {
        name:     sForm.name.trim(),
        email:    sForm.email.trim(),
        phone:    sForm.phone.trim(),
        password: sForm.password,
      };
      const res = await apiService.createStudent(payload);
      const studentId = res?.student?.id || res?.student?._id || res?.id || res?._id;
      if (sForm.groupId && studentId) {
        try { await apiService.assignGroupToStudent(studentId, sForm.groupId); }
        catch (err) { showToast("O'quvchi qo'shildi, lekin guruhga biriktirilmadi", 'error'); }
      }
      setSModal(false);
      showToast("O'quvchi muvaffaqiyatli qo'shildi");
      fetchStudents();
      setSForm({ name: '', email: '', phone: '', password: '', groupId: '', status: 'active' });
    } catch (err) { showToast(err.message || 'Xatolik yuz berdi', 'error'); }
    finally { setMLoading(false); }
  }, [sForm, fetchStudents]);

  const handleTeacherSubmit = useCallback(async e => {
    e.preventDefault();
    setMLoading(true);
    try {
      const payload = {
        name:                 tForm.name.trim(),
        email:                tForm.email.trim(),
        phone:                tForm.phone.trim(),
        password:             tForm.password,
        specialization:       tForm.specialization,
        qualification:        tForm.qualification,
        commissionPercentage: Number(tForm.commissionPercentage),
        status:               tForm.status,
      };
      await apiService.createTeacher(payload);
      setTModal(false);
      showToast("O'qituvchi muvaffaqiyatli qo'shildi");
      fetchTeachers();
      setTForm({ name: '', email: '', phone: '', password: '', specialization: 'Frontend Developer (React/Next.js)', qualification: "Oliy ma'lumotli", commissionPercentage: 20, status: 'active' });
    } catch (err) { showToast(err.message || 'Xatolik yuz berdi', 'error'); }
    finally { setMLoading(false); }
  }, [tForm, fetchTeachers]);

  const handleGroupAssignment = useCallback(async () => {
    if (!selectedTeacher || selectedGroupsForTeacher.length === 0) {
      showToast("Iltimos, kamida bitta guruh tanlang", 'error');
      return;
    }
    setMLoading(true);
    try {
      for (const groupId of selectedGroupsForTeacher) {
        await apiService.updateGroup(groupId, { teacherId: selectedTeacher.id });
      }
      setGModal(false);
      setSelectedTeacher(null);
      setSelectedGroupsForTeacher([]);
      showToast(`${selectedGroupsForTeacher.length} ta guruh biriktirildi`);
      fetchGroups();
    } catch (err) { showToast(err.message || 'Xatolik yuz berdi', 'error'); }
    finally { setMLoading(false); }
  }, [selectedTeacher, selectedGroupsForTeacher, fetchGroups]);

  /* ── Theme tokens ──────────────────────────────────────── */
  const bg   = D ? '#0f0f12'            : '#f5f6fa';
  const card = D ? 'rgba(22,22,28,0.96)': '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const tx   = D ? '#f5f5f7'            : '#18181b';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';
  const inpStyle = {
    background: D ? 'rgba(255,255,255,0.05)' : '#f8faf8',
    border: `1px solid ${bord}`, borderRadius: 11,
    padding: '10px 13px', color: tx, fontSize: 13,
    width: '100%', outline: 'none',
  };
  const lbl = {
    display: 'block', fontSize: 10, fontWeight: 700, color: mu,
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
  };

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
            <p style={{ fontSize: 20, fontWeight: 800, color: tx, letterSpacing: '-0.02em' }}>Dashboard</p>
            <p style={{ fontSize: 12, color: mu, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <BarChart2 size={11} color={B} />
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['Weekly', 'Monthly', 'Yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all .18s',
                background: period === p ? `linear-gradient(135deg,${BD},${BL})` : D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                color: period === p ? '#fff' : mu,
              }}>{p}</button>
            ))}
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

          {/* ── STAT CARDS ──────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
            {[
              { icon: GraduationCap, label: "Jami o'quvchilar", value: stats.students.total, sub: `${stats.students.active} ta faol`, change: '+14%', color: B,        pale: 'rgba(66,122,67,0.10)',   path: '#students' },
              { icon: BookOpen,      label: 'Kurslar',           value: stats.courses.total,  sub: `${stats.courses.active} ta faol`, change: '-5%',  color: '#e57373', pale: 'rgba(229,115,115,0.10)', path: '/courses'  },
              { icon: Clock,         label: "O'qitish vaqti",    value: 80,                   sub: '+4 soat oxirgi haftada',          change: '+9%',  color: '#3b82f6', pale: 'rgba(59,130,246,0.10)',  path: '/attendance' },
              { icon: Award,         label: 'Topshiriqlar',      value: stats.payments,       sub: `${stats.groups.active} ta vazifa`,change: '+6%',  color: '#8b5cf6', pale: 'rgba(139,92,246,0.10)',  path: '/payments' },
            ].map((s, i) => (
              <div key={i} style={{ animation: `slideUp .4s ease ${i * 0.07}s both` }}>
                <TopCard {...s} D={D} onClick={() => navigate(s.path)} />
              </div>
            ))}
          </div>

          {/* ── SCORE + RIGHT PANEL ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>

            {/* Score chart */}
            <div style={{
              background: card, border: `1px solid ${bord}`, borderRadius: 20,
              padding: '22px 24px', animation: 'slideUp .4s ease .1s both',
              boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: tx, letterSpacing: '-0.01em' }}>Baholash ko'rsatkichi</p>
                  <p style={{ fontSize: 11, color: mu, marginTop: 3 }}>O'quvchilar va kurslar baholari</p>
                </div>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <button style={{ padding: '5px 11px', borderRadius: 8, border: `1px solid ${bord}`, background: 'transparent', fontSize: 11, fontWeight: 600, color: mu, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Filter size={11} /> Filtrlash
                  </button>
                  <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${bord}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mu }}>
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              </div>
              <div style={{ paddingLeft: 28, paddingTop: 10 }}><ScoreChart D={D} /></div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                {[{ label: "O'quvchi bahosi", color: B }, { label: "Kurs o'rtachasi", color: 'rgba(66,122,67,0.25)' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                    <span style={{ fontSize: 11, color: mu }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ── DARS JADVALI ───────────────────────── */}
              <div style={{
                background: card, border: `1px solid ${bord}`, borderRadius: 20,
                padding: '18px', animation: 'slideUp .4s ease .12s both',
                boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: tx, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} color={B} /> Dars jadvali
                  </p>
                  <button onClick={() => navigate('/schedule')} style={{ fontSize: 10, color: B, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                    Barchasi <ChevronRight size={10} />
                  </button>
                </div>

                {/* Day tabs */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
                  {DAYS.map(d => (
                    <button key={d} onClick={() => setScheduleDay(d)} style={{
                      padding: '4px 7px', borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: 10, fontWeight: 700, flexShrink: 0, transition: 'all .14s',
                      background: scheduleDay === d ? `linear-gradient(135deg,${BD},${BL})` : D ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      color: scheduleDay === d ? '#fff' : mu,
                    }}>{d}</button>
                  ))}
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                  {[{ k: 'xona', l: 'Xona bo\'yicha' }, { k: 'oqituvchi', l: "O'qituvchi" }].map(v => (
                    <button key={v.k} onClick={() => setScheduleView(v.k)} style={{
                      flex: 1, padding: '5px 4px', borderRadius: 7, cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'all .14s',
                      border: `1px solid ${scheduleView === v.k ? B : bord}`,
                      background: scheduleView === v.k ? `${B}14` : 'transparent',
                      color: scheduleView === v.k ? B : mu,
                    }}>{v.l}</button>
                  ))}
                </div>

                {/* Schedule list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 220, overflowY: 'auto' }}>
                  {schedLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}><Spin size={18} /></div>
                  ) : schedule.length === 0 ? (
                    /* Placeholder rows when API data not available */
                    [
                      { time: '08:00-10:00', name: 'React/Next.js', room: 'Xona 1', teacher: 'K.Yo\'lchiyev', color: '#22c55e' },
                      { time: '09:00-11:30', name: 'Flutter Dev',   room: 'Xona 2', teacher: 'M.Abdullayeva', color: '#3b82f6' },
                      { time: '10:00-12:00', name: 'Backend Node',  room: 'Xona 4', teacher: 'B.Ergashev',    color: '#8b5cf6' },
                      { time: '14:00-16:00', name: 'UI/UX Design',  room: 'Xona 3', teacher: 'S.Sodiqova',    color: '#f59e0b' },
                    ].map((s, i) => (
                      <ScheduleRow key={i} item={s} view={scheduleView} D={D} tx={tx} mu={mu} bord={bord} />
                    ))
                  ) : (
                    schedule.map((item, i) => {
                      const mapped = {
                        time:    `${item.startTime || ''}${item.endTime ? '-' + item.endTime : ''}`,
                        name:    item.group?.name || item.groupName || 'Guruh',
                        room:    item.room?.name  || item.roomName  || 'Xona',
                        teacher: item.teacher?.user?.name || item.teacherName || "O'qituvchi",
                        color:   '#427A43',
                      };
                      return <ScheduleRow key={i} item={mapped} view={scheduleView} D={D} tx={tx} mu={mu} bord={bord} />;
                    })
                  )}
                </div>
              </div>

              {/* ── KIRIM-CHIQIM ───────────────────────── */}
              <div style={{
                background: card, border: `1px solid ${bord}`, borderRadius: 20,
                padding: '18px', animation: 'slideUp .4s ease .15s both',
                boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: tx, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={13} color={B} /> Bugungi moliya
                  </p>
                  <button onClick={fetchPayments} style={{ width: 24, height: 24, border: `1px solid ${bord}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mu }}>
                    <RotateCw size={11} />
                  </button>
                </div>

                {/* Income / Expense summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ padding: '10px 12px', borderRadius: 11, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                      <ArrowUpCircle size={12} color="#22c55e" />
                      <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>KIRIM</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>{fmt(payData.income)}</p>
                    <p style={{ fontSize: 9, color: mu, marginTop: 2 }}>so'm</p>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: 11, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                      <ArrowDownCircle size={12} color="#ef4444" />
                      <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 700 }}>CHIQIM</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{fmt(payData.expense)}</p>
                    <p style={{ fontSize: 9, color: mu, marginTop: 2 }}>so'm</p>
                  </div>
                </div>

                {/* Net balance bar */}
                {(payData.income + payData.expense) > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: mu }}>Balans</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: payData.income >= payData.expense ? '#22c55e' : '#ef4444' }}>
                        {payData.income >= payData.expense ? '+' : ''}{fmt(payData.income - payData.expense)} so'm
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, overflow: 'hidden', background: D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${Math.min(100, (payData.income / (payData.income + payData.expense)) * 100)}%`,
                        background: `linear-gradient(90deg,${BD},${BL})`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                )}

                {/* Recent payments list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 170, overflowY: 'auto' }}>
                  {payLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}><Spin size={16} /></div>
                  ) : payData.list.length === 0 ? (
                    <p style={{ fontSize: 11, color: mu, textAlign: 'center', padding: '14px 0' }}>Bugun to'lovlar yo'q</p>
                  ) : payData.list.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 9px', borderRadius: 8,
                      background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa',
                      border: `1px solid ${bord}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: p.type === 'credit' ? '#22c55e' : '#ef4444' }} />
                        <span style={{ fontSize: 11, color: tx, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description || (p.type === 'credit' ? 'Kirim' : 'Chiqim')}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6, color: p.type === 'credit' ? '#22c55e' : '#ef4444' }}>
                        {p.type === 'credit' ? '+' : '-'}{fmt(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/payments')} style={{
                  width: '100%', marginTop: 10, padding: '9px',
                  borderRadius: 10, background: `linear-gradient(135deg,${BD},${BL})`,
                  border: 'none', fontSize: 11, fontWeight: 700, color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                  Barcha to'lovlar <ChevronRight size={12} />
                </button>
              </div>

            </div>{/* /RIGHT PANEL */}
          </div>{/* /SCORE + RIGHT PANEL */}

          {/* ── LEADERBOARD + ATTENDANCE ──────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Leaderboard */}
            <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .18s both' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em', marginBottom: 16 }}>Eng yaxshi o'quvchilar</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${bord}` }}>
                {['Ism', 'Kurs', 'Progress', 'Baho'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: mu, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {[
                { name: 'Azizbek T.', course: 'React',   pct: 88, grade: 'A'  },
                { name: 'Malika R.',  course: 'Python',  pct: 76, grade: 'B'  },
                { name: 'Jasur K.',   course: 'Flutter', pct: 91, grade: 'A+' },
                { name: 'Nilufar A.', course: 'UI/UX',   pct: 83, grade: 'A'  },
              ].map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${BD},${BL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {s.name[0]}
                    </div>
                    <span style={{ fontSize: 12, color: tx, fontWeight: 600 }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: mu }}>{s.course}</span>
                  <div style={{ width: 52 }}>
                    <div style={{ height: 4, borderRadius: 99, background: D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.pct}%`, background: `linear-gradient(90deg,${BD},${BL})`, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 9, color: mu }}>{s.pct}%</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: B }}>{s.grade}</span>
                </div>
              ))}
            </div>

            {/* Attendance */}
            <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .21s both' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em', marginBottom: 16 }}>Davomat statistikasi</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 18 }}>
                <p style={{ fontSize: 40, fontWeight: 800, color: '#22c55e', lineHeight: 1, letterSpacing: '-0.03em' }}>{stats.attendance.rate}%</p>
                <p style={{ fontSize: 11, color: mu, marginBottom: 5 }}>{stats.attendance.present} ta kelgan / {stats.attendance.total} ta jami</p>
              </div>
              <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ flex: stats.attendance.present || 70, background: '#22c55e' }} />
                <div style={{ flex: stats.attendance.late    || 10, background: '#f59e0b' }} />
                <div style={{ flex: stats.attendance.absent  || 20, background: '#ef4444' }} />
              </div>
              {[
                { label: 'Kelgan',    value: stats.attendance.present, color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
                { label: 'Kechikgan', value: stats.attendance.late,    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                { label: 'Kelmagan',  value: stats.attendance.absent,  color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
              ].map(({ label, value, color, bg: cbg }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 11, background: cbg, marginBottom: 7, border: `1px solid ${color}18` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: tx }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
                </div>
              ))}
              <button onClick={() => navigate('/attendance')} style={{ width: '100%', marginTop: 6, padding: '10px', borderRadius: 12, background: `linear-gradient(135deg,${BD},${BL})`, border: 'none', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Batafsil ko'rish <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* ── QUICK ACTIONS + REVENUE ──────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Quick actions */}
            <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .24s both' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: tx, marginBottom: 14, letterSpacing: '-0.01em' }}>Tezkor amallar</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: UserPlus,   label: "O'quvchi qo'shish",  onClick: () => setSModal(true),       color: B         },
                  { icon: Users,      label: "O'qituvchi qo'shish", onClick: () => setTModal(true),       color: '#3b82f6' },
                  { icon: Layers,     label: 'Guruh yaratish',      onClick: () => navigate('/groups'),   color: '#8b5cf6' },
                  { icon: CreditCard, label: "To'lovlar",           onClick: () => navigate('/payments'), color: '#f59e0b' },
                ].map(({ icon: Ic, label, onClick, color }, i) => (
                  <button key={i} className="adp-qa" onClick={onClick} style={{ border: `1px solid ${bord}`, borderRadius: 14, padding: '16px 14px', background: 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, transition: 'background .14s,transform .18s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}25` }}>
                      <Ic size={16} color={color} strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tx, lineHeight: 1.3 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue card */}
            <div style={{ background: `linear-gradient(145deg,${BD},${B},${BL})`, borderRadius: 20, padding: '22px 24px', boxShadow: '0 8px 30px rgba(66,122,67,0.28)', position: 'relative', overflow: 'hidden', animation: 'slideUp .4s ease .27s both' }}>
              <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Jami daromad</p>
                  <p style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {fmt(stats.revenue)}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 6, opacity: .7 }}>so'm</span>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <TrendingUp size={11} color="#fff" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>+12%</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: "To'lovlar", value: stats.payments    },
                  { label: 'Kurslar',   value: stats.courses.total },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{value}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── STUDENTS LIST ────────────────────────── */}
          <div id="students-section" style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .30s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em' }}>O'quvchilar</p>
              <button onClick={() => setSModal(true)} style={{ padding: '8px 16px', borderRadius: 10, background: `linear-gradient(135deg,${BD},${BL})`, border: 'none', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <GraduationCap size={14} /> Qo'shish
              </button>
            </div>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: mu }}>
                <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>O'quvchilar topilmadi</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {students.slice(0, 5).map(student => (
                  <div key={student.id} style={{ padding: '12px 14px', borderRadius: 10, background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa', border: `1px solid ${bord}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${BD},${BL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                        {(student.user?.name || student.name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{student.user?.name || student.name || "O'quvchi"}</p>
                        <p style={{ fontSize: 11, color: mu }}>{student.group?.name || 'Guruh belgilanmagan'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 99, background: student.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)', color: student.status === 'active' ? '#22c55e' : '#94a3b8' }}>
                        {student.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                      <button onClick={() => navigate(`/students/${student.id}`)} style={{ padding: '6px 12px', borderRadius: 8, background: D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)', color: B, border: `1px solid ${D ? 'rgba(66,122,67,0.25)' : 'rgba(66,122,67,0.18)'}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ChevronRight size={12} /> Batafsil
                      </button>
                    </div>
                  </div>
                ))}
                {students.length > 5 && (
                  <button onClick={() => navigate('/students')} style={{ marginTop: 4, padding: '10px', borderRadius: 10, background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa', border: `1px solid ${bord}`, fontSize: 12, fontWeight: 600, color: mu, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Barcha {students.length} ta o'quvchini ko'rish <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── ASSIGN GROUP TO TEACHER ──────────────── */}
          <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .33s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em' }}>O'qituvchiga guruh biriktirish</p>
              <button onClick={() => setGModal(true)} style={{ padding: '8px 16px', borderRadius: 10, background: `linear-gradient(135deg,${BD},${BL})`, border: 'none', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> Biriktirish
              </button>
            </div>
            {teachers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: mu }}>
                <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>O'qituvchilar topilmadi</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {teachers.slice(0, 5).map(teacher => (
                  <div key={teacher.id} style={{ padding: '12px 14px', borderRadius: 10, background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa', border: `1px solid ${bord}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${BD},${BL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                        {(teacher.user?.name || teacher.name || 'T')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{teacher.user?.name || teacher.name || "O'qituvchi"}</p>
                        <p style={{ fontSize: 11, color: mu }}>{(teacher.groups || []).length} ta guruh</p>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedTeacher(teacher); setSelectedGroupsForTeacher((teacher.groups || []).map(g => g.id)); setGModal(true); }}
                      style={{ padding: '6px 12px', borderRadius: 8, background: D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)', color: B, border: `1px solid ${D ? 'rgba(66,122,67,0.25)' : 'rgba(66,122,67,0.18)'}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={12} /> Guruhlar
                    </button>
                  </div>
                ))}
                {teachers.length > 5 && (
                  <button onClick={() => navigate('/teachers')} style={{ marginTop: 4, padding: '10px', borderRadius: 10, background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa', border: `1px solid ${bord}`, fontSize: 12, fontWeight: 600, color: mu, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Barcha {teachers.length} ta o'qituvchini ko'rish <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── SECTIONS ─────────────────────────────── */}
          <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .36s both' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em', marginBottom: 14 }}>Bo'limlar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
              {[
                { icon: GraduationCap, label: "O'quvchilar",   total: stats.students.total, active: stats.students.active, path: '/students', color: B,        pale: 'rgba(66,122,67,0.10)'   },
                { icon: Users,         label: "O'qituvchilar", total: stats.teachers.total, active: stats.teachers.active, path: '/teachers', color: '#3b82f6', pale: 'rgba(59,130,246,0.10)'  },
                { icon: BookOpen,      label: 'Kurslar',        total: stats.courses.total,  active: stats.courses.active,  path: '/courses',  color: '#f59e0b', pale: 'rgba(245,158,11,0.10)' },
              ].map(({ icon: Ic, label, total, active, path, color, pale }) => {
                const pct = total > 0 ? Math.round(active / total * 100) : 0;
                return (
                  <div key={path} className="adp-card-hover" onClick={() => navigate(path)} style={{ padding: '16px', borderRadius: 14, border: `1px solid ${bord}`, background: D ? 'rgba(255,255,255,0.03)' : '#fafbfa', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: pale, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}22` }}>
                        <Ic size={16} color={color} />
                      </div>
                      <span style={{ fontSize: 11, color: mu }}>{active} / {total}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: tx, marginBottom: 8 }}>{label}</p>
                      <div style={{ height: 5, background: D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${BD},${BL})`, borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                        <span style={{ fontSize: 10, color: mu }}>Faollik</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: B }}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── GROUPS ───────────────────────────────── */}
          <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: '20px 22px', boxShadow: D ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'slideUp .4s ease .39s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: tx, letterSpacing: '-0.01em' }}>Guruhlar</p>
              <button onClick={() => navigate('/groups')} style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Barchasi <ChevronRight size={12} />
              </button>
            </div>
            {groupsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: mu }}>
                <Layers size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>Guruhlar topilmadi</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
                {groupsList.slice(0, 6).map(g => {
                  const sc  = g.currentStudents || 0;
                  const max = g.maxStudents || 20;
                  const pct = max ? Math.round(sc / max * 100) : 0;
                  const statusColor = g.status === 'active' ? '#22c55e' : g.status === 'completed' ? '#3b82f6' : '#ef4444';
                  const statusBg    = g.status === 'active' ? 'rgba(34,197,94,0.10)' : g.status === 'completed' ? 'rgba(59,130,246,0.10)' : 'rgba(239,68,68,0.10)';
                  return (
                    <div key={g.id} style={{ padding: '16px', borderRadius: 14, border: `1px solid ${bord}`, background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa', display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform .2s,box-shadow .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${BD},${BL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            {g.name?.substring(0, 2)?.toUpperCase() || 'GR'}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{g.name}</p>
                            {(g.courseTitle || g.course?.title) && <p style={{ fontSize: 11, color: mu, marginTop: 2 }}>{g.courseTitle || g.course?.title}</p>}
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6, background: statusBg, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {g.status === 'active' ? 'Faol' : g.status === 'completed' ? 'Tugatildi' : 'Bekor'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: mu }}>O'quvchilar</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: tx }}>{sc} / {max}</span>
                          </div>
                          <div style={{ height: 5, background: D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${BD},${BL})`, borderRadius: 99, transition: 'width 1s ease' }} />
                          </div>
                        </div>
                        <button onClick={() => navigate(`/attendance?groupId=${g.id}`)} style={{ padding: '6px 12px', borderRadius: 8, background: D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)', color: B, border: `1px solid ${D ? 'rgba(66,122,67,0.25)' : 'rgba(66,122,67,0.18)'}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all .2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = B; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)'; e.currentTarget.style.color = B; }}>
                          <Calendar size={12} /> Davomat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>{/* /CONTENT */}
      </div>{/* /ROOT */}

      {/* ═══════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════ */}

      {/* Student modal */}
      <Modal open={sModal} title="Yangi o'quvchi" subtitle="Ma'lumotlarni to'ldiring" onClose={() => setSModal(false)} onSubmit={handleStudentSubmit} loading={mLoading} D={D}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {[
            { label: "To'liq ism", k: 'name',     type: 'text',     pl: 'Ism Familiya'        },
            { label: 'Email',      k: 'email',    type: 'email',    pl: 'email@example.com'   },
            { label: 'Telefon',    k: 'phone',    type: 'text',     pl: '+998 90 123 45 67'   },
            { label: 'Parol',      k: 'password', type: 'password', pl: 'Kamida 8 belgi'      },
          ].map(f => (
            <div key={f.k}>
              <label style={lbl}>{f.label}</label>
              <input required type={f.type} placeholder={f.pl} value={sForm[f.k]} onChange={e => setSForm(p => ({ ...p, [f.k]: e.target.value }))} style={inpStyle} />
            </div>
          ))}
        </div>
        <div>
          <label style={lbl}>Guruh (ixtiyoriy)</label>
          <select value={sForm.groupId} onChange={e => setSForm(p => ({ ...p, groupId: e.target.value }))} style={inpStyle}>
            <option value="">— Tanlanmagan —</option>
            {groups.filter(g => g.status === 'active' || !g.status).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </Modal>

      {/* Teacher modal */}
      <Modal open={tModal} title="Yangi o'qituvchi" subtitle="Ma'lumotlarni to'ldiring" onClose={() => setTModal(false)} onSubmit={handleTeacherSubmit} loading={mLoading} D={D}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {[
            { label: "To'liq ism", k: 'name',     type: 'text',     pl: 'Ism Familiya'      },
            { label: 'Email',      k: 'email',    type: 'email',    pl: 'email@example.com' },
            { label: 'Telefon',    k: 'phone',    type: 'text',     pl: '+998 90 123 45 67' },
            { label: 'Parol',      k: 'password', type: 'password', pl: 'Kamida 8 belgi'    },
          ].map(f => (
            <div key={f.k}>
              <label style={lbl}>{f.label}</label>
              <input required type={f.type} placeholder={f.pl} value={tForm[f.k]} onChange={e => setTForm(p => ({ ...p, [f.k]: e.target.value }))} style={inpStyle} />
            </div>
          ))}
        </div>
        <div>
          <label style={lbl}>Mutaxassislik</label>
          <select value={tForm.specialization} onChange={e => setTForm(p => ({ ...p, specialization: e.target.value }))} style={inpStyle}>
            {['Frontend Developer (React/Next.js)', 'Backend Developer (Node.js/Go/Python)', 'Full-stack Web Developer', 'Mobile App Developer (Flutter/RN)', 'UI/UX Designer', 'Cyber Security Specialist', 'Data Scientist / AI Engineer', 'DevOps Engineer'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          <div>
            <label style={lbl}>Malaka</label>
            <select value={tForm.qualification} onChange={e => setTForm(p => ({ ...p, qualification: e.target.value }))} style={inpStyle}>
              {["Oliy ma'lumotli", 'Magistr', 'PhD', 'Bakalavr', "O'rta maxsus"].map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Holat</label>
            <select value={tForm.status} onChange={e => setTForm(p => ({ ...p, status: e.target.value }))} style={inpStyle}>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Komissiya foizi (%)</label>
          <input required type="number" min="0" max="100" step="1" placeholder="20" value={tForm.commissionPercentage} onChange={e => setTForm(p => ({ ...p, commissionPercentage: e.target.value }))} style={inpStyle} />
          <p style={{ fontSize: 11, color: mu, marginTop: 4 }}>Har darsdan o'quvchi to'lagan summaning necha foizini olishi (masalan: 20%)</p>
        </div>
      </Modal>

      {/* Group assignment modal */}
      {gModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 500, borderRadius: 22, background: card, border: `1px solid ${bord}`, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn .25s ease both' }}>
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${bord}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${BD},${BL})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: tx }}>Guruh biriktirish</p>
                  <p style={{ fontSize: 11, color: mu }}>{selectedTeacher?.user?.name || selectedTeacher?.name || "O'qituvchi"}</p>
                </div>
              </div>
              <button onClick={() => { setGModal(false); setSelectedTeacher(null); setSelectedGroupsForTeacher([]); }} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mu }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleGroupAssignment(); }} style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 13 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: mu }}>{selectedGroupsForTeacher.length} ta guruh tanlangan</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groupsList.map(group => {
                  const isSelected = selectedGroupsForTeacher.includes(group.id);
                  return (
                    <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1px solid ${isSelected ? B : bord}`, background: isSelected ? `${B}10` : 'transparent', cursor: 'pointer', transition: 'all .2s' }}>
                      <input type="checkbox" checked={isSelected} onChange={e => {
                        if (e.target.checked) setSelectedGroupsForTeacher([...selectedGroupsForTeacher, group.id]);
                        else setSelectedGroupsForTeacher(selectedGroupsForTeacher.filter(id => id !== group.id));
                      }} style={{ display: 'none' }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${isSelected ? B : mu}`, background: isSelected ? B : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && <CheckCircle size={14} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{group.name}</p>
                        <p style={{ fontSize: 11, color: mu }}>{group.currentStudents || 0}/{group.maxStudents || 20} o'quvchi</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => { setGModal(false); setSelectedTeacher(null); setSelectedGroupsForTeacher([]); }} style={{ flex: 1, padding: '12px', borderRadius: 13, background: 'transparent', border: `1px solid ${bord}`, fontSize: 13, fontWeight: 600, color: mu, cursor: 'pointer' }}>Bekor</button>
                <button type="submit" disabled={mLoading} style={{ flex: 2, padding: '12px', borderRadius: 13, background: `linear-gradient(135deg,${BD},${BL})`, border: 'none', fontSize: 13, fontWeight: 700, color: '#fff', cursor: mLoading ? 'not-allowed' : 'pointer', opacity: mLoading ? 0.6 : 1, boxShadow: '0 4px 14px rgba(66,122,67,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  {mLoading ? <><Spin size={13} /> Saqlanmoqda...</> : <><Layers size={13} /> Biriktirish</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Schedule row sub-component ─────────────────────────── */
const SCHED_COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

function ScheduleRow({ item, view, D, tx, mu, bord }) {
  const color = item.color || SCHED_COLORS[Math.abs(item.name?.charCodeAt(0) || 0) % SCHED_COLORS.length];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, background: D ? 'rgba(255,255,255,0.02)' : '#fafbfa', border: `1px solid ${bord}` }}>
      <div style={{ width: 3, height: 34, borderRadius: 99, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: tx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
        <p style={{ fontSize: 10, color: mu, marginTop: 1 }}>{item.time} · {view === 'xona' ? item.room : item.teacher}</p>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5, background: `${color}18`, color, flexShrink: 0 }}>Faol</span>
    </div>
  );
}