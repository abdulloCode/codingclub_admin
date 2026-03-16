import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SmallImageLoader } from "../components/ImageLoader";
import { GraduationCap, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight, User, Mail, Briefcase, Shield, CheckCircle } from "lucide-react";

const IT_SPECIALIZATIONS = [
  "Frontend Developer (React/Next.js)",
  "Backend Developer (Node.js/Go/Python)",
  "Full-stack Web Developer",
  "Mobile App Developer (Flutter/RN)",
  "UI/UX Designer",
  "Cyber Security Specialist",
  "Data Scientist / AI Engineer",
  "DevOps Engineer",
];

const QUALIFICATIONS = [
  "Oliy ma'lumotli",
  "Magistr",
  "PhD",
  "Bakalavr",
  "O'rta maxsus"
];

export default function TeacherRegister() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: IT_SPECIALIZATIONS[0],
    qualification: QUALIFICATIONS[0],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const { register, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "teacher") navigate("/teachers");
      else navigate("/admin-panel");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      console.log("Teacher register form data:", formData);
      const response = await register(formData.name, formData.phone, formData.password);
      console.log("Teacher register response:", response);
      setSuccess("Ro'yxatdan o'tdingiz! Tizimga kiring.");
      setTimeout(() => {
        navigate("/teacher-login");
      }, 2000);
    } catch (err) {
      console.error("Teacher register error:", err);
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const inputWrapClass = (name) => {
    const isFoc = focused === name;
    const base = `input-wrap flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${isFoc ? "is-focused" : ""}`;
    const style = isFoc
      ? isDarkMode
        ? "bg-white/[0.07] border-emerald-500/70 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
        : "bg-white border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
      : isDarkMode
        ? "bg-white/[0.03] border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.05]"
        : "bg-gray-50/80 border-gray-200 hover:border-emerald-500/40 hover:bg-white";
    return `${base} ${style}`;
  };

  const iconClass = (name) =>
    `flex-shrink-0 transition-colors duration-150 ${
      focused === name ? 'text-emerald-500' : isDarkMode ? 'text-white/25' : 'text-gray-300'
    }`;

  const inputClass = `input-field flex-1 bg-transparent text-sm ${
    isDarkMode ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-300'
  }`;

  const labelClass = `field-label block mb-2 ${isDarkMode ? 'text-white/30' : 'text-emerald-500/55'}`;

  const G = "#10b981";
  const GL = "#34d399";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');
        .reg-root * { font-family:'Geist',system-ui,sans-serif; }

        .grid-bg      { background-image:linear-gradient(rgba(16,185,129,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.04) 1px,transparent 1px); background-size:40px 40px; }
        .grid-bg-dark { background-image:linear-gradient(rgba(16,185,129,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.07) 1px,transparent 1px); background-size:40px 40px; }
        .glow-orb { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none; }
        .noise-overlay { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E"); opacity:0.025;pointer-events:none; }

        .input-field { transition:all 0.18s ease;letter-spacing:0.01em; }
        .input-field:focus { outline:none; }
        .input-wrap { position:relative;transition:all 0.22s cubic-bezier(0.4,0,0.2,1); }
        .input-wrap::after { content:'';position:absolute;inset:-1px;border-radius:13px;opacity:0;transition:opacity 0.25s ease;pointer-events:none;background:linear-gradient(135deg,rgba(16,185,129,0.55),rgba(52,211,153,0.35));z-index:-1;filter:blur(8px); }
        .input-wrap.is-focused::after { opacity:1; }
        .input-wrap:hover { transform:translateY(-1px); }
        .input-wrap.is-focused { transform:translateY(-1px); }

        .btn-submit { position:relative;overflow:hidden;transition:all 0.22s cubic-bezier(0.4,0,0.2,1);letter-spacing:0.025em; }
        .btn-submit::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 60%);opacity:0;transition:opacity 0.22s; }
        .btn-glow { position:absolute;inset:-3px;border-radius:15px;background:linear-gradient(135deg,#10b981,#34d399,#059669);opacity:0;z-index:-1;filter:blur(12px);transition:opacity 0.3s ease; }
        .btn-submit:hover .btn-glow { opacity:0.75; }
        .btn-submit:hover::before { opacity:1; }
        .btn-submit:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(16,185,129,0.5) !important; }
        .btn-submit:active { transform:scale(0.972) translateY(0); }
        .btn-submit .arrow-icon { transition:transform 0.2s ease; }
        .btn-submit:hover .arrow-icon { transform:translateX(4px); }

        .reg-card { position:relative;transition:box-shadow 0.35s ease,transform 0.35s ease; }
        .reg-card::before { content:'';position:absolute;inset:0;border-radius:17px;background:linear-gradient(135deg,rgba(16,185,129,0.18) 0%,rgba(52,211,153,0.08) 50%,transparent 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:1px;pointer-events:none;opacity:0;transition:opacity 0.4s ease; }
        .reg-card:hover::before { opacity:1; }
        .reg-card:hover { transform:translateY(-3px); }

        .card-enter { animation:cardEnter 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes cardEnter { from { opacity:0;transform:translateY(28px) scale(0.97); } to { opacity:1;transform:translateY(0) scale(1); } }
        .logo-enter { animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .header-enter{ animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.10s both; }
        .f-enter-1   { animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.16s both; }
        .f-enter-2   { animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .f-enter-3   { animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
        .f-enter-4   { animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.34s both; }
        .btn-enter   { animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.40s both; }
        .footer-enter{ animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.46s both; }
        @keyframes fadeUp { from { opacity:0;transform:translateY(14px); } to { opacity:1;transform:translateY(0); } }

        .field-label { font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase; }
        .divider-line { flex:1;height:1px; }

        .strength-bar { height:3px;border-radius:3px;transition:all 0.3s ease; }
      `}</style>

      <div className={`reg-root min-h-screen relative overflow-hidden flex ${isDarkMode ? 'bg-[#070d07]' : 'bg-[#f3f7f3]'}`}>
        <div className="absolute inset-0 noise-overlay z-0" />
        <div className={`absolute inset-0 z-0 ${isDarkMode ? 'grid-bg-dark' : 'grid-bg'}`} />
        <div className="glow-orb z-0" style={{ width:700, height:700, top:-150, left:-150,
          background: isDarkMode
            ? 'radial-gradient(circle,rgba(16,185,129,0.20) 0%,transparent 70%)'
            : 'radial-gradient(circle,rgba(16,185,129,0.10) 0%,transparent 70%)'
        }} />
        <div className="glow-orb z-0" style={{ width:500, height:500, bottom:-100, right:-60,
          background: isDarkMode
            ? 'radial-gradient(circle,rgba(16,185,129,0.14) 0%,transparent 70%)'
            : 'radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)'
        }} />

        {/* ══ LEFT PANEL ══ */}
        <div className={`hidden lg:flex flex-col justify-between w-[46%] p-14 relative z-10 border-r ${isDarkMode ? 'border-white/[0.05]' : 'border-emerald-500/10'}`}>

          {/* Logo */}
          <div className="logo-enter flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-white/10 shadow-white/5' : 'bg-white shadow-black/10'}`}>
              <img src={icon} alt="logo" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className={`text-sm font-bold tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Codingclub</p>
              <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>O'quv Markazi</p>
            </div>
          </div>

          <div>
            <div className={`logo-enter inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-10 border ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
              O'qituvchi Ro'yxat
            </div>

            <h2 className={`logo-enter text-[38px] font-bold leading-[1.15] tracking-tight mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              O'qituvchi<br />
              <span className={`font-light ${isDarkMode ? 'text-white/30' : 'text-gray-300'}`}>
                sifatida qo'shiling
              </span>
            </h2>

            <p className={`logo-enter text-sm leading-relaxed mb-10 max-w-[280px] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
              Mutaxassisligingiz va tajribangiz bilan o'quvchilarga bilim bering.
            </p>

            <div className="logo-enter">
              {[
                { title: 'Oson ro\'yxatdan o\'tish',   desc: 'Bir necha daqiqada hisob yarating' },
                { title: 'Mutaxassislik tanlash',    desc: 'IT sohasidagi yo\'nalishingiz' },
                { title: 'Guruhlarni boshqarish',desc: 'Dars jadvali va o\'quvchilar' },
              ].map((f, i) => (
                <div key={i} className={`flex items-start gap-12 pb-4 pt-4 ${i < 2 ? 'border-b' : ''} ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:isDarkMode?'rgba(16,185,129,0.2)':'rgba(16,185,129,0.15)' }}>
                    <span className="text-sm font-bold" style={{ color:G }}>{i + 1}</span>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>{f.title}</p>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="logo-enter">
            <div className="flex gap-8 mb-8">
              {[{ value: '150+', label: "O'qituvchilar" }, { value: '48', label: 'Guruhlar' }, { value: '95%', label: 'Muvaffaqiyat' }].map(s => (
                <div key={s.label}>
                  <p className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{s.label}</p>
                </div>
              ))}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-white/15' : 'text-gray-300'}`}>
              © 2024 Codingclub. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-[440px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10 logo-enter">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                <img src={icon} alt="logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Codingclub</p>
                <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>O'quv Markazi Boshqaruv Tizimi</p>
              </div>
            </div>

            {/* Card */}
            <div className={`reg-card card-enter rounded-2xl p-8 border ${
              isDarkMode
                ? 'bg-white/[0.03] border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)]'
                : 'bg-white border-black/[0.06] shadow-[0_8px_48px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,1)]'
            }`}>

              {/* Header */}
              <div className="header-enter mb-7">
                <div className="flex items-center justify-between mb-1">
                  <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Ro'yxatdan o'tish
                  </h1>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
                    O'qituvchi
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-white/35' : 'text-gray-400'}`}>
                  Mutaxassislik va tajribangizni qo'shing
                </p>
              </div>

              {/* Success */}
              {success && (
                <div className={`mb-5 flex items-start gap-3 p-3.5 rounded-xl text-sm border ${
                  isDarkMode ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className={`mb-5 flex items-start gap-3 p-3.5 rounded-xl text-sm border ${
                  isDarkMode ? 'bg-red-500/8 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div className="f-enter-1">
                  <label className={labelClass}>To'liq ism</label>
                  <div className={inputWrapClass('name')}>
                    <User size={14} className={iconClass('name')} />
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused('')}
                      placeholder="Ism Familiya"
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="f-enter-2">
                  <label className={labelClass}>Email</label>
                  <div className={inputWrapClass('email')}>
                    <Mail size={14} className={iconClass('email')} />
                    <input
                      type="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      placeholder="ustoz@email.com"
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="f-enter-3">
                  <label className={labelClass}>Telefon raqami</label>
                  <div className={inputWrapClass('phone')}>
                    <Phone size={14} className={iconClass('phone')} />
                    <input
                      type="tel" required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused('')}
                      placeholder="+998 90 000 00 00"
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="f-enter-4">
                  <label className={labelClass}>Parol</label>
                  <div className={inputWrapClass('password')}>
                    <Lock size={14} className={iconClass('password')} />
                    <input
                      type={showPassword ? 'text' : 'password'} required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                      placeholder="Kamida 8 ta belgi"
                      autoComplete="new-password"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`flex-shrink-0 transition-colors ${isDarkMode ? 'text-white/25 hover:text-white/55' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => {
                          const len = formData.password.length;
                          const strength = len >= 12 ? 4 : len >= 8 ? 3 : len >= 5 ? 2 : 1;
                          const colors = ['bg-red-400','bg-orange-400','bg-yellow-400','bg-emerald-400'];
                          return (
                            <div
                              key={i}
                              className={`strength-bar flex-1 ${i <= strength ? colors[strength-1] : isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}
                            />
                          );
                        })}
                      </div>
                      <p className={`text-[10px] ${isDarkMode ? 'text-white/25' : 'text-gray-400'}`}>
                        {formData.password.length < 5 ? "Juda qisqa" :
                         formData.password.length < 8 ? "O'rtacha" :
                         formData.password.length < 12 ? "Yaxshi" : "Kuchli parol ✓"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Specialization */}
                <div className="f-enter-4">
                  <label className={labelClass}>Mutaxassislik</label>
                  <div className={inputWrapClass('specialization')}>
                    <Briefcase size={14} className={iconClass('specialization')} />
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      onFocus={() => setFocused('specialization')}
                      onBlur={() => setFocused('')}
                      className={inputClass}
                      style={{ appearance: 'none' }}
                    >
                      {IT_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Qualification */}
                <div className="f-enter-4">
                  <label className={labelClass}>Malaka</label>
                  <div className={inputWrapClass('qualification')}>
                    <Shield size={14} className={iconClass('qualification')} />
                    <select
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      onFocus={() => setFocused('qualification')}
                      onBlur={() => setFocused('')}
                      className={inputClass}
                      style={{ appearance: 'none' }}
                    >
                      {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="f-enter-4 flex items-start gap-2.5 pt-0.5">
                  <input
                    type="checkbox" id="terms" required
                    className="w-4 h-4 mt-0.5 rounded accent-emerald-500 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="terms" className={`text-xs cursor-pointer leading-relaxed ${isDarkMode ? 'text-white/35' : 'text-gray-400'}`}>
                    Men{' '}
                    <a href="#" className={`font-medium underline underline-offset-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>
                      foydalanish shartlari
                    </a>
                    {' '}va{' '}
                    <a href="#" className={`font-medium underline underline-offset-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>
                      maxfiylik siyosati
                    </a>
                    {' '}ga roziman
                  </label>
                </div>

                {/* Submit */}
                <div className="btn-enter pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-submit w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.25),0 6px 20px rgba(16,185,129,0.35),inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  >
                    <div className="btn-glow" />
                    {isLoading ? (
                      <>
                        <SmallImageLoader size={16} />
                        <span>Ro'yxatdan o'tilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <span>Akkaunt yaratish</span>
                        <ArrowRight size={15} className="arrow-icon" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="footer-enter flex items-center gap-4 my-5">
                <div className={`divider-line ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>yoki</span>
                <div className={`divider-line ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
              </div>

              <p className={`footer-enter text-center text-sm ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                Allaqachon akkauntingiz bormi?{' '}
                <a href="/teacher-login" className={`font-semibold transition-colors ${
                  isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-500 hover:text-emerald-600'
                }`}>
                  Tizimga kirish
                </a>
              </p>
            </div>

            <p className="footer-enter text-center text-xs mt-5" style={{ color:isDarkMode?"rgba(255,255,255,0.15)":"#d1d5db" }}>
              Tizimga kirib, siz{" "}
              <a href="#" style={{ textDecoration:"underline", textUnderlineOffset:3, color:"inherit" }}>foydalanish shartlari</a>
              {" "}ga rozilik bildirasiz.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}