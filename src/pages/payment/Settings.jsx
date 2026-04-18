import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Settings, Save, RefreshCw, CheckCircle, XCircle,
  AlertCircle, DollarSign, CreditCard, FileText,
  Shield, Bell, Database, Key, Lock,
  Download, Upload, Plus, Edit, Trash2,
  Calendar, Filter, Search, ChevronRight,
  X, ChevronLeft, Globe, Smartphone,
  Monitor, Moon, Sun, Palette
} from 'lucide-react';

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const BRAND = "#6366f1";
const BRAND_DARK = "#4f46e5";
const BRAND_LIGHT = "#818cf8";
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

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
export default function PaymentSettings() {
  const { user } = useAuth();
  const { isDarkMode: D, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [paymentSettings, setPaymentSettings] = useState({
    defaultPaymentType: "",
    autoApproveBelow: 0,
    currency: "UZS",
    dateFormat: "DD.MM.YYYY",
    timezone: "Asia/Tashkent",
    notificationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    paymentReminderDays: 3,
    paymentReminderHour: 9
  });

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [typeForm, setTypeForm] = useState({
    name: "",
    code: "",
    dk: "credit",
    description: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── DATA FETCHING ────────────────────────────────────────────
  const fetchPaymentTypes = useCallback(async () => {
    try {
      const data = await apiService.getPaymentTypes();
      const typesList = Array.isArray(data) ? data : (data?.paymentTypes || data?.data || []);
      setPaymentTypes(typesList);
    } catch (error) {
      console.error("To'lov turlarini olishda xatolik:", error);
      showToast("To'lov turlarini olishda xatolik yuz berdi", "error");
      setPaymentTypes([]);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getSettings();
      setPaymentSettings(data?.payment || paymentSettings);
    } catch (error) {
      console.error("Sozlamalarni olishda xatolik:", error);
      // Use default settings if fetch fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchPaymentTypes(),
      fetchSettings()
    ]);
  }, [fetchPaymentTypes, fetchSettings]);

  // ─── ACTIONS ───────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await apiService.updateSettings({ payment: paymentSettings });
      showToast("Sozlamalar saqlandi!");
    } catch (error) {
      console.error("Sozlamalarni saqlashda xatolik:", error);
      showToast("Sozlamalarni saqlashda xatolik yuz berdi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.createPaymentType(typeForm);
      showToast("To'lov turi yaratildi!");
      setShowTypeModal(false);
      setTypeForm({ name: "", code: "", dk: "credit", description: "" });
      fetchPaymentTypes();
    } catch (error) {
      console.error("To'lov turini yaratishda xatolik:", error);
      showToast(error.message || "To'lov turini yaratishda xatolik yuz berdi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateType = async (e) => {
    e.preventDefault();
    if (!selectedType?.id) return;

    setSaving(true);
    try {
      await apiService.updatePaymentType(selectedType.id, typeForm);
      showToast("To'lov turi yangilandi!");
      setShowTypeModal(false);
      setSelectedType(null);
      setTypeForm({ name: "", code: "", dk: "credit", description: "" });
      fetchPaymentTypes();
    } catch (error) {
      console.error("To'lov turini yangilashda xatolik:", error);
      showToast(error.message || "To'lov turini yangilashda xatolik yuz berdi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteType = async (typeId) => {
    setConfirmAction({
      type: 'delete',
      typeId,
      message: "Bu to'lov turini o'chirishni tasdiqlaysizmi?"
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setSaving(true);
    try {
      if (confirmAction.type === 'delete' && confirmAction.typeId) {
        await apiService.deletePaymentType(confirmAction.typeId);
        showToast("To'lov turi o'chirildi!");
        fetchPaymentTypes();
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error("Amalni bajarishda xatolik:", error);
      showToast(error.message || "Xatolik yuz berdi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeTypes = async () => {
    setConfirmAction({
      type: 'initialize',
      message: "Boshlang'ich to'lov turlarini yaratishni tasdiqlaysizmi?"
    });
    setShowConfirmModal(true);
  };

  const handleExportTypes = async () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        paymentTypes: paymentTypes
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-types-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("To'lov turlari yuklab olindi!");
    } catch (error) {
      console.error("Yuklab olishda xatolik:", error);
      showToast("Yuklab olishda xatolik yuz berdi", "error");
    }
  };

  const openTypeModal = (type = null) => {
    setSelectedType(type);
    if (type) {
      setTypeForm({
        name: type.name || "",
        code: type.code || "",
        dk: type.dk || "credit",
        description: type.description || ""
      });
    } else {
      setTypeForm({ name: "", code: "", dk: "credit", description: "" });
    }
    setShowTypeModal(true);
  };

  // ─── TABS ───────────────────────────────────────────────────
  const tabs = [
    { id: "general", label: "Umumiy", icon: Settings },
    { id: "types", label: "To'lov turlari", icon: FileText },
    { id: "notifications", label: "Bildirishlar", icon: Bell },
    { id: "security", label: "Xavfsizlik", icon: Shield }
  ];

  // ─── RENDER HELPERS ───────────────────────────────────────────
  const getTypeBadge = (dk) => {
    const config = dk === 'credit'
      ? { color: SUCCESS, bg: "rgba(34, 197, 94, 0.15)", label: "Kirim", icon: ChevronRight }
      : { color: DANGER, bg: "rgba(239, 68, 68, 0.15)", label: "Chiqim", icon: ChevronLeft };

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: ${BACKGROUND};
          color: ${TEXT};
        }

        .payment-settings {
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

      <div className="payment-settings">
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
                <Settings size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>To'lov Sozlamalari</h1>
                <p style={{ fontSize: 11, color: TEXT_MUTED }}>Admin Panel</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={toggleTheme}
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
                {D ? <Sun size={18} /> : <Moon size={18} />}
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
              {/* GENERAL TAB */}
              {activeTab === 'general' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                      Umumiy sozlamalar
                    </h2>
                    <p style={{ fontSize: 13, color: TEXT_MUTED }}>
                      To'lov tizimi umumiy konfiguratsiyasi
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
                    {/* Default Payment Type */}
                    <div className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${BRAND}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CreditCard size={20} color={BRAND} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
                            Standart to'lov turi
                          </h3>
                          <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                            Standart to'lov turi tanlash
                          </p>
                        </div>
                      </div>
                      <select
                        value={paymentSettings.defaultPaymentType}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultPaymentType: e.target.value })}
                        className="select"
                      >
                        <option value="">Tanlanmagan</option>
                        {paymentTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Auto Approve */}
                    <div className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${SUCCESS}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircle size={20} color={SUCCESS} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
                            Avto tasdiqlash
                          </h3>
                          <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                            Quyidagi summadan past bo'lgan to'lovlarni avto tasdiqlash
                          </p>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={paymentSettings.autoApproveBelow}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, autoApproveBelow: parseInt(e.target.value) })}
                        className="input"
                        placeholder="Summa (UZS)"
                      />
                    </div>

                    {/* Currency */}
                    <div className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${WARNING}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <DollarSign size={20} color={WARNING} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
                            Valyuta
                          </h3>
                          <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                            Asosiy valyuta tanlash
                          </p>
                        </div>
                      </div>
                      <select
                        value={paymentSettings.currency}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                        className="select"
                      >
                        <option value="UZS">Uzbekistan Som (UZS)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="RUB">Russian Ruble (RUB)</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${INFO}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Calendar size={20} color={INFO} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
                            Sana formati
                          </h3>
                          <p style={{ fontSize: 12, color: TEXT_MUTED }}>
                            Sana ko'rinishi tanlash
                          </p>
                        </div>
                      </div>
                      <select
                        value={paymentSettings.dateFormat}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, dateFormat: e.target.value })}
                        className="select"
                      >
                        <option value="DD.MM.YYYY">DD.MM.YYYY (01.01.2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (01/01/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-01)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (01/01/2026)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button
                      onClick={() => fetchSettings()}
                      className="btn"
                      style={{
                        padding: '10px 20px',
                        borderRadius: 10,
                        background: 'transparent',
                        border: `1px solid ${BORDER}`,
                        color: TEXT_MUTED,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <RefreshCw size={16} />
                      Qayta yuklash
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="btn"
                      style={{
                        padding: '10px 24px',
                        borderRadius: 10,
                        background: saving ? `${BRAND}50` : `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Saqlash
                        </>
                      )}
                    </button>
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
                    marginBottom: 20,
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                        To'lov turlari
                      </h2>
                      <p style={{ fontSize: 13, color: TEXT_MUTED }}>
                        Jami {paymentTypes.length} ta to'lov turi
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => openTypeModal()}
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
                          gap: 8
                        }}
                      >
                        <Plus size={16} />
                        Yangi turi
                      </button>
                      <button
                        onClick={handleInitializeTypes}
                        className="btn"
                        style={{
                          padding: '10px 16px',
                          borderRadius: 10,
                          background: `${INFO}15`,
                          border: `1px solid ${INFO}30`,
                          color: INFO,
                          fontSize: 13,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Database size={16} />
                        Initialize
                      </button>
                      <button
                        onClick={handleExportTypes}
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
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16
                  }}>
                    {paymentTypes.length === 0 ? (
                      <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: 60,
                        background: CARD_BG,
                        borderRadius: 16,
                        border: `1px solid ${BORDER}`,
                        color: TEXT_MUTED
                      }}>
                        <FileText size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p>To'lov turlari topilmadi</p>
                      </div>
                    ) : (
                      paymentTypes.map((type, index) => (
                        <div
                          key={type.id}
                          className="card card-hover animate-slide-up"
                          style={{
                            padding: '20px',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 16
                          }}>
                            <div style={{
                              width: 52,
                              height: 52,
                              borderRadius: 12,
                              background: type.dk === 'credit' ? `${SUCCESS}15` : `${DANGER}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {type.dk === 'credit' ? (
                                <ChevronRight size={24} color={SUCCESS} />
                              ) : (
                                <ChevronLeft size={24} color={DANGER} />
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => openTypeModal(type)}
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
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteType(type.id)}
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
                          </div>

                          <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
                            {type.name}
                          </h3>

                          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            {getTypeBadge(type.dk)}
                            <span style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: `${BRAND}15`,
                              color: BRAND,
                              fontWeight: 600
                            }}>
                              {type.code}
                            </span>
                          </div>

                          {type.description && (
                            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16, lineHeight: 1.5 }}>
                              {type.description}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                      Bildirish sozlamalari
                    </h2>
                    <p style={{ fontSize: 13, color: TEXT_MUTED }}>
                      To'lov bildirishlari va eslatmalar
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
                    {/* Notification Settings */}
                    <div className="card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 16 }}>
                        Bildirishlar
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                          { id: 'notificationEnabled', label: 'Bildirishlarni yoqish', description: 'To\'lov haqida bildirishlarni olish' },
                          { id: 'emailNotifications', label: 'Email bildirishlar', description: 'To\'lov eslatmalarini emailga yuborish' },
                          { id: 'smsNotifications', label: 'SMS bildirishlar', description: 'Muhim bildirishlarni SMS ga yuborish' }
                        ].map((item) => (
                          <label
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '12px',
                              borderRadius: 10,
                              background: CARD_BG2,
                              border: `1px solid ${BORDER}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={paymentSettings[item.id]}
                              onChange={(e) => setPaymentSettings({ ...paymentSettings, [item.id]: e.target.checked })}
                              style={{ width: 18, height: 18, accent: BRAND }}
                            />
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>
                                {item.label}
                              </h4>
                              <p style={{ fontSize: 11, color: TEXT_MUTED }}>
                                {item.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 16 }}>
                        To'lov eslatmalari
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                            Eslatma kuni oldin (kun)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={paymentSettings.paymentReminderDays}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentReminderDays: parseInt(e.target.value) })}
                            className="input"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6 }}>
                            Eslatma vaqti (soat)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={paymentSettings.paymentReminderHour}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentReminderHour: parseInt(e.target.value) })}
                            className="input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="btn"
                      style={{
                        padding: '10px 24px',
                        borderRadius: 10,
                        background: saving ? `${BRAND}50` : `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Saqlash
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                      Xavfsizlik sozlamalari
                    </h2>
                    <p style={{ fontSize: 13, color: TEXT_MUTED }}>
                      To'lov tizimi xavfsizlik parametrlari
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: 20
                  }}>
                    {[
                      {
                        icon: Lock,
                        title: "Maxfiy to'lov miqdori",
                        description: "Bir martada maksimal to'lov miqdori",
                        value: "10,000,000 UZS",
                        color: INFO
                      },
                      {
                        icon: Shield,
                        title: "Minimallik miqdori",
                        description: "Minimal to'lov miqdori",
                        value: "10,000 UZS",
                        color: SUCCESS
                      },
                      {
                        icon: Key,
                        title: "API kaliti",
                        description: "To'lov API kaliti himoyalangan",
                        value: "********",
                        color: WARNING
                      },
                      {
                        icon: Database,
                        title: "Ma'lumotlar bazasi",
                        description: "To'lov ma'lumotlari saqlanmoqda",
                        value: "MongoDB",
                        color: BRAND_LIGHT
                      }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="card animate-slide-up"
                        style={{
                          padding: '20px',
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${item.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 12
                        }}>
                          <item.icon size={20} color={item.color} />
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 6 }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 12 }}>
                          {item.description}
                        </p>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: CARD_BG2,
                          border: `1px solid ${BORDER}`,
                          fontFamily: 'monospace',
                          fontSize: 13,
                          color: TEXT
                        }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ padding: '20px', marginTop: 20 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 16
                    }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${DANGER}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AlertCircle size={20} color={DANGER} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
                          Xavfsizlik xatoqlari
                        </h3>
                        <p style={{ fontSize: 13, color: TEXT_MUTED }}>
                          Oxirgi 30 kunlik xato lar
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: '16px',
                      borderRadius: 10,
                      background: `${SUCCESS}10`,
                      border: `1px solid ${SUCCESS}20`,
                      color: SUCCESS,
                      fontSize: 13,
                      textAlign: 'center'
                    }}>
                      Hech qanday xato yuz berilmagan
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

      {/* Create/Update Type Modal */}
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
                  {selectedType ? "To'lov turini yangilash" : "Yangi to'lov turi"}
                </h3>
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
                  {selectedType ? "Mavjud to'lov turini tahrirlash" : "Yangi to'lov turi yaratish"}
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

            <form onSubmit={selectedType ? handleUpdateType : handleCreateType} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  disabled={saving}
                  className="btn"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 10,
                    background: saving ? `${BRAND}50` : `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      {selectedType ? "Yangilash" : "Yaratish"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
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
            maxWidth: 400,
            padding: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${DANGER}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={24} color={DANGER} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
              Tasdiqlash
            </h3>
            <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 20 }}>
              {confirmAction?.message}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
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
                onClick={handleConfirmAction}
                disabled={saving}
                className="btn"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  background: saving ? `${DANGER}50` : DANGER,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Ijaralanmoqda...
                  </>
                ) : (
                  "Tasdiqlash"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}