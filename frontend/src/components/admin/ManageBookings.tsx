import { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Search, Filter, Clock, User, Phone, Tag, DollarSign, 
  AlertCircle, RefreshCw, ArrowLeft, CheckCircle, XCircle, ArrowRight,
  Sparkles, Heart, Footprints, Wind, Activity as ActivityIcon, X,
  MapPin, Mail, FileText, Printer, Info
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';

interface Booking {
  _id: string;
  serviceId: { 
    name: string; 
    duration: number;
    priceForMember: number;
    priceForGuest: number;
    category?: string;
    description?: string;
  };
  memberId?: { 
    name: string; 
    mobileNumber: string; 
    email?: string;
    address?: string;
  };
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  amount: number;
  createdAt: string;
  updatedAt: string;
}

const getServiceIcon = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || '';
  if (name.includes('steam')) return <Wind size={24} className="text-blue-500" />;
  if (name.includes('foot')) return <Footprints size={24} className="text-green-500" />;
  if (name.includes('body')) return <Heart size={24} className="text-red-500" />;
  if (name.includes('kansa')) return <Sparkles size={24} className="text-purple-500" />;
  return <ActivityIcon size={24} className="text-gray-500" />;
};

const getServiceBgColor = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || '';
  if (name.includes('steam')) return 'bg-blue-50 border-blue-200';
  if (name.includes('foot')) return 'bg-green-50 border-green-200';
  if (name.includes('body')) return 'bg-red-50 border-red-200';
  if (name.includes('kansa')) return 'bg-purple-50 border-purple-200';
  return 'bg-gray-50 border-gray-200';
};

export default function ManageBookings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings/all');
      console.log('Bookings data:', response.data);
      setBookings(response.data.data);
      setFilteredBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    if (searchTerm) {
      filtered = filtered.filter(b => {
        const memberName = b.memberId?.name || '';
        const memberPhone = b.memberId?.mobileNumber || '';
        const guestName = b.guestName || '';
        const guestPhone = b.guestPhone || '';
        const serviceName = b.serviceId?.name || '';
        
        return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               memberPhone.includes(searchTerm) ||
               guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               guestPhone.includes(searchTerm) ||
               serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></div>{t('common.confirmed')}</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></div>{t('common.cancelled')}</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"></div>{t('common.completed')}</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getCustomerInfo = (booking: Booking) => {
    if (booking.memberId) {
      return {
        name: booking.memberId.name,
        phone: booking.memberId.mobileNumber,
        email: booking.memberId.email,
        type: t('common.member')
      };
    }
    return {
      name: booking.guestName || t('common.guest'),
      phone: booking.guestPhone || 'N/A',
      email: booking.guestEmail || t('common.notProvided'),
      type: t('common.guest')
    };
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Sidebar role="ADMIN" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {t('admin.bookings')}
                  </h1>
                  <p className="text-gray-500 text-sm">{t('admin.manageBookings')}</p>
                </div>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className="text-sm">{t('common.refresh')}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-sm text-gray-500">{t('admin.totalBookings')}</p></div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Calendar size={20} className="text-blue-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-2xl font-bold text-green-600">{stats.confirmed}</p><p className="text-sm text-gray-500">{t('common.confirmed')}</p></div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle size={20} className="text-green-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-2xl font-bold text-red-600">{stats.cancelled}</p><p className="text-sm text-gray-500">{t('common.cancelled')}</p></div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><XCircle size={20} className="text-red-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-2xl font-bold text-purple-600">{stats.completed}</p><p className="text-sm text-gray-500">{t('common.completed')}</p></div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Tag size={20} className="text-purple-600" /></div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder={t('common.searchBookings')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white">
                  <option value="all">{t('common.allStatus')}</option>
                  <option value="CONFIRMED">{t('common.confirmed')}</option>
                  <option value="COMPLETED">{t('common.completed')}</option>
                  <option value="CANCELLED">{t('common.cancelled')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('admin.noBookings')}</h3>
              <p className="text-gray-500">{t('common.tryAdjustingSearch')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const customer = getCustomerInfo(booking);
                const serviceName = booking.serviceId?.name || t('common.wellnessService');
                const serviceBgColor = getServiceBgColor(serviceName);
                const serviceIcon = getServiceIcon(serviceName);
                
                return (
                  <div key={booking._id} className={`bg-white rounded-2xl shadow-sm border ${serviceBgColor} overflow-hidden hover:shadow-md transition`}>
                    <div className={`h-1 ${booking.status === 'CONFIRMED' ? 'bg-green-500' : booking.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white">
                            {serviceIcon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{serviceName}</h3>
                            <p className="text-xs text-gray-500">{t('admin.wellnessService')}</p>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><User size={18} className="text-primary" /></div>
                          <div>
                            <p className="font-semibold text-gray-800">{customer.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={12} /><span>{customer.phone}</span>{customer.type === t('common.member') && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t('common.member')}</span>}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b border-gray-100 my-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{t('common.date')}</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{t('common.time')}</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {formatTime(booking.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{t('common.duration')}</p>
                          <p className="font-medium text-gray-900">{booking.serviceId?.duration || 30} {t('common.minutes')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{t('common.amount')}</p>
                          <p className="font-semibold text-green-600 flex items-center gap-1.5">
                            <DollarSign size={14} />
                            ₹{booking.amount}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button onClick={() => handleViewDetails(booking)} className="text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-red-700 font-medium flex items-center gap-2 transition">
                          {t('View Full Details')} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t('common.bookingDetails')}</h2>
                  <p className="text-xs text-gray-500">{t('common.bookingId')}: {selectedBooking._id.slice(-8)}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Service Information */}
              <div className="bg-gradient-to-r from-primary/5 to-red-50 rounded-xl p-5 border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  {getServiceIcon(selectedBooking.serviceId?.name)}
                  <h3 className="text-lg font-semibold text-gray-800">{t('common.serviceInformation')}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">{t('common.serviceName')}</p>
                    <p className="text-xl font-bold text-primary">{selectedBooking.serviceId?.name || t('common.wellnessService')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.duration')}</p>
                    <p className="font-semibold text-gray-800">{selectedBooking.serviceId?.duration || 30} {t('common.minutes')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.amount')}</p>
                    <p className="font-semibold text-green-600">₹{selectedBooking.amount}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <User size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-gray-800">{t('common.customerInformation')}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">{t('common.customerName')}</p>
                    <p className="font-semibold text-gray-800">{getCustomerInfo(selectedBooking).name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.customerType')}</p>
                    <p className="font-semibold text-gray-800">{getCustomerInfo(selectedBooking).type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.phoneNumber')}</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {getCustomerInfo(selectedBooking).phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.email')}</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {getCustomerInfo(selectedBooking).email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-gray-800">{t('common.bookingDetails')}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">{t('common.bookingDate')}</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(selectedBooking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.startTime')}</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {formatTime(selectedBooking.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.endTime')}</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {formatTime(selectedBooking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.status')}</p>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Info size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-gray-800">{t('common.additionalInfo')}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">{t('common.createdAt')}</p>
                    <p className="font-semibold text-gray-800">{formatDateTime(selectedBooking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('common.updatedAt')}</p>
                    <p className="font-semibold text-gray-800">{formatDateTime(selectedBooking.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium">
                  <Printer size={18} /> {t('common.printDetails')}
                </button>
                <button onClick={closeModal} className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-red-700 transition font-medium">
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}