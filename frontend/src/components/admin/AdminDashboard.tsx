// src/components/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import PageHeader from '../common/PageHeader';
import { 
  Users, TrendingUp, Dumbbell, UserPlus, RefreshCw, 
  Clock, Award, Calendar, Wallet, Activity, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from '../../config/axios';

interface DashboardStats {
  totalMembers: number;
  activeMemberships: number;
  monthlyRevenue: number;
  todayBookings: number;
  pendingRenewals: number;
  expiringSoon: number;
  newMembersThisMonth: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMemberships: 0,
    monthlyRevenue: 0,
    todayBookings: 0,
    pendingRenewals: 0,
    expiringSoon: 0,
    newMembersThisMonth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render on language change
  useEffect(() => {
    const handleLanguageChange = () => {
      setRenderKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/membership/admin/stats');
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Helper function to get translated text
  const getText = (key: string, fallback: string): string => {
    try {
      const translated = t(key);
      if (translated === key || !translated) return fallback;
      return translated;
    } catch {
      return fallback;
    }
  };

  const revenueData = [
    { month: getText('common.jan', 'Jan'), revenue: 25000 },
    { month: getText('common.feb', 'Feb'), revenue: 32000 },
    { month: getText('common.mar', 'Mar'), revenue: 38000 },
    { month: getText('common.apr', 'Apr'), revenue: 45000 },
    { month: getText('common.may', 'May'), revenue: 52000 },
    { month: getText('common.jun', 'Jun'), revenue: 58000 }
  ];

  const membershipData = [
    { name: getText('common.active', 'Active'), value: stats.activeMemberships, color: '#22c55e' },
    { name: getText('common.inactive', 'Inactive'), value: Math.max(0, stats.totalMembers - stats.activeMemberships), color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{getText('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
      <Sidebar role="ADMIN" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        <PageHeader 
          title={getText('admin.dashboard', 'Admin Dashboard')}
          subtitle={`${getText('common.welcomeBack', 'Welcome back')}, ${user?.name || 'Admin'}! 👋`}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.totalMembers', 'Total Members')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalMembers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.activeMemberships', 'Active Memberships')}</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeMemberships}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award className="text-green-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.monthlyRevenue', 'Monthly Revenue')}</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Wallet className="text-purple-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.todayBookings', "Today's Bookings")}</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.todayBookings}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-orange-600" size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-2xl font-bold">{stats.pendingRenewals}</p>
                  <p className="text-gray-500 text-sm">{getText('admin.pendingRenewals', 'Pending Renewals')}</p>
                </div>
                <RefreshCw size={28} className="text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-2xl font-bold">{stats.expiringSoon}</p>
                  <p className="text-gray-500 text-sm">{getText('admin.expiringSoon', 'Expiring Soon')}</p>
                </div>
                <Clock size={28} className="text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-2xl font-bold">{stats.newMembersThisMonth}</p>
                  <p className="text-gray-500 text-sm">{getText('dashboard.newMembers', 'New This Month')}</p>
                </div>
                <UserPlus size={28} className="text-green-500" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-red-500" />
                {getText('dashboard.revenueOverview', 'Revenue Overview')}
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, getText('admin.monthlyRevenue', 'Monthly Revenue')]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#ef4444" fill="url(#colorRevenue)" name={getText('admin.monthlyRevenue', 'Monthly Revenue')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChartIcon size={20} className="text-red-500" />
                {getText('dashboard.membershipDistribution', 'Membership Distribution')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    formatter={(value: number) => [`${value} ${getText('common.members', 'members')}`, getText('common.count', 'Count')]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{getText('admin.totalMembers', 'Total Members')}</span>
                  <span className="font-semibold text-gray-800">{stats.totalMembers}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">{getText('dashboard.activeRate', 'Active Rate')}</span>
                  <span className="font-semibold text-green-600">{stats.totalMembers > 0 ? Math.round((stats.activeMemberships / stats.totalMembers) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}