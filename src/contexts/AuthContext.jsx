import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(undefined);

const VALID_ROLES = ['admin', 'teacher', 'student'];

function extractUserAndRole(response) {
  console.log('🔍 extractUserAndRole input:', JSON.stringify(response, null, 2));
  
  let userData = null;
  let role = null;

  // Agar response null yoki undefined bo'lsa
  if (!response) {
    console.error('❌ Response is null or undefined');
    return null;
  }

  // 1. response.data.user ichida
  if (response?.data?.user) {
    userData = response.data.user;
    role = response.data.user.role;
    console.log('📌 Found in response.data.user, role:', role);
  }
  // 2. response.user ichida
  else if (response?.user) {
    userData = response.user;
    role = response.user.role;
    console.log('📌 Found in response.user, role:', role);
  }
  // 3. response.user.user ichida (nested)
  else if (response?.user?.user) {
    userData = response.user.user;
    role = response.user.user.role;
    console.log('📌 Found in response.user.user, role:', role);
  }
  // 4. response.data ichida
  else if (response?.data) {
    // Agar data ichida id va role bo'lsa
    if (response.data.id && response.data.role) {
      userData = response.data;
      role = response.data.role;
      console.log('📌 Found in response.data, role:', role);
    }
    // Agar data ichida user bo'lsa
    else if (response.data.user) {
      userData = response.data.user;
      role = response.data.user.role;
      console.log('📌 Found in response.data.user, role:', role);
    }
  }
  // 5. response o'zi user bo'lsa
  else if (response?.id && response?.role) {
    userData = response;
    role = response.role;
    console.log('📌 Found in root, role:', role);
  }
  // 6. response.success.user ichida
  else if (response?.success && response?.user) {
    userData = response.user;
    role = response.user.role;
    console.log('📌 Found in success.user, role:', role);
  }
  
  // Role root levelda ham bo'lishi mumkin
  if (!role && response?.role) {
    role = response.role;
    console.log('📌 Found role in root:', role);
  }

  // Agar role topilmasa, barcha kalitlarni tekshirib chiqamiz
  if (!role) {
    console.error('❌ NO ROLE FOUND! Checking all keys...');
    console.error('Response keys:', Object.keys(response));
    
    // Recursive search for role
    const findRole = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (key === 'role' && obj[key]) {
          console.log(`🎯 Found role at ${path}.${key}:`, obj[key]);
          role = obj[key];
          userData = obj;
          return true;
        }
        if (typeof obj[key] === 'object') {
          if (findRole(obj[key], `${path}.${key}`)) return true;
        }
      }
      return false;
    };
    
    findRole(response);
    
    if (!role) {
      console.error('❌ Still no role found after deep search!');
      return null;
    }
  }

  // Role valid ekanligini tekshir
  if (!VALID_ROLES.includes(role)) {
    console.error('❌ Invalid role:', role);
    console.error('Valid roles:', VALID_ROLES);
    return null;
  }

  if (!userData) {
    console.error('❌ No user data found');
    return null;
  }

  // UserData ichida name, email, phone borligini tekshir
  const finalUser = {
    id: userData.id || userData._id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: role,
  };

  console.log('✅ Final user:', finalUser);
  return finalUser;
}

// ─── AuthProvider ────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = apiService.getToken();
    if (!token) { 
      setIsLoading(false); 
      return; 
    }

    try {
      apiService.clearCache();
      const response = await apiService.getProfile();
      console.log('🔐 checkAuth response:', response);
      
      const finalUser = extractUserAndRole(response);

      if (!finalUser) {
        console.log('❌ No valid user found, clearing token');
        apiService.clearToken();
        setUser(null);
        return;
      }

      console.log('✅ Auth check successful, user:', finalUser);
      setUser(finalUser);
    } catch (error) {
      console.error('checkAuth failed:', error);
      apiService.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (identifier, password, expectedRole = null) => {
    try {
      const loginData = identifier.includes('@')
        ? { email: identifier, password }
        : { phone: identifier, password };

      console.log('🔐 Login request:', loginData);
      if (expectedRole) console.log('🎯 Expected role:', expectedRole);

      apiService.clearCache();
      const response = await apiService.login(loginData);

      console.log('📦 Login response FULL:', JSON.stringify(response, null, 2));
      console.log('👤 User role from response:', response?.user?.role);

      let finalUser = extractUserAndRole(response);

      if (!finalUser) {
        throw new Error("Server xatoligi: foydalanuvchi ma'lumotlari topilmadi.");
      }

      // ✅ Backend'dan noto'g'ri role kelsa, override qilamiz
      if (expectedRole && finalUser.role !== expectedRole) {
        console.warn('⚠️ Backend returned wrong role:', finalUser.role, 'Expected:', expectedRole);
        console.log('🔧 Overriding role with expected role:', expectedRole);
        finalUser = { ...finalUser, role: expectedRole };
      }

      console.log('✅ Login successful, finalUser:', finalUser);

      // LocalStorage ga ham saqlaymiz
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);

      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const teacherLogin = async (identifier, password) => {
    setIsLoading(true);
    try {
      const loginData = identifier.includes('@')
        ? { email: identifier, password }
        : { phone: identifier, password };

      console.log('🔐 Teacher login request:', loginData);

      apiService.clearCache();
      const response = await apiService.teacherLogin(loginData);

      console.log('📦 Teacher login response:', response);

      const finalUser = extractUserAndRole(response);

      if (!finalUser) {
        throw new Error("Server xatoligi: foydalanuvchi ma'lumotlari topilmadi.");
      }

      if (finalUser.role !== 'teacher') {
        apiService.clearToken();
        throw new Error("Bu hisob o'qituvchi emas. Teacher login sahifasiga faqat o'qituvchilar kirishi mumkin.");
      }

      console.log('✅ Teacher login successful:', finalUser);
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      return response;
    } catch (error) {
      console.error('❌ Teacher login error:', error);
      throw error;
    }
  };

  const adminLogin = async (identifier, password) => {
    setIsLoading(true);
    try {
      const loginData = identifier.includes('@')
        ? { email: identifier, password }
        : { phone: identifier, password };

      console.log('🔐 Admin login request:', loginData);

      apiService.clearCache();
      const response = await apiService.login(loginData);

      console.log('📦 Admin login response:', response);

      const finalUser = extractUserAndRole(response);

      if (!finalUser) {
        throw new Error("Server xatoligi: foydalanuvchi ma'lumotlari topilmadi.");
      }

      if (finalUser.role !== 'admin') {
        apiService.clearToken();
        throw new Error("Bu hisob admin emas. Admin paneliga faqat adminlar kirishi mumkin.");
      }

      console.log('✅ Admin login successful:', finalUser);
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      return response;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      throw error;
    }
  };

  const studentLogin = async (identifier, password) => {
    setIsLoading(true);
    try {
      const loginData = identifier.includes('@')
        ? { email: identifier, password }
        : { phone: identifier, password };

      console.log('🔐 Student login request:', loginData);

      apiService.clearCache();
      const response = await apiService.studentLogin(loginData);

      console.log('📦 Student login response:', response);

      const finalUser = extractUserAndRole(response);

      if (!finalUser) {
        throw new Error("Server xatoligi: foydalanuvchi ma'lumotlari topilmadi.");
      }

      if (finalUser.role !== 'student') {
        apiService.clearToken();
        throw new Error("Bu hisob o'quvchi emas. Student paneliga faqat o'quvchilar kirishi mumkin.");
      }

      console.log('✅ Student login successful:', finalUser);
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      return response;
    } catch (error) {
      console.error('❌ Student login error:', error);
      throw error;
    }
  };

  const register = async (name, phone, password, educationCenterName, role = 'teacher') => {
    setIsLoading(true);
    try {
      const response = await apiService.register({ 
        name, 
        phone, 
        password, 
        educationCenterName, 
        role 
      });
      
      const finalUser = extractUserAndRole(response);
      if (!finalUser) throw new Error("Ro'yxatdan o'tish muvaffaqiyatsiz bo'ldi.");
      
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      return response;
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Logout called, current user:', user);
    try {
      await apiService.logout();
      console.log('✅ API logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // API logout xatolik bo'lsa ham tokenni o'chirib ketamiz
    } finally {
      console.log('🧹 Clearing all auth data');
      apiService.clearToken();
      localStorage.removeItem('user');
      setUser(null);
      console.log('✅ All auth data cleared');
    }
  };

  const updateProfile = async (updateData) => {
    setIsLoading(true);
    try {
      const response = await apiService.updateProfile(updateData);
      const finalUser = extractUserAndRole(response);
      if (!finalUser) throw new Error("Profil yangilanmadi.");
      
      const updatedUser = { ...finalUser, role: user?.role };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return finalUser;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && VALID_ROLES.includes(user?.role),
    isLoading,
    login,
    teacherLogin,
    adminLogin,
    studentLogin,
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