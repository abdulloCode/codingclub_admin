import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import ImageLoader, { SmallImageLoader } from "../components/ImageLoader";
import {
  Users, Plus, Search, Edit2, Trash2, Mail, Phone,
  X, Save, ShieldCheck, CheckCircle,
  GraduationCap, AlertTriangle,
  BookOpen, Calendar, Activity,
} from "lucide-react";

// --- KONSTANTALAR ---
const IT_SPECIALIZATIONS = [
  "Frontend Developer (React/Next.js)",
  "Backend Developer (Node.js/Go/Python)",
  "Full-stack Web Developer",
  "Mobile App Developer (Flutter/RN)",
  "UI/UX Designer",
  "Cyber Security Specialist",
  "Data Scientist / AI Engineer",
  "DevOps Engineer",
];

const QUALIFICATIONS = ["Oliy ma'lumotli", "Magistr", "PhD", "Bakalavr", "O'rta maxsus"];

const SPEC_SHORT = {
  "Frontend Developer (React/Next.js)": "Frontend",
  "Backend Developer (Node.js/Go/Python)": "Backend",
  "Full-stack Web Developer": "Full-stack",
  "Mobile App Developer (Flutter/RN)": "Mobile",
  "UI/UX Designer": "UI/UX",
  "Cyber Security Specialist": "Cyber Sec",
  "Data Scientist / AI Engineer": "Data / AI",
  "DevOps Engineer": "DevOps",
};

const BRAND = "#427A43";
const BRAND_LIGHT = "#f0f7f0";

// --- YORDAMCHI KOMPONENTLAR ---
function Avatar({ name, size = "w-11 h-11" }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={`${size} rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow`}
      style={{ background: BRAND }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
        active
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-400"
        }`}
      />
      {active ? "FAOL" : "NOFAOL"}
    </span>
  );
}

// --- ASOSIY KOMPONENT ---
export default function Teachers() {
  const { user } = useAuth();

  // States
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("teachers");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Forms
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: IT_SPECIALIZATIONS[0],
    qualification: QUALIFICATIONS[0],
    status: "active",
  });
  const [groupForm, setGroupForm] = useState({
    name: "",
    courseId: "",
    teacherId: "",
    maxStudents: 20,
    status: "active",
    currentStudents: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, gRes] = await Promise.all([
        apiService.getTeachers(),
        apiService.getCourses(),
        apiService.getGroups(),
      ]);
      setTeachers(Array.isArray(tRes) ? tRes : tRes.teachers || []);
      setCourses(Array.isArray(cRes) ? cRes : cRes.courses || []);
      setGroups(Array.isArray(gRes) ? gRes : gRes.groups || []);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const openAddModal = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      specialization: IT_SPECIALIZATIONS[0],
      qualification: QUALIFICATIONS[0],
      status: "active",
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  // --- O'QITUVCHI CRUD ---
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (isEditing) {
        await apiService.updateTeacher(form.id, form);
        showToast("O'qituvchi yangilandi");
      } else {
        await apiService.createTeacher(form);
        showToast("O'qituvchi muvaffaqiyatli qo'shildi");
      }
      setModalOpen(false);
      loadInitialData();
    } catch (err) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === "teacher") {
        await apiService.deleteTeacher(deleteConfirm);
        showToast("O'qituvchi tizimdan o'chirildi");
      } else if (deleteType === "group") {
        await apiService.deleteGroup(deleteConfirm);
        showToast("Guruh tizimdan o'chirildi");
      }
      setDeleteConfirm(null);
      setDeleteType(null);
      loadInitialData();
    } catch (err) {
      setError("O'chirishda xatolik");
    }
  };

  // --- GURUH CRUD ---
  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createGroup(groupForm);
      showToast("Guruh muvaffaqiyatli yaratildi");
      setGroupModalOpen(false);
      setGroupForm({
        name: "",
        courseId: "",
        teacherId: "",
        maxStudents: 20,
        status: "active",
        currentStudents: 0,
        startDate: "",
        endDate: "",
      });
      loadInitialData();
    } catch (err) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      (t.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Toast */}
      {success && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[200] flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Boshqaruv Paneli</h1>
          <p className="text-slate-500 text-sm">O'qituvchilar va guruhlarni boshqarish</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg transition-all hover:opacity-90"
          style={{ background: BRAND }}
        >
          + O'qituvchi Qo'shish
        </button>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="O'qituvchi qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 text-sm"
            style={{ "--tw-ring-color": BRAND }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-1 p-1 bg-slate-200/60 rounded-2xl w-fit">
        {["teachers", "groups", "courses"].map((tab) => {
          const labels = { teachers: "O'qituvchilar", groups: "Guruhlar", courses: "Kurslar" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? "bg-white shadow-sm" : "text-slate-500"
              }`}
              style={activeTab === tab ? { color: BRAND } : {}}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ImageLoader size={50} text="O'qituvchilar yuklanmoqda..." />
          </div>
        ) : activeTab === "teachers" ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">O'qituvchi</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Mutaxassislik</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Holat</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 text-sm">
                      O'qituvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.user?.name || t.name} />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{t.user?.name || t.name}</p>
                            <p className="text-xs text-slate-400">{t.user?.email || t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 rounded-lg text-xs font-bold border"
                          style={{
                            background: BRAND_LIGHT,
                            color: BRAND,
                            borderColor: "#c3dfc4",
                          }}
                        >
                          {SPEC_SHORT[t.specialization] || t.specialization}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge active={t.status === "active"} />
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setForm({ ...t, name: t.user?.name || t.name });
                            setIsEditing(true);
                            setModalOpen(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm(t.id);
                            setDeleteType("teacher");
                          }}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "groups" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <button
              onClick={() => setGroupModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-green-400 hover:text-green-600 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Plus size={22} />
              </div>
              <span className="font-bold text-sm">Yangi guruh yaratish</span>
            </button>

            {groups.map((group) => {
              const course = courses.find((c) => c.id === group.courseId);
              const teacher = teachers.find((t) => t.id === group.teacherId);
              return (
                <div key={group.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black flex-shrink-0"
                      style={{ background: BRAND }}
                    >
                      {group.name?.substring(0, 2)?.toUpperCase() || "GR"}
                    </div>
                    <StatusBadge active={group.status === "active"} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-3">{group.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <BookOpen size={14} style={{ color: BRAND }} />
                      {course?.title || "Noma'lum kurs"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <GraduationCap size={14} className="text-blue-400" />
                      {teacher?.user?.name || teacher?.name || "Noma'lum o'qituvchi"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users size={14} className="text-purple-400" />
                      {group.currentStudents || 0}/{group.maxStudents || 20} o'quvchi
                    </div>
                    {group.startDate && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} className="text-orange-400" />
                        {new Date(group.startDate).toLocaleDateString("uz-UZ")}
                        {group.endDate && ` — ${new Date(group.endDate).toLocaleDateString("uz-UZ")}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                    <button
                      className="flex-1 py-2 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                      style={{ color: BRAND }}
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => { setDeleteConfirm(group.id); setDeleteType("group"); }}
                      className="flex-1 py-2 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Kurslar boshqaruvi alohida mavjud emas.</p>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/*               O'QITUVCHI QO'SHISH / TAHRIRLASH MODAL         */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: BRAND }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <GraduationCap size={18} color="white" />
                </div>
                <div>
                  <p className="text-white font-bold text-[15px] leading-tight">
                    {isEditing ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
                  </p>
                  <p className="text-white/60 text-xs">CodingClub boshqaruv tizimi</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <X size={16} color="white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleTeacherSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">

              {/* To'liq ism */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: BRAND }}
                >
                  <Users size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 mb-0.5">To'liq ism *</p>
                  <input
                    required
                    placeholder="Masalan: Sardor Aliyev"
                    className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder-slate-300"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email & Telefon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Mail size={12} style={{ color: BRAND }} />
                    <p className="text-[11px] text-slate-400">Email *</p>
                  </div>
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    className="w-full bg-transparent outline-none text-[13px] text-slate-900 placeholder-slate-300"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Phone size={12} style={{ color: BRAND }} />
                    <p className="text-[11px] text-slate-400">Telefon *</p>
                  </div>
                  <input
                    required
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-transparent outline-none text-[13px] text-slate-900 placeholder-slate-300"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Parol (faqat yangi qo'shishda) */}
              {!isEditing && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck size={12} style={{ color: BRAND }} />
                    <p className="text-[11px] text-slate-400">Parol *</p>
                  </div>
                  <input
                    required
                    type="password"
                    placeholder="Kamida 8 ta belgi"
                    className="w-full bg-transparent outline-none text-[13px] text-slate-900 placeholder-slate-300"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              {/* Mutaxassislik — pill buttons */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <BookOpen size={12} style={{ color: BRAND }} />
                  <p className="text-[11px] text-slate-400">Mutaxassislik</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {IT_SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setForm({ ...form, specialization: spec })}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                      style={
                        form.specialization === spec
                          ? { background: BRAND, color: "white", border: `1.5px solid ${BRAND}` }
                          : {
                              background: "white",
                              color: "#64748b",
                              border: "1.5px solid #e2e8f0",
                            }
                      }
                    >
                      {SPEC_SHORT[spec]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Malaka & Holat */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-1.5">Malaka darajasi</p>
                  <select
                    className="w-full bg-transparent outline-none text-[13px] text-slate-900"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2">Holat</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          status: form.status === "active" ? "inactive" : "active",
                        })
                      }
                      className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                      style={{
                        background: form.status === "active" ? BRAND : "#cbd5e1",
                      }}
                    >
                      <span
                        className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                        style={{
                          right: form.status === "active" ? "2px" : "auto",
                          left: form.status === "active" ? "auto" : "2px",
                        }}
                      />
                    </button>
                    <span
                      className="text-[13px] font-bold"
                      style={{
                        color: form.status === "active" ? BRAND : "#94a3b8",
                      }}
                    >
                      {form.status === "active" ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Xato xabari */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Tugmalar */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setError(""); }}
                  className="flex-1 py-3 text-slate-400 font-bold text-sm rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{
                    background: modalLoading ? "#7aaa7b" : BRAND,
                  }}
                >
                  <Save size={15} />
                  {modalLoading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*                     GURUH QO'SHISH MODAL                     */}
      {/* ============================================================ */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: BRAND }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <Users size={18} color="white" />
                </div>
                <div>
                  <p className="text-white font-bold text-[15px] leading-tight">Yangi guruh yaratish</p>
                  <p className="text-white/60 text-xs">CodingClub boshqaruv tizimi</p>
                </div>
              </div>
              <button
                onClick={() => setGroupModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <X size={16} color="white" />
              </button>
            </div>

            <form onSubmit={handleGroupSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">

              {/* Guruh nomi */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] text-slate-400 mb-1">Guruh nomi *</p>
                <input
                  required
                  placeholder="Masalan: Frontend-102"
                  className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder-slate-300"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                />
              </div>

              {/* Kurs tanlash */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen size={12} style={{ color: BRAND }} />
                  <p className="text-[11px] text-slate-400">Kurs *</p>
                </div>
                <select
                  required
                  className="w-full bg-transparent outline-none text-[13px] text-slate-900"
                  value={groupForm.courseId}
                  onChange={(e) => setGroupForm({ ...groupForm, courseId: e.target.value })}
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* O'qituvchi tanlash */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap size={12} style={{ color: BRAND }} />
                  <p className="text-[11px] text-slate-400">O'qituvchi *</p>
                </div>
                <select
                  required
                  className="w-full bg-transparent outline-none text-[13px] text-slate-900"
                  value={groupForm.teacherId}
                  onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })}
                >
                  <option value="">O'qituvchini tanlang</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.user?.name || t.name}</option>
                  ))}
                </select>
              </div>

              {/* Max o'quvchilar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users size={12} style={{ color: BRAND }} />
                  <p className="text-[11px] text-slate-400">Maksimal o'quvchilar soni *</p>
                </div>
                <input
                  required
                  type="number"
                  min="1"
                  max="50"
                  className="w-full bg-transparent outline-none text-[13px] text-slate-900"
                  value={groupForm.maxStudents}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, maxStudents: parseInt(e.target.value) })
                  }
                />
              </div>

              {/* Sanalar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar size={12} style={{ color: BRAND }} />
                    <p className="text-[11px] text-slate-400">Boshlash sanasi</p>
                  </div>
                  <input
                    type="date"
                    className="w-full bg-transparent outline-none text-[13px] text-slate-900"
                    value={groupForm.startDate}
                    onChange={(e) => setGroupForm({ ...groupForm, startDate: e.target.value })}
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity size={12} style={{ color: BRAND }} />
                    <p className="text-[11px] text-slate-400">Tugash sanasi</p>
                  </div>
                  <input
                    type="date"
                    className="w-full bg-transparent outline-none text-[13px] text-slate-900"
                    value={groupForm.endDate}
                    onChange={(e) => setGroupForm({ ...groupForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Holat */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] text-slate-400 mb-2">Guruh holati</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setGroupForm({
                        ...groupForm,
                        status: groupForm.status === "active" ? "inactive" : "active",
                      })
                    }
                    className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                    style={{
                      background: groupForm.status === "active" ? BRAND : "#cbd5e1",
                    }}
                  >
                    <span
                      className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                      style={{
                        right: groupForm.status === "active" ? "2px" : "auto",
                        left: groupForm.status === "active" ? "auto" : "2px",
                      }}
                    />
                  </button>
                  <span
                    className="text-[13px] font-bold"
                    style={{
                      color: groupForm.status === "active" ? BRAND : "#94a3b8",
                    }}
                  >
                    {groupForm.status === "active" ? "Faol" : "Nofaol"}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setGroupModalOpen(false); setError(""); }}
                  className="flex-1 py-3 text-slate-400 font-bold text-sm rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: modalLoading ? "#7aaa7b" : BRAND }}
                >
                  <Plus size={15} />
                  {modalLoading ? "Yaratilmoqda..." : "Guruhni Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*                   O'CHIRISHNI TASDIQLASH                     */}
      {/* ============================================================ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Tasdiqlaysizmi?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {deleteType === "teacher"
                ? "Ushbu o'qituvchi barcha ma'lumotlari bilan birga tizimdan o'chiriladi. Bu amalni qaytarib bo'lmaydi."
                : "Ushbu guruh barcha ma'lumotlari bilan birga tizimdan o'chiriladi. Bu amalni qaytarib bo'lmaydi."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteType(null); }}
                className="flex-1 py-3 font-bold text-slate-400 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
              >
                Yo'q
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
              >
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}