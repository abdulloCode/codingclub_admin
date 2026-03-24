import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserData = (response) => {
    // Backend response structure bo'yicha user ma'lumotlarini olish
    console.log("=== GET USER DATA START ===");
    console.log("getUserData - response:", response);
    console.log("getUserData - response keys:", Object.keys(response));

    // API documentation bo'yicha: { user: {...}, accessToken: "..." }
    // Backend response strukturasini tekshirish uchun user data birinchi yoki role based fields

    // ── Option 1: User field (API documentation bo'yicha) ───────────
    if (response.user) {
      console.log("✅ getUserData - found user field (API compliant)");
      return response.user;
    }

    // ── Option 2: Role based fields (backend response strukturasiga moslash) ─────────
    if (response.admin && response.admin.role) {
      console.log("✅ getUserData - found admin field with role:", response.admin.role);
      return response.admin;
    }
    if (response.teacher && response.teacher.role) {
      console.log("✅ getUserData - found teacher field with role:", response.teacher.role);
      return response.teacher;
    }
    if (response.student && response.student.role) {
      console.log("✅ getUserData - found student field with role:", response.student.role);
      return response.student;
    }

    // ── Option 3: Fallback (eski backend strukturasiga moslash) ─────────────
    if (response.id || response.phone || response.email || response.name) {
      console.log("⚠️  getUserData - response itself is user object (fallback)");
      return response;
    }

    console.error("❌ getUserData - no user data found in any response format");
    return null;
  };

  const detectRole = (userData, response) => {
    // Backend response structure bo'yicha role "user.role" ichida bo'ladi
    console.log("=== DETECT ROLE START ===");
    console.log("detectRole - userData:", userData);
    console.log("detectRole - response:", response);
    console.log("detectRole - response keys:", Object.keys(response));

    // ── STEP 1: userData.role tekshiruvi ─────────────────────
    if (userData?.role) {
      const validRoles = ['admin', 'teacher', 'student'];
      if (validRoles.includes(userData.role)) {
        console.log("✅ detectRole - found valid role in userData.role:", userData.role);
        return userData.role;
      }
      console.warn("⚠️  detectRole - invalid role in userData.role:", userData.role);
    }

    // ── STEP 2: Alternative role sources (backend structure variation) ──────────
    if (response?.user?.role) {
      const validRoles = ['admin', 'teacher', 'student'];
      if (validRoles.includes(response.user.role)) {
        console.log("✅ detectRole - found valid role in response.user.role:", response.user.role);
        return response.user.role;
      }
      console.warn("⚠️  detectRole - invalid role in response.user.role:", response.user.role);
    }

    // ── STEP 3: Fallback - field based detection (eski backend uchun) ──
    if (userData?.teacherId || userData?.isTeacher || response?.isTeacher) {
      console.log("✅ detectRole - detected teacher role from teacherId/isTeacher");
      return 'teacher';
    }
    if (userData?.studentId || userData?.isStudent || response?.isStudent) {
      console.log("✅ detectRole - detected student role from studentId/isStudent");
      return 'student';
    }
    if (userData?.adminId || userData?.isAdmin || response?.isAdmin) {
      console.log("✅ detectRole - detected admin role from adminId/isAdmin");
      return 'admin';
    }

    // ── STEP 4: Agar response o'zi user object bo'lsa ──────────────────
    if (response.id || response.phone || response.email || response.name) {
      // response o'zi user object, lekin role yo'q
      console.log("⚠️  detectRole - response is user object but has no role field");
      // Default - role aniqlanmasa, redirect qilmasligimiz kerak
      console.error("❌ detectRole - could not detect role in user object");
      return null;
    }

    // ── FINAL: Role aniqlanmasa ──────────────────────────────
    console.log("❌ detectRole - could not detect role from any source");
    console.log("=== DETECT ROLE END ===");
    return null;
  };

  const checkAuth = useCallback(async () => {
    console.log("=== CHECK AUTH START ===");
    const token = apiService.getToken();
    console.log("Token found:", !!token);

    if (!token) {
      console.log("No token, setting loading to false");
      setIsLoading(false);
      return;
    }

    try {
      apiService.clearCache();
      const response = await apiService.getProfile();
      console.log("GetProfile response:", response);

      const userData = getUserData(response);

      if (!userData) {
        console.error("No user data found in profile");
        apiService.clearToken();
        setUser(null);
        setIsLoading(false);
        return;
      }

      const role = detectRole(userData, response);
      console.log("Detected role:", role);

      if (!role) {
        console.error("Could not detect role, clearing token");
        apiService.clearToken();
        setUser(null);
        setIsLoading(false);
        return;
      }

      const finalUserData = { ...userData, role };
      console.log("Setting user with role:", role);

      setUser(finalUserData);
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log("=== CHECK AUTH END ===");
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Universal Login - Admin, Teacher, Student bitta funksiya
  const login = async (identifier, password) => {
    console.log("=== UNIVERSAL LOGIN START ===");
    console.log("Login identifier:", identifier);

    const loginData = identifier.includes('@')
      ? { email: identifier, password }
      : { phone: identifier, password };

    apiService.clearCache();

    const response = await apiService.login(loginData);
    console.log("Login response:", response);

    const userData = getUserData(response);

    if (!userData) {
      console.error("No user data found");
      throw new Error("Server xatoligi: Foydalanuvchi ma'lumotlari topilmadi");
    }

    const role = detectRole(userData, response);
    console.log("Detected role:", role);

    if (!role) {
      console.error("Role not detected");
      throw new Error("Server xatoligi: Hisob turi aniqlanmadi. Iltimos adminga murojaat qiling.");
    }

    // Valid role check
    const validRoles = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      console.error("Invalid role:", role);
      throw new Error("Noto'g'ri hisob turi. Iltimos adminga murojaat qiling.");
    }

    const finalUserData = { ...userData, role };
    console.log("Setting user with role:", role);
    console.log("=== UNIVERSAL LOGIN END ===");

    setUser(finalUserData);
    return response;
  };

  // TeacherLogin - TeacherLogin.jsx sahifasi uchun (eski API uchun)
  const teacherLogin = async (identifier, password) => {
    console.log("=== TEACHER LOGIN START ===");

    // Hozir bitta universal login ishlayapti, shuning uchun bu ham login'ni ishlatadi
    return await login(identifier, password);
  };

  const register = async (name, phone, password, educationCenterName) => {
    console.log("=== REGISTER START ===");
    console.log("Register data:", { name, phone, educationCenterName });

    const response = await apiService.register({ name, phone, password, educationCenterName });
    console.log("Register response:", response);

    // Backend'dan user ma'lumotlarini olish
    const userData = getUserData(response);
    console.log("User data from register:", userData);

    if (!userData) {
      console.error("No user data found in register response");
      throw new Error("Server xatoligi: Ro'yxatdan o'tish muvaffaqiyatsiz bo'ldi");
    }

    // Role ni aniqlash
    const role = detectRole(userData, response);
    console.log("Detected role from register:", role);

    if (!role) {
      console.error("Role not detected in register");
      throw new Error("Server xatoligi: Hisob turi aniqlanmadi");
    }

    // Valid role check
    const validRoles = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      console.error("Invalid role:", role);
      throw new Error("Noto'g'ri hisob turi: " + role);
    }

    const finalUserData = { ...userData, role };
    console.log("Setting user with role:", role);
    console.log("=== REGISTER END ===");

    // Ro'yxatdan o'tgandan keyin user state set qilinadi
    // Bu Register.jsx dagi useEffect to'g'ri ishlashi uchun zarur
    setUser(finalUserData);

    return response;
  };

  const logout = async () => {
    try { await apiService.logout(); }
    catch { apiService.clearToken(); }
    finally { setUser(null); }
  };

  const updateProfile = async (updateData) => {
    const response = await apiService.updateProfile(updateData);
    const userData = getUserData(response);
    if (!userData) throw new Error("Server xatoligi: Profil yangilanmadi");
    const finalUserData = { ...userData, role: user?.role };
    setUser(finalUserData);
    return finalUserData;
  };

  const value = {
    user,
    isAuthenticated: !!user && !!user.role && ['admin', 'teacher', 'student'].includes(user.role),
    isLoading,
    login,
    teacherLogin,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth AuthProvider ichida ishlatilishi shart!');
  return context;
};