import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  GraduationCap, Plus, Search, Edit2, Trash2,
  Mail, Phone, RefreshCw, X, Save, Briefcase,
  CheckCircle, XCircle, UserCircle, Calendar,
  BookOpen, Filter, Download, ChevronDown
} from 'lucide-react';

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

export default function Student() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    educationLevel: EDUCATION_LEVELS[0],
    course: COURSES[0],
    status: 'active',
    address: '',
    parentPhone: '',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents();
      setStudents(Array.isArray(response) ? response : response.students || []);
    } catch (err) {
      setError(err.message || 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      password: '',
      educationLevel: student.educationLevel || EDUCATION_LEVELS[0],
      course: student.course || COURSES[0],
      status: student.status || 'active',
      address: student.address || '',
      parentPhone: student.parentPhone || '',
    });
    setIsEditing(true);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    const cleanData = {
      ...formData,
      phone: formData.phone.replace(/\D/g, ''),
      parentPhone: formData.parentPhone ? formData.parentPhone.replace(/\D/g, '') : ''
    };

    if (!cleanData.email.includes('@')) {
      setError("To'g'ri email kiriting!");
      setModalLoading(false);
      return;
    }

    try {
      if (isEditing) {
        if (!cleanData.password) delete cleanData.password;
        await apiService.updateStudent(selectedStudent.id, cleanData);
        setSuccess('Ma\'lumotlar muvaffaqiyatli yangilandi');
      } else {
        await apiService.createStudent(cleanData);
        setSuccess('Yangi o\'quvchi muvaffaqiyatli qo\'shildi');
      }
      setIsModalOpen(false);
      fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) {
      try {
        await apiService.deleteStudent(id);
        setSuccess('O\'chirilishi muvaffaqiyatli yakunlandi');
        fetchStudents();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery);

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || s.course === filterCourse;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg shadow-blue-200">
                <GraduationCap size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">O'quvchilar</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Barcha o'quvchilar boshqaruvi</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  placeholder="Qidirish..."
                  className="pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all text-sm text-slate-900 dark:text-white"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <button onClick={handleOpenAddModal} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all font-medium text-sm">
                <Plus size={18} /> Qo'shish
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
              <Filter size={16} className="text-slate-500" />
              <select
                className="bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">Barcha holatlar</option>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
              <BookOpen size={16} className="text-slate-500" />
              <select
                className="bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
              >
                <option value="all">Barcha kurslar</option>
                {COURSES.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Jami: {filteredStudents.length}</span>
              <span className="text-slate-300">|</span>
              <span className="text-green-600">Faol: {students.filter(s => s.status === 'active').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3 shadow-sm">
            <CheckCircle size={20} className="flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 shadow-sm">
            <XCircle size={20} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-blue-600" size={40}/>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <UserCircle size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">O'quvchilar topilmadi</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchQuery || filterStatus !== 'all' || filterCourse !== 'all'
                ? "Qidiruv shartlarini o'zgartirib ko'ring"
                : "Hali o'quvchilar qo'shilmagan"}
            </p>
            {searchQuery || filterStatus !== 'all' || filterCourse !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterCourse('all');
                }}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium"
              >
                Filterlarni tozalash
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Birinchi o'quvchini qo'shish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">
                    {student.name?.[0]}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEditModal(student)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                      <Edit2 size={18}/>
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">{student.name}</h3>
                <div className="flex items-center gap-2 text-blue-600 font-medium text-xs mb-4">
                  <Briefcase size={14}/> {student.course}
                </div>

                <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <Phone size={16} className="text-slate-400"/> {student.phone}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <Mail size={16} className="text-slate-400"/> {student.email}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <BookOpen size={16} className="text-slate-400"/> {student.educationLevel}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    student.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {student.status === 'active' ? 'FAOL' : 'NOFAOL'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">ID: {student.id?.slice(-8) || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEditing ? "Ma'lumotlarni tahrirlash" : "Yangi O'quvchi"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isEditing ? "Mavjud ma'lumotlarni yangilang" : "Barcha maydonlarni to'ldiring"}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-400"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    To'liq ism
                  </label>
                  <input
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ism Familiya"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="student@example.com"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Telefon
                  </label>
                  <input
                    required
                    placeholder="998901234567"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                      Parol
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 ml-1">
                      Yangi parol (ixtiyoriy)
                    </label>
                    <input
                      type="password"
                      placeholder="Parolni o'zgartirmoqchi bo'lsangiz kiriting"
                      className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Ta'lim darajasi
                  </label>
                  <select
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                    value={formData.educationLevel}
                    onChange={e => setFormData({...formData, educationLevel: e.target.value})}
                  >
                    {EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Kurs
                  </label>
                  <select
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                    value={formData.course}
                    onChange={e => setFormData({...formData, course: e.target.value})}
                  >
                    {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Manzil (ixtiyoriy)
                  </label>
                  <input
                    placeholder="Yashash manzili"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Ota-ona telefoni (ixtiyoriy)
                  </label>
                  <input
                    placeholder="Ota-ona telefon raqami"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    value={formData.parentPhone}
                    onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Holat
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Faol</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Nofaol</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                disabled={modalLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg mt-8 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {modalLoading ? (
                  <RefreshCw className="animate-spin" size={24}/>
                ) : (
                  <Save size={24}/>
                )}
                {isEditing ? "O'ZGARISHLARNI SAQLASH" : "RO'YXATDAN O'TKAZISH"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}