import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Building2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-panel');
      } else if (user.role === 'teacher') {
        navigate('/profile');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData.name, formData.phone, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${isDarkMode ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}
    >
      <div className="absolute inset-0">
        <div
          className={`absolute top-20 left-20 w-96 h-96 ${isDarkMode ? "bg-blue-900" : "bg-blue-200"} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}
        ></div>
        <div
          className={`absolute top-40 right-20 w-96 h-96 ${isDarkMode ? "bg-indigo-900" : "bg-indigo-200"} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute bottom-20 left-1/2 w-96 h-96 ${isDarkMode ? "bg-purple-900" : "bg-purple-200"} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <Building2 size={32} className="text-white" />
          </div>
          <h1
            className={`text-3xl font-bold tracking-normal mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Codingclub
          </h1>
          <p
            className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            O'quv Markazi Boshqaruv Tizimi
          </p>
        </div>

        <div className="w-full max-w-md">
          <div
            className={`${isDarkMode ? "bg-slate-800/95 border-slate-700" : "bg-white/95 border-slate-200/50"} backdrop-blur-2xl rounded-3xl shadow-2xl border p-8`}
          >
            <div className="text-center mb-8">
              <h2
                className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Admin sifatida ro'yxatdan o'tish
              </h2>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                O'quv markazingizni boshqarishni boshlang
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div
                  className={`${isDarkMode ? "bg-red-900/30 border-red-800 text-red-300" : "bg-red-50 border-red-200 text-red-700"} border px-4 py-3 rounded-xl text-sm flex items-center gap-3`}
                >
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    To'liq ism
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm
                          ${
                            isDarkMode
                              ? "bg-slate-700/50 border-slate-600 text-white focus:bg-slate-700"
                              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                          }`}
                      placeholder="Ism Familiya"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className={`block text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Telefon raqami
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={20} className="text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm
                          ${
                            isDarkMode
                              ? "bg-slate-700/50 border-slate-600 text-white focus:bg-slate-700"
                              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                          }`}
                      placeholder="+998 90 123 45 67"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Parol
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={20} className="text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-12 pr-12 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm
                          ${
                            isDarkMode
                              ? "bg-slate-700/50 border-slate-600 text-white focus:bg-slate-700"
                              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                          }`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Ro'yxatdan o'tilmoqda...</span>
                  </>
                ) : (
                  <>
                    Ro'yxatdan o'tish
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div
              className={`mt-6 pt-6 border-t text-center ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}
            >
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Allaqachon akkauntingiz bormi?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
                >
                  Tizimga kirish
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
