import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, Calendar, Users, Plus, Search, Filter,
  Download, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, Clock, CreditCard, Wallet, Percent,
  Save, X, RefreshCw, AlertCircle, Info
} from 'lucide-react';

export default function TeacherPaymentManager({ groups, students, C }) {
  const [payments, setPayments] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("thisMonth");
  const [selectedGroup, setSelectedGroup] = useState("all");

  // To'lov yaratish formasi
  const [paymentForm, setPaymentForm] = useState({
    type: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    groupId: '',
    studentId: '',
    description: ''
  });

  // O'qituvchi foiz sozlamalari
  const [teacherSettings, setTeacherSettings] = useState({
    commissionPercentage: 30, // O'qituvchi foizi
    baseRate: 50000, // Asosiy narx
    showPaymentBreakdown: true
  });

  // ── LOADERS ───────────────────────────────────────────────────
  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch (error) {
      console.error('To\'lovlarni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentTypes = async () => {
    try {
      const response = await fetch('/api/payment-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setPaymentTypes(Array.isArray(data) ? data : data.paymentTypes || []);
    } catch (error) {
      console.error('To\'lov turlarini yuklashda xatolik:', error);
    }
  };

  useEffect(() => {
    loadPayments();
    loadPaymentTypes();

    // O'qituvchi sozlamalarini yuklash (localStorage'dan yoki API'dan)
    const savedSettings = localStorage.getItem('teacherPaymentSettings');
    if (savedSettings) {
      setTeacherSettings(JSON.parse(savedSettings));
    }
  }, []);

  // ── CALCULATIONS ───────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.description?.toLowerCase().includes(search.toLowerCase()) ||
                         payment.studentName?.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || payment.type === filterType;
      const matchesGroup = selectedGroup === "all" || payment.groupId === selectedGroup;

      let matchesDate = true;
      if (filterDateRange === "today") {
        const today = new Date().toISOString().split('T')[0];
        matchesDate = payment.date === today;
      } else if (filterDateRange === "thisWeek") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(payment.date) >= weekAgo;
      } else if (filterDateRange === "thisMonth") {
        const thisMonth = new Date().toISOString().slice(0, 7);
        matchesDate = payment.date?.startsWith(thisMonth);
      }

      return matchesSearch && matchesType && matchesGroup && matchesDate;
    });
  }, [payments, search, filterType, filterDateRange, selectedGroup]);

  const totalEarnings = useMemo(() => {
    return payments
      .filter(p => p.type === 'credit')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const teacherCommission = useMemo(() => {
    return Math.round(totalEarnings * (teacherSettings.commissionPercentage / 100));
  }, [totalEarnings, teacherSettings.commissionPercentage]);

  const totalStudents = useMemo(() => {
    return students?.length || 0;
  }, [students]);

  // ── HANDLERS ───────────────────────────────────────────────────
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          type: 'credit',
          amount: paymentForm.amount,
          date: paymentForm.date,
          toWho: paymentForm.studentId,
          groupId: paymentForm.groupId,
          description: paymentForm.description,
          lessonDate: paymentForm.date
        })
      });

      if (!response.ok) throw new Error('To\'lov yaratishda xatolik');

      await loadPayments();
      setShowCreateModal(false);
      setPaymentForm({
        type: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        groupId: '',
        studentId: '',
        description: ''
      });
    } catch (error) {
      console.error('To\'lov yaratishda xatolik:', error);
      alert('To\'lov yaratishda xatolik: ' + error.message);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('teacherPaymentSettings', JSON.stringify(teacherSettings));
    setShowSettingsModal(false);
    alert('Sozlamalar saqlandi!');
  };

  const getGroupStudents = (groupId) => {
    const group = groups?.find(g => g.id === groupId);
    return group?.students || [];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Noma\'lum';
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* STATISTICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: C.card,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} color="#22c55e" />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: C.muted, marginBottom: '4px' }}>Jami daromad</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: C.text }}>
              {formatCurrency(totalEarnings)}
            </p>
          </div>
        </div>

        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: C.card,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wallet size={24} color="#6366f1" />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: C.muted, marginBottom: '4px' }}>Sizning ulushingiz ({teacherSettings.commissionPercentage}%)</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: C.text }}>
              {formatCurrency(teacherCommission)}
            </p>
          </div>
        </div>

        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: C.card,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: C.muted, marginBottom: '4px' }}>O'quvchilar soni</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: C.text }}>
              {totalStudents}
            </p>
          </div>
        </div>

        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: C.card,
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(249, 115, 22, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} color="#f97316" />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: C.muted, marginBottom: '4px' }}>Bu oy to'lovlar</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: C.text }}>
              {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            padding: '8px 12px',
            flex: 1,
            minWidth: '200px'
          }}>
            <Search size={16} color={C.muted} />
            <input
              type="text"
              placeholder="To'lovlarni qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: C.text,
                fontSize: '14px'
              }}
            />
          </div>

          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: C.card,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="today">Bugun</option>
            <option value="thisWeek">Shu hafta</option>
            <option value="thisMonth">Shu oy</option>
            <option value="all">Barcha vaqt</option>
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: C.card,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">Barcha guruhlar</option>
            {groups?.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: C.card,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={16} /> Sozlamalar
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
            }}
          >
            <Plus size={16} /> To'lov qo'shish
          </button>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div style={{
        background: C.card,
        borderRadius: '12px',
        border: `1px solid ${C.border}`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: C.text, margin: 0 }}>
            To'lovlar tarixi ({filteredPayments.length})
          </h3>
          <button
            onClick={loadPayments}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: C.card2,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} /> Yangilash
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <RefreshCw size={32} className="tp-spin" style={{ color: C.muted }} />
            <p style={{ marginTop: '12px', color: C.muted }}>Yuklanmoqda...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <CreditCard size={48} color={C.muted} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', color: C.text, marginBottom: '8px', fontWeight: '500' }}>
              Hali to'lovlar yo'q
            </p>
            <p style={{ fontSize: '14px', color: C.muted, marginBottom: '24px' }}>
              Birinchi to'lovni qo'shish uchun "To'lov qo'shish" tugmasini bosing
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: C.card2,
                  borderBottom: `1px solid ${C.border}`
                }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>
                    Sana
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>
                    O'quvchi
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>
                    Guruh
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>
                    Tavsif
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>
                    Summa
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>
                    Sizning ulushingiz
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr
                    key={payment.id || index}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.card2}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: C.text }}>
                      {formatDate(payment.date)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: C.text, fontWeight: '500' }}>
                      {payment.studentName || 'Noma\'lum'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: C.muted }}>
                      {groups?.find(g => g.id === payment.groupId)?.name || 'Noma\'lum'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: C.muted }}>
                      {payment.description || 'Dars to\'lovi'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#22c55e', fontWeight: '600', textAlign: 'right' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6366f1', fontWeight: '600', textAlign: 'right' }}>
                      {formatCurrency(Math.round(payment.amount * (teacherSettings.commissionPercentage / 100)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PAYMENT MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: C.card,
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: C.text, margin: 0 }}>
                Yangi to'lov yaratish
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                  Guruh
                </label>
                <select
                  value={paymentForm.groupId}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, groupId: e.target.value, studentId: '' });
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px'
                  }}
                >
                  <option value="">Guruhni tanlang</option>
                  {groups?.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              {paymentForm.groupId && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                    O'quvchi
                  </label>
                  <select
                    value={paymentForm.studentId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: C.card2,
                      border: `1px solid ${C.border}`,
                      color: C.text,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">O'quvchini tanlang</option>
                    {getGroupStudents(paymentForm.groupId).map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                  Summa (UZS)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="50000"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                  Sana
                </label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                  Tavsif
                </label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Dars to'lovi"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: C.card2,
                marginBottom: '24px',
                border: `1px solid ${C.border}`
              }}>
                <Info size={16} color={C.muted} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>
                    <strong>Hisoblash:</strong> {formatCurrency(paymentForm.amount || 0)} × {teacherSettings.commissionPercentage}% = <strong>{formatCurrency(Math.round((paymentForm.amount || 0) * (teacherSettings.commissionPercentage / 100)))}</strong> sizga tushadi
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: C.card,
            borderRadius: '12px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: C.text, margin: 0 }}>
                To'lov sozlamalari
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                  Komissiya foizi (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={teacherSettings.commissionPercentage}
                    onChange={(e) => setTeacherSettings({ ...teacherSettings, commissionPercentage: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: C.card2,
                      border: `1px solid ${C.border}`,
                      color: C.text,
                      fontSize: '14px'
                    }}
                  />
                  <Percent size={18} color={C.muted} />
                </div>
                <p style={{ fontSize: '12px', color: C.muted, marginTop: '8px' }}>
                  Har bir to'lovdan qancha foiz olishingizni ko'rsating
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: C.text, marginBottom: '8px' }}>
                  Asosiy dars narxi (UZS)
                </label>
                <input
                  type="number"
                  value={teacherSettings.baseRate}
                  onChange={(e) => setTeacherSettings({ ...teacherSettings, baseRate: parseInt(e.target.value) })}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: C.muted, marginTop: '8px' }}>
                  Har bir dars uchun asosiy narx
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={teacherSettings.showPaymentBreakdown}
                    onChange={(e) => setTeacherSettings({ ...teacherSettings, showPaymentBreakdown: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: C.text }}>
                    To'lov tafsilotlarini ko'rsatish
                  </span>
                </label>
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: C.card2,
                marginBottom: '24px',
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <PieChart size={16} color={C.muted} />
                  <p style={{ fontSize: '13px', fontWeight: '500', color: C.text, margin: 0 }}>
                    Misol hisoblash:
                  </p>
                </div>
                <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>
                  Dars narxi: {formatCurrency(teacherSettings.baseRate)} × {teacherSettings.commissionPercentage}% = <strong>{formatCurrency(Math.round(teacherSettings.baseRate * (teacherSettings.commissionPercentage / 100)))}</strong> sizga tushadi
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    background: C.card2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSaveSettings}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={16} /> Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}