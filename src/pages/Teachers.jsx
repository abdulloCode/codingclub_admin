import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  GraduationCap, Plus, Search, Edit3, Trash2,
  Mail, Phone, RefreshCw, X, Save, BookOpen,
  CheckCircle, XCircle, Filter,
  AlertTriangle, Users, UserCheck,
  ArrowUpRight, ShieldCheck, Eye, EyeOff,
  Code2, Database, Layers, Cpu, Palette,
  Lock, Sparkles, Zap, Star,
} from 'lucide-react';

/* ─── TOKENS ─────────────────────────────────────────────────── */
const BRAND     = "#427A43";
const BRAND_L   = "#5a9e5b";
const BRAND_DIM = "#2d5630";

const SPECS = [
  { value: "Frontend Developer (React/Next.js)",    short: "Frontend",   icon: Code2,    color: "#3b82f6", pale: "rgba(59,130,246,0.10)"   },
  { value: "Backend Developer (Node.js/Go/Python)", short: "Backend",    icon: Database, color: "#8b5cf6", pale: "rgba(139,92,246,0.10)"   },
  { value: "Full-stack Web Developer",              short: "Full-stack", icon: Layers,   color: "#14b8a6", pale: "rgba(20,184,166,0.10)"   },
  { value: "Mobile App Developer (Flutter/RN)",     short: "Mobile",     icon: Cpu,      color: "#f59e0b", pale: "rgba(245,158,11,0.10)"   },
  { value: "UI/UX Designer",                        short: "UI/UX",      icon: Palette,  color: "#ec4899", pale: "rgba(236,72,153,0.10)"   },
  { value: "Cyber Security Specialist",             short: "Security",   icon: Lock,     color: "#ef4444", pale: "rgba(239,68,68,0.10)"    },
  { value: "Data Scientist / AI Engineer",          short: "AI/Data",    icon: Sparkles, color: "#14b8a6", pale: "rgba(20,184,166,0.10)"   },
  { value: "DevOps Engineer",                       short: "DevOps",     icon: Zap,      color: "#6b7280", pale: "rgba(107,114,128,0.10)"  },
];
const QUALS = ["Oliy ma'lumotli", "Magistr", "PhD", "Bakalavr", "O'rta maxsus"];
const INIT  = {
  name: "", email: "", phone: "", password: "",
  specialization: SPECS[0].value,
  qualification:  QUALS[0],
  status: "active",
};

/* ─── HELPERS ────────────────────────────────────────────────── */
const specOf  = v => SPECS.find(s => s.value === v) || SPECS[0];
const nameOf  = t => t?.user?.name  || t?.name  || "—";
const emailOf = t => t?.user?.email || t?.email || "—";
const phoneOf = t => t?.user?.phone || t?.phone || "—";
const normArr = v => Array.isArray(v) ? v : (v?.teachers || v?.data || []);

/* ─── STYLES ─────────────────────────────────────────────────── */
const GStyles = ({ D }) => (
  <style>{`
    .tr-root { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(66,122,67,0.22); border-radius: 99px; }

    @keyframes tr-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    @keyframes tr-in   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    @keyframes tr-shim { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
    @keyframes tr-spin { to{transform:rotate(360deg)} }
    @keyframes tr-blnk { 0%,100%{opacity:1} 50%{opacity:.35} }
    @keyframes tr-tst  { from{opacity:0;transform:translateY(10px) scale(.95)} to{opacity:1;transform:none} }

    .tr-1 { animation: tr-up .5s ease .04s both; }
    .tr-2 { animation: tr-up .5s ease .10s both; }
    .tr-3 { animation: tr-up .5s ease .17s both; }
    .tr-4 { animation: tr-up .5s ease .24s both; }
    .tr-modal { animation: tr-in .26s cubic-bezier(.34,1.56,.64,1) both; }
    .tr-toast { animation: tr-tst .28s ease both; }

    .tr-card {
      transition: transform .24s cubic-bezier(.34,1.56,.64,1),
                  box-shadow .24s, border-color .18s;
    }
    .tr-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 10px 28px rgba(66,122,67,0.13);
      border-color: rgba(66,122,67,0.28) !important;
    }

    .tr-btn {
      cursor:pointer; border:none;
      display:flex; align-items:center; justify-content:center; gap:7px;
      transition: transform .2s cubic-bezier(.34,1.56,.64,1), opacity .14s;
    }
    .tr-btn:hover  { transform: scale(1.06); }
    .tr-btn:active { transform: scale(.96); }
    .tr-btn:disabled { opacity:.55; cursor:not-allowed; transform:none!important; }

    .tr-inp {
      width:100%; font-size:13px;
      outline:none; transition: border-color .18s, box-shadow .18s;
    }
    .tr-inp:focus {
      border-color: ${BRAND} !important;
      box-shadow: 0 0 0 3px rgba(66,122,67,0.13) !important;
    }

    .tr-spin { animation: tr-spin .85s linear infinite; }
    .tr-blnk { animation: tr-blnk 1.8s ease-in-out infinite; }
    .tr-tab  { cursor:pointer; transition:all .18s; white-space:nowrap; }

    .tr-spec-btn { cursor:pointer; border:none; transition:all .18s; }
    .tr-spec-btn:hover { transform: scale(1.05) translateY(-1px); }
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

function SpecBadge({ value }) {
  const sp = specOf(value);
  const Icon = sp.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 99,
      background: sp.pale, color: sp.color,
      border: `1px solid ${sp.color}28`,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <Icon size={9} /> {sp.short}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className="tr-blnk" style={{
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

function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div className="tr-toast" style={{
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
    <div className="tr-card" style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 18,
      padding: "18px 20px",
      boxShadow: D ? "none" : "0 2px 14px rgba(66,122,67,0.07)",
      animation: `tr-up 0.5s ease ${delay}s both`,
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

/* ─── DETAIL PANEL ───────────────────────────────────────────── */
function DetailPanel({ t, onEdit, onDelete, onClose, D }) {
  const sp    = specOf(t.specialization);
  const Icon  = sp.icon;
  const card  = D ? "rgba(22,22,24,0.97)" : "#fff";
  const bord  = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const rowBg = D ? "rgba(66,122,67,0.08)" : "rgba(66,122,67,0.05)";
  const rows  = [
    { icon: Mail,        label: "Email",      val: emailOf(t) },
    { icon: Phone,       label: "Telefon",    val: phoneOf(t) },
    { icon: BookOpen,    label: "Malaka",     val: t.qualification },
    { icon: Star,        label: "Tajriba",    val: t.experience },
  ].filter(r => r.val);

  return (
    <div style={{
      width: 268, flexShrink: 0,
      background: card, border: `1px solid ${bord}`,
      borderRadius: 22, overflow: "hidden",
      boxShadow: D ? "none" : "0 4px 24px rgba(66,122,67,0.10)",
      position: "sticky", top: 16,
      animation: "tr-in 0.3s ease both",
    }}>
      <div style={{
        padding: 20,
        background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
        position: "relative",
      }}>
        <button className="tr-btn" onClick={onClose} style={{
          position: "absolute", top: 12, right: 12,
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(255,255,255,0.18)", color: "#fff",
        }}><X size={13} /></button>
        <Avatar name={nameOf(t)} size={50} />
        <p style={{ fontSize: 18, color: "#fff", fontWeight: 400, lineHeight: 1.2, marginTop: 10, marginBottom: 6 }}>
          {nameOf(t)}
        </p>
        <SpecBadge value={t.specialization} />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {rows.map(({ icon: Ic, label, val }) => (
            <div key={label} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "9px 12px", borderRadius: 11, background: rowBg,
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 8,
                            background: "rgba(66,122,67,0.12)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic size={11} color={BRAND} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 12, color: tx, fontWeight: 500, marginTop: 1,
                             overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <StatusBadge active={t.status === "active"} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="tr-btn" onClick={() => onEdit(t)} style={{
            flex: 1, padding: "9px", borderRadius: 11,
            background: "rgba(66,122,67,0.09)", border: "1px solid rgba(66,122,67,0.20)",
            fontSize: 12, fontWeight: 700, color: BRAND,
          }}><Edit3 size={12} /> Tahrirlash</button>
          <button className="tr-btn" onClick={() => onDelete(t.id)} style={{
            flex: 1, padding: "9px", borderRadius: 11,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
            fontSize: 12, fontWeight: 700, color: "#ef4444",
          }}><Trash2 size={12} /> O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TEACHER MODAL ──────────────────────────────────────────── */
function TeacherModal({ isOpen, onClose, isEditing, form, onChange, onSubmit, saving, err, D }) {
  const [showPass, setShowPass] = useState(false);
  if (!isOpen) return null;

  const sp    = specOf(form.specialization);
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
      <div className="tr-modal" style={{
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
                {isEditing ? "Tahrirlash" : "Yangi o'qituvchi"}
              </h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.58)", marginTop: 1 }}>
                {isEditing ? "Ma'lumotlarni yangilang" : "Yangi o'qituvchini ro'yxatdan o'tkaring"}
              </p>
            </div>
          </div>
          <button className="tr-btn" onClick={onClose} style={{
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
            <input required className="tr-inp" placeholder="Ism Familiya"
                   name="name" value={form.name} onChange={onChange} style={inp} />
          </div>

          {/* Email + Telefon */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Email <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Mail size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input required type="email" className="tr-inp" placeholder="email@example.com"
                       name="email" value={form.email} onChange={onChange}
                       style={{ ...inp, paddingLeft: 34 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Telefon <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Phone size={13} color={mu} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input required className="tr-inp" placeholder="+998 90 123 45 67"
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
                <input required type={showPass ? "text" : "password"} className="tr-inp"
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

          {/* Mutaxassislik */}
          <div>
            <label style={lbl}>Mutaxassislik <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
              {SPECS.map(s => {
                const Ic     = s.icon;
                const active = form.specialization === s.value;
                return (
                  <button key={s.value} type="button" className="tr-spec-btn"
                          onClick={() => onChange({ target: { name: "specialization", value: s.value } })}
                          style={{
                            padding: "9px 6px", borderRadius: 11, textAlign: "center",
                            border: `1.5px solid ${active ? s.color : bord}`,
                            background: active ? s.pale : "transparent",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                          }}>
                    <Ic size={13} color={active ? s.color : mu} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: active ? s.color : mu, letterSpacing: "0.03em" }}>
                      {s.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Malaka + Holat */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Malaka</label>
              <select className="tr-inp" name="qualification"
                      value={form.qualification} onChange={onChange}
                      style={{ ...inp, cursor: "pointer", appearance: "none" }}>
                {QUALS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
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
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" className="tr-btn" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 14,
              background: "transparent", border: `1px solid ${bord}`,
              fontSize: 13, fontWeight: 700, color: mu,
            }}>Bekor</button>
            <button type="submit" className="tr-btn" disabled={saving} style={{
              flex: 2, padding: "12px", borderRadius: 14,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
              fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 16px rgba(66,122,67,0.30)",
            }}>
              {saving
                ? <><RefreshCw size={14} className="tr-spin" /> Saqlanmoqda...</>
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
      <div className="tr-modal" style={{
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
        <h3 style={{ fontSize: 19, color: tx, marginBottom: 8, fontWeight: 400 }}>O'qituvchini o'chirish</h3>
        <p style={{ fontSize: 13, color: mu, lineHeight: 1.65, marginBottom: 22 }}>
          Bu o'qituvchi tizimdan butunlay o'chiriladi. Bu amalni bekor qilib bo'lmaydi.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="tr-btn" onClick={onCancel} style={{
            flex: 1, padding: "11px", borderRadius: 13,
            background: "transparent", border: `1px solid ${bord}`,
            fontSize: 13, fontWeight: 700, color: mu,
          }}>Bekor</button>
          <button className="tr-btn" onClick={onConfirm} style={{
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
export default function Teachers() {
  const { user }          = useAuth();
  const { isDarkMode: D } = useTheme();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [teachers,      setTeachers]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterSpec,    setFilterSpec]    = useState("all");
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [form,          setForm]          = useState(INIT);
  const [saving,        setSaving]        = useState(false);
  const [formErr,       setFormErr]       = useState("");
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [detailTeacher, setDetailTeacher] = useState(null);
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
      const r = await apiService.getTeachers();
      setTeachers(normArr(r));
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

  const openEdit = useCallback(t => {
    setForm({
      id: t.id, name: nameOf(t), email: emailOf(t), phone: phoneOf(t), password: "",
      specialization: t.specialization || SPECS[0].value,
      qualification:  t.qualification  || QUALS[0],
      status: t.status || "active",
    });
    setIsEditing(true); setFormErr(""); setIsModalOpen(true);
  }, []);

  // ✅ TUZATILGAN: name va value ni darhol e.target dan ajratib olinadi,
  // shunda React synthetic event pooling muammosi bo'lmaydi.
  // Eski "prev[name] === value ? prev : ..." optimizatsiyasi o'chirildi —
  // u keraksiz edi va input lagiga sabab bo'lardi.
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
      specialization: form.specialization,
      qualification:  form.qualification,
      status: form.status,
      ...(!isEditing && { password: form.password }),
    };
    setSaving(true);
    try {
      if (isEditing) {
        await apiService.updateTeacher(form.id, payload);
        setTeachers(ts => ts.map(t => t.id === form.id ? { ...t, ...payload } : t));
        showToast("O'qituvchi yangilandi");
      } else {
        const res = await apiService.createTeacher(payload);
        setTeachers(ts => [res?.teacher || res, ...ts]);
        showToast("Yangi o'qituvchi qo'shildi");
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
      await apiService.deleteTeacher(deleteTarget);
      setTeachers(ts => ts.filter(t => t.id !== deleteTarget));
      if (detailTeacher?.id === deleteTarget) setDetailTeacher(null);
      setDeleteTarget(null);
      showToast("O'qituvchi o'chirildi");
    } catch (e) {
      showToast(e.message || "Xatolik", "error");
      setDeleteTarget(null);
    }
  }, [deleteTarget, detailTeacher, showToast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return teachers.filter(t => {
      const ok1 = !q || nameOf(t).toLowerCase().includes(q) || emailOf(t).toLowerCase().includes(q);
      const ok2 = filterSpec === "all" || specOf(t.specialization).short === filterSpec;
      return ok1 && ok2;
    });
  }, [teachers, search, filterSpec]);

  const presentSpecs = useMemo(() =>
    SPECS.filter(s => teachers.some(t => specOf(t.specialization).short === s.short)),
  [teachers]);

  const totalActive = useMemo(() => teachers.filter(t => t.status === "active").length, [teachers]);
  const uniqueSpecs = useMemo(() => new Set(teachers.map(t => specOf(t.specialization).short)).size, [teachers]);

  /* Theme */
  const bg   = D ? "#0a0a0b" : "#f0f4f0";
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <>
      <GStyles D={D} />
      <div className="tr-root" style={{ background: bg, minHeight: "100%" }}>
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
              <p style={{ fontSize: 18, color: BRAND, lineHeight: 1, fontWeight: 500 }}>O'qituvchilar</p>
              <p style={{ fontSize: 10, color: mu, fontWeight: 600, marginTop: 2 }}>
                {teachers.length} ta mutaxassis
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 12px", borderRadius: 11,
              background: D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.06)",
              border: `1px solid ${bord}`,
            }}>
              <Search size={13} color={mu} />
              <input className="tr-inp" placeholder="Qidirish..."
                     value={search} onChange={e => setSearch(e.target.value)}
                     style={{ background: "transparent", border: "none", outline: "none",
                              fontSize: 13, color: tx, width: 150, padding: 0 }} />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={12} color={mu} />
                </button>
              )}
            </div>
            <button className="tr-btn" onClick={fetchData} style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`, color: BRAND,
            }}>
              <RefreshCw size={13} className={loading ? "tr-spin" : ""} />
            </button>
            {isAdmin && (
              <button className="tr-btn" onClick={openAdd} style={{
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

        {/* ── MAIN CONTENT ── */}
        <div style={{ padding: "16px 24px 40px" }}>

          {/* Stats */}
          <div className="tr-1" style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16,
          }}>
            <StatCard label="Jami"           value={teachers.length}  icon={Users}      color={BRAND}   pale="rgba(66,122,67,0.10)"  D={D} delay={0.04} />
            <StatCard label="Faol"           value={totalActive}      icon={UserCheck}  color="#22c55e" pale="rgba(34,197,94,0.10)"  D={D} delay={0.10} />
            <StatCard label="Nofaol"         value={teachers.length - totalActive} icon={XCircle} color="#ef4444" pale="rgba(239,68,68,0.10)"  D={D} delay={0.16} />
            <StatCard label="Mutaxassislik"  value={uniqueSpecs}      icon={BookOpen}   color="#f59e0b" pale="rgba(245,158,11,0.10)" D={D} delay={0.22} />
          </div>

          {/* Filter bar */}
          <div className="tr-2" style={{
            display: "flex", gap: 7, overflowX: "auto", marginBottom: 14,
            padding: "8px 12px", borderRadius: 14,
            background: card, border: `1px solid ${bord}`,
          }}>
            <button className="tr-tab" onClick={() => setFilterSpec("all")} style={{
              padding: "6px 12px", borderRadius: 9, border: "none", cursor: "pointer", flexShrink: 0,
              background: filterSpec === "all" ? `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})` : "transparent",
              color: filterSpec === "all" ? "#fff" : mu,
              fontSize: 12, fontWeight: 700,
              boxShadow: filterSpec === "all" ? "0 3px 10px rgba(66,122,67,0.25)" : "none",
            }}>Barchasi</button>

            {presentSpecs.map(s => {
              const Ic  = s.icon;
              const act = filterSpec === s.short;
              return (
                <button key={s.short} className="tr-tab" onClick={() => setFilterSpec(s.short)} style={{
                  padding: "6px 10px", borderRadius: 9, border: "none", cursor: "pointer", flexShrink: 0,
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: act ? s.pale : "transparent",
                  color: act ? s.color : mu,
                  fontSize: 11, fontWeight: 700,
                  outline: act ? `1.5px solid ${s.color}40` : "none",
                }}>
                  <Ic size={11} /> {s.short}
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
                <GraduationCap size={20} color="#fff" className="tr-spin" />
              </div>
              <p style={{ fontSize: 17, color: BRAND }}>Yuklanmoqda...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="tr-3" style={{ textAlign: "center", paddingTop: 56 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: "rgba(66,122,67,0.08)", border: "1px solid rgba(66,122,67,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
              }}>
                <GraduationCap size={24} color={BRAND} />
              </div>
              <p style={{ fontSize: 20, color: tx, marginBottom: 8, fontWeight: 400 }}>
                {teachers.length === 0 ? "Hali o'qituvchi yo'q" : "Topilmadi"}
              </p>
              <p style={{ fontSize: 13, color: mu, marginBottom: 18 }}>
                {search ? `"${search}" bo'yicha natija yo'q` : "Birinchi o'qituvchini qo'shing"}
              </p>
              {isAdmin && !search && (
                <button className="tr-btn" onClick={openAdd} style={{
                  padding: "10px 20px", borderRadius: 12,
                  background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_L})`,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(66,122,67,0.28)",
                }}>
                  <Plus size={14} /> O'qituvchi qo'shish
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Cards grid */}
              <div style={{
                flex: 1, minWidth: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                gap: 12,
              }}>
                {filtered.map((t, i) => {
                  const sp   = specOf(t.specialization);
                  const Icon = sp.icon;
                  const n    = nameOf(t);
                  const rowBg = D ? "rgba(66,122,67,0.08)" : "rgba(66,122,67,0.04)";
                  const selected = detailTeacher?.id === t.id;
                  return (
                    <div key={t.id} className="tr-card"
                         onClick={() => setDetailTeacher(selected ? null : t)}
                         style={{
                           background: card,
                           border: `1px solid ${selected ? "rgba(66,122,67,0.45)" : bord}`,
                           borderRadius: 18, overflow: "hidden", cursor: "pointer",
                           boxShadow: selected ? "0 8px 28px rgba(66,122,67,0.16)" : D ? "none" : "0 2px 14px rgba(66,122,67,0.07)",
                           animation: `tr-up 0.5s ease ${0.04 + i * 0.04}s both`,
                         }}>
                      <div style={{ height: 3, background: `linear-gradient(90deg,${BRAND_DIM},${BRAND_L})` }} />
                      <div style={{ padding: "16px 16px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={n} size={40} />
                            <div>
                              <p style={{ fontSize: 16, color: tx, fontWeight: 400, lineHeight: 1.2 }}>{n}</p>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                                <Icon size={9} color={sp.color} />
                                <span style={{ fontSize: 10, color: sp.color, fontWeight: 700 }}>{sp.short}</span>
                              </div>
                            </div>
                          </div>
                          {isAdmin && (
                            <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                              <button className="tr-btn" onClick={() => openEdit(t)} style={{
                                width: 30, height: 30, borderRadius: 9,
                                background: "rgba(66,122,67,0.09)", color: BRAND,
                              }}><Edit3 size={13} /></button>
                              <button className="tr-btn" onClick={() => setDeleteTarget(t.id)} style={{
                                width: 30, height: 30, borderRadius: 9,
                                background: "rgba(239,68,68,0.08)", color: "#ef4444",
                              }}><Trash2 size={13} /></button>
                            </div>
                          )}
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <SpecBadge value={t.specialization} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {[[Mail, emailOf(t)], [Phone, phoneOf(t)]].map(([Ic, val]) => val && val !== "—" ? (
                            <div key={val} style={{
                              display: "flex", alignItems: "center", gap: 7,
                              padding: "7px 10px", borderRadius: 9, background: rowBg,
                            }}>
                              <Ic size={11} color={BRAND} />
                              <span style={{ fontSize: 12, color: mu, overflow: "hidden",
                                             textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                            </div>
                          ) : null)}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                          <StatusBadge active={t.status === "active"} />
                          {t.qualification && (
                            <span style={{ fontSize: 10, color: mu }}>{t.qualification}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail panel */}
              {detailTeacher && (
                <DetailPanel
                  t={detailTeacher}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onClose={() => setDetailTeacher(null)}
                  D={D}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <TeacherModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        isEditing={isEditing} form={form} onChange={handleChange}
        onSubmit={handleSubmit} saving={saving} err={formErr} D={D}
      />
      <DeleteModal
        target={deleteTarget} onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)} D={D}
      />
    </>
  );
}