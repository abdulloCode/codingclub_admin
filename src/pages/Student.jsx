import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import ImageLoader, { SmallImageLoader } from "../components/ImageLoader";
import {
  GraduationCap, Plus, Search, Edit2, Trash2,
  Mail, Phone, RefreshCw, X, Save, BookOpen,
  CheckCircle, XCircle, UserCircle, Filter,
  ChevronRight, Eye, EyeOff, AlertTriangle,
  MapPin, Users, UserCheck, TrendingUp, Layers
} from "lucide-react";

const EDUCATION_LEVELS = [
  "Maktab o'quvchisi",
  "Bakalavriat",
  "Magistratura",
  "Kurslar o'quvchisi"
];

const COURSES = [
  "Frontend (React/Next.js)",
  "Backend (Node.js/Go)",
  "Full-stack Development",
  "Mobile (Flutter/RN)",
  "UI/UX Dizayn",
  "Cyber Security",
  "Data Science/AI",
  "DevOps"
];

const COURSE_COLORS = {
  "Frontend (React/Next.js)":   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  "Backend (Node.js/Go)":       { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  "Full-stack Development":     { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200"   },
  "Mobile (Flutter/RN)":        { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  "UI/UX Dizayn":               { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200"   },
  "Cyber Security":             { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"    },
  "Data Science/AI":            { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
  "DevOps":                     { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
};

const initialForm = {
  name: "", email: "", phone: "", password: "",
  educationLevel: EDUCATION_LEVELS[0],
  course: COURSES[0],
  groupId: "",
  status: "active",
  address: "",
  parentPhone: "",
};

function Avatar({ name, size = "w-10 h-10" }) {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-[#25671E] to-[#38a02d] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-green-900/20`}>
      {initials}
    </div>
  );
}

function CourseBadge({ label }) {
  const c = COURSE_COLORS[label] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${c.bg} ${c.text} ${c.border} truncate max-w-full`}>
      <BookOpen size={10} /> {label}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 shadow-[0_0_4px_#22c55e]" : "bg-red-400"}`} />
      {active ? "FAOL" : "NOFAOL"}
    </span>
  );
}

export default function Student() {
  const { user } = useAuth();
  const [students,       setStudents]       = useState([]);
  const [groups,         setGroups]         = useState([]);
  const [groupsLoading,  setGroupsLoading]  = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCourse,   setFilterCourse]   = useState("all");
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [selectedStudent,setSelectedStudent]= useState(null);
  const [detailStudent,  setDetailStudent]  = useState(null);
  const [formData,       setFormData]       = useState(initialForm);
  const [modalLoading,   setModalLoading]   = useState(false);
  const [showPass,       setShowPass]       = useState(false);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  // API dan guruhlarni yuklash
  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const res = await apiService.getGroups();
      // Faqat faol guruhlarni ko'rsatish
      const all = Array.isArray(res) ? res : res?.groups ?? [];
      setGroups(all.filter(g => g.status === "active" || !g.status));
    } catch (err) {
      console.error("Guruhlarni yuklashda xatolik:", err);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true); setError("");
      const res = await apiService.getStudents();
      setStudents(Array.isArray(res) ? res : res?.students ?? []);
    } catch (err) {
      setError(err.message || "Yuklashda xatolik");
    } finally { setLoading(false); }
  };

  // Guruh nomini ID bo'yicha topish
  const getGroupName = (groupId) => {
    if (!groupId) return null;
    const g = groups.find(g => g.id === groupId);
    return g?.name ?? null;
  };

  const openAdd = () => {
    setFormData(initialForm); setIsEditing(false);
    setSelectedStudent(null); setShowPass(false);
    setError(""); setIsModalOpen(true);
  };

  const openEdit = (s, e) => {
    e?.stopPropagation();
    setSelectedStudent(s);
    setFormData({
      name:           s.name           || "",
      email:          s.email          || "",
      phone:          s.phone          || "",
      password:       "",
      educationLevel: s.educationLevel || EDUCATION_LEVELS[0],
      course:         s.course         || COURSES[0],
      groupId:        s.groupId        || "",
      status:         s.status         || "active",
      address:        s.address        || "",
      parentPhone:    s.parentPhone    || "",
    });
    setIsEditing(true); setShowPass(false);
    setError(""); setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalLoading(true); setError("");
    const cleanData = {
      ...formData,
      phone:       formData.phone.replace(/\D/g, ""),
      parentPhone: formData.parentPhone ? formData.parentPhone.replace(/\D/g, "") : "",
    };
    if (!cleanData.email.includes("@")) {
      setError("To'g'ri email kiriting!"); setModalLoading(false); return;
    }
    try {
      if (isEditing) {
        if (!cleanData.password) delete cleanData.password;
        await apiService.updateStudent(selectedStudent.id, cleanData);
        setSuccess("Ma'lumotlar muvaffaqiyatli yangilandi");
      } else {
        await apiService.createStudent(cleanData);
        setSuccess("Yangi o'quvchi muvaffaqiyatli qo'shildi");
      }
      setIsModalOpen(false); fetchStudents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi");
    } finally { setModalLoading(false); }
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteStudent(deleteConfirm);
      if (detailStudent?.id === deleteConfirm) setDetailStudent(null);
      setDeleteConfirm(null);
      setSuccess("O'quvchi o'chirildi");
      fetchStudents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "O'chirishda xatolik");
      setDeleteConfirm(null);
    }
  };

  const handleAttendanceToggle = async (studentId, isAttended) => {
    try {
      // API orqali attendance endpoint'ni chaqirish
      console.log(`Setting attendance for student ${studentId}: ${isAttended ? 'present' : 'absent'}`);
      // Bu yerda API chaqiruvi qo'shilishi kerak
      // Masalan: await apiService.updateAttendance(studentAttendanceId, { status: isAttended ? 'present' : 'absent' });
      setSuccess(`Davomat ${isAttended ? 'haqiqiy' : 'yo\'q'} deb belgilandi`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Attendance toggle error:", err);
      setError("Davomatni belgilashda xatolik");
    }
  };

  const filtered = students.filter(s => {
    const q   = searchQuery.toLowerCase();
    const ms  = s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q);
    const mst = filterStatus === "all" || s.status === filterStatus;
    const mc  = filterCourse === "all" || s.course === filterCourse;
    return ms && mst && mc;
  });

  const stats = [
    { icon: Users,      label: "Jami o'quvchilar",  value: students.length },
    { icon: UserCheck,  label: "Faol o'quvchilar",   value: students.filter(s => s.status === "active").length },
    { icon: BookOpen,   label: "Kurslar",             value: [...new Set(students.map(s => s.course).filter(Boolean))].length },
    { icon: TrendingUp, label: "Bu yil",              value: students.length },
  ];

  // Debug: student data
  useEffect(() => {
    console.log("Student component - Students:", students);
    console.log("Student component - Groups:", groups);
  }, [students, groups]);

  return (
    <div className="min-h-screen bg-[#f4f7f3] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes slideR  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:none} }
        @keyframes toastUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .row-in    { animation: fadeUp 0.32s ease both; }
        .detail-in { animation: slideR 0.28s ease; }
        .modal-in  { animation: scaleIn 0.28s cubic-bezier(.34,1.56,.64,1); }
        .toast-in  { animation: toastUp 0.3s ease; }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #25671E !important;
          box-shadow: 0 0 0 3px rgba(37,103,30,0.15) !important;
        }
        .add-btn { transition: all 0.18s; }
        .add-btn:hover { background: #1e5218 !important; transform: translateY(-1px); }
        .add-btn:active { transform: scale(0.97); }
        .tc { transition: box-shadow 0.2s, background 0.15s; }
        .tc:hover { box-shadow: 0 6px 28px rgba(37,103,30,0.12); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #c6e8bb; border-radius: 99px; }
      `}</style>

      <div className="fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#25671E] to-[#38a02d] z-50" />

      {success && (
        <div className="toast-in fixed bottom-24 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-sm text-white shadow-2xl bg-[#25671E]">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-[#e8f0e5] sticky top-0 z-40 shadow-sm shadow-green-900/5">
        <div className="max-w-[1320px] mx-auto pl-8 pr-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#25671E] to-[#38a02d] flex items-center justify-center shadow-lg shadow-green-900/25">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-[15px] text-gray-900 leading-none">O'quvchilar</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Dunyo O'quv Markazi</p>
            </div>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ChevronRight size={13} className="text-gray-300" />
            <span className="text-[13px] text-gray-400">Boshqaruv paneli</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input placeholder="Qidirish..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl w-52 transition-all" />
            </div>

            {[["all","Barchasi"],["active","Faol"],["inactive","Nofaol"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilterStatus(v)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all ${filterStatus === v ? "bg-[#e8f5e3] text-[#25671E] border-[#c6e8bb]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                {l}
              </button>
            ))}

            <div className="relative flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl">
              <Filter size={13} className="text-gray-400" />
              <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                className="text-[12px] font-bold text-gray-600 bg-transparent appearance-none cursor-pointer pr-3 outline-none border-none">
                <option value="all">Kurslar</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button onClick={fetchStudents} title="Yangilash" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              {loading ? <SmallImageLoader size={18} /> : <RefreshCw size={18} className="text-slate-600" />}
            </button>

            <button onClick={openAdd} className="add-btn flex items-center gap-2 px-4 py-2.5 bg-[#25671E] text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-900/25">
              <Plus size={18} /> Qo'shish
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1320px] mx-auto pl-8 pr-6 py-7">
        {error && !isModalOpen && (
          <div className="mb-5 flex items-center gap-3 px-5 py-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-[13px] font-semibold">
            <XCircle size={18} className="flex-shrink-0" /> {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={16} /></button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#e8f5e3] rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-[#25671E]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#eef2eb] p-20 flex flex-col items-center gap-4">
                <ImageLoader size={50} text="Ma'lumotlar yuklanmoqda..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#eef2eb] p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#e8f5e3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCircle size={28} className="text-[#25671E]" />
                </div>
                <p className="font-bold text-gray-800 text-lg mb-1">
                  {students.length === 0 ? "Hali o'quvchi qo'shilmagan" : "Hech narsa topilmadi"}
                </p>
                <p className="text-[13px] text-gray-400 mb-6">
                  {students.length === 0 ? "Birinchi o'quvchini qo'shish uchun tugmani bosing" : "Qidiruv yoki filtrni o'zgartiring"}
                </p>
                {students.length === 0 ? (
                  <button onClick={openAdd} className="add-btn inline-flex items-center gap-2 bg-[#25671E] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-lg shadow-green-900/25">
                    <Plus size={15} /> Qo'shish
                  </button>
                ) : (
                  <button onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterCourse("all"); }}
                    className="inline-flex items-center gap-2 border border-[#c6e8bb] text-[#25671E] px-5 py-2.5 rounded-xl font-bold text-[13px] bg-[#e8f5e3]">
                    <X size={14} /> Filtrlarni tozalash
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#eef2eb] overflow-hidden shadow-sm shadow-green-900/5">
                <div className="grid grid-cols-[2fr_2fr_1.6fr_1.2fr_1fr_1fr_88px] px-5 py-3 bg-[#f9fbf8] border-b border-[#eef2eb] text-[10.5px] font-bold text-gray-400 uppercase tracking-widest gap-3">
                  <span>O'quvchi</span><span>Kurs</span><span>Kontakt</span>
                  <span>Ta'lim</span><span>Holat</span><span>Davomat</span><span className="text-right">Amal</span>
                </div>
                {filtered.map((s, i) => {
                  const sel = detailStudent?.id === s.id;
                  const groupName = getGroupName(s.groupId);
                  return (
                    <div key={s.id} onClick={() => setDetailStudent(sel ? null : s)}
                      className={`tc row-in grid grid-cols-[2fr_2fr_1.6fr_1.2fr_1fr_88px] px-5 py-3.5 gap-3 items-center cursor-pointer border-l-[3px] ${sel ? "bg-[#f0faea] border-l-[#25671E]" : "border-l-transparent hover:bg-[#fafcf9]"} ${i < filtered.length - 1 ? "border-b border-[#f3f4f1]" : ""}`}
                      style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={s.name} size="w-10 h-10" />
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] text-gray-900 truncate">{s.name}</p>
                          {groupName && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                              <Layers size={9} /> {groupName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="overflow-hidden"><CourseBadge label={s.course} /></div>
                      <div className="text-[12px] text-gray-500 space-y-1">
                        <div className="flex items-center gap-1.5"><Mail size={11} className="text-gray-400 flex-shrink-0" /><span className="truncate">{s.email}</span></div>
                        <div className="flex items-center gap-1.5"><Phone size={11} className="text-gray-400 flex-shrink-0" />{s.phone}</div>
                      </div>
                      <p className="text-[12px] text-gray-500 truncate">{s.educationLevel}</p>
                      <StatusBadge active={s.status === "active"} />
                      {/* Attendance toggle switch */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500">Davomat</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                            className="sr-only peer"
                            checked={s.attended || false}
                            onChange={(e) => handleAttendanceToggle(s.id, e.target.checked)}
                          />
                          <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all`}></div>
                        </label>
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={e => openEdit(s, e)}
                          className="w-8 h-8 rounded-lg bg-[#e8f5e3] hover:bg-[#c6e8bb] flex items-center justify-center transition-colors">
                          <Edit2 size={14} className="text-[#25671E]" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(s.id); }}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[12px] text-gray-400 mt-3 pl-1">
              Jami <span className="font-bold text-[#25671E]">{filtered.length}</span> ta o'quvchi
            </p>
          </div>

          {/* Detail panel */}
          {detailStudent && (
            <div className="detail-in w-72 flex-shrink-0 bg-white rounded-2xl border border-[#eef2eb] overflow-hidden shadow-lg shadow-green-900/10 sticky top-20">
              <div className="bg-gradient-to-br from-[#25671E] to-[#38a02d] p-5 relative">
                <button onClick={() => setDetailStudent(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  <X size={13} className="text-white" />
                </button>
                <Avatar name={detailStudent.name} size="w-14 h-14" />
                <p className="text-white font-black text-[16px] mt-3 leading-tight">{detailStudent.name}</p>
                <p className="text-white/70 text-[11px] mt-0.5">{detailStudent.educationLevel}</p>
              </div>
              <div className="p-4 space-y-4">
                {/* Guruh */}
                {getGroupName(detailStudent.groupId) && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Guruh</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Layers size={13} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-[13px] font-bold text-emerald-700">{getGroupName(detailStudent.groupId)}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kurs</p>
                  <CourseBadge label={detailStudent.course} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kontakt</p>
                  <div className="space-y-2">
                    {[{ Icon: Mail, text: detailStudent.email }, { Icon: Phone, text: detailStudent.phone }].map(({ Icon, text }) => text ? (
                      <div key={text} className="flex items-center gap-2.5 text-[12px] text-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-[#e8f5e3] flex items-center justify-center flex-shrink-0">
                          <Icon size={12} className="text-[#25671E]" />
                        </div>
                        <span className="truncate">{text}</span>
                      </div>
                    ) : null)}
                    {detailStudent.parentPhone && (
                      <div className="flex items-center gap-2.5 text-[12px] text-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <Phone size={12} className="text-amber-600" />
                        </div>
                        <span>{detailStudent.parentPhone} <span className="text-gray-400">(ota-ona)</span></span>
                      </div>
                    )}
                    {detailStudent.address && (
                      <div className="flex items-center gap-2.5 text-[12px] text-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-[#e8f5e3] flex items-center justify-center flex-shrink-0">
                          <MapPin size={12} className="text-[#25671E]" />
                        </div>
                        <span className="truncate">{detailStudent.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <StatusBadge active={detailStudent.status === "active"} />
                  <span className="text-[10px] text-gray-400 font-mono">#{detailStudent.id?.slice(-8)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={e => openEdit(detailStudent, e)}
                    className="flex-1 py-2.5 rounded-xl border border-[#c6e8bb] bg-[#e8f5e3] text-[#25671E] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#c6e8bb] transition-colors">
                    <Edit2 size={12} /> Tahrirlash
                  </button>
                  <button onClick={() => setDeleteConfirm(detailStudent.id)}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors">
                    <Trash2 size={12} /> O'chirish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease" }}
          onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-in bg-white rounded-[28px] w-full max-w-[580px] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#25671E] to-[#38a02d] px-7 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {isEditing ? <Edit2 size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                </div>
                <div>
                  <p className="text-white font-black text-[17px]">
                    {isEditing ? "Ma'lumotlarni tahrirlash" : "Yangi O'quvchi Qo'shish"}
                  </p>
                  <p className="text-white/65 text-[11px] mt-0.5">Dunyo O'quv Markazi</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X size={16} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7 max-h-[72vh] overflow-y-auto">
              {error && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] font-medium">
                  <XCircle size={16} /> {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">To'liq ism</label>
                  <input required placeholder="Ism Familiya" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                  <input required type="email" placeholder="student@email.com" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] transition-all" />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Telefon</label>
                  <input required placeholder="+998 90 000 00 00" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {isEditing ? "Yangi parol (ixtiyoriy)" : "Parol *"}
                  </label>
                  <div className="relative">
                    <input required={!isEditing} type={showPass ? "text" : "password"}
                      placeholder={isEditing ? "Parolni o'zgartirmoqchi bo'lsangiz kiriting" : "••••••••"}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-[14px] transition-all" />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ta'lim darajasi</label>
                  <select value={formData.educationLevel}
                    onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] appearance-none cursor-pointer transition-all">
                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Kurs</label>
                  <select value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] appearance-none cursor-pointer transition-all">
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Guruh — API dan kelgan faol guruhlar */}
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Guruh <span className="normal-case font-normal text-gray-400">(ixtiyoriy)</span>
                  </label>
                  <div className="relative">
                    <Layers size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select value={formData.groupId}
                      onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] appearance-none cursor-pointer transition-all">
                      <option value="">— Guruh tanlanmagan —</option>
                      {groupsLoading ? (
                        <option disabled>Yuklanmoqda...</option>
                      ) : groups.length === 0 ? (
                        <option disabled>Hali guruh yaratilmagan</option>
                      ) : (
                        groups.map(g => {
                          const spotsLeft = g.maxStudents - (g.currentStudents || 0);
                          return (
                            <option key={g.id} value={g.id}>
                              {g.name}{g.timeSlot ? ` · ${g.timeSlot}` : ""}{spotsLeft > 0 ? ` (${spotsLeft} joy bor)` : " (to'liq)"}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                  {/* Tanlangan guruh haqida ma'lumot */}
                  {formData.groupId && (() => {
                    const sel = groups.find(g => g.id === formData.groupId);
                    if (!sel) return null;
                    return (
                      <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-[12px]">
                        <Layers size={13} className="text-emerald-600 flex-shrink-0" />
                        <div className="flex gap-3 flex-wrap">
                          <span className="font-bold text-emerald-700">{sel.name}</span>
                          {sel.timeSlot && <span className="text-gray-500">🕐 {sel.timeSlot}</span>}
                          <span className="text-gray-500">👥 {sel.currentStudents || 0}/{sel.maxStudents}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Manzil <span className="normal-case font-normal">(ixtiyoriy)</span></label>
                  <input placeholder="Yashash manzili" value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ota-ona telefoni <span className="normal-case font-normal">(ixtiyoriy)</span></label>
                  <input placeholder="+998 90 000 00 00" value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-2">Holat</label>
                  <div className="flex gap-3">
                    {[["active","✅ Faol"],["inactive","❌ Nofaol"]].map(([val, lbl]) => (
                      <label key={val} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all text-[13px] font-bold ${formData.status === val ? "border-[#25671E] bg-[#e8f5e3] text-[#25671E]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                        <input type="radio" name="status" value={val}
                          checked={formData.status === val}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="hidden" />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <X size={15} /> Bekor qilish
                </button>
                <button type="submit" disabled={modalLoading}
                  className="flex-[2] py-3 rounded-xl bg-[#25671E] hover:bg-[#1e5218] text-white font-black text-[14px] flex items-center justify-center gap-2.5 shadow-lg shadow-green-900/30 transition-all active:scale-[0.98] disabled:opacity-60">
                  {modalLoading
                    ? <><SmallImageLoader size={16} /> Saqlanmoqda...</>
                    : <><Save size={16} /> {isEditing ? "O'zgarishlarni saqlash" : "Ro'yxatdan o'tkazish"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md flex items-center justify-center z-[60] p-4" style={{ animation: "fadeIn 0.2s ease" }}>
          <div className="modal-in bg-white rounded-[24px] p-8 max-w-[340px] w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <p className="font-black text-[17px] text-gray-900 mb-2">O'chirishni tasdiqlang</p>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-7">
              Bu amalni ortga qaytarib bo'lmaydi. O'quvchi tizimdan butunlay o'chiriladi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 bg-gray-50 font-bold text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
                Bekor
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                <Trash2 size={14} /> O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-around h-16">
            <a href="/admin-panel" className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-[#25671E] transition-colors">
              <Layers size={20} /><span className="text-xs font-medium">Bosh sahifa</span>
            </a>
            <a href="/student" className="flex flex-col items-center gap-1 px-4 py-2 text-[#25671E]">
              <Users size={20} /><span className="text-xs font-medium">O'quvchilar</span>
            </a>
            <a href="/teachers" className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-[#25671E] transition-colors">
              <GraduationCap size={20} /><span className="text-xs font-medium">O'qituvchilar</span>
            </a>
            <a href="/groups" className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-[#25671E] transition-colors">
              <BookOpen size={20} /><span className="text-xs font-medium">Guruhlar</span>
            </a>
          </div>
        </div>
      </nav>
      <div className="h-20" />
    </div>
  );
}