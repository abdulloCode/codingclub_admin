import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Users, Plus, Search, Edit2, Trash2,
  Mail, Phone, RefreshCw, X, Save, Briefcase, 
  CheckCircle, XCircle, ShieldCheck
} from 'lucide-react';

const IT_SPECIALIZATIONS = [
  "Frontend Developer (React/Next.js)",
  "Backend Developer (Node.js/Go/Python)",
  "Full-stack Web Developer",
  "Mobile App Developer (Flutter/RN)",
  "UI/UX Designer",
  "Cyber Security Specialist",
  "Data Scientist / AI Engineer",
  "DevOps Engineer"
];

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: IT_SPECIALIZATIONS[0],
    qualification: 'Oliy ma\'lumotli',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeachers();
      setTeachers(Array.isArray(response) ? response : response.teachers || []);
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

  const handleOpenEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.user?.name || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      password: '', 
      specialization: teacher.specialization || IT_SPECIALIZATIONS[0],
      qualification: teacher.qualification || 'Oliy ma\'lumotli',
      status: teacher.status || 'active',
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
      phone: formData.phone.replace(/\D/g, '')
    };

    if (!cleanData.email.includes('@')) {
      setError("To'g'ri email kiriting!");
      setModalLoading(false);
      return;
    }

    try {
      if (isEditing) {
        if (!cleanData.password) delete cleanData.password;
        await apiService.updateTeacher(selectedTeacher.id, cleanData);
        setSuccess('Ma\'lumotlar muvaffaqiyatli yangilandi');
      } else {
        await apiService.createTeacher(cleanData);
        setSuccess('Yangi o\'qituvchi muvaffaqiyatli qo\'shildi');
      }
      setIsModalOpen(false);
      fetchTeachers();
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
        await apiService.deleteTeacher(id);
        setSuccess('O\'chirilishi muvaffaqiyatli yakunlandi');
        fetchTeachers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <div className="bg-white dark:bg-gray-800 border-b px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Users size={24} />
            </div>
            <h1 className="text-xl font-bold dark:text-white">O'qituvchilar</h1>
          </div>
          
          <div className="flex gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                placeholder="Qidirish..." 
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl focus:ring-2 ring-indigo-500 outline-none w-64 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700">
              <Plus size={20} /> Qo'shish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {success && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-2xl flex items-center gap-2 border border-green-200"><CheckCircle size={20}/> {success}</div>}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-2 border border-red-200"><XCircle size={20}/> {error}</div>}

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-indigo-600" size={40}/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <div key={teacher.id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-200">
                    {teacher.user?.name?.[0]}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEditModal(teacher)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(teacher.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{teacher.user?.name}</h3>
                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm mb-4">
                  <Briefcase size={16}/> {teacher.specialization}
                </div>

                <div className="space-y-3 py-4 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                    <Phone size={16} className="text-gray-400"/> {teacher.user?.phone}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                    <Mail size={16} className="text-gray-400"/> {teacher.user?.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                    <ShieldCheck size={16} className="text-gray-400"/> {teacher.qualification}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {teacher.status === 'active' ? 'FAOL' : 'NOFAOL'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono uppercase">ID: {teacher.id.slice(-8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

   
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {isEditing ? 'Tahrirlash' : 'Yangi O\'qituvchi'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Barcha maydonlarni to'ldiring</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">F.I.SH (To'liq)</label>
                  <input required className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 ring-indigo-500 transition-all outline-none text-gray-900 dark:text-white" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Manzil</label>
                  <input required type="email" placeholder="ustoz@example.com" className="w-full p-4 bg-gray-100 rounded-2xl border-none focus:ring-2 ring-indigo-500 outline-none"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefon Raqam</label>
                  <input required placeholder="998901234567" className="w-full p-4 bg-gray-100 rounded-2xl border-none focus:ring-2 ring-indigo-500 outline-none"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    {isEditing ? 'Parol (O\'zgartirish shart emas)' : 'Parol'}
                  </label>
                  <input required={!isEditing} type="password" placeholder="••••••••" className="w-full p-4 bg-gray-100 rounded-2xl border-none focus:ring-2 ring-indigo-500 outline-none"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">IT Mutaxassisligi</label>
                  <select className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 ring-indigo-500 outline-none appearance-none"
                    value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}>
                    {IT_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button 
                disabled={modalLoading} 
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg mt-10 hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {modalLoading ? <RefreshCw className="animate-spin" size={24}/> : <Save size={24}/>} 
                {isEditing ? 'OZGARISHLARNI SAQLASH' : 'RO\'YXATDAN O\'TKAZISH'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}