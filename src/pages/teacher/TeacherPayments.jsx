import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  TrendingUp, Calendar, Search,
  CreditCard, Award, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  ChevronRight, X, Wallet, Banknote,
  CircleDollarSign, BadgePercent, Layers,
} from 'lucide-react';

/* ─── THEME ──────────────────────────────────────────────────── */
const T = {
  bg:        "#0d0f12",
  surface:   "#13161b",
  surface2:  "#1a1d24",
  border:    "rgba(255,255,255,0.06)",
  border2:   "rgba(255,255,255,0.11)",
  text:      "#eef0f4",
  muted:     "rgba(238,240,244,0.40)",
  accent:    "#4ade80",       // green — earnings
  accentDim: "rgba(74,222,128,0.12)",
  red:       "#f87171",
  redDim:    "rgba(248,113,113,0.12)",
  gold:      "#fbbf24",
  goldDim:   "rgba(251,191,36,0.12)",
  blue:      "#60a5fa",
  blueDim:   "rgba(96,165,250,0.12)",
};

/* ─── HELPERS ────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0)) + " so'm";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtMonth = (d) =>
  new Date(d).toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });

/* ─── STAT CARD ──────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, dim, sub }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 20,
    padding: "22px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: 80, height: 80, borderRadius: "0 20px 0 80px",
      background: dim, opacity: 0.6,
    }} />
    <div style={{
      width: 42, height: 42, borderRadius: 13,
      background: dim,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={19} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{sub}</p>}
    </div>
  </div>
);

/* ─── PAYMENT ROW ────────────────────────────────────────────── */
const PaymentRow = ({ payment }) => {
  const isCredit = payment.dk === "credit" || payment.type === "credit";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 16px",
      borderRadius: 14,
      background: T.surface2,
      border: `1px solid ${T.border}`,
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.border2}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: isCredit ? T.accentDim : T.redDim,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isCredit
          ? <ArrowUpRight size={18} color={T.accent} />
          : <ArrowDownRight size={18} color={T.red} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: T.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3,
        }}>
          {payment.description || payment.comment || (isCredit ? "Kirim" : "Chiqim")}
        </p>
        <p style={{ fontSize: 11, color: T.muted }}>
          {fmtDate(payment.date || payment.createdAt)}
          {payment.group?.name && <span style={{ marginLeft: 8, color: T.blue }}>· {payment.group.name}</span>}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: isCredit ? T.accent : T.red }}>
          {isCredit ? "+" : "−"}{fmt(payment.amount)}
        </p>
        <StatusDot status={payment.status} />
      </div>
    </div>
  );
};

const StatusDot = ({ status }) => {
  const cfg = {
    approved: { color: T.accent, label: "Tasdiqlangan" },
    pending:  { color: T.gold,  label: "Kutilmoqda" },
    rejected: { color: T.red,   label: "Rad etilgan" },
  }[status] || { color: T.muted, label: status || "—" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: cfg.color, fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
};

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function TeacherPayments() {
  const { user } = useAuth();

  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [teacherData, setTeacherData]   = useState(null);
  const [payments, setPayments]         = useState([]);
  const [earnings, setEarnings]         = useState([]);
  const [groups, setGroups]             = useState([]);
  const [commission, setCommission]     = useState(0);
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("payments"); // payments | earnings
  const [selectedMonth, setSelectedMonth] = useState("");

  /* ── fetch all teacher-specific data ── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Get teacher profile
      const profile = await apiService.getProfile();
      const tid =
        profile?.teacher?.id ||
        profile?.id ||
        null;

      if (!tid) return;
      setTeacherData(profile?.teacher || profile);

      // 2. Parallel: payments, earnings, groups, commission
      const [rawPayments, rawEarnings, rawGroups, commData] = await Promise.allSettled([
        apiService.getUserPayments(tid),
        apiService.getTeacherEarnings(tid, selectedMonth ? { month: selectedMonth } : {}),
        apiService.getMyGroups(),           // { role, groups }
        apiService.getTeacherCommission(tid),
      ]);

      // payments — only this teacher's
      const pList = rawPayments.status === "fulfilled" ? rawPayments.value : [];
      setPayments(Array.isArray(pList) ? pList : pList?.payments || pList?.data || []);

      // earnings
      const eList = rawEarnings.status === "fulfilled" ? rawEarnings.value : [];
      setEarnings(Array.isArray(eList) ? eList : eList?.earnings || eList?.data || []);

      // groups from universal endpoint
      if (rawGroups.status === "fulfilled") {
        const g = rawGroups.value;
        setGroups(Array.isArray(g) ? g : g?.groups || []);
      }

      // commission
      if (commData.status === "fulfilled") {
        setCommission(commData.value?.commissionPercentage || commData.value?.commission || 0);
      }
    } catch (err) {
      console.error("TeacherPayments load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth]);

  useEffect(() => { load(); }, [load]);

  /* ── derived stats ── */
  const stats = useMemo(() => {
    const approved = payments.filter(p => p.status === "approved");
    const pending  = payments.filter(p => p.status === "pending");
    const credit   = approved.filter(p => p.dk === "credit" || p.type === "credit");
    const debit    = approved.filter(p => p.dk === "debit"  || p.type === "debit");

    const totalIn  = credit.reduce((s, p) => s + (p.amount || 0), 0);
    const totalOut = debit.reduce((s,  p) => s + (p.amount || 0), 0);
    const balance  = totalIn - totalOut;

    const now = new Date();
    const thisMonthIn = credit
      .filter(p => {
        const d = new Date(p.date || p.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, p) => s + (p.amount || 0), 0);

    return { totalIn, totalOut, balance, thisMonthIn, pending: pending.length, totalGroups: groups.length };
  }, [payments, groups]);

  /* ── filtered list ── */
  const filteredPayments = useMemo(() => {
    let list = payments;
    if (selectedMonth) {
      list = list.filter(p => {
        const d = new Date(p.date || p.createdAt);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return ym === selectedMonth;
      });
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.description || "").toLowerCase().includes(q) ||
        (p.comment || "").toLowerCase().includes(q) ||
        (p.group?.name || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [payments, search, selectedMonth]);

  const filteredEarnings = useMemo(() => {
    let list = earnings;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        (e.description || "").toLowerCase().includes(q) ||
        (e.type || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [earnings, search]);

  /* ── render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .tp-root * { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; margin:0; padding:0; }
        .tp-root h1,h2,h3 { font-family: 'Syne', sans-serif; }
        .tp-tab { cursor:pointer; border:none; transition: all 0.2s; }
        .tp-tab:hover { opacity:0.85; }
        .tp-row-enter { animation: rowIn 0.3s ease both; }
        @keyframes rowIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:4px; }
      `}</style>

      <div className="tp-root" style={{ minHeight: "100vh", background: T.bg, color: T.text }}>

        {/* ── HEADER ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 40,
          background: `${T.surface}ee`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "14px 24px",
        }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: T.accentDim, border: `1px solid rgba(74,222,128,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Wallet size={17} color={T.accent} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "Syne, sans-serif", color: T.text }}>Mening balansum</p>
                <p style={{ fontSize: 11, color: T.muted }}>
                  {teacherData?.user?.name || teacherData?.name || user?.name || "O'qituvchi"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* search */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: T.surface2, borderRadius: 11,
                padding: "8px 13px",
                border: `1px solid ${T.border}`,
              }}>
                <Search size={13} color={T.muted} />
                <input
                  placeholder="Qidirish..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: T.text, width: 140 }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* month filter */}
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{
                  background: T.surface2, border: `1px solid ${T.border}`,
                  borderRadius: 11, padding: "8px 12px",
                  color: selectedMonth ? T.text : T.muted,
                  fontSize: 12, outline: "none", cursor: "pointer",
                }}
              />

              {/* refresh */}
              <button
                onClick={() => load(true)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: T.surface2, border: `1px solid ${T.border}`,
                  color: T.muted, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.border2}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <RefreshCw size={14} style={refreshing ? { animation: "spin 0.8s linear infinite" } : {}} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 48px" }}>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `3px solid ${T.border}`, borderTopColor: T.accent,
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* ── STAT CARDS ── */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14, marginBottom: 28,
              }}>
                <StatCard icon={Wallet}         label="Balans"          value={fmt(stats.balance)}      color={stats.balance >= 0 ? T.accent : T.red} dim={stats.balance >= 0 ? T.accentDim : T.redDim} />
                <StatCard icon={ArrowUpRight}   label="Jami kirim"      value={fmt(stats.totalIn)}      color={T.accent} dim={T.accentDim} />
                <StatCard icon={ArrowDownRight} label="Jami chiqim"     value={fmt(stats.totalOut)}     color={T.red}    dim={T.redDim} />
                <StatCard icon={Calendar}       label="Bu oy kirim"     value={fmt(stats.thisMonthIn)}  color={T.blue}   dim={T.blueDim}  sub={selectedMonth ? fmtMonth(selectedMonth + "-01") : fmtMonth(new Date())} />
                <StatCard icon={BadgePercent}   label="Komissiya foizi" value={`${commission}%`}        color={T.gold}   dim={T.goldDim} />
                <StatCard icon={Layers}         label="Guruhlar soni"   value={stats.totalGroups}       color={T.blue}   dim={T.blueDim} />
              </div>

              {/* ── TABS ── */}
              <div style={{
                display: "flex", gap: 4,
                background: T.surface, borderRadius: 14,
                padding: 5, border: `1px solid ${T.border}`,
                marginBottom: 20, width: "fit-content",
              }}>
                {[
                  { id: "payments", label: "To'lovlar",  icon: CreditCard },
                  { id: "earnings", label: "Daromadlar", icon: TrendingUp },
                ].map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      className="tp-tab"
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: "9px 18px", borderRadius: 10,
                        background: active ? T.accentDim : "transparent",
                        border: active ? `1px solid rgba(74,222,128,0.25)` : "1px solid transparent",
                        color: active ? T.accent : T.muted,
                        fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 7,
                      }}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ── PAYMENTS TAB ── */}
              {activeTab === "payments" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontSize: 13, color: T.muted }}>
                      {filteredPayments.length} ta yozuv
                      {selectedMonth && ` · ${fmtMonth(selectedMonth + "-01")}`}
                    </p>
                    {stats.pending > 0 && (
                      <span style={{
                        padding: "4px 10px", borderRadius: 8,
                        background: T.goldDim, color: T.gold,
                        fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        <Clock size={11} /> {stats.pending} ta kutilmoqda
                      </span>
                    )}
                  </div>

                  {filteredPayments.length === 0 ? (
                    <EmptyState icon={CreditCard} text="To'lovlar topilmadi" />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {filteredPayments.map((p, i) => (
                        <div key={p.id || i} className="tp-row-enter" style={{ animationDelay: `${i * 0.04}s` }}>
                          <PaymentRow payment={p} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── EARNINGS TAB ── */}
              {activeTab === "earnings" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontSize: 13, color: T.muted }}>{filteredEarnings.length} ta yozuv</p>
                    <div style={{
                      padding: "6px 14px", borderRadius: 10,
                      background: T.accentDim, color: T.accent,
                      fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Award size={13} />
                      Jami: {fmt(filteredEarnings.reduce((s, e) => s + (e.amount || e.earnings || 0), 0))}
                    </div>
                  </div>

                  {filteredEarnings.length === 0 ? (
                    <EmptyState icon={TrendingUp} text="Daromadlar topilmadi" />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {filteredEarnings.map((e, i) => (
                        <div
                          key={e.id || i}
                          className="tp-row-enter"
                          style={{
                            animationDelay: `${i * 0.04}s`,
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "13px 16px", borderRadius: 14,
                            background: T.surface2, border: `1px solid ${T.border}`,
                          }}
                        >
                          <div style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            background: T.accentDim,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <ArrowUpRight size={18} color={T.accent} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, fontWeight: 600, color: T.text,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3,
                            }}>
                              {e.description || e.type || "Daromad"}
                            </p>
                            <p style={{ fontSize: 11, color: T.muted }}>{fmtDate(e.date || e.createdAt)}</p>
                          </div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: T.accent, flexShrink: 0 }}>
                            +{fmt(e.amount || e.earnings)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────── */
const EmptyState = ({ icon: Icon, text }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "56px 20px", gap: 12,
    background: T.surface, border: `1px dashed ${T.border2}`,
    borderRadius: 20,
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: T.surface2, border: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={24} color={T.muted} />
    </div>
    <p style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>{text}</p>
  </div>
);