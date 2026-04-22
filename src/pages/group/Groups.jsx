import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

// ── ICONS ──────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = 2, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ISearch = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const IPlus = () => <Icon d="M12 5v14M5 12h14" />;
const IUsers = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IEdit = () => <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const ITrash = () => <Icon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />;
const IBook = () => <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />;
const ICal = () => <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />;
const IChevD = () => <Icon d="M6 9l6 6 6-6" />;
const IChevU = () => <Icon d="M18 15l-6-6-6 6" />;
const IChevR = () => <Icon d="M9 18l6-6-6-6" />;
const IX = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const IDoor = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const IGrad = () => <Icon d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5" />;
const IRefresh = () => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;
const ICheck = () => <Icon d="M20 6L9 17l-5-5" />;
const IUserP = () => <Icon d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6" />;
const ISave = () => <Icon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />;
const IAlert = () => <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const IFilter = () => <Icon d="M22 3H2l8 9.46V19l4 2v-8.54z" />;
const IGrid = () => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />;
const IList = () => <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;

// ── CONSTANTS ──────────────────────────────────────────────
const STATUS = {
  active:    { label: 'Faol',         color: '#16a34a', bg: '#dcfce7', dot: '#22c55e' },
  completed: { label: 'Tugallangan',  color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6' },
  cancelled: { label: 'Bekor',        color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
};

const TIME_SLOTS = [
  { value: '08:00-10:00', label: '08:00–10:00', api: '08:00' },
  { value: '10:00-12:00', label: '10:00–12:00', api: '10:00' },
  { value: '12:00-14:00', label: '12:00–14:00', api: '12:00' },
  { value: '14:00-16:00', label: '14:00–16:00', api: '14:00' },
  { value: '16:00-18:00', label: '16:00–18:00', api: '16:00' },
  { value: '18:00-20:00', label: '18:00–20:00', api: '18:00' },
];

const DAYS = [
  { v: 'dushanba', l: 'Du' }, { v: 'seshanba', l: 'Se' },
  { v: 'chorshanba', l: 'Ch' }, { v: 'payshanba', l: 'Pa' },
  { v: 'juma', l: 'Ju' }, { v: 'shanba', l: 'Sh' },
  { v: 'yakshanba', l: 'Ya' },
];

const INIT_FORM = {
  name: '', courseId: '', teacherId: '', startDate: '', endDate: '',
  maxStudents: 20, status: 'active', roomId: '', monthlyPrice: 0,
  lessonsPerMonth: 8, _timeSlot: '10:00-12:00', _days: [],
  schedule: [],
  lessonPlan: [] // Dars rejalashtirish tizimi
};

// ── UTILS ──────────────────────────────────────────────────
const fmt   = (d) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—';
const money = (n) => new Intl.NumberFormat('uz-UZ').format(n ?? 0);
const sName = (s) => s?.user?.name || s?.name || 'Noma\'lum';
const sCont = (s) => s?.user?.phone || s?.phone || s?.user?.email || s?.email || '—';
const initials = (name) => (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

const normalize = (data, key) => {
  let arr = [];
  if (Array.isArray(data)) arr = data;
  else if (data?.data && Array.isArray(data.data)) arr = data.data;
  else if (key && data?.[key] && Array.isArray(data[key])) arr = data[key];
  return arr.map(i => ({ ...i, id: i.id || i._id }));
};

// Avatar rengi (ism bo'yicha deterministik)
const avatarColor = (name = '') => {
  const colors = [
    ['#6366f1','#e0e7ff'],['#0891b2','#cffafe'],['#059669','#d1fae5'],
    ['#d97706','#fef3c7'],['#dc2626','#fee2e2'],['#7c3aed','#ede9fe'],
    ['#0284c7','#e0f2fe'],['#15803d','#dcfce7'],
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

// ── GLOBAL STYLES ──────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  :root {
    --brand: #427A43;
    --brand-light: #5a9e5b;
    --brand-dark: #2d5630;
    --brand-pale: #f0f7f0;
    --brand-pale2: #e4f0e4;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 22px;
    --shadow-card: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-hover: 0 4px 16px rgba(66,122,67,.14);
    --shadow-modal: 0 20px 60px rgba(0,0,0,.18);
    --transition: .18s cubic-bezier(.4,0,.2,1);
  }

  .dark-mode {
    --brand-pale: rgba(66,122,67,.12);
    --brand-pale2: rgba(66,122,67,.20);
  }

  .grp-root * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }
  .grp-root { min-height: 100vh; background: #f8faf8; }
  .dark-mode .grp-root { background: #0d0d0f; }

  /* Scrollbar */
  .grp-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .grp-root ::-webkit-scrollbar-thumb { background: rgba(66,122,67,.25); border-radius: 99px; }

  /* Animations */
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes fadeIn { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.5; } }

  .anim-up  { animation: fadeUp .3s ease both; }
  .anim-in  { animation: fadeIn .22s cubic-bezier(.34,1.56,.64,1) both; }
  .spin     { animation: spin .8s linear infinite; }

  /* Header */
  .grp-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(66,122,67,.1);
    height: 60px; display: flex; align-items: center;
    padding: 0 24px; gap: 12px;
  }
  .dark-mode .grp-header {
    background: rgba(13,13,15,.88);
    border-color: rgba(255,255,255,.07);
  }

  .grp-logo {
    width: 36px; height: 36px; border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--brand-dark), var(--brand-light));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .grp-title { font-size: 17px; font-weight: 700; color: var(--brand); }

  .search-box {
    flex: 1; max-width: 280px;
    display: flex; align-items: center; gap: 8px;
    padding: 0 12px; height: 36px;
    border-radius: var(--radius-md);
    background: var(--brand-pale);
    border: 1px solid transparent;
    transition: var(--transition);
  }
  .search-box:focus-within {
    background: #fff;
    border-color: rgba(66,122,67,.3);
    box-shadow: 0 0 0 3px rgba(66,122,67,.08);
  }
  .dark-mode .search-box { background: rgba(255,255,255,.06); }
  .dark-mode .search-box:focus-within { background: rgba(255,255,255,.1); }

  .search-box input {
    border: none; outline: none; background: transparent;
    font-size: 13px; font-weight: 500; flex: 1;
    color: #111; font-family: 'Outfit', sans-serif;
  }
  .dark-mode .search-box input { color: #f0f0f0; }
  .search-box input::placeholder { color: rgba(66,122,67,.5); }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border: none; cursor: pointer; font-family: 'Outfit', sans-serif;
    font-weight: 600; transition: var(--transition); border-radius: var(--radius-md);
  }
  .btn:hover { transform: translateY(-1px); }
  .btn:active { transform: scale(.97); }
  .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

  .btn-primary {
    background: linear-gradient(135deg, var(--brand-dark), var(--brand-light));
    color: #fff; padding: 8px 16px; font-size: 13px;
    box-shadow: 0 2px 8px rgba(66,122,67,.25);
  }
  .btn-primary:hover { box-shadow: 0 4px 16px rgba(66,122,67,.35); }

  .btn-ghost {
    background: var(--brand-pale); color: var(--brand);
    padding: 7px 12px; font-size: 13px;
  }
  .dark-mode .btn-ghost { background: rgba(66,122,67,.15); }

  .btn-icon {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    background: var(--brand-pale); color: var(--brand);
  }
  .btn-icon.danger { background: rgba(239,68,68,.08); color: #ef4444; }
  .dark-mode .btn-icon { background: rgba(66,122,67,.15); }

  /* Filters */
  .filters {
    display: flex; align-items: center; gap: 8px;
    padding: 0 24px; height: 50px;
    background: #fff; border-bottom: 1px solid rgba(66,122,67,.08);
    overflow-x: auto;
  }
  .dark-mode .filters { background: rgba(255,255,255,.02); border-color: rgba(255,255,255,.06); }

  .filter-tab {
    padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: 1px solid transparent; white-space: nowrap;
    transition: var(--transition); background: transparent; color: #6b7280;
  }
  .filter-tab.active { background: var(--brand); color: #fff; }
  .filter-tab:hover:not(.active) { background: var(--brand-pale); color: var(--brand); }
  .dark-mode .filter-tab { color: rgba(255,255,255,.45); }

  .view-toggle { display: flex; gap: 4px; margin-left: auto; }
  .vbtn { width: 30px; height: 30px; border-radius: var(--radius-sm); cursor: pointer;
    border: none; background: transparent; color: #9ca3af; display: flex; align-items: center; justify-content: center; }
  .vbtn.active { background: var(--brand-pale); color: var(--brand); }

  /* Main */
  .grp-main { padding: 20px 24px 48px; max-width: 1200px; margin: 0 auto; }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; }

  .stat-card {
    background: #fff; border: 1px solid rgba(66,122,67,.1);
    border-radius: var(--radius-lg); padding: 14px 16px;
    box-shadow: var(--shadow-card);
    animation: fadeUp .4s ease both;
  }
  .dark-mode .stat-card { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.07); }

  .stat-icon {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center; margin-bottom: 10px;
  }
  .stat-val { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .stat-lbl { font-size: 11px; font-weight: 600; color: #9ca3af; }

  /* Grid */
  .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .groups-list { display: flex; flex-direction: column; gap: 8px; }

  /* Group Card */
  .gcard {
    background: #fff; border: 1px solid rgba(66,122,67,.1);
    border-radius: var(--radius-xl); overflow: hidden;
    box-shadow: var(--shadow-card); cursor: pointer;
    transition: var(--transition); animation: fadeUp .35s ease both;
  }
  .dark-mode .gcard { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.07); }
  .gcard:hover { border-color: rgba(66,122,67,.3); box-shadow: var(--shadow-hover); transform: translateY(-2px); }
  .gcard.selected { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(66,122,67,.12), var(--shadow-hover); }

  .gcard-accent { height: 3px; background: linear-gradient(90deg, var(--brand-dark), var(--brand-light)); }

  .gcard-body { padding: 16px; }

  .gcard-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .gcard-avatar {
    width: 44px; height: 44px; border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: #fff;
    background: linear-gradient(135deg, var(--brand-dark), var(--brand-light));
    flex-shrink: 0;
  }
  .gcard-actions { display: flex; gap: 5px; }

  .gcard-name { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 3px; }
  .dark-mode .gcard-name { color: #f5f5f7; }

  .status-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 99px; font-size: 10px; font-weight: 700;
  }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; }

  .meta-rows { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; }
  .meta-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: var(--radius-sm);
    background: var(--brand-pale); font-size: 12px; font-weight: 500;
    color: #374151;
  }
  .dark-mode .meta-row { background: rgba(66,122,67,.1); color: rgba(255,255,255,.7); }
  .meta-row svg { flex-shrink: 0; opacity: .6; }

  .progress-section { margin-bottom: 12px; }
  .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
  .progress-label { font-size: 11px; color: #9ca3af; font-weight: 600; }
  .progress-count { font-size: 12px; font-weight: 700; color: var(--brand); }
  .progress-track { height: 4px; background: var(--brand-pale2); border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--brand-dark), var(--brand-light)); transition: width .7s ease; }

  .price-row { display: flex; gap: 8px; margin-bottom: 14px; }
  .price-chip {
    flex: 1; padding: 8px 10px; border-radius: var(--radius-sm);
    background: var(--brand-pale); text-align: center;
  }
  .price-chip-label { font-size: 10px; color: #9ca3af; font-weight: 600; }
  .price-chip-val { font-size: 13px; font-weight: 700; color: #111; margin-top: 2px; }
  .dark-mode .price-chip-val { color: #f5f5f7; }

  .gcard-footer { display: flex; align-items: center; justify-content: space-between; }

  /* Expand panel – students inside card */
  .expand-panel {
    max-height: 0; overflow: hidden;
    transition: max-height .35s cubic-bezier(.4,0,.2,1);
    border-top: 1px solid transparent;
  }
  .expand-panel.open {
    max-height: 500px;
    border-color: rgba(66,122,67,.1);
  }
  .expand-inner { padding: 16px; }
  .expand-title { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
  .student-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: var(--radius-sm);
    transition: var(--transition);
  }
  .student-row:hover { background: var(--brand-pale); }
  .s-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  .s-name { font-size: 13px; font-weight: 600; color: #111; flex: 1; }
  .dark-mode .s-name { color: #f0f0f0; }
  .s-contact { font-size: 11px; color: #9ca3af; }
  .empty-students { text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; }

  /* List view */
  .lcard {
    background: #fff; border: 1px solid rgba(66,122,67,.1);
    border-radius: var(--radius-lg); overflow: hidden;
    box-shadow: var(--shadow-card); animation: fadeUp .3s ease both;
  }
  .dark-mode .lcard { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.07); }

  .lcard-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; cursor: pointer; transition: var(--transition);
  }
  .lcard-row:hover { background: var(--brand-pale); }

  /* Modal Overlay */
  .overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,.5);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }

  .modal {
    width: 100%; max-width: 560px;
    background: #fff; border-radius: var(--radius-xl);
    border: 1px solid rgba(66,122,67,.12);
    box-shadow: var(--shadow-modal);
    max-height: 90vh; display: flex; flex-direction: column;
    animation: fadeIn .2s cubic-bezier(.34,1.56,.64,1) both;
  }
  .dark-mode .modal { background: #18181b; border-color: rgba(255,255,255,.08); }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid rgba(66,122,67,.1); flex-shrink: 0;
  }
  .dark-mode .modal-header { border-color: rgba(255,255,255,.07); }
  .modal-title { font-size: 18px; font-weight: 700; color: #111; }
  .dark-mode .modal-title { color: #f5f5f7; }
  .modal-body { padding: 20px 22px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }

  /* Form */
  .field label { display: block; font-size: 11px; font-weight: 700; color: #9ca3af; margin-bottom: 5px; text-transform: uppercase; letter-spacing: .04em; }
  .field input, .field select {
    width: 100%; padding: 10px 13px;
    border: 1px solid rgba(66,122,67,.15); border-radius: var(--radius-md);
    background: var(--brand-pale); color: #111;
    font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif;
    outline: none; transition: var(--transition);
  }
  .dark-mode .field input, .dark-mode .field select { background: rgba(255,255,255,.06); color: #f0f0f0; border-color: rgba(255,255,255,.1); }
  .field input:focus, .field select:focus {
    border-color: var(--brand); background: #fff;
    box-shadow: 0 0 0 3px rgba(66,122,67,.1);
  }
  .dark-mode .field input:focus, .dark-mode .field select:focus { background: rgba(255,255,255,.1); }

  .field select { cursor: pointer; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .modal-footer {
    display: flex; gap: 10px; padding: 16px 22px;
    border-top: 1px solid rgba(66,122,67,.1); flex-shrink: 0;
  }
  .dark-mode .modal-footer { border-color: rgba(255,255,255,.07); }

  .err-banner {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 13px; border-radius: var(--radius-md);
    background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
    font-size: 13px; color: #dc2626; font-weight: 500;
  }

  /* Students modal */
  .smodal { max-width: 520px; }

  .stabs { display: flex; gap: 4px; padding: 14px 22px 0; flex-shrink: 0; }
  .stab {
    padding: 7px 16px; border-radius: var(--radius-md) var(--radius-md) 0 0;
    font-size: 13px; font-weight: 600; cursor: pointer; border: none;
    background: transparent; color: #9ca3af; transition: var(--transition);
    border-bottom: 2px solid transparent;
  }
  .stab.active { color: var(--brand); border-bottom-color: var(--brand); }

  .search-sm {
    display: flex; align-items: center; gap: 8px; padding: 8px 12px;
    border-radius: var(--radius-md); background: var(--brand-pale);
    border: 1px solid transparent; margin-bottom: 10px;
  }
  .search-sm:focus-within { border-color: rgba(66,122,67,.3); background: #fff; }
  .search-sm input { border: none; outline: none; background: transparent; flex: 1; font-size: 13px; color: #111; font-family: 'Outfit', sans-serif; }
  .dark-mode .search-sm input { color: #f0f0f0; }

  /* Room picker */
  .room-btn {
    width: 100%; padding: 10px 13px; border-radius: var(--radius-md);
    background: var(--brand-pale); border: 1.5px solid rgba(66,122,67,.2);
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: #374151; text-align: left;
    transition: var(--transition); font-family: 'Outfit', sans-serif;
  }
  .room-btn:hover { border-color: var(--brand); background: #fff; }
  .room-btn.selected { border-color: var(--brand); background: rgba(66,122,67,.05); color: var(--brand); }
  .dark-mode .room-btn { color: rgba(255,255,255,.7); }

  /* Calendar */
  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 3px; margin: 10px 0; }
  .cal-day-hdr { text-align: center; font-size: 10px; font-weight: 700; color: #9ca3af; padding: 4px 0; }
  .cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; background: transparent; color: #374151; transition: var(--transition);
    font-family: 'Outfit', sans-serif;
  }
  .dark-mode .cal-day { color: rgba(255,255,255,.8); }
  .cal-day:hover:not(.selected-day) { background: var(--brand-pale); }
  .cal-day.selected-day { background: linear-gradient(135deg, var(--brand-dark), var(--brand-light)); color: #fff; }

  /* Delete modal */
  .del-modal { max-width: 360px; padding: 32px; text-align: center; }
  .del-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(239,68,68,.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px; border-radius: var(--radius-lg);
    font-size: 13px; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,.12);
    animation: fadeUp .3s ease both;
  }
  .toast.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
  .toast.error   { background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; }

  /* Loading skeleton */
  .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: pulse 1.5s ease infinite; border-radius: var(--radius-md); }

  /* Empty */
  .empty-state { text-align: center; padding: 80px 20px; }
  .empty-icon { width: 72px; height: 72px; border-radius: 50%; background: var(--brand-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }

  /* Room picker modal */
  .step-tabs { display: flex; gap: 0; margin-bottom: 16px; background: var(--brand-pale); border-radius: var(--radius-md); padding: 3px; }
  .step-tab { flex: 1; padding: 7px; text-align: center; font-size: 12px; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; border: none; background: transparent; color: #9ca3af; font-family: 'Outfit', sans-serif; transition: var(--transition); }
  .step-tab.active { background: #fff; color: var(--brand); box-shadow: 0 1px 4px rgba(0,0,0,.08); }

  .day-btns { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; margin-bottom: 14px; }
  .day-btn { padding: 9px 0; border-radius: var(--radius-sm); border: none; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: var(--transition); }
  .day-btn.on  { background: linear-gradient(135deg, var(--brand-dark), var(--brand-light)); color: #fff; }
  .day-btn.off { background: var(--brand-pale); color: #9ca3af; }

  .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .time-btn { padding: 11px; border-radius: var(--radius-md); border: 1.5px solid rgba(66,122,67,.15); font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: var(--transition); background: var(--brand-pale); color: #374151; }
  .time-btn.on { background: linear-gradient(135deg, var(--brand-dark), var(--brand-light)); color: #fff; border-color: transparent; }

  .room-card { padding: 13px 14px; border-radius: var(--radius-lg); border: 1.5px solid rgba(66,122,67,.12); cursor: pointer; margin-bottom: 8px; transition: var(--transition); background: #fff; display: flex; align-items: center; gap: 12px; }
  .dark-mode .room-card { background: rgba(255,255,255,.04); }
  .room-card:hover { border-color: var(--brand); }
  .room-card.on { border-color: var(--brand); background: rgba(66,122,67,.04); }
`;

// ── COMPONENTS ─────────────────────────────────────────────

function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <ICheck /> : <IX />}
      {msg}
    </div>
  );
}

function Avatar({ name, size = 40, round = false }) {
  const [fg, bg] = avatarColor(name);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: round ? '50%' : 10,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.34, color: fg, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function StatCard({ label, value, icon, color, pale, delay = 0 }) {
  const isDark = document.documentElement.classList.contains('dark-mode');
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon" style={{ background: pale }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-val" style={{ color }}>{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.active;
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="status-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function ProgressBar({ value, max }) {
  const pct = max ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-label">O'quvchilar</span>
        <span className="progress-count">{value}/{max}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Calendar picker
function CalendarPicker({ startDate, endDate, onChange, onClose }) {
  const [view, setView] = useState(startDate ? new Date(startDate) : new Date());
  const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const fmtDS = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const click = (d) => {
    const ds = fmtDS(year, month, d);
    if (!startDate || (startDate && endDate)) { onChange('startDate', ds); onChange('endDate', ''); }
    else { ds >= startDate ? onChange('endDate', ds) : (onChange('startDate', ds), onChange('endDate', '')); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal anim-in" style={{ maxWidth: 320, padding: 20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:13 }} onClick={() => setView(new Date(year, month-1, 1))}>‹</button>
          <span style={{ fontWeight:700, fontSize:14, color:'#111' }}>{months[month]} {year}</span>
          <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:13 }} onClick={() => setView(new Date(year, month+1, 1))}>›</button>
        </div>
        <div className="cal-grid">
          {['Du','Se','Ch','Pa','Ju','Sh','Ya'].map(d => <div key={d} className="cal-day-hdr">{d}</div>)}
          {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`}/>)}
          {Array.from({length: daysInMonth}, (_,i) => i+1).map(d => {
            const ds = fmtDS(year, month, d);
            const isS = ds === startDate, isE = ds === endDate;
            return <button key={d} className={`cal-day ${isS||isE?'selected-day':''}`} onClick={() => click(d)}>{d}</button>;
          })}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          <button className="btn btn-ghost" style={{ flex:1, padding:'9px' }} onClick={() => {onChange('startDate',''); onChange('endDate','');}}>Tozalash</button>
          <button className="btn btn-primary" style={{ flex:1, padding:'9px' }} disabled={!startDate||!endDate} onClick={onClose}>Tasdiqlash</button>
        </div>
      </div>
    </div>
  );
}

// Room Picker
function RoomPickerModal({ formData, setFormData, onClose, rooms }) {
  const [step, setStep] = useState('days');
  const [days, setDays] = useState(formData._days || []);
  const [time, setTime] = useState(formData._timeSlot || '10:00-12:00');
  const [freeRooms, setFreeRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDay = d => setDays(prev => prev.includes(d) ? prev.filter(x => x!==d) : [...prev, d]);

  const findRooms = async () => {
    if (!days.length) return;
    setLoading(true);
    try {
      const res = await apiService.getFreeRooms(days, [TIME_SLOTS.find(t=>t.value===time)?.api||'10:00']);
      setFreeRooms(Array.isArray(res) ? res : (res?.availableRooms || rooms));
      setStep('rooms');
    } finally { setLoading(false); }
  };

  const pick = (room) => {
    setFormData(p => ({ ...p, roomId: room.id, _timeSlot: time, _days: days }));
    onClose();
  };

  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal anim-in" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="grp-logo"><IDoor /></div>
            <div>
              <div className="modal-title">Xona tanlash</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>Kun va vaqt bo'yicha</div>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><IX /></button>
        </div>

        <div style={{ padding:'12px 22px 0' }}>
          <div className="step-tabs">
            {['days','time','rooms'].map((s,i) => (
              <button key={s} className={`step-tab ${step===s?'active':''}`}
                onClick={() => { if(i===0||(i===1&&days.length)||(i===2&&freeRooms.length)) setStep(s); }}>
                {['1. Kunlar','2. Vaqt','3. Xona'][i]}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {step === 'days' && (
            <>
              <p style={{ fontSize:13, color:'#9ca3af', marginBottom:8 }}>Guruh qaysi kunlari dars bo'ladi?</p>
              <div className="day-btns">
                {DAYS.map(d => (
                  <button key={d.v} className={`day-btn ${days.includes(d.v)?'on':'off'}`} onClick={() => toggleDay(d.v)}>{d.l}</button>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width:'100%', padding:'11px', marginTop:4 }}
                disabled={!days.length} onClick={() => setStep('time')}>Davom etish →</button>
            </>
          )}

          {step === 'time' && (
            <>
              <p style={{ fontSize:13, color:'#9ca3af', marginBottom:8 }}>Dars vaqtini tanlang:</p>
              <div className="time-grid">
                {TIME_SLOTS.map(t => (
                  <button key={t.value} className={`time-btn ${time===t.value?'on':''}`} onClick={() => setTime(t.value)}>{t.label}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" style={{ flex:1, padding:'10px' }} onClick={() => setStep('days')}>← Orqaga</button>
                <button className="btn btn-primary" style={{ flex:2, padding:'10px' }} disabled={loading} onClick={findRooms}>
                  {loading ? 'Tekshirilmoqda...' : "Bo'sh xonalar →"}
                </button>
              </div>
            </>
          )}

          {step === 'rooms' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <p style={{ fontSize:13, color:'#9ca3af' }}>{freeRooms.length} ta xona topildi</p>
                <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => setStep('time')}>← Qayta</button>
              </div>
              {freeRooms.length === 0 ? (
                <div className="empty-students">Bu vaqtda bo'sh xona yo'q</div>
              ) : freeRooms.map(room => (
                <div key={room.id} className={`room-card ${formData.roomId===room.id?'on':''}`} onClick={() => pick(room)}>
                  <div className="grp-logo" style={{ width:36, height:36, borderRadius:8 }}><IDoor /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#111' }}>{room.name}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>#{room.number} · {room.capacity} kishi</div>
                  </div>
                  {formData.roomId === room.id && <span style={{ color:'var(--brand)', fontWeight:700, fontSize:12 }}>✓</span>}
                </div>
              ))}
              {formData.roomId && (
                <button className="btn" style={{ width:'100%', marginTop:8, padding:'9px', color:'#ef4444', background:'rgba(239,68,68,.08)', borderRadius:10, fontSize:12 }}
                  onClick={() => { setFormData(p=>({...p,roomId:'',_days:[],_timeSlot:'10:00-12:00'})); onClose(); }}>
                  Xonani olib tashlash
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Group Form Modal
function GroupModal({ open, onClose, isEdit, form, setForm, onSubmit, loading, error, courses, teachers, rooms }) {
  const [calOpen, setCalOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  if (!open) return null;
  const selectedRoom = rooms.find(r => r.id === form.roomId);

  const F = ({ label, children }) => <div className="field">{label && <label>{label}</label>}{children}</div>;

  return (
    <>
      <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal anim-in">
          <div className="modal-header">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="grp-logo">{isEdit ? <IEdit /> : <IPlus />}</div>
              <div className="modal-title">{isEdit ? 'Guruhni tahrirlash' : 'Yangi guruh'}</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}><IX /></button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body">
              {error && <div className="err-banner"><IAlert />{error}</div>}

              <F label="Guruh nomi *">
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Masalan: JavaScript Pro #1" />
              </F>

              <div className="grid2">
                <F label="Kurs *">
                  <select value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>
                    <option value="">— Tanlang —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title||c.name}</option>)}
                  </select>
                </F>
                <F label="O'qituvchi *">
                  <select value={form.teacherId} onChange={e=>setForm({...form,teacherId:e.target.value})}>
                    <option value="">— Tanlang —</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.name||t.name}</option>)}
                  </select>
                </F>
              </div>

              <div className="grid2">
                <F label="Boshlanish *">
                  <input readOnly value={form.startDate ? fmt(form.startDate) : ''} onClick={()=>setCalOpen(true)} placeholder="Sanani tanlang" style={{ cursor:'pointer' }} />
                </F>
                <F label="Tugash *">
                  <input readOnly value={form.endDate ? fmt(form.endDate) : ''} onClick={()=>setCalOpen(true)} placeholder="Sanani tanlang" style={{ cursor:'pointer' }} />
                </F>
              </div>

              <F label="Xona (ixtiyoriy)">
                <button type="button" className={`room-btn ${form.roomId?'selected':''}`} onClick={()=>setRoomOpen(true)}>
                  <IDoor />
                  <span style={{ flex:1 }}>{selectedRoom ? `${selectedRoom.name} (${selectedRoom.number})` : "Bo'sh xona tanlash..."}</span>
                  <IChevR />
                </button>
              </F>

              <div className="grid2">
                <F label="Max o'quvchi *">
                  <input type="number" min="1" value={form.maxStudents} onChange={e=>setForm({...form,maxStudents:e.target.value})} />
                </F>
                <F label="Oylik narx (so'm) *">
                  <input type="number" min="0" value={form.monthlyPrice} onChange={e=>setForm({...form,monthlyPrice:e.target.value})} />
                </F>
                <F label="Darslar/oy *">
                  <input type="number" min="1" max="31" value={form.lessonsPerMonth} onChange={e=>setForm({...form,lessonsPerMonth:e.target.value})} />
                </F>
                <F label="Holat">
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="active">Faol</option>
                    <option value="completed">Tugallangan</option>
                    <option value="cancelled">Bekor qilingan</option>
                  </select>
                </F>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" style={{ flex:1, padding:'11px' }} onClick={onClose}>Bekor</button>
              <button type="submit" className="btn btn-primary" style={{ flex:2, padding:'11px' }} disabled={loading}>
                {loading ? <><span className="spin"><IRefresh /></span> Saqlanmoqda...</> : <><ISave /> {isEdit ? 'Saqlash' : 'Yaratish'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {calOpen && <CalendarPicker startDate={form.startDate} endDate={form.endDate}
        onChange={(f,v) => setForm(p=>({...p,[f]:v}))} onClose={()=>setCalOpen(false)} />}
      {roomOpen && <RoomPickerModal formData={form} setFormData={setForm} rooms={rooms} onClose={()=>setRoomOpen(false)} />}
    </>
  );
}

// Students Modal – soddalashtirilgan
function StudentsModal({ group, students, onAdd, onRemove, onClose }) {
  const [tab, setTab] = useState('in');
  const [search, setSearch] = useState('');
  if (!group) return null;

  const inGroup = students.filter(s => s.groupId === group.id);
  const others  = students.filter(s => {
    if (s.groupId === group.id) return false;
    const q = search.toLowerCase();
    return !q || sName(s).toLowerCase().includes(q) || sCont(s).toLowerCase().includes(q);
  });

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal smodal anim-in">
        <div className="modal-header">
          <div>
            <div className="modal-title">{group.name}</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>O'quvchilarni boshqarish</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><IX /></button>
        </div>

        <div className="stabs">
          <button className={`stab ${tab==='in'?'active':''}`} onClick={()=>setTab('in')}>
            Guruhda ({inGroup.length})
          </button>
          <button className={`stab ${tab==='add'?'active':''}`} onClick={()=>setTab('add')}>
            Qo'shish
          </button>
        </div>

        <div className="modal-body" style={{ gap:6 }}>
          {tab === 'add' && (
            <div className="search-sm">
              <ISearch /><input placeholder="Ism yoki telefon..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          )}

          {tab === 'in' && inGroup.length === 0 && (
            <div className="empty-students">Guruhda hali o'quvchi yo'q</div>
          )}

          {(tab === 'in' ? inGroup : others).map(s => (
            <div key={s.id} className="student-row">
              <Avatar name={sName(s)} size={34} round />
              <div style={{ flex:1, minWidth:0 }}>
                <div className="s-name" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sName(s)}</div>
                <div className="s-contact">{sCont(s)}</div>
              </div>
              {tab === 'in' ? (
                <button className="btn btn-icon danger" onClick={()=>onRemove(s.id)}><ITrash /></button>
              ) : (
                <button className="btn btn-icon" style={{ background:'rgba(66,122,67,.1)', color:'var(--brand)' }} onClick={()=>onAdd(s.id)}>
                  <IUserP />
                </button>
              )}
            </div>
          ))}

          {tab === 'add' && others.length === 0 && (
            <div className="empty-students">{search ? 'Topilmadi' : "Boshqa o'quvchi yo'q"}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Delete confirm
function DeleteModal({ groupId, onConfirm, onCancel }) {
  if (!groupId) return null;
  return (
    <div className="overlay">
      <div className="modal del-modal anim-in">
        <div className="del-icon"><IAlert /></div>
        <div className="modal-title" style={{ marginBottom:8 }}>Guruhni o'chirish</div>
        <p style={{ fontSize:13, color:'#9ca3af', marginBottom:24 }}>Bu amalni bekor qilib bo'lmaydi.</p>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" style={{ flex:1, padding:'11px' }} onClick={onCancel}>Bekor</button>
          <button className="btn" style={{ flex:1, padding:'11px', background:'#ef4444', color:'#fff', borderRadius:12, fontSize:13, fontWeight:700 }} onClick={onConfirm}>O'chirish</button>
        </div>
      </div>
    </div>
  );
}

// Group Card (Grid View)
function GroupCard({ group, isAdmin, onEdit, onDelete, onStudents, isSelected, onSelect, getCourseName, getTeacherName, getRoomName, isDark, students }) {
  const [expanded, setExpanded] = useState(false);
  const count = students ? students.filter(s => s.groupId === group.id).length : (group.currentStudents || 0);
  const roomName = getRoomName(group.roomId);
  const groupStudents = students ? students.filter(s => s.groupId === group.id) : [];

  const handleClick = () => {
    setExpanded(p => !p);
    onSelect(group);
  };

  return (
    <div className={`gcard anim-up ${isSelected ? 'selected' : ''}`} style={{ animationDelay: `${Math.random() * 80}ms` }}>
      <div className="gcard-accent" />
      <div className="gcard-body">
        <div className="gcard-top">
          <div className="gcard-avatar">{(group.name?.[0] || 'G').toUpperCase()}</div>
          {isAdmin && (
            <div className="gcard-actions" onClick={e => e.stopPropagation()}>
              <button className="btn btn-icon" onClick={() => onStudents(group)} title="O'quvchilar">
                <IUsers />
              </button>
              <button className="btn btn-icon" onClick={() => onEdit(group)} title="Tahrirlash">
                <IEdit />
              </button>
              <button className="btn btn-icon danger" onClick={() => onDelete(group.id)} title="O'chirish">
                <ITrash />
              </button>
            </div>
          )}
        </div>

        <div className="gcard-name">{group.name}</div>

        <div className="meta-rows" onClick={handleClick} style={{ cursor:'pointer' }}>
          <div className="meta-row"><IBook />{getCourseName(group.courseId)}</div>
          <div className="meta-row"><IGrad />{getTeacherName(group.teacherId)}</div>
          <div className="meta-row"><ICal />{fmt(group.startDate)} → {fmt(group.endDate)}</div>
          {roomName !== '—' && <div className="meta-row"><IDoor />{roomName}</div>}
        </div>

        <ProgressBar value={count} max={group.maxStudents} />

        <div className="price-row">
          <div className="price-chip">
            <div className="price-chip-label">Oylik</div>
            <div className="price-chip-val">{money(group.monthlyPrice)} so'm</div>
          </div>
          <div className="price-chip">
            <div className="price-chip-label">Darslar/oy</div>
            <div className="price-chip-val">{group.lessonsPerMonth || 8} marta</div>
          </div>
        </div>

        <div className="gcard-footer">
          <StatusBadge status={group.status} />
          <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:12 }} onClick={handleClick}>
            {expanded ? <><IChevU /> Yopish</> : <><IChevD /> O'quvchilar</>}
          </button>
        </div>
      </div>

      {/* Inline expand – o'quvchilar */}
      <div className={`expand-panel ${expanded ? 'open' : ''}`}>
        <div className="expand-inner">
          <div className="expand-title">O'quvchilar · {groupStudents.length} ta</div>
          {groupStudents.length === 0 ? (
            <div className="empty-students" style={{ padding:'12px 0' }}>Hali hech kim yo'q</div>
          ) : groupStudents.map(s => (
            <div key={s.id} className="student-row">
              <Avatar name={sName(s)} size={30} round />
              <div style={{ flex:1, minWidth:0 }}>
                <div className="s-name" style={{ fontSize:12 }}>{sName(s)}</div>
                <div className="s-contact">{sCont(s)}</div>
              </div>
            </div>
          ))}
          {isAdmin && (
            <button className="btn btn-ghost" style={{ width:'100%', marginTop:10, padding:'8px', fontSize:12 }}
              onClick={() => onStudents(group)}>
              <IUserP /> O'quvchi qo'shish / boshqarish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Group Row (List View)
function GroupRow({ group, isAdmin, onEdit, onDelete, onStudents, getCourseName, getTeacherName, isDark, students }) {
  const [expanded, setExpanded] = useState(false);
  const count = students ? students.filter(s => s.groupId === group.id).length : 0;
  const groupStudents = students ? students.filter(s => s.groupId === group.id) : [];

  return (
    <div className="lcard">
      <div className="lcard-row" onClick={() => setExpanded(p => !p)}>
        <div className="gcard-avatar" style={{ width:38, height:38 }}>{(group.name?.[0]||'G').toUpperCase()}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{group.name}</div>
          <div style={{ fontSize:12, color:'#9ca3af' }}>{getCourseName(group.courseId)} · {getTeacherName(group.teacherId)}</div>
        </div>
        <StatusBadge status={group.status} />
        <div style={{ fontSize:12, fontWeight:700, color:'var(--brand)', minWidth:60, textAlign:'right' }}>{count}/{group.maxStudents}</div>
        {isAdmin && (
          <div style={{ display:'flex', gap:5 }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-icon" onClick={() => onStudents(group)}><IUsers /></button>
            <button className="btn btn-icon" onClick={() => onEdit(group)}><IEdit /></button>
            <button className="btn btn-icon danger" onClick={() => onDelete(group.id)}><ITrash /></button>
          </div>
        )}
        <span style={{ color:'#9ca3af' }}>{expanded ? <IChevU /> : <IChevD />}</span>
      </div>

      <div className={`expand-panel ${expanded ? 'open' : ''}`} style={{ borderTop: expanded ? '1px solid rgba(66,122,67,.1)' : 'none' }}>
        <div className="expand-inner">
          <div className="expand-title">O'quvchilar · {groupStudents.length} ta</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:6 }}>
            {groupStudents.length === 0 ? (
              <div className="empty-students" style={{ padding:'8px 0', textAlign:'left' }}>Hali hech kim yo'q</div>
            ) : groupStudents.map(s => (
              <div key={s.id} className="student-row">
                <Avatar name={sName(s)} size={28} round />
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="s-name" style={{ fontSize:12 }}>{sName(s)}</div>
                  <div className="s-contact">{sCont(s)}</div>
                </div>
              </div>
            ))}
          </div>
          {isAdmin && (
            <button className="btn btn-ghost" style={{ marginTop:10, padding:'7px 14px', fontSize:12 }}
              onClick={() => onStudents(group)}>
              <IUserP /> O'quvchi qo'shish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function Groups() {
  const { user }         = useAuth();
  const { isDarkMode }   = useTheme();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [groups,   setGroups]   = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [viewMode,     setViewMode]     = useState('grid');

  const [modalOpen,  setModalOpen]  = useState(false);
  const [isEdit,     setIsEdit]     = useState(false);
  const [editGroup,  setEditGroup]  = useState(null);
  const [form,       setForm]       = useState(INIT_FORM);
  const [formErr,    setFormErr]    = useState('');
  const [formLoad,   setFormLoad]   = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [studentsModal, setStudentsModal] = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [g, c, t, s, r] = await Promise.all([
        apiService.getGroups(),
        apiService.getCourses().catch(() => []),
        apiService.getTeachers().catch(() => []),
        apiService.getStudents().catch(() => []),
        apiService.getRooms().catch(() => []),
      ]);
      setGroups(normalize(g, 'groups'));
      setCourses(normalize(c, 'courses'));
      setTeachers(normalize(t, 'teachers'));
      setStudents(normalize(s, 'students'));
      setRooms(normalize(r, 'rooms'));
    } catch (e) {
      showToast(e.message || 'Yuklashda xatolik', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const getCourseName  = id => { const c = courses.find(x => x.id === id); return c?.title || c?.name || '—'; };
  const getTeacherName = id => { const t = teachers.find(x => String(x.id||x._id) === String(id)); return t?.user?.name || t?.name || '—'; };
  const getRoomName    = id => { if (!id) return '—'; const r = rooms.find(x => x.id === id); return r ? `${r.name} (${r.number})` : '—'; };

  const openAdd = () => { setForm(INIT_FORM); setIsEdit(false); setEditGroup(null); setFormErr(''); setModalOpen(true); };
  const openEdit = g => {
    setForm({
      name: g.name||'', courseId: g.courseId||'', teacherId: g.teacherId||'',
      startDate: g.startDate ? new Date(g.startDate).toISOString().split('T')[0] : '',
      endDate:   g.endDate   ? new Date(g.endDate).toISOString().split('T')[0]   : '',
      maxStudents: g.maxStudents||20, status: g.status||'active',
      roomId: g.roomId||'', monthlyPrice: g.monthlyPrice||0,
      lessonsPerMonth: g.lessonsPerMonth||8, _timeSlot:'10:00-12:00', _days:[],
    });
    setIsEdit(true); setEditGroup(g); setFormErr(''); setModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setFormErr('');
    if (!form.name.trim())     return setFormErr('Guruh nomini kiriting');
    if (!form.courseId)        return setFormErr('Kursni tanlang');
    if (!form.teacherId)       return setFormErr("O'qituvchini tanlang");
    if (!form.startDate || !form.endDate) return setFormErr('Sanalarni tanlang');
    if (new Date(form.startDate) >= new Date(form.endDate)) return setFormErr('Sana noto\'g\'ri');

    const payload = {
      name: form.name.trim(), courseId: form.courseId, teacherId: form.teacherId,
      startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
      maxStudents: parseInt(form.maxStudents)||20, status: form.status,
      monthlyPrice: parseInt(form.monthlyPrice)||0, lessonsPerMonth: parseInt(form.lessonsPerMonth)||8,
      ...(form.roomId ? { roomId: form.roomId } : {}),
      ...(form._days.length > 0 ? { schedule: form._days.map(day => ({ day, active: true, timeSlot: form._timeSlot })) } : {}),
    };

    setFormLoad(true);
    try {
      isEdit ? await apiService.updateGroup(editGroup.id, payload) : await apiService.createGroup(payload);
      await fetchAll();
      setModalOpen(false);
      showToast(isEdit ? 'Guruh yangilandi' : 'Guruh yaratildi');
    } catch (e) { setFormErr(e.message||'Xatolik'); }
    finally { setFormLoad(false); }
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteGroup(deleteTarget);
      await fetchAll();
      setDeleteTarget(null);
      showToast("Guruh o'chirildi");
    } catch (e) { showToast(e.message||"O'chirishda xatolik", 'error'); }
  };

  const addStudent = async id => {
    try { await apiService.addStudentToGroup(studentsModal.id, id); await fetchAll(); showToast("O'quvchi qo'shildi"); }
    catch (e) { showToast(e.message||'Xatolik', 'error'); }
  };

  const removeStudent = async id => {
    try { await apiService.removeStudentFromGroup(studentsModal.id, id); await fetchAll(); showToast("O'quvchi olib tashlandi"); }
    catch (e) { showToast(e.message||'Xatolik', 'error'); }
  };

  const filtered = groups.filter(g => {
    if (search && !g.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (courseFilter !== 'all' && g.courseId !== courseFilter) return false;
    return true;
  });

  const stats = [
    { label: 'Jami guruhlar', value: groups.length, color:'#427A43', pale:'#f0f7f0', icon: <IGrid /> },
    { label: 'Faol guruhlar', value: groups.filter(g=>g.status==='active').length, color:'#16a34a', pale:'#dcfce7', icon: <ICheck /> },
    { label: "Jami o'quvchilar", value: students.filter(s=>s.groupId).length, color:'#1d4ed8', pale:'#dbeafe', icon: <IUsers /> },
    { label: "O'qituvchilar", value: teachers.length, color:'#d97706', pale:'#fef3c7', icon: <IGrad /> },
    { label: 'Xonalar', value: rooms.length, color:'#7c3aed', pale:'#ede9fe', icon: <IDoor /> },
  ];

  return (
    <>
      <GlobalStyles />
      <div className={`grp-root${isDarkMode ? ' dark-mode' : ''}`}>
        <Toast msg={toast?.msg} type={toast?.type} />

        {/* Header */}
        <header className="grp-header">
          <div className="grp-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <span className="grp-title">Guruhlar</span>

          <div className="search-box">
            <span style={{ color:'rgba(66,122,67,.5)', flexShrink:0 }}><ISearch /></span>
            <input placeholder="Guruh nomi..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>

          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            <button className="btn btn-ghost" style={{ width:36, height:36, padding:0 }}
              onClick={fetchAll} title="Yangilash">
              <span className={loading ? 'spin' : ''}><IRefresh /></span>
            </button>
            {isAdmin && (
              <button className="btn btn-primary" onClick={openAdd}>
                <IPlus /> Guruh qo'shish
              </button>
            )}
          </div>
        </header>

        {/* Filter bar */}
        <div className="filters">
          {[{v:'all',l:'Barchasi'},{v:'active',l:'Faol'},{v:'completed',l:'Tugallangan'},{v:'cancelled',l:'Bekor'}].map(f => (
            <button key={f.v} className={`filter-tab ${statusFilter===f.v?'active':''}`} onClick={()=>setStatusFilter(f.v)}>{f.l}</button>
          ))}

          <div style={{ display:'flex', alignItems:'center', gap:6, paddingLeft:12, borderLeft:'1px solid rgba(66,122,67,.12)' }}>
            <span style={{ color:'#9ca3af', flexShrink:0 }}><IFilter /></span>
            <select value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}
              style={{ border:'none', outline:'none', fontSize:12, fontWeight:600, color:'#374151', background:'transparent', cursor:'pointer', fontFamily:'Outfit, sans-serif' }}>
              <option value="all">Barcha kurslar</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title||c.name}</option>)}
            </select>
          </div>

          <span style={{ fontSize:12, color:'#9ca3af', marginLeft:8 }}>{filtered.length} natija</span>

          <div className="view-toggle">
            <button className={`vbtn ${viewMode==='grid'?'active':''}`} onClick={()=>setViewMode('grid')}><IGrid /></button>
            <button className={`vbtn ${viewMode==='list'?'active':''}`} onClick={()=>setViewMode('list')}><IList /></button>
          </div>
        </div>

        {/* Main */}
        <main className="grp-main">
          {/* Stats */}
          <div className="stats-row">
            {stats.map((s,i) => <StatCard key={i} {...s} delay={i*50} />)}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
              {Array(6).fill(0).map((_,i) => (
                <div key={i} style={{ background:'#fff', borderRadius:22, padding:20, border:'1px solid rgba(66,122,67,.1)' }}>
                  <div className="skeleton" style={{ width:44, height:44, borderRadius:12, marginBottom:14 }}/>
                  <div className="skeleton" style={{ height:16, width:'60%', marginBottom:8, borderRadius:6 }}/>
                  <div className="skeleton" style={{ height:12, width:'90%', marginBottom:6, borderRadius:6 }}/>
                  <div className="skeleton" style={{ height:12, width:'75%', borderRadius:6 }}/>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IGrid />
              </div>
              <div style={{ fontSize:20, fontWeight:700, color:'#374151', marginBottom:8 }}>
                {groups.length === 0 ? 'Hali guruh yaratilmagan' : 'Hech narsa topilmadi'}
              </div>
              <div style={{ fontSize:14, color:'#9ca3af', marginBottom:20 }}>
                {groups.length === 0 ? "Birinchi guruhingizni yarating" : "Qidiruv yoki filterni o'zgartiring"}
              </div>
              {isAdmin && groups.length === 0 && (
                <button className="btn btn-primary" style={{ padding:'11px 24px' }} onClick={openAdd}>
                  <IPlus /> Guruh yaratish
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="groups-grid">
              {filtered.map(g => (
                <GroupCard key={g.id} group={g} isAdmin={isAdmin}
                  onEdit={openEdit} onDelete={setDeleteTarget} onStudents={setStudentsModal}
                  isSelected={selectedGroup?.id === g.id}
                  onSelect={sel => setSelectedGroup(p => p?.id === sel.id ? null : sel)}
                  getCourseName={getCourseName} getTeacherName={getTeacherName} getRoomName={getRoomName}
                  isDark={isDarkMode} students={students}
                />
              ))}
            </div>
          ) : (
            <div className="groups-list">
              {filtered.map(g => (
                <GroupRow key={g.id} group={g} isAdmin={isAdmin}
                  onEdit={openEdit} onDelete={setDeleteTarget} onStudents={setStudentsModal}
                  getCourseName={getCourseName} getTeacherName={getTeacherName}
                  isDark={isDarkMode} students={students}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <GroupModal open={modalOpen} onClose={()=>setModalOpen(false)}
        isEdit={isEdit} form={form} setForm={setForm}
        onSubmit={handleSubmit} loading={formLoad} error={formErr}
        courses={courses} teachers={teachers} rooms={rooms} />

      <StudentsModal group={studentsModal} students={students}
        onAdd={addStudent} onRemove={removeStudent} onClose={()=>setStudentsModal(null)} />

      <DeleteModal groupId={deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} />
    </>
  );
}