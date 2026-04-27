// src/components/member/MemberDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../config/axios';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, CalendarDays, Award, AlertCircle, Dumbbell, Send, Sparkles,
  Bell, User, Activity, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';
import { getMembershipStatusInfo, formatDate } from '../../utils/membershipUtils';

interface DashboardData {
  member: {
    _id: string;
    name: string;
    email: string;
    mobileNumber: string;
    joinDate: string;
  };
  currentMembership: {
    _id: string;
    planId: { name: string; price: number; durationInDays: number };
    startDate: string;
    expiryDate: string;
    status: string;
    amount: number;
  } | null;
  daysRemaining: number;
  status: string;
  hasPendingRenewal: boolean;
}

export default function MemberDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language changed in MemberDashboard, re-rendering...');
      setRenderKey(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/membership/my-dashboard');
      setDashboardData(response.data.data);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get real-time membership status
  const membershipInfo = getMembershipStatusInfo(dashboardData?.currentMembership?.expiryDate);
  const currentPlanName = dashboardData?.currentMembership?.planId?.name || 'N/A';
  const startDate = dashboardData?.currentMembership?.startDate;
  const expiryDate = dashboardData?.currentMembership?.expiryDate;

  // Helper function to safely get translation with fallback
  const getTranslation = (key: string, fallback: string): string => {
    try {
      const translated = t(key);
      if (translated === key) return fallback;
      return translated;
    } catch {
      return fallback;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-2xl shadow-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleRefresh} className="bg-red-600 text-white px-4 py-2 rounded-lg">{getTranslation('common.tryAgain', 'Try Again')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" key={renderKey}>
      <Sidebar role="MEMBER" onLogout={handleLogout} />
      
      <div className="lg:ml-72 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {getTranslation('common.dashboard', 'Dashboard')}
            </h1>
            <div className="flex items-center gap-4">
              <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg">
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button className="relative">
                <Bell className="text-gray-500 hover:text-red-600" size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center">
                <span className="text-red-600 text-sm font-semibold">{dashboardData?.member?.name?.charAt(0) || 'M'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {getTranslation('member.dashboard.welcomeBack', 'Welcome back')}, {dashboardData?.member?.name || 'Member'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">{getTranslation('dashboard.subtitle', "Here's what's happening with your gym today")}</p>
          </div>

          {/* Membership Card */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-md p-6 mb-8 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-sm font-semibold text-red-100">{getTranslation('member.dashboard.membershipCard', 'Membership Card')}</h2>
                <p className="text-2xl font-bold text-white mt-1">{getTranslation('member.dashboard.perfectFitnessClub', 'Perfect Fitness Club')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-100">{getTranslation('member.dashboard.memberSince', 'Member Since')}</p>
                <p className="font-semibold text-white">{dashboardData?.member?.joinDate ? new Date(dashboardData.member.joinDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="border-t border-red-400 pt-4 mt-2">
              <p className="text-lg font-semibold text-white">{dashboardData?.member?.name || 'N/A'}</p>
              <p className="text-sm text-red-100">{dashboardData?.member?.mobileNumber || 'N/A'}</p>
              <p className="text-sm text-red-100">{dashboardData?.member?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Current Plan - Using real-time status */}
          {dashboardData?.currentMembership ? (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{getTranslation('member.dashboard.currentPlan', 'Current Plan')}</h3>
                  <p className="text-2xl font-bold text-red-600 mt-1">{currentPlanName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${membershipInfo.badgeColor}`}>
                  {membershipInfo.status}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-red-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">{getTranslation('member.dashboard.startDate', 'Start Date')}</p>
                    <p className="font-semibold text-gray-800">{startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarDays className="text-red-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">{getTranslation('member.dashboard.expiryDate', 'Expiry Date')}</p>
                    <p className="font-semibold text-gray-800">{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-lg ${membershipInfo.bgColor}`}>
                <div>
                  <p className="text-sm text-gray-600">{getTranslation('member.dashboard.daysRemaining', 'Days Remaining')}</p>
                  <p className={`text-2xl font-bold ${membershipInfo.statusColor}`}>
                    {membershipInfo.daysRemaining} {getTranslation('common.daysRemaining', 'days')}
                  </p>
                </div>
                <Award size={40} className="text-red-600/50" />
              </div>
              {!dashboardData.hasPendingRenewal && membershipInfo.isActive ? (
                <button onClick={() => navigate('/member/renew')} className="w-full mt-6 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2">
                  <Send size={18} /> {getTranslation('member.dashboard.requestRenewal', 'Request Renewal')}
                </button>
              ) : dashboardData.hasPendingRenewal ? (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-yellow-600">{getTranslation('member.dashboard.pendingRenewal', 'Your renewal request is pending approval')}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <AlertCircle size={48} className="text-red-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{getTranslation('member.dashboard.noActiveMembership', 'No Active Membership')}</h3>
              <button onClick={() => navigate('/member/renew')} className="bg-red-600 text-white px-6 py-2 rounded-lg">{getTranslation('member.dashboard.purchasePlan', 'Purchase a Plan')}</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}