import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ImageLoader, { SmallImageLoader } from '../../components/ImageLoader';
import { Calendar, User, Phone, Mail, Lock, Edit2, Save, X, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

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

export default function Profile() {
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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const updateData = {};
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.phone !== user?.phone) updateData.phone = formData.phone;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setSuccess('Ma\'lumotlar muvaffaqiyatli yangilandi!');
        setIsEditing(false);
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

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      password: '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ImageLoader size={50} text="Foydalanuvchi ma'lumotlari yuklanmoqda..." />
      </div>
    );
  }

  const roleGradient = roleColors[user.role] || 'from-slate-500 to-slate-600';
  const currentRoleName = roleNames[user.role] || 'Foydalanuvchi';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-xl">
                <div className={`w-full h-full bg-gradient-to-br ${roleGradient} rounded-xl flex items-center justify-center text-white text-3xl font-bold`}>
                  {user.name?.charAt(0).toUpperCase() || user.phone?.charAt(0) || '?'}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {user.name || 'Noma\'lum foydalanuvchi'}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r ${roleGradient} text-white`}>
                    {currentRoleName}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Phone size={16} /> {user.phone}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-3 rounded-xl transition-all ${
                  isEditing
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? <X size={20} /> : <Edit2 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Profil ma'lumotlari</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Shaxsiy ma'lumotlaringizni boshqaring</p>
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3">
                <CheckCircle size={20} className="flex-shrink-0" />
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">To'liq ism</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                        {user.name || 'Kiritilmagan'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                        {user.email || 'Kiritilmagan'}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Yangi parol (ixtiyoriy)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="O'zgartirmoqchi bo'lsangiz kiriting"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Ro'yxatdan o'tgan</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hisob holati</p>
                      <p className="font-semibold text-slate-900 dark:text-white">Tasdiqlangan</p>
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <SmallImageLoader size={20} />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Saqlash
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Bekor qilish
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}