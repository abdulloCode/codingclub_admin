import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import SharedCodeEditor from '../components/SharedCodeEditor';
import {
  GraduationCap, Plus, Search, Edit3, Trash2,
  Mail, Phone, RefreshCw, X, Save,
  CheckCircle, XCircle,
  AlertTriangle, Users, UserCheck,
  Layers, Lock, Eye, EyeOff, BookOpen, Code2,
} from 'lucide-react';

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

/* ─── STYLES ─────────────────────────────────────────────────── */
const GStyles = () => (
  <style>{`
    .st-root { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(66,122,67,0.22); border-radius: 99px; }

    @keyframes st-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    @keyframes st-in { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    @keyframes st-spin { to{transform:rotate(360deg)} }
    @keyframes st-blnk { 0%,100%{opacity:1} 50%{opacity:.35} }

    .st-1 { animation: st-up .5s ease .04s both; }
    .st-2 { animation: st-up .5s ease .10s both; }
    .st-3 { animation: st-up .5s ease .17s both; }
    .st-modal { animation: st-in .26s cubic-bezier(.34,1.56,.64,1) both; }
    .st-toast { animation: st-up .28s ease both; }
    .st-spin { animation: st-spin .85s linear infinite; }
    .st-blnk { animation: st-blnk 1.8s ease-in-out infinite; }
    .st-tab { cursor: pointer; transition: all .18s; white-space: nowrap; }

    .st-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .st-table th {
      text-align: left;
      padding: 14px 12px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      border-bottom: 1px solid;
    }
    .st-table td {
      padding: 14px 12px;
      border-bottom: 1px solid;
      vertical-align: middle;
    }
    .st-table tbody tr {
      transition: background 0.18s;
    }
    .st-table tbody tr:hover {
      background: rgba(66,122,67,0.04);
    }
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
  }, [target, dur]);
  return v;
}

/* ─── SMALL COMPONENTS ───────────────────────────────────────── */
function Avatar({ name, size = 32 }) {
  const ini = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.32,
      boxShadow: "0 2px 8px rgba(66,122,67,0.25)",
    }}>{ini}</div>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
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

function StatCard({ label, value, icon, color, pale, D, delay = 0 }) {
  const n = useCountUp(value);
  return (
    <div style={{
      background: D ? "rgba(22,22,24,0.95)" : "#fff",
      border: `1px solid ${D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)"}`,
      borderRadius: 18, padding: "18px 20px",
      animation: `st-up 0.5s ease ${delay}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: pale,
          border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {icon && <icon size={17} color={color} />}
        </div>
      </div>
      <p style={{ fontSize: 32, fontWeight: 500, color, lineHeight: 1, marginBottom: 4 }}>{n}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
    </div>
  );
}

/* ─── STUDENT MODAL ──────────────────────────────────────────── */
function StudentModal({ isOpen, onClose, isEditing, form, setForm, onSubmit, loading, error, groups, groupsLoading, D }) {
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowPass(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const card = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const inpBg = D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.04)";
  const inp = {
    background: inpBg, border: `1px solid ${bord}`,
    borderRadius: 12, padding: "11px 14px", color: tx, fontSize: 13,
  };
  const lbl = {
    display: "block", fontSize: 10, fontWeight: 800, color: mu,
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
  };

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="st-modal" style={{
        width: "100%", maxWidth: 520, borderRadius: 26,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "18px 22px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${bord}`,
          background: `linear-gradient(135deg,${BRAND_DIM}f2,${BRAND_L}d8)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: "rgba(255,255,255,0.20)", backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isEditing ? <Edit3 size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: "#fff", fontWeight: 500 }}>
                {isEditing ? "Tahrirlash" : "Yangi o'quvchi"}
              </h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.58)" }}>
                {isEditing ? "Ma'lumotlarni yangilang" : "Yangi talabani ro'yxatdan o'tkazing"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 99, background: "rgba(0,0,0,0.22)",
            border: "none", cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} /></button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
              borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <div>
            <label style={lbl}>To'liq ism <span style={{ color: "#ef4444" }}>*</span></label>
            <input required placeholder="Ism Familiya" value={form.name} onChange={set("name")} style={{ ...inp, width: "100%" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Email <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Mail size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input required type="email" placeholder="email@example.com" value={form.email} onChange={set("email")} style={{ ...inp, paddingLeft: 34, width: "100%" }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Telefon <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Phone size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input required placeholder="+998 90 123 45 67" value={form.phone} onChange={set("phone")} style={{ ...inp, paddingLeft: 34, width: "100%" }} />
              </div>
            </div>
          </div>

          <div>
            <label style={lbl}>{isEditing ? "Yangi parol (ixtiyoriy)" : <>Parol <span style={{ color: "#ef4444" }}>*</span></>}</label>
            <div style={{ position: "relative" }}>
              <Lock size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
              <input
                required={!isEditing}
                type={showPass ? "text" : "password"}
                placeholder={isEditing ? "O'zgartirmoqchi bo'lsangiz kiriting" : "Kamida 6 ta belgi"}
                value={form.password}
                onChange={set("password")}
                style={{ ...inp, paddingLeft: 34, paddingRight: 38, width: "100%" }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: mu,
              }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label style={lbl}>Guruh (ixtiyoriy)</label>
            <div style={{ position: "relative" }}>
              <Layers size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select value={form.groupId} onChange={set("groupId")} style={{ ...inp, paddingLeft: 34, cursor: "pointer", width: "100%" }}>
                <option value="">— Guruh tanlanmagan —</option>
                {groupsLoading
                  ? <option disabled>Yuklanmoqda...</option>
                  : groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...inp, padding: "11px 14px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: form.status === "active" ? "#22c55e" : mu }}>
              {form.status === "active" ? "✅ Faol" : "❌ Nofaol"}
            </span>
            <button type="button" onClick={() => setForm(prev => ({ ...prev, status: prev.status === "active" ? "inactive" : "active" }))} style={{
              width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
              background: form.status === "active" ? `linear-gradient(135deg,${BRAND},${BRAND_L})` : "rgba(0,0,0,0.15)",
              position: "relative", transition: "background .25s",
            }}>
              <span style={{
                position: "absolute", top: 2, width: 20, height: 20,
                borderRadius: "50%", background: "#fff", transition: "left .25s",
                left: form.status === "active" ? 22 : 2,
              }} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 13, background: "transparent",
              border: `1px solid ${bord}`, fontSize: 13, fontWeight: 700, color: mu, cursor: "pointer",
            }}>Bekor</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: "12px", borderRadius: 13,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}>
              {loading
                ? <><RefreshCw size={14} className="st-spin" /> Saqlanmoqda...</>
                : <><Save size={14} /> {isEditing ? "Saqlash" : "Qo'shish"}</>
              }
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
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(0,0,0,0.60)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="st-modal" style={{
        width: "100%", maxWidth: 340, borderRadius: 22,
        background: card, border: `1px solid ${bord}`,
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
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px", borderRadius: 12, background: "transparent",
            border: `1px solid ${bord}`, fontSize: 13, fontWeight: 700, color: mu, cursor: "pointer",
          }}>Bekor</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 12,
            background: "rgba(239,68,68,0.90)", fontSize: 13, fontWeight: 700, color: "#fff",
            border: "none", cursor: "pointer",
          }}>O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ────────────────────────────────────────────────── */

/**
 * API response'dan student ID ni xavfsiz olish.
 * Backend { message, student: { id, userId, status }, user: {...} } qaytaradi.
 */
function extractStudentId(res) {
  return (
    res?.student?.id   ||
    res?.student?._id  ||
    res?.id            ||
    res?._id           ||
    null
  );
}

/**
 * Student ma'lumotlaridan joriy groupId ni xavfsiz olish.
 */
function extractGroupId(student) {
  return (
    student?.groupId   ||
    student?.group?.id ||
    student?.group?._id||
    null
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function Student() {
  const { isDarkMode: D } = useTheme();

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [currentStudentCode, setCurrentStudentCode] = useState("");
  const [currentStudentName, setCurrentStudentName] = useState("");

  const submittingRef = useRef(false);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      console.log("🔍 FETCH STUDENTS START");
      setLoading(true);
      const res = await apiService.getStudents();
      console.log("📋 Students API response:", res);
      const studentsData = Array.isArray(res) ? res : res?.students ?? [];
      console.log("👥 Students count:", studentsData.length);
      setStudents(studentsData);
      console.log("✅ FETCH STUDENTS END");
    } catch (err) {
      console.error("❌ FETCH STUDENTS ERROR:", err);
      showToast(err.message || "Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchGroups = useCallback(async () => {
    try {
      console.log("🔍 FETCH GROUPS START");
      setGroupsLoading(true);
      const res = await apiService.getGroups();
      console.log("📋 Groups API response:", res);
      const all = Array.isArray(res) ? res : res?.groups ?? [];
      console.log("👥 Groups count:", all.length);
      setGroups(all.filter(g => g.status === "active" || !g.status));
      console.log("✅ FETCH GROUPS END");
    } catch (err) {
      console.error("❌ FETCH GROUPS ERROR:", err);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      console.log("🗑️ DELETE STUDENT START, ID:", deleteTarget);
      await apiService.deleteStudent(deleteTarget);
      setStudents(prev => prev.filter(s => s.id !== deleteTarget && s._id !== deleteTarget));
      setDeleteTarget(null);
      showToast("O'quvchi o'chirildi", "success");
      console.log("✅ DELETE STUDENT SUCCESS");
      fetchStudents();
    } catch (err) {
      console.error("❌ DELETE STUDENT ERROR:", err);
      showToast("O'chirishda xatolik", "error");
      setDeleteTarget(null);
    }
  }, [deleteTarget, fetchStudents, showToast]);

  const handleCheckTask = useCallback((student) => {
    const studentCode = localStorage.getItem(`studentCode_${student.user?.name || student.name}`);
    setCurrentStudentName(student.user?.name || student.name);
    setCurrentStudentCode(studentCode || "// Talabaning hozircha kodini shu yerga yozing...");
    setCodeEditorOpen(true);
  }, []);

  useEffect(() => {
    console.log("🚀 STUDENT MANAGEMENT PAGE LOADING");
    console.log("🔍 FETCHING INITIAL DATA");
    fetchStudents();
    fetchGroups();
  }, [fetchStudents, fetchGroups]);

  const getGroupName = useCallback(id => groups.find(g => g.id === id)?.name ?? null, [groups]);
  const getCourseName = useCallback(() => "Kiberxavfsizlik", []);

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
      groupId:  extractGroupId(s) || "",
    });
    setIsEditing(true);
    setSelectedStudent(s);
    setFormError("");
    setIsModalOpen(true);
  }, []);

  /* ─── FIX: guruh biriktirish mantig'i ──────────────────────
   *
   * Muammo 1: createStudent dan qaytgan studentId undefined bo'lishi mumkin edi.
   *           extractStudentId() helper bilan barcha response variantlari qoplanadi.
   *
   * Muammo 2: "barcha guruhga biriktirilmoqda" — bu muammo yo'q edi aslida,
   *           lekin groupId string bo'lmasa (number yoki undefined) backend xato
   *           qaytarishi mumkin. assignGroupToStudent ichida String() cast bor,
   *           shuning uchun bu yerda ham qo'shimcha tekshiruv qo'shamiz.
   *
   * Muammo 3: "biriktrilmayabdi" — sababi studentId null yoki undefined bo'lsa
   *           assignGroupToStudent chaqirilmay o'tib ketardi (if shart o'tardi).
   *           Endi agar studentId olinmasa — yaqqol xato ko'rsatiladi.
   *
   * To'g'ri oqim:
   *   1. Student yaratiladi  →  API { student: { id } } qaytaradi
   *   2. extractStudentId()  →  id olinadi
   *   3. groupId tanlangan + id bor  →  assign-group chaqiriladi
   *   4. Xato bo'lsa  →  toast + console.error, lekin modal yopiladi
   * ─────────────────────────────────────────────────────────── */
 /* ─── TO'G'IRLANGAN HANDLESUBMIT ─────────────────────────────── */
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  if (submittingRef.current) return;
  setFormError("");
  console.log("📝 STUDENT FORM SUBMIT START");

  // 1. Validatsiya
  if (!form.name.trim()) { setFormError("Ism kiritilishi shart"); return; }
  if (!form.email.includes("@")) { setFormError("To'g'ri email kiriting"); return; }
  if (!form.phone.trim()) { setFormError("Telefon kiritilishi shart"); return; }
  if (!isEditing && form.password.length < 6) {
    setFormError("Parol kamida 6 ta belgi bo'lishi kerak");
    return;
  }

  submittingRef.current = true;
  setModalLoading(true);

  try {
    if (isEditing) {
      /* ── TAHRIRLASH ──────────────────────────────────────── */
      console.log("✏️ EDITING STUDENT:", selectedStudent);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
      };
      if (form.password) payload.password = form.password;
      console.log("📤 Edit payload:", payload);

      await apiService.updateStudent(selectedStudent.id, payload);
      console.log("✅ STUDENT UPDATED SUCCESSFULLY");

      const oldGroupId = extractGroupId(selectedStudent);
      const newGroupId = form.groupId;

      // Agar guruh o'zgargan bo'lsa yoki yangi biriktirilayotgan bo'lsa
      if (newGroupId && newGroupId !== oldGroupId) {
        console.log("🔄 ASSIGNING STUDENT TO GROUP:", { studentId: selectedStudent.id, groupId: newGroupId });
        await apiService.assignGroupToStudent(selectedStudent.id, newGroupId);
        console.log("✅ GROUP ASSIGNMENT SUCCESSFUL");
        showToast("Ma'lumotlar va guruh yangilandi");
      } else {
        console.log("✅ STUDENT UPDATED WITHOUT GROUP CHANGE");
        showToast("Ma'lumotlar yangilandi");
      }

    } else {
      /* ── YANGI STUDENT YARATISH ───────────────────────────── */
      console.log("➕ CREATING NEW STUDENT");
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      };
      console.log("📤 Create payload:", payload);

      // A. O'quvchini yaratish
      const res = await apiService.createStudent(payload);
      console.log("📋 Create API response:", res);

      // B. ID ni sug'urib olish (Documentation'ga moslab)
      const newStudentId = extractStudentId(res);
      console.log("🆔 New student ID:", newStudentId);

      if (!newStudentId) {
        throw new Error("O'quvchi yaratildi, lekin ID aniqlanmadi.");
      }

      showToast("O'quvchi muvaffaqiyatli yaratildi");
      console.log("✅ NEW STUDENT CREATED SUCCESSFULY");

      // C. AGAR guruh tanlangan bo'lsa, uni biriktirish
      if (form.groupId) {
        try {
          console.log("🔄 ASSIGNING TO GROUP:", { studentId: newStudentId, groupId: form.groupId });
          await apiService.assignGroupToStudent(newStudentId, form.groupId);
          console.log("✅ GROUP ASSIGNMENT SUCCESSFUL");
          showToast("O'quvchi guruhga biriktirildi");
        } catch (groupErr) {
          // Guruhga biriktirish xatosi o'quvchi yaratilishini to'xtatmasligi kerak
          console.error("❌ GROUP ASSIGNMENT ERROR:", groupErr);
          showToast("O'quvchi yaratildi, lekin guruhga biriktirishda xato: " + groupErr.message, "error");
        }
      }
    }

    // Modalni yopish va ro'yxatni yangilash
    setIsModalOpen(false);
    setForm(INIT_FORM);
    console.log("🔄 REFRESHING STUDENTS LIST AFTER SUBMIT");
    fetchStudents();

  } catch (err) {
    console.error("❌ SUBMIT FORM ERROR:", err);
    setFormError(err.message || "Amalni bajarishda xatolik");
  } finally {
    setModalLoading(false);
    setTimeout(() => { submittingRef.current = false; }, 500);
  }
}, [form, isEditing, selectedStudent, showToast, fetchStudents]);
/* --- FILTERED O'ZGARUVCHISINI E'LON QILISH --- */
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

  const totalActive = useMemo(() => students.filter(s => s.status === "active").length, [students]);

  const bg   = D ? "#0a0a0b" : "#f0f4f0";
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <>
      <GStyles />
      <div className="st-root" style={{ background: bg, minHeight: "100%" }}>
        <Toast msg={toast?.msg} type={toast?.type} />

        {/* HEADER */}
        <div style={{ padding: "18px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 18, color: BRAND, lineHeight: 1, fontWeight: 500 }}>O'quvchilar</p>
              <p style={{ fontSize: 10, color: mu, fontWeight: 600, marginTop: 2 }}>{students.length} ta o'quvchi</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
              borderRadius: 11,
              background: D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.06)",
              border: `1px solid ${bord}`,
            }}>
              <Search size={13} color={mu} />
              <input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 13, color: tx, width: 150, padding: 0,
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={12} color={mu} />
                </button>
              )}
            </div>

            <button onClick={fetchStudents} style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`,
              color: BRAND, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <RefreshCw size={13} className={loading ? "st-spin" : ""} />
            </button>

            <button onClick={openAdd} style={{
              padding: "8px 14px", borderRadius: 11,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              color: "#fff", fontSize: 13, fontWeight: 700,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Plus size={14} /> Qo'shish
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 24px 40px" }}>
          {/* Stats */}
          <div className="st-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
            <StatCard label="Jami"    value={students.length}              icon={Users}     color={BRAND}      pale="rgba(66,122,67,0.10)"  D={D} delay={0.04} />
            <StatCard label="Faol"    value={totalActive}                  icon={UserCheck} color="#22c55e"    pale="rgba(34,197,94,0.10)"  D={D} delay={0.10} />
            <StatCard label="Nofaol"  value={students.length - totalActive} icon={XCircle}   color="#ef4444"    pale="rgba(239,68,68,0.10)"  D={D} delay={0.16} />
          </div>

          {/* Filter tabs */}
          <div className="st-2" style={{
            display: "flex", gap: 7, overflowX: "auto", marginBottom: 14,
            padding: "8px 12px", borderRadius: 14, background: card, border: `1px solid ${bord}`,
          }}>
            {[["all", "Barchasi"], ["active", "Faol"], ["inactive", "Nofaol"]].map(([v, l]) => {
              const act = filterStatus === v;
              return (
                <button key={v} className="st-tab" onClick={() => setFilterStatus(v)} style={{
                  padding: "6px 12px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: act ? `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})` : "transparent",
                  color: act ? "#fff" : mu, fontSize: 12, fontWeight: 700,
                }}>{l}</button>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 11, color: mu, fontWeight: 600, alignSelf: "center" }}>
              {filtered.length} natija
            </span>
          </div>

          {/* TABLE */}
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
                background: "rgba(66,122,67,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
              }}>
                <GraduationCap size={24} color={BRAND} />
              </div>
              <p style={{ fontSize: 20, color: tx }}>
                {students.length === 0 ? "Hali o'quvchi qo'shilmagan" : "Hech narsa topilmadi"}
              </p>
              <button onClick={openAdd} style={{
                marginTop: 18, padding: "10px 20px", borderRadius: 12,
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                color: "#fff", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Plus size={14} /> O'quvchi qo'shish
              </button>
            </div>
          ) : (
            <div className="st-3" style={{ overflowX: "auto", borderRadius: 16, background: card, border: `1px solid ${bord}` }}>
              <table className="st-table" style={{ minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${bord}` }}>
                    <th style={{ color: mu }}>T/R</th>
                    <th style={{ color: mu }}>F.I.SH. va TELEFON</th>
                    <th style={{ color: mu }}>KURS NOMI</th>
                    <th style={{ color: mu }}>GURUH NOMI</th>
                    <th style={{ color: mu }}>O'QITUVCHI</th>
                    <th style={{ color: mu, width: 100 }}>O'RTACHA BAHO</th>
                    <th style={{ color: mu, width: 100 }}>STATUS</th>
                    <th style={{ color: mu, width: 140 }}>AMALLAR</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => {
                    const name       = s.user?.name  || s.name  || "—";
                    const phone      = s.user?.phone || s.phone || "—";
                    const groupId    = extractGroupId(s);
                    const groupName  = getGroupName(groupId) || "—";
                    const courseName = getCourseName();
                    const teacherName = s.teacherName || s.teacher?.name || s.teacher?.user?.name || null;

                    return (
                      <tr key={s.id || s._id}>
                        <td style={{ color: mu, fontWeight: 600 }}>{idx + 1}</td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={name} size={36} />
                            <div>
                              <div style={{ fontWeight: 600, color: tx }}>{name}</div>
                              <div style={{ fontSize: 11, color: mu, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                <Phone size={10} /> {phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{
                            background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                            color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                          }}>{courseName}</span>
                        </td>

                        <td>
                          {groupName !== "—" ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <Layers size={11} color={BRAND} />
                              <span style={{ fontSize: 13, color: tx }}>{groupName}</span>
                            </span>
                          ) : (
                            <span style={{ color: mu, fontSize: 12 }}>—</span>
                          )}
                        </td>

                        <td>
                          {teacherName ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <Users size={11} color={BRAND} />
                              <span style={{ fontSize: 13, color: tx }}>{teacherName}</span>
                            </span>
                          ) : (
                            <span style={{ color: mu, fontSize: 12 }}>—</span>
                          )}
                        </td>

                        <td>
                          <span style={{ fontWeight: 700, color: BRAND }}>
                            {(s.averageGrade || 0).toFixed(1)}
                          </span>
                          <span style={{ fontSize: 10, color: mu }}> / 100</span>
                        </td>

                        <td><StatusBadge active={s.status === "active"} /></td>

                        <td>
                          <button
                            onClick={() => handleCheckTask(s)}
                            style={{
                              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                              color: "#fff", padding: "6px 12px", borderRadius: 8,
                              fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: 5,
                            }}
                          >
                            <BookOpen size={12} /> Tekshirish
                          </button>
                          <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "center" }}>
                            <button onClick={() => openEdit(s)} style={{
                              background: "rgba(66,122,67,0.1)", border: "none",
                              padding: "4px 8px", borderRadius: 6, cursor: "pointer",
                            }}>
                              <Edit3 size={12} color={BRAND} />
                            </button>
                            <button onClick={() => setDeleteTarget(s.id || s._id)} style={{
                              background: "rgba(239,68,68,0.1)", border: "none",
                              padding: "4px 8px", borderRadius: 6, cursor: "pointer",
                            }}>
                              <Trash2 size={12} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

      {/* Code Editor Modal */}
      {codeEditorOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{
            width: "100%", maxWidth: "90%", maxHeight: "90vh", borderRadius: 20,
            background: D ? "rgba(22,22,24,0.98)" : "#fff",
            border: `1px solid ${D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)"}`,
            boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{
              padding: "20px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: `1px solid ${D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.10)"}`,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L}d8)`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(255,255,255,0.20)", backdropFilter: "blur(10px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Code2 size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, color: "#fff", fontWeight: 600, margin: 0 }}>
                    Talaba Kodini Tekshirish
                  </h2>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: "2px 0 0" }}>
                    {currentStudentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCodeEditorOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "rgba(0,0,0,0.25)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <SharedCodeEditor
                value={currentStudentCode}
                onChange={(code) => setCurrentStudentCode(code)}
                language="javascript"
                minHeight={280}
                placeholder="// Talabaning hozircha kodini shu yerga yozing..."
                readOnly={false}
              />
            </div>

            <div style={{
              padding: "20px 24px",
              borderTop: `1px solid ${D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.10)"}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            }}>
              <button
                onClick={() => {
                  localStorage.setItem(`studentCode_${currentStudentName}`, currentStudentCode);
                  showToast("Kod saqlandi!", "success");
                }}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <Save size={16} /> Kodni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}