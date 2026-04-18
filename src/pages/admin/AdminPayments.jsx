import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  CreditCard, DollarSign, TrendingUp, Filter, Calendar, Search,
  Download, Plus, CheckCircle, XCircle, MoreHorizontal, Eye,
  Edit, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw,
  PieChart, BarChart3, Users, Building2, FileText,
  ChevronRight, ChevronLeft, X, AlertCircle, Crown,
  Award, Star, Clock, Shield, Check, Bell
} from 'lucide-react';

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const BRAND = "#427A43";
const BRAND_DARK = "#2d5630";
const BRAND_LIGHT = "#5a9e5b";
const BACKGROUND = "#0f0f12";
const CARD_BG = "#1a1a1e";
const CARD_BG2 = "#242428";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.5)";
const SUCCESS = "#22c55e";
const WARNING = "#f59e0b";
const DANGER = "#ef4444";
const INFO = "#3b82f6";

const fmtCurrency = (amount) =>
  new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(amount || 0);

const formatDate = (date) => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "—";
  }
};

const formatMonth = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("uz-UZ", {
      month: "long",
      year: "numeric"
    });
  } catch {
    return "";
  }
};

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
export default function AdminPayments() {
  const { user } = useAuth();
  const { isDarkMode: D, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    studentCount: 0,
    teacherCount: 0,
    totalStudentDebt: 0,
    totalPaidAmount: 0,
    teacherCommissionTotal: 0
  });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    type: "credit",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    toWho: "",
    groupId: "",
    typeId: "",
    description: "",
    lessonDate: new Date().toISOString().split('T')[0]
  });

  const [typeForm, setTypeForm] = useState({
    name: "",
    code: "",
    dk: "credit",
    description: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── DATA FETCHING ────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedGroup) params.groupId = selectedGroup;
      if (selectedType) params.typeId = selectedType;

      const data = await apiService.getPayments(params);
      const paymentsList = Array.isArray(data) ? data : (data?.payments || data?.data || []);
      setPayments(paymentsList);
      setFilteredPayments(paymentsList);
    } catch (error) {
      console.error("To'lovlarni olishda xatolik:", error);
      showToast("To'lovlarni olishda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedGroup, selectedType]);

  const fetchPaymentTypes = useCallback(async () => {
    try {
      const data = await apiService.getPaymentTypes(true);
      const typesList = Array.isArray(data) ? data : (data?.paymentTypes || data?.data || []);
      setPaymentTypes(typesList);
    } catch (error) {
      console.error("To'lov turlarini olishda xatolik:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // Get monthly report
      const monthlyReport = await apiService.getPaymentReport(currentMonth);
      const dailyReport = await apiService.getDailyFinancialSummary(today.toISOString().split('T')[0]);

      // Calculate student debt and paid amounts
      const totalStudentDebt = students.reduce((sum, student) => {
        const studentPayments = payments.filter(p =>
          p.toWhoId === student.id && p.status === 'approved'
        );
        const paid = studentPayments.reduce((ps, p) => ps + (p.amount || 0), 0);
        const expectedPayment = groups.find(g =>
          g.students?.some(s => s.id === student.id)
        )?.monthlyPrice || 0;

        return sum + Math.max(0, expectedPayment - paid);
      }, 0);

      const totalPaidAmount = payments
        .filter(p => p.status === 'approved' && p.dk === 'credit')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Calculate teacher commission total
      const teacherCommissionTotal = teachers.reduce((sum, teacher) => {
        const teacherPayments = payments.filter(p =>
          p.fromWhoId === teacher.id && p.dk === 'credit'
        );
        const teacherEarnings = teacherPayments.reduce((te, p) => te + (p.amount || 0), 0);
        const commission = (teacherEarnings * (teacher.commissionPercentage || 0)) / 100;
        return sum + commission;
      }, 0);

      setStats({
        totalRevenue: monthlyReport?.totalRevenue || 0,
        totalPayments: payments.length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        approvedPayments: payments.filter(p => p.status === 'approved').length,
        rejectedPayments: payments.filter(p => p.status === 'rejected').length,
        monthlyRevenue: monthlyReport?.monthlyRevenue || 0,
        dailyRevenue: dailyReport?.dailyRevenue || 0,
        studentCount: students.length,
        teacherCount: teachers.length,
        totalStudentDebt,
        totalPaidAmount,
        teacherCommissionTotal
      });
    } catch (error) {
      console.error("Statistikalarni olishda xatolik:", error);
    }
  }, [payments.length, students.length, teachers.length, groups]);

  const fetchUsers = useCallback(async () => {
    try {
      const [teachersData, studentsData, groupsData] = await Promise.all([
        apiService.getTeachers(),
        apiService.getStudents(),
        apiService.getGroups()
      ]);

      setTeachers(Array.isArray(teachersData) ? teachersData : (teachersData?.teachers || []));
      setStudents(Array.isArray(studentsData) ? studentsData : (studentsData?.students || []));
      setGroups(Array.isArray(groupsData) ? groupsData : (groupsData?.groups || []));
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchPayments(),
      fetchPaymentTypes(),
      fetchUsers()
    ]);
  }, [fetchPayments, fetchPaymentTypes, fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ─── FILTERING ────────────────────────────────────────────────
  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.description?.toLowerCase().includes(term) ||
        p.comment?.toLowerCase().includes(term) ||
        p.toWho?.name?.toLowerCase().includes(term)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(p => p.typeId === selectedType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedStatus, payments]);

  // ─── PAYMENT OPERATIONS ───────────────────────────────────────
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createPayment(paymentForm);
      showToast("To'lov muvaffaqiyatli yaratildi!");
      setShowCreateModal(false);
      setPaymentForm({
        type: "credit",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        toWho: "",
        groupId: "",
        typeId: "",
        description: "",
        lessonDate: new Date().toISOString().split('T')[0]
      });
      fetchPayments();
    } catch (error) {
      console.error("To'lov yaratishda xatolik:", error);
      showToast(error.message || "To'lov yaratishda xatolik yuz berdi", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreatePaymentType = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createPaymentType(typeForm);
      showToast("To'lov turi muvaffaqiyatli yaratildi!");
      setShowTypeModal(false);
      setTypeForm({
        name: "",
        code: "",
        dk: "credit",
        description: ""
      });
      fetchPaymentTypes();
    } catch (error) {
      console.error("To'lov turini yaratishda xatolik:", error);
      showToast(error.message || "To'lov turini yaratishda xatolik yuz berdi", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await apiService.approvePayment(paymentId);
      showToast("To'lov tasdiqlandi!");
      fetchPayments();
    } catch (error) {
      console.error("To'lovni tasdiqlashda xatolik:", error);
      showToast("To'lovni tasdiqlashda xatolik yuz berdi", "error");
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt("Rad etish sababini kiriting:");
    if (!reason) return;

    try {
      await apiService.rejectPayment(paymentId, reason);
      showToast("To'lov rad etildi!");
      fetchPayments();
    } catch (error) {
      console.error("To'lovni rad etishda xatolik:", error);
      showToast("To'lovni rad etishda xatolik yuz berdi", "error");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm("Ushbu to'lovni o'chirishni tasdiqlaysizmi?")) return;

    try {
      await apiService.deletePayment(paymentId);
      showToast("To'lov o'chirildi!");
      fetchPayments();
    } catch (error) {
      console.error("To'lovni o'chirishda xatolik:", error);
      showToast("To'lovni o'chirishda xatolik yuz berdi", "error");
    }
  };

  const handleDeletePaymentType = async (typeId) => {
    if (!confirm("Ushbu to'lov turini o'chirishni tasdiqlaysizmi?")) return;

    try {
      await apiService.deletePaymentType(typeId);
      showToast("To'lov turi o'chirildi!");
      fetchPaymentTypes();
    } catch (error) {
      console.error("To'lov turini o'chirishda xatolik:", error);
      showToast("To'lov turini o'chirishda xatolik yuz berdi", "error");
    }
  };

  // ─── TABS ─────────────────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Umumiy ko'rish", icon: BarChart3 },
    { id: "payments", label: "To'lovlar", icon: CreditCard },
    { id: "types", label: "To'lov turlari", icon: FileText },
    { id: "reports", label: "Hisobotlar", icon: PieChart }
  ];

  // ─── PAGINATION ───────────────────────────────────────────────
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // ─── RENDER HELPERS ───────────────────────────────────────────
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: WARNING, bg: "rgba(245, 158, 11, 0.15)", label: "Kutilmoqda", icon: Clock },
      approved: { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)", label: "Tasdiqlangan", icon: CheckCircle },
      rejected: { color: DANGER, bg: "rgba(239, 68, 68, 0.15)", label: "Rad etilgan", icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 20,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 600
      }}>
        <Icon size={10} />
        {config.label}
      </div>
    );
  };

  const getTypeBadge = (dk) => {
    const config = dk === 'credit'
      ? { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)", label: "Kirim", icon: ArrowUpRight }
      : { color: DANGER, bg: "rgba(239, 68, 68, 0.15)", label: "Chiqim", icon: ArrowDownRight };

    const Icon = config.icon;
    return (
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 20,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 600
      }}>
        <Icon size={10} />
        {config.label}
      </div>
    );
  };

  return (
    <>
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: ${BACKGROUND};
          color: ${TEXT};
        }

        .admin-payments {
          min-height: 100vh;
          background: ${BACKGROUND};
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${BORDER};
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${BRAND}40;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease forwards;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .card {
          background: ${CARD_BG};
          border: 1px solid ${BORDER};
          border-radius: 16px;
          overflow: hidden;
        }

        .card-hover {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          border-color: ${BRAND}30;
        }

        .btn {
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn:active {
          transform: scale(0.98);
        }

        .input {
          width: 100%;
          background: ${CARD_BG2};
          border: 1px solid ${BORDER};
          color: ${TEXT};
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .input:focus {
          border-color: ${BRAND};
          box-shadow: 0 0 0 3px ${BRAND}20;
        }

        .select {
          width: 100%;
          background: ${CARD_BG2};
          border: 1px solid ${BORDER};
          color: ${TEXT};
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .select:focus {
          border-color: ${BRAND};
          box-shadow: 0 0 0 3px ${BRAND}20;
        }
      `}</style>

      <div className="admin-payments">
        {/* Header */}
        <div style={{
          background: `${CARD_BG}CC`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER}`,
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>To'lovlar Boshqaruvi</h1>
                <p style={{ fontSize: 11, color: TEXT_MUTED }}>Admin Panel</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: CARD_BG2,
                borderRadius: 40,
                padding: '6px 14px',
                border: `1px solid ${BORDER}`
              }}>
                <Search size={16} color={TEXT_MUTED} />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    color: TEXT,
                    width: 180
                  }}
                />
              </div>

              <button
                onClick={() => navigate('/admin')}
                className="btn"
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  color: TEXT_MUTED,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <ChevronLeft size={14} />
                Orqaga
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 8,
            background: CARD_BG,
            borderRadius: 16,
            padding: '6px',
            border: `1px solid ${BORDER}`,
            marginBottom: 24,
            overflowX: 'auto'
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="btn"
                  style={{
                    padding: '12px 20px',
                    borderRadius: 12,
                    background: isActive
                      ? `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`
                      : 'transparent',
                    color: isActive ? '#fff' : TEXT_MUTED,
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: 'none',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400
            }}>
              <div style={{ textAlign: 'center' }}>
                <div className="animate-spin" style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: `3px solid ${BORDER}`,
                  borderTopColor: BRAND,
                  marginBottom: 16
                }} />
                <p style={{ color: TEXT_MUTED }}>Yuklanmoqda...</p>
              </div>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  {/* Stats Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                    marginBottom: 24
                  }}>
                    {[
                      {
                        label: "Jami daromad",
                        value: fmtCurrency(stats.totalRevenue),
                        icon: TrendingUp,
                        color: SUCCESS,
                        trend: "+12%"
                      },
                      {
                        label: "Oylik daromad",
                        value: fmtCurrency(stats.monthlyRevenue),
                        icon: DollarSign,
                        color: INFO,
                        trend: "+8%"
                      },
                      {
                        label: "Kunlik daromad",
                        value: fmtCurrency(stats.dailyRevenue),
                        icon: CreditCard,
                        color: WARNING,
                        trend: "+5%"
                      },
                      {
                        label: "Jami to'lovlar",
                        value: stats.totalPayments,
                        icon: FileText,
                        color: BRAND_LIGHT,
                        trend: "+15%"
                      },
                      {
                        label: "O'quvchi qarzdorligi",
                        value: fmtCurrency(stats.totalStudentDebt),
                        icon: AlertCircle,
                        color: DANGER,
                        trend: "-3%"
                      },
                      {
                        label: "To'langan summa",
                        value: fmtCurrency(stats.totalPaidAmount),
                        icon: CheckCircle,
                        color: BRAND,
                        trend: "+10%"
                      }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="card card-hover"
                        style={{
                          padding: '20px',
                          animation: `slideUp 0.4s ease ${index * 0.1}s both`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12
                        }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <stat.icon size={20} color={stat.color} />
                          </div>
                          <span style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            borderRadius: 20,
                            background: `${SUCCESS}15`,
                            color: SUCCESS,
                            fontWeight: 600
                          }}>
                            {stat.trend}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                          {stat.value}
                        </h3>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Payment Status */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                    marginBottom: 24
                  }}>
                    {[
                      { label: "Kutilmoqda", value: stats.pendingPayments, color: WARNING, icon: Clock },
                      { label: "Tasdiqlangan", value: stats.approvedPayments, color: SUCCESS, icon: CheckCircle },
                      { label: "Rad etilgan", value: stats.rejectedPayments, color: DANGER, icon: XCircle }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="card"
                        style={{
                          padding: '20px',
                          animation: `slideUp 0.4s ease ${index * 0.15}s both`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 12
                        }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <stat.icon size={18} color={stat.color} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>
                              {stat.value}
                            </h3>
                            <p style={{ fontSize: 11, color: TEXT_MUTED }}>{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 16 }}>
                      Tezkor amallar
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 12
                    }}>
                      {[
                        {
                          icon: Plus,
                          label: "To'lov qo'shish",
                          color: SUCCESS,
                          onClick: () => setShowCreateModal(true)
                        },
                        {
                          icon: FileText,
                          label: "To'lov turi yaratish",
                          color: INFO,
                          onClick: () => setShowTypeModal(true)
                        },
                        {
                          icon: Users,
                          label: "O'quvchilar",
                          color: BRAND_LIGHT,
                          onClick: () => navigate('/students-panel')
                        },
                        {
                          icon: Download,
                          label: "Hisobot yuklab olish",
                          color: WARNING,
                          onClick: () => setActiveTab('reports')
                        }
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={action.onClick}
                          className="btn card-hover"
                          style={{
                            padding: '16px',
                            borderRadius: 12,
                            background: CARD_BG2,
                            border: `1px solid ${BORDER}`,
                            color: TEXT,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            textAlign: 'left',
                            width: '100%'
                          }}
                        >
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: `${action.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <action.icon size={16} color={action.color} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {action.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div className="animate-fade-in">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
                        Barcha to'lovlar
                      </h2>
                      <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                        Jami {filteredPayments.length} ta yozuv
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn"
                        style={{
                          padding: '10px 20px',
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          border: 'none'
                        }}
                      >
                        <Plus size={16} />
                        To'lov qo'shish
                      </button>
                      <button
                        onClick={fetchPayments}
                        className="btn"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'transparent',
                          border: `1px solid ${BORDER}`,
                          color: TEXT_MUTED,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 12
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                          Oy
                        </label>
                        <input
                          type="month"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                          Guruh
                        </label>
                        <select
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="select"
                        >
                          <option value="">Barcha guruhlar</option>
                          {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                          To'lov turi
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="select"
                        >
                          <option value="">Barcha turlar</option>
                          {paymentTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                          Holat
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="select"
                        >
                          <option value="">Barcha holatlar</option>
                          <option value="pending">Kutilmoqda</option>
                          <option value="approved">Tasdiqlangan</option>
                          <option value="rejected">Rad etilgan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payments List */}
                  <div className="card" style={{ padding: '20px' }}>
                    {paginatedPayments.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: 60,
                        color: TEXT_MUTED
                      }}>
                        <CreditCard size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p>To'lovlar topilmadi</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {paginatedPayments.map((payment, index) => (
                          <div
                            key={payment.id}
                            className="card-hover"
                            style={{
                              padding: '16px',
                              borderRadius: 12,
                              background: CARD_BG2,
                              border: `1px solid ${BORDER}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 16,
                              animation: `fadeIn 0.3s ease ${index * 0.05}s both`
                            }}
                          >
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              background: payment.type === 'credit' || payment.dk === 'credit'
                                ? `${SUCCESS}15`
                                : `${DANGER}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {payment.type === 'credit' || payment.dk === 'credit' ? (
                                <ArrowUpRight size={20} color={SUCCESS} />
                              ) : (
                                <ArrowDownRight size={20} color={DANGER} />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <h4 style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: TEXT,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {payment.description || payment.comment || "To'lov"}
                                </h4>
                                {getStatusBadge(payment.status)}
                                {getTypeBadge(payment.type || payment.dk)}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: TEXT_MUTED }}>
                                <span>{formatDate(payment.date)}</span>
                                {payment.toWho?.name && <span>{payment.toWho.name}</span>}
                                {payment.group?.name && <span>{payment.group.name}</span>}
                              </div>
                            </div>
                            <div style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: payment.type === 'credit' || payment.dk === 'credit'
                                ? SUCCESS
                                : DANGER,
                              flexShrink: 0
                            }}>
                              {payment.type === 'credit' || payment.dk === 'credit' ? '+' : '-'}
                              {fmtCurrency(payment.amount)}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowDetailsModal(true);
                                }}
                                className="btn"
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: 'transparent',
                                  border: `1px solid ${BORDER}`,
                                  color: TEXT_MUTED,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Eye size={14} />
                              </button>
                              {payment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePayment(payment.id)}
                                    className="btn"
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 8,
                                      background: `${SUCCESS}15`,
                                      border: `1px solid ${SUCCESS}30`,
                                      color: SUCCESS,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(payment.id)}
                                    className="btn"
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 8,
                                      background: `${DANGER}15`,
                                      border: `1px solid ${DANGER}30`,
                                      color: DANGER,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="btn"
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: 'transparent',
                                  border: `1px solid ${BORDER}`,
                                  color: DANGER,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop: `1px solid ${BORDER}`
                      }}>
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="btn"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: currentPage === 1 ? 'transparent' : CARD_BG2,
                            border: `1px solid ${BORDER}`,
                            color: currentPage === 1 ? TEXT_MUTED : TEXT,
                            fontSize: 13,
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <ChevronLeft size={14} />
                          Oldingi
                        </button>
                        <span style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: TEXT
                        }}>
                          Sahifa {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="btn"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: currentPage === totalPages ? 'transparent' : CARD_BG2,
                            border: `1px solid ${BORDER}`,
                            color: currentPage === totalPages ? TEXT_MUTED : TEXT,
                            fontSize: 13,
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          Keyingi
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TYPES TAB */}
              {activeTab === 'types' && (
                <div className="animate-fade-in">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20
                  }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
                        To'lov turlari
                      </h2>
                      <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                        Jami {paymentTypes.length} ta to'lov turi
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTypeModal(true)}
                      className="btn"
                      style={{
                        padding: '10px 20px',
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        border: 'none'
                      }}
                    >
                      <Plus size={16} />
                      To'lov turi qo'shish
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16
                  }}>
                    {paymentTypes.map((type, index) => (
                      <div
                        key={type.id}
                        className="card card-hover"
                        style={{
                          padding: '20px',
                          animation: `fadeIn 0.3s ease ${index * 0.05}s both`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12
                        }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: type.dk === 'credit' ? `${SUCCESS}15` : `${DANGER}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {type.dk === 'credit' ? (
                              <ArrowUpRight size={20} color={SUCCESS} />
                            ) : (
                              <ArrowDownRight size={20} color={DANGER} />
                            )}
                          </div>
                          <button
                            onClick={() => handleDeletePaymentType(type.id)}
                            className="btn"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: 'transparent',
                              border: `1px solid ${BORDER}`,
                              color: DANGER,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
                          {type.name}
                        </h3>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: type.dk === 'credit' ? `${SUCCESS}15` : `${DANGER}15`,
                            color: type.dk === 'credit' ? SUCCESS : DANGER,
                            fontWeight: 600
                          }}>
                            {type.dk === 'credit' ? 'Kirim' : 'Chiqim'}
                          </span>
                          <span style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: `${INFO}15`,
                            color: INFO,
                            fontWeight: 600
                          }}>
                            {type.code}
                          </span>
                        </div>
                        {type.description && (
                          <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                            {type.description}
                          </p>
                        )}
                      </div>
                    ))}
                    {paymentTypes.length === 0 && (
                      <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: 60,
                        color: TEXT_MUTED
                      }}>
                        <FileText size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p>To'lov turlari topilmadi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
                      Moliyaviy hisobotlar
                    </h2>
                    <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                      Tizim moliyaviy statistikasi va hisobotlari
                    </p>
                  </div>

                  {/* Report Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 16,
                    marginBottom: 24
                  }}>
                    {[
                      {
                        title: "Oylik hisobot",
                        description: "Har oylik to'lovlar va daromad",
                        icon: Calendar,
                        color: INFO,
                        onClick: () => {
                          const month = prompt("Oyni kiriting (YYYY-MM format):", new Date().toISOString().slice(0, 7));
                          if (month) {
                            setSelectedMonth(month);
                            setActiveTab('payments');
                          }
                        }
                      },
                      {
                        title: "Kunlik hisobot",
                        description: "Bugungi kunlik to'lovlar",
                        icon: CreditCard,
                        color: SUCCESS,
                        onClick: () => {
                          const date = new Date().toISOString().split('T')[0];
                          alert(`Bugungi hisobot: ${fmtCurrency(stats.dailyRevenue)} daromad`);
                        }
                      },
                      {
                        title: "O'quvchi hisobotlari",
                        description: "Har o'quvchi to'lov tarixi",
                        icon: Users,
                        color: BRAND_LIGHT,
                        onClick: () => navigate('/students-panel')
                      },
                      {
                        title: "O'qituvchi hisobotlari",
                        description: "Har o'qituvchi maoshlari",
                        icon: Award,
                        color: WARNING,
                        onClick: () => navigate('/teachers')
                      }
                    ].map((report, index) => (
                      <div
                        key={index}
                        onClick={report.onClick}
                        className="card card-hover"
                        style={{
                          padding: '24px',
                          animation: `slideUp 0.4s ease ${index * 0.1}s both`
                        }}
                      >
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: `${report.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 16
                        }}>
                          <report.icon size={22} color={report.color} />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                          {report.title}
                        </h3>
                        <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                          {report.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Statistics */}
                  <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 16 }}>
                      Umumiy statistika
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 16
                    }}>
                      {[
                        { label: "Jami o'quvchilar", value: stats.studentCount },
                        { label: "Jami o'qituvchilar", value: stats.teacherCount },
                        { label: "Jami to'lovlar", value: stats.totalPayments },
                        { label: "Oylik daromad", value: fmtCurrency(stats.monthlyRevenue) }
                      ].map((stat, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '16px',
                            borderRadius: 12,
                            background: CARD_BG2,
                            border: `1px solid ${BORDER}`
                          }}
                        >
                          <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8 }}>
                            {stat.label}
                          </p>
                          <p style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          padding: '12px 20px',
          borderRadius: 10,
          background: toast.type === 'success' ? `${SUCCESS}15` : `${DANGER}15`,
          border: `1px solid ${toast.type === 'success' ? SUCCESS : DANGER}`,
          color: toast.type === 'success' ? SUCCESS : DANGER,
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'slideUp 0.3s ease both'
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 500,
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                  Yangi to'lov
                </h3>
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
                  To'lov ma'lumotlarini kiriting
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  color: TEXT_MUTED,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                    To'lov turi *
                  </label>
                  <select
                    required
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                    className="select"
                  >
                    <option value="credit">Kirim</option>
                    <option value="debit">Chiqim</option>
                    <option value="refund">Qaytarish</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                    Summa *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Summa"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                    Sana *
                  </label>
                  <input
                    required
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                    Dars sanasi
                  </label>
                  <input
                    type="date"
                    value={paymentForm.lessonDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, lessonDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Kim uchun *
                </label>
                <select
                  required
                  value={paymentForm.toWho}
                  onChange={(e) => setPaymentForm({ ...paymentForm, toWho: e.target.value })}
                  className="select"
                >
                  <option value="">Tanlang</option>
                  <optgroup label="O'quvchilar">
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.user?.name || student.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="O'qituvchilar">
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.user?.name || teacher.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Guruh
                </label>
                <select
                  value={paymentForm.groupId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, groupId: e.target.value })}
                  className="select"
                >
                  <option value="">Tanlanmagan</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  To'lov turi
                </label>
                <select
                  value={paymentForm.typeId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, typeId: e.target.value })}
                  className="select"
                >
                  <option value="">Tanlanmagan</option>
                  {paymentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Tavsif
                </label>
                <textarea
                  placeholder="To'lov tavsifi..."
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: `1px solid ${BORDER}`,
                    color: TEXT_MUTED,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 10,
                    background: modalLoading ? `${BRAND}50` : `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {modalLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Yaratish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Payment Type Modal */}
      {showTypeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 450,
            padding: '24px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                  Yangi to'lov turi
                </h3>
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
                  To'lov turi ma'lumotlarini kiriting
                </p>
              </div>
              <button
                onClick={() => setShowTypeModal(false)}
                className="btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  color: TEXT_MUTED,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentType} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Nomi *
                </label>
                <input
                  required
                  type="text"
                  placeholder="To'lov turi nomi"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Kod *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Kod (masalan: MONTHLY_FEE)"
                  value={typeForm.code}
                  onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Turi *
                </label>
                <select
                  required
                  value={typeForm.dk}
                  onChange={(e) => setTypeForm({ ...typeForm, dk: e.target.value })}
                  className="select"
                >
                  <option value="credit">Kirim</option>
                  <option value="debit">Chiqim</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Tavsif
                </label>
                <textarea
                  placeholder="To'lov turi tavsifi..."
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: `1px solid ${BORDER}`,
                    color: TEXT_MUTED,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 10,
                    background: modalLoading ? `${BRAND}50` : `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {modalLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Yaratish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 500,
            padding: '24px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                  To'lov tafsilotlari
                </h3>
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
                  #{selectedPayment.id?.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  color: TEXT_MUTED,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '16px',
                borderRadius: 12,
                background: selectedPayment.type === 'credit' || selectedPayment.dk === 'credit'
                  ? `${SUCCESS}15`
                  : `${DANGER}15`,
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>
                  {selectedPayment.type === 'credit' || selectedPayment.dk === 'credit' ? 'Kirim' : 'Chiqim'}
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: TEXT }}>
                  {selectedPayment.type === 'credit' || selectedPayment.dk === 'credit' ? '+' : '-'}
                  {fmtCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Tavsif', value: selectedPayment.description || selectedPayment.comment || '—' },
                  { label: 'Sana', value: formatDate(selectedPayment.date) },
                  { label: 'Holat', value: getStatusBadge(selectedPayment.status) },
                  { label: 'Kim uchun', value: selectedPayment.toWho?.name || '—' },
                  { label: 'Guruh', value: selectedPayment.group?.name || '—' },
                  { label: 'To\'lov turi', value: paymentTypes.find(t => t.id === selectedPayment.typeId)?.name || '—' }
                ].map((field, index) => (
                  <div key={index}>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>
                      {field.label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn"
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  background: `${BRAND}20`,
                  border: `1px solid ${BRAND}40`,
                  color: TEXT,
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}