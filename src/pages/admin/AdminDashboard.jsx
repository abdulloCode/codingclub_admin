import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  CreditCard, DollarSign, TrendingUp, Search,
  Download, Plus, CheckCircle, XCircle,
  Eye, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw,
  PieChart, BarChart3, FileText,
  ChevronRight, ChevronLeft, X, AlertCircle,
  Clock, Check, Users, Calendar
} from 'lucide-react';

const COLORS = {
  brand: "#427A43",
  brandDark: "#2d5630",
  brandLight: "#5a9e5b",
  background: "#0f0f12",
  cardBg: "#1a1a1e",
  cardBgAlt: "#242428",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(amount || 0);

const formatDate = (date) => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("uz-UZ", { day:"2-digit", month:"short", year:"numeric" });
  } catch { return "—"; }
};

const STATUS_CONFIG = {
  pending:  { color: COLORS.warning, bg: "rgba(245,158,11,0.15)",  label: "Kutilmoqda",   icon: Clock },
  approved: { color: COLORS.success, bg: "rgba(34,197,94,0.15)",   label: "Tasdiqlangan", icon: CheckCircle },
  rejected: { color: COLORS.danger,  bg: "rgba(239,68,68,0.15)",   label: "Rad etilgan",  icon: XCircle },
};

const TYPE_CONFIG = {
  credit: { color: COLORS.success, bg: "rgba(34,197,94,0.15)",  label: "Kirim",  icon: ArrowUpRight },
  debit:  { color: COLORS.danger,  bg: "rgba(239,68,68,0.15)",  label: "Chiqim", icon: ArrowDownRight },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px",
      borderRadius:20, background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:600 }}>
      <Icon size={10}/>{cfg.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.credit;
  const Icon = cfg.icon;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px",
      borderRadius:20, background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:600 }}>
      <Icon size={10}/>{cfg.label}
    </span>
  );
};

export default function AdminPayments() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("payments");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupStudents, setGroupStudents] = useState({});

  const [stats, setStats] = useState({
    totalPayments: 0, pendingPayments: 0,
    approvedPayments: 0, rejectedPayments: 0,
    totalPaidAmount: 0, monthlyRevenue: 0,
  });

  const [filters, setFilters] = useState({
    search: "", typeId: "", month: "", status: "", groupId: ""
  });

  const [modals, setModals] = useState({
    createPayment: false, createType: false, paymentDetails: false, studentDebt: false
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedGroupDebt, setSelectedGroupDebt] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    type: "credit", amount: "", toWho: "", groupId: "", typeId: "", description: ""
  });

  const [showInlineType, setShowInlineType] = useState(false);
  const [inlineTypeName, setInlineTypeName] = useState("");
  const [inlineTypeCode, setInlineTypeCode] = useState("");
  const [inlineTypeDk, setInlineTypeDk] = useState("credit");
  const [inlineTypeLoading, setInlineTypeLoading] = useState(false);

  const [typeForm, setTypeForm] = useState({
    name: "", code: "", dk: "credit", description: ""
  });

  const [pagination, setPagination] = useState({ page: 1, itemsPerPage: 10 });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  const openModal  = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.month)   params.month   = filters.month;
      if (filters.groupId) params.groupId = filters.groupId;
      if (filters.typeId)  params.typeId  = filters.typeId;
      const data = await apiService.getPayments(params);
      const list = Array.isArray(data) ? data : (data?.payments || data?.data || []);
      setPayments(list);
      setFilteredPayments(list);
    } catch (err) {
      showToast("To'lovlarni olishda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.groupId, filters.typeId]);

  const fetchPaymentTypes = useCallback(async () => {
    try {
      const data = await apiService.getPaymentTypes(false);
      setPaymentTypes(Array.isArray(data) ? data : (data?.paymentTypes || data?.data || []));
    } catch (err) {
      console.error("Payment types fetch error:", err);
    }
  }, []);

  const fetchGroupsAndStudents = useCallback(async () => {
    try {
      const [groupsData, studentsData] = await Promise.all([
        apiService.getGroups(),
        apiService.getStudents(),
      ]);
      const gList = Array.isArray(groupsData) ? groupsData : (groupsData?.groups || []);
      const sList = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);
      setGroups(gList);
      setStudents(sList);
    } catch (err) {
      console.error("Groups/students fetch error:", err);
    }
  }, []);

  const fetchGroupStudents = useCallback(async (groupId) => {
    if (!groupId || groupStudents[groupId]) return;
    try {
      const list = await apiService.getGroupStudents(groupId);
      setGroupStudents(prev => ({ ...prev, [groupId]: list }));
    } catch (err) {
      console.error("Group students fetch error:", err);
    }
  }, [groupStudents]);

  useEffect(() => {
    if (paymentForm.groupId) fetchGroupStudents(paymentForm.groupId);
  }, [paymentForm.groupId]);

  useEffect(() => {
    Promise.all([fetchPayments(), fetchPaymentTypes(), fetchGroupsAndStudents()]);
  }, [fetchPayments, fetchPaymentTypes, fetchGroupsAndStudents]);

  useEffect(() => {
    setStats({
      totalPayments:    payments.length,
      pendingPayments:  payments.filter(p => p.status === 'pending').length,
      approvedPayments: payments.filter(p => p.status === 'approved').length,
      rejectedPayments: payments.filter(p => p.status === 'rejected').length,
      totalPaidAmount:  payments
        .filter(p => p.status === 'approved' && (p.dk === 'credit' || p.type === 'credit'))
        .reduce((s, p) => s + (p.amount || 0), 0),
      monthlyRevenue: payments.filter(p => {
        const m = filters.month || new Date().toISOString().slice(0, 7);
        return p.status === 'approved' && (p.dk === 'credit' || p.type === 'credit') &&
               (p.date || p.createdAt || '').startsWith(m);
      }).reduce((s, p) => s + (p.amount || 0), 0),
    });
  }, [payments, filters.month]);

  useEffect(() => {
    let f = [...payments];
    if (filters.search) {
      const t = filters.search.toLowerCase();
      f = f.filter(p =>
        p.description?.toLowerCase().includes(t) ||
        p.comment?.toLowerCase().includes(t) ||
        p.toWho?.name?.toLowerCase().includes(t)
      );
    }
    if (filters.typeId) f = f.filter(p => p.typeId === filters.typeId || p.paymentTypeId === filters.typeId);
    if (filters.status) f = f.filter(p => p.status === filters.status);
    setFilteredPayments(f);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.search, filters.typeId, filters.status, payments]);

  const calcGroupDebt = useCallback((group) => {
    const monthlyPrice = group?.monthlyPrice || group?.price || 0;
    const gStudentsList = groupStudents[group.id] || group.students || [];
    return gStudentsList.map(student => {
      const studentId = student.id || student.userId;
      const paid = payments
        .filter(p => (p.toWhoId === studentId || p.toWho?.id === studentId) &&
                     p.status === 'approved' && (p.dk === 'credit' || p.type === 'credit'))
        .reduce((s, p) => s + (p.amount || 0), 0);
      const debt = Math.max(0, monthlyPrice - paid);
      return {
        name: student.user?.name || student.name || "Noma'lum",
        phone: student.user?.phone || student.phone || "",
        paid, debt, monthlyPrice,
      };
    });
  }, [payments, groupStudents]);

  const openGroupDebt = async (group) => {
    if (!groupStudents[group.id]) await fetchGroupStudents(group.id);
    setSelectedGroupDebt(group);
    openModal('studentDebt');
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createPayment({
        type:        paymentForm.type,
        dk:          paymentForm.type,
        amount:      parseFloat(paymentForm.amount),
        toWhoId:     paymentForm.toWho,
        groupId:     paymentForm.groupId || undefined,
        typeId:      paymentForm.typeId  || undefined,
        description: paymentForm.description || undefined,
      });
      showToast("To'lov muvaffaqiyatli yaratildi!");
      closeModal('createPayment');
      setPaymentForm({ type:"credit", amount:"", toWho:"", groupId:"", typeId:"", description:"" });
      setShowInlineType(false);
      fetchPayments();
    } catch (err) {
      showToast(err.message || "To'lov yaratishda xatolik", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleInlineCreateType = async () => {
    if (!inlineTypeName.trim() || !inlineTypeCode.trim()) {
      showToast("Nom va kod kiritilishi shart", "error");
      return;
    }
    setInlineTypeLoading(true);
    try {
      const newType = await apiService.createPaymentType({
        name: inlineTypeName.trim(),
        code: inlineTypeCode.trim().toUpperCase(),
        dk:   inlineTypeDk,
      });
      await fetchPaymentTypes();
      const createdId = newType?.id || newType?.paymentType?.id;
      if (createdId) setPaymentForm(prev => ({ ...prev, typeId: createdId }));
      setShowInlineType(false);
      setInlineTypeName(""); setInlineTypeCode(""); setInlineTypeDk("credit");
      showToast("To'lov turi yaratildi va tanlandi!");
    } catch (err) {
      showToast(err.message || "Tur yaratishda xatolik", "error");
    } finally {
      setInlineTypeLoading(false);
    }
  };

  const handleCreatePaymentType = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createPaymentType({
        name: typeForm.name,
        code: typeForm.code.toUpperCase(),
        dk:   typeForm.dk,
        description: typeForm.description || undefined,
      });
      showToast("To'lov turi yaratildi!");
      closeModal('createType');
      setTypeForm({ name:"", code:"", dk:"credit", description:"" });
      fetchPaymentTypes();
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprovePayment = async (id) => {
    try { await apiService.approvePayment(id); showToast("To'lov tasdiqlandi!"); fetchPayments(); }
    catch (err) { showToast("Tasdiqlashda xatolik", "error"); }
  };

  const handleRejectPayment = async (id) => {
    const reason = prompt("Rad etish sababini kiriting:");
    if (!reason) return;
    try { await apiService.rejectPayment(id, reason); showToast("To'lov rad etildi!"); fetchPayments(); }
    catch (err) { showToast("Rad etishda xatolik", "error"); }
  };

  const handleDeletePayment = async (id) => {
    if (!confirm("Ushbu to'lovni o'chirishni tasdiqlaysizmi?")) return;
    try { await apiService.deletePayment(id); showToast("To'lov o'chirildi!"); fetchPayments(); }
    catch (err) { showToast("O'chirishda xatolik", "error"); }
  };

  const handleDeletePaymentType = async (id) => {
    if (!confirm("Ushbu to'lov turini o'chirishni tasdiqlaysizmi?")) return;
    try { await apiService.deletePaymentType(id); showToast("To'lov turi o'chirildi!"); fetchPaymentTypes(); }
    catch (err) { showToast("O'chirishda xatolik", "error"); }
  };

  const paginatedPayments = useMemo(() => {
    const s = (pagination.page - 1) * pagination.itemsPerPage;
    return filteredPayments.slice(s, s + pagination.itemsPerPage);
  }, [filteredPayments, pagination.page, pagination.itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / pagination.itemsPerPage);

  const C = COLORS;

  const tabs = [
    { id: "payments", label: "To'lovlar",      icon: CreditCard },
    { id: "types",    label: "To'lov turlari",  icon: FileText },
    { id: "debt",     label: "Qarzdorlik",      icon: AlertCircle },
    { id: "reports",  label: "Hisobotlar",      icon: PieChart },
  ];

  return (
    <>
      <GlobalStyles c={C} />
      <div style={{ minHeight:"100vh", background:C.background }}>

        {/* HEADER */}
        <div style={{
          background:`${C.cardBg}CC`, backdropFilter:"blur(20px)",
          borderBottom:`1px solid ${C.border}`, padding:"14px 24px",
          position:"sticky", top:0, zIndex:50
        }}>
          <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:36, height:36, borderRadius:9,
                background:`linear-gradient(135deg,${C.brandDark},${C.brand})`,
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <CreditCard size={16} color="#fff"/>
              </div>
              <div>
                <h1 style={{ fontSize:17, fontWeight:700, color:C.text }}>To'lovlar Boshqaruvi</h1>
                <p style={{ fontSize:10, color:C.textMuted }}>Admin Panel</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                display:"flex", alignItems:"center", gap:7,
                background:C.cardBgAlt, borderRadius:40, padding:"5px 12px",
                border:`1px solid ${C.border}`
              }}>
                <Search size={14} color={C.textMuted}/>
                <input
                  type="text" placeholder="Qidirish..."
                  value={filters.search}
                  onChange={e => updateFilter('search', e.target.value)}
                  style={{ background:"transparent", border:"none", outline:"none", fontSize:13, color:C.text, width:160 }}
                />
              </div>
              <button onClick={() => navigate('/admin')} className="btn" style={{
                padding:"7px 14px", borderRadius:9, background:"transparent",
                border:`1px solid ${C.border}`, color:C.textMuted, fontSize:12,
                display:"flex", alignItems:"center", gap:5
              }}>
                <ChevronLeft size={13}/> Orqaga
              </button>
            </div>
          </div>
        </div>

        <main style={{ maxWidth:1400, margin:"0 auto", padding:"20px 24px" }}>

          {/* STATS ROW */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:18 }}>
            {[
              { label:"Jami to'lovlar",  val:stats.totalPayments,    icon:FileText,    color:C.info    },
              { label:"Kutilmoqda",      val:stats.pendingPayments,  icon:Clock,       color:C.warning },
              { label:"Tasdiqlangan",    val:stats.approvedPayments, icon:CheckCircle, color:C.success },
              { label:"Rad etilgan",     val:stats.rejectedPayments, icon:XCircle,     color:C.danger  },
              { label:"To'langan summa", val:formatCurrency(stats.totalPaidAmount), icon:TrendingUp, color:C.brand },
            ].map((s,i) => (
              <div key={i} style={{
                padding:"14px 16px", background:C.cardBg,
                border:`1px solid ${C.border}`, borderRadius:14
              }}>
                <div style={{
                  width:32, height:32, borderRadius:8,
                  background:`${s.color}18`, display:"flex", alignItems:"center",
                  justifyContent:"center", marginBottom:8
                }}>
                  <s.icon size={15} color={s.color}/>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:2 }}>{s.val}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{
            display:"flex", gap:6, background:C.cardBg, borderRadius:14,
            padding:"5px", border:`1px solid ${C.border}`, marginBottom:20, overflowX:"auto"
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                  padding:"9px 18px", borderRadius:10,
                  background: active ? `linear-gradient(135deg,${C.brandDark},${C.brand})` : "transparent",
                  color: active ? "#fff" : C.textMuted, fontSize:13, fontWeight:500,
                  display:"flex", alignItems:"center", gap:7, flexShrink:0, border:"none"
                }}>
                  <Icon size={14}/>{tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:300 }}>
              <div className="spin" style={{
                width:40, height:40, borderRadius:"50%",
                border:`3px solid ${C.border}`, borderTopColor:C.brand
              }}/>
            </div>
          ) : (
            <>
              {/* TAB: PAYMENTS */}
              {activeTab === "payments" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                    <div>
                      <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Barcha to'lovlar</span>
                      <span style={{ fontSize:12, color:C.textMuted, marginLeft:8 }}>Jami {filteredPayments.length} ta</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => openModal('createPayment')} className="btn" style={{
                        padding:"9px 18px", borderRadius:9,
                        background:`linear-gradient(135deg,${C.brandDark},${C.brand})`,
                        color:"#fff", fontSize:13, fontWeight:600,
                        display:"flex", alignItems:"center", gap:6, border:"none"
                      }}>
                        <Plus size={15}/> To'lov qo'shish
                      </button>
                      <button onClick={fetchPayments} className="btn" style={{
                        width:36, height:36, borderRadius:9, background:"transparent",
                        border:`1px solid ${C.border}`, color:C.textMuted,
                        display:"flex", alignItems:"center", justifyContent:"center"
                      }}>
                        <RefreshCw size={14}/>
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
                    gap:10, padding:14, background:C.cardBg,
                    border:`1px solid ${C.border}`, borderRadius:12, marginBottom:16
                  }}>
                    {[
                      { label:"Oy", el: <input type="month" value={filters.month} onChange={e=>updateFilter('month',e.target.value)} className="input"/> },
                      { label:"Guruh", el:
                        <select value={filters.groupId} onChange={e=>updateFilter('groupId',e.target.value)} className="select">
                          <option value="">Barchasi</option>
                          {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      },
                      { label:"To'lov turi", el:
                        <select value={filters.typeId} onChange={e=>updateFilter('typeId',e.target.value)} className="select">
                          <option value="">Barchasi</option>
                          {paymentTypes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      },
                      { label:"Holat", el:
                        <select value={filters.status} onChange={e=>updateFilter('status',e.target.value)} className="select">
                          <option value="">Barchasi</option>
                          <option value="pending">Kutilmoqda</option>
                          <option value="approved">Tasdiqlangan</option>
                          <option value="rejected">Rad etilgan</option>
                        </select>
                      },
                    ].map((f,i) => (
                      <div key={i}>
                        <label style={{ display:"block", fontSize:10, fontWeight:600, color:C.textMuted, marginBottom:5 }}>{f.label}</label>
                        {f.el}
                      </div>
                    ))}
                  </div>

                  <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
                    {paginatedPayments.length === 0 ? (
                      <div style={{ textAlign:"center", padding:60, color:C.textMuted }}>
                        <CreditCard size={40} style={{ marginBottom:10, opacity:0.3 }}/>
                        <p>To'lovlar topilmadi</p>
                      </div>
                    ) : (
                      paginatedPayments.map((p, i) => {
                        const isCredit = p.type === 'credit' || p.dk === 'credit';
                        return (
                          <div key={p.id} style={{
                            display:"flex", alignItems:"center", gap:14, padding:"12px 16px",
                            borderBottom: i < paginatedPayments.length-1 ? `1px solid ${C.border}` : "none",
                          }}>
                            <div style={{
                              width:38, height:38, borderRadius:9, flexShrink:0,
                              background: isCredit ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                              display:"flex", alignItems:"center", justifyContent:"center"
                            }}>
                              {isCredit ? <ArrowUpRight size={17} color={C.success}/> : <ArrowDownRight size={17} color={C.danger}/>}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                                <span style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {p.description || p.comment || "To'lov"}
                                </span>
                                <StatusBadge status={p.status}/>
                                <TypeBadge type={p.type || p.dk}/>
                              </div>
                              <div style={{ display:"flex", gap:12, fontSize:11, color:C.textMuted }}>
                                <span>{formatDate(p.date || p.createdAt)}</span>
                                {p.toWho?.name && <span>{p.toWho.name}</span>}
                                {p.group?.name && <span>{p.group.name}</span>}
                              </div>
                            </div>
                            <div style={{ fontSize:16, fontWeight:700, color: isCredit ? C.success : C.danger, flexShrink:0 }}>
                              {isCredit ? "+" : "-"}{formatCurrency(p.amount)}
                            </div>
                            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                              <button onClick={() => { setSelectedPayment(p); openModal('paymentDetails'); }} className="btn-sm">
                                <Eye size={13}/>
                              </button>
                              {p.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApprovePayment(p.id)} className="btn-sm" style={{ background:"rgba(34,197,94,0.15)", borderColor:"rgba(34,197,94,0.3)", color:C.success }}>
                                    <Check size={13}/>
                                  </button>
                                  <button onClick={() => handleRejectPayment(p.id)} className="btn-sm" style={{ background:"rgba(239,68,68,0.15)", borderColor:"rgba(239,68,68,0.3)", color:C.danger }}>
                                    <X size={13}/>
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleDeletePayment(p.id)} className="btn-sm" style={{ color:C.danger }}>
                                <Trash2 size={13}/>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {totalPages > 1 && (
                      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, padding:"12px 16px", borderTop:`1px solid ${C.border}` }}>
                        <button onClick={() => setPagination(p=>({...p,page:Math.max(1,p.page-1)}))}
                          disabled={pagination.page===1} className="btn-sm" style={{ width:"auto", padding:"6px 12px", gap:4 }}>
                          <ChevronLeft size={13}/> Oldingi
                        </button>
                        <span style={{ fontSize:12, color:C.textMuted }}>{pagination.page} / {totalPages}</span>
                        <button onClick={() => setPagination(p=>({...p,page:Math.min(totalPages,p.page+1)}))}
                          disabled={pagination.page===totalPages} className="btn-sm" style={{ width:"auto", padding:"6px 12px", gap:4 }}>
                          Keyingi <ChevronRight size={13}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: TYPES */}
              {activeTab === "types" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <span style={{ fontSize:16, fontWeight:700, color:C.text }}>
                      To'lov turlari <span style={{ fontSize:12, color:C.textMuted, fontWeight:400 }}>({paymentTypes.length} ta)</span>
                    </span>
                    <button onClick={() => openModal('createType')} className="btn" style={{
                      padding:"9px 18px", borderRadius:9,
                      background:`linear-gradient(135deg,${C.brandDark},${C.brand})`,
                      color:"#fff", fontSize:13, fontWeight:600,
                      display:"flex", alignItems:"center", gap:6, border:"none"
                    }}>
                      <Plus size={15}/> Tur qo'shish
                    </button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                    {paymentTypes.map((t) => (
                      <div key={t.id} style={{
                        padding:"16px 18px", background:C.cardBg,
                        border:`1px solid ${C.border}`, borderRadius:14,
                        display:"flex", justifyContent:"space-between", alignItems:"flex-start"
                      }}>
                        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                          <div style={{
                            width:36, height:36, borderRadius:9, flexShrink:0,
                            background: t.dk==='credit' ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                            display:"flex", alignItems:"center", justifyContent:"center"
                          }}>
                            {t.dk==='credit' ? <ArrowUpRight size={17} color={C.success}/> : <ArrowDownRight size={17} color={C.danger}/>}
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{t.name}</div>
                            <div style={{ display:"flex", gap:6 }}>
                              <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4,
                                background: t.dk==='credit' ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                color: t.dk==='credit' ? C.success : C.danger, fontWeight:600 }}>
                                {t.dk==='credit' ? 'Kirim' : 'Chiqim'}
                              </span>
                              <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4,
                                background:"rgba(59,130,246,0.15)", color:C.info, fontWeight:600 }}>
                                {t.code}
                              </span>
                            </div>
                            {t.description && <p style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{t.description}</p>}
                          </div>
                        </div>
                        <button onClick={() => handleDeletePaymentType(t.id)} className="btn-sm" style={{ color:C.danger, flexShrink:0 }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    ))}
                    {paymentTypes.length === 0 && (
                      <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:C.textMuted }}>
                        <FileText size={40} style={{ marginBottom:10, opacity:0.3 }}/>
                        <p>To'lov turlari topilmadi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: DEBT */}
              {activeTab === "debt" && (
                <div>
                  <div style={{ marginBottom:16 }}>
                    <span style={{ fontSize:16, fontWeight:700, color:C.text }}>O'quvchi qarzdorligi</span>
                    <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Guruh bo'yicha qarzdorlik holati — bosing</p>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                    {groups.map(group => {
                      const gStudentsList = groupStudents[group.id] || group.students || [];
                      const monthlyPrice = group.monthlyPrice || group.price || 0;
                      const totalDebt = gStudentsList.reduce((sum, student) => {
                        const sId = student.id || student.userId;
                        const paid = payments
                          .filter(p => (p.toWhoId===sId || p.toWho?.id===sId) && p.status==='approved' && (p.dk==='credit'||p.type==='credit'))
                          .reduce((s,p)=>s+(p.amount||0),0);
                        return sum + Math.max(0, monthlyPrice - paid);
                      }, 0);
                      return (
                        <div key={group.id} style={{
                          padding:"16px 18px", background:C.cardBg,
                          border:`1px solid ${C.border}`, borderRadius:14,
                          cursor:"pointer", transition:"all .2s"
                        }} onClick={() => openGroupDebt(group)}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{group.name}</div>
                              <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
                                {gStudentsList.length} o'quvchi · {formatCurrency(monthlyPrice)}/oy
                              </div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:15, fontWeight:700, color: totalDebt > 0 ? C.danger : C.success }}>
                                {formatCurrency(totalDebt)}
                              </div>
                              <div style={{ fontSize:10, color:C.textMuted }}>Umumiy qarz</div>
                            </div>
                          </div>
                          <div style={{ height:4, borderRadius:2, background:C.border, overflow:"hidden" }}>
                            <div style={{
                              height:"100%", borderRadius:2,
                              background: totalDebt > 0 ? C.danger : C.success,
                              width: monthlyPrice > 0
                                ? `${Math.min(100, (totalDebt / (monthlyPrice * Math.max(gStudentsList.length,1))) * 100)}%`
                                : "0%"
                            }}/>
                          </div>
                          <div style={{ fontSize:10, color:C.textMuted, marginTop:6 }}>Batafsil ko'rish →</div>
                        </div>
                      );
                    })}
                    {groups.length === 0 && (
                      <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:C.textMuted }}>
                        <Users size={40} style={{ marginBottom:10, opacity:0.3 }}/>
                        <p>Guruhlar topilmadi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: REPORTS */}
              {activeTab === "reports" && (
                <div>
                  <div style={{ marginBottom:16 }}>
                    <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Moliyaviy hisobotlar</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
                    {[
                      { title:"Oylik hisobot", desc:"Har oylik to'lovlar", icon:Calendar, color:C.info,
                        action: () => { const m = prompt("Oy kiriting (YYYY-MM):", new Date().toISOString().slice(0,7)); if(m){updateFilter('month',m);setActiveTab('payments');} } },
                      { title:"Kunlik hisobot", desc:"Bugungi to'lovlar", icon:CreditCard, color:C.success,
                        action: () => { updateFilter('month', new Date().toISOString().slice(0,7)); setActiveTab('payments'); } },
                      { title:"Qarzdorlik hisoboti", desc:"Guruh bo'yicha qarzdorlik", icon:AlertCircle, color:C.danger,
                        action: () => setActiveTab('debt') },
                    ].map((r,i) => (
                      <div key={i} onClick={r.action} style={{
                        padding:"20px", background:C.cardBg,
                        border:`1px solid ${C.border}`, borderRadius:14, cursor:"pointer"
                      }}>
                        <div style={{
                          width:40, height:40, borderRadius:10,
                          background:`${r.color}18`, display:"flex", alignItems:"center",
                          justifyContent:"center", marginBottom:12
                        }}>
                          <r.icon size={18} color={r.color}/>
                        </div>
                        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{r.title}</div>
                        <div style={{ fontSize:12, color:C.textMuted }}>{r.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginTop:14 }}>
                    {[
                      { label:"Jami to'lovlar",  val:stats.totalPayments },
                      { label:"Tasdiqlangan",    val:stats.approvedPayments },
                      { label:"Kutilmoqda",      val:stats.pendingPayments },
                      { label:"Oylik daromad",   val:formatCurrency(stats.monthlyRevenue) },
                    ].map((s,i) => (
                      <div key={i} style={{
                        padding:"14px 16px", background:C.cardBg,
                        border:`1px solid ${C.border}`, borderRadius:12
                      }}>
                        <div style={{ fontSize:11, color:C.textMuted, marginBottom:6 }}>{s.label}</div>
                        <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL: CREATE PAYMENT */}
      {modals.createPayment && (
        <ModalWrap onClose={() => { closeModal('createPayment'); setShowInlineType(false); }} title="Yangi to'lov" c={C}>
          <form onSubmit={handleCreatePayment} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <FField label="Turi *">
                <select required value={paymentForm.type} onChange={e=>setPaymentForm(p=>({...p,type:e.target.value}))} className="select">
                  <option value="credit">Kirim</option>
                  <option value="debit">Chiqim</option>
                  <option value="refund">Qaytarish</option>
                </select>
              </FField>
              <FField label="Summa *">
                <input required type="number" min="0" step="1" placeholder="Summa"
                  value={paymentForm.amount} onChange={e=>setPaymentForm(p=>({...p,amount:e.target.value}))} className="input"/>
              </FField>
            </div>

            <FField label="Guruh *">
              <select required value={paymentForm.groupId}
                onChange={e=>setPaymentForm(p=>({...p,groupId:e.target.value,toWho:""}))} className="select">
                <option value="">Guruhni tanlang</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </FField>

            <FField label="O'quvchi *">
              <select required value={paymentForm.toWho}
                onChange={e=>setPaymentForm(p=>({...p,toWho:e.target.value}))} className="select"
                disabled={!paymentForm.groupId} style={{ opacity:!paymentForm.groupId?0.5:1 }}>
                <option value="">{paymentForm.groupId ? "O'quvchini tanlang" : "Avval guruh tanlang"}</option>
                {(groupStudents[paymentForm.groupId] || []).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name || s.name}{s.user?.phone ? ` (${s.user.phone})` : ""}
                  </option>
                ))}
              </select>
            </FField>

            {/* PAYMENT TYPE with inline + */}
            <FField label="To'lov turi">
              {!showInlineType ? (
                <div style={{ display:"flex", gap:8 }}>
                  <select value={paymentForm.typeId}
                    onChange={e=>setPaymentForm(p=>({...p,typeId:e.target.value}))} className="select" style={{ flex:1 }}>
                    <option value="">Tanlanmagan</option>
                    {paymentTypes.map(t=><option key={t.id} value={t.id}>{t.name} ({t.dk==='credit'?'Kirim':'Chiqim'})</option>)}
                  </select>
                  <button type="button" onClick={()=>setShowInlineType(true)} style={{
                    width:36, height:36, borderRadius:9, flexShrink:0,
                    border:`1px solid ${C.brand}`, background:`rgba(66,122,67,0.15)`,
                    color:C.brandLight, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center"
                  }} title="Yangi tur yaratish">
                    <Plus size={16}/>
                  </button>
                </div>
              ) : (
                <div style={{
                  background:C.cardBgAlt, borderRadius:10, padding:12,
                  border:`1px solid ${C.brand}40`
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:C.brandLight }}>Yangi to'lov turi</span>
                    <button type="button" onClick={()=>setShowInlineType(false)}
                      style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer" }}>
                      <X size={14}/>
                    </button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    <input placeholder="Nomi *" value={inlineTypeName}
                      onChange={e=>setInlineTypeName(e.target.value)} className="input" style={{ fontSize:12 }}/>
                    <input placeholder="Kod (masalan: MONTHLY)" value={inlineTypeCode}
                      onChange={e=>setInlineTypeCode(e.target.value.toUpperCase())} className="input" style={{ fontSize:12 }}/>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <select value={inlineTypeDk} onChange={e=>setInlineTypeDk(e.target.value)}
                      className="select" style={{ flex:1, fontSize:12 }}>
                      <option value="credit">Kirim</option>
                      <option value="debit">Chiqim</option>
                    </select>
                    <button type="button" onClick={handleInlineCreateType} disabled={inlineTypeLoading} style={{
                      padding:"8px 14px", borderRadius:9, border:"none",
                      background:`linear-gradient(135deg,${C.brandDark},${C.brand})`,
                      color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer",
                      display:"flex", alignItems:"center", gap:5
                    }}>
                      {inlineTypeLoading ? <RefreshCw size={12} className="spin"/> : <Check size={12}/>}
                      Yaratish
                    </button>
                  </div>
                </div>
              )}
            </FField>

            <FField label="Tavsif">
              <textarea placeholder="To'lov tavsifi..." value={paymentForm.description}
                onChange={e=>setPaymentForm(p=>({...p,description:e.target.value}))}
                className="input" style={{ minHeight:72, resize:"vertical" }}/>
            </FField>

            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button type="button" onClick={()=>{closeModal('createPayment');setShowInlineType(false);}} className="btn" style={{
                flex:1, padding:11, borderRadius:9, background:"transparent",
                border:`1px solid ${C.border}`, color:C.textMuted, fontSize:13
              }}>Bekor</button>
              <button type="submit" disabled={modalLoading} className="btn" style={{
                flex:2, padding:11, borderRadius:9, border:"none",
                background: modalLoading ? `${C.brand}50` : `linear-gradient(135deg,${C.brandDark},${C.brand})`,
                color:"#fff", fontSize:13, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:6
              }}>
                {modalLoading ? <><RefreshCw size={13} className="spin"/>Yuborilmoqda...</> : <><Check size={13}/>Yaratish</>}
              </button>
            </div>
          </form>
        </ModalWrap>
      )}

      {/* MODAL: CREATE TYPE */}
      {modals.createType && (
        <ModalWrap onClose={()=>closeModal('createType')} title="Yangi to'lov turi" c={C}>
          <form onSubmit={handleCreatePaymentType} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FField label="Nomi *">
              <input required type="text" placeholder="To'lov turi nomi"
                value={typeForm.name} onChange={e=>setTypeForm(p=>({...p,name:e.target.value}))} className="input"/>
            </FField>
            <FField label="Kod *">
              <input required type="text" placeholder="KOD (masalan: MONTHLY_FEE)"
                value={typeForm.code} onChange={e=>setTypeForm(p=>({...p,code:e.target.value.toUpperCase()}))} className="input"/>
            </FField>
            <FField label="Turi *">
              <select required value={typeForm.dk} onChange={e=>setTypeForm(p=>({...p,dk:e.target.value}))} className="select">
                <option value="credit">Kirim</option>
                <option value="debit">Chiqim</option>
              </select>
            </FField>
            <FField label="Tavsif">
              <textarea placeholder="Tavsif..." value={typeForm.description}
                onChange={e=>setTypeForm(p=>({...p,description:e.target.value}))}
                className="input" style={{ minHeight:72, resize:"vertical" }}/>
            </FField>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button type="button" onClick={()=>closeModal('createType')} className="btn" style={{
                flex:1, padding:11, borderRadius:9, background:"transparent",
                border:`1px solid ${C.border}`, color:C.textMuted, fontSize:13
              }}>Bekor</button>
              <button type="submit" disabled={modalLoading} className="btn" style={{
                flex:2, padding:11, borderRadius:9, border:"none",
                background:`linear-gradient(135deg,${C.brandDark},${C.brand})`,
                color:"#fff", fontSize:13, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:6
              }}>
                {modalLoading ? <><RefreshCw size={13} className="spin"/>Yuborilmoqda...</> : <><Check size={13}/>Yaratish</>}
              </button>
            </div>
          </form>
        </ModalWrap>
      )}

      {/* MODAL: PAYMENT DETAILS */}
      {modals.paymentDetails && selectedPayment && (
        <ModalWrap onClose={()=>closeModal('paymentDetails')} title="To'lov tafsilotlari"
          subtitle={`#${(selectedPayment.id||'').slice(0,8)}`} c={C}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{
              padding:16, borderRadius:10, textAlign:"center",
              background: (selectedPayment.type==='credit'||selectedPayment.dk==='credit') ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"
            }}>
              <p style={{ fontSize:11, color:C.textMuted, marginBottom:4 }}>
                {(selectedPayment.type==='credit'||selectedPayment.dk==='credit') ? 'Kirim' : 'Chiqim'}
              </p>
              <p style={{ fontSize:26, fontWeight:700, color:C.text }}>
                {(selectedPayment.type==='credit'||selectedPayment.dk==='credit') ? "+" : "-"}{formatCurrency(selectedPayment.amount)}
              </p>
            </div>
            {[
              ["Tavsif",      selectedPayment.description || selectedPayment.comment || "—"],
              ["Sana",        formatDate(selectedPayment.date || selectedPayment.createdAt)],
              ["Holat",       <StatusBadge status={selectedPayment.status}/>],
              ["Kim uchun",   selectedPayment.toWho?.name || "—"],
              ["Guruh",       selectedPayment.group?.name || "—"],
              ["To'lov turi", paymentTypes.find(t=>t.id===selectedPayment.typeId)?.name || "—"],
            ].map(([l,v],i) => (
              <div key={i}>
                <p style={{ fontSize:11, color:C.textMuted, marginBottom:3 }}>{l}</p>
                <p style={{ fontSize:14, fontWeight:600, color:C.text }}>{v}</p>
              </div>
            ))}
            <button onClick={()=>closeModal('paymentDetails')} className="btn" style={{
              padding:11, borderRadius:9, background:`rgba(66,122,67,0.15)`,
              border:`1px solid rgba(66,122,67,0.3)`, color:C.text, fontSize:13, fontWeight:600, marginTop:4
            }}>Yopish</button>
          </div>
        </ModalWrap>
      )}

      {/* MODAL: GROUP DEBT */}
      {modals.studentDebt && selectedGroupDebt && (
        <ModalWrap onClose={()=>closeModal('studentDebt')}
          title={`${selectedGroupDebt.name} — Qarzdorlik`} c={C}>
          <div>
            <div style={{ marginBottom:12, fontSize:12, color:C.textMuted }}>
              Oylik to'lov: {formatCurrency(selectedGroupDebt.monthlyPrice || selectedGroupDebt.price || 0)}
            </div>
            {calcGroupDebt(selectedGroupDebt).length === 0 ? (
              <p style={{ color:C.textMuted, textAlign:"center", padding:20 }}>O'quvchilar topilmadi</p>
            ) : (
              calcGroupDebt(selectedGroupDebt).map((s,i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 0", borderBottom:`1px solid ${C.border}`
                }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.name}</div>
                    {s.phone && <div style={{ fontSize:11, color:C.textMuted }}>{s.phone}</div>}
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
                      To'langan: {formatCurrency(s.paid)}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:14, fontWeight:700, color: s.debt > 0 ? C.danger : C.success }}>
                      {s.debt > 0 ? `-${formatCurrency(s.debt)}` : "✓ To'langan"}
                    </div>
                    {s.debt > 0 && <div style={{ fontSize:10, color:C.textMuted }}>qarz</div>}
                  </div>
                </div>
              ))
            )}
            <button onClick={()=>closeModal('studentDebt')} className="btn" style={{
              width:"100%", padding:11, borderRadius:9, background:`rgba(66,122,67,0.15)`,
              border:`1px solid rgba(66,122,67,0.3)`, color:C.text, fontSize:13, fontWeight:600, marginTop:14
            }}>Yopish</button>
          </div>
        </ModalWrap>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", bottom:20, right:20, zIndex:1000,
          padding:"10px 18px", borderRadius:9,
          background: toast.type==='success' ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
          border:`1px solid ${toast.type==='success' ? C.success : C.danger}`,
          color: toast.type==='success' ? C.success : C.danger,
          fontSize:13, fontWeight:600,
          display:"flex", alignItems:"center", gap:7,
          animation:"slideUp 0.3s ease"
        }}>
          {toast.type==='success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
          {toast.message}
        </div>
      )}
    </>
  );
}

const ModalWrap = ({ onClose, title, subtitle, children, c }) => (
  <div style={{
    position:"fixed", inset:0, zIndex:100,
    background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)",
    display:"flex", alignItems:"center", justifyContent:"center", padding:20
  }}>
    <div style={{
      width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto",
      background:c.cardBg, border:`1px solid ${c.border}`,
      borderRadius:16, padding:22, animation:"fadeIn 0.25s ease"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <h3 style={{ fontSize:16, fontWeight:700, color:c.text }}>{title}</h3>
          {subtitle && <p style={{ fontSize:11, color:c.textMuted, marginTop:2 }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} className="btn" style={{
          width:30, height:30, borderRadius:8, background:"transparent",
          border:`1px solid ${c.border}`, color:c.textMuted,
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <X size={14}/>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const FField = ({ label, children }) => (
  <div>
    <label style={{ display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", marginBottom:5 }}>
      {label}
    </label>
    {children}
  </div>
);

const GlobalStyles = ({ c }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{font-family:'Inter',system-ui,sans-serif;box-sizing:border-box;margin:0;padding:0}
    body{background:${c.background};color:${c.text}}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${c.border};border-radius:3px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin 1s linear infinite}
    .btn{border:none;cursor:pointer;font-family:inherit;font-weight:500;transition:all .2s ease}
    .btn:active{transform:scale(0.97)}
    .btn-sm{
      width:30px;height:30px;border-radius:7px;background:transparent;
      border:1px solid ${c.border};color:${c.textMuted};cursor:pointer;
      display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0
    }
    .btn-sm:hover{background:${c.cardBgAlt}}
    .input,.select{
      width:100%;background:${c.cardBgAlt};border:1px solid ${c.border};
      color:${c.text};border-radius:9px;padding:9px 12px;font-size:13px;
      outline:none;transition:all .2s ease;font-family:inherit
    }
    .input:focus,.select:focus{border-color:${c.brand};box-shadow:0 0 0 2px ${c.brand}20}
    .select{cursor:pointer}
    textarea.input{font-family:inherit}
  `}</style>
);