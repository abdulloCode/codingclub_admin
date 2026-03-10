import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Award,
  CreditCard,
  CalendarDays,
  Download,
  RefreshCw
} from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ruxsat yo'q</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Bu sahifani ko'rish uchun admin huquqiga ega bo'lishingiz kerak
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <TrendingUp size={16} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: BarChart3 },
    { id: 'students', label: 'O\'quvchilar', icon: GraduationCap },
    { id: 'teachers', label: 'O\'qituvchilar', icon: Users },
    { id: 'financial', label: 'Moliyaviy', icon: DollarSign },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="bg-white dark:bg-gray-800 shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white">Hisobotlar</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tizim statistikasi va tahlillari</p>
          </div>
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Yangilash
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
            <XCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Ma\'lumotlar yuklanmoqda...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && dashboard && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={GraduationCap}
                    title="O\'quvchilar"
                    value={dashboard.students?.total || 0}
                    subtitle={`${dashboard.students?.active || 0} faol`}
                    trend="+12%"
                    color="bg-blue-500"
                  />
                  <StatCard
                    icon={Users}
                    title="O\'qituvchilar"
                    value={dashboard.teachers?.total || 0}
                    subtitle={`${dashboard.teachers?.active || 0} faol`}
                    trend="+5%"
                    color="bg-green-500"
                  />
                  <StatCard
                    icon={Layers}
                    title="Guruhlar"
                    value={dashboard.groups?.total || 0}
                    subtitle={`${dashboard.groups?.active || 0} faol`}
                    trend="+8%"
                    color="bg-purple-500"
                  />
                  <StatCard
                    icon={BookOpen}
                    title="Kurslar"
                    value={dashboard.courses?.total || 0}
                    subtitle={`${dashboard.courses?.active || 0} faol`}
                    color="bg-orange-500"
                  />
                </div>

                {/* Revenue Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <DollarSign size={24} />
                        </div>
                        <span className="font-medium">Oylik tushum</span>
                      </div>
                      <CalendarDays size={20} className="opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {new Intl.NumberFormat('uz-UZ').format(dashboard.thisMonthRevenue || 0)} so'm
                    </div>
                    <p className="text-green-100 text-sm flex items-center gap-1">
                      <TrendingUp size={16} />
                      Bu oyda yig'ilgan
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <CreditCard size={24} />
                        </div>
                        <span className="font-medium">So'nggi to'lovlar</span>
                      </div>
                      <Clock size={20} className="opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {dashboard.recentPayments || 0}
                    </div>
                    <p className="text-blue-100 text-sm flex items-center gap-1">
                      <Calendar size={16} />
                      Oxirgi 30 kun ichida
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target size={20} className="text-blue-600" />
                    Tezkor harakatlar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Users size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">O\'quvchi qo\'shish</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Yangi o'quvchi yaratish</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">To'lov qabul qilish</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Yangi to'lov kiritish</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Download size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Hisobot yuklab olish</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">PDF formatda</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <GraduationCap size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">O\'quvchilar statistikasi</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Batafsil o'quvchi ma'lumotlari va tahlillari
                    </p>
                  </div>
                </div>

                {dashboard && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {dashboard.students?.total || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jami o\'quvchilar</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {dashboard.students?.active || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Faol o\'quvchilar</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                        {dashboard.students?.total - dashboard.students?.active || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nofaol o\'quvchilar</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                  <PieChart size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    O'quvchilar batafsil statistikasi uchun API endpoint tayyorlanmoqda...
                  </p>
                </div>
              </div>
            )}

            {/* Teachers Tab */}
            {activeTab === 'teachers' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Users size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">O\'qituvchilar statistikasi</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      O'qituvchilar soni va ularning guruhlari
                    </p>
                  </div>
                </div>

                {dashboard && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {dashboard.teachers?.total || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jami o\'qituvchilar</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        {dashboard.teachers?.active || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Faol o\'qituvchilar</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                  <Award size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    O'qituvchilar batafsil statistikasi uchun API endpoint tayyorlanmoqda...
                  </p>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Moliyaviy statistika</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tushumlar va to'lovlar batafsil ma'lumotlari
                    </p>
                  </div>
                </div>

                {dashboard && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                      <DollarSign size={32} className="mb-2 opacity-80" />
                      <div className="text-3xl font-bold mb-1">
                        {new Intl.NumberFormat('uz-UZ').format(dashboard.thisMonthRevenue || 0)} so'm
                      </div>
                      <p className="text-green-100 text-sm">Bu oylik tushum</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                      <CreditCard size={32} className="mb-2 opacity-80" />
                      <div className="text-3xl font-bold mb-1">
                        {dashboard.recentPayments || 0}
                      </div>
                      <p className="text-blue-100 text-sm">So'nggi to'lovlar</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                  <BarChart3 size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Moliyaviy batafsil statistikasi uchun API endpoint tayyorlanmoqda...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
