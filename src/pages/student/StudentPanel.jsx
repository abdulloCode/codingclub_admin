import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  Home, Menu, X, LogOut, User, ChevronRight,
  RotateCw, Settings, DollarSign, BookOpen, Send,
  Calendar, Gift,
} from 'lucide-react';
import StudentDashboardStats from './components/StudentDashboardStats';
import StudentHomeworks from './components/StudentHomeworks';
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
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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
    { id: "homeworks", label: "Uy vazifalari", icon: BookOpen, badge: homeworks.filter(h => !h.submitted).length || null },
    { id: "submissions", label: "Topshiriqlarim", icon: Send, badge: submissions.filter(s => !s.graded).length || null },
    { id: "attendance", label: "Davomat", icon: Calendar },
    { id: "payments", label: "To'lovlar", icon: DollarSign },
  ];

  // ── ✅ TUZATILGAN: Homeworks yuklash (submissions endpointini ishlatmaydi)
  const loadHomeworks = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Studentning guruhini olish
      const grp = await apiService.getMyGroup().catch(() => null);

      if (!grp?.id) {
        setGroup(null);
        setHomeworks([]);
        return;
      }

      // 2. Guruhning to'liq ma'lumotlarini olish (nomi, o'qituvchisi, narxi)
      let fullGroupData = grp;
      try {
        const groupDetails = await apiService.getGroup(grp.id).catch(() => null);
        if (groupDetails) {
          fullGroupData = groupDetails;
        }
      } catch (err) {
        console.log("Guruh ma'lumotlarini olishda xatolik:", err);
      }

      setGroup(fullGroupData);

      // 3. Barcha homeworklarni olish (submissions emas)
      const allHomeworks = await apiService.getHomeworks().catch(() => []);
      const homeworkList = Array.isArray(allHomeworks) ? allHomeworks : (allHomeworks?.homeworks || allHomeworks?.data || []);

      // 4. Guruh ID si bo'yicha filter qilish
      const groupHomeworks = homeworkList.filter(hw => hw.groupId === grp.id);

      // 5. Studentning submissionlarini olish (agar mavjud bo'lsa)
      let existingSubmissions = [];
      try {
        existingSubmissions = await apiService.getMySubmissions().catch(() => []);
      } catch {
        // submission endpoint ishlamasa, muammo emas
        existingSubmissions = [];
      }
      const subMap = {};
      (Array.isArray(existingSubmissions) ? existingSubmissions : []).forEach(sub => {
        subMap[sub.homeworkId] = sub;
      });

      // 6. Homeworklarni submission holati bilan birlashtirish
      const enrichedHomeworks = groupHomeworks.map(hw => ({
        ...hw,
        submitted: !!subMap[hw.id],
        submission: subMap[hw.id] || null,
        grade: subMap[hw.id]?.points || null,
        graded: subMap[hw.id]?.graded || false
      }));

      setHomeworks(enrichedHomeworks);

    } catch (err) {
      console.error("loadHomeworks error:", err);
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── ✅ TUZATILGAN: Submissions yuklash (o'z submissionlari)
  const loadSubmissions = useCallback(async () => {
    try {
      const data = await apiService.getMySubmissions().catch(() => []);
      const subsList = Array.isArray(data) ? data : (data?.submissions || data?.data || []);
      setSubmissions(subsList);
    } catch (err) {
      console.error("loadSubmissions error:", err);
      setSubmissions([]);
    }
  }, []);

  // ── ✅ TUZATILGAN: Attendance yuklash (to'g'ri endpoint)
  const loadAttendance = useCallback(async () => {
    try {
      // studentId bilan olish (me/attendance ishlamasa)
      const studentId = user?.id;
      if (!studentId) return;
      
      const data = await apiService.getStudentAttendance(studentId).catch(() => []);
      const attList = Array.isArray(data) ? data : (data?.attendance || data?.data || []);
      setAttendance(attList);
    } catch (err) {
      console.error("loadAttendance error:", err);
      setAttendance([]);
    }
  }, [user?.id]);

  // ── ✅ TUZATILGAN: Student data yuklash (to'g'ri endpoint)
  const loadStudentData = useCallback(async () => {
    try {
      // getMyStudentData ishlamasa, getStudent bilan olish
      let data = await apiService.getMyStudentData().catch(() => null);
      
      if (!data) {
        // Fallback: user id bilan olish
        const studentId = user?.id;
        if (studentId) {
          data = await apiService.getStudent(studentId).catch(() => null);
        }
      }
      
      setStudentData(data);
      
      // Coinlarni olish (agar mavjud bo'lsa)
      if (data?.coins !== undefined) {
        setCoins(data.coins);
      } else {
        setCoins(0);
      }
      
    } catch (err) {
      console.error("loadStudentData error:", err);
      setStudentData(null);
    }
  }, [user?.id]);

  // ── ✅ TUZATILGAN: Payments yuklash (guruh narxini hisoblash bilan)
  const loadPayments = useCallback(async () => {
    try {
      const data = await apiService.getMyPayments().catch(() => []);
      const paymentsList = Array.isArray(data) ? data : (data?.payments || data?.data || []);

      // Guruh ma'lumotlarini hisoblash uchun olish
      let groupPrice = 0;
      if (group?.monthlyPrice) {
        groupPrice = group.monthlyPrice || 0;
      }

      setPayments(paymentsList);
    } catch (err) {
      console.error("loadPayments error:", err);
      setPayments([]);
    }
  }, [group?.monthlyPrice]);

  // ── Submit homework
  const handleSubmitHomework = async () => {
    if (!selectedHomework || !submissionContent.trim()) {
      alert("Iltimos, javob yozing");
      return;
    }
    
    setSubmitting(true);
    try {
      await apiService.submitHomework(selectedHomework.id, { content: submissionContent });
      alert("Uy vazifasi muvaffaqiyatli topshirildi!");
      setShowSubmitModal(false);
      setSubmissionContent("");
      setSelectedHomework(null);
      await loadHomeworks();
      await loadSubmissions();
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Initial load
  useEffect(() => {
    loadStudentData();
    loadHomeworks();
    loadSubmissions();
    loadAttendance();
    loadPayments();
  }, [loadStudentData, loadHomeworks, loadSubmissions, loadAttendance, loadPayments]);

  // ── Stats
  const totalHomeworks = homeworks.length;
  const submittedCount = homeworks.filter(h => h.submitted).length;
  const pendingCount = totalHomeworks - submittedCount;
  const avgGrade = submissions.filter(s => s.graded).reduce((acc, s) => acc + (s.points || 0), 0) / (submissions.filter(s => s.graded).length || 1);
  
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
              {(studentData?.user?.name || user?.name || "S")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{studentData?.user?.name || user?.name || "Talaba"}</p>
              <p style={{ fontSize: 11, color: C.muted }}>{group?.name || "Guruh yo'q"}</p>
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
              {item.badge && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: D ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)" }}>{item.badge}</span>}
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
              {(studentData?.user?.name || user?.name || "S")[0].toUpperCase()}
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
                  <StudentDashboardStats group={group} homeworks={homeworks} attendance={attendance} payments={payments} user={user} studentData={studentData} C={C} />
                  <StudentHomeworks homeworks={homeworks} submissions={submissions} active={active} onSelectHomework={(hw) => { setSelectedHomework(hw); setShowSubmitModal(true); }} C={C} />
                </div>
              )}

              {/* HOMEWORKS */}
              {active === "homeworks" && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Uy vazifalari</h2>
                    <p style={{ fontSize: 13, color: C.muted }}>{homeworks.length} ta vazifa</p>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {homeworks.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 40, background: C.card, borderRadius: 12 }}>
                        <BookOpen size={32} color={C.muted} />
                        <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Hozircha uy vazifalari yo'q</p>
                      </div>
                    ) : (
                      homeworks.map(hw => (
                        <div key={hw.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <p style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{hw.title}</p>
                              <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{hw.description}</p>
                              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: C.muted }}><Clock size={11} /> {formatDate(hw.deadline)}</span>
                                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: C.muted }}><Star size={11} /> {hw.maxPoints || 100} ball</span>
                              </div>
                            </div>
                            {hw.submitted ? (
                              <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: `${C.green}15`, color: C.green }}>✅ Topshirilgan {hw.grade ? `(${hw.grade} ball)` : ""}</span>
                            ) : (
                              <button onClick={() => { setSelectedHomework(hw); setShowSubmitModal(true); }} style={{ padding: "6px 16px", borderRadius: 8, background: C.blue, border: "none", fontSize: 12, color: "#fff", cursor: "pointer" }}>Topshirish</button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SUBMISSIONS */}
              {active === "submissions" && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Topshiriqlarim</h2>
                    <p style={{ fontSize: 13, color: C.muted }}>{submissions.length} ta topshiriq</p>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {submissions.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 40, background: C.card, borderRadius: 12 }}>
                        <Send size={32} color={C.muted} />
                        <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Hali topshiriq yubormagansiz</p>
                      </div>
                    ) : (
                      submissions.map(sub => (
                        <div key={sub.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Uy vazifasi #{sub.homeworkId?.slice(-6)}</p>
                              <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{sub.content}</p>
                              <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Yuborilgan: {formatDate(sub.submittedAt)}</p>
                            </div>
                            {sub.graded ? (
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{sub.points}</span>
                                <span style={{ fontSize: 12, color: C.muted }}> / {sub.maxPoints || 100}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: `${C.amber}15`, color: C.amber }}>⌛ Tekshirilmoqda</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ATTENDANCE */}
              {active === "attendance" && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Davomat</h2>
                    <p style={{ fontSize: 13, color: C.muted }}>Jami {attendanceStats.total} kun</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
                    {[
                      { label: "Keldi", value: attendanceStats.present, color: C.green },
                      { label: "Kechikdi", value: attendanceStats.late, color: C.amber },
                      { label: "Kelmedi", value: attendanceStats.absent, color: C.red },
                    ].map(stat => (
                      <div key={stat.label} style={styles.statCard}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                        <p style={{ fontSize: 12, color: C.muted }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Umumiy davomat</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{attendanceRate}%</p>
                    </div>
                    <div style={{ height: 8, background: D ? "#27272a" : "#e4e4e7", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${attendanceRate}%`, height: "100%", background: C.green, borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENTS */}
              {active === "payments" && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>To'lovlar</h2>
                    <p style={{ fontSize: 13, color: C.muted }}>Jami to'langan: {totalPaid.toLocaleString()} so'm</p>
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
                            <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{p.month} oyi uchun</p>
                            <p style={{ fontSize: 11, color: C.muted }}>{formatDate(p.paidAt)}</p>
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

      {/* Submit Modal */}
      {showSubmitModal && selectedHomework && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 16, width: "90%", maxWidth: 500, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{selectedHomework.title}</h3>
              <button onClick={() => { setShowSubmitModal(false); setSubmissionContent(""); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><X size={20} /></button>
            </div>
            <textarea
              placeholder="Javobingizni yozing..."
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
              style={{ width: "100%", minHeight: 150, padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card2, color: C.text, fontSize: 13, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => { setShowSubmitModal(false); setSubmissionContent(""); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", color: C.muted }}>Bekor qilish</button>
              <button onClick={handleSubmitHomework} disabled={submitting} style={{ flex: 1, padding: "10px", borderRadius: 8, background: C.blue, border: "none", cursor: "pointer", color: "#fff", fontWeight: 600 }}>
                {submitting ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}