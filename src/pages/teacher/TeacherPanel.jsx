import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import {
  LayoutDashboard,
  FileText,
  Plus,
  RotateCw,
  Menu,
  Bell,
  X,
  ChevronRight,
  Settings,
  Calendar,
  CheckCircle,
  Layers,
  Users,
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import TeacherSidebar from './components/TeacherSidebar';
import TeacherDashboardStats from './components/TeacherDashboardStats';
import HomeworkManager from './components/HomeworkManager';
import HomeworkGrading from './components/HomeworkGrading';
import AttendanceTracker from './components/AttendanceTracker';
import GroupManager from './components/GroupManager';

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
  const [balanceData, setBalanceData] = useState({
    totalBalance: 0,
    monthlyEarnings: 0,
    studentPayments: [],
    teacherPayouts: [],
    lessonPrice: 0,
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
    indigo: "#6366f1",
    green: "#22c55e",
    amber: "#f59e0b",
    red: "#ef4444",
  };
  const BRAND = C.indigo;

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
    {
      id: "balance",
      label: "Balans",
      icon: Wallet,
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
      // Try to get teacher groups first, fallback to all groups filtered by teacher
      let g = [];
      try {
        const d = await apiService.getMyTeacherGroups();
        g = Array.isArray(d) ? d : d?.groups || d?.data || [];
      } catch (err) {
        console.warn("getMyTeacherGroups failed, trying alternative:", err.message);
        // Fallback: get teacher data first, then get all groups and filter
        const teacherId = user?.teacher?.id || user?.id;
        if (!teacherId) {
          console.error("Teacher ID not found in user object");
          setGroups([]);
          return;
        }

        const allGroups = await apiService.getGroups();
        const groupsData = Array.isArray(allGroups) ? allGroups : allGroups?.groups || allGroups?.data || [];
        g = groupsData.filter(group => group.teacherId === teacherId);
      }
      setGroups(g);
    } catch (err) {
      console.error("Error loading groups:", err);
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

  const loadBalance = async () => {
    try {
      const teacherData = await apiService.getMyTeacherData();
      const teacherId = teacherData?.teacher?.id || teacherData?.id;

      if (!teacherId) {
        console.error("Teacher ID not found");
        return;
      }

      // Get teacher earnings
      const earningsData = await apiService.getTeacherEarnings(teacherId);
      const payoutData = await apiService.getTeacherCommission(teacherId);

      // Get teacher groups to calculate lesson price
      let groupsData = [];
      let teacherGroups = [];
      try {
        groupsData = await apiService.getMyTeacherGroups();
        teacherGroups = Array.isArray(groupsData) ? groupsData : groupsData?.groups || [];
      } catch (err) {
        console.warn("getMyTeacherGroups failed in loadBalance, trying alternative:", err.message);
        // Fallback: get all groups and filter by teacherId
        const teacherIdForBalance = user?.teacher?.id || user?.id;
        if (!teacherIdForBalance) {
          console.error("Teacher ID not found in user object for balance calculation");
          return;
        }

        const allGroups = await apiService.getGroups();
        const groupsDataArray = Array.isArray(allGroups) ? allGroups : allGroups?.groups || allGroups?.data || [];
        teacherGroups = groupsDataArray.filter(group => group.teacherId === teacherIdForBalance);
      }

      // Calculate lesson price based on groups
      let lessonPrice = 0;
      let adminEarningPerLesson = 0;
      if (teacherGroups.length > 0) {
        const firstGroup = teacherGroups[0];
        const monthlyPrice = firstGroup.monthlyPrice || 0;
        const lessonsPerMonth = firstGroup.lessonsPerMonth || 8;
        lessonPrice = monthlyPrice / lessonsPerMonth;

        // Get teacher commission percentage
        const commissionPercent = teacherData?.teacher?.commissionPercentage || 20;

        // Calculate teacher's earning per lesson
        const teacherEarningPerLesson = lessonPrice * (commissionPercent / 100);
        adminEarningPerLesson = lessonPrice - teacherEarningPerLesson;
      }

      // Get teacher commission percentage
      const commissionPercent = teacherData?.teacher?.commissionPercentage || 20;

      // Calculate teacher's earning per lesson
      const teacherEarningPerLesson = lessonPrice * (commissionPercent / 100);

      setBalanceData({
        totalBalance: earningsData?.totalEarnings || 0,
        monthlyEarnings: earningsData?.monthlyEarnings || 0,
        studentPayments: earningsData?.payments || [],
        teacherPayouts: payoutData?.payouts || [],
        lessonPrice: teacherEarningPerLesson,
        adminEarningPerLesson: adminEarningPerLesson,
        commissionPercent: commissionPercent,
        fullLessonPrice: lessonPrice,
      });
    } catch (err) {
      console.error("Error loading balance:", err);
      setBalanceData({
        totalBalance: 0,
        monthlyEarnings: 0,
        studentPayments: [],
        teacherPayouts: [],
        lessonPrice: 0,
        commissionPercent: 20,
      });
    }
  };

  useEffect(() => {
    loadHomeworks();
    loadGroups();
    loadBalance();
  }, []);

  useEffect(() => {
    if (groups.length > 0) loadAtt(groups);
  }, [groups]);

  // ── ACTIONS ───────────────────────────────────────────────
  const createHW = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createHomework({
        ...form,
        deadline: form.dueDate,
        maxPoints: form.points,
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

  const handleLogout = async () => {
    if (window.confirm("Tizimdan chiqmoqchimisiz?")) {
      try {
        await logout();
        navigate("/login");
      } catch (err) {
        console.error("Chiqishda xatolik:", err);
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  // ── RESPONSIVE STYLES ─────────────────────────────────────
  const responsiveCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${C.border};
      border-radius: 4px;
    }

    .tp-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: ${C.bg};
      font-family: 'Geist', system-ui, -apple-system, sans-serif;
      color: ${C.text};
    }

    /* Sidebar - Desktop */
    .tp-sidebar {
      width: 260px;
      flex-shrink: 0;
      height: 100vh;
      background: ${C.sidebar};
      border-right: 1px solid ${C.border};
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      transition: transform 0.3s ease;
    }

    /* Main Content */
    .tp-main {
      flex: 1;
      min-width: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Top Bar */
    .tp-topbar {
      height: 60px;
      flex-shrink: 0;
      background: ${C.card};
      border-bottom: 1px solid ${C.border};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
    }

    .tp-topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }

    .tp-topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    /* Page Body */
    .tp-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    /* Navigation */
    .tp-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: ${C.muted};
      background: transparent;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 150ms;
      border: none;
    }

    .tp-nav-link:hover {
      background: ${D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
      color: ${C.text};
    }

    .tp-nav-link.active {
      background: ${D ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
      color: ${C.text};
      font-weight: 600;
    }

    .tp-nav-badge {
      margin-left: auto;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 99px;
      background: ${D ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"};
      color: ${C.muted};
    }

    .tp-nav-section {
      font-size: 11px;
      font-weight: 600;
      color: ${C.muted};
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 20px 16px 8px;
    }

    /* Cards */
    .tp-card {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 12px;
      overflow: hidden;
    }

    .tp-card2 {
      background: ${C.card2};
      border: 1px solid ${C.border};
      border-radius: 8px;
    }

    /* Stats Grid */
    .tp-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .tp-stat {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 12px;
      padding: 20px;
      transition: all 200ms;
    }

    .tp-stat:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    }

    /* Two Column Layout */
    .tp-two-columns {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-top: 24px;
    }

    /* Rows */
    .tp-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid ${C.border};
      transition: background 120ms;
      cursor: pointer;
    }

    .tp-row:last-child {
      border-bottom: none;
    }

    .tp-row:hover {
      background: ${D ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};
    }

    /* Homework Cards Grid */
    .tp-hw-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .tp-hw-card {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 200ms;
    }

    .tp-hw-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      border-color: ${D ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"};
    }

    /* Buttons */
    .tp-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
      transition: all 150ms;
    }

    .tp-btn:active {
      transform: scale(0.98);
    }

    .tp-btn-primary {
      background: ${C.indigo};
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
    }

    .tp-btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .tp-btn-outline {
      background: transparent;
      border: 1px solid ${C.border};
      color: ${C.text};
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
    }

    .tp-btn-outline:hover {
      background: ${D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
    }

    .tp-btn-ghost {
      background: transparent;
      color: ${C.muted};
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
    }

    .tp-btn-ghost:hover {
      background: ${D ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"};
      color: ${C.text};
    }

    /* Inputs */
    .tp-input {
      width: 100%;
      background: ${D ? "#1e1e24" : "#fafafa"};
      border: 1px solid ${C.border};
      color: ${C.text};
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: all 150ms;
    }

    .tp-input:focus {
      border-color: ${C.indigo};
      box-shadow: 0 0 0 3px ${C.indigo}20;
    }

    .tp-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: ${C.text};
      margin-bottom: 6px;
    }

    /* Badges */
    .tp-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
    }

    .tp-badge-blue {
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
    }

    .tp-badge-green {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
    }

    .tp-badge-red {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    .tp-badge-amber {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    /* Avatar */
    .tp-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
      background: ${D ? "#27272a" : "#f4f4f5"};
      border: 1px solid ${C.border};
    }

    /* Modal */
    .tp-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .tp-modal {
      background: ${C.card};
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
    }

    /* Mobile Drawer */
    .tp-drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(3px);
      z-index: 200;
    }

    .tp-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      background: ${C.sidebar};
      z-index: 201;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }

    /* Empty State */
    .tp-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    /* Animations */
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .tp-spin {
      animation: spin 1s linear infinite;
    }

    .tp-fade-in {
      animation: fadeIn 0.25s ease both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Hamburger Menu Button */
    .tp-hamburger {
      display: none;
      background: transparent;
      border: none;
      color: ${C.muted};
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      align-items: center;
      justify-content: center;
    }

    .tp-hamburger:hover {
      background: ${D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
    }

    /* ============================================ */
    /* RESPONSIVE BREAKPOINTS */
    /* ============================================ */

    /* Tablet (768px and below) */
    @media (max-width: 768px) {
      .tp-sidebar {
        display: none;
      }

      .tp-hamburger {
        display: flex;
      }

      .tp-body {
        padding: 16px;
      }

      .tp-stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .tp-two-columns {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .tp-topbar {
        padding: 0 16px;
      }

      .tp-stat {
        padding: 16px;
      }

      .tp-hw-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    /* Mobile (480px and below) */
    @media (max-width: 480px) {
      .tp-topbar-left h1 {
        font-size: 14px;
      }

      .tp-body {
        padding: 12px;
      }

      .tp-stats-grid {
        grid-template-columns: 1fr;
      }

      .tp-stat {
        padding: 14px;
      }

      .tp-modal {
        margin: 16px;
        padding: 20px;
      }

      .tp-row {
        padding: 12px;
      }

      .tp-avatar {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      .tp-btn-primary,
      .tp-btn-outline {
        padding: 6px 12px;
        font-size: 12px;
      }
    }

    /* Small Mobile (375px and below) */
    @media (max-width: 375px) {
      .tp-topbar {
        padding: 0 12px;
      }

      .tp-topbar-left h1 {
        font-size: 13px;
      }

      .tp-stat h3 {
        font-size: 20px;
      }

      .tp-stat p {
        font-size: 12px;
      }
    }

    /* Large Desktop (1200px and above) */
    @media (min-width: 1200px) {
      .tp-sidebar {
        width: 280px;
      }

      .tp-body {
        padding: 32px;
      }

      .tp-stats-grid {
        gap: 24px;
      }

      .tp-two-columns {
        gap: 32px;
      }
    }
  `;

  // Balance Component
  const BalanceView = ({ balanceData, groups, C, onRefresh }) => {
    const fmtCurrency = (n) => new Intl.NumberFormat('uz-UZ').format(n ?? 0);

    // Calculate daily lesson price from first group
    const calculateDailyPrice = () => {
      if (groups.length === 0) return 0;
      const group = groups[0];
      const monthlyPrice = group.monthlyPrice || 0;
      const lessonsPerMonth = group.lessonsPerMonth || 8;
      return Math.round(monthlyPrice / lessonsPerMonth);
    };

    const dailyPrice = calculateDailyPrice();
    const teacherEarningPerLesson = dailyPrice * (balanceData.commissionPercent || 20) / 100;

    return (
      <div className="tp-fade-in">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Balans va to'lovlar</h2>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
            Daromad va to'lov tarixi
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            {
              label: "Jami balans",
              value: `${fmtCurrency(balanceData.totalBalance)} so'm`,
              icon: Wallet,
              color: C.green,
            },
            {
              label: "Oylik daromad",
              value: `${fmtCurrency(balanceData.monthlyEarnings)} so'm`,
              icon: TrendingUp,
              color: C.blue,
            },
            {
              label: "Dars narxi",
              value: `${fmtCurrency(dailyPrice)} so'm`,
              icon: DollarSign,
              color: C.amber,
            },
            {
              label: "Sizning ulush",
              value: `${balanceData.commissionPercent || 20}%`,
              icon: ArrowUpRight,
              color: C.indigo,
            },
            {
              label: "Admin ulushi",
              value: `${fmtCurrency(balanceData.adminEarningPerLesson || 0)} so'm`,
              icon: TrendingUp,
              color: C.green,
            },
          ].map((stat, i) => (
            <div key={i} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "16px 20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: C.muted }}>{stat.label}</span>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${stat.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <stat.icon size={14} color={stat.color} />
                </div>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Earning Calculation */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 16 }}>Daromad hisobi</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Kunlik dars narxi</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {fmtCurrency(balanceData.fullLessonPrice || dailyPrice)} so'm
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Komissiya foizi</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {balanceData.commissionPercent || 20}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Sizning daromadingiz</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
                {fmtCurrency(balanceData.lessonPrice)} so'm
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Admin ulushi</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.indigo }}>
                {fmtCurrency(balanceData.adminEarningPerLesson)} so'm
              </p>
            </div>
          </div>
        </div>

        {/* Student Payments */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text }}>O'quvchi to'lovlari</h3>
            <button onClick={onRefresh} className="tp-btn tp-btn-ghost" style={{ fontSize: 12 }}>
              <RotateCw size={14} /> Yangilash
            </button>
          </div>
          {balanceData.studentPayments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <DollarSign size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>To'lovlar topilmadi</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {balanceData.studentPayments.slice(0, 10).map((payment, i) => (
                <div key={i} className="tp-row" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${C.green}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <ArrowDownLeft size={16} color={C.green} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                        {payment.studentName || "O'quvchi"}
                      </p>
                      <p style={{ fontSize: 11, color: C.muted }}>
                        {new Date(payment.date).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.green }}>
                      +{fmtCurrency(payment.amount)} so'm
                    </p>
                    <p style={{ fontSize: 11, color: C.muted }}>
                      {payment.type || "credit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teacher Payouts */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 16 }}>Chiqimlar</h3>
          {balanceData.teacherPayouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <ArrowUpRight size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Chiqimlar topilmadi</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {balanceData.teacherPayouts.slice(0, 10).map((payout, i) => (
                <div key={i} className="tp-row" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${C.red}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <ArrowUpRight size={16} color={C.red} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                        {payout.description || "To'lov"}
                      </p>
                      <p style={{ fontSize: 11, color: C.muted }}>
                        {new Date(payout.date).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.red }}>
                      -{fmtCurrency(payout.amount)} so'm
                    </p>
                    <p style={{ fontSize: 11, color: C.muted }}>
                      {payout.status || "completed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Dashboard Component
  const DashboardView = () => (
    <div className="tp-fade-in">
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, color: C.text }}>
          Salom, {user?.name?.split(" ")[0] || "O'qituvchi"} 👋
        </h2>
        <p style={{ fontSize: "clamp(13px, 3vw, 14px)", color: C.muted, marginTop: 4 }}>
          {new Date().toLocaleDateString("uz-UZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <TeacherDashboardStats 
        totalStudents={totalStudents} 
        groups={groups} 
        homeworks={homeworks} 
        pendingGrade={pendingGrade} 
        C={C} 
      />

      {/* Two Column Layout */}
      <div className="tp-two-columns">
        {/* Recent Homeworks */}
        <div className="tp-card">
          <div style={{ 
            padding: "16px 20px", 
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
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
              <FileText size={32} color={C.muted} />
              <p style={{ fontSize: 13, color: C.muted, marginTop: 12 }}>
                Hozircha uy vazifalari yo'q
              </p>
            </div>
          ) : (
            homeworks.slice(0, 5).map((hw) => (
              <div
                key={hw.id}
                className="tp-row"
                onClick={() => {
                  setSelHW(hw);
                  loadSubmissions(hw.id);
                  goTo("grading");
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${C.blue}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <FileText size={16} color={C.blue} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {hw.title}
                  </p>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {hw.maxPoints || hw.points || 100} ball · {fmtDate(hw.deadline || hw.dueDate)}
                  </p>
                </div>
                <ChevronRight size={14} color={C.muted} />
              </div>
            ))
          )}
        </div>

        {/* Groups */}
        <div className="tp-card">
          <div style={{ 
            padding: "16px 20px", 
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
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
            <div className="tp-empty">
              <Layers size={32} color={C.muted} />
              <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginTop: 12 }}>
                Sizga guruh tayinlanmagan
              </p>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                Admin panelidan guruh biriktiring
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Admin paneliga o'tmoqchimisiz?")) {
                    window.open("/admin", "_blank");
                  }
                }}
                style={{
                  marginTop: 16,
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: C.indigo,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <Users size={14} /> Admin paneliga o'tish
              </button>
            </div>
          ) : (
            groups.slice(0, 5).map((g) => (
              <div key={g.id} className="tp-row">
                <div className="tp-avatar">
                  {g.name?.substring(0, 2)?.toUpperCase() || "GR"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {g.name}
                  </p>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {g.currentStudents || 0} / {g.maxStudents || 20} o'quvchi
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{responsiveCSS}</style>

      <div className="tp-shell">
        {/* Desktop Sidebar */}
        <aside className="tp-sidebar">
          <TeacherSidebar 
            user={user} 
            active={active} 
            goTo={goTo} 
            NAV={NAV} 
            D={D} 
            C={C} 
            onLogout={handleLogout} 
            onSettings={handleSettings} 
          />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <>
            <div className="tp-drawer-overlay" onClick={() => setMobileOpen(false)} />
            <div className="tp-drawer">
              <TeacherSidebar 
                user={user} 
                active={active} 
                goTo={goTo} 
                NAV={NAV} 
                D={D} 
                C={C} 
                onLogout={handleLogout} 
                onSettings={handleSettings} 
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="tp-main">
          {/* Top Bar */}
          <header className="tp-topbar">
            <div className="tp-topbar-left">
              <button className="tp-hamburger" onClick={() => setMobileOpen(true)}>
                <Menu size={20} />
              </button>
              <h1 style={{ fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 600, color: C.text }}>
                {NAV.find((n) => n.id === active)?.label}
              </h1>
            </div>
            <div className="tp-topbar-right">
              {active === "homework" && (
                <button
                  className="tp-btn tp-btn-primary"
                  onClick={() => setShowModal(true)}
                  style={{ padding: "6px 12px", fontSize: 12.5 }}
                >
                  <Plus size={14} /> 
                  <span style={{ display: "inline-block" }}>Yangi</span>
                </button>
              )}
              <button
                style={{
                  position: "relative",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Bell size={16} />
                <span style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  background: "#ef4444",
                  borderRadius: "50%",
                }} />
              </button>
              <div className="tp-avatar">
                {(user?.name || "T")[0].toUpperCase()}
              </div>
            </div>
          </header>

          {/* Page Body */}
          <div className="tp-body">
            {loading ? (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh"
              }}>
                <RotateCw size={32} color={C.muted} className="tp-spin" />
              </div>
            ) : (
              <>
                {active === "dashboard" && <DashboardView />}
                {active === "attendance" && (
                  <AttendanceTracker attStats={attStats} groups={groups} C={C} />
                )}
                {active === "homework" && (
                  <HomeworkManager 
                    homeworks={homeworks} 
                    groups={groups} 
                    search={search} 
                    setSearch={setSearch} 
                    C={C} 
                    onSelectHomework={(hw) => { 
                      setSelHW(hw); 
                      loadSubmissions(hw.id); 
                      goTo("grading"); 
                    }} 
                  />
                )}
                {active === "grading" && (
                  <HomeworkGrading 
                    selHW={selHW} 
                    submissions={submissions} 
                    groups={groups} 
                    C={C} 
                    onBack={() => goTo("homework")} 
                    onGrade={(subId, score) => setGradeInputs({...gradeInputs, [subId]: score})} 
                  />
                )}
                {active === "groups" && (
                  <GroupManager groups={groups} courses={[]} rooms={[]} C={C} />
                )}
                {active === "balance" && (
                  <BalanceView
                    balanceData={balanceData}
                    groups={groups}
                    C={C}
                    onRefresh={loadBalance}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Homework Modal */}
      {showModal && (
        <div className="tp-modal-overlay">
          <div className="tp-modal">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                  Yangi uy vazifasi
                </h3>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                  O'quvchilarga topshiriq bering
                </p>
              </div>
              <button
                className="tp-btn tp-btn-ghost"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={createHW} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="tp-label">Sarlavha *</label>
                <input
                  required
                  className="tp-input"
                  placeholder="Uy vazifasi nomi..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="tp-label">Tavsif *</label>
                <textarea
                  required
                  className="tp-input"
                  placeholder="Batafsil ko'rsatma..."
                  style={{ minHeight: 80, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12
              }}>
                <div>
                  <label className="tp-label">Guruh *</label>
                  <select
                    required
                    className="tp-input"
                    value={form.groupId}
                    onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  >
                    <option value="">Tanlang</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="tp-label">Muddat *</label>
                  <input
                    required
                    type="date"
                    className="tp-input"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="tp-label">Maksimum ball</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    className="tp-input"
                    value={form.points}
                    onChange={(e) => setForm({
                      ...form,
                      points: parseInt(e.target.value) || 100,
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="tp-label">Rasm (ixtiyoriy)</label>
                {form.imagePreview ? (
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        imageFile: null,
                        imagePreview: null,
                      })}
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
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    marginTop: 8,
                    padding: 24,
                    border: `2px dashed ${C.border}`,
                    borderRadius: 8,
                    textAlign: "center",
                    cursor: "pointer",
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: "none" }}
                      id="tp-img-upload"
                    />
                    <label htmlFor="tp-img-upload" style={{ cursor: "pointer" }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: D ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}>
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth={2}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>
                        Rasm yuklash
                      </p>
                      <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0 0" }}>
                        PNG, JPG, GIF (max 5MB)
                      </p>
                    </label>
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="tp-btn tp-btn-outline"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setShowModal(false)}
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="tp-btn tp-btn-primary"
                  style={{ flex: 2, justifyContent: "center", opacity: modalLoading ? 0.6 : 1 }}
                >
                  {modalLoading ? (
                    <>
                      <RotateCw size={14} className="tp-spin" /> Saqlanmoqda…
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