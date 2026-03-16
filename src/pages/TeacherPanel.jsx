import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import ImageLoader from '../components/ImageLoader';
import {
  FileText, CheckCircle, Plus, Trash2, RotateCw,
  Calendar, BookOpen, Users, Layers, Clock
} from 'lucide-react';

export default function TeacherPanel() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [groups, setGroups] = useState([]);

  // Tablar konfiguratsiyasi - faqat teacher specific
  const sectionTabs = [
    { id: 'assignments', label: 'Topshiriqlar', icon: FileText },
    { id: 'grading', label: 'Baholash', icon: CheckCircle },
    { id: 'groups', label: 'Guruhlar', icon: Layers },
  ];

  // Form state for creating homework
  const [form, setForm] = useState({
    title: '',
    description: '',
    groupId: '',
    dueDate: '',
    points: 100
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHomeworks();
      const hw = Array.isArray(data) ? data : data?.homeworks || data?.data || [];
      setAssignments(hw);
    } catch (err) {
      console.error('Yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      const data = await apiService.getHomeworkSubmissions(assignmentId);
      const subs = Array.isArray(data) ? data : data?.submissions || data?.data || [];
      setSubmissions(subs);
    } catch (err) {
      console.error('Topshiriqlarni yuklashda xatolik:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await apiService.getMyTeacherGroups();
      console.log('Teacher groups response:', data); // Debug uchun

      // Guruhlar ma'lumotlarini to'g'ri ishlash
      let grps = [];
      if (Array.isArray(data)) {
        grps = data;
      } else if (data?.groups && Array.isArray(data.groups)) {
        grps = data.groups;
      } else if (data?.data && Array.isArray(data.data)) {
        grps = data.data;
      }

      // Faqat shu o'qituvchiga tegishli guruhlarni ko'rsatish
      const teacherId = user?.id || user?.userId;
      if (teacherId) {
        grps = grps.filter(group => {
          // Guruh teacherId-si shu o'qituvchi ID-siga teng bo'lsa
          return group.teacherId === teacherId || group.teacher?.id === teacherId;
        });
      }

      console.log('Filtered teacher groups:', grps);
      setGroups(grps);
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err);
      setGroups([]); // Xatolik bo'lsa bo'sh massiv qo'yish
    }
  };

  useEffect(() => {
    loadAssignments();
    loadGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await apiService.createHomework(form);
      alert('Topshiriq muvaffaqiyatli yaratildi!');
      setShowCreateModal(false);
      setForm({
        title: '',
        description: '',
        groupId: '',
        dueDate: '',
        points: 100
      });
      loadAssignments();
    } catch (err) {
      console.error('Yaratishda xatolik:', err);
      alert('Xatolik yuz berdi!');
    } finally {
      setModalLoading(false);
    }
  };

  const gradeSubmission = async (assignmentId, submissionId, points) => {
    if (!points || points < 0 || points > 100) {
      alert('Ballni 0 dan 100 gacha kiritishingiz kerak!');
      return;
    }
    try {
      await apiService.gradeHomework(assignmentId, submissionId, parseInt(points));
      alert('Muvaffaqiyatli baholandi!');
      loadSubmissions(assignmentId);
    } catch (err) {
      console.error('Baholashda xatolik:', err);
      alert('Xatolik yuz berdi!');
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!confirm('Ushbu topshiriqni o\'chirmoqchimisiz?')) return;
    try {
      await apiService.deleteHomework(assignmentId);
      alert('Topshiriq o\'chirildi!');
      loadAssignments();
    } catch (err) {
      console.error('O\'chirishda xatolik:', err);
    }
  };

  const BRAND = '#6366f1'; // Indigo for teacher
  const D = isDarkMode;

  const bg   = D ? '#000000' : '#f5f5f7';
  const card = D ? '#1c1c1e' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const tx   = D ? '#f5f5f7' : '#1d1d1f';
  const mu   = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 p-6 font-sans`}>
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation - Faqat teacher specific */}
        <div className={`flex gap-2 p-1.5 rounded-2xl mb-6 w-fit ${isDarkMode ? 'bg-white/10' : 'bg-gray-200/60'}`}>
          {sectionTabs.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                // Baholashga o'tganda topshiriqlarni yuklash
                if (section.id === 'grading' && !selectedAssignment) {
                  setActiveSection('assignments');
                }
              }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative overflow-hidden ${
                activeSection === section.id
                  ? `bg-${BRAND === '#6366f1' ? 'indigo' : 'blue'}-600 text-white shadow-lg shadow-indigo-500/30`
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-white/10'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
              style={activeSection === section.id ? { background: BRAND, boxShadow: `0 4px 12px ${BRAND}40` } : {}}
            >
              <section.icon size={18} />
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <ImageLoader size={50} text="Ma'lumotlar yuklanmoqda..." />
          </div>
        ) : (
          <div className={`rounded-2xl p-8 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>

            {/* Assignments Section */}
            {activeSection === 'assignments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Mening Topshiriqlarim
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {assignments.length} ta topshiriq
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: BRAND, color: 'white', boxShadow: `0 2px 8px ${BRAND}40` }}
                  >
                    <Plus size={16} />
                    Yaratish
                  </button>
                </div>

                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                      isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-base mb-2 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                            isDarkMode ? 'bg-white/10' : 'bg-white border border-gray-200'
                          }`}>
                            <Calendar size={14} className="text-indigo-500" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {assignment.dueDate || 'Muddat belgilanmagan'}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                            isDarkMode ? 'bg-white/10' : 'bg-white border border-gray-200'
                          }`}>
                            <BookOpen size={14} className="text-purple-500" />
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {assignment.points || 100} ball
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            loadSubmissions(assignment.id);
                            setActiveSection('grading');
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                            isDarkMode
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                          }`}
                        >
                          Tekshirish
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className={`p-2 rounded-lg transition-all ${
                            isDarkMode
                              ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'
                          }`}
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {assignments.length === 0 && (
                  <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                      <FileText size={32} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Hozircha topshiriqlar yo'q</p>
                    <p className="text-sm">Yangi topshiriq yaratish uchun "Yaratish" tugmasini bosing</p>
                  </div>
                )}
              </div>
            )}

            {/* Grading Section */}
            {activeSection === 'grading' && selectedAssignment && (
              <div className="space-y-4">
                {/* Assignment Info */}
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAssignment.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedAssignment.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('assignments')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        isDarkMode
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                          : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span>← Ortga</span>
                      </button>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar size={14} />
                      <span>Muddat: {selectedAssignment.dueDate || 'Belgilanmagan'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <BookOpen size={14} />
                      <span>{selectedAssignment.points || 100} ball</span>
                    </div>
                  </div>
                </div>

                {/* Submissions */}
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-5 rounded-xl border transition-all duration-300 ${
                      isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {submission.studentName || 'O\'quvchi'}
                          </h5>
                          {submission.graded && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              submission.points >= 80 ? 'bg-emerald-100 text-emerald-700' :
                              submission.points >= 60 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {submission.points} ball
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Yuborilgan: {new Date(submission.submittedAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl mb-4 text-sm leading-relaxed ${
                      isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      {submission.content}
                    </div>

                    {!submission.graded && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Ball (0-100)"
                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              isDarkMode ? 'bg-gray-700 text-white border border-white/10' : 'bg-gray-50 text-gray-900 border border-gray-200'
                            }`}
                            id={`grade-${submission.id}`}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const input = document.getElementById(`grade-${submission.id}`);
                            if (input.value) {
                              gradeSubmission(selectedAssignment.id, submission.id, input.value);
                            }
                          }}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                        >
                          Baholash
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {submissions.length === 0 && (
                  <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Hali topshiriqlar yuborilmagan</p>
                    <p className="text-sm">O'quvchilar topshiriq yuborishganda bu yerda ko'rinadi</p>
                  </div>
                )}
              </div>
            )}

            {/* Groups Section */}
            {activeSection === 'groups' && (
              <div>
                <div className="mb-6">
                  <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mening Guruhlarim
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {groups.length} ta guruh
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group) => {
                    // O'quvchilar soni
                    const currentStudents = group.currentStudents || 0;
                    const maxStudents = group.maxStudents || 20;
                    const studentsCount = group.students?.length || currentStudents;
                    const spotsLeft = maxStudents - studentsCount;
                    const isFull = spotsLeft <= 0;

                    return (
                      <div
                        key={group.id}
                        className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {group.name?.substring(0, 2)?.toUpperCase() || 'GR'}
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {group.status === 'active' ? 'FAOL' : 'NOFAOL'}
                          </span>
                        </div>

                        <h4 className={`font-bold text-base mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {group.name}
                        </h4>

                        <div className="space-y-2 text-xs">
                          {/* Kurs */}
                          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <BookOpen size={14} className="text-indigo-500" />
                            <span className="font-medium">{group.courseTitle || group.course?.title || 'Kurs'}</span>
                          </div>

                          {/* O'quvchilar */}
                          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Users size={14} className="text-emerald-500" />
                            <span className="font-medium">
                              {studentsCount}/{maxStudents} o'quvchi
                              {isFull && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                                  TO'LIQ
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Vaqt (agar mavjud bo'lsa) */}
                          {group.timeSlot && (
                            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Clock size={14} className="text-blue-500" />
                              <span className="font-medium">{group.timeSlot}</span>
                            </div>
                          )}

                          {/* Sana (agar mavjud bo'lsa) */}
                          {group.startDate && (
                            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Calendar size={14} className="text-purple-500" />
                              <span className="font-medium">
                                {new Date(group.startDate).toLocaleDateString('uz-UZ')}
                                {group.endDate && ` - ${new Date(group.endDate).toLocaleDateString('uz-UZ')}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar for students */}
                        {maxStudents > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between mb-1 text-[10px]">
                              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                                Joy egalligi
                              </span>
                              <span className={`font-bold ${
                                isFull ? 'text-red-600' :
                                spotsLeft < 5 ? 'text-amber-600' :
                                'text-emerald-600'
                              }`}>
                                {Math.round((studentsCount / maxStudents) * 100)}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isFull ? 'bg-red-500' :
                                  spotsLeft < 5 ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min((studentsCount / maxStudents) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {groups.length === 0 && (
                    <div className={`col-span-full text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                        <Layers size={40} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-lg font-semibold mb-2">Sizda guruhlar yo'q</p>
                      <p className="text-sm">Admin tomonidan guruh tayinlashishi mumkin</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${
            isDarkMode ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Yangi Topshiriq Yaratish
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Topshiriq nomi
                </label>
                <input
                  required
                  placeholder="Topshiriq nomini kiriting..."
                  className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDarkMode ? 'bg-gray-700 text-white border border-white/10' : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Topshiriq tavsifi
                </label>
                <textarea
                  required
                  placeholder="Topshiriq tavsifini kiriting..."
                  className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-36 resize-none transition-all ${
                    isDarkMode ? 'bg-gray-700 text-white border border-white/10' : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Guruh
                  </label>
                  <div className="relative">
                    <Layers size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <select
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all ${
                        isDarkMode ? 'bg-gray-700 text-white border border-white/10' : 'bg-gray-50 text-gray-900 border border-gray-200'
                      }`}
                      value={form.groupId}
                      onChange={e => setForm({...form, groupId: e.target.value})}
                    >
                      <option value="">Guruhni tanlang</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.currentStudents || 0}/{g.maxStudents || 20})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Muddat
                  </label>
                  <input
                    required
                    type="date"
                    className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      isDarkMode ? 'bg-gray-700 text-white border border-white/10' : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}
                    value={form.dueDate}
                    onChange={e => setForm({...form, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ball (0-100)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Maksimum ball"
                  className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDarkMode ? 'bg-gray-700 text-white border border-white/10' : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}
                  value={form.points}
                  onChange={e => setForm({...form, points: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 py-4 font-bold rounded-xl transition-all ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  Bekor qilish
                </button>
                <button
                  disabled={modalLoading}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {modalLoading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
