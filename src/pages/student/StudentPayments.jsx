import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Calendar, CreditCard, Filter, Search, Download,
  Plus, RefreshCw, CheckCircle, XCircle, Clock,
  Eye, AlertCircle, Wallet, PieChart, BarChart3
} from 'lucide-react';

/* ─── CONSTANTS ────────────────────────────────────────── */
const BRAND = "#10b981";
const BRAND_DARK = "#059669";
const BRAND_LIGHT = "#34d399";
const BACKGROUND = "#f8fafc";
const CARD_BG = "#ffffff";
const CARD_BG2 = "#f1f5f9";
const BORDER = "rgba(0,0,0,0.08)";
const TEXT = "#111827";
const TEXT_MUTED = "rgba(17,24,39,0.45)";
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

/* ─── MAIN COMPONENT ────────────────────────────────────── */
export default function StudentPayments() {
  const { user } = useAuth();
  const { isDarkMode: D, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [groupData, setGroupData] = useState(null);

  const [stats, setStats] = useState({
    totalPaid: 0,
    totalOwed: 0,
    balance: 0,
    monthlyPaid: 0,
    pendingPayments: 0,
    completedPayments: 0,
    attendanceRate: 0,
    lessonPrice: 0,
    teacherEarnings: 0,
    adminEarnings: 0,
    lessonsPaidFor: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── DATA FETCHING ───────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyPayments();
      const paymentsList = Array.isArray(data) ? data : (data?.payments || data?.data || []);
      setPayments(paymentsList);
    } catch (error) {
      console.error("To'lovlarni olishda xatolik:", error);
      showToast("To'lovlarni olishda xatolik yuz berdi", "error");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentData = useCallback(async () => {
    try {
      const data = await apiService.getMyStudentData();
      setStudentData(data);
      return data;
    } catch (error) {
      console.error("O'quvchi ma'lumotlarini olishda xatolik:", error);
      setStudentData(null);
      return null;
    }
  }, []);

  const fetchGroupData = useCallback(async () => {
    try {
      const data = await apiService.getMyGroup();
      if (data?.id) {
        const fullGroupData = await apiService.getGroup(data.id);
        setGroupData(fullGroupData);
      } else {
        setGroupData(null);
      }
    } catch (error) {
      console.error("Guruh ma'lumotlarini olishda xatolik:", error);
      setGroupData(null);
    }
  }, []);

  const calculateLessonPrice = useCallback((group, payments) => {
    if (!group) return { lessonPrice: 0, teacherEarnings: 0, adminEarnings: 0, lessonsPaidFor: 0 };

    const monthlyPrice = group.monthlyPrice || 0;
    const lessonsPerMonth = group.lessonsPerMonth || 8;
    const commissionPercent = group.teacher?.commissionPercentage || group.teacher?.user?.commissionPercentage || 20;

    const lessonPrice = Math.round(monthlyPrice / lessonsPerMonth);
    const teacherEarningPerLesson = Math.round(lessonPrice * (commissionPercent / 100));
    const adminEarningPerLesson = lessonPrice - teacherEarningPerLesson;

    // Calculate how many lessons the student has paid for
    const totalPaid = payments.filter(p => p.type === 'credit' || p.dk === 'credit')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const lessonsPaidFor = Math.floor(totalPaid / lessonPrice);

    return {
      lessonPrice,
      teacherEarningPerLesson,
      adminEarningPerLesson,
      commissionPercent,
      lessonsPaidFor,
      totalPaid,
    };
  }, []);

  const fetchStats = useCallback(async (studentId) => {
    try {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // Get monthly report
      const monthlyReport = await apiService.getStudentPaymentMonthlyReport(studentId, currentMonth);
      // Get attendance count
      const attendanceCount = await apiService.getMyAttendanceCount();

      const totalPaid = payments.filter(p => p.type === 'credit' || p.dk === 'credit')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalOwed = payments.filter(p => p.type === 'debit' || p.dk === 'debit')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Calculate lesson price and earnings
      const lessonCalc = calculateLessonPrice(groupData, payments);

      setStats({
        totalPaid,
        totalOwed,
        balance: totalPaid - totalOwed,
        monthlyPaid: monthlyReport?.monthlyPaid || 0,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        completedPayments: payments.filter(p => p.status === 'approved' || p.status === 'completed').length,
        attendanceRate: attendanceCount || 0,
        lessonPrice: lessonCalc.lessonPrice,
        teacherEarnings: lessonCalc.teacherEarningPerLesson * lessonCalc.lessonsPaidFor,
        adminEarnings: lessonCalc.adminEarningPerLesson * lessonCalc.lessonsPaidFor,
        lessonsPaidFor: lessonCalc.lessonsPaidFor,
      });
    } catch (error) {
      console.error("Statistikalarni olishda xatolik:", error);
    }
  }, [payments, groupData, calculateLessonPrice]);

  // ─── INITIAL LOAD ────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPayments(),
        fetchStudentData(),
        fetchGroupData()
      ]);
      if (studentData?.student?.id) {
        fetchStats(studentData.student.id);
      }
    };
    loadData();
  }, [fetchPayments, fetchStudentData, fetchGroupData, fetchStats]);

  // ─── FILTERING ───────────────────────────────────────
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.description?.toLowerCase().includes(term) ||
        p.comment?.toLowerCase().includes(term)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(p => p.type === selectedType || p.dk === selectedType);
    }

    if (selectedMonth) {
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.date);
        const [year, month] = selectedMonth.split('-').map(Number);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() + 1 === month;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, searchTerm, selectedType, selectedMonth]);

  // ─── TABS ───────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Umumiy", icon: PieChart },
    { id: "payments", label: "To'lovlar", icon: CreditCard },
    { id: "history", label: "Tarix", icon: Calendar }
  ];

  // ─── RENDER HELPERS ───────────────────────────────────
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: WARNING, bg: "rgba(245, 158, 11, 0.15)", label: "Kutilmoqda", icon: Clock },
      approved: { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)", label: "Tasdiqlangan", icon: CheckCircle },
      completed: { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)", label: "Tamomlangan", icon: CheckCircle },
      rejected: { color: DANGER, bg: "rgba(239, 68, 68, 0.15)", label: "Rad etilgan", icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, background: config.bg, color: config.color, fontSize: 10, fontWeight: 600 }}>
        <Icon size={12} />
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
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, background: config.bg, color: config.color, fontSize: 10, fontWeight: 600 }}>
        <Icon size={12} />
        {config.label}
      </div>
    );
  };

  return (
    <>
      {/* Global Styles */}
      <style>{`
        * {
          font-family: 'Inter', system-ui, sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: ${BACKGROUND};
          color: ${TEXT};
        }

        .student-payments {
          min-height: 100vh;
          background: ${BACKGROUND};
          padding: 20px;
        }

        .header {
          background: ${CARD_BG};
          border: 1px solid ${BORDER};
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .header-title {
          font-size: 18px;
          font-weight: 700;
          color: ${TEXT};
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-box {
          display: flex;
          gap: 8px;
          flex: 1;
          min-width: 200px;
        }

        .search-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid ${BORDER};
          border-radius: 10px;
          background: ${CARD_BG2};
          color: ${TEXT};
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: ${BRAND};
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: ${BRAND};
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn:hover {
          background: ${BRAND_DARK};
          transform: translateY(-1px);
        }

        .btn:active {
          transform: translateY(0);
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: ${BRAND}15;
          border: 1px solid ${BRAND};
          color: ${BRAND};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: ${BRAND};
          transform: scale(1.05);
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: ${CARD_BG};
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 8px;
          overflow-x: auto;
        }

        .tab-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: ${TEXT_MUTED};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .tab-btn.active {
          color: ${BRAND};
          background: ${BRAND}15;
          font-weight: 600;
        }

        .filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid ${BORDER};
          border-radius: 8px;
          background: ${CARD_BG2};
          color: ${TEXT};
          font-size: 13px;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: ${CARD_BG};
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: ${BRAND};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: ${BRAND}15;
          border: 1px solid ${BRAND};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: ${TEXT};
        }

        .stat-label {
          font-size: 11px;
          color: TEXT_MUTED;
          margin-bottom: 2px;
        }

        .debt-card {
          background: linear-gradient(135deg, ${DANGER}15, ${DANGER}20);
          border: 2px solid ${DANGER}30;
        }

        .payments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .payment-card {
          background: ${CARD_BG};
          border: 1px solid ${BORDER};
          border-radius: 10px;
          padding: 14px;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .payment-card:hover {
          border-color: ${BRAND};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }

        .payment-info {
          flex: 1;
        min-width: 0;
        }

        .payment-amount {
          text-align: right;
        font-size: 16px;
          font-weight: 700;
        }

        .payment-amount.positive {
          color: ${SUCCESS};
        }

        .payment-amount.negative {
          color: ${DANGER};
        }

        .payment-meta {
          font-size: 11px;
          color: TEXT_MUTED;
        display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          background: ${CARD_BG};
          border: 1px solid ${BORDER};
          border-radius: 12px;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 10px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideUp 0.3s ease;
        }

        .toast.success {
          border-left: 4px solid ${SUCCESS};
        }

        .toast.error {
          border-left: 4px solid ${DANGER};
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${BORDER};
          border-top-color: ${BRAND};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }

          .payments-grid {
            grid-template-columns: 1fr;
          }

          .search-box {
            flex-direction: column;
          }

          .header-content {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      <div className="student-payments">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="header-title">To'lovlar</h1>

            <div className="header-actions">
              <div className="search-box">
                <Search size={16} color={TEXT_MUTED} style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <button onClick={fetchPayments} className="icon-btn" title="Yangilash">
                <RefreshCw size={16} />
              </button>

              <button className="btn" title="Tarixni yuklab olish">
                <Download size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="filters">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select"
          >
            <option value="">Barcha oylar</option>
            <option value="2024-01">2024-01</option>
            <option value="2024-02">2024-02</option>
            <option value="2024-03">2024-03</option>
            <option value="2024-04">2024-04</option>
            <option value="2024-05">2024-05</option>
            <option value="2024-06">2024-06</option>
            <option value="2024-07">2024-07</option>
            <option value="2024-08">2024-08</option>
            <option value="2024-09">2024-09</option>
            <option value="2024-10">2024-10</option>
            <option value="2024-11">2024-11</option>
            <option value="2024-12">2024-12</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="">Barcha turlar</option>
            <option value="credit">Kirim</option>
            <option value="debit">Chiqim</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div className="loading-spinner"></div>
            <p style={{ color: TEXT_MUTED, marginTop: 12 }}>Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                {/* Debt Card - Eng yuqorida */}
                {stats.totalOwed > 0 && (
                  <div className="stat-card debt-card">
                    <div className="stat-icon">
                      <AlertCircle size={18} color={DANGER} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Qarzdorlik</p>
                      <p className="stat-value">{fmtCurrency(stats.totalOwed)}</p>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="cards-grid">
                  {[
                    {
                      label: "To'langan",
                      value: fmtCurrency(stats.totalPaid),
                      icon: ArrowUpRight,
                      color: SUCCESS,
                      trend: "+12%"
                    },
                    {
                      label: "Qarzdorlik",
                      value: fmtCurrency(Math.abs(stats.totalOwed)),
                      icon: ArrowDownRight,
                      color: DANGER,
                      trend: "-5%"
                    },
                    {
                      label: "Balans",
                      value: fmtCurrency(stats.balance),
                      icon: Wallet,
                      color: INFO,
                      trend: stats.balance >= 0 ? "Ijobiy" : "Manfiy"
                    },
                    {
                      label: "Oylik to'lov",
                      value: fmtCurrency(stats.monthlyPaid),
                      icon: Calendar,
                      color: BRAND,
                      trend: "+8%"
                    },
                    {
                      label: "Dars narxi",
                      value: fmtCurrency(stats.lessonPrice),
                      icon: DollarSign,
                      color: INFO,
                      trend: "Bir dars"
                    },
                    {
                      label: "To'langan darslar",
                      value: `${stats.lessonsPaidFor} ta`,
                      icon: CheckCircle,
                      color: SUCCESS,
                      trend: "Jami"
                    }
                  ].map((stat, index) => (
                    <div key={index} className="stat-card">
                      <div className="stat-icon">
                        <stat.icon size={16} color={stat.color} />
                      </div>
                      <div className="stat-content">
                        <p className="stat-label">{stat.label}</p>
                        <p className="stat-value">{stat.value}</p>
                      </div>
                      {stat.trend && (
                        <span style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: `${stat.color}15`,
                          color: stat.color,
                          fontWeight: 600
                        }}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment Progress */}
                {groupData?.monthlyPrice && (
                  <div className="stat-card">
                    <div className="stat-icon">
                      <PieChart size={16} color={BRAND} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Oylik kurs narxi</p>
                      <p className="stat-value">{fmtCurrency(groupData.monthlyPrice)}</p>
                      <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
                        Guruh: {groupData.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Balance Breakdown */}
                {stats.lessonPrice > 0 && (
                  <div style={{
                    background: CARD_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24
                  }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>
                      Balans hisoboti
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      <div style={{
                        padding: 12,
                        background: CARD_BG2,
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`
                      }}>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>Bir dars narxi</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                          {fmtCurrency(stats.lessonPrice)}
                        </p>
                      </div>
                      <div style={{
                        padding: 12,
                        background: CARD_BG2,
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`
                      }}>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>To'langan darslar</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: SUCCESS }}>
                          {stats.lessonsPaidFor} ta
                        </p>
                      </div>
                      <div style={{
                        padding: 12,
                        background: CARD_BG2,
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`
                      }}>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>Qolgan balans</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: INFO }}>
                          {fmtCurrency(stats.balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div>
                <div className="payments-grid">
                  {filteredPayments.length === 0 ? (
                    <div className="empty-state">
                      <CreditCard size={48} color={TEXT_MUTED} style={{ marginBottom: 16 }} />
                      <p style={{ fontSize: 14, color: TEXT_MUTED }}>To'lovlar topilmadi</p>
                      <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 8 }}>
                        Hozircha hech qanday to'lovingiz yo'q
                      </p>
                    </div>
                  ) : (
                    filteredPayments.map(payment => (
                      <div key={payment.id} className="payment-card">
                        <div className="payment-header">
                          <div className="payment-info">
                            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 4 }}>
                              {formatDate(payment.date)}
                            </p>
                            {getStatusBadge(payment.status)}
                            {getTypeBadge(payment.type || payment.dk)}
                          </div>
                          <p className="payment-amount">
                            {payment.type === 'credit' || payment.dk === 'credit' ? '+' : '-'}
                            {fmtCurrency(payment.amount)}
                          </p>
                        </div>
                        <div style={{ fontSize: 13, color: TEXT, marginTop: 8 }}>
                          {payment.description || payment.comment || 'To\'lov'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div>
                <div className="cards-grid">
                  {[
                    {
                      label: "Jami kirim",
                      value: fmtCurrency(stats.totalPaid),
                      icon: ArrowUpRight,
                      color: SUCCESS,
                      items: payments.filter(p => p.type === 'credit' || p.dk === 'credit')
                    },
                    {
                      label: "Jami chiqim",
                      value: fmtCurrency(stats.totalOwed),
                      icon: ArrowDownRight,
                      color: DANGER,
                      items: payments.filter(p => p.type === 'debit' || p.dk === 'debit')
                    },
                    {
                      label: "Oylik to'lov",
                      value: fmtCurrency(stats.monthlyPaid),
                      icon: Calendar,
                      color: BRAND,
                      items: payments.filter(p => {
                        const paymentDate = new Date(p.date);
                        const today = new Date();
                        return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear();
                      })
                    },
                      {
                      label: "Kutilmoqda",
                      value: stats.pendingPayments,
                      icon: Clock,
                      color: WARNING,
                      items: payments.filter(p => p.status === 'pending')
                    },
                    {
                      label: "Tamomlangan",
                      value: stats.completedPayments,
                      icon: CheckCircle,
                      color: SUCCESS,
                      items: payments.filter(p => p.status === 'approved' || p.status === 'completed')
                    }
                  ].map((category, index) => (
                    <div key={index} className="stat-card">
                      <div className="stat-icon">
                        <category.icon size={16} color={category.color} />
                      </div>
                      <div className="stat-content">
                        <p className="stat-label">{category.label}</p>
                        <p className="stat-value">{category.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}