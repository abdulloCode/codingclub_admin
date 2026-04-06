import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  Layers, Plus, Search, Edit3, Trash2,
  Users, BookOpen, Calendar, X, Save,
  CheckCircle, XCircle, UserPlus,
  RefreshCw, GraduationCap, ChevronRight,
  ChevronLeft, AlertTriangle, Clock, Hash,
  ArrowUpRight, BarChart3, Shield, Filter,
  Bell, UserCheck, FileText, MessageSquare,
} from 'lucide-react';

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const BRAND       = "#427A43";
const BRAND_LIGHT = "#5a9e5b";
const BRAND_DIM   = "#2d5630";

const GROUP_STATUS = [
  { value: "active",    label: "Faol",           color: "#22c55e", pale: "rgba(34,197,94,0.10)"   },
  { value: "completed", label: "Tugallangan",    color: "#3b82f6", pale: "rgba(59,130,246,0.10)"  },
  { value: "cancelled", label: "Bekor qilingan", color: "#ef4444", pale: "rgba(239,68,68,0.10)"   },
];

const TIME_SLOTS = [
  { value: "08:00-10:00", label: "08:00–10:00" },
  { value: "10:00-12:00", label: "10:00–12:00" },
  { value: "12:00-14:00", label: "12:00–14:00" },
  { value: "14:00-16:00", label: "14:00–16:00" },
  { value: "16:00-18:00", label: "16:00–18:00" },
  { value: "18:00-20:00", label: "18:00–20:00" },
];

const INITIAL_FORM = {
  name: "",
  courseId: "",
  teacherId: "",
  startDate: "",
  endDate: "",
  maxStudents: 20,
  status: "active",
  _timeSlot: "10:00-12:00",
  _description: "",
};

/* ─── HELPER: API student ob'ektidan to'g'ri ma'lumot olish ──── */
// API qaytaradi: { id, userId, groupId, user: { name, email, phone } }
const sName  = s => s?.user?.name  || s?.name  || "Noma'lum";
const sEmail = s => s?.user?.email || s?.email || "";
const sPhone = s => s?.user?.phone || s?.phone || "";
const sContact = s => sPhone(s) || sEmail(s) || "—";

/* ─── GLOBAL STYLES ──────────────────────────────────────────── */
const GStyles = ({ D }) => (
  <style>{`
    .gg-root { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(66,122,67,0.22); border-radius: 99px; }

    @keyframes gg-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
    @keyframes gg-in   { from{opacity:0;transform:scale(0.95)}      to{opacity:1;transform:scale(1)} }
    @keyframes gg-shim { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
    @keyframes gg-spin { to{transform:rotate(360deg)} }
    @keyframes gg-pulse-dot { 0%,80%,100%{opacity:0;transform:scale(0.5)} 40%{opacity:1;transform:scale(1)} }
    @keyframes gg-toast { from{opacity:0;transform:translateY(10px) scale(0.95)} to{opacity:1;transform:none} }
    @keyframes gg-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }

    .gg-fu-1 { animation: gg-up 0.5s ease 0.04s both; }
    .gg-fu-2 { animation: gg-up 0.5s ease 0.10s both; }
    .gg-fu-3 { animation: gg-up 0.5s ease 0.17s both; }
    .gg-fu-4 { animation: gg-up 0.5s ease 0.24s both; }
    .gg-modal { animation: gg-in 0.28s cubic-bezier(.34,1.56,.64,1) both; }
    .gg-toast { animation: gg-toast 0.3s ease both; }

    .gg-card {
      transition: transform 0.26s cubic-bezier(.34,1.56,.64,1),
                  box-shadow 0.26s ease, border-color 0.2s;
      cursor: pointer;
    }
    .gg-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 36px rgba(66,122,67,0.14);
      border-color: rgba(66,122,67,0.30) !important;
    }

    .gg-btn {
      cursor: pointer; border: none;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), opacity 0.15s, box-shadow 0.2s;
    }
    .gg-btn:hover  { transform: scale(1.05); }
    .gg-btn:active { transform: scale(0.96); }
    .gg-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .gg-input {
      width: 100%; font-size: 13px;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .gg-input:focus {
      border-color: ${BRAND} !important;
      box-shadow: 0 0 0 3px rgba(66,122,67,0.13) !important;
    }

    .gg-shimmer { position: relative; overflow: hidden; }
    .gg-shimmer::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
      animation: gg-shim 2.5s infinite;
    }

    .gg-spin  { animation: gg-spin 0.85s linear infinite; }
    .gg-blink { animation: gg-blink 1.8s ease-in-out infinite; }

    .gg-dot-1 { animation: gg-pulse-dot 1.3s ease-in-out 0.0s infinite; }
    .gg-dot-2 { animation: gg-pulse-dot 1.3s ease-in-out 0.2s infinite; }
    .gg-dot-3 { animation: gg-pulse-dot 1.3s ease-in-out 0.4s infinite; }

    .gg-tab { transition: all 0.2s ease; cursor: pointer; white-space: nowrap; }
    .gg-nav-row { transition: transform 0.2s ease; }
    .gg-nav-row:hover { transform: translateX(4px); }

    .gg-progress { position: relative; overflow: hidden; border-radius: 99px; }
    .gg-progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, ${BRAND}, ${BRAND_LIGHT});
      transition: width 0.9s ease;
      position: relative; overflow: hidden;
    }
    .gg-progress-fill::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: gg-shim 2.5s infinite;
    }
  `}</style>
);

/* ─── COUNT-UP HOOK ──────────────────────────────────────────── */
function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  const r = useRef();
  useEffect(() => {
    cancelAnimationFrame(r.current);
    const s = performance.now();
    const tick = (now) => {
      const p = Math.min((now - s) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) r.current = requestAnimationFrame(tick);
    };
    r.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r.current);
  }, [target]);
  return v;
}

/* ─── PROGRESS BAR ───────────────────────────────────────────── */
function ProgressBar({ pct, height = 5 }) {
  return (
    <div className="gg-progress" style={{ height, background: "rgba(66,122,67,0.10)" }}>
      <div className="gg-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

/* ─── AVATAR ─────────────────────────────────────────────────── */
function Avatar({ name, size = 38, brand = true }) {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
      background: brand
        ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`
        : "linear-gradient(135deg, #64748b, #94a3b8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.34,
      boxShadow: brand ? "0 3px 10px rgba(66,122,67,0.25)" : "none",
    }}>
      {initials}
    </div>
  );
}

/* ─── STATUS BADGE ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = GROUP_STATUS.find(x => x.value === status) || GROUP_STATUS[0];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 800,
      letterSpacing: "0.05em", textTransform: "uppercase",
      color: s.color, background: s.pale, border: `1px solid ${s.color}30`,
    }}>
      <span className="gg-blink" style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.color, display: "inline-block",
      }} />
      {s.label}
    </span>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <div className="gg-toast" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 16,
      background: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
      border: `1px solid ${ok ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)"}`,
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
    }}>
      {ok ? <CheckCircle size={15} color="#22c55e" /> : <XCircle size={15} color="#ef4444" />}
      <span style={{ fontSize: 13, fontWeight: 600, color: ok ? "#22c55e" : "#ef4444" }}>{msg}</span>
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, pale, D, delay = 0 }) {
  const anim = useCountUp(value);
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  return (
    <div style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 20,
      padding: "20px 22px",
      boxShadow: D ? "none" : "0 2px 16px rgba(66,122,67,0.07)",
      animation: `gg-up 0.5s ease ${delay}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: pale,
                      border: `1px solid ${color}28`,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} color={color} />
        </div>
        <ArrowUpRight size={13} color={mu} />
      </div>
      <p style={{ fontSize: 36, color, lineHeight: 1, marginBottom: 5, fontWeight: 700 }}>{anim}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: mu, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
    </div>
  );
}

/* ─── MINI CALENDAR ──────────────────────────────────────────── */
function CalendarPicker({ startDate, endDate, onChange, onClose, D }) {
  const [view, setView] = useState(startDate ? new Date(startDate) : new Date());
  const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  const DAYS   = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];
  const y = view.getFullYear(), m = view.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInM  = new Date(y, m + 1, 0).getDate();
  const toStr    = (yr, mo, dy) => `${yr}-${String(mo + 1).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;
  const fmt      = d => d ? new Date(d).toLocaleDateString("uz-UZ") : "—";
  const isStart  = d => toStr(y, m, d) === startDate;
  const isEnd    = d => toStr(y, m, d) === endDate;
  const inRange  = d => { if (!startDate || !endDate) return false; const s = toStr(y, m, d); return s > startDate && s < endDate; };

  const click = (day) => {
    const s = toStr(y, m, day);
    if (!startDate || (startDate && endDate)) { onChange("startDate", s); onChange("endDate", ""); }
    else { if (s >= startDate) onChange("endDate", s); else { onChange("startDate", s); onChange("endDate", ""); } }
  };

  const card = D ? "rgba(22,22,24,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        background: card, border: `1px solid ${bord}`, borderRadius: 24,
        padding: 24, width: "100%", maxWidth: 300,
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button className="gg-btn" onClick={() => setView(new Date(y, m - 1, 1))} style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(66,122,67,0.09)", color: BRAND,
          }}><ChevronLeft size={15} /></button>
          <span style={{ fontWeight: 700, fontSize: 13, color: tx }}>{MONTHS[m]} {y}</span>
          <button className="gg-btn" onClick={() => setView(new Date(y, m + 1, 1))} style={{
            width: 32, height: 32, borderRadius: 10, background: "rgba(66,122,67,0.09)", color: BRAND,
          }}><ChevronRight size={15} /></button>
        </div>

        <p style={{ fontSize: 11, color: mu, textAlign: "center", marginBottom: 12, fontWeight: 500 }}>
          {!startDate || (startDate && endDate) ? "📅 Boshlanish sanasini tanlang" : "📅 Tugash sanasini tanlang"}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: mu, padding: "2px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {Array(firstDow).fill(null).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: daysInM }, (_, i) => i + 1).map(day => {
            const start = isStart(day), end = isEnd(day), range = inRange(day);
            return (
              <button key={day} onClick={() => click(day)} style={{
                height: 32, width: "100%", borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: start || end ? `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` : range ? "rgba(66,122,67,0.10)" : "transparent",
                color: start || end ? "#fff" : range ? BRAND : tx,
                boxShadow: start || end ? "0 3px 8px rgba(66,122,67,0.25)" : "none",
                transition: "all 0.15s",
              }}>{day}</button>
            );
          })}
        </div>

        {(startDate || endDate) && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 12,
                        background: "rgba(66,122,67,0.07)", border: "1px solid rgba(66,122,67,0.15)" }}>
            {[["Boshlanish", startDate], ["Tugash", endDate]].map(([lbl, val]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: mu }}>{lbl}:</span>
                <span style={{ fontWeight: 700, color: BRAND }}>{fmt(val)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="gg-btn" onClick={() => { onChange("startDate", ""); onChange("endDate", ""); }} style={{
            flex: 1, padding: "9px", borderRadius: 12, fontSize: 12, fontWeight: 600,
            background: "transparent", border: `1px solid ${bord}`, color: mu,
          }}>Tozalash</button>
          <button className="gg-btn" onClick={onClose} disabled={!startDate || !endDate} style={{
            flex: 1, padding: "9px", borderRadius: 12, fontSize: 12, fontWeight: 700,
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`,
            color: "#fff", opacity: (!startDate || !endDate) ? 0.45 : 1,
            boxShadow: "0 4px 12px rgba(66,122,67,0.25)",
          }}>Tasdiqlash</button>
        </div>
      </div>
    </div>
  );
}

/* ─── GROUP CARD ─────────────────────────────────────────────── */
function GroupCard({ g, isAdmin, onEdit, onDelete, onStudents, onSelect, selected, getCourseName, getTeacherName, D, index, students }) {
  const card  = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord  = selected ? "rgba(66,122,67,0.45)" : D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const rowBg = D ? "rgba(66,122,67,0.09)" : "rgba(66,122,67,0.05)";

  // Calculate actual student count from students array
  const actualStudentCount = students ? students.filter(s => s.groupId == g.id).length : (g.currentStudents || 0);
  const pct = g.maxStudents ? Math.round((actualStudentCount / g.maxStudents) * 100) : 0;

  return (
    <div className="gg-card" onClick={() => onSelect(g)} style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 22,
      overflow: "hidden", position: "relative",
      boxShadow: selected ? "0 8px 32px rgba(66,122,67,0.18)" : D ? "none" : "0 2px 16px rgba(66,122,67,0.07)",
      animation: `gg-up 0.5s ease ${0.04 + index * 0.05}s both`,
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND_DIM}, ${BRAND_LIGHT})` }} />

      <div style={{ padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 18,
            boxShadow: "0 4px 12px rgba(66,122,67,0.28)",
          }}>
            {g.name?.[0]?.toUpperCase() || "G"}
          </div>
          {isAdmin && (
            <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
              <button className="gg-btn" onClick={() => onEdit(g)} style={{
                width: 30, height: 30, borderRadius: 9, background: "rgba(66,122,67,0.09)", color: BRAND,
              }}><Edit3 size={13} /></button>
              <button className="gg-btn" onClick={() => onDelete(g.id)} style={{
                width: 30, height: 30, borderRadius: 9, background: "rgba(239,68,68,0.08)", color: "#ef4444",
              }}><Trash2 size={13} /></button>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: tx, marginBottom: 4, lineHeight: 1.2 }}>
          {g.name}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "12px 0" }}>
          {[
            { icon: BookOpen,      val: getCourseName(g.courseId) },
            { icon: GraduationCap, val: getTeacherName(g.teacherId) },
            { icon: Calendar,      val: `${fmt(g.startDate)} → ${fmt(g.endDate)}` },
          ].map(({ icon: Icon, val }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8,
                                  padding: "8px 10px", borderRadius: 10, background: rowBg }}>
              <Icon size={12} color={BRAND} />
              <span style={{ fontSize: 12, color: mu, flex: 1, overflow: "hidden",
                             textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: mu, display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={10} /> O'quvchilar
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: BRAND }}>
              {actualStudentCount}/{g.maxStudents}
            </span>
          </div>
          <ProgressBar pct={pct} height={4} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StatusBadge status={g.status} />
          {isAdmin && (
            <button className="gg-btn" onClick={e => { e.stopPropagation(); onStudents(g); }} style={{
              padding: "5px 11px", borderRadius: 9, fontSize: 11, fontWeight: 700,
              background: "rgba(66,122,67,0.09)", color: BRAND,
              border: "1px solid rgba(66,122,67,0.20)",
            }}>
              <UserPlus size={12} /> Boshqarish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── GROUP FORM MODAL ───────────────────────────────────────── */
function GroupModal({ isOpen, onClose, isEditing, formData, setFormData,
                      onSubmit, loading, error, courses, teachers,
                      calendarOpen, setCalendarOpen, D }) {
  if (!isOpen) return null;

  const card  = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord  = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const inpBg = D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.04)";

  const inp = { background: inpBg, border: `1px solid ${bord}`, borderRadius: 12, padding: "11px 14px", color: tx, fontSize: 13 };
  const lbl = { display: "block", fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        width: "100%", maxWidth: 560, borderRadius: 28,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${bord}`,
          borderRadius: "28px 28px 0 0", flexShrink: 0, background: card,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(66,122,67,0.30)",
            }}>
              {isEditing ? <Edit3 size={17} color="#fff" /> : <Plus size={17} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: 20, color: tx, fontWeight: 700 }}>
                {isEditing ? "Guruhni tahrirlash" : "Yangi guruh"}
              </h2>
              <p style={{ fontSize: 11, color: mu, marginTop: 1 }}>
                {isEditing ? "Ma'lumotlarni yangilang" : "Yangi guruh yarating"}
              </p>
            </div>
          </div>
          <button className="gg-btn" onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 99,
            background: "rgba(66,122,67,0.09)", color: mu, border: `1px solid ${bord}`,
          }}><X size={15} /></button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: "22px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
              borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            }}>
              <XCircle size={15} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <div>
            <label style={lbl}>Guruh nomi <span style={{ color: "#ef4444" }}>*</span></label>
            <input required className="gg-input" placeholder="Masalan: Frontend – 1-guruh"
                   value={formData.name}
                   onChange={e => setFormData({ ...formData, name: e.target.value })}
                   style={inp} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Kurs <span style={{ color: "#ef4444" }}>*</span></label>
              <select required className="gg-input"
                      value={formData.courseId}
                      onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                      style={{ ...inp, cursor: "pointer", appearance: "none" }}>
                <option value="">— Tanlang —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
              </select>
              {courses.length === 0 && (
                <p style={{ fontSize: 10, color: "#f59e0b", marginTop: 5 }}>⚠ Avval kurs qo'shing</p>
              )}
            </div>

            <div>
              <label style={lbl}>O'qituvchi <span style={{ color: "#ef4444" }}>*</span></label>
              <select required className="gg-input"
                      value={formData.teacherId}
                      onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                      style={{ ...inp, cursor: "pointer", appearance: "none" }}>
                <option value="">— Tanlang —</option>
                {teachers.map(t => {
                  const name = t.user?.name || t.name || "Noma'lum";
                  const spec = t.specialization ? ` · ${t.specialization.split(" ").slice(0, 2).join(" ")}` : "";
                  return <option key={t.id} value={t.id}>{name}{spec}</option>;
                })}
              </select>
              {teachers.length === 0 && (
                <p style={{ fontSize: 10, color: "#f59e0b", marginTop: 5 }}>⚠ Avval o'qituvchi qo'shing</p>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["startDate", "endDate"].map(field => (
              <div key={field}>
                <label style={lbl}>
                  {field === "startDate" ? "Boshlanish" : "Tugash"} sanasi <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input readOnly required
                         placeholder="Sanani tanlang"
                         value={formData[field] ? new Date(formData[field]).toLocaleDateString("uz-UZ") : ""}
                         onClick={() => setCalendarOpen(true)}
                         className="gg-input"
                         style={{ ...inp, cursor: "pointer", paddingRight: 38 }} />
                  <button type="button" onClick={() => setCalendarOpen(true)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: mu, cursor: "pointer",
                  }}><Calendar size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label style={lbl}>
              Dars vaqti
              <span style={{ fontSize: 9, fontWeight: 500, color: mu, marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>
                (ma'lumot uchun)
              </span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
              {TIME_SLOTS.map(slot => {
                const active = formData._timeSlot === slot.value;
                return (
                  <button key={slot.value} type="button"
                          onClick={() => setFormData({ ...formData, _timeSlot: slot.value })}
                          style={{
                            padding: "9px 6px", borderRadius: 11, cursor: "pointer",
                            border: `1.5px solid ${active ? BRAND : bord}`,
                            background: active ? "rgba(66,122,67,0.10)" : "transparent",
                            fontSize: 11, fontWeight: 700,
                            color: active ? BRAND : mu,
                            transition: "all 0.18s",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                          }}>
                    <Clock size={12} color={active ? BRAND : mu} />
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Maksimal o'quvchi <span style={{ color: "#ef4444" }}>*</span></label>
              <input required type="number" min="1" max="100"
                     className="gg-input"
                     value={formData.maxStudents}
                     onChange={e => setFormData({ ...formData, maxStudents: e.target.value })}
                     style={inp} />
            </div>
            <div>
              <label style={lbl}>Holat</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {GROUP_STATUS.map(s => {
                  const active = formData.status === s.value;
                  return (
                    <label key={s.value} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", borderRadius: 11, cursor: "pointer",
                      border: `1.5px solid ${active ? s.color : bord}`,
                      background: active ? s.pale : "transparent",
                      transition: "all 0.18s",
                    }}>
                      <input type="radio" name="status" value={s.value}
                             checked={active}
                             onChange={e => setFormData({ ...formData, status: e.target.value })}
                             style={{ display: "none" }} />
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: active ? s.color : mu }}>{s.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" className="gg-btn" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 14,
              background: "transparent", border: `1px solid ${bord}`,
              fontSize: 13, fontWeight: 700, color: mu,
            }}>Bekor</button>
            <button type="submit" className="gg-btn" disabled={loading} style={{
              flex: 2, padding: "12px", borderRadius: 14,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 16px rgba(66,122,67,0.30)",
            }}>
              {loading
                ? <><RefreshCw size={14} className="gg-spin" /> Saqlanmoqda...</>
                : <><Save size={14} /> {isEditing ? "Saqlash" : "Guruh yaratish"}</>}
            </button>
          </div>
        </form>
      </div>

      {calendarOpen && (
        <CalendarPicker
          startDate={formData.startDate} endDate={formData.endDate}
          onChange={(field, val) => setFormData(p => ({ ...p, [field]: val }))}
          onClose={() => setCalendarOpen(false)}
          D={D}
        />
      )}
    </div>
  );
}

/* ─── STUDENTS MODAL ─────────────────────────────────────────── */
// ✅ TUZATILDI: sName(), sContact() yordamchi funksiyalari ishlatildi
// API: { id, userId, groupId, user: { name, email, phone } }
function StudentsModal({ group, students, onAdd, onRemove, onClose, D }) {
  const [search, setSearch] = useState("");

  if (!group) return null;

  // Debug log to help diagnose issues
  console.log(`🎯 Group ${group.id} (${group.name}) - Filtering ${students.length} students`);
  console.log("👥 Students with groupId:", students.filter(s => s.groupId).map(s => ({ id: s.id, groupId: s.groupId, name: sName(s) })));

  // Filter students by exact groupId match (both string and number comparison)
  const groupStudents = students.filter(s => {
    const studentGroupId = s.groupId;
    const groupId = group.id;
    // Handle both string and number comparisons
    const match = studentGroupId == groupId;
    if (match) console.log(`✅ Student ${sName(s)} (${s.id}) belongs to group ${groupId}`);
    return match;
  });

  const otherStudents = students.filter(s => {
    const studentGroupId = s.groupId;
    const groupId = group.id;
    const notInGroup = studentGroupId != groupId;
    const q = search.toLowerCase();
    const matchesSearch = !q || sName(s).toLowerCase().includes(q) || sContact(s).toLowerCase().includes(q);
    return notInGroup && matchesSearch;
  });

  const pct = group.maxStudents ? Math.round((groupStudents.length / group.maxStudents) * 100) : 0;

  const card  = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord  = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const rowBg = D ? "rgba(66,122,67,0.09)" : "rgba(66,122,67,0.05)";
  const otherBg = D ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        width: "100%", maxWidth: 580, borderRadius: 28,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${bord}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(66,122,67,0.30)",
            }}>
              <Users size={17} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, color: tx, fontWeight: 700 }}>{group.name}</h2>
              <p style={{ fontSize: 11, color: mu, marginTop: 1 }}>
                {groupStudents.length}/{group.maxStudents} o'quvchi
              </p>
            </div>
          </div>
          <button className="gg-btn" onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 99,
            background: "rgba(66,122,67,0.09)", color: mu, border: `1px solid ${bord}`,
          }}><X size={15} /></button>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Progress */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: mu }}>Guruh to'lishi</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: BRAND }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} height={6} />
          </div>

          {/* Guruh o'quvchilari */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase",
                        letterSpacing: "0.07em", marginBottom: 10 }}>
              Guruh o'quvchilari ({groupStudents.length})
            </p>
            {groupStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", background: otherBg,
                            borderRadius: 14, border: `1px solid ${bord}` }}>
                <Users size={22} color={mu} style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: mu }}>Hali o'quvchi biriktirilmagan</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {groupStudents.map(s => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 13, background: rowBg,
                    border: "1px solid rgba(66,122,67,0.12)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={sName(s)} size={36} brand={true} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: tx }}>{sName(s)}</p>
                        <p style={{ fontSize: 11, color: mu }}>{sContact(s)}</p>
                      </div>
                    </div>
                    <button className="gg-btn" onClick={() => onRemove(s.id)} style={{
                      width: 30, height: 30, borderRadius: 9,
                      background: "rgba(239,68,68,0.08)", color: "#ef4444",
                    }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Qo'shish qismi — qidiruv bilan */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase",
                        letterSpacing: "0.07em", marginBottom: 10 }}>
              Qo'shish uchun o'quvchilar ({students.filter(s => s.groupId !== group.id).length})
            </p>

            {/* Qidiruv */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderRadius: 11,
              background: otherBg, border: `1px solid ${bord}`,
              marginBottom: 10,
            }}>
              <Search size={13} color={mu} />
              <input
                placeholder="Ism yoki telefon..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none",
                         fontSize: 12, color: tx, flex: 1 }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{
                  background: "none", border: "none", cursor: "pointer", color: mu, padding: 0,
                }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {otherStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", background: otherBg,
                            borderRadius: 14, border: `1px solid ${bord}` }}>
                <GraduationCap size={22} color={mu} style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: mu }}>
                  {search ? "Topilmadi" : "Qo'shish uchun o'quvchi yo'q"}
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
                {otherStudents.map(s => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 13, background: otherBg,
                    border: `1px solid ${bord}`, transition: "border-color 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={sName(s)} size={34} brand={false} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{sName(s)}</p>
                        <p style={{ fontSize: 11, color: mu }}>{sContact(s)}</p>
                      </div>
                    </div>
                    <button className="gg-btn" onClick={() => onAdd(s.id)} style={{
                      width: 30, height: 30, borderRadius: 9,
                      background: "rgba(66,122,67,0.09)", color: BRAND,
                      border: "1px solid rgba(66,122,67,0.20)",
                    }}><UserPlus size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DELETE MODAL ───────────────────────────────────────────── */
function DeleteModal({ groupId, onConfirm, onCancel, D }) {
  if (!groupId) return null;
  const card = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        width: "100%", maxWidth: 360, borderRadius: 24,
        background: card, border: `1px solid ${bord}`,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        padding: "28px 28px 24px", textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <AlertTriangle size={24} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 20, color: tx, marginBottom: 10, fontWeight: 700 }}>
          Guruhni o'chirish
        </h3>
        <p style={{ fontSize: 13, color: mu, lineHeight: 1.65, marginBottom: 24 }}>
          Bu guruh va uning barcha ma'lumotlari butunlay o'chiriladi. Bu amalni bekor qilib bo'lmaydi.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="gg-btn" onClick={onCancel} style={{
            flex: 1, padding: "12px", borderRadius: 13,
            background: "transparent", border: `1px solid ${bord}`,
            fontSize: 13, fontWeight: 700, color: mu,
          }}>Bekor</button>
          <button className="gg-btn" onClick={onConfirm} style={{
            flex: 1, padding: "12px", borderRadius: 13,
            background: "rgba(239,68,68,0.90)", border: "none",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── DETAIL PANEL ───────────────────────────────────────────── */
function DetailPanel({ g, getCourseName, getTeacherName, onEdit, onDelete, onClose, D, students }) {
  const card  = D ? "rgba(22,22,24,0.97)" : "#fff";
  const bord  = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx    = D ? "#f5f5f7" : "#1a1a1a";
  const mu    = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const rowBg = D ? "rgba(66,122,67,0.08)" : "rgba(66,122,67,0.05)";

  // Calculate actual student count
  const actualStudentCount = students ? students.filter(s => s.groupId == g.id).length : (g.currentStudents || 0);

  const details = [
    { icon: BookOpen,      label: "Kurs",       val: getCourseName(g.courseId) },
    { icon: GraduationCap, label: "O'qituvchi", val: getTeacherName(g.teacherId) },
    { icon: Calendar,      label: "Muddat",     val: `${fmt(g.startDate)} → ${fmt(g.endDate)}` },
    { icon: Hash,          label: "Kapasitet",  val: `${actualStudentCount} / ${g.maxStudents}` },
  ];

  return (
    <div style={{
      width: 268, flexShrink: 0,
      background: card, border: `1px solid ${bord}`,
      borderRadius: 22, overflow: "hidden",
      boxShadow: D ? "none" : "0 4px 24px rgba(66,122,67,0.10)",
      position: "sticky", top: 80,
      animation: "gg-in 0.3s ease both",
    }}>
      <div style={{
        padding: "20px",
        background: `linear-gradient(135deg, ${BRAND_DIM} 0%, ${BRAND_LIGHT} 100%)`,
        position: "relative",
      }}>
        <button className="gg-btn" onClick={onClose} style={{
          position: "absolute", top: 12, right: 12,
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(255,255,255,0.18)", color: "#fff",
        }}><X size={13} /></button>
        <div style={{
          width: 50, height: 50, borderRadius: 16,
          background: "rgba(255,255,255,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: 22, marginBottom: 10,
        }}>
          {g.name?.[0]?.toUpperCase() || "G"}
        </div>
        <p style={{ fontSize: 18, color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>{g.name}</p>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {details.map(({ icon: Icon, label, val }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10,
                                      padding: "10px 12px", borderRadius: 12, background: rowBg }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, background: "rgba(66,122,67,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={12} color={BRAND} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 12, color: tx, fontWeight: 500, marginTop: 2 }}>{val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}><StatusBadge status={g.status} /></div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="gg-btn" onClick={() => onEdit(g)} style={{
            flex: 1, padding: "9px", borderRadius: 12,
            background: "rgba(66,122,67,0.09)", border: "1px solid rgba(66,122,67,0.20)",
            fontSize: 12, fontWeight: 700, color: BRAND,
          }}><Edit3 size={12} /> Tahrirlash</button>
          <button className="gg-btn" onClick={() => onDelete(g.id)} style={{
            flex: 1, padding: "9px", borderRadius: 12,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
            fontSize: 12, fontWeight: 700, color: "#ef4444",
          }}><Trash2 size={12} /> O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPER ─────────────────────────────────────────────────── */
const fmt = d => d ? new Date(d).toLocaleDateString("uz-UZ") : "—";
const normalize = v => Array.isArray(v) ? v : (v?.groups || v?.data || v?.items || []);

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function Groups() {
  const { user }          = useAuth();
  const { isDarkMode: D } = useTheme();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [groups,       setGroups]       = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [teachers,     setTeachers]     = useState([]);
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");

  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [selectedGroup,setSelectedGroup]= useState(null);
  const [formData,     setFormData]     = useState(INITIAL_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError,    setFormError]    = useState("");

  const [detailGroup,  setDetailGroup]  = useState(null);
  const [studentsModal,setStudentsModal]= useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Fetch ──────────────────────────────────────────────── */
  const fetchData = async () => {
    try {
      setLoading(true);
      let groupsRaw;
      if (user?.role === "teacher") {
        const allGroups = await apiService.getGroups();
        const all = normalize(allGroups);
        groupsRaw = all.filter(g => g.teacherId === user.id);
      }
      else if (user?.role === "student")  { const g = await apiService.getMyGroup?.(); groupsRaw = g ? [g] : []; }
      else                                groupsRaw = await apiService.getGroups();

      const [cRaw, tRaw, sRaw, notifRaw] = await Promise.all([
        apiService.getCourses().catch(() => []),
        apiService.getTeachers().catch(() => []),
        apiService.getStudents().catch(() => []),
        apiService.getNotifications().catch(() => []),
      ]);

      // Normalize and ensure students have proper groupId
      const normalizedStudents = normalize(sRaw);
      console.log("📊 Students loaded:", normalizedStudents.length);

      setGroups(normalize(groupsRaw));
      setCourses(normalize(cRaw));
      setTeachers(normalize(tRaw));
      setStudents(normalizedStudents);
      setNotifications(Array.isArray(notifRaw) ? notifRaw : (notifRaw?.notifications || []));
    } catch (err) {
      console.error("❌ Fetch error:", err);
      showToast(err.message || "Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user?.role]);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const notificationPanel = document.querySelector('[data-notification-panel="true"]');
        if (notificationPanel && !notificationPanel.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim())                   { setFormError("Guruh nomini kiriting"); return; }
    if (!formData.courseId)                       { setFormError("Kursni tanlang"); return; }
    if (!formData.teacherId)                      { setFormError("O'qituvchini tanlang"); return; }
    if (!formData.startDate || !formData.endDate) { setFormError("Sanalarni tanlang"); return; }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setFormError("Boshlanish sanasi tugash sanasidan oldin bo'lishi kerak"); return;
    }

    const payload = {
      name:        formData.name.trim(),
      courseId:    formData.courseId,
      teacherId:   formData.teacherId,
      startDate:   new Date(formData.startDate).toISOString(),
      endDate:     new Date(formData.endDate).toISOString(),
      maxStudents: parseInt(formData.maxStudents) || 20,
      status:      formData.status,
    };

    setModalLoading(true);
    try {
      if (isEditing) {
        const res = await apiService.updateGroup(selectedGroup.id, payload);
        const updated = res?.group || res;
        setGroups(gs => gs.map(g => g.id === selectedGroup.id ? { ...g, ...updated } : g));
        showToast("Guruh muvaffaqiyatli yangilandi");
      } else {
        const res = await apiService.createGroup(payload);
        const created = res?.group || res;
        setGroups(gs => [created, ...gs]);
        showToast("Yangi guruh yaratildi");
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Xatolik yuz berdi");
    } finally {
      setModalLoading(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const confirmDelete = async () => {
    try {
      await apiService.deleteGroup(deleteTarget);
      setGroups(gs => gs.filter(g => g.id !== deleteTarget));
      if (detailGroup?.id === deleteTarget) setDetailGroup(null);
      setDeleteTarget(null);
      showToast("Guruh o'chirildi");
    } catch (err) {
      showToast(err.message || "O'chirishda xatolik", "error");
      setDeleteTarget(null);
    }
  };

  /* ── Student management ─────────────────────────────────── */
  const refreshStudentsData = async () => {
    try {
      const sRaw = await apiService.getStudents().catch(() => []);
      const normalizedStudents = normalize(sRaw);
      console.log("🔄 Refreshed students:", normalizedStudents.length);
      setStudents(normalizedStudents);
    } catch (err) {
      console.error("❌ Refresh students error:", err);
    }
  };

  const handleAddStudent = async (studentId) => {
    try {
      const res = await apiService.addStudentToGroup(studentsModal.id, studentId);
      // API returns: { message: "...", student: StudentObject, group: GroupObject }
      const updatedStudent = res?.student;
      const updatedGroup = res?.group;

      if (updatedGroup) {
        setGroups(gs => gs.map(g => g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g));
        setStudentsModal(prev => ({ ...prev, ...updatedGroup }));
      }

      // Use the returned student object or update locally
      if (updatedStudent) {
        setStudents(ss => ss.map(s =>
          s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
        ));
      } else {
        // Fallback: update locally using the correct groupId
        setStudents(ss => ss.map(s =>
          s.id === studentId ? { ...s, groupId: studentsModal.id } : s
        ));
      }

      // Refresh students data to ensure consistency
      await refreshStudentsData();
      showToast("O'quvchi guruhga qo'shildi");
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const res = await apiService.removeStudentFromGroup(studentsModal.id, studentId);
      const updatedStudent = res?.student;
      const updatedGroup = res?.group;

      if (updatedGroup) {
        setGroups(gs => gs.map(g => g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g));
        setStudentsModal(prev => ({ ...prev, ...updatedGroup }));
      }

      // Use the returned student object or update locally
      if (updatedStudent) {
        setStudents(ss => ss.map(s =>
          s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
        ));
      } else {
        // Fallback: update locally
        setStudents(ss => ss.map(s =>
          s.id === studentId ? { ...s, groupId: null } : s
        ));
      }

      // Refresh students data to ensure consistency
      await refreshStudentsData();
      showToast("O'quvchi guruhdan olib tashlandi");
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    }
  };

  /* ── Helpers ─────────────────────────────────────────────── */
  const getTeacherName = id => {
    const t = teachers.find(t => t.id === id);
    return t?.user?.name || t?.name || "—";
  };
  const getCourseName = id => {
    const c = courses.find(c => c.id === id);
    return c?.title || c?.name || "—";
  };

  /* ── Notification handling ─────────────────────────────────── */
  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'student_added':
        return <UserPlus size={14} color={BRAND} />;
      case 'student_removed':
        return <XCircle size={14} color="#ef4444" />;
      case 'homework_submitted':
        return <FileText size={14} color="#3b82f6" />;
      case 'attendance':
        return <CheckCircle size={14} color="#22c55e" />;
      default:
        return <Bell size={14} color={BRAND} />;
    }
  };

  const getNotificationTime = (createdAt) => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'hozir';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    return `${diffDays} kun oldin`;
  };

  const openAdd = () => {
    setFormData(INITIAL_FORM);
    setIsEditing(false);
    setSelectedGroup(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (g) => {
    setFormData({
      name:         g.name        || "",
      courseId:     g.courseId    || "",
      teacherId:    g.teacherId   || "",
      startDate:    g.startDate   ? new Date(g.startDate).toISOString().split("T")[0] : "",
      endDate:      g.endDate     ? new Date(g.endDate).toISOString().split("T")[0] : "",
      maxStudents:  g.maxStudents || 20,
      status:       g.status      || "active",
      _timeSlot:    "10:00-12:00",
      _description: "",
    });
    setIsEditing(true);
    setSelectedGroup(g);
    setFormError("");
    setIsModalOpen(true);
  };

  /* ── Filter ─────────────────────────────────────────────── */
  const filtered = groups.filter(g => {
    const q = searchQuery.toLowerCase();
    return (
      (g.name?.toLowerCase().includes(q) || !q) &&
      (filterStatus === "all" || g.status === filterStatus) &&
      (filterCourse === "all" || g.courseId === filterCourse)
    );
  });

  /* ── Theme tokens ────────────────────────────────────────── */
  const bg   = D ? "#0a0a0b" : "#f0f4f0";
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx   = D ? "#f5f5f7" : "#1a1a1a";
  const mu   = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const sbg  = D ? "rgba(12,12,14,0.88)" : "rgba(240,244,240,0.88)";

  const stats = [
    { icon: Layers,      label: "Jami guruhlar",    value: groups.length,                                                        color: BRAND,     pale: "rgba(66,122,67,0.10)"   },
    { icon: CheckCircle, label: "Faol guruhlar",    value: groups.filter(g => g.status === "active").length,                    color: "#22c55e", pale: "rgba(34,197,94,0.10)"   },
    { icon: Users,       label: "Jami o'quvchilar", value: students.filter(s => s.groupId).length,                              color: "#3b82f6", pale: "rgba(59,130,246,0.10)"  },
    { icon: BookOpen,    label: "Kurslar",           value: [...new Set(groups.map(g => g.courseId))].length,                   color: "#f59e0b", pale: "rgba(245,158,11,0.10)"  },
  ];

  return (
    <>
      <GStyles D={D} />
      <div className="gg-root" style={{ minHeight: "100vh", background: bg }}>

        <Toast msg={toast?.msg} type={toast?.type} />

        {/* HEADER */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: sbg, borderBottom: `1px solid ${bord}`,
          backdropFilter: "blur(20px)", height: 62,
          display: "flex", alignItems: "center",
          padding: "0 24px", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(66,122,67,0.28)",
            }}>
              <Layers size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 17, color: BRAND, lineHeight: 1, fontWeight: 700 }}>Guruhlar</p>
              <p style={{ fontSize: 10, color: mu, fontWeight: 600, letterSpacing: "0.04em" }}>
                {groups.length} ta guruh
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 12,
              background: D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.06)",
              border: `1px solid ${bord}`,
            }}>
              <Search size={14} color={mu} />
              <input className="gg-input" placeholder="Qidirish..."
                     value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                     style={{ background: "transparent", border: "none", outline: "none",
                              fontSize: 13, color: tx, width: 150, padding: 0 }} />
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }} data-notification-panel="true">
              <button className="gg-btn" onClick={() => setShowNotifications(!showNotifications)} style={{
                width: 36, height: 36, borderRadius: 11,
                background: showNotifications ? "rgba(66,122,67,0.15)" : "rgba(66,122,67,0.09)",
                border: `1px solid ${bord}`, color: BRAND,
              }}>
                <Bell size={14} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#ef4444", color: "#fff",
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(239,68,68,0.3)",
                  }}>
                    {notifications.filter(n => !n.read).length}
                  </div>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifications && (
                <div style={{
                  position: "absolute", top: 45, right: 0,
                  width: 320, maxHeight: 400, zIndex: 100,
                  background: card, border: `1px solid ${bord}`,
                  borderRadius: 14, boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "14px 16px",
                    borderBottom: `1px solid ${bord}`,
                    background: D ? "rgba(66,122,67,0.05)" : "rgba(66,122,67,0.03)",
                  }}>
                    <h3 style={{
                      fontSize: 13, fontWeight: 700, color: tx, margin: 0,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <Bell size={14} color={BRAND} />
                      Bildirishnomalar
                      <span style={{
                        marginLeft: "auto",
                        fontSize: 10, fontWeight: 600,
                        padding: "2px 8px", borderRadius: 8,
                        background: `rgba(66,122,67,0.1)`,
                        color: BRAND,
                      }}>
                        {notifications.filter(n => !n.read).length} yangi
                      </span>
                    </h3>
                  </div>

                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: 40, textAlign: "center",
                        color: mu, fontSize: 12,
                      }}>
                        <Bell size={32} color={mu} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p>Hali bildirishnoma yo'q</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                          style={{
                            padding: "12px 16px",
                            borderBottom: `1px solid ${bord}`,
                            cursor: !notif.read ? "pointer" : "default",
                            background: notif.read ? "transparent" : D ? "rgba(66,122,67,0.05)" : "rgba(66,122,67,0.03)",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!notif.read) {
                              e.target.style.background = D ? "rgba(66,122,67,0.08)" : "rgba(66,122,67,0.06)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!notif.read) {
                              e.target.style.background = D ? "rgba(66,122,67,0.05)" : "rgba(66,122,67,0.03)";
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: D ? "rgba(66,122,67,0.1)" : "rgba(66,122,67,0.08)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "flex-start", marginBottom: 4,
                              }}>
                                <p style={{
                                  fontSize: 12, fontWeight: 600, color: tx,
                                  margin: 0, lineHeight: 1.3,
                                }}>
                                  {notif.message || notif.title || "Bildirishnoma"}
                                </p>
                                {!notif.read && (
                                  <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: BRAND,
                                    flexShrink: 0,
                                    boxShadow: "0 0 0 2px rgba(66,122,67,0.1)",
                                  }} />
                                )}
                              </div>
                              <p style={{
                                fontSize: 10, color: mu, margin: 0,
                              }}>
                                {getNotificationTime(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="gg-btn" onClick={fetchData} style={{
              width: 36, height: 36, borderRadius: 11,
              background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`, color: BRAND,
            }}>
              <RefreshCw size={14} className={loading ? "gg-spin" : ""} />
            </button>

            {isAdmin && (
              <button className="gg-btn" onClick={openAdd} style={{
                padding: "9px 16px", borderRadius: 12,
                background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                color: "#fff", fontSize: 13, fontWeight: 700,
                boxShadow: "0 4px 14px rgba(66,122,67,0.28)",
              }}>
                <Plus size={15} /> Guruh qo'shish
              </button>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main style={{ padding: "22px 24px 48px", maxWidth: 1120, margin: "0 auto" }}>

          <div className="gg-fu-1" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14, marginBottom: 20,
          }}>
            {stats.map((s, i) => <StatCard key={i} {...s} D={D} delay={0.04 + i * 0.06} />)}
          </div>

          {/* Filter bar */}
          <div className="gg-fu-2" style={{
            display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            padding: "10px 14px", borderRadius: 16, marginBottom: 20,
            background: card, border: `1px solid ${bord}`,
          }}>
            {[
              { v: "all",       l: "Barchasi" },
              { v: "active",    l: "Faol"     },
              { v: "completed", l: "Tugagan"  },
              { v: "cancelled", l: "Bekor"    },
            ].map(tab => {
              const active = filterStatus === tab.v;
              return (
                <button key={tab.v} className="gg-tab" onClick={() => setFilterStatus(tab.v)} style={{
                  padding: "7px 14px", borderRadius: 10, border: "none",
                  background: active ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})` : "transparent",
                  color: active ? "#fff" : mu, fontSize: 12, fontWeight: 700,
                  boxShadow: active ? "0 4px 12px rgba(66,122,67,0.25)" : "none",
                  cursor: "pointer",
                }}>{tab.l}</button>
              );
            })}

            <div style={{ display: "flex", alignItems: "center", gap: 7,
                          marginLeft: 4, paddingLeft: 12, borderLeft: `1px solid ${bord}` }}>
              <Filter size={12} color={mu} />
              <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                      style={{ background: "transparent", border: "none", outline: "none",
                               fontSize: 12, fontWeight: 600, color: tx, cursor: "pointer" }}>
                <option value="all">Barcha kurslar</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
              </select>
            </div>

            <span style={{ marginLeft: "auto", fontSize: 12, color: mu, fontWeight: 600 }}>
              {filtered.length} natija
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80, textAlign: "center" }}>
              <div>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <Layers size={22} color="#fff" className="gg-spin" />
                </div>
                <p style={{ fontSize: 18, color: BRAND, fontWeight: 700 }}>Yuklanmoqda...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="gg-fu-3" style={{ textAlign: "center", paddingTop: 72 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: "rgba(66,122,67,0.08)", border: "1px solid rgba(66,122,67,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Layers size={26} color={BRAND} />
              </div>
              <p style={{ fontSize: 22, color: tx, marginBottom: 8, fontWeight: 700 }}>
                {groups.length === 0 ? "Hali guruh yaratilmagan" : "Hech narsa topilmadi"}
              </p>
              <p style={{ fontSize: 13, color: mu, marginBottom: 20 }}>
                {searchQuery ? `"${searchQuery}" bo'yicha natija yo'q` : "Yangi guruh yarating"}
              </p>
              {isAdmin && !searchQuery && (
                <button className="gg-btn" onClick={openAdd} style={{
                  padding: "11px 22px", borderRadius: 13,
                  background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(66,122,67,0.28)",
                }}>
                  <Plus size={15} /> Birinchi guruhni yarating
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{
                flex: 1, minWidth: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: 14,
              }}>
                {filtered.map((g, i) => (
                  <GroupCard
                    key={g.id} g={g} isAdmin={isAdmin}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onStudents={setStudentsModal}
                    onSelect={grp => setDetailGroup(detailGroup?.id === grp.id ? null : grp)}
                    selected={detailGroup?.id === g.id}
                    getCourseName={getCourseName}
                    getTeacherName={getTeacherName}
                    D={D} index={i}
                    students={students}
                  />
                ))}
              </div>

              {detailGroup && (
                <DetailPanel
                  g={detailGroup}
                  getCourseName={getCourseName}
                  getTeacherName={getTeacherName}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onClose={() => setDetailGroup(null)}
                  D={D}
                  students={students}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <GroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={modalLoading}
        error={formError}
        courses={courses}
        teachers={teachers}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
        D={D}
      />

      <StudentsModal
        group={studentsModal}
        students={students}
        onAdd={handleAddStudent}
        onRemove={handleRemoveStudent}
        onClose={() => setStudentsModal(null)}
        D={D}
      />

      <DeleteModal
        groupId={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        D={D}
      />
    </>
  );
}