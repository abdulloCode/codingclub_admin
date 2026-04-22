import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Home, Menu, X, LogOut, User, ChevronRight,
  RotateCw, Settings, DollarSign,
  Calendar, Gift
} from 'lucide-react';
import StudentDashboardStats from './components/StudentDashboardStats';
import StudentAttendance from './components/StudentAttendance';
import StudentPayments from './components/StudentPayments';

export default function StudentPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const { isDarkMode: D } = useTheme();

  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [group, setGroup] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coins, setCoins] = useState(0);

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
    indigo: "#6366f1",
    green: "#22c55e",
    amber: "#f59e0b",
    red: "#ef4444",
  };

  // ── NAVIGATION ────────────────────────────────────────────
  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "attendance", label: "Davomat", icon: Calendar },
    { id: "payments", label: "To'lovlar", icon: DollarSign },
  ];

  // ── ✅ FIX 1: Student data yuklash (getMyStudentData orqali)
 const loadStudentData = useCallback(async () => {
  try {
    const profile = await apiService.getProfile();
    if (profile?.role === 'student') {
      setStudentData(profile);
      if (profile?.coins !== undefined) setCoins(profile.coins);
    }
  } catch (err) {
    console.error("loadStudentData error:", err);
    setStudentData(null);
  }
}, []);

  // ── ✅ FIX 2: Group yuklash (getMyGroup orqali)
  const loadGroup = useCallback(async () => {
  try {
    const res = await apiService.getMyGroups().catch(() => null);
    
    // Response array yoki object bo'lishi mumkin
    const grp = Array.isArray(res) 
      ? res[0]           // birinchi guruhni olish
      : res?.group || res?.groups?.[0] || res;
    
    if (grp?.id || grp?._id) {
      const id = grp.id || grp._id;
      const fullGroup = await apiService.getGroup(id).catch(() => grp);
      setGroup({ ...fullGroup, id: fullGroup.id || fullGroup._id });
    } else {
      setGroup(null);
    }
  } catch (err) {
    console.error("loadGroup error:", err);
    setGroup(null);
  }
}, []);

  // ── ✅ FIX 3: Attendance yuklash
  const loadAttendance = useCallback(async () => {
    try {
      const studentId = studentData?.id || user?.id;
      if (!studentId) {
        setAttendance([]);
        return;
      }
      
      // Get all attendance records
      const allAttendance = await apiService.getAttendances().catch(() => []);
      const attendanceList = Array.isArray(allAttendance) ? allAttendance : (allAttendance?.attendances || allAttendance?.data || []);
      
      // Filter for this student
      const studentAttendance = [];
      for (const att of attendanceList) {
        if (att.attendanceData && Array.isArray(att.attendanceData)) {
          const studentRecord = att.attendanceData.find(a => a.studentId === studentId);
          if (studentRecord) {
            studentAttendance.push({
              id: att.id,
              date: att.date,
              groupId: att.groupId,
              status: studentRecord.status,
              ...studentRecord
            });
          }
        }
      }
      
      setAttendance(studentAttendance);
    } catch (err) {
      console.error("loadAttendance error:", err);
      setAttendance([]);
    }
  }, [studentData?.id, user?.id]);

  // ── ✅ FIX 6: Payments yuklash
  const loadPayments = useCallback(async () => {
    try {
      // ✅ Use universal getMyPayments() method
      const paymentsData = await apiService.getMyPayments().catch(() => []);
      const paymentsList = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || paymentsData?.data || []);
      setPayments(paymentsList);
    } catch (err) {
      console.error("loadPayments error:", err);
      setPayments([]);
    }
  }, []);

  // ── Initial load
  useEffect(() => {
  const loadAll = async () => {
    await loadStudentData();
    await loadGroup();
    await loadAttendance();
    await loadPayments();
  };
  loadAll();
}, []); // ← faqat bitta marta

  // ── Stats
  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === "present").length,
    late: attendance.filter(a => a.status === "late").length,
    absent: attendance.filter(a => a.status === "absent").length,
  };
  const attendanceRate = attendanceStats.total > 0 
    ? Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100) 
    : 0;

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // ── Logout
  const handleLogout = async () => {
    if (window.confirm("Tizimdan chiqmoqchimisiz?")) {
      try {
        await logout();
        navigate("/login");
      } catch (err) {
        console.error("Logout error:", err);
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

  // ── Format date
  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  // ── Styles
  const styles = {
    container: { display: "flex", height: "100vh", overflow: "hidden", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" },
    sidebar: { width: 260, flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: { height: 60, flexShrink: 0, background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" },
    body: { flex: 1, overflow: "auto", padding: 24 },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
    statCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#427A43", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>CodingClub</p>
              <p style={{ fontSize: 11, color: C.muted }}>Talaba Paneli</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: D ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: D ? "#27272a" : "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {(studentData?.user?.name || user?.name || "S")[0]?.toUpperCase() || "S"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{studentData?.user?.name || user?.name || "Talaba"}</p>
              <p style={{ fontSize: 11, color: C.muted }}>
                {group ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: C.green }}>●</span>
                    {group.name || "Guruh"}
                  </span>
                ) : (
                  <span style={{ color: C.amber }}>Guruh yo'q</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px", overflow: "auto" }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setMobileOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
                borderRadius: 8, background: active === item.id ? (D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
                border: "none", cursor: "pointer", marginBottom: 4, textAlign: "left"
              }}
            >
              <item.icon size={16} color={active === item.id ? C.text : C.muted} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: active === item.id ? 600 : 500, color: active === item.id ? C.text : C.muted }}>{item.label}</span>
              {item.badge > 0 && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: D ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#ef4444" }}>
            <LogOut size={16} /> <span style={{ fontSize: 13 }}>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={styles.main}>
        <header style={styles.topbar}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{NAV.find(n => n.id === active)?.label}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {coins > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: C.card2 }}>
                <Gift size={14} color={C.amber} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{coins}</span>
              </div>
            )}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: D ? "#27272a" : "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {(studentData?.user?.name || user?.name || "S")[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        <div style={styles.body}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
              <RotateCw size={28} color={C.muted} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <>
              {/* DASHBOARD */}
              {active === "dashboard" && (
                <div>
                  <StudentDashboardStats
                    group={group}
                    attendance={attendance}
                    payments={payments}
                    user={user}
                    studentData={studentData}
                    C={C}
                  />
                </div>
              )}

              {/* ATTENDANCE */}
              {active === "attendance" && (
                <StudentAttendance
                  group={group}
                  user={user}
                  studentData={studentData}
                  C={C}
                />
              )}

              {/* PAYMENTS */}
              {active === "payments" && (
                <div>
                  <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>To'lovlar</h2>
                      <p style={{ fontSize: 13, color: C.muted }}>Jami to'langan: {totalPaid.toLocaleString()} so'm</p>
                    </div>
                  </div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                    {payments.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 40 }}>
                        <DollarSign size={32} color={C.muted} />
                        <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Hozircha to'lovlar yo'q</p>
                      </div>
                    ) : (
                      payments.map(p => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{p.month || "Oylik"} oyi uchun</p>
                            <p style={{ fontSize: 11, color: C.muted }}>{formatDate(p.date || p.paidAt || p.createdAt)}</p>
                          </div>
                          <p style={{ fontSize: 16, fontWeight: 600, color: C.green }}>{p.amount?.toLocaleString()} so'm</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}