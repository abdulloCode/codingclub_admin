import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  Users, BookOpen, Layers, GraduationCap,
  CreditCard, UserPlus, RotateCw, TrendingUp,
  ArrowUpRight, ChevronRight, X, Save,
  CheckCircle, XCircle, BarChart2,
  Filter, MoreHorizontal,
  Calendar, Clock, ChevronLeft, Award,
} from 'lucide-react';

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

const B  = '#427A43';
const BL = '#5a9e5b';
const BD = '#2d5630';
const fmt = n => new Intl.NumberFormat('uz-UZ').format(n ?? 0);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SCORES = [62, 45, 78, 55, 88, 95, 70, 82, 60, 75, 68, 80];

const LEADERBOARD_DEFAULT = [
  { name: 'Aziza Jaloil',     course: 'Frontend', progress: 78, pct: 92, avatar: 'AJ' },
  { name: 'Jasurbek Rahimov', course: 'Backend',  progress: 62, pct: 87, avatar: 'JR' },
  { name: 'Dilnoza Yusupova', course: 'UI/UX',    progress: 45, pct: 81, avatar: 'DY' },
  { name: 'Sherzod Mirzaev',  course: 'DevOps',   progress: 31, pct: 76, avatar: 'SM' },
];

function MiniCalendar({ D }) {
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const days   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay    = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const highlighted = [9,14,21,28];
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.40)';
  const tx   = D ? '#f5f5f7' : '#111';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(66,122,67,0.10)';
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <button onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth()-1,1))}
          style={{ background:'none', border:'none', cursor:'pointer', color:mu, display:'flex', alignItems:'center' }}>
          <ChevronLeft size={15}/>
        </button>
        <span style={{ fontSize:13, fontWeight:600, color:tx }}>{months[cur.getMonth()]} {cur.getFullYear()}</span>
        <button onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth()+1,1))}
          style={{ background:'none', border:'none', cursor:'pointer', color:mu, display:'flex', alignItems:'center' }}>
          <ChevronRight size={15}/>
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
        {days.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:mu, padding:'3px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {Array(offset).fill(null).map((_,i) => <div key={'e'+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i) => {
          const day = i+1;
          const isToday = day === today.getDate() && cur.getMonth() === today.getMonth() && cur.getFullYear() === today.getFullYear();
          const isHL = highlighted.includes(day);
          return (
            <div key={day} style={{
              textAlign:'center', fontSize:11, fontWeight: isToday||isHL ? 700 : 400,
              padding:'5px 0', borderRadius:7, cursor:'pointer',
              background: isToday ? `linear-gradient(135deg,${BD},${BL})` : isHL ? 'rgba(66,122,67,0.12)' : 'transparent',
              color: isToday ? '#fff' : isHL ? B : tx,
              transition:'background .15s',
            }}>{day}</div>
          );
        })}
      </div>
      <div style={{ marginTop:12, borderTop:`1px solid ${bord}`, paddingTop:12 }}>
        <p style={{ fontSize:11, fontWeight:600, color:mu, marginBottom:8 }}>Jadvaldagi darslar</p>
        {[{time:'10:00',label:'React - Group A'},{time:'14:00',label:'Node.js - Group B'}].map(ev=>(
          <div key={ev.time} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:3, height:28, borderRadius:99, background:`linear-gradient(${BD},${BL})` }}/>
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:tx }}>{ev.label}</p>
              <p style={{ fontSize:10, color:mu, display:'flex', alignItems:'center', gap:3 }}><Clock size={9}/> {ev.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreChart({ D }) {
  const [hov, setHov] = useState(null);
  const mu   = D ? 'rgba(245,245,247,0.40)' : 'rgba(0,0,0,0.35)';
  const grid = D ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const maxV = Math.max(...SCORES);
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110, position:'relative' }}>
        {[0,25,50,75,100].map(v => (
          <div key={v} style={{ position:'absolute', left:0, right:0, bottom:`${v}%`, borderTop:`1px dashed ${grid}`, pointerEvents:'none' }}>
            <span style={{ position:'absolute', left:-24, top:-7, fontSize:9, color:mu }}>{v}</span>
          </div>
        ))}
        {SCORES.map((s, i) => {
          const isActive = i === 5;
          const isHov = hov === i;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative', height:'100%', justifyContent:'flex-end' }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              {(isHov || isActive) && (
                <div style={{ position:'absolute', top:-32, left:'50%', transform:'translateX(-50%)', background: isActive ? B : '#333', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:6, whiteSpace:'nowrap', pointerEvents:'none', zIndex:10 }}>
                  avg. {s}%
                </div>
              )}
              <div style={{ width:'100%', borderRadius:'5px 5px 0 0', height:`${(s/maxV)*100}%`, background: isActive ? `linear-gradient(180deg,${BL},${BD})` : isHov ? `linear-gradient(180deg,rgba(66,122,67,0.5),rgba(66,122,67,0.2))` : D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', transition:'all .2s', cursor:'pointer' }}/>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        {MONTHS.map((m,i) => <div key={m} style={{ flex:1, textAlign:'center', fontSize:9, color: hov===i ? B : mu, fontWeight: hov===i ? 700 : 400, transition:'color .15s' }}>{m}</div>)}
      </div>
    </div>
  );
}

function TopCard({ icon: Icon, label, value, sub, change, color, pale, D, onClick }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const end = parseInt(value) || 0;
    const dur = 900;
    const s = performance.now();
    const run = now => {
      const p = Math.min((now-s)/dur,1);
      setN(Math.round((1-Math.pow(1-p,3))*end));
      if(p<1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [value]);
  const card = D ? 'rgba(26,26,29,0.95)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';
  const tx   = D ? '#f5f5f7' : '#18181b';
  return (
    <div onClick={onClick} style={{ background:card, border:`1px solid ${bord}`, borderRadius:18, padding:'20px 22px', cursor:'pointer', position:'relative', overflow:'hidden', boxShadow: D?'none':'0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)', transition:'transform .2s,box-shadow .2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.10)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=D?'none':'0 1px 3px rgba(0,0,0,0.06)'}}>
      <div style={{ position:'absolute', right:-18, top:-18, width:80, height:80, borderRadius:'50%', background:pale, opacity:0.7, pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:12, background:pale, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${color}22` }}>
          <Icon size={18} color={color} strokeWidth={2}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:99, background:'rgba(34,197,94,0.09)', border:'1px solid rgba(34,197,94,0.18)' }}>
          <TrendingUp size={10} color="#22c55e"/>
          <span style={{ fontSize:10, fontWeight:700, color:'#22c55e' }}>{change}</span>
        </div>
      </div>
      <p style={{ fontSize:32, fontWeight:700, color:tx, lineHeight:1, letterSpacing:'-0.02em' }}>{n}</p>
      <p style={{ fontSize:12, fontWeight:600, color:tx, marginTop:4 }}>{label}</p>
      <p style={{ fontSize:11, color:mu, marginTop:2 }}>{sub}</p>
      <div style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, color:mu }}>Batafsil</span>
        <ArrowUpRight size={12} color={mu}/>
      </div>
      <div style={{ height:3, background:'rgba(0,0,0,0.06)', borderRadius:99, marginTop:8, overflow:'hidden' }}>
        <div style={{ height:'100%', width:'72%', background:`linear-gradient(90deg,${BD},${BL})`, borderRadius:99 }}/>
      </div>
    </div>
  );
}

function Modal({ open, title, subtitle, onClose, onSubmit, loading, D, children }) {
  if (!open) return null;
  const card = D ? 'rgba(18,18,20,0.99)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.08)' : 'rgba(66,122,67,0.12)';
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  const tx   = D ? '#f5f5f7' : '#111';
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.50)', backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:520, borderRadius:24, background:card, border:`1px solid ${bord}`, boxShadow:'0 30px 80px rgba(0,0,0,0.25)', maxHeight:'90vh', display:'flex', flexDirection:'column', animation:'fadeIn .25s ease both' }}>
        <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${bord}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(66,122,67,0.25)' }}>
              <Save size={16} color="#fff"/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:tx }}>{title}</p>
              <p style={{ fontSize:11, color:mu }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:mu }}><X size={14}/></button>
        </div>
        <form onSubmit={onSubmit} style={{ padding:'20px 24px', overflowY:'auto', display:'flex', flexDirection:'column', gap:13 }}>
          {children}
          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:13, background:'transparent', border:`1px solid ${bord}`, fontSize:13, fontWeight:600, color:mu, cursor:'pointer' }}>Bekor qilish</button>
            <button type="submit" disabled={loading} style={{ flex:2, padding:'12px', borderRadius:13, background:`linear-gradient(135deg,${BD},${BL})`, border:'none', fontSize:13, fontWeight:700, color:'#fff', cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1, boxShadow:'0 4px 14px rgba(66,122,67,0.30)', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              {loading ? <><RotateCw size={13} style={{ animation:'spin .9s linear infinite' }}/> Saqlanmoqda...</> : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { isAuthenticated, user, isLoading } = useRequireAuth('admin');

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0f12' }}>
        <RotateCw size={30} color="#427A43" style={{ animation:'spin 1s linear infinite' }}/>
        <p style={{ color:'#fff', marginLeft:10 }}>Ruxsat tekshirilmoqda...</p>
      </div>
    );
  }

  const { isDarkMode: D } = useTheme();
  const navigate          = useNavigate();

  const [stats, setStats] = useState({
    students:{ total:0, active:0 }, teachers:{ total:0, active:0 },
    groups:{ total:0, active:0 },   courses:{ total:0, active:0 },
    revenue:0, payments:0,
    attendance:{ total:0, present:0, absent:0, late:0, rate:0 },
  });
  const [loading,    setLoading]    = useState(true);
  const [groups,     setGroups]     = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [students,   setStudents]   = useState([]);
  const [teachers,   setTeachers]   = useState([]);
  const [sModal,     setSModal]     = useState(false);
  const [tModal,     setTModal]     = useState(false);
  const [gModal,     setGModal]     = useState(false);
  const [selectedTeacher,            setSelectedTeacher]            = useState(null);
  const [selectedGroupsForTeacher,   setSelectedGroupsForTeacher]   = useState([]);
  const [mLoading,   setMLoading]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [period,     setPeriod]     = useState('Weekly');
  const [leaderboard,setLeaderboard]= useState(LEADERBOARD_DEFAULT);

  const [sForm, setSForm] = useState({ name:'', email:'', phone:'', password:'', groupId:'', status:'active' });
  const [tForm, setTForm] = useState({ name:'', email:'', phone:'', password:'', specialization:'Frontend Developer (React/Next.js)', qualification:"Oliy ma'lumotli", status:'active' });

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboard();
      if (data?.overview) {
        const o = data.overview;
        setStats({
          students:{ total:o.totalStudents||0, active:o.activeStudents||0 },
          teachers:{ total:o.totalTeachers||0, active:o.activeTeachers||0 },
          groups:{ total:o.totalGroups||0, active:o.activeGroups||0 },
          courses:{ total:o.totalCourses||0, active:o.activeCourses||0 },
          revenue:o.totalRevenue||0, payments:o.totalPayments||0,
          attendance:o.attendance||{ total:0, present:0, absent:0, late:0, rate:0 },
        });
      }
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setLoading(false); }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const r = await apiService.getGroups();
      const d = Array.isArray(r) ? r : r?.groups ?? [];
      setGroups(d);
      setGroupsList(d);
    } catch (err) { console.error('Groups fetch error:', err); }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const r = await apiService.getStudents();
      setStudents(Array.isArray(r) ? r : r?.students ?? []);
    } catch (err) { console.error('Students fetch error:', err); }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const r = await apiService.getTeachers();
      setTeachers(Array.isArray(r) ? r : r?.teachers ?? []);
    } catch (err) { console.error('Teachers fetch error:', err); }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await apiService.getLeaderboard();
      if (data?.students?.length) setLeaderboard(data.students.slice(0,4));
    } catch { /* default data qoladi */ }
  }, []);

  useEffect(() => {
    fetchData(); fetchGroups(); fetchStudents(); fetchTeachers(); fetchLeaderboard();
  }, [fetchData, fetchGroups, fetchStudents, fetchTeachers, fetchLeaderboard]);

  // ✅ TO'G'RILANGAN: faqat kerakli maydonlar yuboriladi, keyin guruhga biriktiriladi
  const handleStudentSubmit = useCallback(async e => {
    e.preventDefault(); setMLoading(true);
    try {
      const payload = {
        name:     sForm.name.trim(),
        email:    sForm.email.trim(),
        phone:    sForm.phone.trim(),
        password: sForm.password,
      };
      const res = await apiService.createStudent(payload);
      const studentId = res?.student?.id || res?.student?._id || res?.id || res?._id;

      // Guruhga biriktirish — alohida so'rov
      if (sForm.groupId && studentId) {
        try {
          await apiService.assignGroupToStudent(studentId, sForm.groupId);
        } catch (groupErr) {
          console.warn('Guruhga biriktirishda xato:', groupErr.message);
          showToast("O'quvchi qo'shildi, lekin guruhga biriktirilmadi", 'error');
        }
      }

      setSModal(false);
      showToast("O'quvchi muvaffaqiyatli qo'shildi");
      fetchData(); fetchStudents();
      setSForm({ name:'', email:'', phone:'', password:'', groupId:'', status:'active' });
    } catch(err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally { setMLoading(false); }
  }, [sForm, fetchData, fetchStudents]);

  const handleTeacherSubmit = useCallback(async e => {
    e.preventDefault(); setMLoading(true);
    try {
      const payload = {
        name:           tForm.name.trim(),
        email:          tForm.email.trim(),
        phone:          tForm.phone.trim(),
        password:       tForm.password,
        specialization: tForm.specialization,
        qualification:  tForm.qualification,
        status:         tForm.status,
      };
      await apiService.createTeacher(payload);
      setTModal(false);
      showToast("O'qituvchi muvaffaqiyatli qo'shildi");
      fetchData(); fetchTeachers();
      setTForm({ name:'', email:'', phone:'', password:'', specialization:'Frontend Developer (React/Next.js)', qualification:"Oliy ma'lumotli", status:'active' });
    } catch(err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally { setMLoading(false); }
  }, [tForm, fetchData, fetchTeachers]);

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
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally { setMLoading(false); }
  }, [selectedTeacher, selectedGroupsForTeacher, fetchGroups]);

  const bg   = D ? '#0f0f12' : '#f5f6fa';
  const card = D ? 'rgba(22,22,28,0.96)' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const tx   = D ? '#f5f5f7' : '#18181b';
  const mu   = D ? 'rgba(245,245,247,0.42)' : 'rgba(0,0,0,0.40)';
  const inpStyle = { background: D?'rgba(255,255,255,0.05)':'#f8faf8', border:`1px solid ${bord}`, borderRadius:11, padding:'10px 13px', color:tx, fontSize:13, width:'100%', outline:'none' };
  const lbl = { display:'block', fontSize:10, fontWeight:700, color:mu, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:bg }}>
      <RotateCw size={28} color={B} style={{ animation:'spin .9s linear infinite' }}/>
    </div>
  );

  return (
    <>
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
        ::-webkit-scrollbar       { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(66,122,67,0.18); border-radius:99px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', alignItems:'center', gap:9, padding:'12px 18px', borderRadius:14, background:toast.type==='success'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', border:`1px solid ${toast.type==='success'?'rgba(34,197,94,0.28)':'rgba(239,68,68,0.28)'}`, boxShadow:'0 6px 24px rgba(0,0,0,0.12)', animation:'slideUp .25s ease both' }}>
          {toast.type==='success' ? <CheckCircle size={14} color="#22c55e"/> : <XCircle size={14} color="#ef4444"/>}
          <span style={{ fontSize:13, fontWeight:600, color:toast.type==='success'?'#22c55e':'#ef4444' }}>{toast.msg}</span>
        </div>
      )}

      <div className="adp-root" style={{ background:bg, minHeight:'100%', animation:'fadeIn .4s ease both' }}>

        {/* HEADER */}
        <div style={{ padding:'22px 28px 0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div>
            <p style={{ fontSize:20, fontWeight:800, color:tx, letterSpacing:'-0.02em' }}>Dashboard</p>
            <p style={{ fontSize:12, color:mu, marginTop:3, display:'flex', alignItems:'center', gap:4 }}>
              <BarChart2 size={11} color={B}/>
              {new Date().toLocaleDateString('uz-UZ', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {['Weekly','Monthly','Yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding:'7px 14px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:period===p?`linear-gradient(135deg,${BD},${BL})`:D?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)', color:period===p?'#fff':mu, transition:'all .18s' }}>{p}</button>
            ))}
            <button onClick={fetchData} style={{ width:36, height:36, borderRadius:10, border:`1px solid ${bord}`, background:card, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:B }}>
              <RotateCw size={14}/>
            </button>
          </div>
        </div>

        <div style={{ padding:'18px 28px 48px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* STAT CARDS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14 }}>
            {[
              { icon:GraduationCap, label:"Jami o'quvchilar", value:stats.students.total, sub:`${stats.students.active} ta faol`, change:'+14%', color:B,        pale:'rgba(66,122,67,0.10)',  path:'/students-panel' },
              { icon:BookOpen,      label:'Kurslar',           value:stats.courses.total,  sub:`${stats.courses.active} ta faol`, change:'-5%',  color:'#e57373', pale:'rgba(229,115,115,0.10)',path:'/courses'  },
              { icon:Clock,         label:"O'qitish vaqti",    value:80,                   sub:'+4 soat oxirgi haftada',          change:'+9%',  color:'#3b82f6', pale:'rgba(59,130,246,0.10)', path:'/attendance' },
              { icon:Award,         label:'Topshiriqlar',       value:stats.payments,       sub:`${stats.groups.active} ta vazifa`,change:'+6%',  color:'#8b5cf6', pale:'rgba(139,92,246,0.10)', path:'/payments'  },
            ].map((s,i) => (
              <div key={i} style={{ animation:`slideUp .4s ease ${i*0.07}s both` }}>
                <TopCard {...s} D={D} onClick={() => navigate(s.path)}/>
              </div>
            ))}
          </div>

          {/* SCORE + CALENDAR */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:14 }}>
            <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'22px 24px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)', animation:'slideUp .4s ease .1s both' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:800, color:tx, letterSpacing:'-0.01em' }}>Baholash ko'rsatkichi</p>
                  <p style={{ fontSize:11, color:mu, marginTop:3 }}>O'quvchilar va kurslar baholari</p>
                </div>
                <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                  <button style={{ padding:'5px 11px', borderRadius:8, border:`1px solid ${bord}`, background:'transparent', fontSize:11, fontWeight:600, color:mu, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    <Filter size={11}/> Filtrlash
                  </button>
                  <button style={{ width:30, height:30, borderRadius:8, border:`1px solid ${bord}`, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:mu }}>
                    <MoreHorizontal size={13}/>
                  </button>
                </div>
              </div>
              <div style={{ paddingLeft:28, paddingTop:10 }}><ScoreChart D={D}/></div>
              <div style={{ display:'flex', gap:14, marginTop:14 }}>
                {[{label:"O'quvchi bahosi",color:B},{label:"Kurs o'rtachasi",color:'rgba(66,122,67,0.25)'}].map(l=>(
                  <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:l.color }}/>
                    <span style={{ fontSize:11, color:mu }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 18px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .15s both' }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, marginBottom:14, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:7 }}>
                <Calendar size={14} color={B}/> Tadbirlar
              </p>
              <MiniCalendar D={D}/>
            </div>
          </div>

          {/* LEADERBOARD + ATTENDANCE */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .18s both' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:800, color:tx, letterSpacing:'-0.01em' }}>Eng yaxshi o'quvchilar</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${bord}` }}>
                {['Ism','Kurs','Progress','Baholar'].map(h=>(
                  <span key={h} style={{ fontSize:10, fontWeight:700, color:mu, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</span>
                ))}
              </div>
              {leaderboard.map((s,i) => (
                <div key={i} className="adp-row-hover" style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, alignItems:'center', padding:'9px 6px', borderRadius:10, cursor:'pointer', transition:'background .14s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:30, height:30, borderRadius:10, flexShrink:0, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff' }}>{s.avatar}</div>
                    <span style={{ fontSize:12, fontWeight:600, color:tx }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize:11, color:mu, whiteSpace:'nowrap' }}>{s.course}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:tx }}>{s.progress}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:48, height:5, background:D?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${s.pct}%`, background:`linear-gradient(90deg,${BD},${BL})`, borderRadius:99 }}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:B }}>{s.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .21s both' }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, letterSpacing:'-0.01em', marginBottom:16 }}>Davomat statistikasi</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:18 }}>
                <p style={{ fontSize:40, fontWeight:800, color:'#22c55e', lineHeight:1, letterSpacing:'-0.03em' }}>{stats.attendance.rate}%</p>
                <p style={{ fontSize:11, color:mu, marginBottom:5 }}>{stats.attendance.present} ta kelgan / {stats.attendance.total} ta jami</p>
              </div>
              <div style={{ display:'flex', height:12, borderRadius:99, overflow:'hidden', marginBottom:14 }}>
                <div style={{ flex:stats.attendance.present||70, background:'#22c55e' }}/>
                <div style={{ flex:stats.attendance.late||10,    background:'#f59e0b' }}/>
                <div style={{ flex:stats.attendance.absent||20,  background:'#ef4444' }}/>
              </div>
              {[
                { label:'Kelgan',    value:stats.attendance.present, color:'#22c55e', bg:'rgba(34,197,94,0.08)' },
                { label:'Kechikgan', value:stats.attendance.late,    color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
                { label:'Kelmagan',  value:stats.attendance.absent,  color:'#ef4444', bg:'rgba(239,68,68,0.08)' },
              ].map(({ label, value, color, bg:cbg }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:11, background:cbg, marginBottom:7, border:`1px solid ${color}18` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:color }}/>
                    <span style={{ fontSize:12, fontWeight:600, color:tx }}>{label}</span>
                  </div>
                  <span style={{ fontSize:18, fontWeight:800, color }}>{value}</span>
                </div>
              ))}
              <button onClick={() => navigate('/attendance')} style={{ width:'100%', marginTop:6, padding:'10px', borderRadius:12, background:`linear-gradient(135deg,${BD},${BL})`, border:'none', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                Batafsil ko'rish <ChevronRight size={13}/>
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS + REVENUE */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .24s both' }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, marginBottom:14, letterSpacing:'-0.01em' }}>Tezkor amallar</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { icon:UserPlus,   label:"O'quvchi qo'shish",  onClick:()=>setSModal(true),       color:B },
                  { icon:Users,      label:"O'qituvchi qo'shish", onClick:()=>setTModal(true),       color:'#3b82f6' },
                  { icon:Layers,     label:'Guruh yaratish',       onClick:()=>navigate('/groups'),   color:'#8b5cf6' },
                  { icon:CreditCard, label:"To'lovlar",            onClick:()=>navigate('/payments'), color:'#f59e0b' },
                ].map(({ icon:Ic, label, onClick, color }, i) => (
                  <button key={i} className="adp-qa" onClick={onClick} style={{ border:`1px solid ${bord}`, borderRadius:14, padding:'16px 14px', background:'transparent', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:10, transition:'background .14s,transform .18s' }}
                    onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ width:36, height:36, borderRadius:11, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${color}25` }}>
                      <Ic size={16} color={color} strokeWidth={2}/>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:tx, lineHeight:1.3 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background:`linear-gradient(145deg,${BD},${B},${BL})`, border:'none', borderRadius:20, padding:'22px 24px', boxShadow:'0 8px 30px rgba(66,122,67,0.28)', position:'relative', overflow:'hidden', animation:'slideUp .4s ease .27s both' }}>
              <div style={{ position:'absolute', right:-40, top:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Jami daromad</p>
                  <p style={{ fontSize:34, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-0.02em' }}>
                    {fmt(stats.revenue)}<span style={{ fontSize:14, fontWeight:500, marginLeft:6, opacity:.7 }}>so'm</span>
                  </p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:99, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)' }}>
                  <TrendingUp size={11} color="#fff"/>
                  <span style={{ fontSize:11, fontWeight:700, color:'#fff' }}>+12%</span>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:"To'lovlar", value:stats.payments },
                  { label:'Kurslar',   value:stats.courses.total },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding:'14px', borderRadius:14, background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)' }}>
                    <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{value}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:3 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* O'QUVCHILAR LISTA */}
          <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .30s both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, letterSpacing:'-0.01em' }}>O'quvchilar</p>
              <button onClick={() => setSModal(true)} style={{ padding:'8px 16px', borderRadius:10, background:`linear-gradient(135deg,${BD},${BL})`, border:'none', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <GraduationCap size={14}/> Qo'shish
              </button>
            </div>
            {students.length === 0 ? (
              <div style={{ textAlign:'center', padding:'30px 20px', color:mu }}>
                <GraduationCap size={40} style={{ marginBottom:12, opacity:0.4 }}/>
                <p style={{ fontSize:13 }}>O'quvchilar topilmadi</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {students.slice(0,5).map(student => (
                  <div key={student.id} style={{ padding:'12px 14px', borderRadius:10, background:D?'rgba(255,255,255,0.02)':'#fafbfa', border:`1px solid ${bord}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
                        {(student.user?.name || student.name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:tx }}>{student.user?.name || student.name || "O'quvchi"}</p>
                        <p style={{ fontSize:11, color:mu }}>{student.group?.name || 'Guruh belgilanmagan'}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'4px 8px', borderRadius:99, background:student.status==='active'?'rgba(34,197,94,0.12)':'rgba(148,163,184,0.12)', color:student.status==='active'?'#22c55e':'#94a3b8' }}>
                        {student.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                      <button onClick={() => navigate('/students-panel')} style={{ padding:'6px 12px', borderRadius:8, background:D?'rgba(66,122,67,0.15)':'rgba(66,122,67,0.08)', color:B, border:`1px solid ${D?'rgba(66,122,67,0.25)':'rgba(66,122,67,0.18)'}`, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                        <ChevronRight size={12}/> Ko'rish
                      </button>
                    </div>
                  </div>
                ))}
                {students.length > 5 && (
                  <button onClick={() => navigate('/students-panel')} style={{ marginTop:4, padding:'10px', borderRadius:10, background:D?'rgba(255,255,255,0.02)':'#fafbfa', border:`1px solid ${bord}`, fontSize:12, fontWeight:600, color:mu, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    Barcha {students.length} ta o'quvchini ko'rish <ChevronRight size={12}/>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* O'QITUVCHIGA GURUH BIRIKTIRISH */}
          <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .33s both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, letterSpacing:'-0.01em' }}>O'qituvchiga guruh biriktirish</p>
              <button onClick={() => setGModal(true)} style={{ padding:'8px 16px', borderRadius:10, background:`linear-gradient(135deg,${BD},${BL})`, border:'none', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <Users size={14}/> Biriktirish
              </button>
            </div>
            {teachers.length === 0 ? (
              <div style={{ textAlign:'center', padding:'30px 20px', color:mu }}>
                <Users size={40} style={{ marginBottom:12, opacity:0.4 }}/>
                <p style={{ fontSize:13 }}>O'qituvchilar topilmadi</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {teachers.slice(0,5).map(teacher => (
                  <div key={teacher.id} style={{ padding:'12px 14px', borderRadius:10, background:D?'rgba(255,255,255,0.02)':'#fafbfa', border:`1px solid ${bord}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
                        {(teacher.user?.name || teacher.name || 'T')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:tx }}>{teacher.user?.name || teacher.name || "O'qituvchi"}</p>
                        <p style={{ fontSize:11, color:mu }}>{(teacher.groups||[]).length} ta guruh</p>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedTeacher(teacher); setSelectedGroupsForTeacher((teacher.groups||[]).map(g=>g.id)); setGModal(true); }}
                      style={{ padding:'6px 12px', borderRadius:8, background:D?'rgba(66,122,67,0.15)':'rgba(66,122,67,0.08)', color:B, border:`1px solid ${D?'rgba(66,122,67,0.25)':'rgba(66,122,67,0.18)'}`, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      <Layers size={12}/> Guruhlar
                    </button>
                  </div>
                ))}
                {teachers.length > 5 && (
                  <button onClick={() => navigate('/teachers')} style={{ marginTop:4, padding:'10px', borderRadius:10, background:D?'rgba(255,255,255,0.02)':'#fafbfa', border:`1px solid ${bord}`, fontSize:12, fontWeight:600, color:mu, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    Barcha {teachers.length} ta o'qituvchini ko'rish <ChevronRight size={12}/>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* BO'LIMLAR */}
          <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .36s both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, letterSpacing:'-0.01em' }}>Bo'limlar</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
              {[
                { icon:GraduationCap, label:"O'quvchilar",   total:stats.students.total, active:stats.students.active, path:'/students-panel', color:B,        pale:'rgba(66,122,67,0.10)' },
                { icon:Users,         label:"O'qituvchilar", total:stats.teachers.total, active:stats.teachers.active, path:'/teachers',       color:'#3b82f6', pale:'rgba(59,130,246,0.10)' },
                { icon:BookOpen,      label:'Kurslar',        total:stats.courses.total,  active:stats.courses.active,  path:'/courses',        color:'#f59e0b', pale:'rgba(245,158,11,0.10)' },
              ].map(({ icon:Ic, label, total, active, path, color, pale }) => {
                const pct = total > 0 ? Math.round(active/total*100) : 0;
                return (
                  <div key={path} className="adp-card-hover" onClick={() => navigate(path)} style={{ padding:'16px', borderRadius:14, border:`1px solid ${bord}`, background:D?'rgba(255,255,255,0.03)':'#fafbfa', display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:pale, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${color}22` }}>
                        <Ic size={16} color={color}/>
                      </div>
                      <span style={{ fontSize:11, color:mu }}>{active} / {total}</span>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:tx, marginBottom:8 }}>{label}</p>
                      <div style={{ height:5, background:D?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${BD},${BL})`, borderRadius:99, transition:'width 1s ease' }}/>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                        <span style={{ fontSize:10, color:mu }}>Faollik</span>
                        <span style={{ fontSize:10, fontWeight:700, color:B }}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GURUHLAR */}
          <div style={{ background:card, border:`1px solid ${bord}`, borderRadius:20, padding:'20px 22px', boxShadow:D?'none':'0 1px 3px rgba(0,0,0,0.05)', animation:'slideUp .4s ease .39s both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:800, color:tx, letterSpacing:'-0.01em' }}>Guruhlar</p>
              <button onClick={() => navigate('/groups')} style={{ fontSize:11, color:'#8b5cf6', fontWeight:700, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                Barchasi <ChevronRight size={12}/>
              </button>
            </div>
            {groupsList.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:mu }}>
                <Layers size={40} style={{ marginBottom:12, opacity:0.4 }}/>
                <p style={{ fontSize:13 }}>Guruhlar topilmadi</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
                {groupsList.slice(0,6).map(g => {
                  const sc  = g.currentStudents || 0;
                  const max = g.maxStudents || 20;
                  const pct = max ? Math.round(sc/max*100) : 0;
                  const statusColor = g.status==='active'?'#22c55e':g.status==='completed'?'#3b82f6':'#ef4444';
                  const statusBg    = g.status==='active'?'rgba(34,197,94,0.10)':g.status==='completed'?'rgba(59,130,246,0.10)':'rgba(239,68,68,0.10)';
                  return (
                    <div key={g.id} style={{ padding:'16px', borderRadius:14, border:`1px solid ${bord}`, background:D?'rgba(255,255,255,0.02)':'#fafbfa', display:'flex', flexDirection:'column', gap:12, transition:'transform 0.2s,box-shadow 0.2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.08)'}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
                            {g.name?.substring(0,2)?.toUpperCase()||'GR'}
                          </div>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:tx }}>{g.name}</p>
                            {(g.courseTitle||g.course?.title) && <p style={{ fontSize:11, color:mu, marginTop:2 }}>{g.courseTitle||g.course?.title}</p>}
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:600, padding:'4px 8px', borderRadius:6, background:statusBg, color:statusColor, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                          {g.status==='active'?'Faol':g.status==='completed'?'Tugatildi':'Bekor'}
                        </span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:11, color:mu }}>O'quvchilar</span>
                            <span style={{ fontSize:11, fontWeight:600, color:tx }}>{sc} / {max}</span>
                          </div>
                          <div style={{ height:5, background:D?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${BD},${BL})`, borderRadius:99, transition:'width 1s ease' }}/>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/attendance?groupId=${g.id}`)} style={{ padding:'6px 12px', borderRadius:8, background:D?'rgba(66,122,67,0.15)':'rgba(66,122,67,0.08)', color:B, border:`1px solid ${D?'rgba(66,122,67,0.25)':'rgba(66,122,67,0.18)'}`, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap', transition:'all 0.2s' }}
                          onMouseEnter={e=>{e.currentTarget.style.background=B;e.currentTarget.style.color='#fff'}}
                          onMouseLeave={e=>{e.currentTarget.style.background=D?'rgba(66,122,67,0.15)':'rgba(66,122,67,0.08)';e.currentTarget.style.color=B}}>
                          <Calendar size={12}/> Davomat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* STUDENT MODAL */}
      <Modal open={sModal} title="Yangi o'quvchi" subtitle="Ma'lumotlarni to'ldiring" onClose={() => setSModal(false)} onSubmit={handleStudentSubmit} loading={mLoading} D={D}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
          {[
            { label:"To'liq ism", k:'name',     type:'text',     pl:'Ism Familiya' },
            { label:'Email',      k:'email',    type:'email',    pl:'email@example.com' },
            { label:'Telefon',    k:'phone',    type:'text',     pl:'+998 90 123 45 67' },
            { label:'Parol',      k:'password', type:'password', pl:'Kamida 8 belgi' },
          ].map(f => (
            <div key={f.k}>
              <label style={lbl}>{f.label}</label>
              <input required type={f.type} placeholder={f.pl} value={sForm[f.k]} onChange={e => setSForm(p => ({ ...p, [f.k]:e.target.value }))} style={inpStyle}/>
            </div>
          ))}
        </div>
        <div>
          <label style={lbl}>Guruh (ixtiyoriy)</label>
          <select value={sForm.groupId} onChange={e => setSForm(p => ({ ...p, groupId:e.target.value }))} style={inpStyle}>
            <option value="">— Tanlanmagan —</option>
            {groups.filter(g => g.status==='active'||!g.status).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </Modal>

      {/* TEACHER MODAL */}
      <Modal open={tModal} title="Yangi o'qituvchi" subtitle="Ma'lumotlarni to'ldiring" onClose={() => setTModal(false)} onSubmit={handleTeacherSubmit} loading={mLoading} D={D}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
          {[
            { label:"To'liq ism", k:'name',     type:'text',     pl:'Ism Familiya' },
            { label:'Email',      k:'email',    type:'email',    pl:'email@example.com' },
            { label:'Telefon',    k:'phone',    type:'text',     pl:'+998 90 123 45 67' },
            { label:'Parol',      k:'password', type:'password', pl:'Kamida 8 belgi' },
          ].map(f => (
            <div key={f.k}>
              <label style={lbl}>{f.label}</label>
              <input required type={f.type} placeholder={f.pl} value={tForm[f.k]} onChange={e => setTForm(p => ({ ...p, [f.k]:e.target.value }))} style={inpStyle}/>
            </div>
          ))}
        </div>
        <div>
          <label style={lbl}>Mutaxassislik</label>
          <select value={tForm.specialization} onChange={e => setTForm(p => ({ ...p, specialization:e.target.value }))} style={inpStyle}>
            {['Frontend Developer (React/Next.js)','Backend Developer (Node.js/Go/Python)','Full-stack Web Developer','Mobile App Developer (Flutter/RN)','UI/UX Designer','Cyber Security Specialist','Data Scientist / AI Engineer','DevOps Engineer'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
          <div>
            <label style={lbl}>Malaka</label>
            <select value={tForm.qualification} onChange={e => setTForm(p => ({ ...p, qualification:e.target.value }))} style={inpStyle}>
              {["Oliy ma'lumotli",'Magistr','PhD','Bakalavr',"O'rta maxsus"].map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Holat</label>
            <select value={tForm.status} onChange={e => setTForm(p => ({ ...p, status:e.target.value }))} style={inpStyle}>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* GURUH BIRIKTIRISH MODAL */}
      {gModal && (
        <div style={{ position:'fixed', inset:0, zIndex:80, background:'rgba(0,0,0,0.60)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ width:'100%', maxWidth:500, borderRadius:22, background:card, border:`1px solid ${bord}`, boxShadow:'0 30px 80px rgba(0,0,0,0.25)', maxHeight:'85vh', display:'flex', flexDirection:'column', animation:'fadeIn .25s ease both' }}>
            <div style={{ padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${bord}`, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${BD},${BL})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Layers size={16} color="#fff"/>
                </div>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:tx }}>Guruh biriktirish</p>
                  <p style={{ fontSize:11, color:mu }}>{selectedTeacher?.user?.name || selectedTeacher?.name || "O'qituvchi"}</p>
                </div>
              </div>
              <button onClick={() => { setGModal(false); setSelectedTeacher(null); setSelectedGroupsForTeacher([]); }} style={{ width:32, height:32, borderRadius:9, background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:mu }}>
                <X size={14}/>
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleGroupAssignment(); }} style={{ padding:'20px 22px', overflowY:'auto', display:'flex', flexDirection:'column', gap:13 }}>
              <p style={{ fontSize:11, fontWeight:600, color:mu }}>{selectedGroupsForTeacher.length} ta guruh tanlangan</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {groupsList.map(group => {
                  const isSelected = selectedGroupsForTeacher.includes(group.id);
                  return (
                    <label key={group.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:`1px solid ${isSelected?B:bord}`, background:isSelected?`${B}10`:'transparent', cursor:'pointer', transition:'all 0.2s' }}>
                      <input type="checkbox" checked={isSelected} onChange={e => { if(e.target.checked) setSelectedGroupsForTeacher([...selectedGroupsForTeacher,group.id]); else setSelectedGroupsForTeacher(selectedGroupsForTeacher.filter(id=>id!==group.id)); }} style={{ display:'none' }}/>
                      <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${isSelected?B:mu}`, background:isSelected?B:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {isSelected && <CheckCircle size={14} color="#fff"/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:tx }}>{group.name}</p>
                        <p style={{ fontSize:11, color:mu }}>{group.currentStudents||0}/{group.maxStudents||20} o'quvchi</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                <button type="button" onClick={() => { setGModal(false); setSelectedTeacher(null); setSelectedGroupsForTeacher([]); }} style={{ flex:1, padding:'12px', borderRadius:13, background:'transparent', border:`1px solid ${bord}`, fontSize:13, fontWeight:600, color:mu, cursor:'pointer' }}>Bekor</button>
                <button type="submit" disabled={mLoading} style={{ flex:2, padding:'12px', borderRadius:13, background:`linear-gradient(135deg,${BD},${BL})`, border:'none', fontSize:13, fontWeight:700, color:'#fff', cursor:mLoading?'not-allowed':'pointer', opacity:mLoading?0.6:1, boxShadow:'0 4px 14px rgba(66,122,67,0.30)', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  {mLoading ? <><RotateCw size={13} style={{ animation:'spin .9s linear infinite' }}/> Saqlanmoqda...</> : <><Layers size={13}/> Biriktirish</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}