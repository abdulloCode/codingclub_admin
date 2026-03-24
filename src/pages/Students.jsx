import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../services/api";
import {
  GraduationCap, BookOpen, Calendar, CheckCircle,
  XCircle, Clock, TrendingUp, Award, Bell,
  Search, Filter, ChevronDown, ChevronRight,
  Download, Star, AlertCircle, FileText,
  ArrowRight, Home, Users, RefreshCw,
  Book, Zap, Flame, Target, Trophy,
} from "lucide-react";

/* ─── TOKENS ─────── */
const B  = "#427A43";
const BL = "#5a9e5b";
const BD = "#2d5630";

/* ─── CSS string (komponentdan tashqarida — har renderda yangilanmaydi) */
const STYLES = `
  *,*::before,*::after{box-sizing:border-box}
  .st-root{-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(66,122,67,0.3);border-radius:99px}
  @keyframes st-rise{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:none}}
  @keyframes st-pop {from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
  @keyframes st-shim{0%{transform:translateX(-130%)}100%{transform:translateX(130%)}}
  @keyframes st-spin{to{transform:rotate(360deg)}}
  @keyframes st-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.55;transform:scale(0.8)}}
  @keyframes st-toast{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
  .st-c0{animation:st-rise .55s cubic-bezier(.22,1,.36,1) .04s both}
  .st-c1{animation:st-rise .55s cubic-bezier(.22,1,.36,1) .08s both}
  .st-c2{animation:st-rise .55s cubic-bezier(.22,1,.36,1) .12s both}
  .st-c3{animation:st-rise .55s cubic-bezier(.22,1,.36,1) .16s both}
  .st-c4{animation:st-rise .55s cubic-bezier(.22,1,.36,1) .20s both}
  .st-s1{animation:st-rise .5s ease .04s both}
  .st-s2{animation:st-rise .5s ease .10s both}
  .st-s3{animation:st-rise .5s ease .17s both}
  .st-modal{animation:st-pop .28s cubic-bezier(.34,1.56,.64,1) both}
  .st-toast{animation:st-toast .35s ease both}
  .st-spin{animation:st-spin .9s linear infinite}
  .st-pulse{animation:st-pulse 1.9s ease-in-out infinite}
  .st-card{
    position:relative;cursor:pointer;
    transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;
    will-change:transform;
  }
  .st-card:hover{transform:translateY(-8px) scale(1.015)}
  .st-card:hover .st-shine{opacity:1}
  .st-shine{
    position:absolute;inset:0;border-radius:inherit;
    background:linear-gradient(135deg,rgba(255,255,255,0.08),transparent 55%);
    opacity:0;transition:opacity .25s;pointer-events:none;z-index:2;
  }
  .st-btn{
    cursor:pointer;border:none;
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    transition:transform .2s cubic-bezier(.34,1.56,.64,1),opacity .15s;
  }
  .st-btn:hover{transform:scale(1.05) translateY(-1px)}
  .st-btn:active{transform:scale(0.96)}
  .st-btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
  .st-inp{
    width:100%;font-size:13px;
    outline:none;transition:border-color .18s,box-shadow .18s;
  }
  .st-inp:focus{border-color:${B}!important;box-shadow:0 0 0 3px rgba(66,122,67,0.13)!important}
  .st-tab{cursor:pointer;transition:all .18s;white-space:nowrap}
`;

/* ─── STYLE TAG (memo — hech qachon re-render bo'lmaydi) ─────────── */
const StyleTag = memo(() => <style>{STYLES}</style>);

/* ─── COUNT UP ──────────────────────────────────────────────────── */
function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  const r = useRef();
  useEffect(() => {
    cancelAnimationFrame(r.current);
    const s = performance.now();
    const run = now => {
      const p = Math.min((now - s) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) r.current = requestAnimationFrame(run);
    };
    r.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(r.current);
  }, [target]);
  return v;
}

/* ─── TOAST ─────────────────────────────────────────────────────── */
const Toast = memo(({ msg, type }) => {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div className="st-toast" style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      display:"flex", alignItems:"center", gap:10,
      padding:"13px 20px", borderRadius:18,
      background: ok ? "rgba(8,18,10,0.93)" : "rgba(28,8,8,0.93)",
      border:`1px solid ${ok ? "rgba(66,122,67,0.5)" : "rgba(239,68,68,0.4)"}`,
      backdropFilter:"blur(20px)",
      boxShadow:`0 12px 40px ${ok ? "rgba(66,122,67,0.22)" : "rgba(239,68,68,0.18)"}`,
    }}>
      {ok ? <CheckCircle size={16} color="#4ade80"/> : <XCircle size={16} color="#f87171"/>}
      <span style={{fontSize:13, fontWeight:700, color:"#fff"}}>{msg}</span>
    </div>
  );
});

/* ─── GRADE CARD ────────────────────────────────────────────────── */
const GradeCard = memo(({ grade, D, idx }) => {
  const getGradeColor = (grade) => {
    if (grade >= 90) return { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: 'rgba(34,197,94,0.3)', label: 'Alo' };
    if (grade >= 80) return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)', label: 'Yaxshi' };
    if (grade >= 70) return { bg: 'rgba(234,179,8,0.1)', text: '#eab308', border: 'rgba(234,179,8,0.3)', label: 'Qoniqarli' };
    if (grade >= 60) return { bg: 'rgba(249,115,22,0.1)', text: '#f97316', border: 'rgba(249,115,22,0.3)', label: 'Qoniqarsiz' };
    return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.3)', label: 'Judayoq yomon' };
  };

  const color = getGradeColor(grade.grade);
  const card = D ? "rgba(16,16,18,0.97)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const tx   = D ? "#efeff1" : "#111";
  const mu   = D ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.42)";

  return (
    <div className={`st-card st-c${idx}`} style={{
      background:card, border:`1px solid ${bord}`, borderRadius:22, padding:20,
      boxShadow: D ? "none" : "0 4px 24px rgba(0,0,0,0.07),0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div className="st-shine"/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{
          width:56,height:56,borderRadius:16,
          background:color.bg,border:`2px solid ${color.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          <span style={{fontSize:28,fontWeight:800,color:color.text,fontFamily:"'Playfair Display',serif"}}>{grade.grade}</span>
        </div>
        <span style={{
          padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,
          background:color.bg,border:`1px solid ${color.border}`,color:color.text,
        }}>{color.label}</span>
      </div>
      <p style={{fontSize:16,fontWeight:700,color:tx,marginBottom:4}}>{grade.subject}</p>
      <p style={{fontSize:12,color:mu,marginBottom:8}}>{grade.description || 'Baholash'}</p>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <Clock size={11} color={mu}/>
        <span style={{fontSize:11,color:mu}}>{new Date(grade.date).toLocaleDateString('uz-UZ')}</span>
      </div>
    </div>
  );
});

/* ─── HOMEWORK CARD ─────────────────────────────────────────────── */
const HomeworkCard = memo(({ hw, D, idx }) => {
  const getHomeworkStatus = (hw) => {
    if (hw.completed) return { label: 'Topshirildi', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' };
    if (new Date(hw.dueDate) < new Date()) return { label: 'Muddati o\'tgan', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
    return { label: 'Kutilmoqda', color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)' };
  };

  const status = getHomeworkStatus(hw);
  const card = D ? "rgba(16,16,18,0.97)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const tx   = D ? "#efeff1" : "#111";
  const mu   = D ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.42)";

  return (
    <div className={`st-card st-c${idx}`} style={{
      background:card, border:`1px solid ${bord}`, borderRadius:22, padding:20,
      boxShadow: D ? "none" : "0 4px 24px rgba(0,0,0,0.07),0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div className="st-shine"/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{
          width:50,height:50,borderRadius:14,
          background:status.bg,border:`2px solid ${status.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          {hw.completed ? (
            <CheckCircle size={22} color={status.color}/>
          ) : (
            <BookOpen size={22} color={status.color}/>
          )}
        </div>
        <span style={{
          padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,
          background:status.bg,border:`1px solid ${status.border}`,color:status.color,
        }}>{status.label}</span>
      </div>
      <p style={{fontSize:16,fontWeight:700,color:tx,marginBottom:4}}>{hw.title}</p>
      <p style={{fontSize:12,color:mu,marginBottom:8}}>{hw.subject}</p>
      {hw.description && <p style={{fontSize:13,color:mu,lineHeight:1.6,marginBottom:12}}>{hw.description}</p>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Clock size={11} color={mu}/>
          <span style={{fontSize:11,color:mu}}>{new Date(hw.dueDate).toLocaleDateString('uz-UZ')}</span>
        </div>
        {!hw.completed && (
          <button className="st-btn" style={{
            padding:"8px 16px",borderRadius:11,
            background:`linear-gradient(135deg,${B},${BL})`,
            fontSize:12,fontWeight:700,color:"#fff",
          }}>
            Topshirish <ArrowRight size={12}/>
          </button>
        )}
      </div>
    </div>
  );
});

export default function Students() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // API endpointlar backend ga mos kelishi kerak
      const [gradesData, homeworkData, notifsData] = await Promise.all([
        apiService.getMyGrades().catch(() => []),
        apiService.getMyHomeworks().catch(() => []),
        apiService.getNotifications().catch(() => [])
      ]);

      setGrades(gradesData || []);
      setHomeworks(homeworkData || []);
      setNotifications(notifsData || []);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    if (grade >= 80) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
    if (grade >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    if (grade >= 60) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Matematika': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'Fizika': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'Kimyo': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      'Biologiya': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'Tarix': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'Geografiya': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
      'Ingliz tili': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      'Dasturlash': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    };
    return colors[subject] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + (g.grade || 0), 0);
    return (sum / grades.length).toFixed(1);
  };

  const getHomeworkStatus = (hw) => {
    if (hw.completed) return { label: 'Topshirildi', color: 'text-green-600', bg: 'bg-green-50' };
    if (new Date(hw.dueDate) < new Date()) return { label: 'Muddati o\'tgan', color: 'text-red-600', bg: 'bg-red-50' };
    return { label: 'Kutilmoqda', color: 'text-amber-600', bg: 'bg-amber-50' };
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'grades', label: 'Baholarim', icon: Award },
    { id: 'homework', label: 'Uyga vazifalar', icon: BookOpen },
    { id: 'schedule', label: 'Dastur', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/50 font-sans">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        .slide-in { animation: slideIn 0.3s ease-out; }
        .card-hover { transition: all 0.2s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900 leading-none">O'quvchi Paneli</p>
              <p className="text-xs text-slate-500 mt-0.5">{user?.name || 'O\'quvchi'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell size={20} className="text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            <Avatar name={user?.name} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <ImageLoader />
          </div>
        ) : (
          <div className="fade-in">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-6 card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Award size={24} className="text-blue-600" />
                      </div>
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        O'rtacha
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{calculateAverage()}</p>
                    <p className="text-sm text-slate-500">Baholarim</p>
                  </Card>

                  <Card className="p-6 card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <BookOpen size={24} className="text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Mavjud
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{homeworks.length}</p>
                    <p className="text-sm text-slate-500">Uyga vazifalar</p>
                  </Card>

                  <Card className="p-6 card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock size={24} className="text-amber-600" />
                      </div>
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        Kutilmoqda
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                      {homeworks.filter(h => !h.completed).length}
                    </p>
                    <p className="text-sm text-slate-500">Topshirilmagan</p>
                  </Card>

                  <Card className="p-6 card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                        <TrendingUp size={24} className="text-purple-600" />
                      </div>
                      <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        Progress
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                      {Math.round((homeworks.filter(h => h.completed).length / Math.max(homeworks.length, 1)) * 100)}%
                    </p>
                    <p className="text-sm text-slate-500">Tugatilgan</p>
                  </Card>
                </div>

                {/* Recent Grades */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">So'nggi baholar</h3>
                    <button
                      onClick={() => setActiveTab('grades')}
                      className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Barchasini ko'rish <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {grades.slice(0, 5).map((grade) => {
                      const color = getGradeColor(grade.grade);
                      const subjectColor = getSubjectColor(grade.subject);
                      return (
                        <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg ${subjectColor.bg} ${subjectColor.border} border-2 flex items-center justify-center`}>
                              <span className={`text-lg font-bold ${subjectColor.text}`}>{grade.grade}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{grade.subject}</p>
                              <p className="text-sm text-slate-500">{grade.description || 'Baholash'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${color.bg} ${color.text} ${color.border}`}>
                              {grade.grade >= 90 ? 'Alo' : grade.grade >= 80 ? 'Yaxshi' : grade.grade >= 70 ? 'Qoniqarli' : 'Qoniqarsiz'}
                            </span>
                            <span className="text-sm text-slate-500">{new Date(grade.date).toLocaleDateString('uz-UZ')}</span>
                          </div>
                        </div>
                      );
                    })}
                    {grades.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        Hali baholar yo'q
                      </div>
                    )}
                  </div>
                </Card>

                {/* Upcoming Homework */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Kelayotgan vazifalar</h3>
                    <button
                      onClick={() => setActiveTab('homework')}
                      className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Barchasini ko'rish <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {homeworks.filter(h => !h.completed).slice(0, 3).map((hw) => {
                      const status = getHomeworkStatus(hw);
                      return (
                        <div key={hw.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                              <BookOpen size={20} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{hw.title}</p>
                              <p className="text-sm text-slate-500">{hw.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-sm text-slate-500">{new Date(hw.dueDate).toLocaleDateString('uz-UZ')}</span>
                          </div>
                        </div>
                      );
                    })}
                    {homeworks.filter(h => !h.completed).length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        Kelayotgan vazifalar yo'q
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Baholarim</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="all">Barcha fanlar</option>
                        {[...new Set(grades.map(g => g.subject))].map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="all">Barcha vaqt</option>
                        <option value="week">Oxirgi 7 kun</option>
                        <option value="month">Oxirgi 30 kun</option>
                      </select>
                      <button className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                        <Download size={16} /> Eksport
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {grades
                      .filter(g => selectedSubject === 'all' || g.subject === selectedSubject)
                      .map((grade) => {
                        const color = getGradeColor(grade.grade);
                        const subjectColor = getSubjectColor(grade.subject);
                        return (
                          <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl ${subjectColor.bg} ${subjectColor.border} border-2 flex items-center justify-center`}>
                                <span className={`text-2xl font-bold ${subjectColor.text}`}>{grade.grade}</span>
                              </div>
                              <div>
                                <p className="font-bold text-lg text-slate-900">{grade.subject}</p>
                                <p className="text-sm text-slate-500 mb-1">{grade.description || 'Baholash'}</p>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text} ${color.border}`}>
                                    {grade.grade >= 90 ? 'Alo' : grade.grade >= 80 ? 'Yaxshi' : grade.grade >= 70 ? 'Qoniqarli' : 'Qoniqarsiz'}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    <Clock size={12} className="inline mr-1" />
                                    {new Date(grade.date).toLocaleDateString('uz-UZ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {grade.teacher && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Users size={14} />
                                  <span>{grade.teacher}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {grades.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Award size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">Hali baholar yo'q</p>
                        <p className="text-sm">Baholar paydo bo'lganda shu yerni ko'rasiz</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Grade Statistics */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Baholar statistikasi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Alo (90-100)', grade: grades.filter(g => g.grade >= 90).length, color: 'bg-green-100 text-green-700' },
                      { label: 'Yaxshi (80-89)', grade: grades.filter(g => g.grade >= 80 && g.grade < 90).length, color: 'bg-blue-100 text-blue-700' },
                      { label: 'Qoniqarli (70-79)', grade: grades.filter(g => g.grade >= 70 && g.grade < 80).length, color: 'bg-yellow-100 text-yellow-700' },
                      { label: 'Qoniqarsiz (<70)', grade: grades.filter(g => g.grade < 70).length, color: 'bg-red-100 text-red-700' },
                    ].map((stat, idx) => (
                      <div key={idx} className={`p-4 rounded-xl ${stat.color}`}>
                        <p className="text-2xl font-bold mb-1">{stat.grade}</p>
                        <p className="text-xs font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Homework Tab */}
            {activeTab === 'homework' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Uyga vazifalar</h3>
                    <div className="flex items-center gap-2">
                      <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="all">Barchasi</option>
                        <option value="pending">Topshirilmagan</option>
                        <option value="completed">Topshirilgan</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {homeworks.map((hw) => {
                      const status = getHomeworkStatus(hw);
                      const isOverdue = new Date(hw.dueDate) < new Date() && !hw.completed;
                      return (
                        <div
                          key={hw.id}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                hw.completed ? 'bg-emerald-100 border-2 border-emerald-300' :
                                isOverdue ? 'bg-red-100 border-2 border-red-300' :
                                'bg-blue-100 border-2 border-blue-300'
                              }`}>
                                {hw.completed ? (
                                  <CheckCircle size={20} className="text-emerald-600" />
                                ) : isOverdue ? (
                                  <AlertCircle size={20} className="text-red-600" />
                                ) : (
                                  <FileText size={20} className="text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-lg text-slate-900">{hw.title}</p>
                                <p className="text-sm text-slate-500">{hw.subject}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{hw.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock size={14} />
                              <span>Topshirish: {new Date(hw.dueDate).toLocaleDateString('uz-UZ')}</span>
                            </div>
                            {!hw.completed && (
                              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                                Topshirish <ArrowRight size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {homeworks.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">Uyga vazifalar yo'q</p>
                        <p className="text-sm">Vazifalar paydo bo'lganda shu yerni ko'rasiz</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Haftalik dastur</h3>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
                        Bugun
                      </span>
                      <button className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Week Days */}
                  <div className="space-y-4">
                    {['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'].map((day, idx) => {
                      const isToday = idx === new Date().getDay() - 1 || (idx === 6 && new Date().getDay() === 0);
                      return (
                        <div
                          key={day}
                          className={`p-4 rounded-xl border-2 ${
                            isToday ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isToday ? 'bg-emerald-600' : 'bg-slate-200'
                            }`}>
                              <Calendar size={18} className={isToday ? 'text-white' : 'text-slate-600'} />
                            </div>
                            <div>
                              <p className={`font-bold ${isToday ? 'text-emerald-700' : 'text-slate-900'}`}>{day}</p>
                              <p className="text-xs text-slate-500">
                                {isToday ? 'Bugun' : 'Haftaning boshqa kuni'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { time: '09:00-10:30', subject: 'Matematika', room: '301-xona', teacher: 'A. Karimov' },
                              { time: '10:45-12:15', subject: 'Fizika', room: '205-xona', teacher: 'B. Toshmatov' },
                              { time: '14:00-15:30', subject: 'Dasturlash', room: 'Lab-1', teacher: 'M. Rahimov' },
                            ].slice(0, isToday ? 3 : Math.floor(Math.random() * 3) + 1).map((cls, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-slate-900">{cls.subject}</p>
                                    <span className="text-xs text-slate-500">{cls.time}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>📍 {cls.room}</span>
                                    <span>👨‍🏫 {cls.teacher}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
