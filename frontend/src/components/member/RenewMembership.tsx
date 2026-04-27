// src/components/member/RenewMembership.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, CheckCircle, AlertCircle, IndianRupee, CalendarDays, Clock, Award,
  Send, Calendar, Bell, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';
import { getMembershipStatusInfo, formatDate } from '../../utils/membershipUtils';

interface Plan {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  duration: string;
}

interface CurrentMembership {
  _id: string;
  planId: { name: string; price: number };
  expiryDate: string;
  startDate: string;
}

export default function RenewMembership() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [plansRes, dashboardRes] = await Promise.all([
        axios.get('/api/membership/plans'),
        axios.get('/api/membership/my-dashboard')
      ]);
      setPlans(plansRes.data.data);
      setCurrentMembership(dashboardRes.data.data.currentMembership);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      setError(getText('member.renew.selectPlan', 'Please select a plan'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/renewals/request', { planId: selectedPlan });
      setSubmitted(true);
      setTimeout(() => navigate('/member/dashboard'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || getText('common.error', 'Error requesting renewal'));
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getText = (key: string, fallback: string): string => {
    try {
      const translated = t(key);
      if (translated === key || !translated) return fallback;
      return translated;
    } catch {
      return fallback;
    }
  };

  // Get current membership status info
  const membershipInfo = getMembershipStatusInfo(currentMembership?.expiryDate);

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md border border-gray-200">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{getText('member.renew.requestSent', 'Request Submitted!')}</h2>
          <p className="text-gray-600 mb-4">{getText('member.renew.requestSentMsg', 'Your renewal request has been sent to the admin. You will be contacted shortly.')}</p>
          <p className="text-sm text-gray-500">{getText('member.renew.redirecting', 'Redirecting to dashboard...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
      <Sidebar role="MEMBER" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/member/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{getText('member.renew.title', 'Renew Membership')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{getText('member.renew.subtitle', 'Choose a plan to continue your fitness journey')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <RefreshCw size={18} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                  <Bell className="text-gray-500" size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'M'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{getText('member.renew.title', 'Renew Membership')}</h2>
            <p className="text-gray-500 mt-1">{getText('member.renew.subtitle', 'Select a plan below to continue your fitness journey')}</p>
          </div>

          {/* Current Membership Card - With Real-time Status */}
          {currentMembership && (
            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-red-600 border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Award className="text-red-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">{getText('member.renew.currentMembership', 'Current Membership')}</h3>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${membershipInfo.badgeColor}`}>
                  {membershipInfo.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium">
                    {currentMembership.planId?.name || getText('member.renew.noActivePlan', 'No Active Plan')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getText('member.renew.expires', 'Expires')}: {formatDate(currentMembership.expiryDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{getText('common.status', 'Status')}</p>
                  <p className={`text-sm font-semibold ${membershipInfo.statusColor}`}>
                    {membershipInfo.isActive ? getText('common.active', 'Active') : getText('common.expired', 'Expired')}
                  </p>
                </div>
              </div>
              {membershipInfo.daysRemaining > 0 && membershipInfo.daysRemaining <= 7 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-center">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Your membership expires in {membershipInfo.daysRemaining} days. Renew soon!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <label 
                key={plan._id} 
                className={`cursor-pointer transition-all duration-200 ${selectedPlan === plan._id ? 'ring-2 ring-red-500 scale-[1.02]' : ''}`}
              >
                <div className={`bg-white rounded-2xl shadow-sm p-6 h-full transition-all duration-300 ${selectedPlan === plan._id ? 'border-red-500 border-2' : 'border border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                    <input 
                      type="radio" 
                      name="plan" 
                      value={plan._id} 
                      checked={selectedPlan === plan._id} 
                      onChange={(e) => setSelectedPlan(e.target.value)} 
                      className="w-5 h-5 text-red-600 focus:ring-red-500 accent-red-600" 
                    />
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-red-600">₹{plan.price.toLocaleString()}</span>
                    <span className="text-gray-500"> / {plan.durationInDays} {getText('member.renew.daysValidity', 'days')}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarDays size={14} className="text-gray-400" />
                      <span>{plan.durationInDays} {getText('member.renew.daysValidity', 'days validity')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <IndianRupee size={14} className="text-gray-400" />
                      <span>₹{(plan.price / plan.durationInDays).toFixed(0)} {getText('member.renew.perDay', 'per day')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      <span>{getText('member.renew.instantActivation', 'Instant activation after payment')}</span>
                    </div>
                  </div>
                  {plan.popular && (
                    <div className="mt-3 text-center">
                      <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-500">{getText('common.noData', 'No plans available')}</p>
            </div>
          )}

          {/* Renewal Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{getText('member.renew.renewalInfo', 'Renewal Information')}</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle size={18} className="text-green-600 mt-0.5" />
                <p className="text-sm text-gray-700">
                  {getText('member.renew.requestSentMsg', 'Your renewal request will be sent to the admin. You will be contacted shortly.')}
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <Clock size={18} className="text-yellow-600 mt-0.5" />
                <p className="text-sm text-gray-700">
                  {getText('member.dashboard.pendingRenewal', 'Your renewal request is pending approval from the admin.')}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit} 
              disabled={loading || !selectedPlan || plans.length === 0} 
              className="w-full bg-red-600 text-white py-3.5 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {getText('member.renew.submitting', 'Submitting...')}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {getText('member.renew.submitRequest', 'Submit Renewal Request')}
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}