import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SmallImageLoader } from "../components/ImageLoader";
import {
  Phone, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, Users, BookOpen, TrendingUp, Shield,
} from "lucide-react";
import icon from "../assets/image.png";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const { login, user } = useAuth();

  const isEmail = formData.identifier.includes("@");

  useEffect(() => {
    if (location.state?.phone && location.state?.password) {
      setFormData({ identifier: location.state.phone, password: location.state.password });
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin-panel");
      else if (user.role === "teacher") navigate("/teachers");
      else navigate("/profile");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const identifier = formData.identifier.trim().replace(/\s/g, "");

      if (!identifier) {
        setError("Telefon yoki email kiriting");
        setIsLoading(false);
        return;
      }
      if (!formData.password) {
        setError("Parolni kiriting");
        setIsLoading(false);
        return;
      }

      console.log("Login identifier:", identifier);
      await login(identifier, formData.password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Kirishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const inputWrapClass = (name) => {
    const isFoc = focused === name;
    const base = `input-wrap flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${isFoc ? "is-focused" : ""}`;
    const style = isFoc
      ? isDarkMode
        ? "bg-white/[0.07] border-[#427A43]/70 shadow-[0_0_0_3px_rgba(66,122,67,0.18)]"
        : "bg-white border-[#427A43] shadow-[0_0_0_3px_rgba(66,122,67,0.12)]"
      : isDarkMode
        ? "bg-white/[0.03] border-white/[0.08] hover:border-[#427A43]/40 hover:bg-white/[0.05]"
        : "bg-gray-50/80 border-gray-200 hover:border-[#427A43]/40 hover:bg-white";
    return `${base} ${style}`;
  };

  const stats = [
    { Icon: Users,      value: "2,400+", label: "O'quvchilar" },
    { Icon: BookOpen,   value: "48",     label: "Guruhlar"    },
    { Icon: TrendingUp, value: "99.9%",  label: "Uptime"      },
  ];

  const features = [
    { Icon: Users,      title: "O'quvchilar boshqaruvi", desc: "Ro'yxat, davomat va to'lovlarni kuzating"    },
    { Icon: BookOpen,   title: "Guruh va jadvallar",      desc: "Dars jadvali, guruh tarkibi, o'qituvchilar" },
    { Icon: TrendingUp, title: "Hisobot va statistika",   desc: "Real-vaqt ma'lumotlari va moliyaviy tahlil" },
    { Icon: Shield,     title: "Xavfsiz tizim",           desc: "Ma'lumotlaringiz to'liq himoyalangan"       },
  ];

  const G = "#427A43";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');
        .login-root * { font-family:'Geist',system-ui,sans-serif; }
        .grid-bg      { background-image:linear-gradient(rgba(66,122,67,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(66,122,67,0.05) 1px,transparent 1px); background-size:44px 44px; }
        .grid-bg-dark { background-image:linear-gradient(rgba(66,122,67,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(66,122,67,0.08) 1px,transparent 1px); background-size:44px 44px; }
        .glow-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
        .noise-overlay { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E"); opacity:0.02;pointer-events:none; }
        .input-field { transition:all 0.18s ease;letter-spacing:0.01em; }
        .input-field:focus { outline:none; }
        .input-wrap { position:relative;transition:all 0.22s cubic-bezier(0.4,0,0.2,1); }
        .input-wrap::after { content:'';position:absolute;inset:-1px;border-radius:13px;opacity:0;transition:opacity 0.25s;pointer-events:none;background:linear-gradient(135deg,rgba(66,122,67,0.5),rgba(90,158,91,0.28));z-index:-1;filter:blur(9px); }
        .input-wrap.is-focused::after { opacity:1; }
        .input-wrap:hover,.input-wrap.is-focused { transform:translateY(-1px); }
        .btn-submit { position:relative;overflow:hidden;transition:all 0.22s cubic-bezier(0.4,0,0.2,1);letter-spacing:0.03em; }
        .btn-submit::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%);opacity:0;transition:opacity 0.22s; }
        .btn-glow { position:absolute;inset:-4px;border-radius:16px;background:linear-gradient(135deg,#427A43,#5a9e5b,#2e5a2f);opacity:0;z-index:-1;filter:blur(14px);transition:opacity 0.3s; }
        .btn-submit:hover .btn-glow { opacity:0.8; }
        .btn-submit:hover::before { opacity:1; }
        .btn-submit:hover { transform:translateY(-2px);box-shadow:0 14px 44px rgba(66,122,67,0.5) !important; }
        .btn-submit:active { transform:scale(0.973) translateY(0); }
        .btn-submit .arrow-icon { transition:transform 0.2s; }
        .btn-submit:hover .arrow-icon { transform:translateX(5px); }
        .login-card { position:relative;transition:box-shadow 0.35s,transform 0.35s; }
        .login-card::before { content:'';position:absolute;inset:0;border-radius:17px;background:linear-gradient(135deg,rgba(66,122,67,0.2) 0%,rgba(90,158,91,0.07) 50%,transparent 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:1px;pointer-events:none;opacity:0;transition:opacity 0.4s; }
        .login-card:hover::before { opacity:1; }
        .login-card:hover { transform:translateY(-3px); }
        .stat-card { border-radius:14px;padding:16px;transition:transform 0.2s; }
        .stat-card:hover { transform:translateY(-2px); }
        .feat-icon { width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center; }
        .feat-row { display:flex;align-items:flex-start;gap:13px;padding:13px 0; }
        .feat-row+.feat-row { border-top:1px solid; }
        .card-enter { animation:cardEnter 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes cardEnter { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .lp-1{animation:fu 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both}
        .lp-2{animation:fu 0.5s cubic-bezier(0.16,1,0.3,1) 0.18s both}
        .lp-3{animation:fu 0.5s cubic-bezier(0.16,1,0.3,1) 0.28s both}
        .lp-4{animation:fu 0.5s cubic-bezier(0.16,1,0.3,1) 0.38s both}
        .lp-5{animation:fu 0.5s cubic-bezier(0.16,1,0.3,1) 0.48s both}
        .logo-enter{animation:fu 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both}
        .h-enter{animation:fu 0.4s cubic-bezier(0.16,1,0.3,1) 0.12s both}
        .f1{animation:fu 0.4s cubic-bezier(0.16,1,0.3,1) 0.20s both}
        .f2{animation:fu 0.4s cubic-bezier(0.16,1,0.3,1) 0.28s both}
        .f3{animation:fu 0.4s cubic-bezier(0.16,1,0.3,1) 0.34s both}
        .fb{animation:fu 0.4s cubic-bezier(0.16,1,0.3,1) 0.40s both}
        .ff{animation:fu 0.4s cubic-bezier(0.16,1,0.3,1) 0.46s both}
        @keyframes fu { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .field-label { font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase; }
        .div-line { flex:1;height:1px; }
        .type-badge { display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px; }
      `}</style>

      <div className={`login-root min-h-screen relative overflow-hidden flex ${isDarkMode ? "bg-[#070d07]" : "bg-[#f3f7f3]"}`}>
        <div className="absolute inset-0 noise-overlay z-0" />
        <div className={`absolute inset-0 z-0 ${isDarkMode ? "grid-bg-dark" : "grid-bg"}`} />
        <div className="glow-orb z-0" style={{ width:700,height:700,top:-180,left:-180,background:isDarkMode?"radial-gradient(circle,rgba(66,122,67,0.22) 0%,transparent 70%)":"radial-gradient(circle,rgba(66,122,67,0.11) 0%,transparent 70%)" }} />
        <div className="glow-orb z-0" style={{ width:500,height:500,bottom:-120,right:-80,background:isDarkMode?"radial-gradient(circle,rgba(66,122,67,0.14) 0%,transparent 70%)":"radial-gradient(circle,rgba(66,122,67,0.07) 0%,transparent 70%)" }} />

        {/* ══ LEFT PANEL ══ */}
        <div className={`hidden lg:flex flex-col justify-between w-[48%] p-12 relative z-10 border-r overflow-y-auto ${isDarkMode ? "border-white/[0.05]" : "border-[#427A43]/10"}`}>
          <div className="lp-1 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isDarkMode ? "bg-[#427A43]/20" : "bg-white shadow-[#427A43]/15"}`}>
              <img src={icon} alt="logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <p className={`text-sm font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>Codingclub</p>
              <p style={{ fontSize:10,marginTop:2,color:isDarkMode?"rgba(255,255,255,0.3)":"rgba(66,122,67,0.6)" }}>O'quv Markazi</p>
            </div>
          </div>

          <div className="my-8">
            <div className="lp-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ background:isDarkMode?"rgba(66,122,67,0.12)":"rgba(66,122,67,0.08)",border:`1px solid ${isDarkMode?"rgba(66,122,67,0.28)":"rgba(66,122,67,0.18)"}`,color:G }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:G,display:"inline-block" }} className="animate-pulse" />
              Boshqaruv tizimi — v2.0
            </div>

            <h2 className={`lp-3 font-extrabold leading-[1.12] tracking-tight mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`} style={{ fontSize:34 }}>
              Codingclub<br />
              <span style={{ color:G }}>O'quv Markazi</span><br />
              <span style={{ fontWeight:300,fontSize:26,color:isDarkMode?"rgba(255,255,255,0.28)":"#c0c0c0" }}>Boshqaruv Paneli</span>
            </h2>

            <p className="lp-3 text-sm leading-relaxed mb-8 max-w-[290px]" style={{ color:isDarkMode?"rgba(255,255,255,0.38)":"#9ca3af" }}>
              Guruhlar, o'qituvchilar va o'quvchilarni bitta qulay tizimdan boshqaring.
            </p>

            <div className="lp-4 grid grid-cols-3 gap-3 mb-8">
              {stats.map(({ Icon, value, label }) => (
                <div key={label} className="stat-card"
                  style={{ background:isDarkMode?"rgba(66,122,67,0.09)":"rgba(66,122,67,0.06)",border:`1px solid ${isDarkMode?"rgba(66,122,67,0.16)":"rgba(66,122,67,0.12)"}` }}>
                  <Icon size={15} color={G} style={{ marginBottom:8 }} />
                  <p className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
                  <p style={{ fontSize:11,marginTop:2,color:isDarkMode?"rgba(255,255,255,0.28)":"#9ca3af" }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="lp-5">
              {features.map(({ Icon, title, desc }, i) => (
                <div key={i} className="feat-row" style={{ borderColor:isDarkMode?"rgba(255,255,255,0.05)":"rgba(66,122,67,0.08)" }}>
                  <div className="feat-icon" style={{ background:isDarkMode?"rgba(66,122,67,0.12)":"rgba(66,122,67,0.08)" }}>
                    <Icon size={15} color={G} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? "text-white/85" : "text-gray-800"}`}>{title}</p>
                    <p style={{ fontSize:12,marginTop:2,color:isDarkMode?"rgba(255,255,255,0.3)":"#9ca3af",lineHeight:1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-5 flex items-center gap-2" style={{ color:isDarkMode?"rgba(255,255,255,0.15)":"#d1d5db",fontSize:12 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:G,opacity:0.5,display:"inline-block" }} />
            © 2024 Codingclub. Barcha huquqlar himoyalangan.
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10 logo-enter">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-[#427A43]/20" : "bg-white shadow-sm"}`}>
                <img src={icon} alt="logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className={`text-sm font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>Codingclub</p>
                <p style={{ fontSize:10,marginTop:2,color:isDarkMode?"rgba(255,255,255,0.3)":"rgba(66,122,67,0.6)" }}>O'quv Markazi Boshqaruv Tizimi</p>
              </div>
            </div>

            <div className={`login-card card-enter rounded-2xl p-8 border ${
              isDarkMode
                ? "bg-white/[0.03] border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
                : "bg-white shadow-[0_8px_48px_rgba(66,122,67,0.10),inset_0_1px_0_rgba(255,255,255,1)]"
            }`} style={{ borderColor:isDarkMode?"rgba(255,255,255,0.06)":"rgba(66,122,67,0.12)" }}>

              <div className="h-enter mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(66,122,67,0.1)" }}>
                    <img src={icon} alt="logo" className="w-4 h-4 object-contain" />
                  </div>
                  <span style={{ fontSize:12,fontWeight:600,color:isDarkMode?"rgba(255,255,255,0.35)":"rgba(66,122,67,0.65)" }}>
                    Codingclub Admin
                  </span>
                </div>
                <h1 className={`text-xl font-bold tracking-tight mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Tizimga kirish
                </h1>
                <p style={{ fontSize:13.5,color:isDarkMode?"rgba(255,255,255,0.35)":"#9ca3af" }}>
                  Admin — telefon, O'qituvchi — email bilan
                </p>
              </div>

              {error && (
                <div className={`mb-5 flex items-start gap-3 p-3.5 rounded-xl text-sm border ${
                  isDarkMode ? "bg-red-500/8 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"
                }`}>
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Identifier (phone or email) ── */}
                <div className="f1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="field-label" style={{ color:isDarkMode?"rgba(255,255,255,0.3)":"rgba(66,122,67,0.55)" }}>
                      Telefon yoki Email
                    </label>
                    {formData.identifier && (
                      <span className="type-badge" style={{
                        background: isEmail ? "rgba(59,130,246,0.1)" : "rgba(66,122,67,0.1)",
                        color: isEmail ? "#3b82f6" : G,
                        border: `1px solid ${isEmail ? "rgba(59,130,246,0.2)" : "rgba(66,122,67,0.2)"}`,
                      }}>
                        {isEmail ? <><Mail size={9}/> Email</> : <><Phone size={9}/> Telefon</>}
                      </span>
                    )}
                  </div>
                  <div className={inputWrapClass("identifier")}>
                    {isEmail
                      ? <Mail size={15} style={{ flexShrink:0,color:focused==="identifier"?G:isDarkMode?"rgba(255,255,255,0.22)":"#d1d5db",transition:"color 0.15s" }} />
                      : <Phone size={15} style={{ flexShrink:0,color:focused==="identifier"?G:isDarkMode?"rgba(255,255,255,0.22)":"#d1d5db",transition:"color 0.15s" }} />
                    }
                    <input
                      type="text"
                      required
                      value={formData.identifier}
                      onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                      onFocus={() => setFocused("identifier")}
                      onBlur={() => setFocused("")}
                      placeholder="+998901234567 yoki email@gmail.com"
                      autoComplete="username"
                      className={`input-field flex-1 bg-transparent text-sm ${isDarkMode ? "text-white placeholder-white/20" : "text-gray-900 placeholder-gray-300"}`}
                    />
                  </div>
                </div>

                {/* ── Password ── */}
                <div className="f2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="field-label" style={{ color:isDarkMode?"rgba(255,255,255,0.3)":"rgba(66,122,67,0.55)" }}>Parol</label>
                    <a href="#" style={{ fontSize:12,fontWeight:600,color:G,textDecoration:"none" }}>Unutdingizmi?</a>
                  </div>
                  <div className={inputWrapClass("password")}>
                    <Lock size={15} style={{ flexShrink:0,color:focused==="password"?G:isDarkMode?"rgba(255,255,255,0.22)":"#d1d5db",transition:"color 0.15s" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused("")}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`input-field flex-1 bg-transparent text-sm ${isDarkMode ? "text-white placeholder-white/20" : "text-gray-900 placeholder-gray-300"}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ flexShrink:0,color:isDarkMode?"rgba(255,255,255,0.22)":"#d1d5db",background:"none",border:"none",cursor:"pointer",transition:"color 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.color=G}
                      onMouseOut={e => e.currentTarget.style.color=isDarkMode?"rgba(255,255,255,0.22)":"#d1d5db"}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="f3 flex items-center gap-2.5 pt-0.5">
                  <input type="checkbox" id="remember" style={{ accentColor:G,width:16,height:16,cursor:"pointer" }} />
                  <label htmlFor="remember" className={`text-sm cursor-pointer select-none ${isDarkMode ? "text-white/40" : "text-gray-400"}`}>
                    Eslab qolish
                  </label>
                </div>

                <div className="fb pt-1">
                  <button type="submit" disabled={isLoading}
                    className="btn-submit w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                    style={{ background:`linear-gradient(135deg, ${G} 0%, #2e5a2f 100%)`,boxShadow:`0 2px 4px rgba(0,0,0,0.2), 0 6px 22px rgba(66,122,67,0.38), inset 0 1px 0 rgba(255,255,255,0.15)` }}>
                    <div className="btn-glow" />
                    {isLoading ? (
                      <><SmallImageLoader size={16} /><span>Kirilmoqda...</span></>
                    ) : (
                      <><span>Tizimga Kirish</span><ArrowRight size={15} className="arrow-icon" /></>
                    )}
                  </button>
                </div>
              </form>

              <div className="ff flex items-center gap-4 my-6">
                <div className="div-line" style={{ background:isDarkMode?"rgba(255,255,255,0.06)":"rgba(66,122,67,0.1)" }} />
                <span style={{ fontSize:11,color:isDarkMode?"rgba(255,255,255,0.2)":"#d1d5db" }}>yoki</span>
                <div className="div-line" style={{ background:isDarkMode?"rgba(255,255,255,0.06)":"rgba(66,122,67,0.1)" }} />
              </div>

              <p className={`ff text-center text-sm ${isDarkMode ? "text-white/30" : "text-gray-400"}`}>
                Akkauntingiz yo'qmi?{" "}
                <a href="/register" style={{ color:G,fontWeight:600,textDecoration:"none" }}>Ro'yxatdan o'ting</a>
                {" | "}
                <a href="/teacher-login" style={{ color:G,fontWeight:600,textDecoration:"none" }}>O'qituvchi kirish</a>
              </p>
            </div>

            <p className="ff text-center text-xs mt-5" style={{ color:isDarkMode?"rgba(255,255,255,0.15)":"#d1d5db" }}>
              Tizimga kirib, siz{" "}
              <a href="#" style={{ textDecoration:"underline",textUnderlineOffset:3,color:"inherit" }}>foydalanish shartlari</a>
              {" "}ga rozilik bildirasiz.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}