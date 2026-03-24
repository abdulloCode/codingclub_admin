import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../services/api";
import {
  Phone, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, Users, BookOpen,
  TrendingUp, Shield, GraduationCap, Layers,
} from "lucide-react";

function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const duration = 1400;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

const G = "#427A43";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode: D } = useTheme();
  const { login, user, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [dynStats, setDynStats] = useState({ students: 0, teachers: 0, groups: 0, courses: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Redirect if already logged in - role bo'yicha avtomatik redirect
  useEffect(() => {
    if (!authLoading && user && user.role) {
      console.log("User already logged in with role:", user.role);

      // Role bo'yicha avtomatik redirect
      switch (user.role) {
        case 'admin':
          console.log("Redirecting to admin panel");
          navigate('/admin-panel', { replace: true });
          break;
        case 'teacher':
          console.log("Redirecting to teacher panel");
          navigate('/teacher-panel', { replace: true });
          break;
        case 'student':
          console.log("Redirecting to student panel");
          navigate('/students-panel', { replace: true });
          break;
        default:
          console.error("Unknown role:", user.role);
          // Role aniqlanmasa login sahifada qoladi
          break;
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (location.state?.phone && location.state?.password) {
      setFormData({ identifier: location.state.phone, password: location.state.password });
    }
  }, [location.state]);

  const isEmail = formData.identifier.includes("@");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const identifier = formData.identifier.trim().replace(/\s/g, "");
    if (!identifier) { setError("Telefon yoki email kiriting"); return; }
    if (!formData.password) { setError("Parolni kiriting"); return; }

    setIsLoading(true);
    try {
      await login(identifier, formData.password);
      // Login muvaffaqiyatli bo'lsa, useEffect ichidagi avtomatik redirect ishlaydi
      // Shuning uchun bu yerda redirect qilmasligimiz kerak
    } catch (err) {
      console.error("Login error:", err);
      // Backend'dan kelgan error message ni ko'rsatish
      const errorMessage = err.message || "Kirishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const bg     = D ? "#070d07" : "#f3f7f3";
  const cardBg = D ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBrd = D ? "rgba(255,255,255,0.06)" : "rgba(66,122,67,0.13)";
  const mu     = D ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.40)";
  const tx     = D ? "#f5f5f7" : "#111";

  const inpBg = (isFoc) => D
    ? isFoc ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)"
    : isFoc ? "#fff" : "rgba(66,122,67,0.03)";
  const inpBrd = (isFoc) => isFoc ? G : D ? "rgba(255,255,255,0.08)" : "rgba(66,122,67,0.15)";
  const inpShadow = (isFoc) => isFoc ? "0 0 0 3px rgba(66,122,67,0.14)" : "none";

  const statItems = [
    { icon: GraduationCap, label: "O'quvchilar",   value: dynStats.students, suffix: "+" },
    { icon: Users,          label: "O'qituvchilar", value: dynStats.teachers, suffix: ""  },
    { icon: Layers,         label: "Guruhlar",      value: dynStats.groups,   suffix: ""  },
    { icon: BookOpen,       label: "Kurslar",       value: dynStats.courses,  suffix: ""  },
  ];

  const features = [
    { icon: Users,      title: "O'quvchilar boshqaruvi", desc: "Ro'yxat, davomat va to'lovlarni kuzating"    },
    { icon: BookOpen,   title: "Guruh va jadvallar",      desc: "Dars jadvali, guruh tarkibi, o'qituvchilar" },
    { icon: TrendingUp, title: "Hisobot va statistika",   desc: "Real-vaqt ma'lumotlari va moliyaviy tahlil" },
    { icon: Shield,     title: "Xavfsiz tizim",           desc: "Ma'lumotlaringiz to'liq himoyalangan"       },
  ];

  return (
    <>
      <style>{`
        .lg-root{-webkit-font-smoothing:antialiased}
        .lg-grid{background-image:linear-gradient(rgba(66,122,67,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(66,122,67,0.06) 1px,transparent 1px);background-size:44px 44px}
        .lg-orb{position:absolute;border-radius:50%;filter:blur(88px);pointer-events:none}
        @keyframes lg-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes lg-in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes lg-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
        .lg-fu-1{animation:lg-up .55s ease .05s both}.lg-fu-2{animation:lg-up .55s ease .12s both}
        .lg-fu-3{animation:lg-up .55s ease .20s both}.lg-fu-4{animation:lg-up .55s ease .28s both}
        .lg-fu-5{animation:lg-up .55s ease .36s both}.lg-card{animation:lg-in .6s cubic-bezier(.16,1,.3,1) .06s both}
        .lg-f1{animation:lg-up .4s ease .18s both}.lg-f2{animation:lg-up .4s ease .26s both}
        .lg-f3{animation:lg-up .4s ease .32s both}.lg-fb{animation:lg-up .4s ease .38s both}
        .lg-ff{animation:lg-up .4s ease .44s both}
        .lg-inp{transition:background .2s,border-color .2s,box-shadow .2s,transform .2s}
        .lg-inp:hover{transform:translateY(-1px)}
        .lg-btn{position:relative;overflow:hidden;transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s}
        .lg-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%);opacity:0;transition:opacity .2s}
        .lg-btn:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(66,122,67,0.48)!important}
        .lg-btn:hover::before{opacity:1}.lg-btn:active{transform:scale(0.97)}
        .lg-btn .lg-arrow{transition:transform .2s}.lg-btn:hover .lg-arrow{transform:translateX(5px)}
        .lg-stat{transition:transform .22s cubic-bezier(.34,1.56,.64,1);border-radius:16px;padding:16px}
        .lg-stat:hover{transform:translateY(-3px)}
        .lg-feat{display:flex;align-items:flex-start;gap:13px;padding:12px 0}
        .lg-feat+.lg-feat{border-top:1px solid}
        .lg-feat-icon{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .lg-pulse-dot{animation:lg-pulse 2s ease-in-out infinite}
        .lg-divider{flex:1;height:1px}
        .lg-card-glow{position:absolute;inset:0;border-radius:17px;background:linear-gradient(135deg,rgba(66,122,67,0.22) 0%,rgba(90,158,91,0.07) 50%,transparent 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:1px;pointer-events:none;opacity:0;transition:opacity .35s}
        .lg-card:hover .lg-card-glow{opacity:1}.lg-card:hover{transform:translateY(-2px)}.lg-card{transition:transform .3s}
        .lg-type-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:7px}
        .lg-link{color:${G};font-weight:600;text-decoration:none}.lg-link:hover{text-decoration:underline;text-underline-offset:3px}
        .lg-left-panel{display:none}@media(min-width:1024px){.lg-left-panel{display:flex!important}}
        .mobile-brand{display:flex}@media(min-width:1024px){.mobile-brand{display:none!important}}
        @keyframes lg-spin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="lg-root" style={{ minHeight:"100vh", position:"relative", overflow:"hidden", display:"flex", background:bg }}>
        <div className="lg-grid" style={{ position:"absolute", inset:0, zIndex:0 }} />
        <div className="lg-orb" style={{ width:680, height:680, top:-180, left:-160, zIndex:0, background: D ? "radial-gradient(circle,rgba(66,122,67,0.22) 0%,transparent 70%)" : "radial-gradient(circle,rgba(66,122,67,0.10) 0%,transparent 70%)" }} />
        <div className="lg-orb" style={{ width:480, height:480, bottom:-120, right:-80, zIndex:0, background: D ? "radial-gradient(circle,rgba(66,122,67,0.14) 0%,transparent 70%)" : "radial-gradient(circle,rgba(66,122,67,0.07) 0%,transparent 70%)" }} />

        {/* LEFT PANEL */}
        <div style={{ flexDirection:"column", justifyContent:"space-between", width:"48%", padding:"48px 52px", position:"relative", zIndex:10, borderRight:`1px solid ${D?"rgba(255,255,255,0.05)":"rgba(66,122,67,0.10)"}`, overflowY:"auto" }} className="lg-left-panel">
          <div className="lg-fu-1" style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:13, background:`linear-gradient(135deg,#2d5630,${G})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(66,122,67,0.30)" }}>
              <GraduationCap size={19} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize:16, color:G, lineHeight:1 }}>CodingClub</p>
              <p style={{ fontSize:10, color:mu, marginTop:2, fontWeight:500 }}>O'quv Markazi</p>
            </div>
          </div>

          <div style={{ margin:"40px 0" }}>
            <div className="lg-fu-2" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 12px", borderRadius:99, marginBottom:28, background: D?"rgba(66,122,67,0.12)":"rgba(66,122,67,0.08)", border:`1px solid ${D?"rgba(66,122,67,0.28)":"rgba(66,122,67,0.18)"}` }}>
              <span className="lg-pulse-dot" style={{ width:7, height:7, borderRadius:"50%", background:G, display:"inline-block" }} />
              <span style={{ fontSize:11, fontWeight:700, color:G, letterSpacing:"0.04em" }}>Boshqaruv tizimi — faol</span>
            </div>
            <h2 className="lg-fu-3" style={{ fontSize:34, fontWeight:800, lineHeight:1.12, letterSpacing:"-0.02em", marginBottom:14, color:tx }}>
              CodingClub<br />
              <span style={{ color:G }}>O'quv Markazi</span><br />
              <span style={{ fontWeight:400, fontSize:28, color: D?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.22)" }}>Boshqaruv Paneli</span>
            </h2>
            <p className="lg-fu-3" style={{ fontSize:13.5, lineHeight:1.7, marginBottom:32, maxWidth:300, color:mu }}>
              Guruhlar, o'qituvchilar va o'quvchilarni bitta qulay tizimdan boshqaring.
            </p>
            <div className="lg-fu-4" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:32 }}>
              {statItems.map(({ icon:Icon, label, value, suffix }, i) => (
                <div key={label} className="lg-stat" style={{ background: D?"rgba(66,122,67,0.09)":"rgba(66,122,67,0.06)", border:`1px solid ${D?"rgba(66,122,67,0.16)":"rgba(66,122,67,0.12)"}`, animation:`lg-up 0.5s ease ${0.28+i*0.07}s both` }}>
                  <Icon size={14} color={G} style={{ marginBottom:8 }} />
                  <p style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.02em", color:tx, lineHeight:1 }}>
                    {statsLoaded ? <Counter target={value} suffix={suffix} /> : <span style={{ opacity:0.3 }}>—</span>}
                  </p>
                  <p style={{ fontSize:11, marginTop:4, color:mu, fontWeight:500 }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="lg-fu-5">
              {features.map(({ icon:Icon, title, desc }, i) => (
                <div key={i} className="lg-feat" style={{ borderColor: D?"rgba(255,255,255,0.05)":"rgba(66,122,67,0.08)" }}>
                  <div className="lg-feat-icon" style={{ background: D?"rgba(66,122,67,0.12)":"rgba(66,122,67,0.08)" }}>
                    <Icon size={15} color={G} />
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:tx }}>{title}</p>
                    <p style={{ fontSize:12, marginTop:2, color:mu, lineHeight:1.55 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="lg-fu-5" style={{ fontSize:12, color: D?"rgba(255,255,255,0.15)":"#ccc" }}>© {new Date().getFullYear()} CodingClub. Barcha huquqlar himoyalangan.</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", zIndex:10 }}>
          <div style={{ width:"100%", maxWidth:400 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }} className="lg-fu-1 mobile-brand">
              <div style={{ width:36, height:36, borderRadius:11, background:`linear-gradient(135deg,#2d5630,${G})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(66,122,67,0.28)" }}>
                <GraduationCap size={16} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize:15, color:G, lineHeight:1 }}>CodingClub</p>
                <p style={{ fontSize:10, color:mu, marginTop:1, fontWeight:500 }}>O'quv Markazi Boshqaruv Tizimi</p>
              </div>
            </div>

            <div className="lg-card" style={{ borderRadius:22, padding:"32px 32px 28px", background:cardBg, border:`1px solid ${cardBrd}`, boxShadow: D?"0 24px 80px rgba(0,0,0,0.70)":"0 8px 48px rgba(66,122,67,0.10),inset 0 1px 0 rgba(255,255,255,1)", position:"relative" }}>
              <div className="lg-card-glow" />
              <div className="lg-fu-1" style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:9, background:"rgba(66,122,67,0.10)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <GraduationCap size={14} color={G} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:mu, letterSpacing:"0.05em" }}>CODINGCLUB ADMIN</span>
                </div>
                <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", color:tx, marginBottom:5 }}>Tizimga kirish</h1>
                <p style={{ fontSize:13, color:mu, lineHeight:1.6 }}>Telefon yoki email bilan kirish - role bo'yicha avtomatik panelga yuboriladi</p>
              </div>

              {error && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:20, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)" }}>
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0, marginTop:1 }} />
                  <span style={{ fontSize:13, color:"#ef4444", lineHeight:1.5 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="lg-f1">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <label style={{ fontSize:10, fontWeight:800, color:mu, textTransform:"uppercase", letterSpacing:"0.07em" }}>Telefon yoki Email</label>
                    {formData.identifier && (
                      <span className="lg-type-badge" style={{ background: isEmail?"rgba(59,130,246,0.10)":"rgba(66,122,67,0.10)", color: isEmail?"#3b82f6":G, border:`1px solid ${isEmail?"rgba(59,130,246,0.20)":"rgba(66,122,67,0.20)"}` }}>
                        {isEmail ? <><Mail size={9}/> Email</> : <><Phone size={9}/> Telefon</>}
                      </span>
                    )}
                  </div>
                  <div className="lg-inp" style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, background:inpBg(focused==="identifier"), border:`1px solid ${inpBrd(focused==="identifier")}`, boxShadow:inpShadow(focused==="identifier") }}>
                    {isEmail
                      ? <Mail size={15} color={focused==="identifier"?G:mu} style={{ flexShrink:0, transition:"color .15s" }}/>
                      : <Phone size={15} color={focused==="identifier"?G:mu} style={{ flexShrink:0, transition:"color .15s" }}/>
                    }
                    <input type="text" required value={formData.identifier}
                      onChange={e => setFormData({...formData, identifier:e.target.value})}
                      onFocus={() => setFocused("identifier")} onBlur={() => setFocused("")}
                      placeholder="+998901234567 yoki email@gmail.com" autoComplete="username"
                      style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:tx }}
                    />
                  </div>
                </div>

                <div className="lg-f2">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <label style={{ fontSize:10, fontWeight:800, color:mu, textTransform:"uppercase", letterSpacing:"0.07em" }}>Parol</label>
                    <a href="#" className="lg-link" style={{ fontSize:12 }}>Unutdingizmi?</a>
                  </div>
                  <div className="lg-inp" style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, background:inpBg(focused==="password"), border:`1px solid ${inpBrd(focused==="password")}`, boxShadow:inpShadow(focused==="password") }}>
                    <Lock size={15} color={focused==="password"?G:mu} style={{ flexShrink:0, transition:"color .15s" }}/>
                    <input type={showPass?"text":"password"} required value={formData.password}
                      onChange={e => setFormData({...formData, password:e.target.value})}
                      onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                      placeholder="••••••••" autoComplete="current-password"
                      style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:tx }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:mu, flexShrink:0, padding:0, transition:"color .15s" }}
                      onMouseOver={e => e.currentTarget.style.color=G}
                      onMouseOut={e => e.currentTarget.style.color=mu}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                <div className="lg-f3" style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <input type="checkbox" id="remember" style={{ accentColor:G, width:16, height:16, cursor:"pointer" }}/>
                  <label htmlFor="remember" style={{ fontSize:13, color:mu, cursor:"pointer", userSelect:"none" }}>Eslab qolish</label>
                </div>

                <div className="lg-fb">
                  <button type="submit" disabled={isLoading} className="lg-btn" style={{ width:"100%", padding:"13px", borderRadius:13, border:"none", cursor:isLoading?"not-allowed":"pointer", background:`linear-gradient(135deg,#2d5630 0%,${G} 60%,#5a9e5b 100%)`, boxShadow:"0 4px 20px rgba(66,122,67,0.40),inset 0 1px 0 rgba(255,255,255,0.15)", fontSize:14, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:isLoading?.65:1 }}>
                    {isLoading ? (
                      <><div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"lg-spin .8s linear infinite" }}/> Kirilmoqda...</>
                    ) : (
                      <>Tizimga Kirish <ArrowRight size={15} className="lg-arrow"/></>
                    )}
                  </button>
                </div>
              </form>

              <div className="lg-ff" style={{ display:"flex", alignItems:"center", gap:14, margin:"22px 0" }}>
                <div className="lg-divider" style={{ background: D?"rgba(255,255,255,0.06)":"rgba(66,122,67,0.10)" }}/>
                <span style={{ fontSize:11, color:mu, whiteSpace:"nowrap" }}>yoki</span>
                <div className="lg-divider" style={{ background: D?"rgba(255,255,255,0.06)":"rgba(66,122,67,0.10)" }}/>
              </div>

              <p className="lg-ff" style={{ textAlign:"center", fontSize:13, color:mu }}>
                Akkauntingiz yo'qmi?{" "}
                <a href="/register" className="lg-link">Ro'yxatdan o'ting</a>
                <span style={{ margin:"0 6px", opacity:0.4 }}>|</span>
                <a href="/teacher-login" className="lg-link">O'qituvchi kirish</a>
              </p>
            </div>

            <p className="lg-ff" style={{ textAlign:"center", fontSize:11, color: D?"rgba(255,255,255,0.14)":"#ccc", marginTop:18 }}>
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