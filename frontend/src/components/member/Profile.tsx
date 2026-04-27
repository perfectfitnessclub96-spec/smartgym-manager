// src/components/member/Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, CheckCircle, AlertCircle, User, Mail, Phone, 
  MapPin, Edit2, Save, XCircle, Calendar as CalendarIcon, Bell, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';

interface MemberProfile {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: string;
  joinDate: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    dateOfBirth: '',
    gender: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/member/info');
      const data = response.data.data;
      setProfile(data);
      
      const nameParts = (data.name || '').split(' ');
      const firstName = data.firstName || nameParts[0] || '';
      const lastName = data.lastName || nameParts.slice(1).join(' ') || '';
      
      setEditForm({
        firstName: firstName,
        lastName: lastName,
        email: data.email || '',
        phoneNumber: data.mobileNumber || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    const fullName = `${editForm.firstName} ${editForm.lastName}`.trim();
    
    try {
      await axios.put('/api/auth/member/profile', {
        name: fullName,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        mobileNumber: editForm.phoneNumber,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        postalCode: editForm.postalCode,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender
      });
      setProfileSuccess(t('member.profile.profileUpdated'));
      fetchProfile();
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error: any) {
      setProfileError(error.response?.data?.message || t('common.error'));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar role="MEMBER" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/member/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t('member.profile.myProfile')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{t('member.profile.personalInfo')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header with Avatar */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {editForm.firstName?.charAt(0) || editForm.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{t('member.profile.personalInfo')}</h2>
                    <p className="text-sm text-red-100">{editForm.firstName} {editForm.lastName}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                    <Edit2 size={16} /> {t('common.edit')}
                  </button>
                ) : (
                  <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                    <XCircle size={16} /> {t('common.cancel')}
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {profileSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {profileError}
                  </div>
                )}
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('member.profile.firstName')}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2 font-medium">{editForm.firstName || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('member.profile.lastName')}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2 font-medium">{editForm.lastName || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.email')}</label>
                      {isEditing ? (
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.mobileNumber')}</label>
                      {isEditing ? (
                        <input type="tel" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.phoneNumber || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.gender')}</label>
                      {isEditing ? (
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2">
                            <input type="radio" value="MALE" checked={editForm.gender === 'MALE'} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="text-red-600 focus:ring-red-500" />
                            <span className="text-gray-700">{t('common.male')}</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" value="FEMALE" checked={editForm.gender === 'FEMALE'} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="text-red-600 focus:ring-red-500" />
                            <span className="text-gray-700">{t('common.female')}</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" value="OTHER" checked={editForm.gender === 'OTHER'} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="text-red-600 focus:ring-red-500" />
                            <span className="text-gray-700">{t('common.other')}</span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.gender ? t(`common.${editForm.gender.toLowerCase()}`) : t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.dateOfBirth')}</label>
                      {isEditing ? (
                        <input type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toLocaleDateString() : t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.address')}</label>
                      {isEditing ? (
                        <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} rows={2} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.address || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('member.profile.city')}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.city || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('member.profile.state')}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.state || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('member.profile.postalCode')}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.postalCode} onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800" />
                      ) : (
                        <p className="text-gray-800 py-2">{editForm.postalCode || t('member.profile.notSpecified')}</p>
                      )}
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="mt-6 flex gap-3">
                      <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2">
                        <Save size={18} /> {t('member.profile.saveChanges')}
                      </button>
                      <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2">
                        <XCircle size={18} /> {t('common.cancel')}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}