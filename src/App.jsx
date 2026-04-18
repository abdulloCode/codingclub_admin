  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { lazy, Suspense } from 'react';
  import { AuthProvider, useAuth } from './contexts/AuthContext';
  import { ThemeProvider } from './contexts/ThemeContext';
  import { ToastProvider } from './contexts/ToastContext';
  import { SidebarProvider } from './contexts/SidebarContext';
  import ApiErrorBoundary from './components/ApiErrorBoundary';
  import ImageLoader from './components/ImageLoader';

  // Lazy loading for better performance
  const Login = lazy(() => import('./pages/auth/Login'));
  const Register = lazy(() => import('./pages/auth/Register'));
  const TeacherLogin = lazy(() => import('./pages/teacher/TeacherLogin'));
  const TeacherRegister = lazy(() => import('./pages/teacher/TeacherRegister'));
  const StudentLogin = lazy(() => import('./pages/student/StudentLogin'));
  const Profile = lazy(() => import('./pages/profile/Profile'));
  const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
  const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
  const Teachers = lazy(() => import('./pages/teachers/Teachers'));
  const StudentPanel = lazy(() => import('./pages/student/StudentPanel'));
  const Groups = lazy(() => import('./pages/group/Groups'));
  const Courses = lazy(() => import('./pages/courses/Courses'));
  const TeacherPanel = lazy(() => import('./pages/teacher/TeacherPanel'));
  const TeacherGroups = lazy(() => import('./pages/teacher/TeacherGroups'));
  const AdminLayout = lazy(() => import('./components/AdminLayout'));
  const TeacherLayout = lazy(() => import('./components/TeacherLayout'));
  const Layout = lazy(() => import('./components/Layout'));
  const Settings = lazy(() => import('./pages/payment/Settings'));
  const Reports = lazy(() => import('./pages/payment/Reports'));
  const Attendance = lazy(() => import('./pages/attendance/Attendance'));
  const PaymentDashboard = lazy(() => import('./pages/payment/PaymentDashboard'));
  const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
  const TeacherPayments = lazy(() => import('./pages/teacher/TeacherPayments'));
  const StudentPayments = lazy(() => import('./pages/student/StudentPayments'));
  // Agar faylingiz src/pages/student/Student.jsx bo'lsa:
const Student = lazy(() => import('./pages/student/Student.jsx'));


  const LoadingScreen = ({ message = "Yuklanmoqda..." }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F8FAFF] to-[#F0F4FF]">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
        <ImageLoader size={60} />
      </div>
      <p className="mt-6 text-sm font-semibold text-slate-600 animate-pulse">{message}</p>
    </div>
  );

  // Route-specific loading screens
  const RouteLoader = ({ message = "Sahifa yuklanmoqda..." }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
      <div className="text-center">
        <ImageLoader size={50} />
        <p className="mt-4 text-sm font-semibold text-slate-600">{message}</p>
      </div>
    </div>
  );

  // AdminRoute ichida (mavjud kod to'g'ri, faqat replace qo'shing)
  const AdminRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') {
      if (user?.role === 'teacher') return <Navigate to="/teacher-panel" replace />;
      if (user?.role === 'student') return <Navigate to="/students-panel" replace />;
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const TeacherRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/teacher-login" replace />;
    if (user?.role !== 'teacher') {
      if (user?.role === 'admin') return <Navigate to="/admin-panel" replace />;
      if (user?.role === 'student') return <Navigate to="/students-panel" replace />;
      return <Navigate to="/teacher-login" replace />;
    }
    return children;
  };

  const StudentRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) return <LoadingScreen />;

    // Faqat authenticated student roliga ruxsat
    if (!isAuthenticated) {
      console.log("StudentRoute: User not authenticated, redirecting to login");
      return <Navigate to="/login" />;
    }

    if (user?.role !== 'student') {
      console.log("StudentRoute: User is not student, role:", user?.role);
      // Agar u student bo'lmasa, mos panelga yuborish
      if (user?.role === 'admin') return <Navigate to="/admin-panel" />;
      if (user?.role === 'teacher') return <Navigate to="/teacher-panel" />;
      // Role aniqlanmagan bo'lsa login sahifaga
      return <Navigate to="/login" />;
    }

    console.log("StudentRoute: Student access granted for user:", user?.id || user?.phone || user?.email);
    return children;
  };

  const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (isAuthenticated) {
      console.log("PublicRoute: User already authenticated with role:", user?.role, "redirecting");
      // Rolga qarab mos panelga yuborish
      if (user?.role === 'admin') return <Navigate to="/admin-panel" replace />;
      if (user?.role === 'teacher') return <Navigate to="/teacher-panel" replace />;
      if (user?.role === 'student') return <Navigate to="/students-panel" replace />;
      // Agar role aniqlanmagan bo'lsa, tokenni o'chirib login sahifada qoladi
      return children;
    }
    return children;
  };

  // Suspense wrapper for lazy-loaded routes
  const SuspenseRoute = ({ children, message }) => (
    <Suspense fallback={<RouteLoader message={message} />}>
      {children}
    </Suspense>
  );

  function App() {
    return (
      <>
        <AppStyles />
        <ApiErrorBoundary>
          <ToastProvider>
            <ThemeProvider>
              <AuthProvider>
                <Router>
                  <Suspense fallback={<LoadingScreen message="Ilova yuklanmoqda..." />}>
                    <Routes>
                      {/* Universal Login/Register */}
                      <Route path="/login" element={<PublicRoute><SuspenseRoute><Login /></SuspenseRoute></PublicRoute>} />
                      <Route path="/register" element={<PublicRoute><SuspenseRoute><Register /></SuspenseRoute></PublicRoute>} />

                      {/* Role-specific register pages */}
                      <Route path="/teacher-register" element={<SuspenseRoute><TeacherRegister /></SuspenseRoute>} />

                      {/* Legacy redirects - barcha login sahifalari umumiy login sahifasiga yo'naltiriladi */}
                      <Route path="/teacher-login" element={<Navigate to="/login" replace />} />
                      <Route path="/student-login" element={<Navigate to="/login" replace />} />

                      {/* Himoyalangan va AdminLayout ichidagi marshrutlar */}
                      <Route
                        element={
                          <AdminRoute>
                            <Suspense fallback={<RouteLoader message="Boshqaruv paneli yuklanmoqda..." />}>
                              <AdminLayout />
                            </Suspense>
                          </AdminRoute>
                        }
                      >
                        {/* AdminLayout ichidagi 'Outlet' o'rniga tushadigan sahifalar */}
                        <Route path="/admin-panel" element={<SuspenseRoute message="Dashboard yuklanmoqda..."><AdminPanel /></SuspenseRoute>} />

                        <Route path="/student" element={<SuspenseRoute message="O'quvchi yuklanmoqda..."><Student /></SuspenseRoute>} />
                        <Route path="/teachers" element={<SuspenseRoute message="O'qituvchilar yuklanmoqda..."><Teachers /></SuspenseRoute>} />
                        <Route path="/groups" element={<SuspenseRoute message="Guruhlar yuklanmoqda..."><Groups /></SuspenseRoute>} />
                        <Route path="/courses" element={<SuspenseRoute message="Kurslar yuklanmoqda..."><Courses /></SuspenseRoute>} />
                        <Route path="/attendance" element={<SuspenseRoute message="Davomat yuklanmoqda..."><Attendance /></SuspenseRoute>} />
                        <Route path="/payment-dashboard" element={<SuspenseRoute message="To'lov dashboard yuklanmoqda..."><PaymentDashboard /></SuspenseRoute>} />
                        <Route path="/admin-payments" element={<SuspenseRoute message="Admin to'lovlari yuklanmoqda..."><AdminPayments /></SuspenseRoute>} />
                        <Route path="/reports" element={<SuspenseRoute message="Hisobotlar yuklanmoqda..."><Reports /></SuspenseRoute>} />
                        <Route path="/settings" element={<SuspenseRoute message="Sozlamalar yuklanmoqda..."><Settings /></SuspenseRoute>} />
                        <Route path="/profile" element={<SuspenseRoute message="Profil yuklanmoqda..."><Profile /></SuspenseRoute>} />
                      </Route>

                      {/* O'qituvchi uchun marshrutlar */}
                      <Route path="/teacher-panel" element={<TeacherRoute><SuspenseRoute message="Panel yuklanmoqda..."><TeacherPanel /></SuspenseRoute></TeacherRoute>} />
                      <Route
                        element={
                          <TeacherRoute>
                            <Suspense fallback={<RouteLoader message="O'qituvchi paneli yuklanmoqda..." />}>
                              <TeacherLayout />
                            </Suspense>
                          </TeacherRoute>
                        }
                      >
                        <Route path="/teacher-groups" element={<SuspenseRoute message="Guruhlarim yuklanmoqda..."><TeacherGroups /></SuspenseRoute>} />
                        <Route path="/teacher-attendance" element={<SuspenseRoute message="Davomat yuklanmoqda..."><Attendance /></SuspenseRoute>} />
                        <Route path="/teacher-payments" element={<SuspenseRoute message="To'lovlaringiz yuklanmoqda..."><TeacherPayments /></SuspenseRoute>} />
                        <Route path="/teacher-homework" element={<SuspenseRoute message="Topshiriqlar yuklanmoqda..."><TeacherPanel /></SuspenseRoute>} />
                        <Route path="/teacher-grading" element={<SuspenseRoute message="Baholash yuklanmoqda..."><TeacherPanel /></SuspenseRoute>} />
                        <Route path="/settings" element={<SuspenseRoute message="Sozlamalar yuklanmoqda..."><Settings /></SuspenseRoute>} />
                      </Route>


                      <Route path="/students-panel" element={<StudentRoute><SuspenseRoute message="O'quchi paneli yuklanmoqda..."><StudentPanel /></SuspenseRoute></StudentRoute>} />
                      <Route path="/student-payments" element={<StudentRoute><SuspenseRoute message="To'lovlaringiz yuklanmoqda..."><StudentPayments /></SuspenseRoute></StudentRoute>} />

                      {/* Admin students management */}
                      <Route path="/admin-students" element={<AdminRoute><SuspenseRoute message="O'quvchilar yuklanmoqda..."><AdminStudents /></SuspenseRoute></AdminRoute>} />

                      {/* Redirectlar */}
                      <Route path="/" element={<Navigate to="/login" />} />
                      <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                  </Suspense>
                </Router>
              </AuthProvider>
            </ThemeProvider>
          </ToastProvider>
        </ApiErrorBoundary>
      </>
    );
  }

  // Global styles for smooth transitions
  const AppStyles = () => (
    <style>{`
      * {
        -webkit-tap-highlight-color: transparent;
      }
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Hide scrollbars on mobile */
      @media (max-width: 1024px) {
        *::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      }

      /* Mobile-first responsive styles */
      @media (max-width: 768px) {
        body {
          font-size: 14px;
        }
      }
      @media (max-width: 480px) {
        body {
          font-size: 13px;
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .route-transition {
        animation: fadeIn 0.3s ease-in-out, slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      /* Loading skeleton animation */
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    `}</style>
  );

  export default App;
