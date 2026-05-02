// src/components/admin/MemberDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { 
  ArrowLeft, Calendar, CreditCard, Phone, Mail, MapPin, User, 
  RefreshCw, LogOut, Dumbbell, Activity, Award, Clock, Heart,
  AlertCircle, CheckCircle, Edit, Trash2, FileText, Printer, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import PageHeader from '../common/PageHeader';
import toast from 'react-hot-toast';

interface MemberDetail {
  _id: string;
  memberId?: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  joinDate: string;
  photo?: string;
  status: string;
  currentMembership: {
    _id: string;
    planId: {
      _id: string;
      name: string;
      price: number;
      durationInDays: number;
      duration: string;
    };
    startDate: string;
    expiryDate: string;
    status: string;
    amount: number;
  } | null;
  membershipHistory: Array<{
    _id: string;
    planId: {
      name: string;
      price: number;
    };
    startDate: string;
    expiryDate: string;
    status: string;
    amount: number;
  }>;
}

export default function MemberDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [member, setMember] = useState<any>(null);
  const [currentMembership, setCurrentMembership] = useState<any>(null);
  const [membershipHistory, setMembershipHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [renewing, setRenewing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [membershipStatus, setMembershipStatus] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

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
    if (id) {
      fetchMemberDetails();
      fetchPlans();
    }
  }, [id]);

  const fetchMemberDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching member details for ID:', id);
      const response = await axios.get(`/api/membership/members/${id}`);
      console.log('API Response:', response.data);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        const memberData = data.member || data;
        const membershipData = data.currentMembership;
        const historyData = data.membershipHistory || [];
        
        setMember(memberData);
        setCurrentMembership(membershipData);
        setMembershipHistory(historyData);
        
        // Calculate real-time status and days remaining (NO DUMMY DATA)
        if (membershipData) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = new Date(membershipData.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);
          
          const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          
          if (daysLeft < 0) {
            setMembershipStatus('EXPIRED');
            setDaysRemaining(0);
          } else if (daysLeft === 0) {
            setMembershipStatus('EXPIRES_TODAY');
            setDaysRemaining(0);
          } else {
            setMembershipStatus(membershipData.status || 'ACTIVE');
            setDaysRemaining(daysLeft);
          }
        } else {
          setMembershipStatus('NO_ACTIVE');
          setDaysRemaining(0);
        }
      } else {
        setError('Member not found');
      }
    } catch (error: any) {
      console.error('Error fetching member:', error);
      setError(error.response?.data?.message || 'Failed to load member details');
      toast.error('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMemberDetails();
    setRefreshing(false);
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/membership/plans');
      setPlans(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedPlan(response.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleRenew = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setRenewing(true);
    try {
      await axios.post('/api/membership/renew', {
        memberId: id,
        planId: selectedPlan,
        paymentMethod: 'CASH'
      });
      toast.success('Membership renewed successfully');
      setShowRenewModal(false);
      fetchMemberDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error renewing membership');
    } finally {
      setRenewing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string, customStatus?: string) => {
    const displayStatus = customStatus || status;
    
    switch (displayStatus) {
      case 'ACTIVE':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Active</span>;
      case 'EXPIRED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1"><AlertCircle size={12} /> Expired</span>;
      case 'EXPIRES_TODAY':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium flex items-center gap-1"><Clock size={12} /> Expires Today</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{status || 'N/A'}</span>;
    }
  };

  const getStatusColor = () => {
    if (membershipStatus === 'ACTIVE') return 'text-green-600';
    if (membershipStatus === 'EXPIRES_TODAY') return 'text-orange-600';
    if (membershipStatus === 'EXPIRED') return 'text-red-600';
    return 'text-gray-600';
  };

  const getPlanName = () => {
    if (!currentMembership) return 'No Active Plan';
    if (currentMembership.planId?.name) {
      return currentMembership.planId.name;
    }
    return 'Plan Name Not Available';
  };

  const getPlanPrice = () => {
    if (!currentMembership) return 0;
    if (currentMembership.planId?.price) {
      return currentMembership.planId.price;
    }
    return currentMembership.amount || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar role="ADMIN" onLogout={handleLogout} />
        <div className="lg:ml-72 min-h-screen">
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/members')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Member Details</h1>
                  <p className="text-gray-500 text-sm mt-1">View member information</p>
                </div>
              </div>
            </div>
          </div>
          <main className="p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Member Not Found</h3>
              <p className="text-gray-500 mb-6">{error || 'Unable to load member details'}</p>
              <button 
                onClick={() => navigate('/admin/members')} 
                className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition font-semibold"
              >
                Back to Members
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const memberIdDisplay = member.memberId || member._id?.slice(-8) || 'N/A';
  const currentPlanName = getPlanName();
  const currentPlanPrice = getPlanPrice();

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
      <Sidebar role="ADMIN" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        <PageHeader 
          title="Member Details"
          subtitle={`${member.name} • Member ID: ${memberIdDisplay}`}
          showBackButton={true}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <main className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile and Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={member.photo || `https://ui-avatars.com/api/?background=ffffff&color=ef4444&name=${encodeURIComponent(member.name)}&length=2&size=80&font-size=32&bold=true`} 
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-white">{member.name}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-red-100 text-sm">
                          <Mail size={14} />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-100 text-sm">
                          <Phone size={14} />
                          <span>{member.mobileNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-red-600" />
                    <h3 className="font-semibold text-gray-800">Personal Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-800">{member.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{member.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mobile Number</p>
                      <p className="font-medium text-gray-800">{member.mobileNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-gray-800">{formatDate(member.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium text-gray-800">{member.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Join Date</p>
                      <p className="font-medium text-gray-800">{formatDate(member.joinDate)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">{member.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={18} className="text-red-600" />
                  <h3 className="font-semibold text-gray-800">Emergency Contact</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Contact Name</p>
                    <p className="font-medium text-gray-800">{member.emergencyContact || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">{member.emergencyPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Membership History Card - REAL DATA from API */}
              {membershipHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-red-600" />
                    <h3 className="font-semibold text-gray-800">Membership History</h3>
                  </div>
                  <div className="space-y-3">
                    {membershipHistory.map((membership) => (
                      <div key={membership._id} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {membership.planId?.name || 'Unknown Plan'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(membership.startDate)} - {formatDate(membership.expiryDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">₹{membership.amount}</p>
                            {getStatusBadge(membership.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Current Membership */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Award size={20} className="text-white" />
                    <h3 className="font-semibold text-white">Current Membership</h3>
                  </div>
                </div>
                <div className="p-6">
                  {currentMembership ? (
                    <div className="space-y-4">
                      <div className="text-center pb-4 border-b border-gray-100">
                        <p className="text-2xl font-bold text-red-600">{currentPlanName}</p>
                        <div className="mt-2">{getStatusBadge(currentMembership.status, membershipStatus)}</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Start Date</span>
                          <span className="font-medium text-gray-800">{formatDate(currentMembership.startDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Expiry Date</span>
                          <span className="font-medium text-gray-800">{formatDate(currentMembership.expiryDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Amount</span>
                          <span className="font-semibold text-green-600">₹{currentPlanPrice}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className={`rounded-xl p-3 text-center ${
                          membershipStatus === 'EXPIRED' ? 'bg-red-50' : 
                          membershipStatus === 'EXPIRES_TODAY' ? 'bg-orange-50' : 'bg-green-50'
                        }`}>
                          <p className="text-xs text-gray-600">Days Remaining</p>
                          <p className={`text-2xl font-bold ${
                            membershipStatus === 'EXPIRED' ? 'text-red-600' : 
                            membershipStatus === 'EXPIRES_TODAY' ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {daysRemaining} days
                          </p>
                          {membershipStatus === 'EXPIRED' && (
                            <p className="text-xs text-red-600 mt-1">Membership has expired</p>
                          )}
                          {membershipStatus === 'EXPIRES_TODAY' && (
                            <p className="text-xs text-orange-600 mt-1">Membership expires today</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowRenewModal(true)}
                        className="w-full bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2 mt-4"
                      >
                        <RefreshCw size={16} />
                        Renew Membership
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Award size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No active membership</p>
                      <button
                        onClick={() => setShowRenewModal(true)}
                        className="w-full bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition font-semibold"
                      >
                        Add Membership
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <RefreshCw size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Renew Membership</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Select a plan for {member.name}</p>
                </div>
              </div>
              <button onClick={() => setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                >
                  {plans.map((plan: any) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price} ({plan.durationInDays} days)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                <p className="text-xs text-yellow-700">
                  Note: After renewal, the membership will be extended from the current expiry date.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRenew}
                  disabled={renewing}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50"
                >
                  {renewing ? 'Processing...' : 'Confirm Renewal'}
                </button>
                <button
                  onClick={() => setShowRenewModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}