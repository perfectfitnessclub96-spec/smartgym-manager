// src/components/admin/ManageAdmins.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../config/axios';
import { Plus, Edit, Trash2, X, Mail, User, Shield, RefreshCw, ArrowLeft, CheckCircle, AlertCircle, Bell, Phone, MoreVertical, Users as UsersIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import toast from 'react-hot-toast';

interface Admin {
  _id: string;
  email?: string;
  mobileNumber?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  isActive: boolean;
  createdAt: string;
}

export default function ManageAdmins() {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    role: 'STAFF'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [language, setLanguage] = useState(i18n.language);

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
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/users');
      setAdmins(response.data.data);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      setError(error.response?.data?.message || getText('common.error', 'Failed to fetch admins'));
      toast.error(getText('common.error', 'Failed to load admins'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdmins();
    setRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error(getText('admin.nameRequired', 'Please enter admin name'));
      return;
    }
    
    if (!formData.email && !formData.mobileNumber) {
      toast.error(getText('admin.emailOrMobileRequired', 'Please enter either email or mobile number'));
      return;
    }
    
    try {
      if (editingAdmin) {
        await axios.put(`/api/admin/users/${editingAdmin._id}`, formData);
        setSuccessMessage(getText('admin.adminUpdated', 'Admin updated successfully'));
        toast.success(getText('admin.adminUpdated', 'Admin updated successfully'));
      } else {
        await axios.post('/api/admin/users', formData);
        setSuccessMessage(getText('admin.adminAdded', 'Admin added successfully'));
        toast.success(getText('admin.adminAdded', 'Admin added successfully'));
      }
      setShowModal(false);
      resetForm();
      fetchAdmins();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('common.error', 'Error saving admin'));
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (confirm(getText('admin.confirmDeleteAdmin', `Are you sure you want to delete "${adminName}"?`))) {
      try {
        await axios.delete(`/api/admin/users/${adminId}`);
        setSuccessMessage(getText('admin.adminDeleted', 'Admin deleted successfully'));
        toast.success(getText('admin.adminDeleted', 'Admin deleted successfully'));
        fetchAdmins();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error: any) {
        toast.error(error.response?.data?.message || getText('common.error', 'Error deleting admin'));
      }
    }
  };

  const resetForm = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', mobileNumber: '', role: 'STAFF' });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">{getText('admin.superAdmin', 'Super Admin')}</span>;
      case 'ADMIN':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{getText('admin.admin', 'Admin')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{getText('admin.staff', 'Staff')}</span>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="text-purple-600" size={16} />;
      case 'ADMIN':
        return <User className="text-blue-600" size={16} />;
      default:
        return <User className="text-gray-600" size={16} />;
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

  const stats = {
    total: admins.length,
    superAdmins: admins.filter(a => a.role === 'SUPER_ADMIN').length,
    adminsCount: admins.filter(a => a.role === 'ADMIN').length,
    staff: admins.filter(a => a.role === 'STAFF').length,
    active: admins.filter(a => a.isActive).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{getText('common.loading', 'Loading admins...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
      <Sidebar role="ADMIN" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{getText('admin.manageAdmins', 'Manage Admins')}</h1>
                  <p className="text-gray-500 text-sm mt-0.5">{getText('admin.addAndManageAdmins', 'Add and manage admin users')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <RefreshCw size={18} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                  <Bell className="text-gray-500" size={20} />
                </button>
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
              <CheckCircle size={16} />
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.total', 'Total')}</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UsersIcon className="text-blue-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.superAdmin', 'Super Admins')}</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.superAdmins}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="text-purple-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.admin', 'Admins')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.adminsCount}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="text-blue-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('admin.staff', 'Staff')}</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.staff}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <UsersIcon className="text-gray-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('common.active', 'Active')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{getText('admin.adminUsers', 'Admin Users')}</h2>
              <p className="text-sm text-gray-500">{getText('admin.manageSystemAdmins', 'Manage system administrators and their roles')}</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold shadow-md"
            >
              <Plus size={18} />
              {getText('admin.addNewAdmin', 'Add New Admin')}
            </button>
          </div>

          {/* Admins Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('common.name', 'Name')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('common.email', 'Email')} / {getText('common.mobile', 'Mobile')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('common.role', 'Role')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('common.status', 'Status')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('common.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            {getRoleIcon(admin.role)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{admin.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {admin.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail size={14} className="text-gray-400" />
                              <span>{admin.email}</span>
                            </div>
                          )}
                          {admin.mobileNumber && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              <span>{admin.mobileNumber}</span>
                            </div>
                          )}
                          {!admin.email && !admin.mobileNumber && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(admin.role)}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          admin.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            admin.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {admin.isActive ? getText('common.active', 'Active') : getText('common.inactive', 'Inactive')}
                        </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingAdmin(admin);
                              setFormData({
                                name: admin.name,
                                email: admin.email || '',
                                mobileNumber: admin.mobileNumber || '',
                                role: admin.role
                              });
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title={getText('common.edit', 'Edit Admin')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin._id, admin.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title={getText('common.delete', 'Delete Admin')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {admins.length === 0 && (
              <div className="text-center py-12">
                <Shield className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">{getText('admin.noAdminsFound', 'No admin users found')}</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="mt-3 text-red-600 hover:underline text-sm font-medium"
                >
                  {getText('admin.addFirstAdmin', 'Add your first admin')}
                </button>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">{getText('admin.adminManagementNote', 'Admin Management Note')}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {getText('admin.adminNote', 'Super Admins have full access to manage all settings including other admins. The admin will receive login instructions via email if email is provided.')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingAdmin ? getText('admin.editAdmin', 'Edit Admin') : getText('admin.addNewAdmin', 'Add New Admin')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingAdmin ? getText('admin.updateDetails', 'Update admin details') : getText('admin.fillDetails', 'Fill in the details to add a new admin')}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('common.fullName', 'Full Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={getText('admin.namePlaceholder', 'Enter admin name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('common.email', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={getText('admin.emailPlaceholder', 'admin@example.com')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('common.mobileNumber', 'Mobile Number')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder={getText('admin.mobilePlaceholder', '9876543210')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('common.role', 'Role')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                >
                  <option value="STAFF">{getText('admin.staff', 'Staff')}</option>
                  <option value="ADMIN">{getText('admin.admin', 'Admin')}</option>
                  <option value="SUPER_ADMIN">{getText('admin.superAdmin', 'Super Admin')}</option>
                </select>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">{getText('admin.note', 'Note')}</p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      {getText('admin.adminNote', 'Super Admins have full access to manage all settings including other admins. The admin will receive login instructions via email if email is provided.')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold shadow-md"
                >
                  {editingAdmin ? getText('admin.updateAdmin', 'Update Admin') : getText('admin.addAdmin', 'Add Admin')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  {getText('common.cancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}