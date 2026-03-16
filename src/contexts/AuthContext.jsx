import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(undefined);

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
      const response = await apiService.getProfile();
      setUser(response.user || response.admin || response);
    } catch (error) {
      console.error("Auth check failed:", error);
      apiService.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Backend: POST /api/auth/login → { phone?, email?, password }
  const login = async (phone, password) => {
    const res = await apiService.login({ phone, password });
    console.log("Login response:", res);
    console.log("Setting user:", res.user || res.admin);
    setUser(res.user || res.admin);
    return res;
  };

  // ✅ Backend: POST /api/auth/register → { phone, password, name?, educationCenterName? }
  const register = async (name, phone, password, educationCenterName) => {
    const res = await apiService.register({ name, phone, password, educationCenterName });
    console.log("Register response:", res);
    console.log("Setting user:", res.user || res.admin);
    setUser(res.user || res.admin);
    return res;
  };

  // ✅ Backend: POST /api/auth/logout
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout xatolik:', err);
    } finally {
      setUser(null);
    }
  };

  // ✅ Backend: PUT /api/auth/me
  const updateProfile = async (updateData) => {
    try {
      const res = await apiService.updateProfile(updateData);
      const updatedUser = res.user || res.admin || res;
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Profilni yangilashda xatolik:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth AuthProvider ichida ishlatilishi shart!");
  return context;
};