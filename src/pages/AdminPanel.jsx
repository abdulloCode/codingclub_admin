import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import ImageLoader, { SmallImageLoader } from '../components/ImageLoader';
import {
  Users, BookOpen, Layers, DollarSign,
  GraduationCap, CreditCard, UserPlus,
  Sun, Moon, ChevronRight, Activity, Shield, RotateCw, Bell
} from 'lucide-react';

function ProgressBar({ pct }) {
  const BRAND = '#427A43';
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(66,122,67,0.1)' }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
        style={{ width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${BRAND} 0%, ${BRAND}CC 100%)` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
             style={{ animation: 'shimmer 2s infinite' }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function Pulse() {
  return <SmallImageLoader size={10} />;
}

function StatCard({ icon: Icon, label, value, active, path, onClick }) {
  const { isDarkMode: D } = useTheme();
  const BRAND = '#427A43';
  const BRAND_PALE = D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)';
  const card = D ? '#1c1c1e' : '#ffffff';
  const tx = D ? '#f5f5f7' : '#1d1d1f';
  const mu = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';
  const bord = D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const pct = value > 0 ? Math.round((active / value) * 100) : 0;

  return (
    <div
      onClick={() => onClick && onClick(path)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: card, border: `1px solid ${bord}` }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
             style={{ background: BRAND_PALE }}>
          <Icon size={20} style={{ color: BRAND }} />
        </div>
        <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: mu }} />
      </div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <p className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: BRAND }}>{value}</p>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: BRAND_PALE, color: BRAND }}>
          {pct}% faol
        </span>
      </div>
      <p className="text-xs sm:text-sm font-semibold mb-3" style={{ color: tx }}>{label}</p>
      <ProgressBar pct={pct} />
      <div className="flex justify-between mt-2">
        <span className="text-xs sm:text-sm font-bold" style={{ color: BRAND }}>{active} faol</span>
        <span className="text-xs" style={{ color: mu }}>{pct}%</span>
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, path, onClick, desc }) {
  const { isDarkMode: D } = useTheme();
  const BRAND = '#427A43';
  const BRAND_PALE = D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)';
  const card = D ? '#1c1c1e' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const tx = D ? '#f5f5f7' : '#1d1d1f';
  const mu = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';

  return (
    <button onClick={() => onClick && onClick(path)}
      className="p-4 sm:p-6 text-left hover:scale-105 transition-all duration-300 w-full rounded-2xl"
      style={{ background: card, border: `1px solid ${bord}` }}>
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
           style={{ background: BRAND_PALE }}>
        <Icon size={20} style={{ color: BRAND }} />
      </div>
      <p className="text-xs sm:text-sm font-bold truncate" style={{ color: tx }}>{label}</p>
      <p className="text-[10px] sm:text-xs" style={{ color: mu }}>{desc}</p>
    </button>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { isDarkMode: D, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const BRAND = '#427A43';
  const BRAND_LIGHT = '#4a8c4b';
  const BRAND_PALE = D ? 'rgba(66,122,67,0.15)' : 'rgba(66,122,67,0.08)';

  const [stats, setStats] = useState({
    students: { total: 0, active: 0 },
    teachers: { total: 0, active: 0 },
    groups:   { total: 0, active: 0 },
    courses:  { total: 0, active: 0 },
    revenue: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [vis, setVis] = useState(false);

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    name: '', email: '', phone: '', password: '',
    educationLevel: "Maktab o'quvchisi",
    course: "Frontend (React/Next.js)",
    groupId: '', status: 'active', address: '', parentPhone: '',
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', phone: '', password: '',
    specialization: "Frontend Developer (React/Next.js)",
    qualification: "Oliy ma'lumotli",
    status: 'active',
  });

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchData();
    fetchGroupsAndCourses();
    setTimeout(() => setVis(true), 80);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboard();
      if (data?.overview) {
        const o = data.overview;
        setStats({
          students: { total: o.totalStudents || 0, active: o.activeStudents || 0 },
          teachers: { total: o.totalTeachers || 0, active: o.totalTeachers  || 0 },
          groups:   { total: o.totalGroups   || 0, active: o.activeGroups   || 0 },
          courses:  { total: o.totalCourses  || 0, active: o.totalCourses   || 0 },
          revenue:  o.totalRevenue  || 0,
          payments: o.totalPayments || 0,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchGroupsAndCourses = async () => {
    try {
      const [groupsRes] = await Promise.all([apiService.getGroups()]);
      setGroups(Array.isArray(groupsRes) ? groupsRes : groupsRes?.groups ?? []);
    } catch (e) { console.error(e); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 17 ? 'Xayrli kun' : 'Xayrli kech';

  const statCards = [
    { icon: GraduationCap, label: "O'quvchilar",   value: stats.students.total, active: stats.students.active, path: '/student'  },
    { icon: Users,         label: "O'qituvchilar", value: stats.teachers.total, active: stats.teachers.active, path: '/teachers' },
    { icon: Layers,        label: 'Guruhlar',       value: stats.groups.total,   active: stats.groups.active,   path: '/groups'   },
    { icon: BookOpen,      label: 'Kurslar',        value: stats.courses.total,  active: stats.courses.active,  path: '/courses'  },
  ];

  const quickActions = [
    { icon: UserPlus,   label: "O'quvchi qo'shish",  path: '/student',  desc: 'Yangi talaba' },
    { icon: Users,      label: "O'qituvchi qo'shish", path: '/teachers', desc: 'Yangi ustoz'  },
    { icon: Layers,     label: 'Guruh yaratish',       path: '/groups',   desc: 'Yangi guruh'  },
    { icon: CreditCard, label: "To'lov kiritish",      path: '/payments', desc: 'Yangi tolov'  },
  ];

  const sectionItems = [
    { icon: GraduationCap, label: "O'quvchilar",   count: stats.students.total, active: stats.students.active, path: '/student'  },
    { icon: Users,         label: "O'qituvchilar", count: stats.teachers.total, active: stats.teachers.active, path: '/teachers' },
    { icon: Layers,        label: 'Guruhlar',       count: stats.groups.total,   active: stats.groups.active,   path: '/groups'   },
    { icon: BookOpen,      label: 'Kurslar',        count: stats.courses.total,  active: stats.courses.active,  path: '/courses'  },
  ];

  const bg    = D ? '#000000' : '#f5f5f7';
  const card  = D ? '#1c1c1e' : '#ffffff';
  const bord  = D ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const tx    = D ? '#f5f5f7' : '#1d1d1f';
  const mu    = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';
  const sbg   = D ? '#1c1c1e' : '#ffffff';
  const sbord = D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const fu = (n) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(12px)',
    transition: `opacity 0.5s ease ${n * 80}ms, transform 0.5s ease ${n * 80}ms`,
  });

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const cleanData = {
        ...studentForm,
        phone: studentForm.phone.replace(/\D/g, ''),
        parentPhone: studentForm.parentPhone ? studentForm.parentPhone.replace(/\D/g, '') : '',
      };
      if (!cleanData.email.includes('@')) { alert("To'g'ri email kiriting!"); setModalLoading(false); return; }
      await apiService.createStudent(cleanData);
      alert("Yangi o'quvchi muvaffaqiyatli qo'shildi!");
      setStudentModalOpen(false);
      fetchData();
    } catch (err) { alert('Xatolik: ' + err.message); }
    finally { setModalLoading(false); }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const cleanData = { ...teacherForm, phone: teacherForm.phone.replace(/\D/g, '') };
      if (!cleanData.email.includes('@')) { alert("To'g'ri email kiriting!"); setModalLoading(false); return; }
      await apiService.createTeacher(cleanData);
      alert("Yangi o'qituvchi muvaffaqiyatli qo'shildi!");
      setTeacherModalOpen(false);
      fetchData();
    } catch (err) { alert('Xatolik: ' + err.message); }
    finally { setModalLoading(false); }
  };

  const inputCls = "w-full p-3 border rounded-xl outline-none text-sm transition-all focus:ring-2";
  const inputStyle = { background: card, border: `1px solid ${bord}`, color: tx };

  return (
    <>
      <style>{`
        .apple { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .apple-icon-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: ${BRAND_PALE}; color: ${BRAND};
          border: none; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; cursor: pointer; flex-shrink: 0;
        }
        .apple-icon-btn:hover { transform: scale(1.1); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${D ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)'}; border-radius: 4px; }
      `}</style>

      <div className="apple flex flex-col min-h-screen" style={{ background: bg }}>

        {/* HEADER */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between"
          style={{ background: sbg, borderBottom: `1px solid ${sbord}` }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <Pulse />
            <span className="text-xs font-semibold px-2 py-1 rounded-full hidden sm:inline"
                  style={{ color: BRAND, background: BRAND_PALE }}>Tizim faol</span>
            <span className="text-xs hidden md:inline" style={{ color: mu }}>
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="apple-icon-btn" disabled={loading}>
              {loading ? <SmallImageLoader size={15} /> : <RotateCw size={15} />}
            </button>
            <button onClick={toggleDarkMode} className="apple-icon-btn">
              {D ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="apple-icon-btn relative">
              <Bell size={15} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">3</span>
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">

          {loading && !vis ? (
            <div className="flex items-center justify-center h-64">
              <ImageLoader size={50} text="Ma'lumotlar yuklanmoqda..." />
            </div>
          ) : (
            <>
              {/* 1. Banner */}
              <div style={fu(1)}>
                <div className="rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
                     style={{
                       background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                       boxShadow: '0 8px 24px rgba(66,122,67,0.25)'
                     }}>
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'white' }} />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'white' }} />
                  <div className="text-white relative z-10">
                    <p className="text-white/70 text-xs sm:text-sm font-semibold mb-1">{greeting} 👋</p>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">{user?.name || 'Admin'}</h1>
                    <p className="text-white/70 text-xs sm:text-sm">
                      {stats.students.total} o'quvchi · {stats.groups.active} faol guruh · {stats.teachers.total} o'qituvchi
                    </p>
                  </div>
                  <div className="flex gap-3 relative z-10 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-center"
                         style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <p className="text-white text-2xl sm:text-3xl font-black">
                        {stats.students.total + stats.teachers.total + stats.groups.total + stats.courses.total}
                      </p>
                      <p className="text-white/60 text-[10px] mt-1 font-semibold">Jami</p>
                    </div>
                    <div className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-center"
                         style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <p className="text-white text-2xl sm:text-3xl font-black">
                        {stats.students.total > 0 ? Math.round((stats.students.active / stats.students.total) * 100) : 0}%
                      </p>
                      <p className="text-white/60 text-[10px] mt-1 font-semibold">Faollik</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Stat kartalar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" style={fu(2)}>
                {statCards.map((s, i) => (
                  <StatCard key={i} {...s} onClick={(path) => navigate(path)} />
                ))}
              </div>

              {/* 3. Daromad + Tizim holati */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4" style={fu(3)}>
                <div className="lg:col-span-3 rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${bord}` }}>
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div>
                      <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: mu }}>Jami daromad</p>
                      <p className="text-2xl sm:text-3xl font-black" style={{ color: BRAND }}>
                        {new Intl.NumberFormat('uz-UZ').format(stats.revenue)}
                        <span className="text-sm font-medium ml-1" style={{ color: mu }}>so'm</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BRAND_PALE }}>
                      <DollarSign size={18} style={{ color: BRAND }} />
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-14 sm:h-20 mb-4 sm:mb-6">
                    {[35, 50, 40, 65, 45, 60, 75, 85].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t transition-all duration-500"
                           style={{
                             height: `${h * 0.6}px`,
                             background: i === 7 ? `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)` : `${BRAND}20`,
                           }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: "To'lovlar", value: stats.payments,     icon: CreditCard },
                      { label: 'Kurslar',   value: stats.courses.total, icon: BookOpen   },
                      { label: 'Guruhlar',  value: stats.groups.total,  icon: Layers     },
                    ].map((m, i) => {
                      const Icon = m.icon;
                      return (
                        <div key={i} className="rounded-xl p-2.5 sm:p-4 text-center" style={{ background: BRAND_PALE }}>
                          <Icon size={14} style={{ color: BRAND }} className="mx-auto mb-1.5" />
                          <p className="text-xl sm:text-2xl font-bold" style={{ color: BRAND }}>{m.value}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: mu }}>{m.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6 flex flex-col" style={{ background: card, border: `1px solid ${bord}` }}>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <p className="text-sm font-bold" style={{ color: tx }}>Tizim holati</p>
                    <Shield size={18} style={{ color: mu }} />
                  </div>
                  <div className="space-y-3 sm:space-y-4 flex-1">
                    {[
                      { label: "O'quvchilar",   pct: stats.students.total > 0 ? Math.round((stats.students.active/stats.students.total)*100) : 0 },
                      { label: 'Guruhlar',       pct: stats.groups.total   > 0 ? Math.round((stats.groups.active/stats.groups.total)*100)     : 0 },
                      { label: "O'qituvchilar", pct: stats.teachers.total > 0 ? Math.round((stats.teachers.active/stats.teachers.total)*100) : 0 },
                      { label: 'Barqarorlik',   pct: 99 },
                    ].map((row, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-semibold" style={{ color: mu }}>{row.label}</span>
                          <span className="text-xs font-black" style={{ color: BRAND }}>{row.pct}%</span>
                        </div>
                        <ProgressBar pct={row.pct} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 sm:mt-5 p-3 rounded-xl flex items-center gap-3"
                    style={{ background: BRAND_PALE, border: `1px solid ${BRAND}30` }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: BRAND }}>
                      <Activity size={18} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold" style={{ color: BRAND }}>A'lo ishlayapti</p>
                      <p className="text-[10px]" style={{ color: mu }}>Barcha xizmatlar faol</p>
                    </div>
                    <Pulse />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 sm:p-6" style={{ background: card, border: `1px solid ${bord}` }} style2={fu(4)}>
                <div className="mb-4 sm:mb-5">
                  <p className="text-sm font-bold" style={{ color: tx }}>Tezkor amallar</p>
                  <p className="text-xs" style={{ color: mu }}>Tez-tez ishlatiladigan funksiyalar</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {quickActions.map((q, i) => (
                    <QuickActionCard key={i} icon={q.icon} label={q.label} path={q.path} desc={q.desc}
                      onClick={(path) => navigate(path)} />
                  ))}
                </div>
              </div>

              {/* 5. Bo'limlar */}
              <div className="rounded-2xl p-4 sm:p-6" style={{ background: card, border: `1px solid ${bord}` }}>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <p className="text-sm font-bold" style={{ color: tx }}>Boshqaruv bo'limlari</p>
                  <ChevronRight size={18} style={{ color: mu }} />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {sectionItems.map((item, i) => {
                    const Icon = item.icon;
                    const pct = item.count > 0 ? Math.round((item.active / item.count) * 100) : 0;
                    return (
                      <button key={i} onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:scale-[1.01] transition-all"
                        style={{ background: BRAND_PALE }}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: BRAND }}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1.5 sm:mb-2">
                            <span className="text-xs font-semibold" style={{ color: tx }}>{item.label}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ background: BRAND, color: 'white' }}>
                              {item.active} faol
                            </span>
                          </div>
                          <ProgressBar pct={pct} />
                        </div>
                        <span className="text-base sm:text-lg font-black ml-2 flex-shrink-0" style={{ color: BRAND }}>{item.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-center text-xs py-2" style={{ color: mu }}>
                CodingClub O'quv Markazi · Boshqaruv Tizimi · © 2024
              </p>
            </>
          )}
        </main>
      </div>

      {/* O'quvchi Modal */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
               style={{ background: card, border: `1px solid ${bord}` }}>
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
                 style={{ background: card, borderBottom: `1px solid ${bord}` }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: tx }}>Yangi O'quvchi Qo'shish</h2>
                <p className="text-xs" style={{ color: mu }}>Yangi talaba ma'lumotlarini kiriting</p>
              </div>
              <button onClick={() => setStudentModalOpen(false)} className="apple-icon-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleStudentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>To'liq ism</label>
                  <input required placeholder="Ism Familiya" value={studentForm.name}
                    onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Email</label>
                  <input required type="email" placeholder="email@example.com" value={studentForm.email}
                    onChange={e => setStudentForm({...studentForm, email: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Telefon</label>
                  <input required placeholder="+998 90 123 45 67" value={studentForm.phone}
                    onChange={e => setStudentForm({...studentForm, phone: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Parol</label>
                  <input required type="password" placeholder="Kamida 8 ta belgi" value={studentForm.password}
                    onChange={e => setStudentForm({...studentForm, password: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Kurs</label>
                <select value={studentForm.course} onChange={e => setStudentForm({...studentForm, course: e.target.value})}
                  className={inputCls} style={inputStyle}>
                  {['Frontend (React/Next.js)','Backend (Node.js/Go)','Full-stack Development','Mobile (Flutter/RN)','UI/UX Dizayn','Cyber Security','Data Science/AI','DevOps'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Guruh</label>
                  <select value={studentForm.groupId} onChange={e => setStudentForm({...studentForm, groupId: e.target.value})}
                    className={inputCls} style={inputStyle}>
                    <option value="">Ixtiyoriy</option>
                    {groups.filter(g => g.status === 'active' || !g.status).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Holat</label>
                  <select value={studentForm.status} onChange={e => setStudentForm({...studentForm, status: e.target.value})}
                    className={inputCls} style={inputStyle}>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Manzil</label>
                <input placeholder="Yashash manzili" value={studentForm.address}
                  onChange={e => setStudentForm({...studentForm, address: e.target.value})}
                  className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Ota-ona telefoni</label>
                <input placeholder="+998 90 123 45 67 (ixtiyoriy)" value={studentForm.parentPhone}
                  onChange={e => setStudentForm({...studentForm, parentPhone: e.target.value})}
                  className={inputCls} style={inputStyle} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStudentModalOpen(false)}
                  className="flex-1 py-3 font-bold rounded-xl text-sm transition-all hover:opacity-70"
                  style={{ color: mu }}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={modalLoading}
                  className="flex-1 py-3 font-bold rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: BRAND }}>
                  {modalLoading ? 'Saqlanmoqda...' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* O'qituvchi Modal */}
      {teacherModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
               style={{ background: card, border: `1px solid ${bord}` }}>
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
                 style={{ background: card, borderBottom: `1px solid ${bord}` }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: tx }}>Yangi O'qituvchi Qo'shish</h2>
                <p className="text-xs" style={{ color: mu }}>Yangi mutaxassis ma'lumotlarini kiriting</p>
              </div>
              <button onClick={() => setTeacherModalOpen(false)} className="apple-icon-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleTeacherSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>To'liq ism</label>
                  <input required placeholder="Ism Familiya" value={teacherForm.name}
                    onChange={e => setTeacherForm({...teacherForm, name: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Email</label>
                  <input required type="email" placeholder="email@example.com" value={teacherForm.email}
                    onChange={e => setTeacherForm({...teacherForm, email: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Telefon</label>
                  <input required placeholder="+998 90 123 45 67" value={teacherForm.phone}
                    onChange={e => setTeacherForm({...teacherForm, phone: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Parol</label>
                  <input required type="password" placeholder="Kamida 8 ta belgi" value={teacherForm.password}
                    onChange={e => setTeacherForm({...teacherForm, password: e.target.value})}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Mutaxassislik</label>
                <select value={teacherForm.specialization} onChange={e => setTeacherForm({...teacherForm, specialization: e.target.value})}
                  className={inputCls} style={inputStyle}>
                  {['Frontend Developer (React/Next.js)','Backend Developer (Node.js/Go/Python)','Full-stack Web Developer','Mobile App Developer (Flutter/RN)','UI/UX Designer','Cyber Security Specialist','Data Scientist / AI Engineer','DevOps Engineer'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Malaka darajasi</label>
                <select value={teacherForm.qualification} onChange={e => setTeacherForm({...teacherForm, qualification: e.target.value})}
                  className={inputCls} style={inputStyle}>
                  {["Oliy ma'lumotli",'Magistr','PhD','Bakalavr',"O'rta maxsus"].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: mu }}>Holat</label>
                <select value={teacherForm.status} onChange={e => setTeacherForm({...teacherForm, status: e.target.value})}
                  className={inputCls} style={inputStyle}>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setTeacherModalOpen(false)}
                  className="flex-1 py-3 font-bold rounded-xl text-sm transition-all hover:opacity-70"
                  style={{ color: mu }}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={modalLoading}
                  className="flex-1 py-3 font-bold rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: BRAND }}>
                  {modalLoading ? 'Saqlanmoqda...' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}