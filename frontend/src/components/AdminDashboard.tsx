import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Wrench,
  Dumbbell,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  UserPlus,
  List,
  Settings,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';

interface DashboardStats {
  totalMembers: number;
  activeMemberships: number;
  monthlyRevenue: number;
  todayBookings: number;
  pendingRenewals: number;
  expiringSoon: number;
  equipmentStats: {
    total: number;
    available: number;
    inUse: number;
    underMaintenance: number;
  };
}

export default function AdminDashboard() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMemberships: 0,
    monthlyRevenue: 0,
    todayBookings: 0,
    pendingRenewals: 0,
    expiringSoon: 0,
    equipmentStats: { total: 0, available: 0, inUse: 0, underMaintenance: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([
    { month: 'Jan', revenue: 25000 },
    { month: 'Feb', revenue: 32000 },
    { month: 'Mar', revenue: 28000 },
    { month: 'Apr', revenue: 35000 },
    { month: 'May', revenue: 42000 },
    { month: 'Jun', revenue: 38000 }
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [membershipRes, equipmentRes] = await Promise.all([
        axios.get('/api/membership/admin/stats'),
        axios.get('/api/equipment/stats')
      ]);
      
      setStats({
        totalMembers: membershipRes.data.data.totalMembers,
        activeMemberships: membershipRes.data.data.activeMemberships,
        monthlyRevenue: membershipRes.data.data.monthlyRevenue,
        todayBookings: 0,
        pendingRenewals: 2,
        expiringSoon: 5,
        equipmentStats: equipmentRes.data.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: Activity, label: 'Dashboard' },
    { path: '/admin/members', icon: Users, label: 'Members' },
    { path: '/admin/members/add', icon: UserPlus, label: 'Add Member' },
    { path: '/admin/manage-bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/equipment', icon: Wrench, label: 'Equipment' },
    { path: '/admin/reports', icon: TrendingUp, label: 'Reports' },
  ];

  const equipmentData = [
    { name: 'Available', value: stats.equipmentStats.available, color: '#22c55e' },
    { name: 'In Use', value: stats.equipmentStats.inUse, color: '#3b82f6' },
    { name: 'Maintenance', value: stats.equipmentStats.underMaintenance, color: '#ef4444' }
  ];

  const recentActivities = [
    { id: 1, action: 'New member joined', time: '5 min ago', icon: UserPlus, color: 'text-green-500' },
    { id: 2, action: 'Membership renewed', time: '1 hour ago', icon: RefreshCw, color: 'text-blue-500' },
    { id: 3, action: 'Wellness booking created', time: '3 hours ago', icon: Calendar, color: 'text-purple-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-red-600 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/10 backdrop-blur-xl shadow-xl z-40 transition-transform duration-300
        w-64 lg:w-72 border-r border-white/20
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-red-600 p-2 rounded-xl">
              <Dumbbell className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-white">Smart<span className="text-red-500">Gym</span></span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Admin Panel</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/20 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-500 to-red-700 w-10 h-10 rounded-full flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto h-[calc(100%-180px)]">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20 absolute bottom-0 left-0 right-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="relative">
                <Bell className="text-gray-300 hover:text-white transition" size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-red-400" size={28} />
                <span className="text-2xl font-bold text-white">{stats.totalMembers}</span>
              </div>
              <p className="text-gray-300 text-sm">Total Members</p>
              <p className="text-green-400 text-xs mt-2">↑ 12% this month</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="text-blue-400" size={28} />
                <span className="text-2xl font-bold text-white">{stats.activeMemberships}</span>
              </div>
              <p className="text-gray-300 text-sm">Active Memberships</p>
              <p className="text-green-400 text-xs mt-2">↑ 8% this month</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="text-green-400" size={28} />
                <span className="text-2xl font-bold text-white">₹{stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <p className="text-gray-300 text-sm">Monthly Revenue</p>
              <p className="text-green-400 text-xs mt-2">↑ 5% this month</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="flex items-center justify-between mb-4">
                <Activity className="text-purple-400" size={28} />
                <span className="text-2xl font-bold text-white">{stats.equipmentStats.total}</span>
              </div>
              <p className="text-gray-300 text-sm">Total Machines</p>
              <p className="text-green-400 text-xs mt-2">All operational</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-red-400" />
                Monthly Revenue
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#ef4444" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Equipment Status Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-red-400" />
                Equipment Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={equipmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {equipmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts and Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Alerts */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell size={20} className="text-red-400" />
                Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {stats.pendingRenewals > 0 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-yellow-400" size={20} />
                      <div>
                        <p className="text-white font-medium">Pending Renewals</p>
                        <p className="text-yellow-300 text-sm">{stats.pendingRenewals} member(s) requested renewal</p>
                      </div>
                      <button className="ml-auto text-yellow-400 text-sm hover:underline">Review →</button>
                    </div>
                  </div>
                )}
                {stats.expiringSoon > 0 && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="text-blue-400" size={20} />
                      <div>
                        <p className="text-white font-medium">Expiring Soon</p>
                        <p className="text-blue-300 text-sm">{stats.expiringSoon} memberships expiring in 7 days</p>
                      </div>
                      <button className="ml-auto text-blue-400 text-sm hover:underline">View →</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-red-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
                      <div className={`p-2 rounded-lg bg-${activity.color.split('-')[1]}-500/20`}>
                        <Icon size={16} className={activity.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
