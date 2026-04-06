import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  GraduationCap, LayoutDashboard, ClipboardList, BarChart3, Calendar,
  Trophy, Star, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight,
  Menu, X, User, LogOut, Settings, Moon, Sun, Bell, Search, Filter,
  Award, Coins, TrendingUp, Activity, Zap, Shield, FileText, Send,
  Code, Upload, Eye, EyeOff, RefreshCw, PlusCircle, Gift, Flame,
  Target, Medal, Crown, Sparkles, BookOpen, Users, CreditCard,
  Home, PieChart, Settings2, HelpCircle, MessageCircle,
  Play, Pause, Maximize2, Minimize2, Copy, Check, Mail, Phone
} from 'lucide-react';

// Import shared components
import SharedHomework from '../components/SharedHomework.jsx';
import StatsCardComponent from '../components/SharedStatsCard'; // SharedStatsCard-ni StatsCardComponent nomi bilan import qilish
/* ─── CONSTANTS ──────────────────────────────────────────────── */
const BRAND = "#10b981";
const BRAND_DARK = "#059669";
const BRAND_LIGHT = "#34d399";
const BACKGROUND = "#09090b";
const CARD_BG = "#18181b";
const BORDER = "#27272a";
const TEXT = "#fafafa";
const TEXT_MUTED = "#a1a1aa";
const SUCCESS = "#22c55e";
const WARNING = "#f59e0b";
const DANGER = "#ef4444";
const INFO = "#3b82f6";

/* ─── GLOBAL STYLES ─────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    .student-panel {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #18181b; border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #52525b; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.02); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    
    .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
    .animate-slide-in { animation: slideIn 0.3s ease forwards; }
    .animate-scale-in { animation: scaleIn 0.3s ease forwards; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-spin { animation: spin 1s linear infinite; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    .skeleton {
      background: linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.5);
      border-color: ${BRAND}40;
    }
    .btn { transition: all 0.2s ease; cursor: pointer; }
    .btn:active { transform: scale(0.96); }
    .progress-bar { transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .glass {
      background: rgba(24, 24, 27, 0.8);
      backdrop-filter: blur(12px);
    }
    .gradient-text {
      background: linear-gradient(135deg, ${BRAND_LIGHT}, ${BRAND});
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* ── VS Code-style editor ── */
    .code-editor-wrap {
      border-radius: 12px;
      background: #0d1117;
      border: 1px solid #30363d;
      overflow: hidden;
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    }
    .code-editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
    }
    .code-editor-body {
      display: flex;
      position: relative;
      min-height: 200px;
    }
    .code-editor-lines {
      min-width: 44px;
      padding: 14px 8px;
      background: #0d1117;
      color: #484f58;
      font-size: 12px;
      line-height: 1.7;
      text-align: right;
      user-select: none;
      border-right: 1px solid #21262d;
      flex-shrink: 0;
    }
    .code-editor-textarea {
      flex: 1;
      padding: 14px 16px;
      background: #0d1117;
      border: none;
      color: #e6edf3;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 13px;
      line-height: 1.7;
      resize: none;
      outline: none;
      caret-color: ${BRAND};
      tab-size: 2;
    }
    .code-editor-textarea::placeholder { color: #484f58; }
    .code-editor-textarea:focus { box-shadow: inset 0 0 0 1px ${BRAND}30; }
    .editor-btn {
      background: transparent;
      border: none;
      padding: 5px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      transition: background 0.15s;
    }
    .editor-btn:hover { background: #21262d; }
    /* Scrollbar inside editor */
    .code-editor-textarea::-webkit-scrollbar { width: 8px; height: 8px; }
    .code-editor-textarea::-webkit-scrollbar-track { background: #0d1117; }
    .code-editor-textarea::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
  `}</style>
);


/* ─── AVATAR ─────────────────────────────────────────────────── */
function Avatar({ name, size = 40 }) {
  const initials = (name || "?")
    .split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const colorIndex = (name?.length || 0) % colors.length;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.3,
      background: `linear-gradient(135deg, ${colors[colorIndex]}, ${colors[colorIndex]}80)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 600, fontSize: size * 0.35,
      boxShadow: `0 4px 12px ${colors[colorIndex]}40`,
      flexShrink: 0,
    }}>
      {initials || "👤"}
    </div>
  );
}



/* ─── GRADE CARD ─────────────────────────────────────────────── */
function GradeCard({ grade }) {
  const getGradeColor = (score) => {
    if (score >= 90) return { color: SUCCESS, label: "A'lo" };
    if (score >= 75) return { color: BRAND,   label: "Yaxshi" };
    if (score >= 60) return { color: WARNING,  label: "Qoniqarli" };
    return { color: DANGER, label: "Qoniqarsiz" };
  };
  const score = grade.score || grade.grade || 0;
  const { color, label } = getGradeColor(score);
  return (
    <div className="card-hover" style={{
      background: CARD_BG, borderRadius: 14, padding: "16px",
      border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 700, color: color, flexShrink: 0,
      }}>
        {score}%
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
          {grade.subject || grade.course || "Fan"}
        </h4>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            flex: 1, height: 6, background: BORDER, borderRadius: 3, overflow: "hidden",
          }}>
            <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: color }}>{label}</span>
        </div>
        {grade.teacher && <p style={{ fontSize: 11, color: TEXT_MUTED }}>👨‍🏫 {grade.teacher}</p>}
      </div>
    </div>
  );
}

/* ─── ATTENDANCE CALENDAR ────────────────────────────────────── */
function AttendanceCalendar({ records }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getDaysInMonth = d => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = d => {
    const day = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };
  const getAttendanceForDate = date => {
    const dateStr = date.toISOString().split("T")[0];
    return records?.find(r => r.date?.split("T")[0] === dateStr);
  };
  const days = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthNames = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"];
  const weekDays = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="btn" style={{ background: "transparent", border: "none", padding: 8, cursor: "pointer", color: TEXT_MUTED }}>←</button>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="btn" style={{ background: "transparent", border: "none", padding: 8, cursor: "pointer", color: TEXT_MUTED }}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 10 }}>
        {weekDays.map(day => (
          <div key={day} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: TEXT_MUTED, padding: "8px" }}>{day}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} style={{ padding: "8px" }} />)}
        {Array.from({ length: days }).map((_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
          const att = getAttendanceForDate(date);
          const isPresent = att?.status === "present";
          const isLate = att?.status === "late";
          const isAbsent = att?.status === "absent";
          const isToday = new Date().toDateString() === date.toDateString();
          return (
            <div key={i} style={{
              textAlign: "center", padding: "10px 6px", borderRadius: 10,
              background: isPresent ? `${SUCCESS}15` : isLate ? `${WARNING}15` : isAbsent ? `${DANGER}10` : "transparent",
              border: isToday ? `1px solid ${BRAND}` : "none",
              transition: "all 0.2s",
            }}>
              <span style={{
                fontSize: 13, fontWeight: isToday ? 700 : 500,
                color: isPresent ? SUCCESS : isLate ? WARNING : isAbsent ? DANGER : TEXT_MUTED,
              }}>{i + 1}</span>
              {isPresent && <div style={{ fontSize: 10, marginTop: 2 }}>✅</div>}
              {isLate && <div style={{ fontSize: 10, marginTop: 2 }}>⏰</div>}
              {isAbsent && <div style={{ fontSize: 10, marginTop: 2 }}>❌</div>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
        {[
          { color: SUCCESS, label: "Kelgan" },
          { color: WARNING, label: "Kech" },
          { color: DANGER, label: "Kelmagan" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: TEXT_MUTED }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LEADERBOARD CARD ───────────────────────────────────────── */
function LeaderboardCard({ student, rank, isCurrentUser }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const medalColors = { 1: "#fbbf24", 2: "#94a3b8", 3: "#cd7f32" };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      background: isCurrentUser ? `${BRAND}10` : "transparent",
      borderRadius: 12,
      border: isCurrentUser ? `1px solid ${BRAND}30` : "none",
    }}>
      <div style={{ width: 45, textAlign: "center" }}>
        {rank <= 3
          ? <span style={{ fontSize: 28 }}>{medals[rank]}</span>
          : <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_MUTED }}>#{rank}</span>
        }
      </div>
      <Avatar name={student.name} size={42} />
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, color: TEXT }}>
          {student.name}
          {isCurrentUser && <span style={{ fontSize: 11, color: BRAND, marginLeft: 8 }}>(Siz)</span>}
        </p>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
          <span>⭐ {student.totalScore || 0} ball</span>
          <span>📝 {student.homeworksDone || 0} vazifa</span>
        </div>
      </div>
      {rank <= 3 && (
        <div style={{
          padding: "4px 12px", borderRadius: 20,
          background: `${medalColors[rank]}20`, color: medalColors[rank],
          fontSize: 12, fontWeight: 600,
        }}>TOP {rank}</div>
      )}
    </div>
  );
}

/* ─── MAIN STUDENT PANEL ─────────────────────────────────────── */
export default function Students() {
  const { user, logout } = useAuth();
  const { isDarkMode: D, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [studentData, setStudentData] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [coins, setCoins] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, submissionsRes, attendanceRes, coinsRes, leaderboardRes] = await Promise.all([
        apiService.getMyStudentData().catch(() => null),
        // getMyHomeworks docs da yo'q, shuning uchun submissions ishlatamiz
        apiService.getMySubmissions().catch(() => []),
        apiService.getMyAttendance().catch(() => []),
        apiService.getMyCoins().catch(() => 0),
        apiService.getLeaderboard().catch(() => []),
      ]);

      setStudentData(profile);

      // submissions → homeworks formatiga o'tkazamiz
      const subs = Array.isArray(submissionsRes) ? submissionsRes : (submissionsRes?.submissions || []);
      setHomeworks(subs);

      setGrades(
        Array.isArray(profile?.grades) ? profile.grades :
        (profile?.student?.grades || [])
      );
      setAttendance(Array.isArray(attendanceRes) ? attendanceRes : (attendanceRes?.attendance || []));
      setCoins(typeof coinsRes === "number" ? coinsRes : (coinsRes?.coins || 0));
      setLeaderboard(Array.isArray(leaderboardRes) ? leaderboardRes : (leaderboardRes?.students || []));
    } catch (err) {
      console.error("fetchAllData error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Submit homework — API docs: { content: string }
  const submitHomework = useCallback(async (homeworkId, data) => {
    // data = { content: "kod matni" }
    await apiService.submitHomework(homeworkId, data);
    await fetchAllData();
  }, [fetchAllData]);

  const stats = useMemo(() => {
    const presentCount = attendance.filter(a => a.status === "present").length;
    const totalClasses = attendance.length;
    const attendanceRate = totalClasses > 0 ? Math.round(presentCount / totalClasses * 100) : 0;
    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((s, g) => s + (g.score || g.grade || 0), 0) / grades.length)
      : 0;
    const completedHomeworks = homeworks.filter(h => h.status === "graded").length;
    const pendingHomeworks = homeworks.filter(h => h.status === "pending").length;
    return { attendanceRate, presentCount, totalClasses, avgGrade, completedHomeworks, pendingHomeworks, totalHomeworks: homeworks.length };
  }, [attendance, grades, homeworks]);

  const tabs = [
    { id: "dashboard",  label: "Boshqaruv", icon: LayoutDashboard, color: BRAND },
    { id: "homeworks",  label: "Vazifalar",  icon: ClipboardList,   color: INFO,    badge: stats.pendingHomeworks },
    { id: "grades",     label: "Baholar",    icon: BarChart3,       color: WARNING },
    { id: "attendance", label: "Davomat",    icon: Calendar,        color: SUCCESS },
    { id: "leaderboard",label: "Reyting",    icon: Trophy,          color: "#fbbf24" },
  ];

  return (
    <>
      <GlobalStyles />
      <div className="student-panel" style={{ background: BACKGROUND, minHeight: "100vh" }}>

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: `${BACKGROUND}CC`, backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${BORDER}`, padding: "12px 24px",
        }}>
          <div style={{
            maxWidth: 1400, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <GraduationCap size={18} color="#fff" />
              </div>
              <div>
                <h1 className="gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>Coding</h1>
                <p style={{ fontSize: 10, color: TEXT_MUTED }}>Student Panel</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: CARD_BG, borderRadius: 40,
                padding: "6px 14px", border: `1px solid ${BORDER}`,
              }}>
                <Search size={16} color={TEXT_MUTED} />
                <input type="text" placeholder="Qidirish..." style={{
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 13, color: TEXT, width: 160,
                }} />
              </div>

              <button onClick={toggleTheme} className="btn" style={{
                background: CARD_BG, border: `1px solid ${BORDER}`,
                borderRadius: 40, padding: "8px", cursor: "pointer",
              }}>
                {D ? <Sun size={16} color={WARNING} /> : <Moon size={16} color={TEXT_MUTED} />}
              </button>

              <div style={{
                background: `linear-gradient(135deg, ${WARNING}, #d97706)`,
                borderRadius: 40, padding: "6px 16px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Gift size={16} color="#fff" />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{coins}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={user?.name || "Student"} size={38} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{user?.name?.split(" ")[0] || "Student"}</p>
                  <p style={{ fontSize: 10, color: TEXT_MUTED }}>{user?.email}</p>
                </div>
              </div>

              <button onClick={logout} className="btn" style={{
                background: "transparent", border: "none",
                padding: 8, borderRadius: 8, cursor: "pointer", color: DANGER,
              }}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 8,
            background: CARD_BG, borderRadius: 20,
            padding: "6px", border: `1px solid ${BORDER}`,
            marginBottom: 28, overflowX: "auto",
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                  padding: "12px 24px", borderRadius: 14,
                  background: isActive ? `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})` : "transparent",
                  color: isActive ? "#fff" : TEXT_MUTED,
                  fontSize: 14, fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 8,
                  border: "none", flexShrink: 0, transition: "all 0.2s",
                }}>
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span style={{
                      background: "rgba(255,255,255,0.2)", borderRadius: 20,
                      padding: "2px 8px", fontSize: 11, fontWeight: 600,
                    }}>{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
              <div style={{ textAlign: "center" }}>
                <div className="animate-spin" style={{
                  width: 48, height: 48, borderRadius: "50%",
                  border: `3px solid ${BORDER}`, borderTopColor: BRAND,
                  marginBottom: 16,
                }} />
                <p style={{ color: TEXT_MUTED }}>Ma'lumotlar yuklanmoqda...</p>
              </div>
            </div>
          ) : (
            <>
              {/* DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="animate-fade-in">
                  <div style={{
                    background: `linear-gradient(135deg, ${BRAND_DARK}20, ${BACKGROUND})`,
                    borderRadius: 24, padding: "32px", marginBottom: 28,
                    border: `1px solid ${BRAND}30`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <Sparkles size={28} color={BRAND} className="animate-float" />
                          <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>
                            Salom, {user?.name?.split(" ")[0] || "Student"}! 👋
                          </h2>
                        </div>
                        <p style={{ fontSize: 14, color: TEXT_MUTED, maxWidth: 500 }}>
                          Bugungi kunda {stats.pendingHomeworks} ta vazifangiz bor. Davomatingiz {stats.attendanceRate}%.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        {[
                          { val: `${stats.attendanceRate}%`, label: "Davomat", color: BRAND },
                          { val: `${stats.avgGrade}%`, label: "O'rtacha", color: WARNING },
                        ].map(({ val, label, color }) => (
                          <div key={label} style={{
                            padding: "10px 20px", borderRadius: 40,
                            background: CARD_BG, border: `1px solid ${BORDER}`, textAlign: "center",
                          }}>
                            <p style={{ fontSize: 24, fontWeight: 700, color }}>{val}</p>
                            <p style={{ fontSize: 11, color: TEXT_MUTED }}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16, marginBottom: 28,
                  }}>
                    <StatsCardComponent title="Jami vazifalar"  value={stats.totalHomeworks}     icon={ClipboardList} color={INFO}    />
                    <StatsCardComponent title="Bajarilgan"       value={stats.completedHomeworks} icon={CheckCircle}   color={SUCCESS} />
                    <StatsCardComponent title="Kutilayotgan"     value={stats.pendingHomeworks}   icon={Clock}         color={WARNING} />
                    <StatsCardComponent title="Tangalar"         value={coins}                    icon={Gift}          color={WARNING} />
                  </div>

                  {studentData?.teacher && (
                    <div style={{
                      background: `linear-gradient(135deg, ${BRAND}15, ${INFO}10)`,
                      borderRadius: 20, padding: "24px", marginBottom: 28,
                      border: `1px solid ${BORDER}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: `linear-gradient(135deg, ${INFO}, #2563eb)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 700, color: "#fff",
                          }}>
                            {studentData.teacher.name?.[0] || "T"}
                          </div>
                          <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>O'qituvchingiz</h3>
                            <p style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{studentData.teacher.name}</p>
                            {studentData.teacher.specialization && (
                              <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>{studentData.teacher.specialization}</p>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {studentData.teacher.email && (
                            <div style={{
                              padding: "10px 14px", borderRadius: 12,
                              background: CARD_BG, border: `1px solid ${BORDER}`,
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                              <Mail size={16} color={INFO} />
                              <span style={{ fontSize: 13, color: TEXT }}>{studentData.teacher.email}</span>
                            </div>
                          )}
                          {studentData.teacher.phone && (
                            <div style={{
                              padding: "10px 14px", borderRadius: 12,
                              background: CARD_BG, border: `1px solid ${BORDER}`,
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                              <Phone size={16} color={SUCCESS} />
                              <span style={{ fontSize: 13, color: TEXT }}>{studentData.teacher.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT }}>📚 So'nggi vazifalar</h3>
                      <button onClick={() => setActiveTab("homeworks")} className="btn" style={{
                        background: "transparent", border: "none", color: BRAND,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                      }}>Hammasini ko'rish <ChevronRight size={14} /></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {homeworks.slice(0, 3).map(hw => (
                        <SharedHomework
                          key={hw.id || hw.homeworkId}
                          homework={hw}
                          onSubmit={submitHomework}
                          userRole="student"
                          isExpanded={false}
                          onToggle={() => console.log("Toggle homework:", hw.id)}
                        />
                      ))}
                      {homeworks.length === 0 && (
                        <div style={{ textAlign: "center", padding: 48, background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}` }}>
                          <FileText size={48} color={TEXT_MUTED} opacity={0.3} />
                          <p style={{ color: TEXT_MUTED, marginTop: 12 }}>Hozircha vazifalar yo'q</p>
                          <p style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 4 }}>O'qituvchingiz vazifalarni yuklaganda bu yerda ko'rinadi</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT }}>🏆 Top o'quvchilar</h3>
                      <button onClick={() => setActiveTab("leaderboard")} className="btn" style={{
                        background: "transparent", border: "none", color: BRAND,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                      }}>To'liq reyting <ChevronRight size={14} /></button>
                    </div>
                    <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px" }}>
                      {leaderboard.slice(0, 5).map((s, idx) => (
                        <LeaderboardCard key={s.id || idx} student={s} rank={idx + 1} isCurrentUser={s.id === user?.id} />
                      ))}
                      {leaderboard.length === 0 && (
                        <div style={{ textAlign: "center", padding: 32 }}>
                          <Trophy size={48} color={TEXT_MUTED} opacity={0.3} />
                          <p style={{ color: TEXT_MUTED, marginTop: 12 }}>Reyting ma'lumotlari yo'q</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* HOMEWORKS */}
              {activeTab === "homeworks" && (
                <div className="animate-fade-in">
                  {/* Code Editor Tutorial */}
                  {homeworks.some(h => h.status === "pending") && (
                    <div style={{
                      background: `linear-gradient(135deg, ${BRAND}15, ${INFO}10)`,
                      borderRadius: 16, padding: "16px 20px", marginBottom: 24,
                      border: `1px solid ${BRAND}30`, display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `linear-gradient(135deg, ${BRAND}, ${INFO})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Code size={20} color="#fff" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>💡 Kod muharriri haqida</h4>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>
                          Har bir vazifada kod muharriri mavjud. Kodni shu yerda yozishingiz mumkin.
                          <span style={{ color: BRAND, fontWeight: 500 }}> Ctrl+A</span> bilan kodni tanlang,
                          <span style={{ color: BRAND, fontWeight: 500 }}> Ctrl+C</span> bilan nusxalang,
                          <span style={{ color: BRAND, fontWeight: 500 }}> Tab</span> tugmasi bilan 2 ta probel qo'shing.
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>📋 Vazifalar</h2>
                    <p style={{ color: TEXT_MUTED, marginTop: 4 }}>
                      Jami {homeworks.length} ta, shundan {stats.completedHomeworks} tasi bajarilgan
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {homeworks.map(hw => (
                      <SharedHomework
                        key={hw.id || hw.homeworkId}
                        homework={hw}
                        onSubmit={submitHomework}
                        userRole="student"
                        isExpanded={false}
                        onToggle={() => console.log("Toggle homework:", hw.id)}
                      />
                    ))}
                    {homeworks.length === 0 && (
                      <div style={{ textAlign: "center", padding: 60, background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}` }}>
                        <FileText size={56} color={TEXT_MUTED} opacity={0.3} />
                        <p style={{ color: TEXT_MUTED, marginTop: 16 }}>Hozircha vazifalar mavjud emas</p>
                        <p style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 4 }}>O'qituvchingiz vazifalarni yuklaganda bu yerda ko'rinadi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GRADES */}
              {activeTab === "grades" && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>⭐ Baholar</h2>
                    <p style={{ color: TEXT_MUTED, marginTop: 4 }}>O'rtacha ball: {stats.avgGrade}%</p>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {grades.map((g, i) => <GradeCard key={g.id || i} grade={g} />)}
                    {grades.length === 0 && (
                      <div style={{ textAlign: "center", padding: 60, background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}` }}>
                        <Star size={56} color={TEXT_MUTED} opacity={0.3} />
                        <p style={{ color: TEXT_MUTED, marginTop: 16 }}>Hozircha baholar yo'q</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ATTENDANCE */}
              {activeTab === "attendance" && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>📅 Davomat</h2>
                    <p style={{ color: TEXT_MUTED, marginTop: 4 }}>
                      {stats.presentCount}/{stats.totalClasses} kun ({stats.attendanceRate}%)
                    </p>
                  </div>
                  <AttendanceCalendar records={attendance} />
                </div>
              )}

              {/* LEADERBOARD */}
              {activeTab === "leaderboard" && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>🏆 Reyting</h2>
                    <p style={{ color: TEXT_MUTED, marginTop: 4 }}>Eng yaxshi o'quvchilar</p>
                  </div>
                  <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                    <div style={{
                      padding: "14px 20px",
                      background: `${BRAND}10`, borderBottom: `1px solid ${BORDER}`,
                      display: "grid", gridTemplateColumns: "50px 1fr 60px",
                      fontSize: 12, fontWeight: 600, color: TEXT_MUTED,
                    }}>
                      <span>O'rin</span><span>O'quvchi</span><span>Ball</span>
                    </div>
                    <div style={{ padding: "12px" }}>
                      {leaderboard.map((s, idx) => (
                        <LeaderboardCard key={s.id || idx} student={s} rank={idx + 1} isCurrentUser={s.id === user?.id} />
                      ))}
                      {leaderboard.length === 0 && (
                        <div style={{ textAlign: "center", padding: 48 }}>
                          <Trophy size={56} color={TEXT_MUTED} opacity={0.3} />
                          <p style={{ color: TEXT_MUTED, marginTop: 16 }}>Reyting ma'lumotlari yo'q</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}