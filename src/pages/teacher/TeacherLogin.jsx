import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { GraduationCap, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight, BookOpen, Users, TrendingUp, Shield } from 'lucide-react';

export default function TeacherLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { teacherLogin, user, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");

  // ✅ TO'G'RI redirect — har bir rol o'z sahifasiga
  useEffect(() => {
    if (authLoading || !user?.role) return;

    if (user.role === 'teacher') {
      navigate('/teacher-panel', { replace: true });
    } else if (user.role === 'student') {
      navigate('/students-panel', { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin-panel', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (location.state?.phone && location.state?.password) {
      setFormData({ phone: location.state.phone, password: location.state.password });
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validatsiya
    if (!formData.phone.trim()) {
      setError("Telefon yoki email kiriting");
      return;
    }
    if (!formData.password) {
      setError("Parolni kiriting");
      return;
    }

    // Validatsiyadan keyin login jarayonini boshlash
    setIsLoading(true);
    try {
      console.log("🔐 Teacher login attempt:", { phone: formData.phone, hasPassword: !!formData.password });
      await teacherLogin(formData.phone, formData.password);
      console.log("✅ Teacher login successful");

      // Muvaffaqiyatli bo'lsa, useEffect orqali redirect bo'ladi
    } catch (err) {
      console.error("❌ Teacher login failed:", err);
      setError(err.message || "Login yoki parol noto'g'ri. Iltimos, qayta urinib ko'ring.");
      // Error bo'lganda password inputga focus qilish
      setFocused("password");
      setIsLoading(false);
    }
  };

  const G = "#6366f1";
  const tx = isDarkMode ? "#f5f5f7" : "#111";
  const mu = isDarkMode ? "rgba(255,255,255,0.35)" : "#9ca3af";
  const bord = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.12)";

  const inputWrapStyle = (name) => {
    const isFoc = focused === name;
    return {
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px", borderRadius: 12,
      background: isFoc
        ? isDarkMode ? "rgba(255,255,255,0.07)" : "#fff"
        : isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.03)",
      border: `1px solid ${isFoc ? G : isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"}`,
      boxShadow: isFoc ? "0 0 0 3px rgba(99,102,241,0.14)" : "none",
      transition: "all .2s",
    };
  };

  const stats = [
    { Icon: Users,      value: "50+",  label: "O'qituvchilar" },
    { Icon: BookOpen,   value: "120",  label: "Guruhlar"     },
    { Icon: TrendingUp, value: "85%",  label: "Muvaffaqiyat"  },
  ];

  const features = [
    { Icon: Users,      title: "O'quvchilarni boshqaring",    desc: "Guruhlar va davomat"                  },
    { Icon: BookOpen,   title: "Topshiriqlar va baholash",    desc: "Online baholash tizimi"               },
    { Icon: TrendingUp, title: "Progress tracking",          desc: "O'quvchilar progressingizni kuzating"  },
    { Icon: Shield,     title: "Xavfsiz tizim",              desc: "Ma'lumotlaringiz himoyalangan"         },
  ];

  return (
    <>
      <style>{`
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardEnter{from{opacity:0;transform:translateY(30px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes sl-spin{to{transform:rotate(360deg)}}
        @keyframes sl-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
        .sl-lp1{animation:fu .5s ease .08s both}.sl-lp2{animation:fu .5s ease .18s both}
        .sl-lp3{animation:fu .5s ease .28s both}.sl-lp4{animation:fu .5s ease .38s both}
        .sl-lp5{animation:fu .5s ease .48s both}
        .sl-card{animation:cardEnter .65s cubic-bezier(.16,1,.3,1) both}
        .sl-f1{animation:fu .4s ease .20s both}.sl-f2{animation:fu .4s ease .28s both}
        .sl-fb{animation:fu .4s ease .40s both}.sl-ff{animation:fu .4s ease .46s both}
        .sl-inp:hover{transform:translateY(-1px)}
        .sl-btn{position:relative;overflow:hidden;transition:transform .22s,box-shadow .22s}
        .sl-btn:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(99,102,241,0.5)!important}
        .sl-btn:active{transform:scale(0.973)}
        .sl-arrow{transition:transform .2s}.sl-btn:hover .sl-arrow{transform:translateX(5px)}
        .sl-stat{border-radius:14px;padding:16px;transition:transform .2s}.sl-stat:hover{transform:translateY(-2px)}
        .sl-feat{display:flex;align-items:flex-start;gap:13px;padding:13px 0}
        .sl-feat+.sl-feat{border-top:1px solid}
        .sl-feat-icon{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .sl-mobile-logo{display:flex}@media(min-width:1024px){.sl-mobile-logo{display:none!important}}
        .sl-left{display:none}@media(min-width:1024px){.sl-left{display:flex!important}}
        .sl-pulse{animation:sl-pulse 2s ease-in-out infinite}
      `}</style>

      <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", background: isDarkMode ? "#07070d" : "#f3f3f7" }}>
        {/* LEFT PANEL */}
        <div style={{ flexDirection: "column", justifyContent: "space-between", width: "48%", padding: "48px 52px", position: "relative", zIndex: 10, borderRight: `1px solid ${bord}`, overflowY: "auto" }} className="sl-left">
          <div className="sl-lp1" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} color={G} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: tx, lineHeight: 1 }}>Codingclub</p>
              <p style={{ fontSize: 10, marginTop: 2, color: mu }}>O'quv Markazi</p>
            </div>
          </div>

          <div style={{ margin: "40px 0" }}>
            <div className="sl-lp2" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 99, marginBottom: 20, background: isDarkMode ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)", border: `1px solid ${isDarkMode ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.18)"}` }}>
              <span className="sl-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: G, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: G }}>O'qituvchi kirish — faol</span>
            </div>

            {/* Xavfsizlik ogohlantirishi */}
            <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 24, background: isDarkMode ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)", border: `1px solid ${isDarkMode ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.14)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Shield size={13} color={G} />
                <span style={{ fontSize: 12, fontWeight: 700, color: G }}>Faqat o'qituvchilar uchun</span>
              </div>
              <p style={{ fontSize: 12, color: mu, lineHeight: 1.5 }}>Admin yoki o'quvchi hisob bilan kirish rad etiladi.</p>
            </div>

            <h2 className="sl-lp3" style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 14, color: tx }}>
              O'qituvchilar<br />
              <span style={{ color: G }}>Boshqaruv Paneli</span><br />
              <span style={{ fontWeight: 300, fontSize: 26, color: isDarkMode ? "rgba(255,255,255,0.28)" : "#c0c0c0" }}>Darslarni boshqaring</span>
            </h2>
            <p className="sl-lp3" style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 32, maxWidth: 290, color: mu }}>
              Guruhlaringiz, topshiriqlaringiz va o'quvchilaringizni bitta qulay tizimdan boshqaring.
            </p>

            <div className="sl-lp4" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 32 }}>
              {stats.map(({ Icon, value, label }) => (
                <div key={label} className="sl-stat" style={{ background: isDarkMode ? "rgba(99,102,241,0.09)" : "rgba(99,102,241,0.06)", border: `1px solid ${isDarkMode ? "rgba(99,102,241,0.16)" : "rgba(99,102,241,0.12)"}` }}>
                  <Icon size={15} color={G} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 20, fontWeight: 800, color: tx }}>{value}</p>
                  <p style={{ fontSize: 11, marginTop: 2, color: mu }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="sl-lp5">
              {features.map(({ Icon, title, desc }, i) => (
                <div key={i} className="sl-feat" style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)" }}>
                  <div className="sl-feat-icon" style={{ background: isDarkMode ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)" }}>
                    <Icon size={15} color={G} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: tx }}>{title}</p>
                    <p style={{ fontSize: 12, marginTop: 2, color: mu, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: isDarkMode ? "rgba(255,255,255,0.15)" : "#d1d5db" }}>© {new Date().getFullYear()} Codingclub. Barcha huquqlar himoyalangan.</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 10 }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div className="sl-lp1 sl-mobile-logo" style={{ alignItems: "center", gap: 10, marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={18} color={G} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: tx, lineHeight: 1 }}>Codingclub</p>
                <p style={{ fontSize: 10, marginTop: 1, color: mu }}>O'qituvchi Boshqaruv Tizimi</p>
              </div>
            </div>

            <div className="sl-card" style={{ borderRadius: 22, padding: "32px 32px 28px", background: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${bord}`, boxShadow: isDarkMode ? "0 24px 80px rgba(0,0,0,0.70)" : "0 8px 48px rgba(99,102,241,0.10),inset 0 1px 0 rgba(255,255,255,1)" }}>
              <div className="sl-lp1" style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(99,102,241,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraduationCap size={14} color={G} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: "0.05em", background: "rgba(99,102,241,0.10)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.20)" }}>
                    FAQAT O'QITUVCHILAR
                  </span>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: tx, marginBottom: 5 }}>O'qituvchi kirish</h1>
                <p style={{ fontSize: 13, color: mu, lineHeight: 1.6 }}>Admin yoki o'quvchi hisob bilan kirish rad etiladi</p>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, marginBottom: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}>
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: "#ef4444", lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="sl-f1">
                  <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Telefon yoki Email</label>
                  <div className="sl-inp" style={{ ...inputWrapStyle("phone"), transition: "all .2s" }}>
                    <Phone size={15} color={focused === "phone" ? G : mu} style={{ flexShrink: 0, transition: "color .15s" }} />
                    <input
                      type="text" required value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                      placeholder="+998 90 123 45 67 yoki email" autoComplete="username"
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: tx }}
                    />
                  </div>
                </div>

                <div className="sl-f2">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: mu, textTransform: "uppercase", letterSpacing: "0.07em" }}>Parol</label>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: G, textDecoration: "none" }}>Unutdingizmi?</a>
                  </div>
                  <div className="sl-inp" style={{ ...inputWrapStyle("password"), transition: "all .2s" }}>
                    <Lock size={15} color={focused === "password" ? G : mu} style={{ flexShrink: 0, transition: "color .15s" }} />
                    <input
                      type={showPassword ? "text" : "password"} required value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                      placeholder="••••••••" autoComplete="current-password"
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: tx }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: mu, flexShrink: 0, padding: 0, transition: "color .15s" }}
                      onMouseOver={e => e.currentTarget.style.color = G}
                      onMouseOut={e => e.currentTarget.style.color = mu}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="remember-t" style={{ accentColor: G, width: 16, height: 16, cursor: "pointer" }} />
                  <label htmlFor="remember-t" style={{ fontSize: 13, color: mu, cursor: "pointer", userSelect: "none" }}>Eslab qolish</label>
                </div>

                <div className="sl-fb">
                  <button
                    type="submit" disabled={isLoading} className="sl-btn"
                    style={{ width: "100%", padding: "13px", borderRadius: 13, border: "none", cursor: isLoading ? "not-allowed" : "pointer", background: `linear-gradient(135deg,${G} 0%,#4f46e5 100%)`, boxShadow: "0 4px 20px rgba(99,102,241,0.40),inset 0 1px 0 rgba(255,255,255,0.15)", fontSize: 14, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isLoading ? .65 : 1 }}
                  >
                    {isLoading ? (
                      <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "sl-spin .8s linear infinite" }} /> Kirilmoqda...</>
                    ) : (
                      <>O'qituvchi sifatida kirish <ArrowRight size={15} className="sl-arrow" /></>
                    )}
                  </button>
                </div>
              </form>

              <div className="sl-ff" style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
                <div style={{ flex: 1, height: 1, background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.10)" }} />
                <span style={{ fontSize: 11, color: mu }}>boshqa kirish</span>
                <div style={{ flex: 1, height: 1, background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.10)" }} />
              </div>

              <div className="sl-ff" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <a href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: `1px solid rgba(99,102,241,0.15)`, background: isDarkMode ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)", textDecoration: "none", fontSize: 12, fontWeight: 600, color: G }}>
                  <Shield size={13} /> Admin kirish
                </a>
                <a href="/student-login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: `1px solid rgba(99,102,241,0.15)`, background: isDarkMode ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)", textDecoration: "none", fontSize: 12, fontWeight: 600, color: G }}>
                  <GraduationCap size={13} /> O'quvchi kirish
                </a>
              </div>
            </div>

            <p className="sl-ff" style={{ textAlign: "center", fontSize: 11, color: isDarkMode ? "rgba(255,255,255,0.14)" : "#ccc", marginTop: 18 }}>
              © {new Date().getFullYear()} Codingclub. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}