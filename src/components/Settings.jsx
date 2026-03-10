import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, LogOut, Edit2, Save, X, User, Phone, Mail, Lock, ShieldCheck, Calendar } from 'lucide-react';

const roleColors = {
  admin: 'from-violet-600 to-indigo-600',
  teacher: 'from-blue-600 to-cyan-500',
  student: 'from-emerald-600 to-teal-500',
};

const roleNames = {
  admin: 'Admin',
  teacher: "O'qituvchi",
  student: 'Talaba',
};

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  // Sync form with user data only when not editing or when user data initially loads
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user, isEditing]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const updateData = {};
      // Only send fields that have actually changed
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.phone !== user?.phone) updateData.phone = formData.phone;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.password.length > 0) {
        if (formData.password.length < 6) throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
        updateData.password = formData.password;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setSuccess("Ma'lumotlar muvaffaqiyatli yangilandi!");
        setIsEditing(false);
        // Clear password field specifically
        setFormData(prev => ({ ...prev, password: '' }));
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yangilashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
      logout();
      window.location.href = '/login';
    }
  };

  if (!user) return null;

  const roleGradient = roleColors[user.role] || 'from-gray-500 to-gray-600';

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${roleGradient} p-1 rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-xl shadow-indigo-500/20`}>
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[22px] flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <span className={`text-3xl font-bold bg-gradient-to-br ${roleGradient} bg-clip-text text-transparent`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition-transform">
                <Camera size={18} className="text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${roleGradient}`}>
                  {roleNames[user.role]}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                   <Phone size={14} /> {user.phone}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut size={18} /> Chiqish
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Profil holati</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Xavfsizlik</p>
                      <p className="text-sm font-medium dark:text-gray-200">Himoyalangan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">A'zolik sanasi</p>
                      <p className="text-sm font-medium dark:text-gray-200">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Aniqlanmagan'}
                      </p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Shaxsiy ma'lumotlar</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-lg transition-colors ${isEditing ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                >
                  {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm border border-emerald-100 dark:border-emerald-800">{success}</div>}
                {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm border border-red-100 dark:border-red-800">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">To'liq ism</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all disabled:opacity-70"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all disabled:opacity-70"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email manzili</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all disabled:opacity-70"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-indigo-500 uppercase ml-1">Yangi parol (ixtiyoriy)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    Saqlash
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}