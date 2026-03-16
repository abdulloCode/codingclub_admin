import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import ImageLoader from '../components/ImageLoader';
import {
  BookOpen, Plus, Search, Edit3, Trash2,
  Clock, DollarSign, CheckCircle,
  X, Save, Filter, Loader2,
  Target, BarChart3, ChevronRight, AlertCircle
} from 'lucide-react';

const COURSE_STATUS = [
  { value: 'active',   label: 'Faol',        bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  { value: 'inactive', label: 'Nofaol',      bg: 'bg-amber-500/10',   text: 'text-amber-600',   dot: 'bg-amber-500' },
  { value: 'archived', label: 'Arxivlandi',  bg: 'bg-slate-500/10',   text: 'text-slate-600',   dot: 'bg-slate-500' },
];

const DURATION_OPTIONS = [
  { value: '1',  label: '1 oy'  }, { value: '3',  label: '3 oy'  },
  { value: '6',  label: '6 oy'  }, { value: '12', label: '1 yil' },
];

const LEVELS = [
  { value: 'beginner',     label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta"        },
  { value: 'advanced',     label: 'Yuqori'       },
];

const INITIAL_FORM = { title: '', description: '', price: '', duration: '3', status: 'active', level: 'beginner' };

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCourses();
      setCourses(Array.isArray(data) ? data : data?.courses ?? []);
    } catch (err) {
      showToast('error', "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiService.updateCourse(editTarget.id, formData);
        showToast('success', "Kurs yangilandi");
      } else {
        await apiService.createCourse(formData);
        showToast('success', "Kurs yaratildi");
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Professional Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-5">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-emerald-500/20 text-emerald-600' : 'bg-white dark:bg-slate-900 border-red-500/20 text-red-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800/50 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kurslar</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Akademiya Paneli</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 border border-transparent focus-within:border-indigo-500/50 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                placeholder="Qidiruv..." 
                className="bg-transparent border-none outline-none px-3 py-2.5 text-sm w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => { setFormData(INITIAL_FORM); setIsEditing(false); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10"
              >
                <Plus size={18} /> Qo'shish
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Jami Kurslar</p>
                <h3 className="text-3xl font-bold mt-1">{courses.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl"><BarChart3 size={20}/></div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Faol Kurslar</p>
                <h3 className="text-3xl font-bold mt-1 text-emerald-600">{courses.filter(c=>c.status==='active').length}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle size={20}/></div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">O'rtacha Narx</p>
                <h3 className="text-3xl font-bold mt-1 text-indigo-600">
                  {new Intl.NumberFormat('uz-UZ').format(courses.reduce((acc, c) => acc + (c.price || 0), 0) / (courses.length || 1))} 
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl"><DollarSign size={20}/></div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><ImageLoader size={50} text="Kurslar yuklanmoqda..." /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(course => {
              const status = COURSE_STATUS.find(s => s.value === course.status) || COURSE_STATUS[0];
              return (
                <div key={course.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditTarget(course); setFormData(course); setIsEditing(true); setIsModalOpen(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={16}/></button>
                          <button onClick={() => { if(confirm('Ochirish?')) apiService.deleteCourse(course.id).then(fetchCourses)}} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10">{course.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <Clock size={16} /> <span className="text-xs font-medium">Davomiyligi</span>
                        </div>
                        <span className="text-xs font-bold">{course.duration} oy</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <Target size={16} /> <span className="text-xs font-medium">Daraja</span>
                        </div>
                        <span className="text-xs font-bold uppercase">{course.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Kurs narxi</p>
                      <p className="text-lg font-black text-indigo-600">{new Intl.NumberFormat('uz-UZ').format(course.price)} <span className="text-xs font-normal text-slate-500 ml-1">UZS</span></p>
                    </div>
                    <button className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all">
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Tiniq Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-[32px] relative shadow-2xl overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-extrabold">{isEditing ? 'Tahrirlash' : 'Yangi Kurs'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kurs Nomi</label>
                <input 
                  required className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/50 transition-all"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Narxi</label>
                  <input 
                    type="number" required className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Davomiyligi</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none appearance-none"
                    value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                  >
                    {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tavsif</label>
                <textarea 
                  rows={3} className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none resize-none"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}