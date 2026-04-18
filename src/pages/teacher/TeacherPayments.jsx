import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  DollarSign, TrendingUp, Calendar, Filter, Search,
  CreditCard, Users, Award, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  PieChart, BarChart3, Download, Plus,
  ChevronLeft, ChevronRight, X, Eye,
  MoreHorizontal, Star, Target, Crown
} from 'lucide-react';

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const BRAND = "#6366f1";
const BRAND_DARK = "#4f46e5";
const BRAND_LIGHT = "#818cf8";
const BACKGROUND = "#0c0c0e";
const CARD_BG = "#18181c";
const CARD_BG2 = "#1e1e24";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#f2f2f3";
const TEXT_MUTED = "rgba(242,242,243,0.45)";
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
export default function TeacherPayments() {
  const { user } = useAuth();
  const { isDarkMode: D, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("earnings");
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [teacherPayments, setTeacherPayments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    commissionRate: 0,
    totalStudents: 0,
    totalGroups: 0,
    completedLessons: 0,
    pendingPayments: 0,
    currentMonthEarnings: 0,
    totalLessonPrice: 0,
    totalStudentPayments: 0,
    averageLessonPrice: 0
  });

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    groupId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── DATA FETCHING ────────────────────────────────────────────
  const fetchTeacherData = useCallback(async () => {
    try {
      const data = await apiService.getMyTeacherData();
      setTeacherData(data);
      return data;
    } catch (error) {
      console.error("O'qituvchi ma'lumotlarini olishda xatolik:", error);
      return null;
    }
  }, []);

  const fetchEarnings = useCallback(async (teacherId) => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth) params.month = selectedMonth;

      const data = await apiService.getTeacherEarnings(teacherId, params);
      const earningsList = Array.isArray(data) ? data : (data?.earnings || data?.data || []);
      setEarnings(earningsList);
    } catch (error) {
      console.error("Daromadni olishda xatolik:", error);
      showToast("Daromadni olishda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const fetchTeacherPayments = useCallback(async (teacherId) => {
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedGroup) params.groupId = selectedGroup;

      const data = await apiService.getPayments(params);
      const paymentsList = Array.isArray(data) ? data : (data?.payments || data?.data || []);
      // Filter payments for this teacher
      const teacherPayments = paymentsList.filter(p => p.teacherId === teacherId || p.toWho === teacherId);
      setTeacherPayments(teacherPayments);
    } catch (error) {
      console.error("To'lovlarni olishda xatolik:", error);
      setTeacherPayments([]);
    }
  }, [selectedMonth, selectedGroup]);

  const fetchGroups = useCallback(async (teacherId) => {
    try {
      const data = await apiService.getTeacherGroups(teacherId);
      const groupsList = Array.isArray(data) ? data : (data?.groups || data?.data || []);
      setGroups(groupsList);
    } catch (error) {
      console.error("Guruhlarni olishda xatolik:", error);
      setGroups([]);
    }
  }, []);

  const fetchCommission = useCallback(async (teacherId) => {
    try {
      const data = await apiService.getTeacherCommission(teacherId);
      return data?.commissionPercentage || 0;
    } catch (error) {
      console.error("Komissiyani olishda xatolik:", error);
      return 0;
    }
  }, []);

  const fetchStats = useCallback(async (teacherId) => {
    try {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // Get monthly summary
      const monthlySummary = await apiService.getTeacherMonthlySummary(teacherId, currentMonth);
      // Get daily summary
      const dailySummary = await apiService.getTeacherDailySalary(teacherId, today.toISOString().split('T')[0]);
      // Get commission
      const commission = await fetchCommission(teacherId);

      // Get all students in teacher's groups
      const allStudents = [];
      for (const group of groups) {
        if (group.students) {
          allStudents.push(...group.students);
        }
      }

      setStats({
        totalEarnings: monthlySummary?.totalEarnings || 0,
        monthlyEarnings: monthlySummary?.monthlyEarnings || 0,
        commissionRate: commission || 0,
        totalStudents: new Set(allStudents.map(s => s.id)).size,
        totalGroups: groups.length,
        completedLessons: monthlySummary?.completedLessons || 0,
        pendingPayments: teacherPayments.filter(p => p.status === 'pending').length,
        currentMonthEarnings: dailySummary?.dailyEarnings || 0,
        totalLessonPrice: groups.reduce((sum, group) => {
          const lessonPrice = (group.monthlyPrice || 0) / 8; // Taxminan 8 dars oyiga
          const groupStudents = group.students?.length || 0;
          return sum + (lessonPrice * groupStudents);
        }, 0),
        totalStudentPayments: allStudents.reduce((sum, student) => {
          const studentPayments = teacherPayments.filter(p => p.toWhoId === student.id && p.status === 'approved');
          return sum + studentPayments.reduce((ps, p) => ps + (p.amount || 0), 0);
        }, 0),
        averageLessonPrice: groups.length > 0 ? groups.reduce((sum, group) => {
          return sum + ((group.monthlyPrice || 0) / 8);
        }, 0) / groups.length : 0
      });
    } catch (error) {
      console.error("Statistikalarni olishda xatolik:", error);
    }
  }, [groups, teacherPayments, fetchCommission]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchTeacherData();
      if (data?.teacher?.id) {
        const teacherId = data.teacher.id;
        await Promise.all([
          fetchEarnings(teacherId),
          fetchTeacherPayments(teacherId),
          fetchGroups(teacherId)
        ]);
      }
    };
    loadData();
  }, [fetchTeacherData, fetchEarnings, fetchTeacherPayments, fetchGroups]);

  useEffect(() => {
    if (teacherData?.teacher?.id) {
      fetchStats(teacherData.teacher.id);
    }
  }, [teacherData, fetchStats]);

  // ─── FILTERING ────────────────────────────────────────────────
  const filteredEarnings = useMemo(() => {
    let filtered = earnings;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.description?.toLowerCase().includes(term) ||
        e.type?.toLowerCase().includes(term)
      );
    }

    if (selectedGroup) {
      filtered = filtered.filter(e => e.groupId === selectedGroup);
    }

    return filtered;
  }, [earnings, searchTerm, selectedGroup]);

  const filteredPayments = useMemo(() => {
    let filtered = teacherPayments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.description?.toLowerCase().includes(term) ||
        p.comment?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [teacherPayments, searchTerm]);

  // ─── PAYMENT OPERATIONS ───────────────────────────────────────
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createGroupPayment(paymentForm);
      showToast("To'lov muvaffaqiyatli yaratildi!");
      setShowPaymentModal(false);
      setPaymentForm({
        groupId: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: ""
      });
      if (teacherData?.teacher?.id) {
        await fetchTeacherPayments(teacherData.teacher.id);
      }
    } catch (error) {
      console.error("To'lov yaratishda xatolik:", error);
      showToast(error.message || "To'lov yaratishda xatolik yuz berdi", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // ─── TABS ───────────────────────────────────────────────────
  const tabs = [
    { id: "earnings", label: "Daromad", icon: DollarSign },
    { id: "payments", label: "To'lovlar", icon: CreditCard },
    { id: "students", label: "O'quvchilar", icon: Users },
    { id: "commission", label: "Komissiya", icon: Target }
  ];

  // ─── RENDER HELPERS ───────────────────────────────────────────
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: WARNING, bg: "rgba(245, 158, 11, 0.15)", label: "Kutilmoqda", icon: Clock },
      approved: { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)", label: "Tasdiqlangan", icon: CheckCircle },
      rejected: { color: DANGER, bg: "rgba(239, 68, 68, 0.15)", label: "Rad etilgan", icon: X }
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

        .teacher-payments {
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
          background: ${BRAND}30;
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

      <div className="teacher-payments">
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
            gap: 16,
            flexWrap: 'wrap'
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
                <DollarSign size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>Daromad Boshqaruvi</h1>
                <p style={{ fontSize: 11, color: TEXT_MUTED }}>O'qituvchi Panel</p>
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
                onClick={() => {
                  if (teacherData?.teacher?.id) {
                    Promise.all([
                      fetchEarnings(teacherData.teacher.id),
                      fetchTeacherPayments(teacherData.teacher.id)
                    ]);
                  }
                }}
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
              {/* EARNINGS TAB */}
              {activeTab === 'earnings' && (
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
                        value: fmtCurrency(stats.totalEarnings),
                        icon: DollarSign,
                        color: SUCCESS,
                        trend: "+12%"
                      },
                      {
                        label: "Oylik daromad",
                        value: fmtCurrency(stats.monthlyEarnings),
                        icon: Calendar,
                        color: INFO,
                        trend: "+8%"
                      },
                      {
                        label: "O'rtacha dars narxi",
                        value: fmtCurrency(stats.averageLessonPrice),
                        icon: Target,
                        color: WARNING,
                        trend: "+5%"
                      },
                      {
                        label: "Barcha darslar narxi",
                        value: fmtCurrency(stats.totalLessonPrice),
                        icon: PieChart,
                        color: INFO,
                        trend: "+8%"
                      },
                      {
                        label: "Komissiya foizi",
                        value: `${stats.commissionRate}%`,
                        icon: Target,
                        color: BRAND_LIGHT,
                        trend: "—"
                      },
                      {
                        label: "Tamomlangan darslar",
                        value: stats.completedLessons,
                        icon: Award,
                        color: WARNING,
                        trend: "+15%"
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

                  {/* Monthly Progress */}
                  <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 20
                    }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                          Oylik progress
                        </h3>
                        <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                          {formatMonth(new Date())} daromadi
                        </p>
                      </div>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${BRAND}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PieChart size={22} color={BRAND} />
                      </div>
                    </div>

                    <div style={{
                      height: 8,
                      background: CARD_BG2,
                      borderRadius: 10,
                      overflow: 'hidden',
                      marginBottom: 12
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (stats.currentMonthEarnings / stats.monthlyEarnings) * 100) || 0}%`,
                        background: `linear-gradient(90deg, ${BRAND_DARK}, ${BRAND})`,
                        borderRadius: 10,
                        transition: 'width 1s ease'
                      }} />
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: TEXT_MUTED
                    }}>
                      <span>Hozircha: {fmtCurrency(stats.currentMonthEarnings)}</span>
                      <span>Oylik maqsad: {fmtCurrency(stats.monthlyEarnings)}</span>
                    </div>
                  </div>

                  {/* Recent Earnings */}
                  <div className="card" style={{ padding: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16
                    }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>
                        So'nggi daromadlar
                      </h3>
                      <button
                        onClick={() => setShowEarningsModal(true)}
                        className="btn"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: `1px solid ${BORDER}`,
                          color: TEXT_MUTED,
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        Hammasini ko'rish
                        <ChevronRight size={12} />
                      </button>
                    </div>

                    {filteredEarnings.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: TEXT_MUTED
                      }}>
                        <DollarSign size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p>Daromadlar topilmadi</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filteredEarnings.slice(0, 5).map((earning, index) => (
                          <div
                            key={earning.id}
                            className="card-hover"
                            style={{
                              padding: '12px 14px',
                              borderRadius: 10,
                              background: CARD_BG2,
                              border: `1px solid ${BORDER}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              animation: `fadeIn 0.3s ease ${index * 0.05}s both`
                            }}
                          >
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              background: `${SUCCESS}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <ArrowUpRight size={18} color={SUCCESS} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: TEXT,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginBottom: 2
                              }}>
                                {earning.description || earning.type || "Daromad"}
                              </h4>
                              <p style={{ fontSize: 11, color: TEXT_MUTED }}>
                                {formatDate(earning.date)}
                              </p>
                            </div>
                            <span style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: SUCCESS,
                              flexShrink: 0
                            }}>
                              +{fmtCurrency(earning.amount || earning.earnings)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                          Oy
                        </label>
                        <input
                          type="month"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="input"
                          style={{ width: 180 }}
                        />
                      </div>
                      <button
                        onClick={() => setShowPaymentModal(true)}
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
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px' }}>
                    {filteredPayments.length === 0 ? (
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
                        {filteredPayments.map((payment, index) => (
                          <div
                            key={payment.id}
                            className="card-hover"
                            style={{
                              padding: '14px',
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
                                {payment.group?.name && <span>{payment.group.name}</span>}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: payment.type === 'credit' || payment.dk === 'credit'
                                ? SUCCESS
                                : DANGER,
                              flexShrink: 0
                            }}>
                              {payment.type === 'credit' || payment.dk === 'credit' ? '+' : '-'}
                              {fmtCurrency(payment.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STUDENTS TAB */}
              {activeTab === 'students' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
                      O'quvchilar
                    </h2>
                    <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                      Jami {stats.totalStudents} ta o'quvchi, {stats.totalGroups} ta guruh
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16
                  }}>
                    {groups.map((group, groupIndex) => (
                      <div
                        key={group.id}
                        className="card card-hover"
                        style={{
                          padding: '20px',
                          animation: `slideUp 0.4s ease ${groupIndex * 0.1}s both`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              background: `${BRAND}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              fontWeight: 700,
                              color: BRAND
                            }}>
                              {group.name?.substring(0, 2)?.toUpperCase() || 'GR'}
                            </div>
                            <div>
                              <h3 style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: TEXT,
                                marginBottom: 2
                              }}>
                                {group.name}
                              </h3>
                              <p style={{ fontSize: 11, color: TEXT_MUTED }}>
                                {group.currentStudents || 0} / {group.maxStudents || 20} o'quvchi
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          marginBottom: 12
                        }}>
                          {group.students?.slice(0, 3).map((student, studentIndex) => (
                            <div
                              key={student.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 10px',
                                borderRadius: 8,
                                background: CARD_BG2,
                                border: `1px solid ${BORDER}`
                              }}
                            >
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: `${SUCCESS}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 600,
                                color: SUCCESS
                              }}>
                                {(student.user?.name || student.name || 'S')[0].toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: TEXT,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {student.user?.name || student.name || "O'quvchi"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {(group.students?.length || 0) > 3 && (
                          <button
                            className="btn"
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: 8,
                              background: 'transparent',
                              border: `1px solid ${BORDER}`,
                              color: TEXT_MUTED,
                              fontSize: 12,
                              fontWeight: 500
                            }}
                          >
                            +{(group.students?.length || 0) - 3} ta ko'proq
                          </button>
                        )}
                      </div>
                    ))}

                    {groups.length === 0 && (
                      <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: 60,
                        color: TEXT_MUTED
                      }}>
                        <Users size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p>Guruhlar topilmadi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COMMISSION TAB */}
              {activeTab === 'commission' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
                      Komissiya sozlamalari
                    </h2>
                    <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                      Daromad hisoblash foizi
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 16
                  }}>
                    <div className="card" style={{ padding: '24px' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${BRAND}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16
                      }}>
                        <Target size={22} color={BRAND} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                        Hozirgi komissiya
                      </h3>
                      <div style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: TEXT,
                        marginBottom: 4
                      }}>
                        {stats.commissionRate}%
                      </div>
                      <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                        Har dars uchun komissiya foizi
                      </p>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${SUCCESS}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16
                      }}>
                        <Award size={22} color={SUCCESS} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                          Daromad hisobi
                        </h3>
                      <p style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.6 }}>
                          Har bir dars uchun daromad o'quvchi to'lagan summadan
                          {stats.commissionRate}% komissiya olib hisoblanadi.
                        </p>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${INFO}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16
                      }}>
                        <BarChart3 size={22} color={INFO} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                          Daromad statistikasi
                        </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: TEXT_MUTED }}>Jami daromad:</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                              {fmtCurrency(stats.totalEarnings)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: TEXT_MUTED }}>Oylik daromad:</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                              {fmtCurrency(stats.monthlyEarnings)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: TEXT_MUTED }}>Tamomlangan darslar:</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                              {stats.completedLessons}
                            </span>
                          </div>
                        </div>
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
          {toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Create Payment Modal */}
      {showPaymentModal && (
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
                  Guruh to'lovi
                </h3>
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
                  Guruh uchun to'lov ma'lumotlari
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
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
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                  Guruh *
                </label>
                <select
                  required
                  value={paymentForm.groupId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, groupId: e.target.value })}
                  className="select"
                >
                  <option value="">Tanlang</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
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
                  onClick={() => setShowPaymentModal(false)}
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
    </>
  );
}