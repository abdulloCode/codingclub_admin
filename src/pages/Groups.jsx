import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import ImageLoader, { SmallImageLoader } from "../components/ImageLoader";
import {
  Layers, Plus, Search, Edit2, Trash2,
  Users, BookOpen, Calendar, X, Save,
  Filter, CheckCircle, XCircle, UserPlus,
  RefreshCw, GraduationCap,
  ChevronRight, ChevronLeft, AlertTriangle,
  Clock, Hash
} from "lucide-react";

const GROUP_STATUS = [
  { value: "active",    label: "Faol",           dot: "#10b981" },
  { value: "completed", label: "Tugallangan",    dot: "#3b82f6" },
  { value: "cancelled", label: "Bekor qilingan", dot: "#ef4444" },
];

// Vaqt intervallari
const TIME_SLOTS = [
  { value: "10:00-12:00", label: "10:00 – 12:00" },
  { value: "12:00-14:00", label: "12:00 – 14:00" },
  { value: "14:00-16:00", label: "14:00 – 16:00" },
  { value: "16:00-18:00", label: "16:00 – 18:00" },
];

const initialForm = {
  name: "", courseId: "", teacherId: "",
  startDate: "", endDate: "",
  timeSlot: "10:00-12:00",
  maxStudents: 20, status: "active", description: "",
};

// ── Mini Calendar ──────────────────────────────────────────
function CalendarPicker({ startDate, endDate, onChange, onClose }) {
  const [view, setView] = useState(startDate ? new Date(startDate) : new Date());
  const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  const DAYS   = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];
  const y = view.getFullYear(), m = view.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInM  = new Date(y, m + 1, 0).getDate();
  const blanks   = Array(firstDow).fill(null);
  const days     = Array.from({ length: daysInM }, (_, i) => i + 1);

  const fmt   = d => d ? new Date(d).toLocaleDateString("uz-UZ") : "—";
  const toStr = (yr, mo, dy) => `${yr}-${String(mo+1).padStart(2,"0")}-${String(dy).padStart(2,"0")}`;

  const click = (day) => {
    const s = toStr(y, m, day);
    if (!startDate || (startDate && endDate)) {
      onChange("startDate", s); onChange("endDate", "");
    } else {
      if (s >= startDate) onChange("endDate", s);
      else { onChange("startDate", s); onChange("endDate", ""); }
    }
  };

  const isStart = d => toStr(y,m,d) === startDate;
  const isEnd   = d => toStr(y,m,d) === endDate;
  const inRange = d => {
    if (!startDate || !endDate) return false;
    const s = toStr(y,m,d);
    return s > startDate && s < endDate;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView(new Date(y, m-1, 1))}
            className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center transition-colors">
            <ChevronLeft size={16} className="text-emerald-700" />
          </button>
          <span className="font-bold text-sm text-gray-800">{MONTHS[m]} {y}</span>
          <button onClick={() => setView(new Date(y, m+1, 1))}
            className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center transition-colors">
            <ChevronRight size={16} className="text-emerald-700" />
          </button>
        </div>

        <p className="text-[11px] text-center text-gray-400 mb-3">
          {!startDate || (startDate && endDate) ? "📅 Boshlanish sanasini tanlang" : "📅 Tugash sanasini tanlang"}
        </p>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_,i) => <div key={`b${i}`} />)}
          {days.map(day => {
            const start = isStart(day), end = isEnd(day), range = inRange(day);
            return (
              <button key={day} onClick={() => click(day)}
                className={`h-8 w-full text-[12px] font-medium rounded-lg transition-all
                  ${start || end ? "bg-emerald-600 text-white shadow-md" :
                    range ? "bg-emerald-50 text-emerald-700" :
                    "hover:bg-gray-100 text-gray-700"}`}>
                {day}
              </button>
            );
          })}
        </div>

        {(startDate || endDate) && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-[12px] space-y-1.5 border border-emerald-100">
            <div className="flex justify-between"><span className="text-gray-500">Boshlanish:</span><span className="font-bold text-emerald-700">{fmt(startDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tugash:</span><span className="font-bold text-emerald-700">{fmt(endDate)}</span></div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={() => { onChange("startDate",""); onChange("endDate",""); }}
            className="flex-1 py-2.5 text-[12px] text-gray-500 hover:bg-gray-100 rounded-xl transition-colors font-medium">
            Tozalash
          </button>
          <button onClick={onClose} disabled={!startDate || !endDate}
            className="flex-1 py-2.5 text-[12px] bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 font-bold">
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, size = "w-10 h-10", green = true }) {
  const initials = (name || "?").split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("");
  return (
    <div className={`${size} rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md
      ${green ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-slate-400 to-slate-500"}`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = GROUP_STATUS.find(x => x.value === status) || GROUP_STATUS[0];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
      style={{ background: s.dot + "18", color: s.dot, borderColor: s.dot + "40" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

export default function Groups() {
  const { user } = useAuth();
  console.log("Groups component - User:", user);

  const [groups,        setGroups]        = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [teachers,      setTeachers]      = useState([]);
  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterCourse,  setFilterCourse]  = useState("all");
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData,      setFormData]      = useState(initialForm);
  const [modalLoading,  setModalLoading]  = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [studentsModal, setStudentsModal] = useState(null);
  const [calendarOpen,  setCalendarOpen]  = useState(false);
  const [detailGroup,   setDetailGroup]   = useState(null);
  const [attendance,    setAttendance]    = useState({});
  const [selectedDate,  setSelectedDate]  = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { fetchData(); }, [user]);

  // Debug: monitor data changes
  useEffect(() => {
    console.log("Groups component - Teachers loaded:", teachers.length);
    console.log("Groups component - Courses loaded:", courses.length);
    console.log("Groups component - Groups loaded:", groups.length);
  }, [teachers, courses, groups]);

  const fetchData = async () => {
    try {
      setLoading(true); setError("");
      let groupsData;
      if (user?.role === "teacher")      groupsData = await apiService.getMyGroups();
      else if (user?.role === "student") { const g = await apiService.getMyGroup(); groupsData = g ? [g] : []; }
      else                               groupsData = await apiService.getGroups();

      console.log("Groups data:", groupsData);

      const [cData, tData, sData] = await Promise.all([
        apiService.getCourses().catch(err => { console.error("Courses error:", err); return []; }),
        apiService.getTeachers().catch(err => { console.error("Teachers error:", err); return []; }),
        apiService.getStudents().catch(err => { console.error("Students error:", err); return []; })
      ]);

      console.log("Courses data:", cData);
      console.log("Teachers data:", tData);
      console.log("Students data:", sData);

      // Data structure handling - various API response formats
      const processedGroups = Array.isArray(groupsData) ? groupsData : (groupsData?.groups || groupsData?.data || []);
      const processedCourses = Array.isArray(cData) ? cData : (cData?.courses || cData?.data || []);
      const processedTeachers = Array.isArray(tData) ? tData : (tData?.teachers || tData?.data || []);
      const processedStudents = Array.isArray(sData) ? sData : (sData?.students || sData?.data || []);

      console.log("Processed groups:", processedGroups.length);
      console.log("Processed courses:", processedCourses.length);
      console.log("Processed teachers:", processedTeachers.length);
      console.log("Processed students:", processedStudents.length);

      setGroups(processedGroups);
      setCourses(processedCourses);
      setTeachers(processedTeachers);
      setStudents(processedStudents);

    } catch (err) {
      console.error("Fetch data error:", err);
      setError(err.message || "Yuklashda xatolik");
    } finally { setLoading(false); }
  };

  const toast = (msg, type = "success") => {
    if (type === "success") setSuccess(msg); else setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const openAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setSelectedGroup(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEdit = (g, e) => {
    e?.stopPropagation();
    setSelectedGroup(g);
    setFormData({
      name:        g.name        || "",
      courseId:    g.courseId    || "",
      teacherId:   g.teacherId   || "",
      startDate:   g.startDate   ? new Date(g.startDate).toISOString().split("T")[0] : "",
      endDate:     g.endDate     ? new Date(g.endDate).toISOString().split("T")[0]   : "",
      timeSlot:    g.timeSlot    || "10:00-12:00",
      maxStudents: g.maxStudents || 20,
      status:      g.status      || "active",
      description: g.description || "",
    });
    setIsEditing(true);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalLoading(true); setError("");
    if (!formData.name.trim())                { setError("Guruh nomini kiriting");                           setModalLoading(false); return; }
    if (!formData.courseId)                    { setError("Kursni tanlang");                                  setModalLoading(false); return; }
    if (!formData.teacherId)                   { setError("O'qituvchini tanlang");                            setModalLoading(false); return; }
    if (!formData.startDate || !formData.endDate) { setError("Sanalarni kiriting");                           setModalLoading(false); return; }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) { setError("Boshlanish tugashdan oldin bo'lishi kerak"); setModalLoading(false); return; }

    const cleanData = {
      ...formData,
      name:        formData.name.trim(),
      startDate:   new Date(formData.startDate).toISOString(),
      endDate:     new Date(formData.endDate).toISOString(),
      maxStudents: parseInt(formData.maxStudents) || 20,
    };

    try {
      if (isEditing) {
        const res = await apiService.updateGroup(selectedGroup.id, cleanData);
        const updated = res?.group || res;
        setGroups(gs => gs.map(g => g.id === selectedGroup.id ? updated : g));
        toast("Guruh muvaffaqiyatli yangilandi");
      } else {
        const res = await apiService.createGroup(cleanData);
        const created = res?.group || res;
        setGroups(gs => [created, ...gs]);
        toast("Yangi guruh yaratildi");
      }
      setIsModalOpen(false);
    } catch (err) { setError(err.message || "Xatolik"); }
    finally { setModalLoading(false); }
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteGroup(deleteConfirm);
      setGroups(gs => gs.filter(g => g.id !== deleteConfirm));
      if (detailGroup?.id === deleteConfirm) setDetailGroup(null);
      setDeleteConfirm(null);
      toast("Guruh o'chirildi");
    } catch (err) { toast(err.message || "O'chirishda xatolik", "error"); setDeleteConfirm(null); }
  };

  const handleAddStudent = async (studentId) => {
    try {
      const res = await apiService.addStudentToGroup(studentsModal.id, studentId);
      if (res?.group) { setGroups(gs => gs.map(g => g.id === res.group.id ? { ...g, ...res.group } : g)); setStudentsModal(prev => ({ ...prev, ...res.group })); }
      toast("O'quvchi guruhga qo'shildi");
    } catch (err) { toast(err.message || "Xatolik", "error"); }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const res = await apiService.removeStudentFromGroup(studentsModal.id, studentId);
      if (res?.group) { setGroups(gs => gs.map(g => g.id === res.group.id ? { ...g, ...res.group } : g)); setStudentsModal(prev => ({ ...prev, ...res.group })); }
      toast("O'quvchi guruhdan olib tashlandi");
    } catch (err) { toast(err.message || "Xatolik", "error"); }
  };

  // O'qituvchi ismini olish (ikki xil API struktura)
  const getTeacherName = (id) => {
    const t = teachers.find(t => t.id === id);
    return t?.user?.name || t?.name || id;
  };
  const getCourseName  = id => courses.find(c => c.id === id)?.title || courses.find(c => c.id === id)?.name || id;
  const fmt = d => d ? new Date(d).toLocaleDateString("uz-UZ") : "—";

  const filtered = groups.filter(g => {
    const q = searchQuery.toLowerCase();
    const ms  = g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q);
    const mst = filterStatus === "all" || g.status === filterStatus;
    const mc  = filterCourse === "all" || g.courseId === filterCourse;
    return ms && mst && mc;
  });

  const stats = [
    { icon: Layers,      label: "Jami guruhlar",   value: groups.length },
    { icon: CheckCircle, label: "Faol guruhlar",    value: groups.filter(g => g.status === "active").length },
    { icon: Users,       label: "Jami o'quvchilar", value: groups.reduce((a,g) => a + (g.currentStudents||0), 0) },
    { icon: BookOpen,    label: "Kurslar",           value: [...new Set(groups.map(g => g.courseId))].length },
  ];

  const groupStudents = studentsModal ? students.filter(s => s.groupId === studentsModal.id) : [];
  const otherStudents = studentsModal ? students.filter(s => s.groupId !== studentsModal.id) : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        .card-in   { animation: fadeUp 0.32s ease both; }
        .modal-in  { animation: scaleIn 0.28s cubic-bezier(.34,1.56,.64,1); }
        .toast-in  { animation: fadeIn 0.3s ease; }
        input:focus, select:focus, textarea:focus { outline:none; border-color:#059669 !important; box-shadow:0 0 0 3px rgba(5,150,105,0.15) !important; }
        .gc { transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s; cursor:pointer; }
        .gc:hover { box-shadow: 0 8px 32px rgba(5,150,105,0.13); transform: translateY(-2px); border-color: #a7f3d0 !important; }
        .time-btn { transition: all 0.15s; }
        .time-btn:hover { border-color: #059669; background: #ecfdf5; color: #065f46; }
      `}</style>

      {/* Toast */}
      {success && (
        <div className="toast-in fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-sm text-white shadow-2xl bg-emerald-600">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && !isModalOpen && (
        <div className="toast-in fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-sm text-white shadow-2xl bg-red-500">
          <XCircle size={16} /> {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900 leading-none">Guruhlar</p>
              <p className="text-xs text-slate-500 mt-0.5">Boshqaruv paneli</p>
            </div>
          </div>
          {user?.role === "admin" && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input placeholder="Qidirish..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl w-48 transition-all" />
              </div>
              <button onClick={fetchData} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                {loading ? <SmallImageLoader size={18} /> : <RefreshCw size={18} className="text-slate-600" />}
              </button>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                <Plus size={18} /> Guruh qo'shish
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Filters */}
        {user?.role === "admin" && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[["all","Barchasi"],["active","Faol"],["completed","Tugagan"],["cancelled","Bekor"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilterStatus(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === v ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                {l}
              </button>
            ))}
            <div className="relative flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
              <Filter size={14} className="text-slate-400" />
              <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                className="text-sm font-medium text-slate-600 bg-transparent appearance-none cursor-pointer pr-2 border-none outline-none">
                <option value="all">Barcha kurslar</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center gap-4">
                <ImageLoader size={50} text="Yuklanmoqda..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Layers size={28} className="text-emerald-600" />
                </div>
                <p className="font-bold text-gray-800 text-lg mb-1">
                  {groups.length === 0 ? "Hali guruh yaratilmagan" : "Hech narsa topilmadi"}
                </p>
                {groups.length === 0 && user?.role === "admin" && (
                  <button onClick={openAdd} className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
                    <Plus size={15} /> Guruh yaratish
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((g, i) => {
                  const sel = detailGroup?.id === g.id;
                  const pct = g.maxStudents ? Math.round((g.currentStudents||0) / g.maxStudents * 100) : 0;
                  return (
                    <div key={g.id} onClick={() => setDetailGroup(sel ? null : g)}
                      className={`gc card-in bg-white rounded-2xl border p-5 shadow-sm relative overflow-hidden
                        ${sel ? "border-emerald-400 shadow-emerald-100" : "border-slate-200"}`}
                      style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-black text-base shadow-md">
                          {g.name?.[0] || "G"}
                        </div>
                        {user?.role === "admin" && (
                          <div className="flex gap-1">
                            <button onClick={e => openEdit(g, e)} className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                              <Edit2 size={13} className="text-emerald-700" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setDeleteConfirm(g.id); }} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                              <Trash2 size={13} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                      <h3 className="font-black text-[15px] text-gray-900 mb-0.5 leading-tight">{g.name}</h3>
                      {g.description && <p className="text-[12px] text-gray-400 mb-3 line-clamp-1">{g.description}</p>}
                      <div className="space-y-2 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[12px] text-gray-600">
                          <BookOpen size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{getCourseName(g.courseId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-600">
                          <GraduationCap size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{getTeacherName(g.teacherId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                          <span>{fmt(g.startDate)} → {fmt(g.endDate)}</span>
                        </div>
                        {g.timeSlot && (
                          <div className="flex items-center gap-2 text-[12px] text-gray-500">
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="font-semibold text-emerald-700">{g.timeSlot}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-gray-500 flex items-center gap-1"><Users size={10} /> O'quvchilar</span>
                          <span className="font-bold text-emerald-700">{g.currentStudents||0}/{g.maxStudents}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={g.status} />
                        {user?.role === "admin" && (
                          <button onClick={e => { e.stopPropagation(); setStudentsModal(g); }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-200">
                            <UserPlus size={12} /> Boshqarish
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 pl-1">
              Jami <span className="font-bold text-emerald-600">{filtered.length}</span> ta guruh
            </p>
          </div>

          {/* Detail panel */}
          {detailGroup && (
            <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg sticky top-20">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 relative">
                <button onClick={() => setDetailGroup(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  <X size={13} className="text-white" />
                </button>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl mb-3">
                  {detailGroup.name?.[0] || "G"}
                </div>
                <p className="text-white font-black text-[17px] leading-tight">{detailGroup.name}</p>
                {detailGroup.description && <p className="text-white/70 text-[11px] mt-1 line-clamp-2">{detailGroup.description}</p>}
              </div>
              <div className="p-4 space-y-4">
                {[
                  { icon: BookOpen,      label: "Kurs",       val: getCourseName(detailGroup.courseId) },
                  { icon: GraduationCap, label: "O'qituvchi", val: getTeacherName(detailGroup.teacherId) },
                  { icon: Calendar,      label: "Muddat",     val: `${fmt(detailGroup.startDate)} → ${fmt(detailGroup.endDate)}` },
                  { icon: Clock,         label: "Vaqt",       val: detailGroup.timeSlot || "—" },
                  { icon: Hash,          label: "Kapasitet",  val: `${detailGroup.currentStudents||0} / ${detailGroup.maxStudents}` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={12} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{label}</p>
                      <p className="text-[12px] text-gray-700 font-medium mt-0.5">{val}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100"><StatusBadge status={detailGroup.status} /></div>
                {user?.role === "admin" && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={e => openEdit(detailGroup, e)}
                      className="flex-1 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors">
                      <Edit2 size={12} /> Tahrirlash
                    </button>
                    <button onClick={() => setDeleteConfirm(detailGroup.id)}
                      className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors">
                      <Trash2 size={12} /> O'chirish
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════ ADD/EDIT MODAL ══════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-in bg-white rounded-3xl w-full max-w-[580px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {isEditing ? <Edit2 size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                </div>
                <div>
                  <p className="text-white font-black text-[17px]">{isEditing ? "Guruhni tahrirlash" : "Yangi Guruh Yaratish"}</p>
                  <p className="text-white/65 text-[11px] mt-0.5">Barcha maydonlarni to'ldiring</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-5">
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  <XCircle size={16} /> {error}
                </div>
              )}

              {/* Guruh nomi */}
              <div>
                <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Guruh nomi <span className="text-red-400">*</span>
                </label>
                <input required placeholder="Masalan: Frontend - 1-guruh"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all"
                />
              </div>

              {/* Kurs + O'qituvchi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Kurs <span className="text-red-400">*</span>
                  </label>
                  <select required value={formData.courseId}
                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer transition-all"
                    disabled={loading}
                  >
                    <option value="">— Tanlang —</option>
                    {loading ? (
                      <option disabled>Kurslar yuklanmoqda...</option>
                    ) : courses.length === 0 ? (
                      <option disabled>Kurslar topilmadi</option>
                    ) : (
                      courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title || c.name}</option>
                      ))
                    )}
                  </select>
                  {loading && (
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                      ⏳ Kurslar yuklanmoqda...
                    </p>
                  )}
                  {!loading && courses.length === 0 && (
                    <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                      ⚠️ Kurslar topilmadi
                    </p>
                  )}
                </div>

                {/* O'qituvchi — API dan kelgan o'qituvchilar */}
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    O'qituvchi <span className="text-red-400">*</span>
                  </label>
                  <select required value={formData.teacherId}
                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer transition-all"
                    disabled={loading}
                  >
                    <option value="">— Tanlang —</option>
                    {loading ? (
                      <option disabled>O'qituvchilar yuklanmoqda...</option>
                    ) : teachers.length === 0 ? (
                      <option disabled>O'qituvchilar topilmadi</option>
                    ) : (
                      teachers.map(t => {
                        const name = t.user?.name || t.name || "Noma'lum";
                        const spec = t.specialization ? ` (${t.specialization.split(" ").slice(0,2).join(" ")})` : "";
                        return (
                          <option key={t.id} value={t.id}>{name}{spec}</option>
                        );
                      })
                    )}
                  </select>
                  {loading && (
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                      ⏳ O'qituvchilar yuklanmoqda...
                    </p>
                  )}
                  {!loading && teachers.length === 0 && (
                    <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                      ⚠️ Avval o'qituvchi qo'shing
                    </p>
                  )}
                </div>
              </div>

              {/* Sanalar */}
              <div className="grid grid-cols-2 gap-4">
                {["startDate","endDate"].map(field => (
                  <div key={field}>
                    <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      {field === "startDate" ? "Boshlanish" : "Tugash"} sanasi <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input readOnly placeholder="Sanani tanlang"
                        value={formData[field] ? new Date(formData[field]).toLocaleDateString("uz-UZ") : ""}
                        onClick={() => setCalendarOpen(true)}
                        className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer transition-all" />
                      <button type="button" onClick={() => setCalendarOpen(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
                        <Calendar size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dars vaqti — 4 ta interval */}
              <div>
                <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Dars vaqti <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: slot.value })}
                      className={`time-btn py-2.5 px-2 rounded-xl border text-[12px] font-bold text-center transition-all
                        ${formData.timeSlot === slot.value
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-gray-50 border-gray-200 text-gray-600"}`}
                    >
                      <Clock size={13} className={`mx-auto mb-1 ${formData.timeSlot === slot.value ? "text-white" : "text-gray-400"}`} />
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maksimal o'quvchi + Holat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Maksimal o'quvchi
                  </label>
                  <input required type="number" min="1" max="100"
                    value={formData.maxStudents}
                    onChange={e => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all" />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-2">Holat</label>
                  <div className="flex flex-col gap-1.5">
                    {GROUP_STATUS.map(s => (
                      <label key={s.value}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all text-[12px] font-semibold
                          ${formData.status === s.value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                        <input type="radio" name="status" value={s.value}
                          checked={formData.status === s.value}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="hidden" />
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Tavsif <span className="text-gray-300 font-normal normal-case">(ixtiyoriy)</span>
                </label>
                <textarea rows={2} placeholder="Guruh haqida qo'shimcha ma'lumot"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none transition-all" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <X size={15} /> Bekor
                </button>
                <button type="submit" disabled={modalLoading}
                  className="flex-[2] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-60">
                  {modalLoading
                    ? <><SmallImageLoader size={16} /> Saqlanmoqda...</>
                    : <><Save size={16} /> {isEditing ? "Saqlash" : "Guruh yaratish"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar */}
      {calendarOpen && (
        <CalendarPicker
          startDate={formData.startDate} endDate={formData.endDate}
          onChange={(field, val) => setFormData(p => ({ ...p, [field]: val }))}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {/* Students Modal */}
      {studentsModal && user?.role === "admin" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setStudentsModal(null)}>
          <div className="modal-in bg-white rounded-3xl w-full max-w-[620px] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-[17px]">{studentsModal.name}</p>
                  <p className="text-white/65 text-[11px] mt-0.5">{groupStudents.length} / {studentsModal.maxStudents} o'quvchi</p>
                </div>
              </div>
              <button onClick={() => setStudentsModal(null)} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
             
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">Guruh to'lishi</span>
                  <span className="font-bold text-emerald-600">
                    {studentsModal.maxStudents ? Math.round(groupStudents.length / studentsModal.maxStudents * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${studentsModal.maxStudents ? (groupStudents.length / studentsModal.maxStudents * 100) : 0}%` }} />
                </div>
              </div>

              {/* Guruh o'quvchilari */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Guruh o'quvchilari ({groupStudents.length})
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-400" />
                    <input type="date" value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-emerald-500 transition-colors" />
                  </div>
                </div>
                {groupStudents.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                    Hali o'quvchilar biriktirilmagan
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupStudents.map(s => {
                      const isPresent = attendance[`${selectedDate}-${s.id}`] || false;
                      return (
                        <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} size="w-9 h-9" />
                            <div>
                              <p className="font-bold text-sm text-gray-900">{s.name}</p>
                              <p className="text-[11px] text-gray-500">{s.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAttendance(prev => ({ ...prev, [`${selectedDate}-${s.id}`]: !prev[`${selectedDate}-${s.id}`] }))}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isPresent ? "bg-emerald-600" : "bg-gray-300"}`}>
                              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${isPresent ? "translate-x-6" : "translate-x-0.5"}`} />
                            </button>
                            <span className={`text-[11px] font-medium ${isPresent ? "text-emerald-600" : "text-gray-400"}`}>
                              {isPresent ? "Keldi" : "Kelmadi"}
                            </span>
                            <button onClick={() => handleRemoveStudent(s.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors ml-1">
                              <Trash2 size={12} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Barcha o'quvchilar */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Qo'shish uchun o'quvchilar ({otherStudents.length})
                </p>
                {otherStudents.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                    Qo'shish uchun o'quvchi yo'q
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {otherStudents.map(s => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} size="w-8 h-8" green={false} />
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s.phone}</p>
                          </div>
                        </div>
                        <button onClick={() => handleAddStudent(s.id)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center transition-colors">
                          <UserPlus size={13} className="text-emerald-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="modal-in bg-white rounded-2xl p-8 max-w-[340px] w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <p className="font-bold text-xl text-slate-900 mb-2">O'chirishni tasdiqlang</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-7">Bu guruh va uning barcha ma'lumotlari o'chiriladi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                Bekor
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <Trash2 size={14} /> O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-around h-16">
            {[
              { href: "/admin-panel", icon: Layers,       label: "Bosh sahifa" },
              { href: "/student",     icon: Users,        label: "O'quvchilar" },
              { href: "/teachers",    icon: GraduationCap,label: "O'qituvchilar" },
              { href: "/groups",      icon: BookOpen,     label: "Guruhlar", active: true },
            ].map(({ href, icon: Icon, label, active }) => (
              <a key={href} href={href}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors
                  ${active ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600"}`}>
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
      <div className="h-20" />
    </div>
  );
}