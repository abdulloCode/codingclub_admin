import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Layers, Plus, Search, Edit3, Trash2,
  Users, BookOpen, Calendar, X, Save,
  CheckCircle, XCircle, UserPlus,
  RefreshCw, GraduationCap, ChevronRight,
  ChevronLeft, AlertTriangle, Clock, Hash,
  ArrowUpRight, Filter,
  DoorOpen, Wifi, Monitor, Tv, Wind, Cpu, Building2,
} from 'lucide-react';

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const BRAND = "#427A43";
const BRAND_LIGHT = "#5a9e5b";
const BRAND_DIM = "#2d5630";

const GROUP_STATUS = [
  { value: "active", label: "Faol", color: "#22c55e", pale: "rgba(34,197,94,0.10)" },
  { value: "completed", label: "Tugallangan", color: "#3b82f6", pale: "rgba(59,130,246,0.10)" },
  { value: "cancelled", label: "Bekor qilingan", color: "#ef4444", pale: "rgba(239,68,68,0.10)" },
];

const TIME_SLOTS = [
  { value: "08:00-10:00", label: "08:00–10:00", apiTime: "08:00" },
  { value: "10:00-12:00", label: "10:00–12:00", apiTime: "10:00" },
  { value: "12:00-14:00", label: "12:00–14:00", apiTime: "12:00" },
  { value: "14:00-16:00", label: "14:00–16:00", apiTime: "14:00" },
  { value: "16:00-18:00", label: "16:00–18:00", apiTime: "16:00" },
  { value: "18:00-20:00", label: "18:00–20:00", apiTime: "18:00" },
];

const WEEK_DAYS = [
  { value: "dushanba", label: "Du" },
  { value: "seshanba", label: "Se" },
  { value: "chorshanba", label: "Ch" },
  { value: "payshanba", label: "Pa" },
  { value: "juma", label: "Ju" },
  { value: "shanba", label: "Sh" },
  { value: "yakshanba", label: "Ya" },
];

const INITIAL_FORM = {
  name: "",
  courseId: "",
  teacherId: "",
  startDate: "",
  endDate: "",
  maxStudents: 20,
  status: "active",
  roomId: "",
  monthlyPrice: 0,
  lessonsPerMonth: 8,
  _timeSlot: "10:00-12:00",
  _days: [],
};

/* ─── HELPER FUNCTIONS ───────────────────────────────────────── */
const sName = s => s?.user?.name || s?.name || "Noma'lum";
const sEmail = s => s?.user?.email || s?.email || "";
const sPhone = s => s?.user?.phone || s?.phone || "";
const sContact = s => sPhone(s) || sEmail(s) || "—";
const fmt = d => d ? new Date(d).toLocaleDateString("uz-UZ") : "—";
const fmtCurrency = n => new Intl.NumberFormat('uz-UZ').format(n ?? 0);

/* ─── EQUIPMENT ICON ─────────────────────────────────────────── */
function EquipIcon({ name }) {
  const n = (name || "").toLowerCase();
  if (n.includes("wifi")) return <Wifi size={10} />;
  if (n.includes("computer") || n.includes("pc")) return <Cpu size={10} />;
  if (n.includes("projector")) return <Monitor size={10} />;
  if (n.includes("tv")) return <Tv size={10} />;
  if (n.includes("ac") || n.includes("konditsioner")) return <Wind size={10} />;
  return <DoorOpen size={10} />;
}

/* ─── GLOBAL STYLES ──────────────────────────────────────────── */
const GStyles = ({ D }) => (
  <style>{`
    .gg-root { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(66,122,67,0.22); border-radius: 99px; }
    @keyframes gg-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
    @keyframes gg-in { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    @keyframes gg-spin { to{transform:rotate(360deg)} }
    @keyframes gg-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .gg-fu-1 { animation: gg-up 0.5s ease 0.04s both; }
    .gg-fu-2 { animation: gg-up 0.5s ease 0.10s both; }
    .gg-fu-3 { animation: gg-up 0.5s ease 0.17s both; }
    .gg-modal { animation: gg-in 0.28s cubic-bezier(.34,1.56,.64,1) both; }
    .gg-card {
      transition: transform 0.26s cubic-bezier(.34,1.56,.64,1), box-shadow 0.26s ease, border-color 0.2s;
      cursor: pointer;
    }
    .gg-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 36px rgba(66,122,67,0.14);
    }
    .gg-btn {
      cursor: pointer; border: none;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: transform 0.2s, opacity 0.15s;
    }
    .gg-btn:hover { transform: scale(1.05); }
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
    .gg-spin { animation: gg-spin 0.85s linear infinite; }
    .gg-blink { animation: gg-blink 1.8s ease-in-out infinite; }
    .gg-progress { position: relative; overflow: hidden; border-radius: 99px; }
    .gg-progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, ${BRAND}, ${BRAND_LIGHT});
      transition: width 0.9s ease;
    }
    .gg-room-card { transition: all 0.2s; cursor: pointer; }
    .gg-room-card:hover { transform: translateY(-2px); }
  `}</style>
);

/* ─── PROGRESS BAR ───────────────────────────────────────────── */
function ProgressBar({ pct, height = 5 }) {
  return (
    <div className="gg-progress" style={{ height, background: "rgba(66,122,67,0.10)" }}>
      <div className="gg-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

/* ─── AVATAR ─────────────────────────────────────────────────── */
function Avatar({ name, size = 38 }) {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
      background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.34,
      boxShadow: "0 3px 10px rgba(66,122,67,0.25)",
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
      color: s.color, background: s.pale, border: `1px solid ${s.color}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  const isSuccess = type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 16,
      background: isSuccess ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
      border: `1px solid ${isSuccess ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)"}`,
      backdropFilter: "blur(16px)",
    }}>
      {isSuccess ? <CheckCircle size={15} color="#22c55e" /> : <XCircle size={15} color="#ef4444" />}
      <span style={{ fontSize: 13, fontWeight: 600, color: isSuccess ? "#22c55e" : "#ef4444" }}>{msg}</span>
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, pale, D }) {
  return (
    <div style={{
      background: D ? "rgba(22,22,24,0.95)" : "#fff",
      border: `1px solid ${D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)"}`,
      borderRadius: 20, padding: "20px 22px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, background: pale,
          border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={19} color={color} />
        </div>
      </div>
      <p style={{ fontSize: 36, color, lineHeight: 1, marginBottom: 5, fontWeight: 700 }}>{value}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)" }}>{label}</p>
    </div>
  );
}

/* ─── CALENDAR PICKER ────────────────────────────────────────── */
function CalendarPicker({ startDate, endDate, onChange, onClose, D }) {
  const [view, setView] = useState(startDate ? new Date(startDate) : new Date());
  const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const y = view.getFullYear(), m = view.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInM = new Date(y, m + 1, 0).getDate();
  const toStr = (yr, mo, dy) => `${yr}-${String(mo + 1).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;

  const click = (day) => {
    const s = toStr(y, m, day);
    if (!startDate || (startDate && endDate)) {
      onChange("startDate", s);
      onChange("endDate", "");
    } else {
      if (s >= startDate) onChange("endDate", s);
      else { onChange("startDate", s); onChange("endDate", ""); }
    }
  };

  const card = D ? "rgba(22,22,24,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        background: card, border: `1px solid ${bord}`, borderRadius: 24,
        padding: 24, width: "100%", maxWidth: 300,
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: mu, padding: "2px 0" }}>{d}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {Array(firstDow).fill(null).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: daysInM }, (_, i) => i + 1).map(day => {
            const isStart = toStr(y, m, day) === startDate;
            const isEnd = toStr(y, m, day) === endDate;
            return (
              <button key={day} onClick={() => click(day)} style={{
                height: 32, width: "100%", borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: isStart || isEnd ? `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` : "transparent",
                color: isStart || isEnd ? "#fff" : tx,
              }}>{day}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="gg-btn" onClick={() => { onChange("startDate", ""); onChange("endDate", ""); }} style={{
            flex: 1, padding: "9px", borderRadius: 12, fontSize: 12,
            background: "transparent", border: `1px solid ${bord}`, color: mu,
          }}>Tozalash</button>
          <button className="gg-btn" onClick={onClose} disabled={!startDate || !endDate} style={{
            flex: 1, padding: "9px", borderRadius: 12, fontSize: 12, fontWeight: 700,
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`, color: "#fff",
          }}>Tasdiqlash</button>
        </div>
      </div>
    </div>
  );
}

/* ─── ROOM PICKER ────────────────────────────────────────────── */
function RoomPicker({ formData, setFormData, D, onClose, rooms, onRoomsRefresh }) {
  const [step, setStep] = useState("days");
  const [selectedDays, setSelectedDays] = useState(formData._days || []);
  const [selectedTime, setSelectedTime] = useState(formData._timeSlot || "10:00-12:00");
  const [freeRooms, setFreeRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [allRooms, setAllRooms] = useState(rooms || []);
  const [roomForm, setRoomForm] = useState({ name: "", number: "", capacity: 20, equipment: [] });
  const [equipmentInput, setEquipmentInput] = useState("");
  const [roomLoading, setRoomLoading] = useState(false);

  const card = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const inpBg = D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.04)";

  const inp = {
    background: inpBg, border: `1px solid ${bord}`, borderRadius: 12,
    padding: "11px 14px", color: tx, fontSize: 13, width: "100%",
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const fetchFreeRooms = async () => {
    if (selectedDays.length === 0) {
      setError("Kamida 1 kun tanlang");
      return;
    }
    const slot = TIME_SLOTS.find(t => t.value === selectedTime);
    const apiTime = slot?.apiTime || "10:00";
    setLoading(true);
    setError("");
    try {
      const result = await apiService.getFreeRooms(selectedDays, [apiTime]);
      const roomsList = Array.isArray(result) ? result : (result?.availableRooms || []);
      setFreeRooms(roomsList);
      setStep("rooms");
    } catch (err) {
      setError(err.message || "Xonalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const selectRoom = (room) => {
    setFormData(prev => ({
      ...prev,
      roomId: room.id,
      _timeSlot: selectedTime,
      _days: selectedDays,
    }));
    onClose();
  };

  const clearRoom = () => {
    setFormData(prev => ({ ...prev, roomId: "", _days: [], _timeSlot: "10:00-12:00" }));
    onClose();
  };

  // Xona yaratish
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim() || !roomForm.number.trim()) {
      setError("Xona nomi va raqami majburiy");
      return;
    }
    setRoomLoading(true);
    setError("");
    try {
      const newRoom = await apiService.createRoom({
        name: roomForm.name.trim(),
        number: roomForm.number.trim(),
        capacity: parseInt(roomForm.capacity),
        equipment: roomForm.equipment,
      });
      setAllRooms(prev => [...prev, newRoom]);
      if (onRoomsRefresh) onRoomsRefresh();
      setRoomForm({ name: "", number: "", capacity: 20, equipment: [] });
      setEquipmentInput("");
      setShowRoomManagement(false);
    } catch (err) {
      setError(err.message || "Xona yaratishda xatolik");
    } finally {
      setRoomLoading(false);
    }
  };

  // Xona o'chirish
  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Xonani o'chirmoqchimisiz?")) return;
    setRoomLoading(true);
    try {
      await apiService.deleteRoom(roomId);
      setAllRooms(prev => prev.filter(r => r.id !== roomId));
      if (onRoomsRefresh) onRoomsRefresh();
    } catch (err) {
      setError(err.message || "Xona o'chirishda xatolik");
    } finally {
      setRoomLoading(false);
    }
  };

  const steps = [
    { key: "days", label: "Kunlar" },
    { key: "time", label: "Vaqt" },
    { key: "rooms", label: "Xona" },
  ];

  return (
    <>
      <div onClick={e => e.target === e.currentTarget && onClose()} style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(0,0,0,0.60)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div className="gg-modal" style={{
          width: "100%", maxWidth: 500, borderRadius: 28,
          background: card, border: `1px solid ${bord}`,
          maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 22px", borderBottom: `1px solid ${bord}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <DoorOpen size={16} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: tx }}>Xona tanlash</p>
                <p style={{ fontSize: 10, color: mu }}>Bo'sh xonalardan birini tanlang</p>
              </div>
            </div>
            <button className="gg-btn" onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 99,
              background: "rgba(66,122,67,0.09)", color: mu, border: `1px solid ${bord}`,
            }}><X size={13} /></button>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", padding: "12px 22px 0", gap: 0, flexShrink: 0 }}>
            {steps.map((s, i) => {
              const done = steps.findIndex(x => x.key === step) > i;
              const current = s.key === step;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: done ? "pointer" : "default" }} onClick={() => done && setStep(s.key)}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: current ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})` : done ? "rgba(66,122,67,0.20)" : D ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: current ? "#fff" : done ? BRAND : mu,
                    }}>{done ? "✓" : i + 1}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: current ? tx : mu }}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 1, margin: "0 8px", background: done ? BRAND : D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div style={{ padding: "16px 22px 22px", overflowY: "auto", flex: 1 }}>
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                borderRadius: 10, background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.22)", marginBottom: 12,
              }}>
                <XCircle size={13} color="#ef4444" />
                <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>
              </div>
            )}

            {/* Step 1: Kunlar */}
            {step === "days" && (
              <div>
                <p style={{ fontSize: 12, color: mu, marginBottom: 14 }}>Guruh qaysi kunlari dars bo'ladi?</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 18 }}>
                  {WEEK_DAYS.map(day => {
                    const active = selectedDays.includes(day.value);
                    return (
                      <button key={day.value} type="button" onClick={() => toggleDay(day.value)} style={{
                        padding: "10px 4px", borderRadius: 12, border: "none",
                        background: active ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})` : D ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        color: active ? "#fff" : mu, fontSize: 11, fontWeight: 800, cursor: "pointer",
                      }}>{day.label}</button>
                    );
                  })}
                </div>
                <button className="gg-btn" disabled={selectedDays.length === 0} onClick={() => setStep("time")} style={{
                  width: "100%", padding: "11px", borderRadius: 13,
                  background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  opacity: selectedDays.length === 0 ? 0.45 : 1,
                }}>Davom etish <ChevronRight size={14} /></button>
              </div>
            )}

            {/* Step 2: Vaqt */}
            {step === "time" && (
              <div>
                <p style={{ fontSize: 12, color: mu, marginBottom: 14 }}>Dars boshlanish vaqtini tanlang:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 18 }}>
                  {TIME_SLOTS.map(slot => {
                    const active = selectedTime === slot.value;
                    return (
                      <button key={slot.value} type="button" onClick={() => setSelectedTime(slot.value)} style={{
                        padding: "12px 10px", borderRadius: 13,
                        border: active ? "none" : `1.5px solid ${bord}`,
                        background: active ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})` : D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      }}>
                        <Clock size={14} color={active ? "#fff" : mu} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: active ? "#fff" : tx }}>{slot.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="gg-btn" onClick={() => setStep("days")} style={{
                    flex: 1, padding: "11px", borderRadius: 13,
                    background: "transparent", border: `1px solid ${bord}`,
                    fontSize: 13, fontWeight: 600, color: mu,
                  }}><ChevronLeft size={14} /> Orqaga</button>
                  <button className="gg-btn" onClick={fetchFreeRooms} disabled={loading} style={{
                    flex: 2, padding: "11px", borderRadius: 13,
                    background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                    fontSize: 13, fontWeight: 700, color: "#fff",
                  }}>{loading ? <><RefreshCw size={13} className="gg-spin" /> Tekshirilmoqda...</> : <>Bo'sh xonalarni ko'rish <ChevronRight size={14} /></>}</button>
                </div>
              </div>
            )}

            {/* Step 3: Bo'sh xonalar */}
            {step === "rooms" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ fontSize: 12, color: mu }}>{freeRooms.length} ta bo'sh xona topildi</p>
                  <button className="gg-btn" onClick={() => setStep("time")} style={{
                    padding: "5px 10px", borderRadius: 8, fontSize: 11,
                    background: "transparent", border: `1px solid ${bord}`, color: mu,
                  }}><ChevronLeft size={12} /> Qayta</button>
                </div>

                {/* Xona yaratish tugmasi */}
                <button className="gg-btn" onClick={() => setShowRoomManagement(true)} style={{
                  width: "100%", padding: "10px", borderRadius: 12, marginBottom: 12,
                  background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`,
                  fontSize: 12, fontWeight: 600, color: BRAND, gap: 6,
                }}><Building2 size={13} /> Yangi xona yaratish</button>

                {freeRooms.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 20px", background: D ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: 16, border: `1px solid ${bord}` }}>
                    <DoorOpen size={28} color={mu} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: mu }}>Bu vaqtda bo'sh xona yo'q</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    {freeRooms.map(room => {
                      const isSelected = formData.roomId === room.id;
                      return (
                        <div key={room.id} className="gg-room-card" onClick={() => selectRoom(room)} style={{
                          padding: "14px 16px", borderRadius: 16,
                          border: `1.5px solid ${isSelected ? BRAND : bord}`,
                          background: isSelected ? "rgba(66,122,67,0.08)" : D ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: isSelected ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})` : D ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}><DoorOpen size={16} color={isSelected ? "#fff" : mu} /></div>
                              <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: tx }}>{room.name}</p>
                                <p style={{ fontSize: 11, color: mu }}>#{room.number}</p>
                              </div>
                            </div>
                            <div style={{
                              padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                              background: "rgba(66,122,67,0.10)", color: BRAND,
                            }}>👥 {room.capacity}</div>
                          </div>
                          {room.equipment?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {room.equipment.map((eq, i) => (
                                <span key={i} style={{
                                  display: "inline-flex", alignItems: "center", gap: 4,
                                  padding: "3px 8px", borderRadius: 6,
                                  background: D ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                  fontSize: 10, color: mu,
                                }}><EquipIcon name={eq} /> {eq}</span>
                              ))}
                            </div>
                          )}
                          {isSelected && (
                            <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 8, background: "rgba(66,122,67,0.10)", fontSize: 11, fontWeight: 700, color: BRAND, textAlign: "center" }}>✅ Tanlangan</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {formData.roomId && (
                  <button className="gg-btn" onClick={clearRoom} style={{
                    width: "100%", padding: "9px", borderRadius: 11,
                    background: "transparent", border: `1px solid rgba(239,68,68,0.25)`,
                    fontSize: 12, fontWeight: 600, color: "#ef4444",
                  }}><X size={12} /> Xonani olib tashlash</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Xona boshqarish modal */}
      {showRoomManagement && (
        <div onClick={e => e.target === e.currentTarget && setShowRoomManagement(false)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.60)", backdropFilter: "blur(14px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div className="gg-modal" style={{
            width: "100%", maxWidth: 450, borderRadius: 28,
            background: card, border: `1px solid ${bord}`,
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: `1px solid ${bord}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: tx }}>Yangi xona yaratish</h3>
              <button className="gg-btn" onClick={() => setShowRoomManagement(false)} style={{
                width: 32, height: 32, borderRadius: 99, background: "rgba(66,122,67,0.09)", color: mu,
              }}><X size={13} /></button>
            </div>
            <form onSubmit={handleCreateRoom} style={{ padding: "22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: mu, marginBottom: 6, display: "block" }}>Xona nomi *</label>
                  <input className="gg-input" placeholder="Masalan: Kompyuter xonasi" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: mu, marginBottom: 6, display: "block" }}>Xona raqami *</label>
                  <input className="gg-input" placeholder="Masalan: A101" value={roomForm.number} onChange={e => setRoomForm({ ...roomForm, number: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: mu, marginBottom: 6, display: "block" }}>Sig'im (kishi)</label>
                  <input type="number" min="1" max="200" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: mu, marginBottom: 6, display: "block" }}>Jihozlar (vergul bilan)</label>
                  <input className="gg-input" placeholder="Proyektor, WiFi, TV" value={equipmentInput} onChange={e => setEquipmentInput(e.target.value)} style={inp} />
                  <button type="button" onClick={() => {
                    if (equipmentInput.trim()) {
                      const items = equipmentInput.split(',').map(item => item.trim()).filter(item => item);
                      setRoomForm({ ...roomForm, equipment: items });
                    }
                  }} style={{ marginTop: 6, fontSize: 11, color: BRAND, background: "none", border: "none", cursor: "pointer" }}>➕ Jihoz qo'shish</button>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowRoomManagement(false)} style={{
                    flex: 1, padding: "11px", borderRadius: 12,
                    background: "transparent", border: `1px solid ${bord}`,
                    fontSize: 13, fontWeight: 600, color: mu, cursor: "pointer",
                  }}>Bekor</button>
                  <button type="submit" disabled={roomLoading} style={{
                    flex: 2, padding: "11px", borderRadius: 12,
                    background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                    fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer",
                  }}>{roomLoading ? <><RefreshCw size={13} className="gg-spin" /> Saqlanmoqda...</> : "Xona yaratish"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── GROUP CARD ─────────────────────────────────────────────── */
function GroupCard({ g, isAdmin, onEdit, onDelete, onStudents, onSelect, selected, getCourseName, getTeacherName, getRoomName, D, students }) {
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = selected ? "rgba(66,122,67,0.45)" : D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const rowBg = D ? "rgba(66,122,67,0.09)" : "rgba(66,122,67,0.05)";

  const actualStudentCount = students ? students.filter(s => s.groupId === g.id).length : (g.currentStudents || 0);
  const pct = g.maxStudents ? Math.round((actualStudentCount / g.maxStudents) * 100) : 0;
  const roomName = getRoomName(g.roomId);

  return (
    <div className="gg-card" onClick={() => onSelect(g)} style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 22, overflow: "hidden",
      boxShadow: selected ? "0 8px 32px rgba(66,122,67,0.18)" : D ? "none" : "0 2px 16px rgba(66,122,67,0.07)",
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND_DIM}, ${BRAND_LIGHT})` }} />
      <div style={{ padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 18,
          }}>{g.name?.[0]?.toUpperCase() || "G"}</div>
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

        <h3 style={{ fontSize: 18, fontWeight: 700, color: tx, marginBottom: 4 }}>{g.name}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "12px 0" }}>
          {[
            { icon: BookOpen, val: getCourseName(g.courseId) },
            { icon: GraduationCap, val: getTeacherName(g.teacherId) },
            { icon: Calendar, val: `${fmt(g.startDate)} → ${fmt(g.endDate)}` },
            ...(roomName !== "—" ? [{ icon: DoorOpen, val: roomName }] : []),
          ].map(({ icon: Icon, val }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: rowBg }}>
              <Icon size={12} color={BRAND} />
              <span style={{ fontSize: 12, color: mu, flex: 1 }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: mu, display: "flex", alignItems: "center", gap: 4 }}><Users size={10} /> O'quvchilar</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: BRAND }}>{actualStudentCount}/{g.maxStudents}</span>
          </div>
          <ProgressBar pct={pct} height={4} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: rowBg }}>
            <span style={{ fontSize: 10, color: mu }}>Oylik narx</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: tx, display: "block" }}>{fmtCurrency(g.monthlyPrice || 0)} so'm</span>
          </div>
          <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: rowBg }}>
            <span style={{ fontSize: 10, color: mu }}>Darslar/oy</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: tx, display: "block" }}>{g.lessonsPerMonth || 8} marta</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StatusBadge status={g.status} />
          {isAdmin && (
            <button className="gg-btn" onClick={e => { e.stopPropagation(); onStudents(g); }} style={{
              padding: "5px 11px", borderRadius: 9, fontSize: 11, fontWeight: 700,
              background: "rgba(66,122,67,0.09)", color: BRAND,
            }}><UserPlus size={12} /> Boshqarish</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── GROUP FORM MODAL ───────────────────────────────────────── */
function GroupModal({ isOpen, onClose, isEditing, formData, setFormData, onSubmit, loading, error, courses, teachers, rooms, calendarOpen, setCalendarOpen, roomPickerOpen, setRoomPickerOpen, D }) {
  if (!isOpen) return null;

  const card = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";
  const inpBg = D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.04)";

  const inp = { background: inpBg, border: `1px solid ${bord}`, borderRadius: 12, padding: "11px 14px", color: tx, fontSize: 13 };
  const lbl = { display: "block", fontSize: 10, fontWeight: 800, color: mu, marginBottom: 6 };

  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        width: "100%", maxWidth: 560, borderRadius: 28,
        background: card, border: `1px solid ${bord}`,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "20px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${bord}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{isEditing ? <Edit3 size={17} color="#fff" /> : <Plus size={17} color="#fff" />}</div>
            <div>
              <h2 style={{ fontSize: 20, color: tx, fontWeight: 700 }}>{isEditing ? "Guruhni tahrirlash" : "Yangi guruh"}</h2>
            </div>
          </div>
          <button className="gg-btn" onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 99,
            background: "rgba(66,122,67,0.09)", color: mu, border: `1px solid ${bord}`,
          }}><X size={15} /></button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: "22px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
              borderRadius: 12, background: "rgba(239,68,68,0.08)",
            }}>
              <XCircle size={15} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#ef4444" }}>{error}</span>
            </div>
          )}

          <div>
            <label style={lbl}>Guruh nomi *</label>
            <input className="gg-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inp} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Kurs *</label>
              <select value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                <option value="">— Tanlang —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>O'qituvchi *</label>
              <select value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                <option value="">— Tanlang —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.name || t.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["startDate", "endDate"].map(field => (
              <div key={field}>
                <label style={lbl}>{field === "startDate" ? "Boshlanish" : "Tugash"} sanasi *</label>
                <div style={{ position: "relative" }}>
                  <input readOnly value={formData[field] ? new Date(formData[field]).toLocaleDateString("uz-UZ") : ""} onClick={() => setCalendarOpen(true)} className="gg-input" style={{ ...inp, cursor: "pointer" }} />
                  <button type="button" onClick={() => setCalendarOpen(true)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}><Calendar size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label style={lbl}>Xona (ixtiyoriy)</label>
            <button type="button" onClick={() => setRoomPickerOpen(true)} className="gg-btn" style={{
              width: "100%", padding: "11px 14px", borderRadius: 12,
              background: formData.roomId ? "rgba(66,122,67,0.07)" : inpBg,
              border: `1.5px solid ${formData.roomId ? "rgba(66,122,67,0.35)" : bord}`,
              justifyContent: "flex-start", gap: 10, color: formData.roomId ? tx : mu,
            }}>
              <DoorOpen size={15} color={formData.roomId ? BRAND : mu} />
              <span style={{ flex: 1, textAlign: "left" }}>{selectedRoom ? `${selectedRoom.name} (${selectedRoom.number})` : "Bo'sh xona tanlash..."}</span>
              <ChevronRight size={13} color={mu} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Maksimal o'quvchi *</label>
              <input type="number" min="1" value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Oylik narx (so'm) *</label>
              <input type="number" min="0" value={formData.monthlyPrice} onChange={e => setFormData({ ...formData, monthlyPrice: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Darslar soni/oy *</label>
              <input type="number" min="1" max="31" value={formData.lessonsPerMonth} onChange={e => setFormData({ ...formData, lessonsPerMonth: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Holat</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                {GROUP_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" className="gg-btn" onClick={onClose} style={{
              flex: 1, padding: "12px", borderRadius: 14,
              background: "transparent", border: `1px solid ${bord}`,
              fontSize: 13, fontWeight: 700, color: mu,
            }}>Bekor</button>
            <button type="submit" className="gg-btn" disabled={loading} style={{
              flex: 2, padding: "12px", borderRadius: 14,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              fontSize: 13, fontWeight: 700, color: "#fff",
            }}>{loading ? <><RefreshCw size={14} className="gg-spin" /> Saqlanmoqda...</> : <><Save size={14} /> {isEditing ? "Saqlash" : "Yaratish"}</>}</button>
          </div>
        </form>
      </div>

      {calendarOpen && <CalendarPicker startDate={formData.startDate} endDate={formData.endDate} onChange={(field, val) => setFormData(p => ({ ...p, [field]: val }))} onClose={() => setCalendarOpen(false)} D={D} />}
      {roomPickerOpen && <RoomPicker formData={formData} setFormData={setFormData} D={D} onClose={() => setRoomPickerOpen(false)} rooms={rooms} onRoomsRefresh={() => {}} />}
    </div>
  );
}

/* ─── STUDENTS MODAL ─────────────────────────────────────────── */
function StudentsModal({ group, students, onAdd, onRemove, onClose, D }) {
  const [search, setSearch] = useState("");
  if (!group) return null;

  const groupStudents = students.filter(s => s.groupId === group.id);
  const otherStudents = students.filter(s => {
    if (s.groupId === group.id) return false;
    const q = search.toLowerCase();
    return !q || sName(s).toLowerCase().includes(q) || sContact(s).toLowerCase().includes(q);
  });

  const card = D ? "rgba(18,18,20,0.98)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.58)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        width: "100%", maxWidth: 580, borderRadius: 28,
        background: card, border: `1px solid ${bord}`,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${bord}`, flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 20, color: tx, fontWeight: 700 }}>{group.name}</h2>
            <p style={{ fontSize: 11, color: mu }}>{groupStudents.length}/{group.maxStudents} o'quvchi</p>
          </div>
          <button className="gg-btn" onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 99,
            background: "rgba(66,122,67,0.09)", color: mu, border: `1px solid ${bord}`,
          }}><X size={15} /></button>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: mu, marginBottom: 10 }}>Guruh o'quvchilari ({groupStudents.length})</p>
            {groupStudents.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 13, background: D ? "rgba(66,122,67,0.09)" : "rgba(66,122,67,0.05)", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={sName(s)} size={36} />
                  <div><p style={{ fontSize: 13, fontWeight: 700, color: tx }}>{sName(s)}</p><p style={{ fontSize: 11, color: mu }}>{sContact(s)}</p></div>
                </div>
                <button className="gg-btn" onClick={() => onRemove(s.id)} style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(239,68,68,0.08)", color: "#ef4444" }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: mu, marginBottom: 10 }}>Qo'shish uchun o'quvchilar</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 11, background: D ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${bord}`, marginBottom: 10 }}>
              <Search size={13} color={mu} />
              <input placeholder="Ism yoki telefon..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: tx, flex: 1 }} />
            </div>
            {otherStudents.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 13, background: D ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${bord}`, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={sName(s)} size={34} />
                  <div><p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{sName(s)}</p><p style={{ fontSize: 11, color: mu }}>{sContact(s)}</p></div>
                </div>
                <button className="gg-btn" onClick={() => onAdd(s.id)} style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(66,122,67,0.09)", color: BRAND }}><UserPlus size={13} /></button>
              </div>
            ))}
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
  const tx = D ? "#f5f5f7" : "#1a1a1a";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="gg-modal" style={{
        width: "100%", maxWidth: 360, borderRadius: 24,
        background: card, border: `1px solid ${bord}`, padding: "28px", textAlign: "center",
      }}>
        <AlertTriangle size={40} color="#ef4444" style={{ margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 20, color: tx, marginBottom: 10, fontWeight: 700 }}>Guruhni o'chirish</h3>
        <p style={{ fontSize: 13, color: D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)", marginBottom: 24 }}>Bu amalni bekor qilib bo'lmaydi.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="gg-btn" onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 13, background: "transparent", border: `1px solid ${bord}`, fontSize: 13, fontWeight: 700 }}>Bekor</button>
          <button className="gg-btn" onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 13, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 700 }}>O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── DETAIL PANEL ───────────────────────────────────────────── */
function DetailPanel({ g, getCourseName, getTeacherName, getRoomName, onEdit, onDelete, onClose, D, students }) {
  const card = D ? "rgba(22,22,24,0.97)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  const actualStudentCount = students ? students.filter(s => s.groupId === g.id).length : (g.currentStudents || 0);
  const roomName = getRoomName(g.roomId);

  return (
    <div style={{
      width: 268, flexShrink: 0, background: card, border: `1px solid ${bord}`,
      borderRadius: 22, overflow: "hidden", position: "sticky", top: 80,
    }}>
      <div style={{ padding: "20px", background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`, position: "relative" }}>
        <button className="gg-btn" onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.18)", color: "#fff" }}><X size={13} /></button>
        <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22, marginBottom: 10 }}>{g.name?.[0]?.toUpperCase() || "G"}</div>
        <p style={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>{g.name}</p>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: mu }}>Kurs: <span style={{ color: tx }}>{getCourseName(g.courseId)}</span></p>
          <p style={{ fontSize: 11, color: mu, marginTop: 6 }}>O'qituvchi: <span style={{ color: tx }}>{getTeacherName(g.teacherId)}</span></p>
          <p style={{ fontSize: 11, color: mu, marginTop: 6 }}>Muddat: <span style={{ color: tx }}>{fmt(g.startDate)} → {fmt(g.endDate)}</span></p>
          <p style={{ fontSize: 11, color: mu, marginTop: 6 }}>Kapasitet: <span style={{ color: tx }}>{actualStudentCount} / {g.maxStudents}</span></p>
          {roomName !== "—" && <p style={{ fontSize: 11, color: mu, marginTop: 6 }}>Xona: <span style={{ color: tx }}>{roomName}</span></p>}
        </div>
        <div style={{ marginBottom: 14 }}><StatusBadge status={g.status} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="gg-btn" onClick={() => onEdit(g)} style={{ flex: 1, padding: "9px", borderRadius: 12, background: "rgba(66,122,67,0.09)", fontSize: 12, fontWeight: 700, color: BRAND }}><Edit3 size={12} /> Tahrirlash</button>
          <button className="gg-btn" onClick={() => onDelete(g.id)} style={{ flex: 1, padding: "9px", borderRadius: 12, background: "rgba(239,68,68,0.08)", fontSize: 12, fontWeight: 700, color: "#ef4444" }}><Trash2 size={12} /> O'chirish</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function Groups() {
  const { user } = useAuth();
  const { isDarkMode: D } = useTheme();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [detailGroup, setDetailGroup] = useState(null);
  const [studentsModal, setStudentsModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRaw, cRaw, tRaw, sRaw, rRaw] = await Promise.all([
        apiService.getGroups(),
        apiService.getCourses().catch(() => []),
        apiService.getTeachers().catch(() => []),
        apiService.getStudents().catch(() => []),
        apiService.getRooms().catch(() => []),
      ]);

      const normalizeGroups = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.groups && Array.isArray(data.groups)) return data.groups;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      };

      const normalizeRooms = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.rooms && Array.isArray(data.rooms)) return data.rooms;
        return [];
      };

      setGroups(normalizeGroups(groupsRaw));
      setCourses(Array.isArray(cRaw) ? cRaw : (cRaw?.courses || []));
      setTeachers(Array.isArray(tRaw) ? tRaw : (tRaw?.teachers || []));
      setStudents(Array.isArray(sRaw) ? sRaw : (sRaw?.students || []));
      setRooms(normalizeRooms(rRaw));
    } catch (err) {
      console.error("Fetch error:", err);
      showToast(err.message || "Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) { setFormError("Guruh nomini kiriting"); return; }
    if (!formData.courseId) { setFormError("Kursni tanlang"); return; }
    if (!formData.teacherId) { setFormError("O'qituvchini tanlang"); return; }
    if (!formData.startDate || !formData.endDate) { setFormError("Sanalarni tanlang"); return; }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setFormError("Boshlanish sanasi tugash sanasidan oldin bo'lishi kerak");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      courseId: formData.courseId,
      teacherId: formData.teacherId,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      maxStudents: parseInt(formData.maxStudents) || 20,
      status: formData.status,
      monthlyPrice: parseInt(formData.monthlyPrice) || 0,
      lessonsPerMonth: parseInt(formData.lessonsPerMonth) || 8,
      ...(formData.roomId ? { roomId: formData.roomId } : {}),
    };

    setModalLoading(true);
    try {
      if (isEditing) {
        await apiService.updateGroup(selectedGroup.id, payload);
        showToast("Guruh yangilandi");
      } else {
        await apiService.createGroup(payload);
        showToast("Guruh yaratildi");
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Xatolik yuz berdi");
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteGroup(deleteTarget);
      await fetchData();
      if (detailGroup?.id === deleteTarget) setDetailGroup(null);
      setDeleteTarget(null);
      showToast("Guruh o'chirildi");
    } catch (err) {
      showToast(err.message || "O'chirishda xatolik", "error");
    }
  };

  const handleAddStudent = async (studentId) => {
    try {
      await apiService.addStudentToGroup(studentsModal.id, studentId);
      await fetchData();
      showToast("O'quvchi qo'shildi");
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await apiService.removeStudentFromGroup(studentsModal.id, studentId);
      await fetchData();
      showToast("O'quvchi olib tashlandi");
    } catch (err) {
      showToast(err.message || "Xatolik", "error");
    }
  };

  const getTeacherName = id => teachers.find(t => t.id === id)?.user?.name || teachers.find(t => t.id === id)?.name || "—";
  const getCourseName = id => courses.find(c => c.id === id)?.title || courses.find(c => c.id === id)?.name || "—";
  const getRoomName = id => {
    if (!id) return "—";
    const room = rooms.find(r => r.id === id);
    return room ? `${room.name} (${room.number})` : "—";
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
      name: g.name || "",
      courseId: g.courseId || "",
      teacherId: g.teacherId || "",
      startDate: g.startDate ? new Date(g.startDate).toISOString().split("T")[0] : "",
      endDate: g.endDate ? new Date(g.endDate).toISOString().split("T")[0] : "",
      maxStudents: g.maxStudents || 20,
      status: g.status || "active",
      roomId: g.roomId || "",
      monthlyPrice: g.monthlyPrice || 0,
      lessonsPerMonth: g.lessonsPerMonth || 8,
      _timeSlot: "10:00-12:00",
      _days: [],
    });
    setIsEditing(true);
    setSelectedGroup(g);
    setFormError("");
    setIsModalOpen(true);
  };

  const filtered = groups.filter(g => {
    const q = searchQuery.toLowerCase();
    return (g.name?.toLowerCase().includes(q) || !q) &&
      (filterStatus === "all" || g.status === filterStatus) &&
      (filterCourse === "all" || g.courseId === filterCourse);
  });

  const bg = D ? "#0a0a0b" : "#f0f4f0";
  const card = D ? "rgba(22,22,24,0.95)" : "#fff";
  const bord = D ? "rgba(255,255,255,0.07)" : "rgba(66,122,67,0.12)";
  const tx = D ? "#f5f5f7" : "#1a1a1a";
  const mu = D ? "rgba(245,245,247,0.45)" : "rgba(0,0,0,0.45)";

  const stats = [
    { icon: Layers, label: "Jami guruhlar", value: groups.length, color: BRAND, pale: "rgba(66,122,67,0.10)" },
    { icon: CheckCircle, label: "Faol guruhlar", value: groups.filter(g => g.status === "active").length, color: "#22c55e", pale: "rgba(34,197,94,0.10)" },
    { icon: Users, label: "Jami o'quvchilar", value: students.filter(s => s.groupId).length, color: "#3b82f6", pale: "rgba(59,130,246,0.10)" },
    { icon: DoorOpen, label: "Xonalar", value: rooms.length, color: "#f59e0b", pale: "rgba(245,158,11,0.10)" },
  ];

  return (
    <>
      <GStyles D={D} />
      <div className="gg-root" style={{ minHeight: "100vh", background: bg }}>
        <Toast msg={toast?.msg} type={toast?.type} />

        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: D ? "rgba(12,12,14,0.88)" : "rgba(240,244,240,0.88)",
          borderBottom: `1px solid ${bord}`, backdropFilter: "blur(20px)",
          height: 62, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Layers size={17} color="#fff" /></div>
            <div><p style={{ fontSize: 17, color: BRAND, fontWeight: 700 }}>Guruhlar</p></div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, background: D ? "rgba(255,255,255,0.05)" : "rgba(66,122,67,0.06)", border: `1px solid ${bord}` }}>
              <Search size={14} color={mu} />
              <input placeholder="Qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: tx, width: 150 }} />
            </div>

            <button className="gg-btn" onClick={fetchData} style={{
              width: 36, height: 36, borderRadius: 11,
              background: "rgba(66,122,67,0.09)", border: `1px solid ${bord}`, color: BRAND,
            }}><RefreshCw size={14} className={loading ? "gg-spin" : ""} /></button>

            {isAdmin && (
              <button className="gg-btn" onClick={openAdd} style={{
                padding: "9px 16px", borderRadius: 12,
                background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                color: "#fff", fontSize: 13, fontWeight: 700,
              }}><Plus size={15} /> Guruh qo'shish</button>
            )}
          </div>
        </header>

        <main style={{ padding: "22px 24px 48px", maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
            {stats.map((s, i) => <StatCard key={i} {...s} D={D} />)}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", padding: "10px 14px", borderRadius: 16, marginBottom: 20, background: card, border: `1px solid ${bord}` }}>
            {[
              { v: "all", l: "Barchasi" },
              { v: "active", l: "Faol" },
              { v: "completed", l: "Tugagan" },
              { v: "cancelled", l: "Bekor" },
            ].map(tab => {
              const active = filterStatus === tab.v;
              return (
                <button key={tab.v} className="gg-tab" onClick={() => setFilterStatus(tab.v)} style={{
                  padding: "7px 14px", borderRadius: 10, border: "none",
                  background: active ? `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})` : "transparent",
                  color: active ? "#fff" : mu, fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>{tab.l}</button>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginLeft: 4, paddingLeft: 12, borderLeft: `1px solid ${bord}` }}>
              <Filter size={12} color={mu} />
              <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, fontWeight: 600, color: tx, cursor: "pointer" }}>
                <option value="all">Barcha kurslar</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
              </select>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12, color: mu }}>{filtered.length} natija</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}><Layers size={40} className="gg-spin" color={BRAND} /><p>Yuklanmoqda...</p></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 72 }}>
              <p style={{ fontSize: 22, color: tx, fontWeight: 700 }}>{groups.length === 0 ? "Hali guruh yaratilmagan" : "Hech narsa topilmadi"}</p>
              {isAdmin && groups.length === 0 && (
                <button className="gg-btn" onClick={openAdd} style={{
                  padding: "11px 22px", borderRadius: 13,
                  background: `linear-gradient(135deg, ${BRAND_DIM}, ${BRAND_LIGHT})`,
                  color: "#fff", fontSize: 13, fontWeight: 700, marginTop: 16,
                }}><Plus size={15} /> Birinchi guruhni yarating</button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
                {filtered.map((g, i) => (
                  <GroupCard
                    key={g.id} g={g} isAdmin={isAdmin}
                    onEdit={openEdit} onDelete={setDeleteTarget}
                    onStudents={setStudentsModal}
                    onSelect={grp => setDetailGroup(detailGroup?.id === grp.id ? null : grp)}
                    selected={detailGroup?.id === g.id}
                    getCourseName={getCourseName} getTeacherName={getTeacherName}
                    getRoomName={getRoomName} D={D} students={students}
                  />
                ))}
              </div>
              {detailGroup && <DetailPanel g={detailGroup} getCourseName={getCourseName} getTeacherName={getTeacherName} getRoomName={getRoomName} onEdit={openEdit} onDelete={setDeleteTarget} onClose={() => setDetailGroup(null)} D={D} students={students} />}
            </div>
          )}
        </main>
      </div>

      <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isEditing={isEditing} formData={formData} setFormData={setFormData} onSubmit={handleSubmit} loading={modalLoading} error={formError} courses={courses} teachers={teachers} rooms={rooms} calendarOpen={calendarOpen} setCalendarOpen={setCalendarOpen} roomPickerOpen={roomPickerOpen} setRoomPickerOpen={setRoomPickerOpen} D={D} />
      <StudentsModal group={studentsModal} students={students} onAdd={handleAddStudent} onRemove={handleRemoveStudent} onClose={() => setStudentsModal(null)} D={D} />
      <DeleteModal groupId={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} D={D} />
    </>
  );
}