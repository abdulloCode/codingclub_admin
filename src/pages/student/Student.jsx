import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Users, Plus, Search, Edit3, Trash2,
  Mail, Phone, RefreshCw, X, Save, BookOpen,
  CheckCircle, XCircle, Filter,
  AlertTriangle, UserCheck, Wallet,
  ArrowUpRight, Eye, EyeOff, Lock, GraduationCap,
} from 'lucide-react';

/* ─── TOKENS ─────────────────────────────────────────────────── */
const BRAND     = "#427A43";
const BRAND_L   = "#5a9e5b";
const BRAND_DIM = "#2d5630";

const INIT  = {
  name: "", email: "", phone: "", password: "",
  groupId: "", status: "active",
};

/* ─── HELPERS ────────────────────────────────────────────────── */
const nameOf  = s => s?.user?.name  || s?.name  || "—";
const emailOf = s => s?.user?.email || s?.email || "—";
const phoneOf = s => s?.user?.phone || s?.phone || "—";
const normArr = v => Array.isArray(v) ? v : (v?.students || v?.data || []);

/* ─── STYLES ─────────────────────────────────────────────────── */
const GStyles = ({ D }) => (
  <style>{`
    .as-root { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(66,122,67,0.22); border-radius: 99px; }

    @keyframes as-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    @keyframes as-in   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    @keyframes as-spin { to{transform:rotate(360deg)} }
    @keyframes as-blnk { 0%,100%{opacity:1} 50%{opacity:.35} }
    @keyframes as-tst  { from{opacity:0;transform:translateY(10px) scale(.95)} to{opacity:1;transform:none} }

    .as-1 { animation: as-up .5s ease .04s both; }
    .as-2 { animation: as-up .5s ease .10s both; }
    .as-3 { animation: as-up .5s ease .17s both; }
    .as-modal { animation: as-in .26s cubic-bezier(.34,1.56,.64,1) both; }
    .as-toast { animation: as-tst .28s ease both; }

    .as-card {
      transition: transform .24s cubic-bezier(.34,1.56,.64,1),
                  box-shadow .24s, border-color .18s;
    }
    .as-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 10px 28px rgba(66,122,67,0.13);
      border-color: rgba(66,122,67,0.28) !important;
    }

    .as-btn {
      cursor:pointer; border:none;
      display:flex; align-items:center; justify-content:center; gap:7px;
      transition: transform .2s cubic-bezier(.34,1.56,.64,1), opacity .14s;
    }
    .as-btn:hover  { transform: scale(1.06); }
    .as-btn:active { transform: scale(.96); }
    .as-btn:disabled { opacity:.55; cursor:not-allowed; transform:none!important; }

    .as-inp {
      width:100%; font-size:13px;
      outline:none; transition: border-color .18s, box-shadow .18s;
    }
    .as-inp:focus {
      border-color: ${BRAND} !important;
      box-shadow: 0 0 0 3px rgba(66,122,67,0.13) !important;
    }

    .as-spin { animation: as-spin .85s linear infinite; }
    .as-blnk { animation: as-blnk 1.8s ease-in-out infinite; }
    .as-tab  { cursor:pointer; transition:all .18s; white-space:nowrap; }
  `}</style>
);

/* ─── COUNT UP ───────────────────────────────────────────────── */
function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  const r = useRef();
  useEffect(() => {
    cancelAnimationFrame(r.current);
    const s = performance.now();
    const t = (now) => {
      const p = Math.min((now - s) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) r.current = requestAnimationFrame(t);
    };
    r.current = requestAnimationFrame(t);
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
    <span className="as-blnk" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase",
      color:       active ? "#22c55e" : "#ef4444",
      background:  active ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
      border:      `1px solid ${active ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%",
                     background: active ? "#22c55e" : "#ef4444", display: "inline-block" }} />
      {active ? "Faol" : "Nofaol"}
    </span>
  );
}

function BalanceBadge({ balance }) {
  const isNegative = balance < 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      color:       isNegative ? "#ef4444" : "#22c55e",
      background:  isNegative ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
      border:      `1px solid ${isNegative ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
    }}>
      <Wallet size={9} />
      {balance.toLocaleString('uz-UZ')} UZS
    </span>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div className="as-toast" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 16, backdropFilter: "blur(16px)",
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
    <div className="as-card" style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 18,
      padding: "18px 20px",
      boxShadow: D ? "none" : "0 2px 14px rgba(66,122,67,0.07)",
      animation: `as-up 0.5s ease ${delay}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: pale,
                      border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={color} />
        </div>
        <ArrowUpRight size={13} color={mu} />
      </div>
      <p style={{ fontSize: 32, color, lineHeight: 1, marginBottom: 4, fontWeight: 500 }}>{n}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: mu, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
    </div>
  );
}

/* ─── STUDENT MODAL ──────────────────────────────────────────── */
function StudentModal({ isOpen, onClose, isEditing, form, groups, onChange, onSubmit, saving, err, D }) {
  const [showPass, setShowPass] = useState(false);
  if (!isOpen) return null;

  const card  = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord  = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const inpBg = D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.04)";
  const inp   = { background: inpBg, border: `1px solid ${bord}`, borderRadius: 12, padding: "11px 14px", color: tx, fontSize: 13 };
  const lbl   = { display: "block", fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="as-modal" style={{
        width: "100%", maxWidth: 560, borderRadius: 28,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${bord}`,
          borderRadius: "28px 28px 0 0", flexShrink: 0,
          background: `linear-gradient(135deg,${BRAND_DIM}f2,${BRAND_L}d8)`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -28, right: -18, width: 100, height: 100,
                        borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
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
              <h2 style={{ fontSize: 20, color: "#fff", fontWeight: 400 }}>
                {isEditing ? "Tahrirlash" : "Yangi o'quvchi"}
              </h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.58)", marginTop: 1 }}>
                {isEditing ? "Ma'lumotlarni yangilang" : "Yangi o'quvchini ro'yxatdan o'tkazing"}
              </p>
            </div>
          </div>
          <button className="as-btn" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 99,
            background: "rgba(0,0,0,0.22)", color: "#fff", position: "relative", zIndex: 1,
          }}><X size={14} /></button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                          borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{err}</span>
            </div>
          )}

          {/* Ism */}
          <div>
            <label style={lbl}>To'liq ism <span style={{ color: "#ef4444" }}>*</span></label>
            <input required className="as-inp" placeholder="Ism Familiya"
                   name="name" value={form.name} onChange={onChange} style={inp} />
          </div>

          {/* Email + Telefon */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Email <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Mail size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input required type="email" className="as-inp" placeholder="email@example.com"
                       name="email" value={form.email} onChange={onChange}
                       style={{ ...inp, paddingLeft: 34 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Telefon <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Phone size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input required className="as-inp" placeholder="+998 90 123 45 67"
                       name="phone" value={form.phone} onChange={onChange}
                       style={{ ...inp, paddingLeft: 34 }} />
              </div>
            </div>
          </div>

          {/* Parol */}
          {!isEditing && (
            <div>
              <label style={lbl}>Parol <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Lock size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input required type={showPass ? "text" : "password"} className="as-inp"
                       placeholder="Kamida 8 belgi"
                       name="password" value={form.password} onChange={onChange}
                       style={{ ...inp, paddingLeft: 34, paddingRight: 38 }} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: mu,
                }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Guruh */}
          <div>
            <label style={lbl}>Guruh</label>
            <select className="as-inp" name="groupId"
                    value={form.groupId} onChange={onChange}
                    style={{ ...inp, cursor: "pointer", appearance: "none" }}>
              <option value="">Guruh tanlang</option>
              {groups && groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Holat */}
          <div>
            <label style={lbl}>Holat</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...inp, padding: "11px 14px" }}>
              <span style={{ fontSize: 13, fontWeight: 700,
                             color: form.status === "active" ? "#22c55e" : mu }}>
                {form.status === "active" ? "✅ Faol" : "❌ Nofaol"}
              </span>
              <button type="button" onClick={() => onChange({ target: { name: "status", value: form.status === "active" ? "inactive" : "active" } })}
                      style={{
                        width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                        background: form.status === "active"
                          ? `linear-gradient(135deg,${BRAND},${BRAND_L})`
                          : "rgba(0,0,0,0.15)",
                        position: "relative", transition: "background .25s", flexShrink: 0,
                      }}>
                <span style={{
                  position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  transition: "left .25s", left: form.status === "active" ? 22 : 2,
                }} />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" className="as-btn" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 14,
              background: "transparent", border: `1px solid ${bord}`,
              fontSize: 13, fontWeight: 700, color: mu,
            }}>Bekor</button>
            <button type="submit" className="as-btn" disabled={saving} style={{
              flex: 2, padding: "12px", borderRadius: 14,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 16px rgba(66,122,67,0.30)",
            }}>
              {saving
                ? <><RefreshCw size={14} className="as-spin" /> Saqlanmoqda...</>
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
      <div className="as-modal" style={{
        width: "100%", maxWidth: 340, borderRadius: 24,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        padding: "26px 26px 22px", textAlign: "center",
      }}>
        <div style={{ width: 52, height: 52, borderRadius: 16,
                      background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)",
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 19, color: tx, marginBottom: 8, fontWeight: 400 }}>O'quvchini o'chirish</h3>
        <p style={{ fontSize: 13, color: mu, lineHeight: 1.65, marginBottom: 22 }}>
          Bu o'quvchi tizimdan butunlay o'chiriladi. Bu amalni bekor qilib bo'lmaydi.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="as-btn" onClick={onCancel} style={{
            flex: 1, padding: "11px", borderRadius: 13,
            background: "transparent", border: `1px solid ${bord}`,
            fontSize: 13, fontWeight: 700, color: mu,
          }}>Bekor</button>
          <button className="as-btn" onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 13,
            background: "rgba(239,68,68,0.90)", border: "none",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function AdminStudents() {
  const { user }          = useAuth();
  const { isDarkMode: D } = useTheme();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [students,      setStudents]      = useState([]);
  const [groups,        setGroups]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterGroup,   setFilterGroup]   = useState("all");
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [form,          setForm]          = useState(INIT);
  const [saving,        setSaving]        = useState(false);
  const [formErr,       setFormErr]       = useState("");
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [toast,         setToast]         = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sData, gData] = await Promise.all([
        apiService.getStudents(),
        apiService.getGroups(),
      ]);
      setStudents(normArr(sData));
      // Guruhlar ro'yxatini to'g'rilash
      let normalizedGroups = [];
      if (Array.isArray(gData)) {
        normalizedGroups = gData;
      } else if (gData?.groups && Array.isArray(gData.groups)) {
        normalizedGroups = gData.groups;
      } else if (gData?.data && Array.isArray(gData.data)) {
        normalizedGroups = gData.data;
      }
      setGroups(normalizedGroups);
    } catch (e) {
      showToast(e.message || "Yuklashda xatolik", "error");
      } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = useCallback(() => {
    setForm(INIT); setIsEditing(false); setFormErr(""); setIsModalOpen(true);
  }, []);

  const openEdit = useCallback(s => {
    setForm({
      id: s.id, name: nameOf(s), email: emailOf(s), phone: phoneOf(s), password: "",
      groupId: s.groupId || "", status: s.status || "active",
    });
    setIsEditing(true); setFormErr(""); setIsModalOpen(true);
  }, []);

  const handleChange = useCallback(e => {
    const name  = e.target.name;
    const value = e.target.value;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async e => {
    e.preventDefault(); setFormErr("");
    if (!form.name.trim())            { setFormErr("Ism kiriting"); return; }
    if (!form.email)                  { setFormErr("Email kiriting"); return; }
    if (!form.phone)                  { setFormErr("Telefon kiriting"); return; }
    if (!isEditing && !form.password) { setFormErr("Parol kiriting"); return; }

    const payload = {
      name: form.name.trim(), email: form.email,
      phone: form.phone.replace(/\D/g, ""),
      groupId: form.groupId || null,
      status: form.status,
      ...(!isEditing && { password: form.password }),
    };
    setSaving(true);
    try {
      if (isEditing) {
        await apiService.updateStudent(form.id, payload);
        setStudents(ss => ss.map(s => s.id === form.id ? { ...s, ...payload } : s));
        showToast("O'quvchi yangilandi");
      } else {
        const res = await apiService.createStudent(payload);
        setStudents(ss => [res?.student || res, ...ss]);
        showToast("Yangi o'quvchi qo'shildi");
      }
      setIsModalOpen(false);
    } catch (e) {
      setFormErr(e.message || "Xatolik");
    } finally {
      setSaving(false);
    }
  }, [form, isEditing, showToast]);

  const confirmDelete = useCallback(async () => {
    try {
      await apiService.deleteStudent(deleteTarget);
      setStudents(ss => ss.filter(s => s.id !== deleteTarget));
      if (detailStudent?.id === deleteTarget) setDetailStudent(null);
      setDeleteTarget(null);
      showToast("O'quvchi o'chirildi");
    } catch (e) {
      showToast(e.message || "Xatolik", "error");
      setDeleteTarget(null);
    }
  }, [deleteTarget, detailStudent, showToast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      const ok1 = !q || nameOf(s).toLowerCase().includes(q) || emailOf(s).toLowerCase().includes(q);
      const ok2 = filterGroup === "all" || s.groupId === filterGroup;
      return ok1 && ok2;
    });
  }, [students, search, filterGroup]);

  const totalActive = useMemo(() => students.filter(s => s.status === "active").length, [students]);
  const totalDebt = useMemo(() => students.filter(s => (s.balance || 0) < 0).length, [students]);

  /* Theme */
  const bg   = D ? "#0a0a0b" : "#f0f4f0";
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <>
      <GStyles D={D} />
      <div className="as-root" style={{ background: bg, minHeight: "100%" }}>
        <Toast msg={toast?.msg} type={toast?.type} />

        {/* ── PAGE HEADER ── */}
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
            <button className="as-btn" onClick={fetchData} style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`, color: BRAND,
            }}>
              <RefreshCw size={13} className={loading ? "as-spin" : ""} />
            </button>
            {isAdmin && (
              <button className="as-btn" onClick={openAdd} style={{
                padding: "8px 14px", borderRadius: 11,
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                color: "#fff", fontSize: 13, fontWeight: 700,
                boxShadow: "0 4px 14px rgba(66,122,67,0.28)",
              }}>
                <Plus size={14} /> Qo'shish
              </button>
            )}
          </div>
        </div>

        {/* ── FULL SCREEN TABLE VIEW ── */}
        <div style={{ padding: "16px 24px 40px" }}>

          {/* Stats */}
          <div className="as-1" style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16,
          }}>
            <StatCard label="Jami"         value={students.length}  icon={Users}      color={BRAND}   pale="rgba(66,122,67,0.10)"  D={D} delay={0.04} />
            <StatCard label="Faol"         value={totalActive}      icon={UserCheck}  color="#22c55e" pale="rgba(34,197,94,0.10)"  D={D} delay={0.10} />
            <StatCard label="Qarzdor"      value={totalDebt}        icon={Wallet}     color="#ef4444" pale="rgba(239,68,68,0.10)"  D={D} delay={0.16} />
            <StatCard label="Guruhlar"     value={groups.length}    icon={BookOpen}   color="#f59e0b" pale="rgba(245,158,11,0.10)" D={D} delay={0.22} />
          </div>

          {/* Filter bar */}
          <div className="as-2" style={{
            display: "flex", gap: 7, overflowX: "auto", marginBottom: 14,
            padding: "8px 12px", borderRadius: 14,
            background: card, border: `1px solid ${bord}`,
          }}>
            <button className="as-tab" onClick={() => setFilterGroup("all")} style={{
              padding: "6px 12px", borderRadius: 9, border: "none", cursor: "pointer", flexShrink: 0,
              background: filterGroup === "all" ? `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})` : "transparent",
              color: filterGroup === "all" ? "#fff" : mu,
              fontSize: 12, fontWeight: 700,
              boxShadow: filterGroup === "all" ? "0 3px 10px rgba(66,122,67,0.25)" : "none",
            }}>Barchasi</button>

            {groups.map(g => {
              const act = filterGroup === g.id;
              return (
                <button key={g.id} className="as-tab" onClick={() => setFilterGroup(g.id)} style={{
                  padding: "6px 10px", borderRadius: 9, border: "none", cursor: "pointer", flexShrink: 0,
                  background: act ? "rgba(66,122,67,0.10)" : "transparent",
                  color: act ? BRAND : mu,
                  fontSize: 11, fontWeight: 700,
                  outline: act ? `1.5px solid ${BRAND}40` : "none",
                }}>
                  {g.name}
                </button>
              );
            })}

            <span style={{ marginLeft: "auto", fontSize: 11, color: mu, fontWeight: 600, flexShrink: 0 }}>
              {filtered.length} natija
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <GraduationCap size={20} color="#fff" className="as-spin" />
              </div>
              <p style={{ fontSize: 17, color: BRAND }}>Yuklanmoqda...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="as-3" style={{ textAlign: "center", paddingTop: 56 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: "rgba(66,122,67,0.08)", border: "1px solid rgba(66,122,67,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
              }}>
                <GraduationCap size={24} color={BRAND} />
              </div>
              <p style={{ fontSize: 20, color: tx, marginBottom: 8, fontWeight: 400 }}>
                {students.length === 0 ? "Hali o'quvchi yo'q" : "Topilmadi"}
              </p>
              <p style={{ fontSize: 13, color: mu, marginBottom: 18 }}>
                {search ? `"${search}" bo'yicha natija yo'q` : "Birinchi o'quvchini qo'shing"}
              </p>
              {isAdmin && !search && (
                <button className="as-btn" onClick={openAdd} style={{
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
            <div className="as-3" style={{ background: card, border: `1px solid ${bord}`, borderRadius: 20, padding: "20px", overflow: "hidden" }}>
              {/* Full Screen Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${bord}` }}>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>№</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ism</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Telefon</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Guruh</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Balans</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Holat</th>
                      <th style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: mu, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => {
                      const n = nameOf(s);
                      const groupName = s.groupId && groups
                        ? groups.find(g => g.id === s.groupId)?.name || "—"
                        : "—";
                      const isSelected = detailStudent?.id === s.id;
                      return (
                        <tr
                          key={s.id}
                          onClick={() => setDetailStudent(isSelected ? null : s)}
                          style={{
                            borderBottom: `1px solid ${bord}`,
                            transition: "all 0.2s",
                            cursor: "pointer",
                            background: isSelected ? `${BRAND}12` : "transparent",
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.background = D ? "rgba(66,122,67,0.06)" : "rgba(66,122,67,0.04)";
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td style={{ padding: "12px 14px", color: mu, fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar name={n} size={32} />
                              <span style={{ fontWeight: 600, color: tx }}>{n}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", color: mu, fontSize: 12 }}>{emailOf(s)}</td>
                          <td style={{ padding: "12px 14px", color: mu, fontSize: 12 }}>{phoneOf(s)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 8,
                              background: groupName !== "—" ? "rgba(66,122,67,0.10)" : "transparent",
                              color: groupName !== "—" ? BRAND : mu,
                              fontSize: 11, fontWeight: 700,
                              border: groupName !== "—" ? `1px solid ${BRAND}30` : "none",
                            }}>
                              {groupName}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <BalanceBadge balance={s.balance || 0} />
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <StatusBadge active={s.status === "active"} />
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                              {isAdmin && (
                                <>
                                  <button className="as-btn" onClick={() => openEdit(s)} style={{
                                    padding: "6px 10px", borderRadius: 8,
                                    background: "rgba(66,122,67,0.10)", color: BRAND,
                                    fontSize: 11, fontWeight: 700,
                                    border: `1px solid ${BRAND}25`,
                                  }}>
                                    <Edit3 size={11} />
                                  </button>
                                  <button className="as-btn" onClick={() => setDeleteTarget(s.id)} style={{
                                    padding: "6px 10px", borderRadius: 8,
                                    background: "rgba(239,68,68,0.08)", color: "#ef4444",
                                    fontSize: 11, fontWeight: 700,
                                    border: "1px solid rgba(239,68,68,0.18)",
                                  }}>
                                    <Trash2 size={11} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Full Screen Detail Panel */}
        {detailStudent && (
          <div onClick={() => setDetailStudent(null)} style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            animation: "as-in 0.25s ease both",
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: "100%", maxWidth: 700, borderRadius: 28,
              background: card, border: `1px solid ${bord}`,
              boxShadow: "0 40px 100px rgba(0,0,0,0.40)",
              maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                padding: "24px 28px",
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                position: "relative",
              }}>
                <button className="as-btn" onClick={() => setDetailStudent(null)} style={{
                  position: "absolute", top: 16, right: 16,
                  width: 36, height: 36, borderRadius: 12,
                  background: "rgba(255,255,255,0.20)", backdropFilter: "blur(10px)",
                  color: "#fff",
                }}>
                  <X size={16} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Avatar name={nameOf(detailStudent)} size={64} />
                  <div>
                    <p style={{ fontSize: 24, color: "#fff", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>
                      {nameOf(detailStudent)}
                    </p>
                    <BalanceBadge balance={detailStudent.balance || 0} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "24px 28px", overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {[
                    { icon: Mail, label: "Email", val: emailOf(detailStudent) },
                    { icon: Phone, label: "Telefon", val: phoneOf(detailStudent) },
                    { icon: BookOpen, label: "Guruh", val: detailStudent.groupId && groups ? groups.find(g => g.id === detailStudent.groupId)?.name || "—" : "—" },
                    { icon: Wallet, label: "Balans", val: `${(detailStudent.balance || 0).toLocaleString('uz-UZ')} UZS` },
                  ].map(({ icon: Ic, label, val }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 14,
                      background: D ? "rgba(66,122,67,0.08)" : "rgba(66,122,67,0.05)",
                      border: `1px solid ${bord}`,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "rgba(66,122,67,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Ic size={15} color={BRAND} />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: 14, color: tx, fontWeight: 600 }}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <StatusBadge active={detailStudent.status === "active"} />
                </div>

                {isAdmin && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="as-btn" onClick={() => { openEdit(detailStudent); setDetailStudent(null); }} style={{
                      flex: 1, padding: "12px", borderRadius: 13,
                      background: "rgba(66,122,67,0.10)", border: `1px solid ${BRAND}30`,
                      fontSize: 13, fontWeight: 700, color: BRAND,
                    }}>
                      <Edit3 size={14} /> Tahrirlash
                    </button>
                    <button className="as-btn" onClick={() => { setDeleteTarget(detailStudent.id); setDetailStudent(null); }} style={{
                      flex: 1, padding: "12px", borderRadius: 13,
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                      fontSize: 13, fontWeight: 700, color: "#ef4444",
                    }}>
                      <Trash2 size={14} /> O'chirish
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <StudentModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        isEditing={isEditing} form={form} groups={groups} onChange={handleChange}
        onSubmit={handleSubmit} saving={saving} err={formErr} D={D}
      />
      <DeleteModal
        target={deleteTarget} onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)} D={D}
      />
    </>
  );
}