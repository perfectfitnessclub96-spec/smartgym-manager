// src/components/admin/AddMember.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import { ArrowLeft, UserPlus, CheckCircle, Users, Calendar, Phone, Mail, MapPin, User, CreditCard, Award, Calendar as CalendarIcon, Clock, Shield, Gift, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import PageHeader from '../common/PageHeader';
import { useToast } from '../../hooks/useToast';

interface MembershipPlan {
  _id: string;
  name: string;
  duration: string;
  durationInDays: number;
  price: number;
  isActive: boolean;
}

export default function AddMember() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    planId: '',
    joiningDate: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE',
    photo: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedMemberEmail, setAddedMemberEmail] = useState('');
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
    fetchPlans();
    // Set default joining date to today in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    setFormData(prev => ({ ...prev, joiningDate: todayStr }));
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/membership/plans');
      console.log('Plans response:', response.data);
      if (response.data.success && response.data.data.length > 0) {
        setPlans(response.data.data);
        setFormData(prev => ({ ...prev, planId: response.data.data[0]._id }));
        setSelectedPlanDetails(response.data.data[0]);
      } else {
        showError('No membership plans found. Please contact admin.');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      showError('Failed to load plans');
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value;
    setFormData({ ...formData, planId });
    const selected = plans.find(p => p._id === planId);
    setSelectedPlanDetails(selected || null);
    // Clear plan error if exists
    if (formErrors.planId) {
      setFormErrors(prev => ({ ...prev, planId: '' }));
    }
  };

  // Calculate expiry date based on joining date and plan duration
  const calculateExpiryDate = () => {
    if (!formData.joiningDate || !selectedPlanDetails) return '';
    const startDate = new Date(formData.joiningDate);
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + selectedPlanDetails.durationInDays);
    return expiryDate.toLocaleDateString();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.planId) {
      errors.planId = 'Please select a membership plan';
    }
    
    if (!formData.joiningDate) {
      errors.joiningDate = 'Please select joining date';
    }
    
    if (formData.mobileNumber && !/^[0-9]{10}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be 10 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber || undefined,
        planId: formData.planId,
        joiningDate: formData.joiningDate,
        address: formData.address || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        photo: formData.photo || undefined
      };
      
      console.log('Sending request:', requestData);
      
      const response = await axios.post('/api/membership/members', requestData);
      
      if (response.data.success) {
        setAddedMemberEmail(formData.email);
        setShowSuccessModal(true);
        showSuccess('Member added successfully');
        resetForm();
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error adding member:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error adding member';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const resetForm = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    setFormData({
      name: '',
      email: '',
      mobileNumber: '',
      planId: plans.length > 0 ? plans[0]._id : '',
      joiningDate: todayStr,
      address: '',
      dateOfBirth: '',
      gender: 'MALE',
      photo: ''
    });
    setFormErrors({});
    if (plans.length > 0) {
      setSelectedPlanDetails(plans[0]);
    }
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

  if (loading && !showSuccessModal) {
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
          title={getText('admin.addNewMember', 'Add New Member')}
          subtitle={getText('admin.addMember', 'Add Member')}
          showBackButton={true}
        />

        <main className="p-6">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <UserPlus size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{getText('member.profile.personalInfo', 'Personal Information')}</h2>
                    <p className="text-red-100 text-sm">{getText('admin.addMember', 'Add Member')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name - Required */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.fullName', 'Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800`}
                        placeholder="Enter full name"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.emailAddress', 'Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800`}
                        placeholder="member@example.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.mobileNumber', 'Mobile Number')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, mobileNumber: e.target.value });
                          if (formErrors.mobileNumber) setFormErrors(prev => ({ ...prev, mobileNumber: '' }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 border ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800`}
                        placeholder="9876543210"
                      />
                    </div>
                    {formErrors.mobileNumber && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Joining Date - Required - FIXED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('member.joiningDate', 'Joining Date')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        required
                        value={formData.joiningDate}
                        onChange={(e) => {
                          setFormData({ ...formData, joiningDate: e.target.value });
                          if (formErrors.joiningDate) setFormErrors(prev => ({ ...prev, joiningDate: '' }));
                          // Recalculate expiry when joining date changes
                          if (selectedPlanDetails) {
                            setSelectedPlanDetails({ ...selectedPlanDetails });
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border ${formErrors.joiningDate ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800`}
                      />
                    </div>
                    {formErrors.joiningDate && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.joiningDate}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {getText('member.membershipStartFrom', 'Membership will start from this date')}
                    </p>
                  </div>

                  {/* Membership Plan - Required - FIXED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.membershipPlan', 'Membership Plan')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        required
                        value={formData.planId}
                        onChange={handlePlanChange}
                        className={`w-full pl-10 pr-4 py-3 border ${formErrors.planId ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white text-gray-800 cursor-pointer`}
                      >
                        {plans.map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.name} - ₹{plan.price} ({plan.durationInDays} days)
                          </option>
                        ))}
                      </select>
                    </div>
                    {formErrors.planId && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.planId}
                      </p>
                    )}
                    {selectedPlanDetails && formData.joiningDate && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg flex items-center gap-2 border border-green-200">
                        <Award size={14} className="text-green-600" />
                        <span className="text-xs text-green-700">
                          {selectedPlanDetails.durationInDays} days validity • 
                          Expires on: {calculateExpiryDate()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth - Optional - FIXED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.dateOfBirth', 'Date of Birth')}
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>

                  {/* Gender - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.gender', 'Gender')}
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white text-gray-800 cursor-pointer"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Address - Optional */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('common.address', 'Address')}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                        placeholder="Enter address (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <UserPlus size={18} />
                    {loading ? 'Adding...' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/members')}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Email Login</p>
                    <p className="text-xs text-gray-500">Member logs in with email</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Gift size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Welcome Email</p>
                    <p className="text-xs text-gray-500">Login instructions sent via email</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">OTP Authentication</p>
                    <p className="text-xs text-gray-500">Secure one-time password login</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
              <p className="text-gray-600 text-sm mt-1">Member added successfully!</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                A welcome email has been sent to <strong>{addedMemberEmail}</strong>
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                The member can now login using their email address.
              </p>
              {formData.joiningDate && selectedPlanDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-600">
                    Membership: {new Date(formData.joiningDate).toLocaleDateString()} to {calculateExpiryDate()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition font-semibold"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition font-semibold"
              >
                Add Another Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}