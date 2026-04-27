// src/components/member/MySpaBookings.tsx
import { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, XCircle, ArrowLeft, Loader, CheckCircle, Sparkles, Bell, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';

interface Booking {
  _id: string;
  serviceId: { name: string; duration: number; description: string };
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
}

export default function MySpaBookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data.data);
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

  const handleCancel = async (bookingId: string) => {
    if (!confirm(t('member.bookings.confirmCancel'))) return;
    
    setCancelling(bookingId);
    try {
      await axios.put(`/api/bookings/bookings/${bookingId}/cancel`);
      alert(t('member.bookings.bookingCancelled'));
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setCancelling(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> {t('common.confirmed')}</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1"><XCircle size={12} /> {t('common.cancelled')}</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">{status}</span>;
    }
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
                  <h1 className="text-2xl font-bold text-gray-800">{t('member.bookings.myBookings')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{t('member.bookings.bookService')}</p>
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
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('member.bookings.noBookings')}</h3>
              <p className="text-gray-500 mb-6">{t('member.bookings.bookService')}</p>
              <button onClick={() => navigate('/member/book-wellness')} className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-semibold flex items-center gap-2 mx-auto">
                <Sparkles size={18} /> {t('member.wellness.bookWellness')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const bookingDate = new Date(booking.bookingDate);
                const startTime = new Date(booking.startTime);
                const isUpcoming = startTime > new Date();
                
                return (
                  <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{booking.serviceId?.name || t('common.wellnessService')}</h3>
                        <p className="text-sm text-gray-500 mt-1">{booking.serviceId?.duration || 0} {t('common.minutes')}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        {bookingDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        {startTime.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        Perfect Fitness Club
                      </div>
                    </div>
                    {booking.status === 'CONFIRMED' && isUpcoming && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelling === booking._id}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-xl hover:bg-red-100 transition disabled:opacity-50 font-medium"
                      >
                        {cancelling === booking._id ? (
                          <><Loader className="animate-spin" size={16} /> {t('common.loading')}</>
                        ) : (
                          <><XCircle size={18} /> {t('member.bookings.cancelBooking')}</>
                        )}
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && !isUpcoming && (
                      <div className="text-center text-sm text-gray-500 py-2">{t('common.expired')}</div>
                    )}
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