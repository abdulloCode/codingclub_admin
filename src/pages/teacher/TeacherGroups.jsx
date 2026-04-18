import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import ImageLoader from '../../components/ImageLoader';
import {
  Users, BookOpen, Clock, Calendar, Plus, ChevronRight,
  RotateCw, Layers, CheckCircle, AlertCircle, Search
} from 'lucide-react';

export default function TeacherGroups() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);

  const BRAND = '#6366f1';
  const D = isDarkMode;

  const bg = D ? '#000000' : '#f5f5f7';
  const card = D ? '#1c1c1e' : '#ffffff';
  const bord = D ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const tx = D ? '#f5f5f7' : '#1d1d1f';
  const mu = D ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.6)';

  const loadGroups = async () => {
  try {
    // Token dan userId olish
    const token = localStorage.getItem('accessToken');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;
    console.log("🆔 userId:", userId);

    // Barcha teacherlardan o'zimiznikini topish
    const allTeachers = await apiService.getTeachers();
    const arr = Array.isArray(allTeachers) 
      ? allTeachers 
      : allTeachers?.teachers || allTeachers?.data || [];
    
    const me = arr.find(t => t.userId === userId);
    console.log("👤 My teacher profile:", me);
    
    if (!me) { setGroups([]); return; }
    
    const d = await apiService.getTeacherGroups(me.id);
    const g = Array.isArray(d) ? d : d?.groups || d?.data || [];
    setGroups(g);
    console.log("✅ Groups:", g.length);
  } catch (err) {
    console.error("❌ Error:", err);
    setGroups([]);
  }
};
  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = groups.filter(group =>
    (group.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (group.courseTitle || group.course?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFF] to-[#F0F4FF]">
        <div className="text-center">
          <ImageLoader size={60} />
          <p className="mt-4 text-sm font-semibold text-slate-600">Guruhlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${D ? 'text-white' : 'text-gray-900'}`}>
            Guruhlarim
          </h1>
          <p className={`text-lg ${D ? 'text-gray-400' : 'text-gray-600'}`}>
            Mening tayinlangan guruhlarim
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${D ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Guruh yoki kurs nomini qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              D
                ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-500'
                : 'bg-white text-gray-900 border-gray-200 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Jami guruhlar', value: groups.length, icon: Layers, color: 'text-indigo-500' },
            { label: 'Faol guruhlar', value: groups.filter(g => g.status === 'active').length, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Nofaol guruhlar', value: groups.filter(g => g.status === 'inactive').length, icon: AlertCircle, color: 'text-red-500' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border ${D ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={24} className={stat.color} />
                  <span className={`text-3xl font-bold ${D ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </span>
                </div>
                <p className={`text-sm font-medium ${D ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className={`text-center py-20 ${D ? 'text-gray-400' : 'text-gray-500'}`}>
            <Layers size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Guruhlar topilmadi</h3>
            <p className="text-sm">
              {search ? 'Qidiruv bo\'yicha natija yo\'q' : 'Sizda hali guruhlar yo\'q'}
            </p>
            <button
              onClick={loadGroups}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <RotateCw size={18} className="inline mr-2" />
              Qayta yuklash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const currentStudents = group.currentStudents || 0;
              const maxStudents = group.maxStudents || 20;
              const studentsCount = group.students?.length || currentStudents;
              const spotsLeft = maxStudents - studentsCount;
              const isFull = spotsLeft <= 0;

              return (
                <div
                  key={group.id}
                  className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    D ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                      {group.name?.substring(0, 2)?.toUpperCase() || 'GR'}
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {group.status === 'active' ? 'FAOL' : 'NOFAOL'}
                    </span>
                  </div>

                  <h3 className={`font-bold text-lg mb-3 ${D ? 'text-white' : 'text-gray-900'}`}>
                    {group.name}
                  </h3>

                  <div className="space-y-3 text-sm">
                    {/* Kurs */}
                    <div className={`flex items-center gap-2 ${D ? 'text-gray-400' : 'text-gray-600'}`}>
                      <BookOpen size={16} className="text-indigo-500" />
                      <span className="font-medium">{group.courseTitle || group.course?.title || 'Kurs'}</span>
                    </div>

                    {/* O'quvchilar */}
                    <div className={`flex items-center gap-2 ${D ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Users size={16} className="text-emerald-500" />
                      <span className="font-medium">
                        {studentsCount}/{maxStudents} o'quvchi
                        {isFull && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                            TO'LIQ
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Vaqt (agar mavjud bo'lsa) */}
                    {group.timeSlot && (
                      <div className={`flex items-center gap-2 ${D ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={16} className="text-blue-500" />
                        <span className="font-medium">{group.timeSlot}</span>
                      </div>
                    )}

                    {/* Sana (agar mavjud bo'lsa) */}
                    {group.startDate && (
                      <div className={`flex items-center gap-2 ${D ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Calendar size={16} className="text-purple-500" />
                        <span className="font-medium">
                          {new Date(group.startDate).toLocaleDateString('uz-UZ')}
                          {group.endDate && ` - ${new Date(group.endDate).toLocaleDateString('uz-UZ')}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar for students */}
                  {maxStudents > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between mb-2 text-xs">
                        <span className={D ? 'text-gray-500' : 'text-gray-500'}>
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
                      <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedGroup(group)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Batafsil
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowAttendance(true);
                      }}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Davomat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}