// src/components/admin/AdminRenewalRequests.tsx
import { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, RefreshCw, Phone, CheckCircle, XCircle, 
  ArrowLeft, RefreshCcw, Bell, User, Mail, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import { useToast } from '../../hooks/useToast';
import { getMembershipStatusInfo, formatDate } from '../../utils/membershipUtils';

interface RenewalRequest {
  _id: string;
  memberId: {
    _id: string;
    name: string;
    mobileNumber: string;
    email?: string;
    photo?: string;
  } | null;
  membershipId: {
    _id: string;
    expiryDate: string;
  } | null;
  requestedPlanId: {
    _id: string;
    name: string;
    price: number;
    durationInDays: number;
  } | null;
  requestedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  processedAt?: string;
}

export default function AdminRenewalRequests() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [requests, setRequests] = useState<RenewalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RenewalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
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
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [statusFilter, requests]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/renewals/requests');
      console.log('Renewal requests fetched:', response.data);
      setRequests(response.data.data || []);
      setFilteredRequests(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching renewal requests:', error);
      if (error.response?.status === 403) {
        showError(getText('common.unauthorized', 'You are not authorized. Please login again.'));
        navigate('/admin-login');
      } else {
        showError(getText('common.error', 'Failed to load renewal requests'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const filterRequests = () => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === statusFilter));
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    let notes = '';
    if (status === 'REJECTED') {
      notes = prompt(getText('admin.reasonForRejection', 'Reason for rejection:')) || '';
      if (!notes) return;
    }
    
    const confirmMsg = status === 'APPROVED' 
      ? getText('admin.confirmApproval', 'Mark this request as approved?')
      : getText('admin.confirmRejection', 'Mark this request as rejected?');
    
    if (!confirm(confirmMsg)) return;

    setProcessingId(requestId);
    try {
      await axios.put(`/api/renewals/${requestId}/status`, { status, notes });
      showSuccess(getText('admin.requestUpdated', `Request ${status.toLowerCase()} successfully`));
      fetchRequests();
    } catch (error: any) {
      showError(error.response?.data?.message || getText('common.error', 'Error updating request'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium flex items-center gap-1"><Clock size={12} /> {getText('common.pending', 'Pending')}</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> {getText('common.approved', 'Approved')}</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1"><XCircle size={12} /> {getText('common.rejected', 'Rejected')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{status}</span>;
    }
  };

  const getMemberPhoto = (member: any, name: string) => {
    if (member?.photo && member.photo !== 'https://via.placeholder.com/150') {
      return member.photo;
    }
    return `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(name)}&length=2&size=48&font-size=0.24&bold=true`;
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

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length
  };

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
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{getText('admin.renewalRequests', 'Renewal Requests')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{getText('admin.manageRenewalRequests', 'Manage member renewal requests')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <RefreshCw size={18} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                  <Bell className="text-gray-500" size={20} />
                  {stats.pending > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.total', 'Total')}</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <RefreshCw size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.pending', 'Pending')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.approved', 'Approved')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.rejected', 'Rejected')}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle size={20} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              >
                <option value="all">{getText('common.all', 'All')} {getText('admin.renewalRequests', 'Requests')}</option>
                <option value="PENDING">{getText('common.pending', 'Pending')}</option>
                <option value="APPROVED">{getText('common.approved', 'Approved')}</option>
                <option value="REJECTED">{getText('common.rejected', 'Rejected')}</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const memberName = request.memberId?.name || getText('common.unknownMember', 'Unknown Member');
              const memberMobile = request.memberId?.mobileNumber || 'N/A';
              const memberEmail = request.memberId?.email || 'N/A';
              const memberPhoto = getMemberPhoto(request.memberId, memberName);
              const requestedPlanName = request.requestedPlanId?.name || getText('common.unknownPlan', 'Unknown Plan');
              const requestedPlanPrice = request.requestedPlanId?.price || 0;
              const expiryDate = request.membershipId?.expiryDate 
                ? new Date(request.membershipId.expiryDate).toLocaleDateString() 
                : 'N/A';
              
              const statusInfo = getMembershipStatusInfo(request.membershipId?.expiryDate);
              
              return (
                <div key={request._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className={`h-1 ${
                    request.status === 'PENDING' ? 'bg-yellow-500' : 
                    request.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={memberPhoto} 
                          alt={memberName} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{memberName}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{memberMobile}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{memberEmail}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{getText('admin.requestedOn', 'Requested on')}:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {new Date(request.requestedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{getText('admin.currentPlanExpires', 'Current plan expires')}:</span>
                        <span className={`text-sm font-medium ${statusInfo.statusColor}`}>{expiryDate}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="text-sm text-gray-600">{getText('admin.requestedPlan', 'Requested Plan')}:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {requestedPlanName} - ₹{requestedPlanPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {request.status === 'PENDING' && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                          <AlertCircle size={16} className="text-yellow-500" />
                          {getText('admin.actionRequired', 'Action Required')}:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <a 
                            href={`tel:${memberMobile}`} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-sm font-medium"
                          >
                            <Phone size={16} />
                            {getText('admin.callMember', 'Call Member')}
                          </a>
                          <button 
                            onClick={() => handleUpdateStatus(request._id, 'APPROVED')} 
                            disabled={processingId === request._id} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition text-sm font-medium disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            {getText('admin.markAsApproved', 'Approve Request')}
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(request._id, 'REJECTED')} 
                            disabled={processingId === request._id} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            {getText('admin.markAsRejected', 'Reject Request')}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                          {getText('admin.renewalNote', 'After approving, you can manually update the member\'s membership after receiving payment.')}
                        </p>
                      </div>
                    )}
                    
                    {request.status !== 'PENDING' && request.processedAt && (
                      <div className="border-t border-gray-200 pt-3 mt-3 text-xs text-gray-500">
                        {getText('admin.processedOn', 'Processed on')}: {new Date(request.processedAt).toLocaleDateString()}
                        {request.notes && <p className="mt-1">{getText('admin.notes', 'Notes')}: {request.notes}</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <RefreshCcw className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">{getText('admin.noRequests', 'No renewal requests found')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}