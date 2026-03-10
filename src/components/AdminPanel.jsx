import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import {
  Settings, Users, BookOpen, Layers, DollarSign,
  TrendingUp, LogOut, ChevronRight, Grid3x3,
  Activity, ArrowUpRight, GraduationCap,
  BarChart3, PieChart, CalendarDays, Clock,
  CheckCircle, AlertCircle, CreditCard, UserPlus,
  Wallet, TrendingDown
} from 'lucide-react';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    students: { total: 0, active: 0, newThisMonth: 0 },
    teachers: { total: 0, active: 0, newThisMonth: 0 },
    groups: { total: 0, active: 0 },
    courses: { total: 0, active: 0 },
    revenue: 0,
    lastMonthRevenue: 0,
    recentPayments: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getDashboard();
      if (data) {
        setStats({
          ...data,
          revenue: data.revenue || 0,
          lastMonthRevenue: data.lastMonthRevenue || 0,
          attendanceRate: data.attendanceRate || 0
        });
      }
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  };

  const calculateRevenueChange = () => {
    if (stats.lastMonthRevenue === 0) return 0;
    const change = ((stats.revenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100;
    return change.toFixed(1);
  };

  const revenueChange = calculateRevenueChange();

  // const sections = [
  //   { id: 'overview', title: 'Dashbord', icon: Grid3x3, description: 'Umumiy ko\'rinish' },
  //   { id: 'teachers', title: 'O\'qituvchilar', icon: Users, description: 'O\'qituvchilarni boshqaruvi' },
  //   { id: 'students', title: 'O\'quvchilar', icon: Users, description: 'O\'quvchilarni boshqaruvi' },
  //   { id: 'groups', title: 'Guruhlar', icon: Layers, description: 'Guruhlar va dars jadvallari' },
  //   { id: 'courses', title: 'Kurslar', icon: BookOpen, description: 'O\'quv dasturchilari' },
  //   { id: 'settings', title: 'Sozlamalar', icon: Settings, description: 'Tizim sozlamalari' }
  // ];

  const features = [
    { title: 'O\'qituvchilar boshqaruvi', description: 'O\'qituvchilarni ro\'yxatini boshqaring', icon: Users, color: 'from-blue-500 to-indigo-600', action: 'Boshqarish', path: '/teachers' },
    { title: 'Guruhlar tashkil etish', description: 'Yangi guruhlar va dars jadvallari', icon: Layers, color: 'from-purple-500 to-purple-600', action: 'Tashkil etish', path: '/groups' },
    { title: 'Darslar monitoring', description: 'O\'qituvchilar va o\'quvchilar davomati', icon: Activity, color: 'from-emerald-500 to-teal-600', action: 'Monitoring', path: '/reports' },
    { title: 'Moliyaviy hisobot', description: 'Daromad va to\'lovlar statistikasi', icon: BarChart3, color: 'from-orange-500 to-red-600', action: 'Hisobot', path: '/reports' }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend, isPositive }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-500">{subtitle}</p>}
    </div>
  );

  const FeatureCard = ({ feature }) => {
    const Icon = feature.icon;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 group cursor-pointer transition-all">
        <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon size={28} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{feature.description}</p>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
          {feature.action} <ArrowUpRight size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.educationCenterName || 'O\'quv Markazi'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <CalendarDays size={18} className="text-slate-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title={isDarkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
            >
              {isDarkMode ? (
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white ml-0.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                </div>
              )}
            </button>

            <button
              onClick={() => {
                if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
                  logout();
                }
              }}
              className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              title="Chiqish"
            >
              <LogOut size={18} className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* <nav className="fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 hidden sm:block">
        <div className="p-6">
          <div className="mb-8 px-4 py-3 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-2xl flex justify-center">
            <img src="/image.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeSection === section.id ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Icon size={20} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{section.title}</p>
                    <p className={`text-xs ${activeSection === section.id ? 'text-blue-200' : 'text-gray-500'}`}>{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={GraduationCap}
                title="O'quvchilar"
                value={stats?.students?.total || 0}
                subtitle={`${stats?.students?.active || 0} faol`}
                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                trend="+12%"
                isPositive={true}
              />
              <StatCard
                icon={Users}
                title="O'qituvchilar"
                value={stats?.teachers?.total || 0}
                subtitle={`${stats?.teachers?.active || 0} faol`}
                color="bg-gradient-to-br from-emerald-500 to-teal-600"
                trend="+8%"
                isPositive={true}
              />
              <StatCard
                icon={Layers}
                title="Guruhlar"
                value={stats?.groups?.total || 0}
                subtitle={`${stats?.groups?.active || 0} faol`}
                color="bg-gradient-to-br from-purple-500 to-violet-600"
                trend="+15%"
                isPositive={true}
              />
              <StatCard
                icon={BookOpen}
                title="Kurslar"
                value={stats?.courses?.total || 0}
                subtitle={`${stats?.courses?.active || 0} faol`}
                color="bg-gradient-to-br from-orange-500 to-red-600"
                trend="+10%"
                isPositive={true}
              />
            </div>

            {/* Revenue & Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Oylik tushum</h2>
                    <p className="text-blue-200 text-sm">Moliyaviy ko'rsatkichlar</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <DollarSign size={28} />
                  </div>
                </div>

                <div className="flex items-baseline gap-4 mb-6">
                  <div className="text-5xl font-bold">
                    {new Intl.NumberFormat('uz-UZ').format(stats?.revenue || 0)}
                  </div>
                  <div className="text-xl">so'm</div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    {parseFloat(revenueChange) >= 0 ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
                        <TrendingUp size={16} />
                        <span className="text-sm font-medium">{revenueChange}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
                        <TrendingDown size={16} />
                        <span className="text-sm font-medium">{revenueChange}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-blue-200 text-sm">
                    O'tgan oyga nisbatan
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">So'nggi to'lovlar</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.recentPayments || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} />
                    Oxirgi 30 kun ichida
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Activity size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Davomat</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.attendanceRate || 0}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle size={16} />
                    O'rtacha daromad
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tezkor harakatlar</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Eng kerakli funksiyalar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left group">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">O\'quvchi qo\'shish</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Yangi yaratish</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-left group">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">To\'lov qabul qilish</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Yangi kiritish</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left group">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">Guruh yaratish</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Yangi guruh</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left group">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">Hisobot yuklash</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">PDF formatda</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f) => <FeatureCard key={f.title} feature={f} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}