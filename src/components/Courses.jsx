import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  BookOpen, Plus, Search, Edit2, Trash2,
  Clock, DollarSign, Calendar, CheckCircle,
  XCircle, X, Save, Filter, RefreshCw,
  Star, Users, TrendingUp, Award,
  Briefcase, Target, Zap
} from 'lucide-react';

const COURSE_STATUS = [
  { value: 'active', label: 'Faol', color: 'from-emerald-500 to-green-600' },
  { value: 'completed', label: 'Tugallangan', color: 'from-blue-500 to-indigo-600' },
  { value: 'draft', label: 'Qoralama', color: 'from-amber-500 to-orange-600' },
  { value: 'archived', label: 'Arxivlangan', color: 'from-slate-500 to-gray-600' }
];

const DURATION_OPTIONS = [
  { value: '1', label: '1 oy' },
  { value: '2', label: '2 oy' },
  { value: '3', label: '3 oy' },
  { value: '4', label: '4 oy' },
  { value: '6', label: '6 oy' },
  { value: '12', label: '1 yil' }
];

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');

  const initialForm = {
    title: '',
    description: '',
    price: '',
    duration: '3',
    status: 'draft',
    level: 'beginner'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCourses();
      // API javobini moslashtirish
      setCourses(Array.isArray(data) ? data : data.courses || []);
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

  const handleOpenEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      price: course.price || '',
      duration: course.duration?.toString() || '3',
      status: course.status || 'draft',
      level: course.level || 'beginner'
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
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      status: formData.status,
      level: formData.level
    };

    if (cleanData.price < 0) {
      setError('Narx 0 dan katta bo\'lishi kerak');
      setModalLoading(false);
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await apiService.updateCourse(selectedCourse.id, cleanData);
        setSuccess('Kurs muvaffaqiyatli yangilandi');
      } else {
        response = await apiService.createCourse(cleanData);
        setSuccess('Yangi kurs muvaffaqiyatli yaratildi');
      }
      if (response) {

        const updatedCourse = response.course || response;
        if (updatedCourse) {
          if (isEditing) {
            setCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
          } else {
            setCourses([updatedCourse, ...courses]);
          }
        }
      }

      setIsModalOpen(false);
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
        const response = await apiService.deleteCourse(id);
        setSuccess(response.message || 'Kurs muvaffaqiyatli o\'chirildi');
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) {
        setError(err.message || 'O\'chirishda xatolik yuz berdi');
      }
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesDuration = filterDuration === 'all' || c.duration?.toString() === filterDuration;

    return matchesSearch && matchesStatus && matchesDuration;
  });

  const getStatusInfo = (status) => COURSE_STATUS.find(s => s.value === status) || COURSE_STATUS[0];

  const getDurationLabel = (duration) => {
    const option = DURATION_OPTIONS.find(o => o.value === duration?.toString());
    return option ? option.label : `${duration} oy`;
  };

  const getCourseLevel = (level) => {
    const levels = {
      beginner: 'Boshlang\'ich',
      intermediate: 'O\'rta',
      advanced: 'Yuqori'
    };
    return levels[level] || level;
  };

  const calculateTotalCourses = () => courses.length;
  const calculateActiveCourses = () => courses.filter(c => c.status === 'active').length;
  const calculateTotalRevenue = () => {
    const total = courses.reduce((sum, course) => sum + (course.price || 0), 0);
    return total;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg shadow-blue-200">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kurslar</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">O'quv dasturlari boshqaruvi</p>
              </div>
            </div>

            {user?.role === 'admin' && (
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
                  <Plus size={18} /> Kurs qo'shish
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          {user?.role === 'admin' && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                <Filter size={16} className="text-slate-500" />
                <select
                  className="bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">Barcha holatlar</option>
                  {COURSE_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                <Clock size={16} className="text-slate-500" />
                <select
                  className="bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                  value={filterDuration}
                  onChange={e => setFilterDuration(e.target.value)}
                >
                  <option value="all">Barcha davomiyliklar</option>
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Jami: {filteredCourses.length}</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600">Faol: {courses.filter(c => c.status === 'active').length}</span>
              </div>
            </div>
          )}
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

        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span className="text-xs">+{Math.floor(Math.random() * 10) + 5}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{calculateTotalCourses()}</div>
              <p className="text-blue-100 text-sm">Jami kurslar</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span className="text-xs">+{Math.floor(Math.random() * 10) + 5}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{calculateActiveCourses()}</div>
              <p className="text-emerald-100 text-sm">Faol kurslar</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span className="text-xs">+{Math.floor(Math.random() * 10) + 5}%</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{new Intl.NumberFormat('uz-UZ').format(calculateTotalRevenue())}</div>
              <p className="text-purple-100 text-sm">O'rtacha narx (so'm)</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Kurslar topilmadi</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchQuery || filterStatus !== 'all' || filterDuration !== 'all'
                ? "Qidiruv shartlarini o'zgartirib ko'ring"
                : "Hali kurslar yaratilmagan"}
            </p>
            {searchQuery || filterStatus !== 'all' || filterDuration !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterDuration('all');
                }}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium"
              >
                Filterlarni tozalash
              </button>
            ) : user?.role === 'admin' ? (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Birinchi kursni yaratish
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const statusInfo = getStatusInfo(course.status);
              return (
                <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">
                      {course.title?.[0] || 'K'}
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditModal(course)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(course.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{course.description}</p>

                  <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <DollarSign size={16} className="text-slate-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('uz-UZ').format(course.price || 0)} so'm
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <Clock size={16} className="text-slate-400" />
                      <span>{getDurationLabel(course.duration)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <Target size={16} className="text-slate-400" />
                      <span>{getCourseLevel(course.level)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-xs">
                        {course.createdAt && new Date(course.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusInfo.color} text-white`}>
                      {statusInfo.label}
                    </span>
                    {course.status === 'active' && (
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        <Star size={14} fill="currentColor" />
                        <span>Mashhur</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEditing ? "Kursni tahrirlash" : "Yangi Kurs"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isEditing ? "Mavjud ma'lumotlarni yangilang" : "Barcha maydonlarni to'ldiring"}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Kurs nomi
                  </label>
                  <input
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Masalan: Frontend Development"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Tavsif
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Kurs haqida to'liq tavsif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Narx (so'm)
                  </label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="number"
                      min="0"
                      step="1000"
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Davomiylik
                  </label>
                  <div className="relative">
                    <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                    >
                      {DURATION_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Daraja
                  </label>
                  <div className="relative">
                    <Target size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                      value={formData.level}
                      onChange={e => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="beginner">Boshlang'ich</option>
                      <option value="intermediate">O'rta</option>
                      <option value="advanced">Yuqori</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Holat
                  </label>
                  <div className="flex gap-2">
                    {COURSE_STATUS.slice(0, 3).map(status => (
                      <label key={status.value} className="flex-1 flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={formData.status === status.value}
                          onChange={e => setFormData({...formData, status: e.target.value})}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={modalLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg mt-8 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {modalLoading ? (
                  <RefreshCw className="animate-spin" size={24} />
                ) : (
                  <Save size={24} />
                )}
                {isEditing ? "O'ZGARISHLARNI SAQLASH" : "KURS YARATISH"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
