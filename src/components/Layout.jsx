import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Reports from '../pages/Reports';
import Teachers from '../pages/Teachers';
import Student from '../pages/Student';
import Groups from '../pages/Groups';
import Courses from '../pages/Courses';
import AdminPanel from '../pages/AdminPanel';

export default function Layout() {
  const location = useLocation();
  const renderContent = () => {
    const path = location.pathname;

    if (path.startsWith('/profile')) {
      return <Profile />;
    } else if (path.startsWith('/teachers')) {
      return <Teachers />;
    } else if (path.startsWith('/students')) {
      return <Student />;
    } else if (path.startsWith('/groups')) {
      return <Groups />;
    } else if (path.startsWith('/courses')) {
      return <Courses />;
    } else if (path.startsWith('/settings')) {
      return <Settings />;
    } else if (path.startsWith('/reports')) {
      return <Reports />;
    } else if (path.startsWith('/admin-panel')) {
      return <AdminPanel />;
    }

    return <Outlet />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-0 md:pt-16 pb-20 md:pb-0">
        {renderContent()}
      </div>
    </div>
  );
}
