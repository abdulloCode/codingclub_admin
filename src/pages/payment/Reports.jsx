import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import {
  BarChart3, Download, Calendar, DollarSign,
  TrendingUp, TrendingDown, Users, Layers,
  FileText, RefreshCw, Filter, X
} from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const { isDarkMode: D } = useTheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overview: null,
    payments: [],
    teacherEarnings: [],
    studentPayments: [],
    trends: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const C = {
    bg: D ? '#09090b' : '#f8fafc',
    card: D ? '#18181b' : '#ffffff',
    border: D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text: D ? '#fafafa' : '#0f172a',
    muted: D ? 'rgba(250,250,250,0.6)' : 'rgba(15,23,42,0.6)',
    primary: '#427A43',
    primaryLight: '#5a9e5b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);

      const [paymentsData, teacherData, studentData] = await Promise.all([
        apiService.getPayments({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }).catch(() => []),
        user?.role === 'admin' ? apiService.getTeacherEarnings({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }).catch(() => []) : [],
        user?.role === 'admin' ? apiService.getStudentPaymentMonthlyReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }).catch(() => []) : []
      ]);

      const paymentsList = Array.isArray(paymentsData) ? paymentsData : paymentsData?.payments || [];
      const teacherList = Array.isArray(teacherData) ? teacherData : teacherData?.earnings || [];
      const studentList = Array.isArray(studentData) ? studentData : studentData?.reports || [];

      // Calculate overview stats
      const totalRevenue = paymentsList
        .filter(p => p.type === 'credit' || p.dk === 'credit')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const totalExpenses = paymentsList
        .filter(p => p.type === 'debit' || p.dk === 'debit')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pendingPayments = paymentsList.filter(p => p.status === 'pending').length;
      const approvedPayments = paymentsList.filter(p => p.status === 'approved').length;
      const rejectedPayments = paymentsList.filter(p => p.status === 'rejected').length;

      // Calculate teacher commissions
      const totalTeacherEarnings = teacherList.reduce((sum, t) => sum + (t.totalEarnings || t.earnings || 0), 0);
      const totalCommission = teacherList.reduce((sum, t) => sum + (t.commission || 0), 0);

      setReportData({
        overview: {
          totalRevenue,
          totalExpenses,
          netRevenue: totalRevenue - totalExpenses,
          pendingPayments,
          approvedPayments,
          rejectedPayments,
          totalTeacherEarnings,
          totalCommission,
          totalPayments: paymentsList.length
        },
        payments: paymentsList,
        teacherEarnings: teacherList,
        studentPayments: studentList,
        trends: calculateTrends(paymentsList)
      });

    } catch (error) {
      console.error('Hisobotlarni yuklashda xatolik:', error);
      showToast('Hisobotlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  }, [dateRange, user?.role, showToast]);

  const calculateTrends = (payments) => {
    // Group payments by date
    const grouped = {};
    payments.forEach(p => {
      const date = new Date(p.date).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { credit: 0, debit: 0 };
      if (p.type === 'credit' || p.dk === 'credit') grouped[date].credit += p.amount || 0;
      else grouped[date].debit += p.amount || 0;
    });

    return Object.entries(grouped)
      .map(([date, amounts]) => ({ date, ...amounts }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  };

  const handleExport = async (type) => {
    try {
      let data, filename;

      switch (type) {
        case 'overview':
          data = reportData.overview;
          filename = `hisobot-overview-${dateRange.startDate}-${dateRange.endDate}.json`;
          break;
        case 'payments':
          data = reportData.payments;
          filename = `tolovlar-${dateRange.startDate}-${dateRange.endDate}.json`;
          break;
        case 'teacher':
          data = reportData.teacherEarnings;
          filename = `oqituvchi-daromadi-${dateRange.startDate}-${dateRange.endDate}.json`;
          break;
        case 'student':
          data = reportData.studentPayments;
          filename = `talaba-tolovlari-${dateRange.startDate}-${dateRange.endDate}.json`;
          break;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      showToast('Hisobot muvaffaqiyatli yuklab olindi', 'success');
    } catch (error) {
      console.error('Export qilishda xatolik:', error);
      showToast('Hisobotni yuklab olishda xatolik yuz berdi', 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 so\'m';
    return `${amount.toLocaleString('uz-UZ')} so'm`;
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20,
      boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 20,
            background: trend > 0 ? `${C.success}15` : `${C.danger}15`,
            color: trend > 0 ? C.success : C.danger,
            fontSize: 12,
            fontWeight: 600
          }}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</p>
      {change && (
        <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{change}</p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Hisobotlar
            </h1>
            <p style={{ fontSize: 14, color: C.muted }}>
              Moliyaviy hisobotlar va statistika
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.card,
                color: C.text,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              <Filter size={16} />
              Filtrlar
            </button>
            <button
              onClick={fetchReportData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.card,
                color: C.text,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              <RefreshCw size={16} />
              Yangilash
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        {showFilters && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>
                  Boshlang'ich sana
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 14
                  }}
                />
              </div>
              <button
                onClick={() => fetchReportData()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: C.primary,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Calendar size={16} />
                Qo'llash
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
          {[
            { id: 'overview', label: 'Umumiy', icon: BarChart3 },
            { id: 'payments', label: 'To\'lovlar', icon: DollarSign },
            { id: 'teachers', label: 'O\'qituvchilar', icon: Users },
            { id: 'students', label: 'Talabalar', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: selectedTab === tab.id ? `${C.primary}15` : 'transparent',
                  color: selectedTab === tab.id ? C.primary : C.muted,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <RefreshCw size={32} color={C.muted} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && reportData.overview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <StatCard
                  title="Jami daromad"
                  value={formatCurrency(reportData.overview.totalRevenue)}
                  trend={12}
                  icon={TrendingUp}
                  color={C.primary}
                />
                <StatCard
                  title="Jami xarajat"
                  value={formatCurrency(reportData.overview.totalExpenses)}
                  trend={-8}
                  icon={TrendingDown}
                  color={C.danger}
                />
                <StatCard
                  title="Sof daromad"
                  value={formatCurrency(reportData.overview.netRevenue)}
                  trend={15}
                  icon={DollarSign}
                  color={C.success}
                />
                <StatCard
                  title="To'lovlar soni"
                  value={reportData.overview.totalPayments}
                  trend={10}
                  icon={FileText}
                  color={C.info}
                />
              </div>

              {/* Payment Status */}
              <div style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 20 }}>
                  To'lov holati
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Kutilmoqda', value: reportData.overview.pendingPayments, color: C.warning },
                    { label: 'Tasdiqlangan', value: reportData.overview.approvedPayments, color: C.success },
                    { label: 'Rad etilgan', value: reportData.overview.rejectedPayments, color: C.danger }
                  ].map((stat, index) => (
                    <div key={index} style={{
                      padding: 16,
                      borderRadius: 12,
                      background: `${stat.color}10`,
                      border: `1px solid ${stat.color}30`,
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: 32, fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: 8 }}>
                        {stat.value}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Earnings Overview */}
              {user?.role === 'admin' && (
                <div style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>
                      O'qituvchi daromadlari
                    </h3>
                    <button
                      onClick={() => handleExport('teacher')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: `${C.primary}15`,
                        color: C.primary,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      <Download size={14} />
                      Yuklab olish
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div style={{
                      padding: 16,
                      borderRadius: 12,
                      background: D ? 'rgba(66,122,67,0.08)' : 'rgba(66,122,67,0.04)'
                    }}>
                      <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Jami daromad</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: C.primary }}>
                        {formatCurrency(reportData.overview.totalTeacherEarnings)}
                      </p>
                    </div>
                    <div style={{
                      padding: 16,
                      borderRadius: 12,
                      background: D ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.04)'
                    }}>
                      <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Komissiya</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: C.warning }}>
                        {formatCurrency(reportData.overview.totalCommission)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trends */}
              {reportData.trends.length > 0 && (
                <div style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: D ? 'none' : '0 1px 12px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 20 }}>
                    Trendlar (oxirgi 30 kun)
                  </h3>
                  <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 8, overflow: 'hidden' }}>
                    {reportData.trends.map((trend, index) => (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 150 }}>
                          <div
                            style={{
                              flex: 1,
                              background: C.primary,
                              borderRadius: 2,
                              height: `${Math.min((trend.credit / Math.max(...reportData.trends.map(t => t.credit || 0))) * 100, 100)}%`,
                              transition: 'height 0.3s ease'
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              background: C.danger,
                              borderRadius: 2,
                              height: `${Math.min((trend.debit / Math.max(...reportData.trends.map(t => t.debit || 0))) * 100, 100)}%`,
                              transition: 'height 0.3s ease'
                            }}
                          />
                        </div>
                        <p style={{ fontSize: 10, color: C.muted }}>
                          {new Date(trend.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: C.primary }} />
                      <p style={{ fontSize: 12, color: C.muted }}>Daromad</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: C.danger }} />
                      <p style={{ fontSize: 12, color: C.muted }}>Xarajat</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {selectedTab === 'payments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>
                  To'lovlar tarixi
                </h3>
                <button
                  onClick={() => handleExport('payments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: `${C.primary}15`,
                    color: C.primary,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  <Download size={14} />
                  Yuklab olish
                </button>
              </div>
              {reportData.payments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16
                }}>
                  <DollarSign size={48} color={C.muted} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <p style={{ fontSize: 14, color: C.muted }}>To'lovlar topilmadi</p>
                </div>
              ) : (
                <div style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'grid', gap: 1 }}>
                    {reportData.payments.map((payment, index) => (
                      <div
                        key={payment.id || index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          background: index % 2 === 0 ? C.card : D ? '#1c1c1e' : '#f8fafc',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = D ? '#27272a' : '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? C.card : D ? '#1c1c1e' : '#f8fafc';
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                            {payment.description || payment.comment || 'To\'lov'}
                          </p>
                          <p style={{ fontSize: 12, color: C.muted }}>
                            {formatDate(payment.date)} • {payment.type || payment.dk}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: (payment.type === 'credit' || payment.dk === 'credit') ? C.success : C.danger
                          }}>
                            {(payment.type === 'credit' || payment.dk === 'credit') ? '+' : '-'}{formatCurrency(payment.amount)}
                          </p>
                          <span style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 12,
                            background: payment.status === 'approved' ? `${C.success}15` :
                              payment.status === 'pending' ? `${C.warning}15` : `${C.danger}15`,
                            color: payment.status === 'approved' ? C.success :
                              payment.status === 'pending' ? C.warning : C.danger,
                            fontWeight: 500
                          }}>
                            {payment.status === 'approved' ? 'Tasdiqlangan' :
                              payment.status === 'pending' ? 'Kutilmoqda' : 'Rad etilgan'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teachers Tab */}
          {selectedTab === 'teachers' && user?.role === 'admin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>
                  O'qituvchi daromadlari
                </h3>
                <button
                  onClick={() => handleExport('teacher')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: `${C.primary}15`,
                    color: C.primary,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  <Download size={14} />
                  Yuklab olish
                </button>
              </div>
              {reportData.teacherEarnings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16
                }}>
                  <Users size={48} color={C.muted} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <p style={{ fontSize: 14, color: C.muted }}>O'qituvchi ma\'lumotlari topilmadi</p>
                </div>
              ) : (
                <div style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'grid', gap: 1 }}>
                    {reportData.teacherEarnings.map((teacher, index) => (
                      <div
                        key={teacher.id || teacher.teacherId || index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          background: index % 2 === 0 ? C.card : D ? '#1c1c1e' : '#f8fafc'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                            {teacher.name || teacher.teacherName || 'O\'qituvchi'}
                          </p>
                          <p style={{ fontSize: 12, color: C.muted }}>
                            {teacher.groups || teacher.groupCount || 0} ta guruh • {teacher.students || teacher.studentCount || 0} talaba
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: C.primary }}>
                            {formatCurrency(teacher.totalEarnings || teacher.earnings || 0)}
                          </p>
                          <p style={{ fontSize: 12, color: C.muted }}>
                            Komissiya: {formatCurrency(teacher.commission || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {selectedTab === 'students' && user?.role === 'admin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>
                  Talaba to'lovlari
                </h3>
                <button
                  onClick={() => handleExport('student')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: `${C.primary}15`,
                    color: C.primary,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  <Download size={14} />
                  Yuklab olish
                </button>
              </div>
              {reportData.studentPayments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16
                }}>
                  <Layers size={48} color={C.muted} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <p style={{ fontSize: 14, color: C.muted }}>Talaba ma\'lumotlari topilmadi</p>
                </div>
              ) : (
                <div style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'grid', gap: 1 }}>
                    {reportData.studentPayments.map((student, index) => (
                      <div
                        key={student.id || student.studentId || index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          background: index % 2 === 0 ? C.card : D ? '#1c1c1e' : '#f8fafc'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                            {student.name || student.studentName || 'Talaba'}
                          </p>
                          <p style={{ fontSize: 12, color: C.muted }}>
                            {student.groupName || student.group || 'Guruh belgilanmagan'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: C.primary }}>
                            {formatCurrency(student.totalPaid || student.amount || 0)}
                          </p>
                          <p style={{ fontSize: 12, color: C.muted }}>
                            {student.paymentCount || 0} ta to'lov
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}