// src/components/member/ViewEquipment.tsx
import { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Dumbbell, Bell, RefreshCw, Image as ImageIcon, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';

interface Equipment {
  _id: string;
  name: string;
  image: string;
  category: string;
}

// Updated getImageSrc function with proper URL handling
const getImageSrc = (imagePath: string, name: string): string => {
  if (!imagePath || imagePath === '') {
    return `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(name)}&length=2&size=120&font-size=40&bold=true`;
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiUrl}${imagePath}`;
};

export default function ViewEquipment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [searchTerm, equipment]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/equipment');
      setEquipment(response.data.data);
      setFilteredEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
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
    if (!searchTerm) {
      setFilteredEquipment(equipment);
    } else {
      const filtered = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
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
                  <h1 className="text-2xl font-bold text-gray-800">{t('member.equipment.title')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{t('member.equipment.subtitle')}</p>
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
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('common.searchEquipment') || 'Search by machine name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
              />
            </div>
          </div>

          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <Dumbbell className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">{t('member.equipment.noMachines')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredEquipment.map((machine) => (
                <div key={machine._id} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={getImageSrc(machine.image, machine.name)}
                      alt={machine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(machine.name)}&length=2&size=120&font-size=40&bold=true`;
                      }}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-800 text-lg">{machine.name}</h3>
                    {machine.category && (
                      <p className="text-xs text-gray-500 mt-1">{machine.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}