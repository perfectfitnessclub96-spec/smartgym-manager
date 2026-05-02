// src/components/admin/ManageEquipment.tsx
import { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, X, ArrowLeft, Upload, 
  Dumbbell, RefreshCw, Search, Grid3x3, List, Clock,
  Heart, Activity, Target, Armchair, BarChart, Image as ImageIcon, Bell,
  CheckCircle, AlertCircle, Info, Camera
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import { useToast } from '../../hooks/useToast';

interface Equipment {
  _id: string;
  name: string;
  image: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Updated getImageSrc function with proper URL handling
const getImageSrc = (imagePath: string, name: string): string => {
  if (!imagePath || imagePath === '') {
    return `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(name)}&length=2&size=120&font-size=40&bold=true`;
  }
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // For local images, use the API URL from environment
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiUrl}${imagePath}`;
};

// Equipment categories with translation keys
const categories = [
  { id: 'Cardio Machines', nameKey: 'equipment.categories.cardio', icon: '❤️', color: 'red' },
  { id: 'Strength Machines', nameKey: 'equipment.categories.strength', icon: '💪', color: 'blue' },
  { id: 'Bench Equipment', nameKey: 'equipment.categories.bench', icon: '🪑', color: 'green' },
  { id: 'Free Weight Equipment', nameKey: 'equipment.categories.freeWeight', icon: '🏋️', color: 'purple' },
  { id: 'Storage / Accessories', nameKey: 'equipment.categories.storage', icon: '📦', color: 'orange' },
];

export default function ManageEquipment() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    image: null as File | null,
    category: 'Cardio Machines'
  });
  const [imagePreview, setImagePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; image?: string }>({});

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
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [searchTerm, selectedCategory, equipment]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/equipment');
      setEquipment(response.data.data);
      setFilteredEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showError(getText('common.error', 'Failed to load equipment'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEquipment();
    setRefreshing(false);
  };

  const filterEquipment = () => {
    let filtered = [...equipment];
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    setFilteredEquipment(filtered);
  };

  const validateForm = () => {
    const errors: { name?: string; image?: string } = {};
    if (!formData.name.trim()) {
      errors.name = getText('equipment.errors.nameRequired', 'Machine name is required');
    } else if (formData.name.length < 2) {
      errors.name = getText('equipment.errors.nameMin', 'Machine name must be at least 2 characters');
    } else if (formData.name.length > 50) {
      errors.name = getText('equipment.errors.nameMax', 'Machine name must be less than 50 characters');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(getText('equipment.errors.imageSize', 'Image size must be less than 4 MB'));
      setFormErrors(prev => ({ ...prev, image: getText('equipment.errors.imageSize', 'Image size must be less than 4 MB') }));
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError(getText('equipment.errors.imageType', 'Only JPG, PNG, GIF, and WEBP images are allowed'));
      setFormErrors(prev => ({ ...prev, image: getText('equipment.errors.imageType', 'Invalid image format') }));
      return;
    }
    
    setFormData({ ...formData, image: file });
    setFormErrors(prev => ({ ...prev, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('category', formData.category);
    if (formData.image) {
      submitData.append('image', formData.image);
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };
      
      if (editingEquipment) {
        await axios.put(`/api/equipment/${editingEquipment._id}`, submitData, config);
        showSuccess(getText('equipment.messages.updated', 'Machine updated successfully'));
      } else {
        await axios.post('/api/equipment', submitData, config);
        showSuccess(getText('equipment.messages.added', 'Machine added successfully'));
      }
      setShowModal(false);
      resetForm();
      fetchEquipment();
    } catch (error: any) {
      showError(error.response?.data?.message || getText('common.error', 'Error saving machine'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(getText('equipment.confirmDelete', `Are you sure you want to delete "${name}"?`))) {
      try {
        await axios.delete(`/api/equipment/${id}`);
        showSuccess(getText('equipment.messages.deleted', 'Machine deleted successfully'));
        fetchEquipment();
      } catch (error: any) {
        showError(error.response?.data?.message || getText('common.error', 'Error deleting machine'));
      }
    }
  };

  const handleEdit = (equip: Equipment) => {
    setEditingEquipment(equip);
    setFormData({ 
      name: equip.name, 
      image: null,
      category: equip.category || 'Cardio Machines'
    });
    setImagePreview(getImageSrc(equip.image, equip.name));
    setFormErrors({});
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEquipment(null);
    setFormData({ name: '', image: null, category: 'Cardio Machines' });
    setImagePreview('');
    setUploadProgress(0);
    setFormErrors({});
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const translated = t(category.nameKey);
      if (translated === category.nameKey) return category.id;
      return translated;
    }
    return categoryId;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    switch (cat?.color) {
      case 'red': return 'bg-red-100 text-red-700';
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'purple': return 'bg-purple-100 text-purple-700';
      case 'orange': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{getText('common.loading', 'Loading equipment...')}</p>
        </div>
      </div>
    );
  }

  const totalMachines = equipment.length;
  const totalCategories = new Set(equipment.map(e => e.category)).size;
  
  // ✅ FIXED: Calculate actual machines added this month
  const addedThisMonth = equipment.filter(e => {
    const createdAt = new Date(e.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && 
           createdAt.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
      <Sidebar role="ADMIN" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{getText('admin.equipment', 'Equipment Management')}</h1>
                  <p className="text-gray-500 text-sm mt-0.5">{getText('equipment.subtitle', 'Manage and view all gym equipment')}</p>
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
          {/* Stats Cards - ALL REAL DATA NOW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('equipment.stats.totalMachines', 'Total Machines')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalMachines}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Dumbbell className="text-red-600" size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('equipment.stats.categories', 'Categories')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalCategories}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BarChart className="text-blue-600" size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{getText('equipment.stats.addedThisMonth', 'Added This Month')}</p>
                  {/* ✅ FIXED: Shows actual count, not totalMachines */}
                  <p className="text-2xl font-bold text-gray-800 mt-1">{addedThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Clock className="text-purple-600" size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar - Works on REAL data */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={getText('equipment.search', 'Search by machine name or category...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-4 pr-8 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white text-gray-800"
                >
                  <option value="all">{getText('equipment.allCategories', 'All Categories')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{getCategoryName(cat.id)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                  >
                    <Grid3x3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition font-semibold shadow-md"
                >
                  <Plus size={18} />
                  {getText('equipment.addMachine', 'Add New Machine')}
                </button>
              </div>
            </div>
          </div>

          {/* Equipment List - ALL REAL DATA from API */}
          {filteredEquipment.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Dumbbell className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{getText('equipment.noEquipment', 'No equipment found')}</h3>
              <p className="text-gray-500 mb-6">{getText('equipment.adjustSearch', 'Try adjusting your search or add a new machine')}</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-semibold"
              >
                <Plus size={18} />
                {getText('equipment.addFirstMachine', 'Add Your First Machine')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.map((machine) => (
                <div key={machine._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="relative h-40 bg-gray-100">
                    <img
                      src={getImageSrc(machine.image, machine.name)}
                      alt={machine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(machine.name)}&length=2&size=120&font-size=40&bold=true`;
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEdit(machine)}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-100 text-gray-600"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(machine._id, machine.name)}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-lg">{machine.name}</h3>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(machine.category)}`}>
                      {getCategoryName(machine.category || 'Uncategorized')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEquipment.map((machine) => (
                <div key={machine._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={getImageSrc(machine.image, machine.name)}
                        alt={machine.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(machine.name)}&length=2&size=64&font-size=24&bold=true`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{machine.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-medium ${getCategoryColor(machine.category)}`}>
                        {getCategoryName(machine.category || 'Uncategorized')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(machine)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={14} /> {getText('common.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(machine._id, machine.name)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 size={14} /> {getText('common.delete', 'Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Machine Modal - REST OF THE CODE REMAINS THE SAME */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Dumbbell size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingEquipment ? getText('equipment.editMachine', 'Edit Machine') : getText('equipment.addNewMachine', 'Add New Machine')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingEquipment ? getText('equipment.updateDetails', 'Update machine details') : getText('equipment.fillDetails', 'Fill in the details to add a new machine')}
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
                  {getText('equipment.machineName', 'Machine Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  placeholder={getText('equipment.namePlaceholder', 'e.g., Treadmill, Leg Press Machine, etc.')}
                  className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 transition`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('equipment.category', 'Category')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                        formData.category === cat.id
                          ? `border-${cat.color}-500 bg-${cat.color}-50 text-${cat.color}-700`
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm">{getCategoryName(cat.id)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('equipment.machineImage', 'Machine Image')}
                  <span className="text-gray-400 text-xs ml-2">({getText('equipment.optional', 'Optional')})</span>
                </label>
                
                {!imagePreview ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 border-dashed'} rounded-xl transition-colors cursor-pointer hover:border-red-400`}
                  >
                    <div className="space-y-2 text-center">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="mx-auto h-12 w-12" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                          <span>{getText('equipment.uploadFile', 'Upload a file')}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">{getText('equipment.dragDrop', 'or drag and drop')}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {getText('equipment.imageRequirements', 'PNG, JPG, GIF, WEBP up to 4MB')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute bottom-2 right-2 px-2 py-1 bg-white text-gray-700 rounded-lg text-xs shadow-md hover:bg-gray-100 transition"
                    >
                      {getText('equipment.changeImage', 'Change Image')}
                    </button>
                  </div>
                )}
                {formErrors.image && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {formErrors.image}
                  </p>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{getText('equipment.uploading', 'Uploading image...')}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">{getText('equipment.proTip', 'Pro Tip')}</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      {getText('equipment.imageTip', 'Adding clear images of your equipment helps members easily identify machines. Use high-quality photos for better visibility.')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {getText('equipment.uploading', 'Uploading...')}
                    </>
                  ) : (
                    <>
                      {editingEquipment ? <CheckCircle size={18} /> : <Plus size={18} />}
                      {editingEquipment ? getText('equipment.updateMachine', 'Update Machine') : getText('equipment.addMachine', 'Add Machine')}
                    </>
                  )}
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