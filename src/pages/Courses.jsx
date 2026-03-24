import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  BookOpen, Plus, Search, Edit3, Trash2,
  Clock, CheckCircle, X, Save,
  Target, BarChart3, ChevronRight,
  AlertCircle, Layers, Sparkles,
  GraduationCap, ArrowUpRight, Filter,
  Archive, TrendingUp, RefreshCw, DollarSign,
} from 'lucide-react';

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const BRAND       = '#427A43';
const BRAND_LIGHT = '#5a9e5b';
const BRAND_DIM   = '#2d5630';

const COURSE_STATUS = [
  { value: 'active',   label: 'Faol',   color: '#22c55e', pale: 'rgba(34,197,94,0.10)'   },
  { value: 'inactive', label: 'Nofaol', color: '#f59e0b', pale: 'rgba(245,158,11,0.10)'  },
  { value: 'archived', label: 'Arxiv',  color: '#94a3b8', pale: 'rgba(148,163,184,0.10)' },
];

const DURATION_OPTIONS = [
  { value: 1,  label: '1 oy'  },
  { value: 2,  label: '2 oy'  },
  { value: 3,  label: '3 oy'  },
  { value: 4,  label: '4 oy'  },
  { value: 6,  label: '6 oy'  },
  { value: 9,  label: '9 oy'  },
  { value: 12, label: '1 yil' },
];

/* API: POST /api/courses  body: { title, description, price, duration, status } */
const INITIAL_FORM = {
  title:       '',
  description: '',
  price:       '',
  duration:    3,
  status:      'active',
};

/* ─── STYLES ─────────────────────────────────────────────────── */
const Styles = ({ D }) => (
  <style>{`
    .cc-courses { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(66,122,67,0.25); border-radius: 99px; }

    @keyframes cc-fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes cc-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%);  }
    }
    @keyframes cc-toast {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to   { opacity: 1; transform: none; }
    }
    @keyframes cc-spin { to { transform: rotate(360deg); } }
    @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .cc-fu-1 { animation: cc-fadeUp .5s ease .04s both; }
    .cc-fu-2 { animation: cc-fadeUp .5s ease .10s both; }
    .cc-fu-3 { animation: cc-fadeUp .5s ease .17s both; }

    .cc-card {
      transition: transform .26s cubic-bezier(.34,1.56,.64,1), box-shadow .26s;
    }
    .cc-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 32px rgba(66,122,67,0.13);
    }

    .cc-btn {
      cursor: pointer; border: none;
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      font-family: inherit;
      transition: transform .2s cubic-bezier(.34,1.56,.64,1), opacity .15s;
    }
    .cc-btn:hover  { transform: scale(1.06); }
    .cc-btn:active { transform: scale(0.96); }
    .cc-btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

    .cc-input {
      width: 100%; outline: none; font-family: inherit; font-size: 13px;
      transition: border-color .18s, box-shadow .18s;
    }
    .cc-input:focus {
      border-color: ${BRAND} !important;
      box-shadow: 0 0 0 3px rgba(66,122,67,0.12) !important;
    }

    .cc-shimmer { position: relative; overflow: hidden; }
    .cc-shimmer::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
      animation: cc-shimmer 2.5s infinite;
    }

    .cc-spin   { animation: cc-spin 0.85s linear infinite; }
    .cc-pulse  { animation: cc-pulse 2s ease-in-out infinite; }
    .cc-toast  { animation: cc-toast .28s ease both; }
    .cc-ftab   { cursor: pointer; transition: all .18s; white-space: nowrap; }
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

const fmtPrice = n => n ? new Intl.NumberFormat('uz-UZ').format(n) + " so'm" : "Bepul";

/* ─── PROGRESS BAR ───────────────────────────────────────────── */
function ProgressBar({ pct }) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: 'rgba(66,122,67,0.10)', overflow: 'hidden' }}>
      <div className="cc-shimmer" style={{
        height: '100%', borderRadius: 99, width: `${Math.min(pct, 100)}%`,
        background: `linear-gradient(90deg,${BRAND},${BRAND_LIGHT})`,
        transition: 'width 1s ease',
      }} />
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div className="cc-toast" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 16,
      background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
    }}>
      {ok
        ? <CheckCircle size={15} color="#22c55e" />
        : <AlertCircle size={15} color="#ef4444" />}
      <span style={{ fontSize: 13, fontWeight: 600, color: ok ? '#22c55e' : '#ef4444' }}>
        {toast.msg}
      </span>
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, pale, D, delay }) {
  const n    = useCountUp(value);
  const card = D ? 'rgba(22,22,24,0.95)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(66,122,67,0.12)';
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  return (
    <div style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 18,
      padding: '18px 20px',
      boxShadow: D ? 'none' : '0 2px 14px rgba(66,122,67,0.07)',
      animation: `cc-fadeUp .5s ease ${delay}s both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: pale, border: `1px solid ${color}28`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
        <ArrowUpRight size={13} color={mu} />
      </div>
      <p style={{ fontSize: 32, fontWeight: 500, color, lineHeight: 1, marginBottom: 4 }}>{n}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: mu, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
    </div>
  );
}

/* ─── COURSE CARD ────────────────────────────────────────────── */
function CourseCard({ course, isAdmin, onEdit, onDelete, D, index }) {
  const status = COURSE_STATUS.find(s => s.value === course.status) || COURSE_STATUS[0];
  const card   = D ? 'rgba(22,22,24,0.95)' : '#fff';
  const bord   = D ? 'rgba(255,255,255,0.07)' : 'rgba(66,122,67,0.12)';
  const tx     = D ? '#f5f5f7' : '#1a1a1a';
  const mu     = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  const rowBg  = D ? 'rgba(66,122,67,0.10)' : 'rgba(66,122,67,0.05)';

  return (
    <div className="cc-card" style={{
      background: card, border: `1px solid ${bord}`, borderRadius: 20, overflow: 'hidden',
      boxShadow: D ? 'none' : '0 2px 16px rgba(66,122,67,0.07)',
      animation: `cc-fadeUp .5s ease ${0.04 + index * 0.05}s both`,
    }}>
      {/* top stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${BRAND_DIM},${BRAND_LIGHT})` }} />

      <div style={{ padding: '18px 18px 14px' }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 99, background: status.pale,
            border: `1px solid ${status.color}28`,
            fontSize: 10, fontWeight: 800, color: status.color,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span className="cc-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
            {status.label}
          </span>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 5 }}>
              <button className="cc-btn" onClick={() => onEdit(course)} style={{
                width: 30, height: 30, borderRadius: 9, background: 'rgba(66,122,67,0.09)', color: BRAND,
              }}><Edit3 size={13} /></button>
              <button className="cc-btn" onClick={() => onDelete(course)} style={{
                width: 30, height: 30, borderRadius: 9, background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              }}><Trash2 size={13} /></button>
            </div>
          )}
        </div>

        {/* title */}
        <h2 style={{ fontSize: 18, fontWeight: 500, color: tx, marginBottom: 6, lineHeight: 1.25 }}>
          {course.title}
        </h2>

        {/* description */}
        <p style={{
          fontSize: 12, color: mu, lineHeight: 1.6, marginBottom: 14, height: 38,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {course.description || 'Tavsif kiritilmagan'}
        </p>

        {/* info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { icon: Clock,       label: 'Davomiyligi', val: `${course.duration} oy` },
            { icon: DollarSign,  label: 'Narxi',       val: fmtPrice(course.price)  },
          ].map(({ icon: Ic, label, val }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 11, background: rowBg,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: mu }}>
                <Ic size={12} color={BRAND} /> {label}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: BRAND }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── COURSE MODAL ───────────────────────────────────────────── */
function CourseModal({ isOpen, onClose, isEditing, formData, setFormData, onSubmit, loading, D }) {
  if (!isOpen) return null;

  const card = D ? 'rgba(18,18,20,0.98)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.08)' : 'rgba(66,122,67,0.12)';
  const tx   = D ? '#f5f5f7' : '#1a1a1a';
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  const inpBg = D ? 'rgba(255,255,255,0.05)' : 'rgba(66,122,67,0.04)';

  const inp = {
    background: inpBg, border: `1px solid ${bord}`,
    borderRadius: 12, padding: '11px 14px', color: tx,
  };
  const lbl = {
    display: 'block', fontSize: 10, fontWeight: 800, color: mu,
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 500, borderRadius: 26,
        background: card, border: `1px solid ${bord}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        animation: 'cc-fadeUp .26s cubic-bezier(.34,1.56,.64,1) both',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: `1px solid ${bord}`, flexShrink: 0,
          borderRadius: '26px 26px 0 0',
          background: `linear-gradient(135deg, ${BRAND_DIM}f2, ${BRAND_LIGHT}d8)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -28, right: -18, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isEditing ? <Edit3 size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: '#fff', fontWeight: 500 }}>
                {isEditing ? 'Kursni tahrirlash' : 'Yangi kurs'}
              </h2>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 1 }}>
                {isEditing ? "Ma'lumotlarni yangilang" : "Yangi kurs qo'shing"}
              </p>
            </div>
          </div>
          <button className="cc-btn" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 99, position: 'relative', zIndex: 1,
            background: 'rgba(0,0,0,0.22)', color: '#fff',
          }}><X size={14} /></button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{
          padding: '20px 22px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>

          {/* Title */}
          <div>
            <label style={lbl}>Kurs nomi <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              required
              className="cc-input"
              placeholder="Masalan: Frontend Development"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={inp}
            />
          </div>

          {/* Duration + Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Davomiyligi <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                className="cc-input"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                style={{ ...inp, cursor: 'pointer', appearance: 'none' }}
              >
                {DURATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Narxi (so'm)</label>
              <input
                type="number"
                min="0"
                className="cc-input"
                placeholder="0 — bepul"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                style={inp}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={lbl}>Holat</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COURSE_STATUS.map(s => {
                const active = formData.status === s.value;
                return (
                  <button key={s.value} type="button"
                          onClick={() => setFormData({ ...formData, status: s.value })}
                          style={{
                            flex: 1, padding: '9px 8px', borderRadius: 11, cursor: 'pointer',
                            border: `1.5px solid ${active ? s.color : bord}`,
                            background: active ? s.pale : 'transparent',
                            fontSize: 11, fontWeight: 700,
                            color: active ? s.color : mu, transition: 'all .18s',
                          }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Tavsif <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea
              required
              className="cc-input"
              rows={3}
              placeholder="Kurs haqida qisqacha ma'lumot..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inp, resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="cc-btn" style={{
              flex: 1, padding: '12px', borderRadius: 13,
              background: 'transparent', border: `1px solid ${bord}`,
              fontSize: 13, fontWeight: 700, color: mu,
            }}>Bekor</button>
            <button type="submit" disabled={loading} className="cc-btn" style={{
              flex: 2, padding: '12px', borderRadius: 13,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_LIGHT})`,
              fontSize: 13, fontWeight: 700, color: '#fff',
              boxShadow: '0 4px 14px rgba(66,122,67,0.28)',
            }}>
              {loading
                ? <><RefreshCw size={13} className="cc-spin" /> Saqlanmoqda...</>
                : <><Save size={13} /> {isEditing ? 'Saqlash' : "Qo'shish"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── DELETE MODAL ───────────────────────────────────────────── */
function DeleteModal({ course, onConfirm, onCancel, loading, D }) {
  if (!course) return null;
  const card = D ? 'rgba(18,18,20,0.98)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const tx   = D ? '#f5f5f7' : '#1a1a1a';
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(14px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 360, borderRadius: 22,
        background: card, border: `1px solid ${bord}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        padding: '26px 26px 22px', textAlign: 'center',
        animation: 'cc-fadeUp .25s ease both',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
        }}>
          <Trash2 size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 19, color: tx, marginBottom: 8, fontWeight: 500 }}>Kursni o'chirish</h3>
        <p style={{ fontSize: 13, color: mu, marginBottom: 22, lineHeight: 1.65 }}>
          <strong style={{ color: tx }}>"{course.title}"</strong> kursini o'chirmoqchimisiz?
          Bu amalni bekor qilib bo'lmaydi.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cc-btn" onClick={onCancel} style={{
            flex: 1, padding: '11px', borderRadius: 12,
            background: 'transparent', border: `1px solid ${bord}`,
            fontSize: 13, fontWeight: 700, color: mu,
          }}>Bekor</button>
          <button className="cc-btn" onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: '11px', borderRadius: 12,
            background: 'rgba(239,68,68,0.90)', border: 'none',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function Courses() {
  const { user }          = useAuth();
  const { isDarkMode: D } = useTheme();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [courses,       setCourses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [formData,      setFormData]      = useState(INITIAL_FORM);
  const [formLoading,   setFormLoading]   = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCourses();
      setCourses(Array.isArray(data) ? data : data?.courses ?? []);
    } catch {
      showToast('error', "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) { showToast('error', 'Kurs nomi kiritilishi shart'); return; }
    if (!formData.description?.trim()) { showToast('error', 'Kurs tavsifi kiritilishi shart'); return; }

    /* API spec: POST /api/courses  body: { title, description, price, duration, status } */
    const payload = {
      title:       formData.title.trim(),
      description: formData.description.trim(),
      price:       Number(formData.price) || 0,
      duration:    Number(formData.duration) || 3,
      status:      formData.status || 'active',
    };

    setFormLoading(true);
    try {
      if (isEditing) {
        await apiService.updateCourse(editTarget.id, payload);
        showToast('success', 'Kurs muvaffaqiyatli yangilandi');
      } else {
        await apiService.createCourse(payload);
        showToast('success', 'Yangi kurs yaratildi');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast('error', err.message || 'Xatolik yuz berdi');
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteCourse(deleteTarget.id);
      showToast('success', "Kurs o'chirildi");
      setDeleteTarget(null);
      fetchCourses();
    } catch (err) {
      showToast('error', err.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreate = () => {
    setFormData(INITIAL_FORM);
    setIsEditing(false);
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const openEdit = (course) => {
    /* API: { title, description, price, duration, status } */
    setFormData({
      title:       course.title       || '',
      description: course.description || '',
      price:       course.price       ?? '',
      duration:    Number(course.duration) || 3,
      status:      course.status      || 'active',
    });
    setIsEditing(true);
    setEditTarget(course);
    setIsModalOpen(true);
  };

  /* ── Filters ── */
  const filtered = courses.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterStatus === 'all' || c.status === filterStatus)
  );

  const totalActive   = courses.filter(c => c.status === 'active').length;
  const totalInactive = courses.filter(c => c.status === 'inactive').length;
  const totalArchived = courses.filter(c => c.status === 'archived').length;

  /* ── Theme ── */
  const bg   = D ? '#0a0a0b' : '#f0f4f0';
  const card = D ? 'rgba(22,22,24,0.95)' : '#fff';
  const bord = D ? 'rgba(255,255,255,0.07)' : 'rgba(66,122,67,0.12)';
  const tx   = D ? '#f5f5f7' : '#1a1a1a';
  const mu   = D ? 'rgba(245,245,247,0.45)' : 'rgba(0,0,0,0.45)';
  const sbg  = D ? 'rgba(12,12,14,0.88)' : 'rgba(240,244,240,0.88)';

  return (
    <>
      <Styles D={D} />
      <div className="cc-courses" style={{ minHeight: '100vh', background: bg }}>
        <Toast toast={toast} />

        {/* ── HEADER ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40, height: 62,
          background: sbg, borderBottom: `1px solid ${bord}`,
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_LIGHT})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(66,122,67,0.28)',
            }}>
              <BookOpen size={17} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 17, color: BRAND, lineHeight: 1, fontWeight: 500 }}>Kurslar</p>
              <p style={{ fontSize: 10, color: mu, fontWeight: 600, letterSpacing: '0.04em' }}>
                {courses.length} ta kurs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 11,
              background: D ? 'rgba(255,255,255,0.05)' : 'rgba(66,122,67,0.06)', border: `1px solid ${bord}`,
            }}>
              <Search size={13} color={mu} />
              <input
                className="cc-input"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none',
                         fontSize: 13, color: tx, width: 150, padding: 0 }}
              />
            </div>

            <button className="cc-btn" onClick={fetchCourses} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(66,122,67,0.09)', border: `1px solid ${bord}`, color: BRAND,
            }}>
              <RefreshCw size={14} className={loading ? 'cc-spin' : ''} />
            </button>

            {isAdmin && (
              <button className="cc-btn" onClick={openCreate} style={{
                padding: '8px 16px', borderRadius: 11,
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_LIGHT})`,
                fontSize: 13, fontWeight: 700, color: '#fff',
                boxShadow: '0 4px 14px rgba(66,122,67,0.28)',
              }}>
                <Plus size={14} /> Kurs qo'shish
              </button>
            )}
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ padding: '20px 24px 48px', maxWidth: 1120, margin: '0 auto' }}>

          {/* Stats */}
          <div className="cc-fu-1" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 12, marginBottom: 18,
          }}>
            <StatCard label="Jami"    value={courses.length} icon={BookOpen}    color={BRAND}   pale="rgba(66,122,67,0.10)"   D={D} delay={0.04} />
            <StatCard label="Faol"    value={totalActive}    icon={CheckCircle} color="#22c55e" pale="rgba(34,197,94,0.10)"   D={D} delay={0.10} />
            <StatCard label="Nofaol"  value={totalInactive}  icon={Target}      color="#f59e0b" pale="rgba(245,158,11,0.10)"  D={D} delay={0.16} />
            <StatCard label="Arxiv"   value={totalArchived}  icon={Archive}     color="#94a3b8" pale="rgba(148,163,184,0.10)" D={D} delay={0.22} />
          </div>

          {/* Filter bar */}
          <div className="cc-fu-2" style={{
            display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 16,
            padding: '8px 12px', borderRadius: 14,
            background: card, border: `1px solid ${bord}`,
          }}>
            {[
              { value: 'all',      label: 'Barchasi', count: courses.length },
              { value: 'active',   label: 'Faol',     count: totalActive   },
              { value: 'inactive', label: 'Nofaol',   count: totalInactive },
              { value: 'archived', label: 'Arxiv',    count: totalArchived },
            ].map(tab => {
              const active = filterStatus === tab.value;
              return (
                <button key={tab.value} className="cc-ftab" onClick={() => setFilterStatus(tab.value)} style={{
                  padding: '6px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: active ? `linear-gradient(135deg,${BRAND_DIM},${BRAND_LIGHT})` : 'transparent',
                  color: active ? '#fff' : mu, fontSize: 12, fontWeight: 700,
                  boxShadow: active ? '0 3px 10px rgba(66,122,67,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {tab.label}
                  <span style={{
                    padding: '1px 6px', borderRadius: 99, fontSize: 10,
                    background: active ? 'rgba(255,255,255,0.22)' : D ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                  }}>{tab.count}</span>
                </button>
              );
            })}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: mu, fontWeight: 600, flexShrink: 0, alignSelf: 'center' }}>
              {filtered.length} natija
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', paddingTop: 64 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_LIGHT})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <BookOpen size={20} color="#fff" className="cc-spin" />
              </div>
              <p style={{ fontSize: 16, color: BRAND }}>Yuklanmoqda...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="cc-fu-3" style={{ textAlign: 'center', paddingTop: 64 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'rgba(66,122,67,0.08)', border: '1px solid rgba(66,122,67,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <BookOpen size={24} color={BRAND} />
              </div>
              <p style={{ fontSize: 20, color: tx, marginBottom: 8, fontWeight: 400 }}>
                {courses.length === 0 ? "Hali kurs qo'shilmagan" : 'Topilmadi'}
              </p>
              <p style={{ fontSize: 13, color: mu, marginBottom: 18 }}>
                {searchQuery ? `"${searchQuery}" bo'yicha natija yo'q` : "Birinchi kursni qo'shing"}
              </p>
              {isAdmin && !searchQuery && (
                <button className="cc-btn" onClick={openCreate} style={{
                  padding: '10px 20px', borderRadius: 12,
                  background: `linear-gradient(135deg,${BRAND_DIM},${BRAND_LIGHT})`,
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  boxShadow: '0 4px 14px rgba(66,122,67,0.28)',
                }}>
                  <Plus size={14} /> Kurs qo'shish
                </button>
              )}
            </div>
          ) : (
            <div className="cc-fu-3" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))',
              gap: 14,
            }}>
              {filtered.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isAdmin={isAdmin}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  D={D}
                  index={i}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={formLoading}
        D={D}
      />

      <DeleteModal
        course={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        D={D}
      />
    </>
  );
}