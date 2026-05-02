// src/components/admin/MembersList.tsx
import { useEffect, useState } from 'react';
import { Search, Eye, UserPlus, Phone, Mail, RefreshCw, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';
import PageHeader from '../common/PageHeader';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../hooks/useToast';
import { getMembershipStatusInfo } from '../../utils/membershipUtils';

interface Member {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  photo?: string;
  joinDate: string;
  status: string;
  currentMembership?: {
    _id: string;
    planId: {
      name: string;
      price: number;
    };
    startDate: string;
    expiryDate: string;
    status: string;
    amount: number;
  } | null;
}

export default function MembersList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { showError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/membership/members');
      setMembers(response.data.data);
      setFilteredMembers(response.data.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      showError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const filterMembers = () => {
    let filtered = [...members];
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mobileNumber?.includes(searchTerm) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMembers(filtered);
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

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const stats = {
    total: members.length,
    activeCount: members.filter(m => {
      const statusInfo = getMembershipStatusInfo(m.currentMembership?.expiryDate);
      return statusInfo.isActive;
    }).length,
    expiring: members.filter(m => {
      const statusInfo = getMembershipStatusInfo(m.currentMembership?.expiryDate);
      return statusInfo.isExpiringSoon;
    }).length,
    inactiveCount: members.filter(m => {
      const statusInfo = getMembershipStatusInfo(m.currentMembership?.expiryDate);
      return !statusInfo.isActive && statusInfo.status !== 'No Membership';
    }).length
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
        <PageHeader 
          title={getText('admin.members', 'Members')}
          subtitle={getText('admin.manageMembers', 'Manage and view all gym members')}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.totalMembers', 'Total Members')}</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.active', 'Active')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeCount}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.expiringSoon', 'Expiring Soon')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.inactive', 'Inactive')}</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactiveCount}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <AlertCircle size={20} className="text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Add Button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={getText('common.searchMembers', 'Search by name, phone or email...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                />
              </div>
              <button
                onClick={() => navigate('/admin/members/add')}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold shadow-md"
              >
                <UserPlus size={18} />
                {getText('admin.addMember', 'Add Member')}
              </button>
            </div>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Users className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{getText('admin.noMembers', 'No members found')}</h3>
              <p className="text-gray-500">{getText('common.tryAdjustingSearch', 'Try adjusting your search')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => {
                const expiryDate = member.currentMembership?.expiryDate;
                const statusInfo = getMembershipStatusInfo(expiryDate);
                const planName = member.currentMembership?.planId?.name || 'No Plan';
                
                return (
                  <div key={member._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className={`h-1 ${
                      statusInfo.isActive ? 'bg-green-500' : 
                      statusInfo.isExpiringSoon ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-md border-2 border-gray-200">
                          <span className="text-white text-xl font-bold">
                            {getInitials(member.name)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{member.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Phone size={12} />
                            <span>{member.mobileNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                            <Mail size={12} />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">Current Plan</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.badgeColor}`}>
                            {statusInfo.status}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{planName}</p>
                        {expiryDate && (
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-gray-500">Expiry Date</span>
                            <span className="font-medium text-gray-700">
                              {new Date(expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {statusInfo.daysRemaining > 0 && (
                          <div className={`mt-2 text-center py-1.5 rounded-lg text-xs font-semibold ${
                            statusInfo.isExpiringSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {statusInfo.daysRemaining} days remaining
                          </div>
                        )}
                        {statusInfo.status === 'Expired' && (
                          <div className="mt-2 text-center py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                            Membership Expired
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => navigate(`/admin/members/${member._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-xl hover:bg-red-100 transition-all duration-200 text-sm font-medium"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}