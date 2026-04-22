import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Users, CreditCard, AlertCircle, CheckCircle, XCircle,
  Clock, ArrowUpRight, ArrowDownRight, RefreshCw,
  ChevronLeft, Calendar, Download
} from 'lucide-react';

// ─── THEME ───────────────────────────────────────────────────
const getColors = (isDarkMode) => ({
  brand:      '#427A43',
  brandDark:  '#2d5630',
  brandLight: '#5a9e5b',
  bg:         isDarkMode ? '#0a0d0a' : '#f4f7f4',
  cardBg:     isDarkMode ? '#111814' : '#ffffff',
  cardAlt:    isDarkMode ? '#1a211a' : '#f0f7f0',
  border:     isDarkMode ? 'rgba(66,122,67,0.2)' : 'rgba(66,122,67,0.18)',
  text:       isDarkMode ? '#e8f5e8' : '#0f1f0f',
  muted:      isDarkMode ? 'rgba(200,230,200,0.45)' : 'rgba(15,31,15,0.45)',
  success:    '#22c55e',
  warning:    '#f59e0b',
  danger:     '#ef4444',
  info:       '#3b82f6',
  purple:     '#8b5cf6',
});

// ─── UTILS ───────────────────────────────────────────────────
const fmtMoney = (n) =>
  new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const isCreditPayment = (p) => p?.type === 'credit' || p?.dk === 'credit';

// ─── STAT CARD ───────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, trend, delay = 0, C }) => {
  const [hovered, setHovered] = useState(false);
  const up = trend && !String(trend).startsWith('-');
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 22px',
        background: C.cardBg,
        border: `1px solid ${hovered ? `${color}50` : C.border}`,
        borderRadius: 18,
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 10px 32px ${color}18` : 'none',
        animation: `pr_slideUp 0.4s ease ${delay}s both`,
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={21} color={color} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: up ? `${C.success}18` : `${C.danger}18`, color: up ? C.success : C.danger, fontSize: 11, fontWeight: 700 }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

// ─── MINI BAR ────────────────────────────────────────────────
const MiniBar = ({ value, max, color, C }) => (
  <div style={{ height: 6, borderRadius: 3, background: C.cardAlt, overflow: 'hidden', marginTop: 8 }}>
    <div style={{ height: '100%', width: `${Math.min(100, max ? (value / max) * 100 : 0)}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 3, transition: 'width 0.8s ease' }} />
  </div>
);

// ─── SECTION HEADER ─────────────────────────────────────────
const SectionHeader = ({ title, subtitle, C }) => (
  <div style={{ marginBottom: 18 }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{subtitle}</p>}
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function PaymentReports() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const C = getColors(isDarkMode);

  const [loading,   setLoading]   = useState(true);
  const [payments,  setPayments]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [groups,    setGroups]    = useState([]);
  const [toast,     setToast]     = useState(null);

  // API stats
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [dailyReport,   setDailyReport]   = useState(null);

  // filters
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedGroup, setSelectedGroup] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── FETCH ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month   = selectedMonth;
      if (selectedGroup) params.groupId = selectedGroup;

      const [paymentsData, studentsData, groupsData] = await Promise.all([
        apiService.getPayments(params),
        apiService.getStudents(),
        apiService.getGroups(),
      ]);

      const payList = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || paymentsData?.data || []);
      const stuList = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);
      const grpList = Array.isArray(groupsData)   ? groupsData   : (groupsData?.groups    || []);

      setPayments(payList);
      setStudents(stuList);
      setGroups(grpList);

      // teachers
      try {
        const td = await apiService.getTeachers();
        setTeachers(Array.isArray(td) ? td : (td?.teachers || []));
      } catch (e) { console.warn(e); }

      // API reports
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const [mr, dr] = await Promise.allSettled([
        apiService.getPaymentReport?.(selectedMonth || `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`),
        apiService.getDailyFinancialSummary?.(todayStr),
      ]);
      if (mr.status === 'fulfilled') setMonthlyReport(mr.value);
      if (dr.status === 'fulfilled') setDailyReport(dr.value);

    } catch (e) {
      console.error(e);
      showToast("Ma'lumotlarni olishda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedGroup]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── COMPUTED STATS ────────────────────────────────────────
  const stats = useMemo(() => {
    const approved   = payments.filter(p => p.status === 'approved');
    const pending    = payments.filter(p => p.status === 'pending');
    const rejected   = payments.filter(p => p.status === 'rejected');
    const credits    = approved.filter(p => isCreditPayment(p));
    const debits     = approved.filter(p => !isCreditPayment(p));

    const totalIncome  = credits.reduce((s, p) => s + (p.amount || 0), 0);
    const totalExpense = debits.reduce((s, p) => s + (p.amount || 0), 0);
    const netBalance   = totalIncome - totalExpense;

    // student debts
    const totalStudentDebt = students.reduce((sum, student) => {
      const paid = approved
        .filter(p => isCreditPayment(p) && (p.toWhoId === student.id || p.toWho?.id === student.id))
        .reduce((s, p) => s + (p.amount || 0), 0);
      const grp = groups.find(g => g.students?.some(s => s.id === student.id) || g.studentIds?.includes(student.id));
      const expected = grp?.monthlyPrice || 0;
      return sum + Math.max(0, expected - paid);
    }, 0);

    // teacher commissions
    const teacherCommissionTotal = teachers.reduce((sum, teacher) => {
      const earned = approved
        .filter(p => isCreditPayment(p) && (p.fromWhoId === teacher.id || p.teacher?.id === teacher.id))
        .reduce((s, p) => s + (p.amount || 0), 0);
      return sum + (earned * (teacher.commissionPercentage || 0)) / 100;
    }, 0);

    // by group
    const byGroup = groups.map(g => {
      const gpays = approved.filter(p => p.group?.id === g.id || p.groupId === g.id);
      const income = gpays.filter(p => isCreditPayment(p)).reduce((s, p) => s + (p.amount || 0), 0);
      return { ...g, income, count: gpays.length };
    }).sort((a, b) => b.income - a.income);

    // by payment type
    const typeMap = {};
    approved.forEach(p => {
      const key = p.typeName || p.type || 'Noma\'lum';
      if (!typeMap[key]) typeMap[key] = { name: key, total: 0, count: 0 };
      typeMap[key].total += p.amount || 0;
      typeMap[key].count++;
    });
    const byType = Object.values(typeMap).sort((a, b) => b.total - a.total);

    // monthly trend (last 6 months from payments)
    const monthMap = {};
    payments.forEach(p => {
      if (!p.month) return;
      const m = p.month.slice(0, 7);
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0 };
      if (p.status === 'approved') {
        if (isCreditPayment(p)) monthMap[m].income += p.amount || 0;
        else monthMap[m].expense += p.amount || 0;
      }
    });
    const monthlyTrend = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

    return {
      totalIncome, totalExpense, netBalance,
      totalPayments: payments.length,
      approvedCount: approved.length,
      pendingCount:  pending.length,
      rejectedCount: rejected.length,
      totalStudentDebt, teacherCommissionTotal,
      studentCount: students.length,
      teacherCount: teachers.length,
      byGroup, byType, monthlyTrend,
      // prefer API values if available
      monthlyRevenue: monthlyReport?.monthlyRevenue || monthlyReport?.totalRevenue || totalIncome,
      dailyRevenue:   dailyReport?.dailyRevenue || dailyReport?.total || 0,
    };
  }, [payments, students, teachers, groups, monthlyReport, dailyReport]);

  const maxGroupIncome = Math.max(...stats.byGroup.map(g => g.income), 1);
  const maxTypeTotal   = Math.max(...stats.byType.map(t => t.total), 1);

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        @keyframes pr_fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes pr_slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pr_spin    { to{transform:rotate(360deg)} }
        .pr-spin { animation: pr_spin 1s linear infinite; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
        input[type=month]::-webkit-calendar-picker-indicator { filter:${isDarkMode?'invert(1)':'none'}; cursor:pointer; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg }}>

        {/* Header */}
        <div style={{ background: `${C.cardBg}ee`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${C.brandDark},${C.brandLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${C.brand}50` }}>
                <BarChart3 size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Moliyaviy hisobotlar</h1>
                <p style={{ fontSize: 11, color: C.muted }}>To'liq statistika va tahlil</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={fetchAll} style={{ width: 38, height: 38, borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <RefreshCw size={15} />
              </button>
              <button onClick={() => navigate('/admin/payments')} style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <ChevronLeft size={14} /> To'lovlar
              </button>
              <button onClick={() => navigate('/admin')} style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <ChevronLeft size={14} /> Orqaga
              </button>
            </div>
          </div>
        </div>

        <main style={{ maxWidth: 1300, margin: '0 auto', padding: 24 }}>

          {/* Filters */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 18px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Calendar size={16} color={C.brand} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Oy:</label>
              <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                style={{ background: C.cardAlt, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Guruh:</label>
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                style={{ background: C.cardAlt, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                <option value="">Barcha guruhlar</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="pr-spin" style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.brand, margin: '0 auto 14px' }} />
                <p style={{ color: C.muted, fontSize: 13 }}>Yuklanmoqda...</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* ── 1. ASOSIY MOLIYAVIY KO'RSATKICHLAR ── */}
              <section>
                <SectionHeader title="Asosiy moliyaviy ko'rsatkichlar" subtitle="Tasdiqlangan to'lovlar asosida" C={C} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <StatCard label="Jami kirim" value={fmtMoney(stats.totalIncome)} icon={ArrowUpRight} color={C.success} sub={`${stats.byType.filter(t=>t.name?.includes('credit')||t.name?.includes('Kirim')).length} ta tur`} delay={0} C={C} />
                  <StatCard label="Jami chiqim" value={fmtMoney(stats.totalExpense)} icon={ArrowDownRight} color={C.danger} delay={0.05} C={C} />
                  <StatCard label="Sof balans" value={fmtMoney(stats.netBalance)} icon={DollarSign} color={stats.netBalance >= 0 ? C.success : C.danger} trend={stats.netBalance >= 0 ? '▲ Ijobiy' : '▼ Salbiy'} delay={0.1} C={C} />
                  <StatCard label="Oylik daromad (API)" value={fmtMoney(stats.monthlyRevenue)} icon={TrendingUp} color={C.brand} delay={0.15} C={C} />
                  <StatCard label="Kunlik daromad (API)" value={fmtMoney(stats.dailyRevenue)} icon={Calendar} color={C.info} delay={0.2} C={C} />
                  <StatCard label="O'quvchi qarzdorligi" value={fmtMoney(stats.totalStudentDebt)} icon={AlertCircle} color={C.warning} delay={0.25} C={C} />
                  <StatCard label="O'qituvchi komissiyasi" value={fmtMoney(stats.teacherCommissionTotal)} icon={Users} color={C.purple} delay={0.3} C={C} />
                  <StatCard label="To'langan summa" value={fmtMoney(stats.totalIncome)} icon={CheckCircle} color={C.success} delay={0.35} C={C} />
                </div>
              </section>

              {/* ── 2. TO'LOV HOLATLARI ── */}
              <section>
                <SectionHeader title="To'lov holatlari" subtitle={`Jami ${stats.totalPayments} ta to'lov`} C={C} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {[
                    { label: 'Kutilmoqda',   value: stats.pendingCount,  color: C.warning, Icon: Clock,        pct: stats.totalPayments ? ((stats.pendingCount/stats.totalPayments)*100).toFixed(1) : 0 },
                    { label: 'Tasdiqlangan', value: stats.approvedCount, color: C.success, Icon: CheckCircle,  pct: stats.totalPayments ? ((stats.approvedCount/stats.totalPayments)*100).toFixed(1) : 0 },
                    { label: 'Rad etilgan',  value: stats.rejectedCount, color: C.danger,  Icon: XCircle,      pct: stats.totalPayments ? ((stats.rejectedCount/stats.totalPayments)*100).toFixed(1) : 0 },
                  ].map(({ label, value, color, Icon, pct }, i) => (
                    <div key={label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, animation: `pr_slideUp 0.4s ease ${i*0.08}s both` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} color={color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{value}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: C.muted, marginBottom: 6 }}>
                        <span>Ulushi</span>
                        <span style={{ fontWeight: 700, color }}>{pct}%</span>
                      </div>
                      <MiniBar value={value} max={stats.totalPayments} color={color} C={C} />
                    </div>
                  ))}
                </div>
              </section>

              {/* ── 3. OYLIK TREND ── */}
              {stats.monthlyTrend.length > 0 && (
                <section>
                  <SectionHeader title="Oylik kirim/chiqim trendi" subtitle="So'nggi 6 oy" C={C} />
                  <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {stats.monthlyTrend.map((m, i) => {
                        const maxVal = Math.max(...stats.monthlyTrend.map(x => Math.max(x.income, x.expense)), 1);
                        return (
                          <div key={m.month} style={{ animation: `pr_fadeIn 0.3s ease ${i*0.07}s both` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, minWidth: 80 }}>{m.month}</span>
                              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                <span style={{ color: C.success }}>▲ {fmtMoney(m.income)}</span>
                                <span style={{ color: C.danger }}>▼ {fmtMoney(m.expense)}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ height: 7, borderRadius: 4, background: C.cardAlt, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(m.income/maxVal)*100}%`, background: `linear-gradient(90deg,${C.success}88,${C.success})`, borderRadius: 4, transition: 'width 1s ease' }} />
                              </div>
                              <div style={{ height: 7, borderRadius: 4, background: C.cardAlt, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(m.expense/maxVal)*100}%`, background: `linear-gradient(90deg,${C.danger}88,${C.danger})`, borderRadius: 4, transition: 'width 1s ease' }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
                        <div style={{ width: 12, height: 6, borderRadius: 3, background: C.success }} /> Kirim
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
                        <div style={{ width: 12, height: 6, borderRadius: 3, background: C.danger }} /> Chiqim
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── 4. GURUHLAR BO'YICHA ── */}
              {stats.byGroup.length > 0 && (
                <section>
                  <SectionHeader title="Guruhlar bo'yicha daromad" subtitle="Tasdiqlangan to'lovlar asosida" C={C} />
                  <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {stats.byGroup.slice(0, 8).map((g, i) => (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 14, animation: `pr_fadeIn 0.3s ease ${i*0.05}s both` }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.brand}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.brand, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: C.success }}>{fmtMoney(g.income)}</span>
                                <span style={{ fontSize: 11, color: C.muted }}>{g.count} ta</span>
                              </div>
                            </div>
                            <MiniBar value={g.income} max={maxGroupIncome} color={C.brand} C={C} />
                          </div>
                        </div>
                      ))}
                      {stats.byGroup.length === 0 && (
                        <p style={{ textAlign: 'center', padding: 40, color: C.muted }}>Ma'lumot topilmadi</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ── 5. TO'LOV TURLARI ── */}
              {stats.byType.length > 0 && (
                <section>
                  <SectionHeader title="To'lov turlari bo'yicha" subtitle="Tasdiqlangan to'lovlar" C={C} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {stats.byType.slice(0, 8).map((t, i) => (
                      <div key={t.name} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', animation: `pr_slideUp 0.35s ease ${i*0.05}s both` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.info}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={17} color={C.info} />
                          </div>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: `${C.info}18`, color: C.info, fontWeight: 600 }}>
                            {t.count} ta
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.name}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.success }}>{fmtMoney(t.total)}</div>
                        <MiniBar value={t.total} max={maxTypeTotal} color={C.info} C={C} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 6. O'QUVCHILAR VA O'QITUVCHILAR ── */}
              <section>
                <SectionHeader title="Umumiy ko'rsatkichlar" C={C} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <StatCard label="Jami o'quvchilar" value={stats.studentCount} icon={Users} color={C.brand} delay={0} C={C} />
                  <StatCard label="Jami o'qituvchilar" value={stats.teacherCount} icon={Users} color={C.purple} delay={0.05} C={C} />
                  <StatCard label="Jami guruhlar" value={groups.length} icon={BarChart3} color={C.info} delay={0.1} C={C} />
                  <StatCard label="Jami to'lovlar" value={stats.totalPayments} icon={CreditCard} color={C.warning} delay={0.15} C={C} />
                </div>
              </section>

              {/* ── 7. SO'NGGI TO'LOVLAR ── */}
              <section>
                <SectionHeader title="So'nggi to'lovlar" subtitle="Eng yangi 10 ta to'lov" C={C} />
                <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
                  {payments.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 40, color: C.muted }}>To'lovlar topilmadi</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[...payments].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).slice(0, 10).map((pay, idx) => {
                        const credit = isCreditPayment(pay);
                        return (
                          <div key={pay.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, background: C.cardAlt, border: `1px solid ${C.border}`, animation: `pr_fadeIn 0.3s ease ${idx*0.04}s both` }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: credit ? `${C.success}18` : `${C.danger}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {credit ? <ArrowUpRight size={17} color={C.success} /> : <ArrowDownRight size={17} color={C.danger} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {pay.description || pay.comment || "To'lov"}
                              </div>
                              <div style={{ fontSize: 11, color: C.muted, display: 'flex', gap: 12, marginTop: 2 }}>
                                <span>{fmtDate(pay.date)}</span>
                                {pay.toWho?.name && <span>👤 {pay.toWho.name}</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: credit ? C.success : C.danger }}>
                                {credit ? '+' : '-'}{fmtMoney(pay.amount)}
                              </div>
                              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                                {pay.status === 'approved' ? '✓ Tasdiqlangan' : pay.status === 'pending' ? '⏳ Kutilmoqda' : '✕ Rad etilgan'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

            </div>
          )}
        </main>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 999, padding: '11px 18px', borderRadius: 10, background: toast.type === 'success' ? `${C.success}18` : `${C.danger}18`, border: `1px solid ${toast.type === 'success' ? C.success : C.danger}`, color: toast.type === 'success' ? C.success : C.danger, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, animation: 'pr_slideUp 0.3s ease' }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}