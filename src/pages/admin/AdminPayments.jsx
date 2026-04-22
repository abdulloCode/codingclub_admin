import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  CreditCard, FileText, Plus, CheckCircle, XCircle,
  Eye, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw,
  ChevronRight, ChevronLeft, X, AlertCircle, Clock, Check,
  PieChart, User, Building2, GraduationCap, Percent
} from 'lucide-react';

// ─── THEME ───────────────────────────────────────────────────
const getColors = (isDarkMode) => ({
  brand:     '#427A43',
  brandDark: '#2d5630',
  brandLight:'#5a9e5b',
  bg:        isDarkMode ? '#0f0f12' : '#f0f4f0',
  cardBg:    isDarkMode ? '#1a1a1e' : '#ffffff',
  cardAlt:   isDarkMode ? '#242428' : '#f6faf6',
  border:    isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(66,122,67,0.15)',
  text:      isDarkMode ? '#ffffff' : '#0f172a',
  muted:     isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
  success:   '#22c55e',
  warning:   '#f59e0b',
  danger:    '#ef4444',
  info:      '#3b82f6',
  teacher:   '#8b5cf6',
  center:    '#14b8a6',
});

// ─── UTILS ───────────────────────────────────────────────────
const fmtMoney = (n) =>
  new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0)) + " so'm";

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const isCreditPayment = (p) => p?.type === 'credit' || p?.dk === 'credit';

// ─── TAQSIMOT HISOBLASH ──────────────────────────────────────
// teacher.salaryPercentage → teacher ulushi
// qolgan qism             → markaz ulushi
const calcDistribution = (amount, teacherPercent) => {
  const pct        = Number(teacherPercent) || 0;
  const teacherShare = Math.round((amount * pct) / 100);
  const centerShare  = amount - teacherShare;
  return { teacherShare, centerShare, teacherPercent: pct, centerPercent: 100 - pct };
};

// teacher foizini payment ob'ektidan olish
const getTeacherPct = (pay, teachers) => {
  if (pay.teacher?.salaryPercentage != null)        return Number(pay.teacher.salaryPercentage);
  if (pay.teacherPercent != null)                   return Number(pay.teacherPercent);
  if (pay.group?.teacher?.salaryPercentage != null) return Number(pay.group.teacher.salaryPercentage);
  const tid = pay.teacherId || pay.group?.teacherId || pay.group?.teacher?.id;
  if (tid) { const t = teachers.find(t => t.id === tid); if (t?.salaryPercentage != null) return Number(t.salaryPercentage); }
  return 20; // default
};

const getTeacherName = (pay) =>
  pay.teacher?.name || pay.teacher?.user?.name ||
  pay.group?.teacher?.name || pay.group?.teacher?.user?.name || "O'qituvchi";

const inputStyle = (C) => ({
  width: '100%', background: C.cardAlt, border: `1px solid ${C.border}`,
  color: C.text, borderRadius: 10, padding: '10px 14px', fontSize: 14,
  outline: 'none', fontFamily: 'inherit',
});

// ─── BADGES ──────────────────────────────────────────────────
const StatusBadge = ({ status, C }) => {
  const map = {
    pending:  { color: C.warning, bg: `${C.warning}22`, Icon: Clock,       label: 'Kutilmoqda'   },
    approved: { color: C.success, bg: `${C.success}22`, Icon: CheckCircle, label: 'Tasdiqlangan' },
    rejected: { color: C.danger,  bg: `${C.danger}22`,  Icon: XCircle,     label: 'Rad etilgan'  },
  };
  const { color, bg, Icon, label } = map[status] || map.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background:bg, color, fontSize:11, fontWeight:600 }}>
      <Icon size={10}/> {label}
    </span>
  );
};

const TypeBadge = ({ payment, C }) => {
  const ok = isCreditPayment(payment);
  const Icon = ok ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background: ok?`${C.success}22`:`${C.danger}22`, color: ok?C.success:C.danger, fontSize:11, fontWeight:600 }}>
      <Icon size={10}/> {ok?'Kirim':'Chiqim'}
    </span>
  );
};

// ─── TAQSIMOT KARTA (to'lov ichida) ─────────────────────────
const DistributionCard = ({ payment, teachers, C }) => {
  const teacherPercent = getTeacherPct(payment, teachers);
  const { teacherShare, centerShare, centerPercent } = calcDistribution(payment.amount, teacherPercent);
  const tName = getTeacherName(payment);

  return (
    <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 10, background: C.cardBg, border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Taqsimot
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: `${C.teacher}12`, border: `1px solid ${C.teacher}25` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <GraduationCap size={13} color={C.teacher}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.teacher }}>{tName}</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmtMoney(teacherShare)}</p>
          <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{teacherPercent}% ulush</p>
        </div>
        <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: `${C.center}12`, border: `1px solid ${C.center}25` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Building2 size={13} color={C.center}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.center }}>O'quv markaz</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmtMoney(centerShare)}</p>
          <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{centerPercent}% ulush</p>
        </div>
      </div>
      <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: C.cardAlt, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${teacherPercent}%`, background: `linear-gradient(90deg, ${C.teacher}, ${C.center})`, borderRadius: 99 }}/>
      </div>
    </div>
  );
};

// ─── UMUMIY TAQSIMOT STATISTIKA ─────────────────────────────
const DistributionStats = ({ payments, teachers, C }) => {
  const stats = useMemo(() => {
    const credits = payments.filter(isCreditPayment);
    let totalTeacher = 0, totalCenter = 0;
    const byTeacher = {};

    credits.forEach(p => {
      const pct = getTeacherPct(p, teachers);
      const { teacherShare, centerShare } = calcDistribution(p.amount, pct);
      totalTeacher += teacherShare;
      totalCenter  += centerShare;

      const tid   = p.teacherId || p.group?.teacherId || p.group?.teacher?.id || p.teacher?.id || 'unknown';
      const tName = getTeacherName(p);
      if (!byTeacher[tid]) byTeacher[tid] = { name: tName, total: 0, pct };
      byTeacher[tid].total += teacherShare;
    });

    return { totalTeacher, totalCenter, byTeacher: Object.values(byTeacher) };
  }, [payments, teachers]);

  const total = stats.totalTeacher + stats.totalCenter;

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <PieChart size={16} color={C.brand}/>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Umumiy taqsimot</h3>
        <span style={{ fontSize: 12, color: C.muted, marginLeft: 'auto' }}>
          Jami: {fmtMoney(total)}
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: C.teacher }}/>
            <span style={{ fontSize: 12, color: C.muted }}>O'qituvchilar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: C.muted }}>O'quv markaz</span>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: C.center }}/>
          </div>
        </div>
        <div style={{ height: 12, borderRadius: 99, background: C.cardAlt, overflow: 'hidden', display: 'flex' }}>
          {total > 0 && <>
            <div style={{ height: '100%', width: `${(stats.totalTeacher/total)*100}%`, background: C.teacher, transition: 'width 0.6s ease' }}/>
            <div style={{ height: '100%', flex: 1, background: C.center }}/>
          </>}
        </div>
      </div>

      {/* Summalar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: stats.byTeacher.length > 0 ? 16 : 0 }}>
        <div style={{ padding: '14px 16px', borderRadius: 12, background: `${C.teacher}10`, border: `1px solid ${C.teacher}25` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <GraduationCap size={14} color={C.teacher}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.teacher, textTransform: 'uppercase', letterSpacing: '0.05em' }}>O'qituvchilar</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{fmtMoney(stats.totalTeacher)}</p>
          {total > 0 && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{Math.round((stats.totalTeacher/total)*100)}% umumiydan</p>}
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 12, background: `${C.center}10`, border: `1px solid ${C.center}25` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Building2 size={14} color={C.center}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.center, textTransform: 'uppercase', letterSpacing: '0.05em' }}>O'quv markaz</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{fmtMoney(stats.totalCenter)}</p>
          {total > 0 && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{Math.round((stats.totalCenter/total)*100)}% umumiydan</p>}
        </div>
      </div>

      {/* Teacher bo'yicha breakdown */}
      {stats.byTeacher.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            O'qituvchilar bo'yicha
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.byTeacher.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: C.cardAlt }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.teacher}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={13} color={C.teacher}/>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</p>
                    <p style={{ fontSize: 10, color: C.muted }}>{t.pct}% komissiya</p>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.teacher }}>{fmtMoney(t.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CONFIRM MODAL ───────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel, C }) => (
  <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:16, width:'100%', maxWidth:400, padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`${C.danger}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <AlertCircle size={18} color={C.danger}/>
        </div>
        <h3 style={{ fontSize:15, fontWeight:700, color:C.text }}>Tasdiqlash</h3>
      </div>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>{message}</p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onCancel} style={{ flex:1, padding:10, borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>Bekor</button>
        <button onClick={onConfirm} style={{ flex:1, padding:10, borderRadius:10, background:`linear-gradient(135deg,${C.danger},#b91c1c)`, color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>O'chirish</button>
      </div>
    </div>
  </div>
);

// ─── REJECT MODAL ────────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel, C }) => {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:16, width:'100%', maxWidth:420, padding:24 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:12 }}>Rad etish sababi</h3>
        <textarea placeholder="Sababni kiriting..." value={reason} onChange={e=>setReason(e.target.value)}
          style={{ width:'100%', minHeight:90, resize:'vertical', marginBottom:16, background:C.cardAlt, border:`1px solid ${C.border}`, color:C.text, borderRadius:10, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }}/>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:10, borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>Bekor</button>
          <button onClick={()=>reason.trim()&&onConfirm(reason.trim())} disabled={!reason.trim()}
            style={{ flex:1, padding:10, borderRadius:10, border:'none', background:reason.trim()?`linear-gradient(135deg,${C.danger},#b91c1c)`:`${C.danger}40`, color:'#fff', fontSize:13, fontWeight:600, cursor:reason.trim()?'pointer':'not-allowed' }}>
            Rad etish
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL WRAPPER ───────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children, C }) => (
  <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:18, width:'100%', maxWidth:520, maxHeight:'88vh', overflowY:'auto', padding:26, animation:'ap_fadeIn 0.25s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
        <div>
          <h3 style={{ fontSize:17, fontWeight:700, color:C.text }}>{title}</h3>
          {subtitle && <p style={{ fontSize:12, color:C.muted, marginTop:3 }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <X size={15}/>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children, C }) => (
  <div>
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.muted, marginBottom:6 }}>{label}</label>
    {children}
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function AdminPayments() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const C = getColors(isDarkMode);

  const [activeTab,        setActiveTab]        = useState('payments');
  const [loading,          setLoading]          = useState(true);
  const [payments,         setPayments]         = useState([]);
  const [filteredPays,     setFilteredPays]     = useState([]);
  const [paymentTypes,     setPaymentTypes]     = useState([]);
  const [groups,           setGroups]           = useState([]);
  const [teachers,         setTeachers]         = useState([]); // ← salaryPercentage uchun
  const [groupStudents,    setGroupStudents]    = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [expandedPay,      setExpandedPay]      = useState(null);

  const [filterMonth,  setFilterMonth]  = useState('');
  const [filterGroup,  setFilterGroup]  = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showCreate,  setShowCreate]  = useState(false);
  const [showType,    setShowType]    = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selPayment,  setSelPayment]  = useState(null);
  const [confirmMod,  setConfirmMod]  = useState(null);
  const [rejectMod,   setRejectMod]   = useState(null);
  const [modalLoad,   setModalLoad]   = useState(false);
  const [toast,       setToast]       = useState(null);

  const initPayForm = () => ({
    type: '', amount: '', toWho: '', groupId: '',
    month: new Date().toISOString().slice(0, 7), comment: '',
  });
  const [payForm, setPayForm] = useState(initPayForm());
  const setPF = (patch) => setPayForm(p => ({ ...p, ...patch }));
  const [typeForm, setTypeForm] = useState({ name: '', code: '', dk: 'credit', description: '' });

  const [page, setPage] = useState(1);
  const PER = 10;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── FETCH ─────────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterMonth)  params.month   = filterMonth;
      if (filterGroup)  params.groupId = filterGroup;
      if (filterTypeId) params.typeId  = filterTypeId;
      const data = await apiService.getPayments(params);
      const list = Array.isArray(data) ? data : (data?.payments || data?.data || []);
      setPayments(list);
      setFilteredPays(list);
    } catch { showToast("To'lovlarni olishda xatolik", 'error'); }
    finally  { setLoading(false); }
  }, [filterMonth, filterGroup, filterTypeId]);

  const fetchTypes    = useCallback(async () => {
    try { const d = await apiService.getPaymentTypes(true); setPaymentTypes(Array.isArray(d) ? d : (d?.paymentTypes || d?.data || [])); } catch {}
  }, []);

  const fetchGroups   = useCallback(async () => {
    try { const d = await apiService.getGroups(); setGroups(Array.isArray(d) ? d : (d?.groups || [])); } catch {}
  }, []);

  const fetchTeachers = useCallback(async () => {
    try { const d = await apiService.getTeachers(); setTeachers(Array.isArray(d) ? d : (d?.teachers || d?.data || [])); } catch {}
  }, []);

  useEffect(() => {
    Promise.all([fetchPayments(), fetchTypes(), fetchGroups(), fetchTeachers()]);
  }, [fetchPayments, fetchTypes, fetchGroups, fetchTeachers]);

  useEffect(() => {
    if (!payForm.groupId || !showCreate) { setGroupStudents([]); return; }
    setFetchingStudents(true);
    apiService.getGroupStudents(payForm.groupId)
      .then(d => setGroupStudents(Array.isArray(d) ? d : (d?.students || d?.data || [])))
      .catch(() => setGroupStudents([]))
      .finally(() => setFetchingStudents(false));
  }, [payForm.groupId, showCreate]);

  useEffect(() => {
    setFilteredPays(filterStatus ? payments.filter(p => p.status === filterStatus) : [...payments]);
    setPage(1);
  }, [filterStatus, payments]);

  // ─── CRUD ──────────────────────────────────────────────────
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!payForm.type)                           return showToast("To'lov turini tanlang", 'error');
    if (!payForm.amount || +payForm.amount <= 0) return showToast("To'g'ri summani kiriting", 'error');
    if (!payForm.toWho)                          return showToast("O'quvchini tanlang", 'error');
    if (!payForm.month)                          return showToast("Oyni tanlang", 'error');

    setModalLoad(true);
    try {
      await apiService.createPayment({
        type: payForm.type, amount: Number(payForm.amount), toWho: payForm.toWho,
        month: payForm.month, date: new Date().toISOString().split('T')[0],
        ...(payForm.comment ? { comment: payForm.comment } : {}),
      });
      showToast("To'lov muvaffaqiyatli yaratildi!");
      setShowCreate(false); setPayForm(initPayForm()); setGroupStudents([]);
      fetchPayments();
    } catch (e) {
      const msg = e.message || "";
      const isAlreadyRecorded = msg.includes("already recorded") || msg.includes("Payment already") || msg.includes("Ma'lumotlar noto'g'ri");
      if (!isAlreadyRecorded) { showToast(msg || "Xatolik", 'error'); setModalLoad(false); return; }

      try {
        const existing = await apiService.getPayments({ month: payForm.month });
        const list = Array.isArray(existing) ? existing : (existing?.payments || existing?.data || []);
        const found = list.find(p => {
          const toWhoId = p.toWho?.id || p.toWho?._id || p.toWhoId || p.toWho;
          const typeId  = p.type?.id  || p.type?._id  || p.typeId  || p.type;
          return String(toWhoId) === String(payForm.toWho) && String(typeId) === String(payForm.type);
        });
        if (!found) { showToast("Mavjud to'lov topilmadi", 'error'); setModalLoad(false); return; }

        const foundId = found.id || found._id;
        const newAmount = (Number(found.amount) || 0) + Number(payForm.amount);
        const confirmed = window.confirm(
          `⚠️ Bu o'quvchi uchun ${payForm.month} oyida to'lov allaqachon mavjud!\n\nMavjud: ${(Number(found.amount)||0).toLocaleString()} so'm\nQo'shilmoqda: ${Number(payForm.amount).toLocaleString()} so'm\nYangi jami: ${newAmount.toLocaleString()} so'm\n\nTasdiqlaysizmi?`
        );
        if (!confirmed) { setModalLoad(false); return; }

        await apiService.updatePayment(foundId, {
          amount: newAmount,
          comment: [found.comment, payForm.comment].filter(Boolean).join(' | ') || "Qo'shimcha to'lov",
        });
        showToast(`✅ Yangilandi! Jami: ${newAmount.toLocaleString()} so'm`);
        setShowCreate(false); setPayForm(initPayForm()); setGroupStudents([]);
        fetchPayments();
      } catch (err) { showToast(err.message || "Yangilashda xatolik", 'error'); }
    } finally { setModalLoad(false); }
  };

  const handleCreateType = async (e) => {
    e.preventDefault(); setModalLoad(true);
    try {
      await apiService.createPaymentType(typeForm);
      showToast("To'lov turi yaratildi!"); setShowType(false);
      setTypeForm({ name: '', code: '', dk: 'credit', description: '' }); fetchTypes();
    } catch (e) { showToast(e.message || "Xatolik", 'error'); }
    finally    { setModalLoad(false); }
  };

  const handleApprove = async (id) => {
    try { await apiService.approvePayment(id); showToast("Tasdiqlandi!"); fetchPayments(); }
    catch (e) { showToast(e.message || "Xatolik", 'error'); }
  };

  const handleReject = (id) => setRejectMod({ id });
  const confirmReject = async (reason) => {
    const { id } = rejectMod; setRejectMod(null);
    try { await apiService.rejectPayment(id, reason); showToast("Rad etildi!"); fetchPayments(); }
    catch (e) { showToast(e.message || "Xatolik", 'error'); }
  };

  const handleDelete = (id) => setConfirmMod({
    message: "Ushbu to'lovni o'chirishni tasdiqlaysizmi?",
    onConfirm: async () => {
      setConfirmMod(null);
      try { await apiService.deletePayment(id); showToast("O'chirildi!"); fetchPayments(); }
      catch (e) { showToast(e.message || "Xatolik", 'error'); }
    }
  });

  const handleDeleteType = (id) => setConfirmMod({
    message: "Bu to'lov turini o'chirishni tasdiqlaysizmi?",
    onConfirm: async () => {
      setConfirmMod(null);
      try { await apiService.deletePaymentType(id); showToast("O'chirildi!"); fetchTypes(); }
      catch (e) { showToast(e.message || "Xatolik", 'error'); }
    }
  });

  const paginated  = useMemo(() => filteredPays.slice((page-1)*PER, page*PER), [filteredPays, page]);
  const totalPages = Math.ceil(filteredPays.length / PER);

  const tabs = [
    { id: 'payments',     label: "To'lovlar",      icon: CreditCard },
    { id: 'distribution', label: "Taqsimot",       icon: PieChart   },
    { id: 'types',        label: "To'lov turlari", icon: FileText   },
  ];

  // ─── SELECTED GROUP TEACHER PCT (modal preview) ──────────
  const selectedGroupTeacherPct = useMemo(() => {
    if (!payForm.groupId) return 20;
    const grp = groups.find(g => g.id === payForm.groupId);
    const tid = grp?.teacherId || grp?.teacher?.id;
    if (grp?.teacher?.salaryPercentage != null) return Number(grp.teacher.salaryPercentage);
    if (tid) { const t = teachers.find(t => t.id === tid); if (t?.salaryPercentage != null) return Number(t.salaryPercentage); }
    return 20;
  }, [payForm.groupId, groups, teachers]);

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        @keyframes ap_fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ap_slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ap_spin    { to{transform:rotate(360deg)} }
        .ap-spin { animation: ap_spin 1s linear infinite; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        input[type=month]::-webkit-calendar-picker-indicator,
        input[type=date]::-webkit-calendar-picker-indicator { filter:${isDarkMode?'invert(1)':'none'}; cursor:pointer; }
      `}</style>

      <div style={{ minHeight:'100vh', background:C.bg }}>

        {/* Header */}
        <div style={{ background:`${C.cardBg}dd`, backdropFilter:'blur(20px)', borderBottom:`1px solid ${C.border}`, padding:'14px 24px', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ maxWidth:1300, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:11, background:`linear-gradient(135deg,${C.brandDark},${C.brandLight})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${C.brand}40` }}>
                <CreditCard size={18} color="#fff"/>
              </div>
              <div>
                <h1 style={{ fontSize:18, fontWeight:700, color:C.text }}>To'lovlar</h1>
                <p style={{ fontSize:11, color:C.muted }}>To'lov qilish va boshqarish</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>navigate('/admin/reports')} style={{ padding:'8px 16px', borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, cursor:'pointer' }}>
                Hisobotlar
              </button>
              <button onClick={()=>navigate('/admin')} style={{ padding:'8px 14px', borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                <ChevronLeft size={14}/> Orqaga
              </button>
            </div>
          </div>
        </div>

        <main style={{ maxWidth:1300, margin:'0 auto', padding:24 }}>

          {/* Tabs */}
          <div style={{ display:'flex', gap:6, background:C.cardBg, borderRadius:14, padding:6, border:`1px solid ${C.border}`, marginBottom:24, overflowX:'auto' }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={()=>setActiveTab(id)} style={{ padding:'11px 20px', borderRadius:10, border:'none', background:active?`linear-gradient(135deg,${C.brandDark},${C.brandLight})`:'transparent', color:active?'#fff':C.muted, fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}>
                  <Icon size={15}/> {label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:360 }}>
              <div style={{ textAlign:'center' }}>
                <div className="ap-spin" style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.brand, margin:'0 auto 14px' }}/>
                <p style={{ color:C.muted, fontSize:13 }}>Yuklanmoqda...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ══ PAYMENTS TAB ══ */}
              {activeTab === 'payments' && (
                <div style={{ animation:'ap_fadeIn 0.3s ease' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:12 }}>
                    <div>
                      <h2 style={{ fontSize:18, fontWeight:700, color:C.text }}>Barcha to'lovlar</h2>
                      <p style={{ fontSize:12, color:C.muted }}>Jami {filteredPays.length} ta yozuv</p>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={()=>setShowCreate(true)} style={{ padding:'10px 18px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.brandDark},${C.brandLight})`, color:'#fff', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:7, cursor:'pointer', boxShadow:`0 4px 12px ${C.brand}40` }}>
                        <Plus size={15}/> To'lov qo'shish
                      </button>
                      <button onClick={fetchPayments} style={{ width:40, height:40, borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <RefreshCw size={15}/>
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:18 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12 }}>
                      {[
                        { label:'Oy', el: <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={inputStyle(C)}/> },
                        { label:'Guruh', el: (
                          <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} style={inputStyle(C)}>
                            <option value="">Barcha guruhlar</option>
                            {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        )},
                        { label:"To'lov turi", el: (
                          <select value={filterTypeId} onChange={e=>setFilterTypeId(e.target.value)} style={inputStyle(C)}>
                            <option value="">Barcha turlar</option>
                            {paymentTypes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        )},
                        { label:'Holat', el: (
                          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={inputStyle(C)}>
                            <option value="">Barcha holatlar</option>
                            <option value="pending">Kutilmoqda</option>
                            <option value="approved">Tasdiqlangan</option>
                            <option value="rejected">Rad etilgan</option>
                          </select>
                        )},
                      ].map(({ label, el }) => (
                        <div key={label}>
                          <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.muted, marginBottom:5 }}>{label}</label>
                          {el}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* List */}
                  <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
                    {paginated.length === 0 ? (
                      <div style={{ textAlign:'center', padding:60, color:C.muted }}>
                        <CreditCard size={44} style={{ marginBottom:12, opacity:0.25 }}/>
                        <p>To'lovlar topilmadi</p>
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {paginated.map((pay, idx) => {
                          const credit = isCreditPayment(pay);
                          const isExpanded = expandedPay === pay.id;
                          return (
                            <div key={pay.id} style={{ borderRadius:12, background:C.cardAlt, border:`1px solid ${C.border}`, animation:`ap_fadeIn 0.3s ease ${idx*0.04}s both`, overflow:'hidden' }}>
                              <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
                                <div style={{ width:46, height:46, borderRadius:10, flexShrink:0, background:credit?`${C.success}18`:`${C.danger}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  {credit ? <ArrowUpRight size={19} color={C.success}/> : <ArrowDownRight size={19} color={C.danger}/>}
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                                    <span style={{ fontSize:14, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                      {pay.description || pay.comment || "To'lov"}
                                    </span>
                                    <StatusBadge status={pay.status} C={C}/>
                                    <TypeBadge payment={pay} C={C}/>
                                  </div>
                                  <div style={{ display:'flex', gap:14, fontSize:11, color:C.muted, flexWrap:'wrap' }}>
                                    <span>{fmtDate(pay.date)}</span>
                                    {pay.month && <span>{pay.month}</span>}
                                    {pay.toWho?.name && <span>👤 {pay.toWho.name}</span>}
                                    {pay.group?.name && <span>🏫 {pay.group.name}</span>}
                                    {/* Teacher foizi badge */}
                                    {credit && (
                                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, color:C.teacher, fontWeight:600 }}>
                                        <Percent size={9}/>teacher: {getTeacherPct(pay, teachers)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ fontSize:17, fontWeight:700, color:credit?C.success:C.danger, flexShrink:0 }}>
                                  {credit?'+':'-'}{fmtMoney(pay.amount)}
                                </div>
                                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                                  {/* Taqsimot tugmasi — faqat kirim */}
                                  {credit && (
                                    <button onClick={()=>setExpandedPay(isExpanded ? null : pay.id)}
                                      title="Taqsimotni ko'rsatish"
                                      style={{ width:33, height:33, borderRadius:8, background:isExpanded?`${C.teacher}20`:'transparent', border:`1px solid ${isExpanded?C.teacher:C.border}`, color:isExpanded?C.teacher:C.muted, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                                      <PieChart size={13}/>
                                    </button>
                                  )}
                                  <button onClick={()=>{ setSelPayment(pay); setShowDetails(true); }} style={{ width:33, height:33, borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Eye size={13}/></button>
                                  {pay.status === 'pending' && (<>
                                    <button onClick={()=>handleApprove(pay.id)} style={{ width:33, height:33, borderRadius:8, background:`${C.success}15`, border:`1px solid ${C.success}30`, color:C.success, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Check size={13}/></button>
                                    <button onClick={()=>handleReject(pay.id)} style={{ width:33, height:33, borderRadius:8, background:`${C.danger}15`, border:`1px solid ${C.danger}30`, color:C.danger, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={13}/></button>
                                  </>)}
                                  <button onClick={()=>handleDelete(pay.id)} style={{ width:33, height:33, borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, color:C.danger, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Trash2 size={13}/></button>
                                </div>
                              </div>
                              {/* Kengaytirilgan taqsimot */}
                              {isExpanded && credit && (
                                <div style={{ padding:'0 16px 14px' }}>
                                  <DistributionCard payment={pay} teachers={teachers} C={C}/>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {totalPages > 1 && (
                      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
                        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'7px 12px', borderRadius:8, background:page===1?'transparent':C.cardAlt, border:`1px solid ${C.border}`, color:page===1?C.muted:C.text, fontSize:13, cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:4 }}>
                          <ChevronLeft size={13}/> Oldingi
                        </button>
                        <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{page} / {totalPages}</span>
                        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'7px 12px', borderRadius:8, background:page===totalPages?'transparent':C.cardAlt, border:`1px solid ${C.border}`, color:page===totalPages?C.muted:C.text, fontSize:13, cursor:page===totalPages?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:4 }}>
                          Keyingi <ChevronRight size={13}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ DISTRIBUTION TAB ══ */}
              {activeTab === 'distribution' && (
                <div style={{ animation:'ap_fadeIn 0.3s ease' }}>
                  <div style={{ marginBottom:18 }}>
                    <h2 style={{ fontSize:18, fontWeight:700, color:C.text }}>To'lov taqsimoti</h2>
                    <p style={{ fontSize:12, color:C.muted }}>Teacher va o'quv markaz ulushlarini ko'ring</p>
                  </div>

                  {/* Oy filtri */}
                  <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:18, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.muted, flexShrink:0 }}>Oy bo'yicha:</span>
                    <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{ ...inputStyle(C), maxWidth:200 }}/>
                    {filterMonth && (
                      <button onClick={()=>setFilterMonth('')} style={{ padding:'8px 14px', borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:12, cursor:'pointer' }}>
                        Tozalash
                      </button>
                    )}
                    <span style={{ fontSize:12, color:C.muted, marginLeft:'auto' }}>
                      {filteredPays.filter(isCreditPayment).length} ta kirim to'lov
                    </span>
                  </div>

                  {/* Umumiy statistika */}
                  <DistributionStats payments={filteredPays} teachers={teachers} C={C}/>

                  {/* Har bir to'lov uchun taqsimot */}
                  <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>Har bir to'lov bo'yicha</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {filteredPays.filter(isCreditPayment).length === 0 ? (
                        <div style={{ textAlign:'center', padding:40, color:C.muted }}>
                          <PieChart size={36} style={{ opacity:0.25, marginBottom:10 }}/>
                          <p>Kirim to'lovlar topilmadi</p>
                        </div>
                      ) : (
                        filteredPays.filter(isCreditPayment).map((pay, idx) => {
                          const tPct = getTeacherPct(pay, teachers);
                          const { teacherShare, centerShare, centerPercent } = calcDistribution(pay.amount, tPct);
                          const tName = getTeacherName(pay);
                          return (
                            <div key={pay.id} style={{ padding:'14px 16px', borderRadius:12, background:C.cardAlt, border:`1px solid ${C.border}`, animation:`ap_fadeIn 0.3s ease ${idx*0.03}s both` }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                                <div>
                                  <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{pay.description || pay.comment || "To'lov"}</p>
                                  <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                                    {fmtDate(pay.date)} · {pay.toWho?.name || '—'} · {pay.group?.name || '—'}
                                  </p>
                                </div>
                                <span style={{ fontSize:15, fontWeight:700, color:C.success }}>+{fmtMoney(pay.amount)}</span>
                              </div>
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                                <div style={{ padding:'10px 12px', borderRadius:8, background:`${C.teacher}10`, border:`1px solid ${C.teacher}20`, display:'flex', alignItems:'center', gap:10 }}>
                                  <GraduationCap size={15} color={C.teacher}/>
                                  <div>
                                    <p style={{ fontSize:10, color:C.teacher, fontWeight:700 }}>{tName} ({tPct}%)</p>
                                    <p style={{ fontSize:14, fontWeight:700, color:C.text }}>{fmtMoney(teacherShare)}</p>
                                  </div>
                                </div>
                                <div style={{ padding:'10px 12px', borderRadius:8, background:`${C.center}10`, border:`1px solid ${C.center}20`, display:'flex', alignItems:'center', gap:10 }}>
                                  <Building2 size={15} color={C.center}/>
                                  <div>
                                    <p style={{ fontSize:10, color:C.center, fontWeight:700 }}>O'quv markaz ({centerPercent}%)</p>
                                    <p style={{ fontSize:14, fontWeight:700, color:C.text }}>{fmtMoney(centerShare)}</p>
                                  </div>
                                </div>
                              </div>
                              <div style={{ marginTop:8, height:4, borderRadius:99, background:C.cardBg, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${tPct}%`, background:`linear-gradient(90deg,${C.teacher},${C.center})`, borderRadius:99 }}/>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ TYPES TAB ══ */}
              {activeTab === 'types' && (
                <div style={{ animation:'ap_fadeIn 0.3s ease' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                    <div>
                      <h2 style={{ fontSize:18, fontWeight:700, color:C.text }}>To'lov turlari</h2>
                      <p style={{ fontSize:12, color:C.muted }}>Jami {paymentTypes.length} ta tur</p>
                    </div>
                    <button onClick={()=>setShowType(true)} style={{ padding:'10px 18px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.brandDark},${C.brandLight})`, color:'#fff', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:7, cursor:'pointer' }}>
                      <Plus size={15}/> Tur qo'shish
                    </button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
                    {paymentTypes.map((t, i) => (
                      <div key={t.id} style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:16, padding:20, animation:`ap_slideUp 0.35s ease ${i*0.05}s both` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                          <div style={{ width:42, height:42, borderRadius:10, background:t.dk==='credit'?`${C.success}18`:`${C.danger}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {t.dk==='credit' ? <ArrowUpRight size={18} color={C.success}/> : <ArrowDownRight size={18} color={C.danger}/>}
                          </div>
                          <button onClick={()=>handleDeleteType(t.id)} style={{ width:30, height:30, borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, color:C.danger, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <Trash2 size={13}/>
                          </button>
                        </div>
                        <h3 style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:8 }}>{t.name}</h3>
                        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:t.dk==='credit'?`${C.success}18`:`${C.danger}18`, color:t.dk==='credit'?C.success:C.danger, fontWeight:600 }}>{t.dk==='credit'?'Kirim':'Chiqim'}</span>
                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:`${C.info}18`, color:C.info, fontWeight:600 }}>{t.code}</span>
                        </div>
                        {t.description && <p style={{ fontSize:12, color:C.muted }}>{t.description}</p>}
                      </div>
                    ))}
                    {paymentTypes.length === 0 && (
                      <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:C.muted }}>
                        <FileText size={44} style={{ marginBottom:12, opacity:0.25 }}/><p>To'lov turlari topilmadi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* CREATE PAYMENT MODAL */}
      {showCreate && (
        <Modal title="Yangi to'lov" onClose={()=>{ setShowCreate(false); setGroupStudents([]); }} C={C}>
          <form onSubmit={handleCreatePayment} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="To'lov turi *" C={C}>
              <select required value={payForm.type} onChange={e=>setPF({ type:e.target.value })} style={inputStyle(C)}>
                <option value="">To'lov turini tanlang</option>
                {paymentTypes.map(t=>(<option key={t.id} value={t.id}>{t.name} ({t.dk==='credit'?'Kirim':'Chiqim'})</option>))}
              </select>
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Summa *" C={C}>
                <input required type="number" step="1" min="1" placeholder="So'm" value={payForm.amount} onChange={e=>setPF({ amount:e.target.value })} style={inputStyle(C)}/>
              </Field>
              <Field label="Oy *" C={C}>
                <input required type="month" value={payForm.month} onChange={e=>setPF({ month:e.target.value })} style={inputStyle(C)}/>
              </Field>
            </div>
            <Field label="Guruh *" C={C}>
              <select required value={payForm.groupId} onChange={e=>setPF({ groupId:e.target.value, toWho:'' })} style={inputStyle(C)}>
                <option value="">Guruhni tanlang</option>
                {groups.map(g=>(<option key={g.id} value={g.id}>{g.name}{g.currentStudents!=null?` (${g.currentStudents}/${g.maxStudents||20})`:''}</option>))}
              </select>
            </Field>
            <Field label="O'quvchi *" C={C}>
              <select required value={payForm.toWho} onChange={e=>setPF({ toWho:e.target.value })}
                disabled={!payForm.groupId || fetchingStudents}
                style={{ ...inputStyle(C), opacity:!payForm.groupId?0.6:1 }}>
                <option value="">{!payForm.groupId?'Avval guruh tanlang':fetchingStudents?'Yuklanmoqda...':groupStudents.length===0?"Guruhda o'quvchi yo'q":"O'quvchini tanlang"}</option>
                {groupStudents.map(s=>(<option key={s.id} value={s.id}>{s.user?.name||s.name}{s.user?.phone?` (${s.user.phone})`:s.phone?` (${s.phone})`:''}</option>))}
              </select>
            </Field>

            {/* ── TAQSIMOT PREVIEW ── */}
            {payForm.amount && Number(payForm.amount) > 0 && payForm.groupId && (()=>{
              const { teacherShare, centerShare, centerPercent } = calcDistribution(Number(payForm.amount), selectedGroupTeacherPct);
              return (
                <div style={{ padding:'12px 14px', borderRadius:10, background:`${C.brand}08`, border:`1px solid ${C.brand}20` }}>
                  <p style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Taqsimot preview
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div style={{ textAlign:'center', padding:'8px', borderRadius:8, background:`${C.teacher}12` }}>
                      <p style={{ fontSize:10, color:C.teacher, fontWeight:700, marginBottom:4 }}>O'qituvchi ({selectedGroupTeacherPct}%)</p>
                      <p style={{ fontSize:15, fontWeight:700, color:C.text }}>{fmtMoney(teacherShare)}</p>
                    </div>
                    <div style={{ textAlign:'center', padding:'8px', borderRadius:8, background:`${C.center}12` }}>
                      <p style={{ fontSize:10, color:C.center, fontWeight:700, marginBottom:4 }}>Markaz ({centerPercent}%)</p>
                      <p style={{ fontSize:15, fontWeight:700, color:C.text }}>{fmtMoney(centerShare)}</p>
                    </div>
                  </div>
                  <div style={{ marginTop:8, height:4, borderRadius:99, background:C.cardAlt, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${selectedGroupTeacherPct}%`, background:`linear-gradient(90deg,${C.teacher},${C.center})` }}/>
                  </div>
                </div>
              );
            })()}

            <Field label="Izoh" C={C}>
              <textarea placeholder="Ixtiyoriy izoh..." value={payForm.comment} onChange={e=>setPF({ comment:e.target.value })} style={{ ...inputStyle(C), minHeight:72, resize:'vertical' }}/>
            </Field>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button type="button" onClick={()=>{ setShowCreate(false); setGroupStudents([]); }} style={{ flex:1, padding:12, borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>Bekor</button>
              <button type="submit" disabled={modalLoad} style={{ flex:2, padding:12, borderRadius:10, border:'none', background:modalLoad?`${C.brand}50`:`linear-gradient(135deg,${C.brandDark},${C.brandLight})`, color:'#fff', fontSize:13, fontWeight:600, cursor:modalLoad?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                {modalLoad ? <><RefreshCw size={13} className="ap-spin"/> Yuborilmoqda...</> : <><Check size={13}/> Yaratish</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CREATE TYPE MODAL */}
      {showType && (
        <Modal title="Yangi to'lov turi" onClose={()=>setShowType(false)} C={C}>
          <form onSubmit={handleCreateType} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="Nomi *" C={C}><input required type="text" placeholder="To'lov turi nomi" value={typeForm.name} onChange={e=>setTypeForm(p=>({...p,name:e.target.value}))} style={inputStyle(C)}/></Field>
            <Field label="Kod *" C={C}><input required type="text" placeholder="MONTHLY_FEE" value={typeForm.code} onChange={e=>setTypeForm(p=>({...p,code:e.target.value}))} style={inputStyle(C)}/></Field>
            <Field label="Turi *" C={C}>
              <select required value={typeForm.dk} onChange={e=>setTypeForm(p=>({...p,dk:e.target.value}))} style={inputStyle(C)}>
                <option value="credit">Kirim</option>
                <option value="debit">Chiqim</option>
              </select>
            </Field>
            <Field label="Tavsif" C={C}><textarea placeholder="Tavsif..." value={typeForm.description} onChange={e=>setTypeForm(p=>({...p,description:e.target.value}))} style={{ ...inputStyle(C), minHeight:72, resize:'vertical' }}/></Field>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button type="button" onClick={()=>setShowType(false)} style={{ flex:1, padding:12, borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>Bekor</button>
              <button type="submit" disabled={modalLoad} style={{ flex:2, padding:12, borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.brandDark},${C.brandLight})`, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                {modalLoad ? <><RefreshCw size={13} className="ap-spin"/> Yuklanmoqda...</> : <><Check size={13}/> Yaratish</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selPayment && (
        <Modal title="To'lov tafsilotlari" subtitle={`#${selPayment.id?.slice(0,8)}`} onClose={()=>setShowDetails(false)} C={C}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ padding:16, borderRadius:12, background:isCreditPayment(selPayment)?`${C.success}15`:`${C.danger}15`, textAlign:'center' }}>
              <p style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{isCreditPayment(selPayment)?'Kirim':'Chiqim'}</p>
              <p style={{ fontSize:28, fontWeight:700, color:C.text }}>{isCreditPayment(selPayment)?'+':'-'}{fmtMoney(selPayment.amount)}</p>
            </div>
            {[
              ['Izoh',        selPayment.comment||selPayment.description||'—'],
              ['Sana',        fmtDate(selPayment.date)],
              ['Oy',          selPayment.month||'—'],
              ['Holat',       <StatusBadge key="s" status={selPayment.status} C={C}/>],
              ['Kim uchun',   selPayment.toWho?.name||'—'],
              ['Guruh',       selPayment.group?.name||'—'],
              ["To'lov turi", paymentTypes.find(t=>t.id===(selPayment.typeId||selPayment.type))?.name||'—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize:11, color:C.muted, marginBottom:3 }}>{label}</p>
                <p style={{ fontSize:14, fontWeight:600, color:C.text }}>{value}</p>
              </div>
            ))}
            {/* Taqsimot detail modal ichida */}
            {isCreditPayment(selPayment) && (
              <DistributionCard payment={selPayment} teachers={teachers} C={C}/>
            )}
            <button onClick={()=>setShowDetails(false)} style={{ padding:12, borderRadius:10, background:`${C.brand}18`, border:`1px solid ${C.brand}30`, color:C.text, fontSize:13, fontWeight:600, cursor:'pointer' }}>Yopish</button>
          </div>
        </Modal>
      )}

      {confirmMod && <ConfirmModal message={confirmMod.message} onConfirm={confirmMod.onConfirm} onCancel={()=>setConfirmMod(null)} C={C}/>}
      {rejectMod  && <RejectModal onConfirm={confirmReject} onCancel={()=>setRejectMod(null)} C={C}/>}

      {toast && (
        <div style={{ position:'fixed', bottom:22, right:22, zIndex:999, padding:'11px 18px', borderRadius:10, background:toast.type==='success'?`${C.success}18`:`${C.danger}18`, border:`1px solid ${toast.type==='success'?C.success:C.danger}`, color:toast.type==='success'?C.success:C.danger, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8, animation:'ap_slideUp 0.3s ease' }}>
          {toast.type==='success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}
    </>
  );
}