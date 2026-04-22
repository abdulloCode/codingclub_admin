import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  CreditCard, DollarSign, Wallet, Calendar, CheckCircle, ArrowLeft,
  X, AlertCircle, Clock, RefreshCw
} from 'lucide-react';

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const BRAND = "#427A43";
const BRAND_DARK = "#2d5630";
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

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
export default function UserPayment() {
  const { user } = useAuth();
  const { isDarkMode: D } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── DATA FETCHING ────────────────────────────────────────────
  const fetchPayments = async () => {
    try {
      setLoading(true);
      // ✅ Use universal getMyPayments() method
      const data = await apiService.getMyPayments();
      const paymentsList = Array.isArray(data) ? data : (data?.payments || data?.data || []);
      setPayments(paymentsList);
    } catch (error) {
      console.error("To'lovlarni olishda xatolik:", error);
      showToast("To'lovlarni olishda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const data = await apiService.getPaymentTypes(true);
      const typesList = Array.isArray(data) ? data : (data?.paymentTypes || data?.data || []);
      setPaymentTypes(typesList);
    } catch (error) {
      console.error("To'lov turlarini olishda xatolik:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentTypes();
  }, []);

  // ─── RENDER HELPERS ───────────────────────────────────────────
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending:  { color: WARNING, bg: "rgba(245, 158, 11, 0.15)",  label: "Kutilmoqda",   icon: Clock },
      approved: { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)",   label: "Tasdiqlangan", icon: CheckCircle },
      rejected: { color: DANGER,  bg: "rgba(239, 68, 68, 0.15)",   label: "Rad etilgan",  icon: X }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 20,
        background: config.bg, color: config.color,
        fontSize: 11, fontWeight: 600
      }}>
        <Icon size={10} />
        {config.label}
      </div>
    );
  };

  const getMethodBadge = (method) => {
    const methods = {
      cash: { color: SUCCESS, label: "Naqd" },
      card: { color: INFO, label: "Karta" },
      transfer: { color: WARNING, label: "O'tkazma" },
      click: { color: INFO, label: "Click" },
      payme: { color: INFO, label: "Payme" }
    };
    const config = methods[method] || { color: INFO, label: method || "—" };
    return (
      <span style={{
        fontSize: 11, padding: "4px 10px", borderRadius: 20,
        background: `${config.color}15`, color: config.color, fontWeight: 600
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BACKGROUND}; color: ${TEXT}; }
        .user-payment { min-height: 100vh; background: ${BACKGROUND}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .card { background: ${CARD_BG}; border: 1px solid ${BORDER}; border-radius: 16px; overflow: hidden; }
        .card-hover { transition: all 0.3s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: ${BRAND}30; }
        .btn { border: none; cursor: pointer; font-family: inherit; font-weight: 500; transition: all 0.2s ease; }
        .btn:active { transform: scale(0.98); }
        .input { width: 100%; background: ${CARD_BG2}; border: 1px solid ${BORDER}; color: ${TEXT}; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; transition: all 0.2s ease; }
        .input:focus { border-color: ${BRAND}; box-shadow: 0 0 0 3px ${BRAND}20; }
        .select { width: 100%; background: ${CARD_BG2}; border: 1px solid ${BORDER}; color: ${TEXT}; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; transition: all 0.2s ease; cursor: pointer; }
        .select:focus { border-color: ${BRAND}; box-shadow: 0 0 0 3px ${BRAND}20; }
      `}</style>

      <div className="user-payment">
        {/* Header */}
        <div style={{
          background: `${CARD_BG}CC`, backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER}`, padding: '16px 24px',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => navigate(-1)}
                className="btn"
                style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: TEXT_MUTED, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <ArrowLeft size={14} />
                Orqaga
              </button>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Wallet size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>To'lovlar</h1>
                <p style={{ fontSize: 11, color: TEXT_MUTED }}>Shaxsiy kabinet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16, marginBottom: 24
          }}>
            {[
              {
                label: "Jami to'lovlar",
                value: payments.length,
                icon: CreditCard,
                color: INFO
              },
              {
                label: "Kutilmoqda",
                value: payments.filter(p => p.status === 'pending').length,
                icon: Clock,
                color: WARNING
              },
              {
                label: "Tasdiqlangan",
                value: payments.filter(p => p.status === 'approved').length,
                icon: CheckCircle,
                color: SUCCESS
              }
            ].map((stat, index) => (
              <div key={index} className="card" style={{
                padding: '20px',
                animation: `fadeIn 0.3s ease ${index * 0.1}s both`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${stat.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <stat.icon size={20} color={stat.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>{stat.value}</h3>
                    <p style={{ fontSize: 12, color: TEXT_MUTED }}>{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payments List */}
          <div className="card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>
              Mening to'lovlarim
            </h2>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <RefreshCw size={32} color={BRAND} className="animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: TEXT_MUTED }}>
                <CreditCard size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p>To'lovlar topilmadi</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Sizda hozircha to'lovlar yo'q</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="card"
                    style={{
                      padding: '16px', borderRadius: 12, background: CARD_BG2,
                      border: `1px solid ${BORDER}`,
                      display: 'flex', alignItems: 'center', gap: 16,
                      animation: `fadeIn 0.3s ease ${index * 0.05}s both`
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: `${SUCCESS}15`,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0
                    }}>
                      <DollarSign size={20} color={SUCCESS} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4 style={{
                          fontSize: 14, fontWeight: 600, color: TEXT,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {payment.customType || payment.description || "To'lov"}
                        </h4>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: TEXT_MUTED }}>
                        <span>{formatDate(payment.date)}</span>
                        {payment.paymentMethod && getMethodBadge(payment.paymentMethod)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 18, fontWeight: 700,
                      color: SUCCESS,
                      flexShrink: 0
                    }}>
                      {fmtCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'success' ? `${SUCCESS}15` : `${DANGER}15`,
          border: `1px solid ${toast.type === 'success' ? SUCCESS : DANGER}`,
          color: toast.type === 'success' ? SUCCESS : DANGER,
          fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.3s ease both'
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}
