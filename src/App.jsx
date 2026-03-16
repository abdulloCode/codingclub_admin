import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ApiErrorBoundary from './components/ApiErrorBoundary';

// Sahifalar
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherLogin from './pages/TeacherLogin';
import TeacherRegister from './pages/TeacherRegister';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Teachers from './pages/Teachers';
import Student from './pages/Student';
import Groups from './pages/Groups';
import Courses from './pages/Courses';
import TeacherPanel from './pages/TeacherPanel';
import AdminLayout from './components/AdminLayout';
import TeacherLayout from './components/TeacherLayout';
import Layout from './components/Layout';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ImageLoader from './components/ImageLoader';

// --- Himoya komponentlari ---
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
    <ImageLoader size={60} text="Yuklanmoqda..." />
  </div>
);

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/profile" />;
  return children;
};

const TeacherRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/teacher-login" />;
  if (user?.role !== 'teacher') return <Navigate to="/profile" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin-panel" />;
    if (user?.role === 'teacher') return <Navigate to="/teachers" />;
    return <Navigate to="/profile" />;
  }
  return children;
};

function App() {
  return (
    <ApiErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Ochiq marshrutlar (Login/Register) */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/teacher-login" element={<PublicRoute><TeacherLogin /></PublicRoute>} />
                <Route path="/teacher-register" element={<PublicRoute><TeacherRegister /></PublicRoute>} />

                {/* Himoyalangan va AdminLayout ichidagi marshrutlar */}
                <Route
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  {/* AdminLayout ichidagi 'Outlet' o'rniga tushadigan sahifalar */}
                  <Route path="/admin-panel" element={<AdminPanel />} />
                  <Route path="/teachers" element={<Teachers />} />
                  <Route path="/students" element={<Student />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* O'qituvchi uchun marshrutlar */}
                <Route
                  element={
                    <TeacherRoute>
                      <TeacherLayout />
                    </TeacherRoute>
                  }
                >
                  <Route path="/teacher-panel" element={<TeacherPanel />} />
                </Route>

                {/* Redirectlar */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/admin-panel" />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </ApiErrorBoundary>
  );
}

export default App;