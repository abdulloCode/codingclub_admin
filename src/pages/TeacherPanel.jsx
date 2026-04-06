import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Plus,
  Trash2,
  RotateCw,
  Calendar,
  Users,
  Layers,
  Clock,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
  GraduationCap,
  Settings,
  AlertCircle,
  Send,
  Star,
  Search,
} from 'lucide-react';

export default function TeacherPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode: D } = useTheme();

  const [active, setActive] = useState("dashboard");
  const [selHW, setSelHW] = useState(null);
  const [loading, setLoading] = useState(false);
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [attStats, setAttStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    rate: 0,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    groupId: "",
    dueDate: "",
    points: 100,
    imageFile: null,
    imagePreview: null,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [gradeInputs, setGradeInputs] = useState({});
  const [search, setSearch] = useState("");

  // ── THEME ─────────────────────────────────────────────────
  const C = {
    bg: D ? "#0c0c0e" : "#f8f9fb",
    sidebar: D ? "#111114" : "#ffffff",
    card: D ? "#18181c" : "#ffffff",
    card2: D ? "#1e1e24" : "#f4f4f6",
    border: D ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    text: D ? "#f2f2f3" : "#111112",
    muted: D ? "rgba(242,242,243,0.45)" : "rgba(17,17,18,0.45)",
    blue: "#3b82f6",
    green: "#22c55e",
    amber: "#f59e0b",
    red: "#ef4444",
  };

  // ── NAV ITEMS ─────────────────────────────────────────────
  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Davomat", icon: Calendar },
    {
      id: "homework",
      label: "Uy vazifalari",
      icon: FileText,
      badge: homeworks.length || null,
    },
    {
      id: "grading",
      label: "Baholash",
      icon: CheckCircle,
      badge: submissions.filter((s) => !s.graded).length || null,
    },
    {
      id: "groups",
      label: "Guruhlar",
      icon: Layers,
      badge: groups.length || null,
    },
  ];

  // ── LOADERS ───────────────────────────────────────────────
  const loadHomeworks = async () => {
    try {
      setLoading(true);
      const d = await apiService.getHomeworks().catch(() => []);
      setHomeworks(Array.isArray(d) ? d : d?.homeworks || d?.data || []);
    } catch {
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (id) => {
    try {
      const d = await apiService.getHomeworkSubmissions(id);
      setSubmissions(Array.isArray(d) ? d : d?.submissions || d?.data || []);
    } catch {
      setSubmissions([]);
    }
  };

  const loadGroups = async () => {
  try {
    console.log("🔍 FETCH TEACHER GROUPS START");
    
    // Avval teacher profilini olish
    const meData = await apiService.getMyTeacherData();
    console.log("👤 Teacher data:", meData);
    
    const teacherId = meData?.teacher?.id || meData?.id;
    console.log("🆔 Teacher profile ID:", teacherId);
    
    // Teacher profile id si bilan guruhlarni olish
    const d = await apiService.getTeacherGroups(teacherId);
    console.log("📋 Groups response:", d);
    
    const g = Array.isArray(d) ? d : d?.groups || d?.data || [];
    setGroups(g);
    console.log("✅ Groups loaded:", g.length);
  } catch (err) {
    console.error("❌ Error:", err);
    setGroups([]);
  }
};

  const loadAtt = async (grps) => {
    try {
      const all = [];
      for (const g of grps) {
        try {
          const d = await apiService.getGroupAttendanceRecords(g.id);
          all.push(...(Array.isArray(d) ? d : d?.data || []));
        } catch (err) {
          console.error(`Error loading attendance for group ${g.id}:`, err);
        }
      }
      const t = new Date();
      const ts = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
      const tod = all.filter((r) => r.date?.startsWith(ts));
      const present = tod.filter(
        (r) => r.status === "present" || r.status === "late",
      ).length;
      const absent = tod.filter((r) => r.status === "absent").length;
      const late = tod.filter((r) => r.status === "late").length;
      setAttStats({
        total: tod.length,
        present,
        absent,
        late,
        rate: tod.length ? Math.round((present / tod.length) * 100) : 0,
      });
    } catch (err) {
      console.error("Error loading attendance:", err);
      setAttStats({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
    }
  };

  useEffect(() => {
    console.log("🚀 TEACHER PANEL MOUNTING");
    console.log("🔍 LOADING INITIAL DATA: homeworks and groups");
    loadHomeworks();
    loadGroups();
  }, []);
  useEffect(() => {
    if (groups.length > 0) loadAtt(groups);
  }, [groups]);

  // ── ACTIONS ───────────────────────────────────────────────
  const createHW = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let imageUrl = null;
      if (form.imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", form.imageFile);
          const uploadResponse = await fetch(
            `${import.meta.env.VITE_API_URL || "https://blog-mrabdunozir-uz.onrender.com"}/api/upload`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              body: formData,
            },
          );
          if (!uploadResponse.ok) throw new Error("Rasm yuklashda xatolik");
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url || uploadData.imageUrl;
        } catch (err) {
          console.error("Rasm yuklashda xatolik:", err);
          alert("Rasm yuklashda xatolik. Vazifa rasmsiz yaratiladi.");
        }
      }
      await apiService.createHomework({
        ...form,
        deadline: form.dueDate,
        maxPoints: form.points,
        imageUrl,
      });
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        groupId: "",
        dueDate: "",
        points: 100,
        imageFile: null,
        imagePreview: null,
      });
      loadHomeworks();
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5MB dan katta bo'lmasligi kerak!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Faqat rasm fayllari yuklash mumkin!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm({ ...form, imageFile: file, imagePreview: reader.result });
    reader.readAsDataURL(file);
  };

  const deleteHW = async (id, e) => {
    e.stopPropagation();
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await apiService.deleteHomework(id);
      loadHomeworks();
    } catch (err) {
      alert(err.message);
    }
  };

  const grade = async (hwId, studentId, pts) => {
    const p = parseInt(pts);
    if (isNaN(p) || p < 0 || p > 100) {
      alert("0–100 oraliqda ball kiriting");
      return;
    }
    try {
      // POST /api/homework/:id/grade → { studentId, points }
      await apiService.gradeHomework(hwId, { studentId, points: p });
      loadSubmissions(hwId);
    } catch (err) {
      alert(err.message);
    }
  };
  const goTo = (id) => {
    setActive(id);
    setMobileOpen(false);
  };

  // ── HELPERS ───────────────────────────────────────────────
  const totalStudents = groups.reduce(
    (t, g) => t + (g.students?.length || g.currentStudents || 0),
    0,
  );
  const pendingGrade = submissions.filter((s) => !s.graded).length;
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ── STYLES ────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }

    .tp-shell { display:flex; height:100vh; overflow:hidden; background:${C.bg}; font-family:'Geist',system-ui,sans-serif; color:${C.text}; }

    /* sidebar */
    .tp-sidebar {
      width:240px; flex-shrink:0; height:100vh;
      background:${C.sidebar}; border-right:1px solid ${C.border};
      display:flex; flex-direction:column; overflow:hidden;
    }

    /* main */
    .tp-main { flex:1; min-width:0; height:100vh; display:flex; flex-direction:column; overflow:hidden; }

    .tp-topbar {
      height:56px; flex-shrink:0; background:${C.card};
      border-bottom:1px solid ${C.border};
      display:flex; align-items:center; justify-content:space-between; padding:0 20px;
    }

    .tp-body { flex:1; overflow-y:auto; padding:24px; }

    /* nav */
    .tp-nav-link {
      display:flex; align-items:center; gap:9px;
      padding:7px 10px; border-radius:6px;
      font-size:13.5px; font-weight:500; color:${C.muted};
      border:none; background:transparent; cursor:pointer; width:100%; text-align:left;
      transition:background 150ms, color 150ms; position:relative;
      font-family:'Geist',system-ui,sans-serif;
    }
    .tp-nav-link:hover { background:${D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}; color:${C.text}; }
    .tp-nav-link.active { background:${D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; color:${C.text}; font-weight:600; }
    .tp-nav-badge { margin-left:auto; font-size:10.5px; font-weight:700; padding:1px 6px; border-radius:99px; background:${D ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"}; color:${C.muted}; }
    .tp-nav-section { font-size:11px; font-weight:600; color:${C.muted}; letter-spacing:.06em; text-transform:uppercase; padding:16px 10px 6px; }

    /* cards */
    .tp-card  { background:${C.card};  border:1px solid ${C.border}; border-radius:10px; }
    .tp-card2 { background:${C.card2}; border:1px solid ${C.border}; border-radius:8px; }

    /* stat box */
    .tp-stat {
      background:${C.card}; border:1px solid ${C.border}; border-radius:10px;
      padding:18px 20px; display:flex; flex-direction:column; gap:8px;
      transition:box-shadow 200ms, transform 200ms;
    }
    .tp-stat:hover { box-shadow:0 4px 20px rgba(0,0,0,.07); transform:translateY(-1px); }

    /* table row */
    .tp-row {
      display:flex; align-items:center; gap:12px; padding:12px 16px;
      border-bottom:1px solid ${C.border}; transition:background 120ms;
    }
    .tp-row:last-child { border-bottom:none; }
    .tp-row:hover { background:${D ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}; }

    /* hw card */
    .tp-hw-card {
      background:${C.card}; border:1px solid ${C.border}; border-radius:10px;
      padding:16px; cursor:pointer;
      transition:box-shadow 180ms, border-color 180ms;
    }
    .tp-hw-card:hover { box-shadow:0 4px 24px rgba(0,0,0,.08); border-color:${D ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}; }

    /* buttons */
    .tp-btn { display:inline-flex; align-items:center; gap:6px; border:none; cursor:pointer; font-family:'Geist',system-ui,sans-serif; font-weight:500; transition:opacity 150ms, transform 120ms; }
    .tp-btn:hover { opacity:.88; }
    .tp-btn:active { transform:scale(.98); }
    .tp-btn-default  { background:${D ? "#27272a" : "#18181b"}; color:#fff; padding:7px 14px; border-radius:7px; font-size:13px; }
    .tp-btn-outline  { background:transparent; border:1px solid ${C.border}; color:${C.text}; padding:7px 14px; border-radius:7px; font-size:13px; }
    .tp-btn-outline:hover { background:${D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}; opacity:1; }
    .tp-btn-ghost    { background:transparent; border:none; color:${C.muted}; padding:5px 8px; border-radius:6px; font-size:13px; }
    .tp-btn-ghost:hover { background:${D ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}; color:${C.text}; opacity:1; }
    .tp-btn-del      { background:rgba(239,68,68,.1); color:#ef4444; padding:5px 8px; border-radius:6px; font-size:13px; border:none; }
    .tp-btn-del:hover { background:rgba(239,68,68,.18); opacity:1; }

    /* input */
    .tp-inp {
      width:100%; background:${D ? "#1e1e24" : "#fafafa"};
      border:1px solid ${C.border}; color:${C.text};
      border-radius:7px; padding:8px 11px; font-size:13.5px;
      font-family:'Geist',system-ui,sans-serif; outline:none;
      transition:border-color 150ms, box-shadow 150ms;
    }
    .tp-inp:focus { border-color:${D ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}; box-shadow:0 0 0 3px ${D ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}; }
    .tp-inp::placeholder { color:${C.muted}; }
    .tp-lbl { display:block; font-size:12px; font-weight:600; color:${C.text}; margin-bottom:6px; }

    /* badges */
    .tp-badge       { display:inline-flex; align-items:center; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:600; }
    .tp-badge-blue  { background:rgba(59,130,246,.12);  color:#2563eb; }
    .tp-badge-gray  { background:${D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}; color:${C.muted}; }
    .tp-badge-green { background:rgba(34,197,94,.12);   color:#16a34a; }
    .tp-badge-red   { background:rgba(239,68,68,.12);   color:#dc2626; }
    .tp-badge-amber { background:rgba(245,158,11,.12);  color:#d97706; }

    /* misc */
    .tp-avatar   { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .tp-divider  { height:1px; background:${C.border}; margin:0; }
    .tp-prog-t   { background:${D ? "#27272a" : "#e4e4e7"}; border-radius:99px; overflow:hidden; }
    .tp-prog-f   { height:100%; background:${C.text}; transition:width .4s ease; border-radius:99px; }

    /* overlay / drawer */
    .tp-overlay  { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(3px); z-index:50; }
    .tp-drawer   { position:fixed; top:0; left:0; bottom:0; width:240px; background:${C.sidebar}; border-right:1px solid ${C.border}; z-index:51; display:flex; flex-direction:column; }

    /* modal */
    .tp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); z-index:80; display:flex; align-items:center; justify-content:center; padding:20px; }

    /* empty */
    .tp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:56px 20px; gap:12px; text-align:center; }
    .tp-empty-icon { width:48px; height:48px; border-radius:12px; background:${C.card2}; display:flex; align-items:center; justify-content:center; }

    /* animations */
    @keyframes tp-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tp-spin  { to{transform:rotate(360deg)} }
    @keyframes tp-modal { from{opacity:0;transform:scale(.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .tp-enter { animation:tp-fade .25s ease both; }
    .tp-spin  { animation:tp-spin 1s linear infinite; }
    .tp-modal-enter { animation:tp-modal .2s ease both; }

    /* mobile */
    @media(max-width:768px) {
      .tp-sidebar { display:none; }
      .tp-body { padding:16px; }
      .tp-ham { display:flex !important; }
      .tp-stat-grid { grid-template-columns:1fr 1fr !important; }
    }
    .tp-ham { display:none; background:transparent; border:none; color:${C.muted}; cursor:pointer; padding:4px; align-items:center; }
  `;

  // ── SIDEBAR ───────────────────────────────────────────────
  const SidebarInner = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* brand */}
      <div
        style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "#427A43",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GraduationCap size={16} color="#fff" />
          </div>
          <div>
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              CodingClub
            </p>
            <p style={{ fontSize: 11, color: C.muted }}>O'qituvchi Paneli</p>
          </div>
        </div>
      </div>

      {/* user */}
      <div
        style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 10px",
            borderRadius: 7,
            background: D ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: D ? "#27272a" : "#f4f4f5",
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: C.text,
              flexShrink: 0,
            }}
          >
            {(user?.name || "T")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: C.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "O'qituvchi"}
            </p>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "teacher"}
            </p>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav
        style={{
          flex: 1,
          padding: "8px 10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <p className="tp-nav-section">Menyu</p>
        {NAV.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={`tp-nav-link ${active === id ? "active" : ""}`}
          >
            <span
              style={{
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge ? <span className="tp-nav-badge">{badge}</span> : null}
          </button>
        ))}
      </nav>

      {/* bottom */}
      <div style={{ padding: "10px", borderTop: `1px solid ${C.border}` }}>
        <button className="tp-nav-link">
          <span
            style={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Settings size={15} />
          </span>
          <span style={{ flex: 1 }}>Sozlamalar</span>
        </button>
        <button
          className="tp-nav-link"
          style={{ color: "#ef4444" }}
          onClick={async () => {
            if (window.confirm("Tizimdan chiqmoqchimisiz?")) {
              try {
                await logout();
                navigate("/login");
              } catch (err) {
                console.error("Chiqishda xatolik:", err);
                // Xatolik bo'lsa ham login sahifaga yuborish
                localStorage.removeItem("accessToken");
                navigate("/login");
              }
            }
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={15} />
          </span>
          <span style={{ flex: 1 }}>Chiqish</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>

      <div className="tp-shell">
        {/* sidebar */}
        <aside className="tp-sidebar">
          <SidebarInner />
        </aside>

        {/* mobile overlay */}
        {mobileOpen && (
          <>
            <div className="tp-overlay" onClick={() => setMobileOpen(false)} />
            <div className="tp-drawer">
              <SidebarInner />
            </div>
          </>
        )}

        {/* main */}
        <div className="tp-main">
          {/* topbar */}
          <header className="tp-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="tp-ham" onClick={() => setMobileOpen(true)}>
                <Menu size={20} />
              </button>
              <h1 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                {NAV.find((n) => n.id === active)?.label}
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {active === "homework" && (
                <button
                  className="tp-btn tp-btn-default"
                  onClick={() => setShowModal(true)}
                  style={{ padding: "6px 12px", fontSize: 12.5 }}
                >
                  <Plus size={14} /> Yangi uy vazifasi
                </button>
              )}
              <button
                style={{
                  position: "relative",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Bell size={15} />
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    width: 6,
                    height: 6,
                    background: "#ef4444",
                    borderRadius: "50%",
                  }}
                />
              </button>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: D ? "#27272a" : "#f4f4f5",
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.text,
                  cursor: "pointer",
                }}
              >
                {(user?.name || "T")[0].toUpperCase()}
              </div>
            </div>
          </header>

          {/* page body */}
          <div className="tp-body">
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "50vh",
                }}
              >
                <RotateCw size={28} color={C.muted} className="tp-spin" />
              </div>
            ) : (
              <>
                {/* ══ DASHBOARD ══════════════════════════════ */}
                {active === "dashboard" && (
                  <div
                    className="tp-enter"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: C.text,
                          letterSpacing: "-.02em",
                        }}
                      >
                        Salom, {user?.name?.split(" ")[0] || "O'qituvchi"} 👋
                      </h2>
                      <p
                        style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}
                      >
                        {new Date().toLocaleDateString("uz-UZ", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* stat cards */}
                    <div
                      className="tp-stat-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 12,
                      }}
                    >
                      {[
                        {
                          label: "O'quvchilar",
                          value: totalStudents,
                          sub: "Jami",
                          icon: Users,
                          color: C.blue,
                        },
                        {
                          label: "Guruhlar",
                          value: groups.length,
                          sub: "Jami",
                          icon: Layers,
                          color: C.green,
                        },
                        {
                          label: "Uy vazifalari",
                          value: homeworks.length,
                          sub: "Jami",
                          icon: FileText,
                          color: C.amber,
                        },
                        {
                          label: "Baholash",
                          value: pendingGrade,
                          sub: "Kutilmoqda",
                          icon: AlertCircle,
                          color: C.red,
                        },
                      ].map(({ label, value, sub, icon: Icon, color }) => (
                        <div key={label} className="tp-stat">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12.5,
                                fontWeight: 500,
                                color: C.muted,
                              }}
                            >
                              {label}
                            </span>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: `${color}18`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon size={14} color={color} />
                            </div>
                          </div>
                          <p
                            style={{
                              fontSize: 28,
                              fontWeight: 700,
                              color: C.text,
                              lineHeight: 1,
                              letterSpacing: "-.02em",
                            }}
                          >
                            {value}
                          </p>
                          <span style={{ fontSize: 11.5, color: C.muted }}>
                            {sub}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* two-col */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      {/* recent homework */}
                      <div className="tp-card" style={{ overflow: "hidden" }}>
                        <div
                          style={{
                            padding: "14px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            So'nggi uy vazifalari
                          </p>
                          <button
                            className="tp-btn tp-btn-ghost"
                            style={{ fontSize: 12 }}
                            onClick={() => goTo("homework")}
                          >
                            Barchasini →
                          </button>
                        </div>
                        {homeworks.length === 0 ? (
                          <div className="tp-empty">
                            <div className="tp-empty-icon">
                              <FileText size={20} color={C.muted} />
                            </div>
                            <p style={{ fontSize: 13, color: C.muted }}>
                              Hozircha uy vazifalari yo'q
                            </p>
                          </div>
                        ) : (
                          homeworks.slice(0, 5).map((hw) => (
                            <div
                              key={hw.id}
                              className="tp-row"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setSelHW(hw);
                                loadSubmissions(hw.id);
                                goTo("grading");
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  background: `${C.blue}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <FileText size={14} color={C.blue} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: C.text,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {hw.title}
                                </p>
                                <p
                                  style={{
                                    fontSize: 11.5,
                                    color: C.muted,
                                    marginTop: 2,
                                  }}
                                >
                                  {hw.maxPoints || hw.points || 100} ball ·{" "}
                                  {fmtDate(hw.deadline || hw.dueDate)}
                                </p>
                              </div>
                              <ChevronRight size={14} color={C.muted} />
                            </div>
                          ))
                        )}
                      </div>

                      {/* groups */}
                      <div className="tp-card" style={{ overflow: "hidden" }}>
                        <div
                          style={{
                            padding: "14px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            Guruhlar
                          </p>
                          <button
                            className="tp-btn tp-btn-ghost"
                            style={{ fontSize: 12 }}
                            onClick={() => goTo("groups")}
                          >
                            Barchasini →
                          </button>
                        </div>
                        {groups.length === 0 ? (
                          <div
                            className="tp-empty"
                            style={{ padding: "40px 20px" }}
                          >
                            <div className="tp-empty-icon">
                              <Layers size={20} color={C.muted} />
                            </div>
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: C.text,
                                marginTop: 12,
                              }}
                            >
                              Sizga guruh tayinlanmagan
                            </p>
                            <p
                              style={{
                                fontSize: 13,
                                color: C.muted,
                                marginTop: 4,
                              }}
                            >
                              Admin panelidan guruh biriktiring
                            </p>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Admin paneliga o'tmoqchimisiz?",
                                  )
                                ) {
                                  window.open("/admin", "_blank");
                                }
                              }}
                              style={{
                                marginTop: 16,
                                padding: "10px 16px",
                                borderRadius: 8,
                                background: `linear-gradient(135deg,${C.blue},#2563eb)`,
                                border: "none",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#fff",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              <Users size={14} /> Admin paneliga o'tish
                            </button>
                          </div>
                        ) : (
                          groups.slice(0, 5).map((g) => (
                            <div key={g.id} className="tp-row">
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  background: D ? "#27272a" : "#f4f4f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: C.text,
                                  flexShrink: 0,
                                }}
                              >
                                {g.name?.substring(0, 2)?.toUpperCase() || "GR"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: C.text,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {g.name}
                                </p>
                                <p
                                  style={{
                                    fontSize: 11.5,
                                    color: C.muted,
                                    marginTop: 2,
                                  }}
                                >
                                  {g.currentStudents || 0}/{g.maxStudents || 20}{" "}
                                  o'quvchi
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══ ATTENDANCE ════════════════════════════ */}
                {active === "attendance" && (
                  <div
                    className="tp-enter"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {groups.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                        }}
                      >
                        <p style={{ fontSize: 14, color: C.muted }}>
                          Guruhlar topilmadi. Admin panelidan guruh yarating.
                        </p>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                          API: /api/teachers/me/groups | Status: {groups.length} ta guruh
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: C.text,
                            letterSpacing: "-.02em",
                          }}
                        >
                          Davomat
                        </h2>
                        <p
                          style={{ fontSize: 13, color: C.muted, marginTop: 3 }}
                        >
                          Bugungi davomat holati
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(150px,1fr))",
                        gap: 12,
                      }}
                    >
                      {[
                        {
                          label: "Keldi",
                          value: attStats.present,
                          color: C.green,
                          icon: CheckCircle,
                        },
                        {
                          label: "Kelmadi",
                          value: attStats.absent,
                          color: C.red,
                          icon: X,
                        },
                        {
                          label: "Kechikdi",
                          value: attStats.late,
                          color: C.amber,
                          icon: Clock,
                        },
                        {
                          label: "Jami",
                          value: attStats.total,
                          color: C.blue,
                          icon: Users,
                        },
                      ].map(({ label, value, color, icon: Icon }) => (
                        <div
                          key={label}
                          className="tp-stat"
                          style={{ alignItems: "flex-start" }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 7,
                              background: `${color}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={15} color={color} />
                          </div>
                          <p
                            style={{
                              fontSize: 30,
                              fontWeight: 700,
                              color: C.text,
                              lineHeight: 1,
                              letterSpacing: "-.02em",
                            }}
                          >
                            {value}
                          </p>
                          <p
                            style={{
                              fontSize: 12.5,
                              color: C.muted,
                              fontWeight: 500,
                            }}
                          >
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="tp-card" style={{ padding: "20px 22px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            Davomat foizi
                          </p>
                          <p
                            style={{
                              fontSize: 11.5,
                              color: C.muted,
                              marginTop: 2,
                            }}
                          >
                            Bugun barcha guruhlar bo'yicha
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: C.text,
                            letterSpacing: "-.03em",
                          }}
                        >
                          {attStats.rate}%
                        </span>
                      </div>
                      <div className="tp-prog-t" style={{ height: 8 }}>
                        <div
                          className="tp-prog-f"
                          style={{ width: `${attStats.rate}%` }}
                        />
                      </div>
                      <div
                        style={{
                          marginTop: 14,
                          display: "flex",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        {[
                          {
                            label: "Keldi",
                            pct: attStats.total
                              ? Math.round(
                                  (attStats.present / attStats.total) * 100,
                                )
                              : 0,
                            color: C.green,
                          },
                          {
                            label: "Kelmadi",
                            pct: attStats.total
                              ? Math.round(
                                  (attStats.absent / attStats.total) * 100,
                                )
                              : 0,
                            color: C.red,
                          },
                          {
                            label: "Kechikdi",
                            pct: attStats.total
                              ? Math.round(
                                  (attStats.late / attStats.total) * 100,
                                )
                              : 0,
                            color: C.amber,
                          },
                        ].map(({ label, pct, color }) => (
                          <div
                            key={label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: color,
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: 12.5, color: C.muted }}>
                              {label}:{" "}
                              <strong
                                style={{ color: C.text, fontWeight: 600 }}
                              >
                                {pct}%
                              </strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {groups.length > 0 && (
                      <div className="tp-card" style={{ overflow: "hidden" }}>
                        <div
                          style={{
                            padding: "14px 16px",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            Guruhlar bo'yicha
                          </p>
                        </div>
                        {groups.map((g) => {
                          const sc =
                            g.students?.length || g.currentStudents || 0;
                          const max = g.maxStudents || 20;
                          const pct = max ? Math.round((sc / max) * 100) : 0;
                          return (
                            <div key={g.id} className="tp-row">
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  background: D ? "#27272a" : "#f4f4f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: C.text,
                                  flexShrink: 0,
                                }}
                              >
                                {g.name?.substring(0, 2)?.toUpperCase() || "GR"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: C.text,
                                  }}
                                >
                                  {g.name}
                                </p>
                                <p
                                  style={{
                                    fontSize: 11.5,
                                    color: C.muted,
                                    marginTop: 2,
                                  }}
                                >
                                  {sc}/{max} o'quvchi
                                </p>
                              </div>
                              <div style={{ width: 100 }}>
                                <div
                                  className="tp-prog-t"
                                  style={{ height: 5 }}
                                >
                                  <div
                                    className="tp-prog-f"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: C.muted,
                                    textAlign: "right",
                                    marginTop: 3,
                                  }}
                                >
                                  {pct}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ HOMEWORK ══════════════════════════════ */}
                {active === "homework" && (
                  <div
                    className="tp-enter"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: C.text,
                            letterSpacing: "-.02em",
                          }}
                        >
                          Uy vazifalari
                        </h2>
                        <p
                          style={{ fontSize: 13, color: C.muted, marginTop: 3 }}
                        >
                          {homeworks.length} ta uy vazifasi
                        </p>
                      </div>
                      <div style={{ position: "relative" }}>
                        <Search
                          size={14}
                          style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: C.muted,
                          }}
                        />
                        <input
                          className="tp-inp"
                          placeholder="Qidirish..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{ paddingLeft: 32, width: 200 }}
                        />
                      </div>
                    </div>

                    {homeworks.length === 0 ? (
                      <div className="tp-card">
                        <div className="tp-empty">
                          <div className="tp-empty-icon">
                            <FileText size={22} color={C.muted} />
                          </div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            Uy vazifalari yo'q
                          </p>
                          <p style={{ fontSize: 13, color: C.muted }}>
                            Yuqoridagi "Yangi uy vazifasi" tugmasini bosing
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill,minmax(300px,1fr))",
                          gap: 14,
                        }}
                      >
                        {homeworks
                          .filter(
                            (hw) =>
                              !search ||
                              hw.title
                                ?.toLowerCase()
                                .includes(search.toLowerCase()),
                          )
                          .map((hw) => {
                            const grp = groups.find((g) => g.id === hw.groupId);
                            return (
                              <div
                                key={hw.id}
                                className="tp-hw-card"
                                onClick={() => {
                                  setSelHW(hw);
                                  loadSubmissions(hw.id);
                                  goTo("grading");
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 12,
                                  }}
                                >
                                  <div style={{ flex: 1, marginRight: 8 }}>
                                    <p
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: C.text,
                                        lineHeight: 1.3,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {hw.title}
                                    </p>
                                    {grp && (
                                      <p
                                        style={{
                                          fontSize: 11.5,
                                          color: C.muted,
                                          marginTop: 3,
                                        }}
                                      >
                                        {grp.name}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    className="tp-btn tp-btn-del"
                                    onClick={(e) => deleteHW(hw.id, e)}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <div
                                  className="tp-divider"
                                  style={{ margin: "12px 0" }}
                                />
                                <p
                                  style={{
                                    fontSize: 12.5,
                                    color: C.muted,
                                    lineHeight: 1.55,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    marginBottom: 12,
                                  }}
                                >
                                  {hw.description || "Tavsif yo'q"}
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    className="tp-badge tp-badge-gray"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Calendar size={10} />{" "}
                                    {fmtDate(hw.deadline || hw.dueDate)}
                                  </span>
                                  <span
                                    className="tp-badge tp-badge-blue"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Star size={10} />{" "}
                                    {hw.maxPoints || hw.points || 100} ball
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ GRADING ═══════════════════════════════ */}
                {active === "grading" && (
                  <div
                    className="tp-enter"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {!selHW ? (
                      <div className="tp-card">
                        <div className="tp-empty">
                          <div className="tp-empty-icon">
                            <CheckCircle size={22} color={C.muted} />
                          </div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            Topshiriq tanlanmagan
                          </p>
                          <p style={{ fontSize: 13, color: C.muted }}>
                            Baholash uchun "Uy vazifalari" bo'limidan birini
                            tanlang
                          </p>
                          <button
                            className="tp-btn tp-btn-default"
                            onClick={() => goTo("homework")}
                            style={{
                              marginTop: 4,
                              padding: "7px 16px",
                              borderRadius: 7,
                              fontSize: 13,
                            }}
                          >
                            Uy vazifalariga o'tish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <button
                            className="tp-btn tp-btn-ghost"
                            onClick={() => goTo("homework")}
                            style={{
                              marginBottom: 12,
                              fontSize: 13,
                              padding: "5px 0",
                            }}
                          >
                            ← Orqaga
                          </button>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                              gap: 12,
                            }}
                          >
                            <div>
                              <h2
                                style={{
                                  fontSize: 20,
                                  fontWeight: 700,
                                  color: C.text,
                                  letterSpacing: "-.02em",
                                }}
                              >
                                {selHW.title}
                              </h2>
                              <p
                                style={{
                                  fontSize: 13,
                                  color: C.muted,
                                  marginTop: 4,
                                }}
                              >
                                {selHW.description}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span
                                className="tp-badge tp-badge-gray"
                                style={{ alignItems: "center", gap: 4 }}
                              >
                                <Calendar size={10} />{" "}
                                {fmtDate(selHW.deadline || selHW.dueDate)}
                              </span>
                              <span
                                className="tp-badge tp-badge-blue"
                                style={{ alignItems: "center", gap: 4 }}
                              >
                                <Star size={10} />{" "}
                                {selHW.maxPoints || selHW.points || 100} ball
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="tp-card" style={{ overflow: "hidden" }}>
                          <div
                            style={{
                              padding: "14px 16px",
                              borderBottom: `1px solid ${C.border}`,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: C.text,
                              }}
                            >
                              Topshiriqlar
                            </p>
                            <span className="tp-badge tp-badge-gray">
                              {submissions.length} ta
                            </span>
                          </div>
                          {submissions.length === 0 ? (
                            <div className="tp-empty">
                              <div className="tp-empty-icon">
                                <Send size={20} color={C.muted} />
                              </div>
                              <p style={{ fontSize: 13, color: C.muted }}>
                                Hali hech kim topshirmagan
                              </p>
                            </div>
                          ) : (
                            submissions.map((s) => (
                              <div
                                key={s.id}
                                style={{
                                  padding: "16px",
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 10,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <div
                                      className="tp-avatar"
                                      style={{
                                        background: D ? "#27272a" : "#f4f4f5",
                                        color: C.text,
                                        fontSize: 12,
                                      }}
                                    >
                                      {(s.studentName || "O")[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p
                                        style={{
                                          fontSize: 13.5,
                                          fontWeight: 600,
                                          color: C.text,
                                        }}
                                      >
                                        {s.studentName || "O'quvchi"}
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 11.5,
                                          color: C.muted,
                                        }}
                                      >
                                        {fmtDate(s.submittedAt)}
                                      </p>
                                    </div>
                                  </div>
                                  {s.graded && (
                                    <span
                                      className={`tp-badge ${s.points >= 80 ? "tp-badge-green" : s.points >= 60 ? "tp-badge-amber" : "tp-badge-red"}`}
                                      style={{
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {s.points}/
                                      {selHW.maxPoints || selHW.points || 100}
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    background: C.card2,
                                    borderRadius: 7,
                                    padding: "10px 13px",
                                    marginBottom: s.graded ? 0 : 12,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      color: C.text,
                                      lineHeight: 1.6,
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {s.content}
                                  </p>
                                </div>
                                {!s.graded && (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      alignItems: "center",
                                      marginTop: 10,
                                    }}
                                  >
                                    <input
                                      className="tp-inp"
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="Ball (0–100)"
                                      style={{ width: 140 }}
                                      value={gradeInputs[s.id] || ""}
                                      onChange={(e) =>
                                        setGradeInputs((p) => ({
                                          ...p,
                                          [s.id]: e.target.value,
                                        }))
                                      }
                                    />
                                    <button
                                      className="tp-btn tp-btn-default"
                                      style={{
                                        padding: "8px 14px",
                                        borderRadius: 7,
                                        fontSize: 13,
                                      }}
                                      onClick={() => {
                                        grade(
                                          selHW.id,
                                          s.studentId,
                                          gradeInputs[s.id],
                                        );
                                        setGradeInputs((p) => ({
                                          ...p,
                                          [s.id]: "",
                                        }));
                                      }}
                                    >
                                      <CheckCircle size={13} /> Baholash
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ══ GROUPS ════════════════════════════════ */}
                {active === "groups" && (
                  <div
                    className="tp-enter"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: C.text,
                          letterSpacing: "-.02em",
                        }}
                      >
                        Guruhlar
                      </h2>
                      <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
                        {groups.length} ta guruh
                      </p>
                    </div>

                    {groups.length === 0 ? (
                      <div className="tp-card">
                        <div className="tp-empty">
                          <div className="tp-empty-icon">
                            <Layers size={22} color={C.muted} />
                          </div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            Guruhlar topilmadi
                          </p>
                          <p style={{ fontSize: 13, color: C.muted }}>
                            Admin tomonidan guruh tayinlanadi
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="tp-card" style={{ overflow: "hidden" }}>
                        {/* header */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 100px 100px 90px 80px",
                            gap: 12,
                            padding: "10px 16px",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          {[
                            "Guruh nomi",
                            "O'quvchilar",
                            "Kurs",
                            "Joy",
                            "Amallar",
                          ].map((h) => (
                            <p
                              key={h}
                              style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: C.muted,
                                textTransform: "uppercase",
                                letterSpacing: ".04em",
                              }}
                            >
                              {h}
                            </p>
                          ))}
                        </div>
                        {groups.map((g) => {
                          const sc =
                            g.students?.length || g.currentStudents || 0;
                          const max = g.maxStudents || 20;
                          const pct = max ? Math.round((sc / max) * 100) : 0;
                          return (
                            <div
                              key={g.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "1fr 100px 100px 90px 80px",
                                gap: 12,
                                padding: "13px 16px",
                                alignItems: "center",
                                borderBottom: `1px solid ${C.border}`,
                                transition: "background 120ms",
                                cursor: "default",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = D
                                  ? "rgba(255,255,255,0.02)"
                                  : "rgba(0,0,0,0.015)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 7,
                                    background: D ? "#27272a" : "#f4f4f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: C.text,
                                    flexShrink: 0,
                                  }}
                                >
                                  {g.name?.substring(0, 2)?.toUpperCase() ||
                                    "GR"}
                                </div>
                                <div>
                                  <p
                                    style={{
                                      fontSize: 13.5,
                                      fontWeight: 500,
                                      color: C.text,
                                    }}
                                  >
                                    {g.name}
                                  </p>
                                  {g.startDate && (
                                    <p
                                      style={{ fontSize: 11.5, color: C.muted }}
                                    >
                                      {fmtDate(g.startDate)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <p style={{ fontSize: 13, color: C.text }}>
                                {sc} / {max}
                              </p>
                              <p
                                style={{
                                  fontSize: 13,
                                  color: C.muted,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {g.courseTitle || g.course?.title || "—"}
                              </p>
                              <div>
                                <div
                                  className="tp-prog-t"
                                  style={{ height: 5 }}
                                >
                                  <div
                                    className="tp-prog-f"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <p
                                  style={{
                                    fontSize: 10.5,
                                    color: C.muted,
                                    marginTop: 3,
                                  }}
                                >
                                  {pct}%
                                </p>
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    navigate(`/attendance?groupId=${g.id}`)
                                  }
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    background: D
                                      ? "rgba(99,102,241,0.1)"
                                      : "rgba(99,102,241,0.05)",
                                    color: BRAND,
                                    border: `1px solid ${D ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = BRAND;
                                    e.currentTarget.style.color = "#fff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = D
                                      ? "rgba(99,102,241,0.1)"
                                      : "rgba(99,102,241,0.05)";
                                    e.currentTarget.style.color = BRAND;
                                  }}
                                >
                                  <Calendar size={12} />
                                  Davomat
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── CREATE HW MODAL ──────────────────────────────── */}
      {showModal && (
        <div className="tp-modal-bg">
          <div
            className="tp-modal-enter tp-card"
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "22px",
              boxShadow: "0 24px 60px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
                paddingBottom: 14,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                  Yangi uy vazifasi
                </h3>
                <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                  O'quvchilarga topshiriq bering
                </p>
              </div>
              <button
                className="tp-btn tp-btn-ghost"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={createHW}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label className="tp-lbl">Sarlavha *</label>
                <input
                  required
                  className="tp-inp"
                  placeholder="Uy vazifasi nomi..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="tp-lbl">Tavsif *</label>
                <textarea
                  required
                  className="tp-inp"
                  placeholder="Batafsil ko'rsatma..."
                  style={{ minHeight: 80, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label className="tp-lbl">Guruh *</label>
                  <select
                    required
                    className="tp-inp"
                    value={form.groupId}
                    onChange={(e) =>
                      setForm({ ...form, groupId: e.target.value })
                    }
                  >
                    <option value="">Tanlang</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="tp-lbl">Muddat *</label>
                  <input
                    required
                    type="date"
                    className="tp-inp"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="tp-lbl">Maksimum ball</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  className="tp-inp"
                  value={form.points}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      points: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
              <div>
                <label className="tp-lbl">Rasm (ixtiyoriy)</label>
                {form.imagePreview ? (
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          imageFile: null,
                          imagePreview: null,
                        })
                      }
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        padding: 6,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 20,
                      border: `2px dashed ${C.border}`,
                      borderRadius: 8,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: "none" }}
                      id="tp-img-upload"
                    />
                    <label
                      htmlFor="tp-img-upload"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: D
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={C.text}
                          strokeWidth={2}
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: C.text,
                            margin: 0,
                          }}
                        >
                          Rasm yuklash
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            margin: "4px 0 0 0",
                          }}
                        >
                          PNG, JPG, GIF (max 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="tp-btn tp-btn-outline"
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 7,
                    justifyContent: "center",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="tp-btn tp-btn-default"
                  style={{
                    flex: 2,
                    padding: 8,
                    borderRadius: 7,
                    justifyContent: "center",
                    opacity: modalLoading ? 0.6 : 1,
                  }}
                >
                  {modalLoading ? (
                    <>
                      <RotateCw size={13} className="tp-spin" /> Saqlanmoqda…
                    </>
                  ) : (
                    "Yaratish"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
