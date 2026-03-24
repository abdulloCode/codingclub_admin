import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SmallImageLoader } from "../components/ImageLoader";
import { GraduationCap, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight, BookOpen, Users, TrendingUp, Shield } from "lucide-react";

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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'teacher') navigate('/teacher-panel', { replace: true });
      else if (user.role === 'admin') navigate('/admin-panel', { replace: true });
      else if (user.role === 'student') navigate('/students-panel', { replace: true });
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
    setIsLoading(true);
    try {
      await teacherLogin(formData.phone, formData.password);
      // useEffect yuqorida redirect qiladi
    } catch (err) {
      setError(err.message || "Kirishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const G = "#10b981";

  const inputWrapStyle = (name) => {
    const isFoc = focused === name;
    return {
      display:"flex", alignItems:"center", gap:12,
      padding:"11px 14px", borderRadius:12,
      background: isFoc
        ? isDarkMode ? "rgba(255,255,255,0.07)" : "#fff"
        : isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(16,185,129,0.03)",
      border: `1px solid ${isFoc ? G : isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(16,185,129,0.15)"}`,
      boxShadow: isFoc ? "0 0 0 3px rgba(16,185,129,0.14)" : "none",
      transition: "all .2s",
    };
  };

  const stats = [
    { Icon: Users,      value: "150+", label: "O'qituvchilar" },
    { Icon: BookOpen,   value: "48",   label: "Guruhlar"      },
    { Icon: TrendingUp, value: "95%",  label: "Davomat"       },
  ];
  const features = [
    { Icon: Users,      title: "O'quvchilar boshqaruvi", desc: "Ro'yxat, davomat va baholash"    },
    { Icon: BookOpen,   title: "Guruh va jadvallar",      desc: "Dars jadvali va guruh tarkibi"  },
    { Icon: TrendingUp, title: "Hisobot va statistika",   desc: "Davomat va baholar hisobotlari" },
    { Icon: Shield,     title: "Xavfsiz tizim",           desc: "Ma'lumotlaringiz himoyalangan"  },
  ];

  const tx = isDarkMode ? "#f5f5f7" : "#111";
  const mu = isDarkMode ? "rgba(255,255,255,0.35)" : "#9ca3af";
  const bord = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.12)";

  return (
    <>
      <style>{`
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardEnter{from{opacity:0;transform:translateY(30px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes tl-spin{to{transform:rotate(360deg)}}
        .tl-lp1{animation:fu .5s ease .08s both}.tl-lp2{animation:fu .5s ease .18s both}
        .tl-lp3{animation:fu .5s ease .28s both}.tl-lp4{animation:fu .5s ease .38s both}
        .tl-lp5{animation:fu .5s ease .48s both}
        .tl-card{animation:cardEnter .65s cubic-bezier(.16,1,.3,1) both}
        .tl-f1{animation:fu .4s ease .20s both}.tl-f2{animation:fu .4s ease .28s both}
        .tl-fb{animation:fu .4s ease .40s both}.tl-ff{animation:fu .4s ease .46s both}
        .tl-inp:hover{transform:translateY(-1px)}
        .tl-btn{position:relative;overflow:hidden;transition:transform .22s,box-shadow .22s}
        .tl-btn:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(16,185,129,0.5)!important}
        .tl-btn:active{transform:scale(0.973)}
        .tl-arrow{transition:transform .2s}.tl-btn:hover .tl-arrow{transform:translateX(5px)}
        .tl-stat{border-radius:14px;padding:16px;transition:transform .2s}.tl-stat:hover{transform:translateY(-2px)}
        .tl-feat{display:flex;align-items:flex-start;gap:13px;padding:13px 0}
        .tl-feat+.tl-feat{border-top:1px solid}
        .tl-feat-icon{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .tl-mobile-logo{display:flex}@media(min-width:1024px){.tl-mobile-logo{display:none!important}}
        .tl-left{display:none}@media(min-width:1024px){.tl-left{display:flex!important}}
      `}</style>

      <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", background: isDarkMode?"#070d07":"#f3f7f3" }}>
        {/* LEFT PANEL */}
        <div style={{ flexDirection:"column", justifyContent:"space-between", width:"48%", padding:"48px 52px", position:"relative", zIndex:10, borderRight:`1px solid ${bord}`, overflowY:"auto" }} className="tl-left">
          <div className="tl-lp1" style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:13, background:"rgba(16,185,129,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <GraduationCap size={20} color={G} />
            </div>
            <div>
              <p style={{ fontSize:16, fontWeight:700, color:tx, lineHeight:1 }}>Codingclub</p>
              <p style={{ fontSize:10, marginTop:2, color:mu }}>O'quv Markazi</p>
            </div>
          </div>

          <div style={{ margin:"40px 0" }}>
            <div className="tl-lp2" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 12px", borderRadius:99, marginBottom:28, background: isDarkMode?"rgba(16,185,129,0.12)":"rgba(16,185,129,0.08)", border:`1px solid ${isDarkMode?"rgba(16,185,129,0.28)":"rgba(16,185,129,0.18)"}` }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:G, display:"inline-block" }} className="tl-pulse"/>
              <span style={{ fontSize:11, fontWeight:700, color:G }}>O'qituvchi kirish</span>
            </div>
            <h2 className="tl-lp3" style={{ fontSize:34, fontWeight:800, lineHeight:1.12, letterSpacing:"-0.02em", marginBottom:14, color:tx }}>
              O'qituvchilar<br/>
              <span style={{ color:G }}>Boshqaruv Paneli</span><br/>
              <span style={{ fontWeight:300, fontSize:26, color: isDarkMode?"rgba(255,255,255,0.28)":"#c0c0c0" }}>Guruhlarni boshqarish</span>
            </h2>
            <p className="tl-lp3" style={{ fontSize:13.5, lineHeight:1.7, marginBottom:32, maxWidth:290, color:mu }}>
              Guruhlaringizni, dars jadvalingizni va o'quvchilaringizni bitta qulay tizimdan boshqaring.
            </p>
            <div className="tl-lp4" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:32 }}>
              {stats.map(({ Icon, value, label }) => (
                <div key={label} className="tl-stat" style={{ background: isDarkMode?"rgba(16,185,129,0.09)":"rgba(16,185,129,0.06)", border:`1px solid ${isDarkMode?"rgba(16,185,129,0.16)":"rgba(16,185,129,0.12)"}` }}>
                  <Icon size={15} color={G} style={{ marginBottom:8 }}/>
                  <p style={{ fontSize:20, fontWeight:800, color:tx }}>{value}</p>
                  <p style={{ fontSize:11, marginTop:2, color:mu }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="tl-lp5">
              {features.map(({ Icon, title, desc }, i) => (
                <div key={i} className="tl-feat" style={{ borderColor: isDarkMode?"rgba(255,255,255,0.05)":"rgba(16,185,129,0.08)" }}>
                  <div className="tl-feat-icon" style={{ background: isDarkMode?"rgba(16,185,129,0.12)":"rgba(16,185,129,0.08)" }}>
                    <Icon size={15} color={G}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:tx }}>{title}</p>
                    <p style={{ fontSize:12, marginTop:2, color:mu, lineHeight:1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12, color: isDarkMode?"rgba(255,255,255,0.15)":"#d1d5db" }}>© {new Date().getFullYear()} Codingclub. Barcha huquqlar himoyalangan.</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", zIndex:10 }}>
          <div style={{ width:"100%", maxWidth:400 }}>
            {/* Mobile logo */}
            <div className="tl-lp1 tl-mobile-logo" style={{ alignItems:"center", gap:10, marginBottom:32 }}>
              <div style={{ width:36, height:36, borderRadius:11, background:"rgba(16,185,129,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <GraduationCap size={18} color={G}/>
              </div>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:tx, lineHeight:1 }}>Codingclub</p>
                <p style={{ fontSize:10, marginTop:1, color:mu }}>O'quv Markazi Boshqaruv Tizimi</p>
              </div>
            </div>

            <div className="tl-card" style={{ borderRadius:22, padding:"32px 32px 28px", background: isDarkMode?"rgba(255,255,255,0.03)":"#ffffff", border:`1px solid ${bord}`, boxShadow: isDarkMode?"0 24px 80px rgba(0,0,0,0.70)":"0 8px 48px rgba(16,185,129,0.10),inset 0 1px 0 rgba(255,255,255,1)" }}>
              <div className="tl-lp1" style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:9, background:"rgba(16,185,129,0.10)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <GraduationCap size={14} color={G}/>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:mu }}>O'QITUVCHI PORTAL</span>
                </div>
                <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", color:tx, marginBottom:5 }}>Tizimga kirish</h1>
                <p style={{ fontSize:13, color:mu, lineHeight:1.6 }}>O'qituvchi boshqaruv paneliga xush kelibsiz</p>
              </div>

              {error && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:20, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)" }}>
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0, marginTop:1 }}/>
                  <span style={{ fontSize:13, color:"#ef4444", lineHeight:1.5 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="tl-f1">
                  <label style={{ display:"block", fontSize:10, fontWeight:800, color:mu, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:7 }}>Telefon yoki Email</label>
                  <div className="tl-inp" style={{ ...inputWrapStyle("phone"), transition:"all .2s" }}>
                    <Phone size={15} color={focused==="phone"?G:mu} style={{ flexShrink:0, transition:"color .15s" }}/>
                    <input type="text" required value={formData.phone}
                      onChange={e => setFormData({...formData, phone:e.target.value})}
                      onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                      placeholder="+998 90 123 45 67 yoki email" autoComplete="username"
                      style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:tx }}
                    />
                  </div>
                </div>

                <div className="tl-f2">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <label style={{ fontSize:10, fontWeight:800, color:mu, textTransform:"uppercase", letterSpacing:"0.07em" }}>Parol</label>
                    <a href="#" style={{ fontSize:12, fontWeight:600, color:G, textDecoration:"none" }}>Unutdingizmi?</a>
                  </div>
                  <div className="tl-inp" style={{ ...inputWrapStyle("password"), transition:"all .2s" }}>
                    <Lock size={15} color={focused==="password"?G:mu} style={{ flexShrink:0, transition:"color .15s" }}/>
                    <input type={showPassword?"text":"password"} required value={formData.password}
                      onChange={e => setFormData({...formData, password:e.target.value})}
                      onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                      placeholder="••••••••" autoComplete="current-password"
                      style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:tx }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:mu, flexShrink:0, padding:0, transition:"color .15s" }}
                      onMouseOver={e => e.currentTarget.style.color=G}
                      onMouseOut={e => e.currentTarget.style.color=mu}>
                      {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <input type="checkbox" id="remember-t" style={{ accentColor:G, width:16, height:16, cursor:"pointer" }}/>
                  <label htmlFor="remember-t" style={{ fontSize:13, color:mu, cursor:"pointer", userSelect:"none" }}>Eslab qolish</label>
                </div>

                <div className="tl-fb">
                  <button type="submit" disabled={isLoading} className="tl-btn" style={{ width:"100%", padding:"13px", borderRadius:13, border:"none", cursor:isLoading?"not-allowed":"pointer", background:`linear-gradient(135deg,${G} 0%,#059669 100%)`, boxShadow:"0 4px 20px rgba(16,185,129,0.40),inset 0 1px 0 rgba(255,255,255,0.15)", fontSize:14, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:isLoading?.65:1 }}>
                    {isLoading ? (
                      <><div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"tl-spin .8s linear infinite" }}/> Kirilmoqda...</>
                    ) : (
                      <>Tizimga Kirish <ArrowRight size={15} className="tl-arrow"/></>
                    )}
                  </button>
                </div>
              </form>

              <div className="tl-ff" style={{ display:"flex", alignItems:"center", gap:14, margin:"22px 0" }}>
                <div style={{ flex:1, height:1, background: isDarkMode?"rgba(255,255,255,0.06)":"rgba(16,185,129,0.10)" }}/>
                <span style={{ fontSize:11, color:mu }}>yoki</span>
                <div style={{ flex:1, height:1, background: isDarkMode?"rgba(255,255,255,0.06)":"rgba(16,185,129,0.10)" }}/>
              </div>

              <p className="tl-ff" style={{ textAlign:"center", fontSize:13, color:mu }}>
                Admin sifatida kirmoqchimisiz?{" "}
                <a href="/login" style={{ color:G, fontWeight:600, textDecoration:"none" }}>Admin kirish</a>
              </p>
            </div>

            <p className="tl-ff" style={{ textAlign:"center", fontSize:11, color: isDarkMode?"rgba(255,255,255,0.14)":"#ccc", marginTop:18 }}>
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