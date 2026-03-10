import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Layers, Plus, Search, Edit2, Trash2,
  Users, User, Clock, Calendar, BookOpen,
  X, Save, Filter, ChevronDown, CheckCircle,
  XCircle, UserPlus, UserMinus, RefreshCw,
  GraduationCap, MapPin, Building2,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const GROUP_STATUS = [
  { value: 'active', label: 'Faol', color: 'from-emerald-500 to-green-600' },
  { value: 'completed', label: 'Tugallangan', color: 'from-blue-500 to-indigo-600' },
  { value: 'cancelled', label: 'Bekor qilingan', color: 'from-red-500 to-rose-600' }
];

// ✅ FIX 2: CalendarDateRange komponenti yaratildi
function CalendarDateRange({ startDate, endDate, onChange, onClose, isOpen }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    startDate ? new Date(startDate) : today
  );

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

  const handleDayClick = (day) => {
    const clicked = new Date(year, month, day);
    const clickedStr = clicked.toISOString().split('T')[0];

    if (!startDate || (startDate && endDate)) {
      // Boshlanish sanasini tanlash
      onChange('startDate', clickedStr);
      onChange('endDate', '');
    } else {
      // Tugash sanasini tanlash
      const start = new Date(startDate);
      if (clicked >= start) {
        onChange('endDate', clickedStr);
      } else {
        // Agar tanlangan kun boshlanishdan oldin bo'lsa, qayta boshlash
        onChange('startDate', clickedStr);
        onChange('endDate', '');
      }
    }
  };

  const isSelected = (day) => {
    const d = new Date(year, month, day).toISOString().split('T')[0];
    return d === startDate || d === endDate;
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day);
    return d > new Date(startDate) && d < new Date(endDate);
  };

  const isStart = (day) => {
    return new Date(year, month, day).toISOString().split('T')[0] === startDate;
  };

  const isEnd = (day) => {
    return new Date(year, month, day).toISOString().split('T')[0] === endDate;
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const blanks = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
          {!startDate || (startDate && endDate)
            ? '📅 Boshlanish sanasini tanlang'
            : '📅 Tugash sanasini tanlang'}
        </p>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_, i) => <div key={`b-${i}`} />)}
          {days.map(day => {
            const inRange = isInRange(day);
            const start = isStart(day);
            const end = isEnd(day);
            const selected = isSelected(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  h-9 w-full text-sm font-medium rounded-lg transition-all
                  ${selected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : inRange
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Selected range display */}
        {(startDate || endDate) && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Boshlanish:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {startDate ? new Date(startDate).toLocaleDateString('uz-UZ') : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tugash:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {endDate ? new Date(endDate).toLocaleDateString('uz-UZ') : '—'}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              onChange('startDate', '');
              onChange('endDate', '');
            }}
            className="flex-1 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Tozalash
          </button>
          <button
            onClick={onClose}
            disabled={!startDate || !endDate}
            className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState(null);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const initialForm = {
    name: '',
    courseId: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    maxStudents: 20,
    status: 'active',
    description: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [switchingStudents, setSwitchingStudents] = useState({});

  // ✅ FIX 4: handleSetDefaultStudent student cardiga ulandi (Students modal ichida ishlatiladi)
  const handleSetDefaultStudent = async (studentId, groupId) => {
    setSwitchingStudents(prev => ({ ...prev, [studentId]: true }));
    try {
      await apiService.setDefaultStudent(groupId, studentId, true);
      setSuccess("O'quvchi default guruh sifati o'zgartildi");
      fetchData();
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSwitchingStudents(prev => ({ ...prev, [studentId]: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let groupsData;
      if (user?.role === 'teacher') {
        groupsData = await apiService.getMyGroups();
      } else if (user?.role === 'student') {
        const myGroup = await apiService.getMyGroup();
        groupsData = myGroup ? [myGroup] : [];
      } else {
        groupsData = await apiService.getGroups();
      }

      const [coursesData, teachersData, studentsData] = await Promise.all([
        apiService.getCourses(),
        apiService.getTeachers(),
        apiService.getStudents()
      ]);

      setGroups(Array.isArray(groupsData) ? groupsData : groupsData.groups || []);
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData.courses || []);
      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.teachers || []);
      setStudents(Array.isArray(studentsData) ? studentsData : studentsData.students || []);
    } catch (err) {
      setError(err.message || "Ma'lumotlarni yuklashda xatolik");
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

  const handleOpenEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name || '',
      courseId: group.courseId || '',
      teacherId: group.teacherId || '',
      startDate: group.startDate ? new Date(group.startDate).toISOString().split('T')[0] : '',
      endDate: group.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '',
      maxStudents: group.maxStudents || 20,
      status: group.status || 'active',
      description: group.description || ''
    });
    setIsEditing(true);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenStudentsModal = (group) => {
    setSelectedGroupForStudents(group);
    setIsStudentsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Guruh nomini kiritish shart');
      setModalLoading(false);
      return;
    }
    if (!formData.courseId) {
      setError('Kursni tanlash shart');
      setModalLoading(false);
      return;
    }
    if (!formData.teacherId) {
      setError("O'qituvchini tanlash shart");
      setModalLoading(false);
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Boshlanish va tugash vaqtini kiritish shart');
      setModalLoading(false);
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      setError("Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak");
      setModalLoading(false);
      return;
    }

    const cleanData = {
      name: formData.name.trim(),
      courseId: formData.courseId,
      teacherId: formData.teacherId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      maxStudents: parseInt(formData.maxStudents) || 20,
      status: formData.status,
      description: formData.description.trim() || ''
    };

    try {
      let response;
      if (isEditing) {
        response = await apiService.updateGroup(selectedGroup.id, cleanData);
        setSuccess('Guruh muvaffaqiyatli yangilandi');
      } else {
        response = await apiService.createGroup(cleanData);
        setSuccess('Yangi guruh muvaffaqiyatli yaratildi');
      }

      if (response) {
        const updatedGroup = response.group || response;
        if (isEditing) {
          setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g));
        } else {
          setGroups([updatedGroup, ...groups]);
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatdan ham o'chirmoqchimisiz?")) {
      try {
        const response = await apiService.deleteGroup(id);
        setSuccess(response.message || "Guruh muvaffaqiyatli o'chirildi");
        setGroups(groups.filter(g => g.id !== id));
      } catch (err) {
        setError(err.message || "O'chirishda xatolik yuz berdi");
      }
    }
  };

  const handleAddStudentToGroup = async (studentId) => {
    try {
      const response = await apiService.addStudentToGroup(selectedGroupForStudents.id, studentId);
      setSuccess("O'quvchi guruhga muvaffaqiyatli qo'shildi");
      if (response.student) {
        setStudents(students.map(s => s.id === studentId ? { ...s, ...response.student } : s));
      }
      if (response.group) {
        setGroups(groups.map(g => g.id === response.group.id ? { ...g, ...response.group } : g));
        setSelectedGroupForStudents({ ...selectedGroupForStudents, ...response.group });
      }
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleRemoveStudentFromGroup = async (studentId) => {
    try {
      const response = await apiService.removeStudentFromGroup(selectedGroupForStudents.id, studentId);
      setSuccess("O'quvchi guruhdan muvaffaqiyatli olib tashlandi");
      if (response.student) {
        setStudents(students.map(s => s.id === studentId ? { ...s, ...response.student } : s));
      }
      if (response.group) {
        setGroups(groups.map(g => g.id === response.group.id ? { ...g, ...response.group } : g));
        setSelectedGroupForStudents({ ...selectedGroupForStudents, ...response.group });
      }
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch =
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || g.courseId === filterCourse;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusInfo = (status) => GROUP_STATUS.find(s => s.value === status) || GROUP_STATUS[0];
  const getCourseName = (courseId) => courses.find(c => c.id === courseId)?.name || courseId;
  const getTeacherName = (teacherId) => teachers.find(t => t.id === teacherId)?.user?.name || teacherId;

  // ✅ FIX 3: onChange handleri to'g'irlandi — bitta setFormData chaqiruvi
  const handleCalendarChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ FIX 1: JSX strukturasi to'g'irlandi — bitta root div
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg shadow-blue-200">
                <Layers size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guruhlar</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.role === 'admin' ? "Barcha o'quv guruhlari boshqaruvi" :
                   user?.role === 'teacher' ? 'Mening guruhlarim' :
                   'Mening guruhim'}
                </p>
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
                <button
                  onClick={handleOpenAddModal}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all font-medium text-sm"
                >
                  <Plus size={18} /> Guruh qo'shish
                </button>
              </div>
            )}
          </div>

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
                  {GROUP_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
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
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Jami: {filteredGroups.length}</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600">Faol: {groups.filter(g => g.status === 'active').length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
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
            <RefreshCw className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <Layers size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Guruhlar topilmadi</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchQuery || filterStatus !== 'all' || filterCourse !== 'all'
                ? "Qidiruv shartlarini o'zgartirib ko'ring"
                : 'Hali guruhlar yaratilmagan'}
            </p>
            {searchQuery || filterStatus !== 'all' || filterCourse !== 'all' ? (
              <button
                onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterCourse('all'); }}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium"
              >
                Filterlarni tozalash
              </button>
            ) : (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Birinchi guruhni yaratish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => {
              const statusInfo = getStatusInfo(group.status);
              return (
                <div key={group.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">
                      {group.name?.[0] || 'G'}
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditModal(group)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(group.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">{group.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{group.description}</p>

                  <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <BookOpen size={16} className="text-slate-400" />
                      <span className="truncate flex-1">{getCourseName(group.courseId)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <GraduationCap size={16} className="text-slate-400" />
                      <span className="truncate flex-1">{getTeacherName(group.teacherId)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <Users size={16} className="text-slate-400" />
                      <span>{group.currentStudents || 0}/{group.maxStudents} ta o'quvchi</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-xs">
                        {group.startDate && new Date(group.startDate).toLocaleDateString('uz-UZ')} →{' '}
                        {group.endDate && new Date(group.endDate).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusInfo.color} text-white`}>
                      {statusInfo.label}
                    </span>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleOpenStudentsModal(group)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <UserPlus size={14} />
                        O'quvchilarni boshqarish
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEditing ? 'Guruhni tahrirlash' : 'Yangi Guruh'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isEditing ? "Mavjud ma'lumotlarni yangilang" : "Barcha maydonlarni to'ldiring"}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Guruh nomi</label>
                  <input
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masalan: Frontend - 1-guruh"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Kurs</label>
                  <select
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                    value={formData.courseId}
                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">O'qituvchi</label>
                  <select
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                    value={formData.teacherId}
                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                  >
                    <option value="">O'qituvchini tanlang</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ FIX 3 & 5: Date inputlar readOnly emas, CalendarDateRange chaqiriladi */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Boshlanish vaqti</label>
                  <div className="relative">
                    <input
                      readOnly
                      className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer"
                      value={formData.startDate ? new Date(formData.startDate).toLocaleDateString('uz-UZ') : ''}
                      placeholder="Sanani tanlang"
                      onClick={() => setIsCalendarOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <Calendar size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Tugash vaqti</label>
                  <div className="relative">
                    <input
                      readOnly
                      className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer"
                      value={formData.endDate ? new Date(formData.endDate).toLocaleDateString('uz-UZ') : ''}
                      placeholder="Sanani tanlang"
                      onClick={() => setIsCalendarOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <Calendar size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Maksimal o'quvchilar soni</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    value={formData.maxStudents}
                    onChange={e => setFormData({ ...formData, maxStudents: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Holat</label>
                  <div className="flex gap-2">
                    {GROUP_STATUS.map(status => (
                      <label key={status.value} className="flex-1 flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={formData.status === status.value}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Tavsif (ixtiyoriy)</label>
                  <textarea
                    rows="2"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Guruh haqida qo'shimcha ma'lumot"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
                  <XCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg mt-8 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {modalLoading ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
                {isEditing ? "O'ZGARISHLARNI SAQLASH" : 'GURUH YARATISH'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ FIX 2 & 3: CalendarDateRange to'g'ri onChange bilan */}
      {isCalendarOpen && (
        <CalendarDateRange
          startDate={formData.startDate}
          endDate={formData.endDate}
          onChange={handleCalendarChange}
          onClose={() => setIsCalendarOpen(false)}
          isOpen={isCalendarOpen}
        />
      )}

      {/* Students Modal */}
      {isStudentsModalOpen && selectedGroupForStudents && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedGroupForStudents.name} - O'quvchilar
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">O'quvchilarni guruhga biriktirish</p>
              </div>
              <button onClick={() => setIsStudentsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserPlus size={20} className="text-blue-600" />
                  Guruhda o'quvchilar ({selectedGroupForStudents.currentStudents || 0}/{selectedGroupForStudents.maxStudents})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.filter(s => s.groupId === selectedGroupForStudents.id).map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {/* ✅ FIX 4: handleSetDefaultStudent ishlatildi */}
                        <button
                          onClick={() => handleSetDefaultStudent(student.id, selectedGroupForStudents.id)}
                          disabled={switchingStudents[student.id]}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Default guruh sifatida belgilash"
                        >
                          {switchingStudents[student.id]
                            ? <RefreshCw size={16} className="animate-spin" />
                            : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => handleRemoveStudentFromGroup(student.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {students.filter(s => s.groupId === selectedGroupForStudents.id).length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                      Hali o'quvchilar biriktirilmagan
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-slate-600" />
                  Barcha o'quvchilar ({students.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {students.filter(s => s.groupId !== selectedGroupForStudents.id).map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {student.name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{student.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{student.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStudentToGroup(student.id)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                        title="Biriktirish"
                      >
                        <UserPlus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}