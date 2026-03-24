import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../services/api";
import {
  GraduationCap, Plus, Search, Edit3, Trash2,
  Mail, Phone, RefreshCw, X, Save,
  CheckCircle, XCircle,
  AlertTriangle, Users, UserCheck,
  Layers, Lock, ArrowUpRight, Eye, EyeOff,
} from "lucide-react";

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const BRAND     = "#427A43";
const BRAND_L   = "#5a9e5b";
const BRAND_DIM = "#2d5630";

const INIT_FORM = {
  name:     "",
  email:    "",
  phone:    "",
  password: "",
  status:   "active",
  groupId:  "",
};

/* ─── PHONE NORMALIZER ───────────────────────────────────────── */
// "+998 90 123 45 67" → "+998901234567"
// "998901234567"      → "+998901234567"
// "901234567"         → "+998901234567"
const normalizePhone = (p = "") => {
  const digits = p.replace(/\D/g, "");
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9)      return `+998${digits}`;
  return `+${digits}`;
};

/* ─── STYLES ─────────────────────────────────────────────────── */
const GStyles = ({ D }) => (
  <style>{`
    .st-root { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width:4px; height:4px; }
    ::-webkit-scrollbar-thumb { background:rgba(66,122,67,0.22); border-radius:99px; }

    @keyframes st-up  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    @keyframes st-in  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    @keyframes st-spin{ to{transform:rotate(360deg)} }
    @keyframes st-blnk{ 0%,100%{opacity:1} 50%{opacity:.35} }
    @keyframes st-tst { from{opacity:0;transform:translateY(10px) scale(.95)} to{opacity:1;transform:none} }

    .st-1 { animation: st-up .5s ease .04s both; }
    .st-2 { animation: st-up .5s ease .10s both; }
    .st-3 { animation: st-up .5s ease .17s both; }
    .st-modal { animation: st-in .26s cubic-bezier(.34,1.56,.64,1) both; }
    .st-toast  { animation: st-tst .28s ease both; }

    .st-card {
      transition: transform .24s cubic-bezier(.34,1.56,.64,1), box-shadow .24s, border-color .18s;
      cursor: pointer;
    }
    .st-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 10px 28px rgba(66,122,67,0.13);
      border-color: rgba(66,122,67,0.28) !important;
    }

    .st-btn {
      cursor: pointer; border: none;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      font-family: inherit;
      transition: transform .2s cubic-bezier(.34,1.56,.64,1), opacity .14s;
    }
    .st-btn:hover  { transform: scale(1.06); }
    .st-btn:active { transform: scale(.96); }
    .st-btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }

    .st-inp {
      width: 100%; font-size: 13px; font-family: inherit;
      outline: none; transition: border-color .18s, box-shadow .18s;
    }
    .st-inp:focus {
      border-color: ${BRAND} !important;
      box-shadow: 0 0 0 3px rgba(66,122,67,0.13) !important;
    }

    .st-spin { animation: st-spin .85s linear infinite; }
    .st-blnk { animation: st-blnk 1.8s ease-in-out infinite; }
    .st-tab  { cursor: pointer; transition: all .18s; white-space: nowrap; }
  `}</style>
);

/* ─── COUNT UP ───────────────────────────────────────────────── */
function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  const r = useRef();
  useEffect(() => {
    cancelAnimationFrame(r.current);
    const s = performance.now();
    const tick = now => {
      const p = Math.min((now - s) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) r.current = requestAnimationFrame(tick);
    };
    r.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r.current);
  }, [target]);
  return v;
}

/* ─── SMALL COMPONENTS ───────────────────────────────────────── */
function Avatar({ name, size = 40 }) {
  const ini = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.32,
      boxShadow: "0 3px 10px rgba(66,122,67,0.25)",
    }}>{ini}</div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className="st-blnk" style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
      borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: active ? "#22c55e" : "#ef4444",
      background: active ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
      border: `1px solid ${active ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#22c55e" : "#ef4444", display: "inline-block" }} />
      {active ? "Faol" : "Nofaol"}
    </span>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div className="st-toast" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10, padding: "12px 18px",
      borderRadius: 16, backdropFilter: "blur(16px)",
      background: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
      border: `1px solid ${ok ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)"}`,
      boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
    }}>
      {ok ? <CheckCircle size={15} color="#22c55e" /> : <XCircle size={15} color="#ef4444" />}
      <span style={{ fontSize: 13, fontWeight: 600, color: ok ? "#22c55e" : "#ef4444" }}>{msg}</span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, pale, D, delay = 0 }) {
  const n    = useCountUp(value);
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  return (
    <div style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 18,
      padding: "18px 20px", boxShadow: D ? "none" : "0 2px 14px rgba(66,122,67,0.07)",
      animation: `st-up 0.5s ease ${delay}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: pale,
                      border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={color} />
        </div>
        <ArrowUpRight size={13} color={mu} />
      </div>
      <p style={{ fontSize: 32, fontWeight: 500, color, lineHeight: 1, marginBottom: 4 }}>{n}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: mu, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
    </div>
  );
}

/* ─── STUDENT MODAL ──────────────────────────────────────────── */
function StudentModal({ isOpen, onClose, isEditing, form, setForm, onSubmit,
                        loading, error, groups, groupsLoading, D }) {
  const [showPass, setShowPass] = useState(false);

  // Modal yopilganda showPass ni reset qilish
  useEffect(() => {
    if (!isOpen) setShowPass(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const card  = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord  = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const inpBg = D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.04)";
  const inp   = {
    background: inpBg, border: `1px solid ${bord}`,
    borderRadius: 12, padding: "11px 14px", color: tx, fontSize: 13,
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 800, color: mu,
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
  };

  const selGrp = groups.find(g => g.id === form.groupId);

  // Controlled input handler — to'g'ridan-to'g'ri setForm chaqiradi
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div className="st-modal" style={{
        width: "100%", maxWidth: 520, borderRadius: 26,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${bord}`, flexShrink: 0,
          borderRadius: "26px 26px 0 0",
          background: `linear-gradient(135deg,${BRAND_DIM}f2,${BRAND_L}d8)`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -28, right: -18, width: 100, height: 100,
            borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 11, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: "rgba(255,255,255,0.20)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isEditing ? <Edit3 size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: "#fff", fontWeight: 500 }}>
                {isEditing ? "Tahrirlash" : "Yangi o'quvchi"}
              </h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.58)", marginTop: 1 }}>
                {isEditing ? "Ma'lumotlarni yangilang" : "Yangi talabani ro'yxatdan o'tkazing"}
              </p>
            </div>
          </div>
          <button className="st-btn" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 99,
            background: "rgba(0,0,0,0.22)", color: "#fff", position: "relative", zIndex: 1,
          }}><X size={14} /></button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Xato xabari */}
          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px",
              borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            }}>
              <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* Ism */}
          <div>
            <label style={lbl}>To'liq ism <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              required
              className="st-inp"
              placeholder="Ism Familiya"
              value={form.name}
              onChange={set("name")}
              style={inp}
              autoComplete="off"
            />
          </div>

          {/* Email + Telefon */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Email <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Mail size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  required
                  type="email"
                  className="st-inp"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={set("email")}
                  style={{ ...inp, paddingLeft: 34 }}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label style={lbl}>Telefon <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Phone size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  required
                  className="st-inp"
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={set("phone")}
                  style={{ ...inp, paddingLeft: 34 }}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Parol */}
          <div>
            <label style={lbl}>
              {isEditing
                ? "Yangi parol (ixtiyoriy)"
                : <><span>Parol</span> <span style={{ color: "#ef4444" }}>*</span></>}
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                required={!isEditing}
                type={showPass ? "text" : "password"}
                className="st-inp"
                placeholder={isEditing ? "O'zgartirmoqchi bo'lsangiz kiriting" : "Kamida 8 ta belgi"}
                value={form.password}
                onChange={set("password")}
                style={{ ...inp, paddingLeft: 34, paddingRight: 38 }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: mu,
                }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Guruh */}
          <div>
            <label style={lbl}>Guruh (ixtiyoriy)</label>
            <div style={{ position: "relative" }}>
              <Layers size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select
                className="st-inp"
                value={form.groupId}
                onChange={set("groupId")}
                style={{ ...inp, paddingLeft: 34, cursor: "pointer", appearance: "none" }}
              >
                <option value="">— Guruh tanlanmagan —</option>
                {groupsLoading
                  ? <option disabled>Yuklanmoqda...</option>
                  : groups.map(g => {
                      const left = (g.maxStudents || 0) - (g.currentStudents || 0);
                      return (
                        <option key={g.id} value={g.id}>
                          {g.name}{left > 0 ? ` (${left} joy)` : " (to'liq)"}
                        </option>
                      );
                    })
                }
              </select>
            </div>
            {selGrp && (
              <div style={{
                marginTop: 8, padding: "9px 12px", borderRadius: 11,
                background: "rgba(66,122,67,0.07)", border: "1px solid rgba(66,122,67,0.18)",
                display: "flex", alignItems: "center", gap: 9,
              }}>
                <Layers size={12} color={BRAND} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: BRAND }}>{selGrp.name}</p>
                  <p style={{ fontSize: 10, color: mu, marginTop: 1 }}>
                    {selGrp.currentStudents || 0}/{selGrp.maxStudents} o'quvchi
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Holat toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            ...inp, padding: "11px 14px",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: form.status === "active" ? "#22c55e" : mu }}>
              {form.status === "active" ? "✅ Faol" : "❌ Nofaol"}
            </span>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, status: prev.status === "active" ? "inactive" : "active" }))}
              style={{
                width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                background: form.status === "active"
                  ? `linear-gradient(135deg,${BRAND},${BRAND_L})`
                  : "rgba(0,0,0,0.15)",
                position: "relative", transition: "background .25s", flexShrink: 0,
              }}
            >
              <span style={{
                position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transition: "left .25s", left: form.status === "active" ? 22 : 2,
              }} />
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" className="st-btn" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 13,
              background: "transparent", border: `1px solid ${bord}`,
              fontSize: 13, fontWeight: 700, color: mu,
            }}>Bekor</button>
            <button type="submit" className="st-btn" disabled={loading} style={{
              flex: 2, padding: "12px", borderRadius: 13,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 16px rgba(66,122,67,0.30)",
            }}>
              {loading
                ? <><RefreshCw size={14} className="st-spin" /> Saqlanmoqda...</>
                : <><Save size={14} /> {isEditing ? "Saqlash" : "Qo'shish"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── DELETE MODAL ───────────────────────────────────────────── */
function DeleteModal({ target, onConfirm, onCancel, D }) {
  if (!target) return null;
  const card = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(0,0,0,0.60)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="st-modal" style={{
        width: "100%", maxWidth: 340, borderRadius: 22,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        padding: "26px 26px 22px", textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
        }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 19, color: tx, marginBottom: 8, fontWeight: 500 }}>O'quvchini o'chirish</h3>
        <p style={{ fontSize: 13, color: mu, lineHeight: 1.65, marginBottom: 22 }}>
          Bu o'quvchi tizimdan butunlay o'chiriladi. Bu amalni bekor qilib bo'lmaydi.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="st-btn" onClick={onCancel} style={{
            flex: 1, padding: "11px", borderRadius: 12,
            background: "transparent", border: `1px solid ${bord}`,
            fontSize: 13, fontWeight: 700, color: mu,
          }}>Bekor</button>
          <button className="st-btn" onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 12,
            background: "rgba(239,68,68,0.90)", border: "none",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function Student() {
  const { user }          = useAuth();
  const { isDarkMode: D } = useTheme();

  const [students,        setStudents]        = useState([]);
  const [groups,          setGroups]          = useState([]);
  const [groupsLoading,   setGroupsLoading]   = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [isEditing,       setIsEditing]       = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form,            setForm]            = useState(INIT_FORM);
  const [modalLoading,    setModalLoading]    = useState(false);
  const [formError,       setFormError]       = useState("");
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [toast,           setToast]           = useState(null);

  // ✅ FIX 1: submitting ref — double-submit oldini olish
  const submittingRef = useRef(false);
  const toastTimer    = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getStudents();
      setStudents(Array.isArray(res) ? res : res?.students ?? []);
    } catch (err) {
      showToast(err.message || "Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const res = await apiService.getGroups();
      const all = Array.isArray(res) ? res : res?.groups ?? [];
      setGroups(all.filter(g => g.status === "active" || !g.status));
    } catch {
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, [fetchStudents, fetchGroups]);

  const getGroupName = useCallback(
    id => groups.find(g => g.id === id)?.name ?? null,
    [groups]
  );

  const openAdd = useCallback(() => {
    setForm(INIT_FORM);
    setIsEditing(false);
    setSelectedStudent(null);
    setFormError("");
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback(s => {
    setForm({
      name:     s.user?.name  || s.name  || "",
      email:    s.user?.email || s.email || "",
      phone:    s.user?.phone || s.phone || "",
      password: "",
      status:   s.status || "active",
      groupId:  s.groupId || "",
    });
    setIsEditing(true);
    setSelectedStudent(s);
    setFormError("");
    setIsModalOpen(true);
  }, []);

  // ✅ FIX 2: handleSubmit — debounce + phone normalizatsiya + aniq xato ko'rsatish
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Double-submit oldini olish
    if (submittingRef.current) return;

    setFormError("");

    // Validatsiya
    if (!form.name.trim())           { setFormError("Ism kiritilishi shart"); return; }
    if (!form.email.includes("@"))   { setFormError("To'g'ri email kiriting"); return; }
    if (!form.phone.trim())          { setFormError("Telefon kiritilishi shart"); return; }
    if (!isEditing && form.password.length < 6) {
      setFormError("Parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }

    submittingRef.current = true;
    setModalLoading(true);

    try {
      let studentId;

      if (isEditing) {
        // ── PUT ──────────────────────────────────────────────
        const payload = {
          name:   form.name.trim(),
          email:  form.email.trim(),
          phone:  normalizePhone(form.phone),  // ✅ format tuzatildi
          status: form.status,
        };
        if (form.password) payload.password = form.password;

        await apiService.updateStudent(selectedStudent.id, payload);
        studentId = selectedStudent.id;
        showToast("Ma'lumotlar yangilandi");

      } else {
        // ── POST ─────────────────────────────────────────────
        const payload = {
          name:     form.name.trim(),
          email:    form.email.trim(),
          phone:    normalizePhone(form.phone),  // ✅ format tuzatildi
          password: form.password,
        };

        // Debug log — muammo hal bo'lgach o'chiring
        console.log("📤 Creating student:", { ...payload, password: "***" });

        const res = await apiService.createStudent(payload);
        studentId = res?.student?._id || res?.student?.id || res?.id || res?._id;
        showToast("O'quvchi qo'shildi");
      }

      // ── Guruhga biriktirish ───────────────────────────────
      if (form.groupId && studentId) {
        try {
          await apiService.addStudentToGroup(form.groupId, studentId);
        } catch (groupErr) {
          console.warn("Guruhga biriktirishda xato:", groupErr.message);
          showToast("O'quvchi qo'shildi, lekin guruhga biriktirilmadi", "error");
        }
      }

      setIsModalOpen(false);
      fetchStudents();

    } catch (err) {
      // ✅ FIX 3: Backend'dan kelgan aniq xatoni ko'rsatish
      const msg = err.message || "Xatolik yuz berdi";
      setFormError(msg);
      console.error("❌ Student submit error:", msg);
    } finally {
      setModalLoading(false);
      // ✅ Biroz kechiktirib unlock qilamiz (rapid double-click uchun)
      setTimeout(() => { submittingRef.current = false; }, 500);
    }
  }, [form, isEditing, selectedStudent, showToast, fetchStudents]);

  const confirmDelete = useCallback(async () => {
    try {
      await apiService.deleteStudent(deleteTarget);
      setDeleteTarget(null);
      showToast("O'quvchi o'chirildi");
      fetchStudents();
    } catch (err) {
      showToast(err.message || "O'chirishda xatolik", "error");
      setDeleteTarget(null);
    }
  }, [deleteTarget, showToast, fetchStudents]);

  /* ── Filters ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      const name  = s.user?.name  || s.name  || "";
      const email = s.user?.email || s.email || "";
      const phone = s.user?.phone || s.phone || "";
      return (
        (!q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || phone.includes(q)) &&
        (filterStatus === "all" || s.status === filterStatus)
      );
    });
  }, [students, searchQuery, filterStatus]);

  /* ── Theme ── */
  const bg   = D ? "#0a0a0b" : "#f0f4f0";
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  const totalActive = useMemo(
    () => students.filter(s => s.status === "active").length,
    [students]
  );

  return (
    <>
      <GStyles D={D} />
      <div className="st-root" style={{ background: bg, minHeight: "100%" }}>
        <Toast msg={toast?.msg} type={toast?.type} />

        {/* ── HEADER ── */}
        <div style={{
          padding: "18px 24px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(66,122,67,0.28)",
            }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 18, color: BRAND, lineHeight: 1, fontWeight: 500 }}>O'quvchilar</p>
              <p style={{ fontSize: 10, color: mu, fontWeight: 600, marginTop: 2 }}>
                {students.length} ta o'quvchi
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 11,
              background: D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.06)",
              border: `1px solid ${bord}`,
            }}>
              <Search size={13} color={mu} />
              <input
                className="st-inp"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none",
                         fontSize: 13, color: tx, width: 150, padding: 0 }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={12} color={mu} />
                </button>
              )}
            </div>

            <button className="st-btn" onClick={fetchStudents} style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`, color: BRAND,
            }}>
              <RefreshCw size={13} className={loading ? "st-spin" : ""} />
            </button>

            <button className="st-btn" onClick={openAdd} style={{
              padding: "8px 14px", borderRadius: 11,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              color: "#fff", fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 14px rgba(66,122,67,0.28)",
            }}>
              <Plus size={14} /> Qo'shish
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "16px 24px 40px" }}>

          {/* Stats */}
          <div className="st-1" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 12, marginBottom: 16,
          }}>
            <StatCard label="Jami"   value={students.length}               icon={Users}     color={BRAND}   pale="rgba(66,122,67,0.10)"  D={D} delay={0.04} />
            <StatCard label="Faol"   value={totalActive}                   icon={UserCheck} color="#22c55e" pale="rgba(34,197,94,0.10)"  D={D} delay={0.10} />
            <StatCard label="Nofaol" value={students.length - totalActive} icon={XCircle}  color="#ef4444" pale="rgba(239,68,68,0.10)"  D={D} delay={0.16} />
          </div>

          {/* Filter bar */}
          <div className="st-2" style={{
            display: "flex", gap: 7, overflowX: "auto", marginBottom: 14,
            padding: "8px 12px", borderRadius: 14, background: card, border: `1px solid ${bord}`,
          }}>
            {[["all", "Barchasi"], ["active", "Faol"], ["inactive", "Nofaol"]].map(([v, l]) => {
              const act = filterStatus === v;
              return (
                <button key={v} className="st-tab" onClick={() => setFilterStatus(v)} style={{
                  padding: "6px 12px", borderRadius: 9, border: "none", cursor: "pointer", flexShrink: 0,
                  background: act ? `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})` : "transparent",
                  color: act ? "#fff" : mu, fontSize: 12, fontWeight: 700,
                  boxShadow: act ? "0 3px 10px rgba(66,122,67,0.25)" : "none",
                }}>{l}</button>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 11, color: mu, fontWeight: 600, flexShrink: 0, alignSelf: "center" }}>
              {filtered.length} natija
            </span>
          </div>

          {/* Cards */}
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
              }}>
                <GraduationCap size={20} color="#fff" className="st-spin" />
              </div>
              <p style={{ fontSize: 17, color: BRAND }}>Yuklanmoqda...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="st-3" style={{ textAlign: "center", paddingTop: 56 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: "rgba(66,122,67,0.08)", border: "1px solid rgba(66,122,67,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
              }}>
                <GraduationCap size={24} color={BRAND} />
              </div>
              <p style={{ fontSize: 20, color: tx, marginBottom: 8, fontWeight: 400 }}>
                {students.length === 0 ? "Hali o'quvchi qo'shilmagan" : "Hech narsa topilmadi"}
              </p>
              <p style={{ fontSize: 13, color: mu, marginBottom: 18 }}>
                {searchQuery ? `"${searchQuery}" bo'yicha natija yo'q` : "Birinchi o'quvchini qo'shing"}
              </p>
              {!searchQuery && (
                <button className="st-btn" onClick={openAdd} style={{
                  padding: "10px 20px", borderRadius: 12,
                  background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(66,122,67,0.28)",
                }}>
                  <Plus size={14} /> O'quvchi qo'shish
                </button>
              )}
            </div>
          ) : (
            <div className="st-3" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 12,
            }}>
              {filtered.map((s, i) => {
                const name  = s.user?.name  || s.name  || "—";
                const email = s.user?.email || s.email || "—";
                const phone = s.user?.phone || s.phone || "—";
                const grp   = getGroupName(s.groupId);
                const rowBg = D ? "rgba(66,122,67,0.08)" : "rgba(66,122,67,0.04)";

                return (
                  <div key={s.id || s._id} className="st-card" style={{
                    background: card, border: `1px solid ${bord}`,
                    borderRadius: 18, overflow: "hidden",
                    boxShadow: D ? "none" : "0 2px 14px rgba(66,122,67,0.07)",
                    animation: `st-up 0.5s ease ${0.04 + i * 0.04}s both`,
                  }}>
                    <div style={{ height: 3, background: `linear-gradient(90deg,${BRAND_DIM},${BRAND_L})` }} />
                    <div style={{ padding: "16px 16px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={name} size={40} />
                          <div>
                            <p style={{ fontSize: 15, color: tx, fontWeight: 500, lineHeight: 1.2 }}>{name}</p>
                            {grp && (
                              <span style={{ fontSize: 10, color: BRAND, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                                <Layers size={9} /> {grp}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="st-btn" onClick={() => openEdit(s)} style={{
                            width: 30, height: 30, borderRadius: 9,
                            background: "rgba(66,122,67,0.09)", color: BRAND,
                          }}><Edit3 size={13} /></button>
                          <button className="st-btn" onClick={() => setDeleteTarget(s.id || s._id)} style={{
                            width: 30, height: 30, borderRadius: 9,
                            background: "rgba(239,68,68,0.08)", color: "#ef4444",
                          }}><Trash2 size={13} /></button>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                        {[[Mail, email], [Phone, phone]].map(([Icon, val]) =>
                          val && val !== "—" ? (
                            <div key={val} style={{
                              display: "flex", alignItems: "center", gap: 7,
                              padding: "7px 10px", borderRadius: 9, background: rowBg,
                            }}>
                              <Icon size={11} color={BRAND} />
                              <span style={{ fontSize: 12, color: mu, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {val}
                              </span>
                            </div>
                          ) : null
                        )}
                      </div>

                      <StatusBadge active={s.status === "active"} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loading={modalLoading}
        error={formError}
        groups={groups}
        groupsLoading={groupsLoading}
        D={D}
      />
      <DeleteModal
        target={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        D={D}
      />
    </>
  );
}