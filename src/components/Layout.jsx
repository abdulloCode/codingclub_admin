import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Profile from './Profile';
import Settings from './Settings';
import Reports from './Reports';
import Teachers from './Teachers';
import Student from './student';
import Groups from './Groups';
import Courses from './Courses';
import AdminPanel from './AdminPanel';

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
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
}
