// src/components/member/BookWellness.tsx
import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, Clock, Users, Sparkles, ArrowLeft, CheckCircle, AlertCircle,
  Bell, RefreshCw, Heart, ActivityIcon, Wind, Footprints, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../common/Sidebar';
import { useToast } from '../../hooks/useToast';

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  capacity: number;
  priceForMember: number;
}

interface TimeSlot {
  time: string;
  displayTime: string;
  available: boolean;
  remainingSlots: number;
}

export default function BookWellness() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
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
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedService, selectedDate]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings/services');
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(getText('common.error', 'Failed to load services'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/bookings/availability', {
        params: { serviceId: selectedService?._id, date: selectedDate }
      });
      setTimeSlots(response.data.data);
      if (response.data.message) {
        setError(response.data.message);
      }
    } catch (error) {
      setError(getText('common.error', 'Failed to load available slots'));
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setLoading(true);
    try {
      await axios.post('/api/bookings/bookings', {
        serviceId: selectedService._id,
        bookingDate: selectedDate,
        startTime: selectedSlot.time
      });
      setBookingSuccess(true);
      showSuccess(getText('member.wellness.bookingConfirmed', 'Booking confirmed successfully!'));
      setTimeout(() => {
        navigate('/member/my-spa-bookings');
      }, 2000);
    } catch (error: any) {
      showError(error.response?.data?.message || getText('common.error', 'Error creating booking'));
      setLoading(false);
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

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDay();
      if (day === 5 || day === 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
        });
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md border border-gray-200">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{getText('member.wellness.bookingConfirmed', 'Booking Confirmed!')}</h2>
          <p className="text-gray-600">{getText('member.wellness.bookingSuccessMsg', 'Your wellness service has been booked successfully.')}</p>
          <p className="text-sm text-gray-500 mt-4">{getText('member.wellness.redirecting', 'Redirecting to your bookings...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
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
                  <h1 className="text-2xl font-bold text-gray-800">{getText('member.wellness.bookWellness', 'Book Spa Service')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{getText('member.wellness.spaServices', 'Wellness & relaxation services')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="text-red-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">{getText('member.wellness.selectService', 'Select a Service')}</h2>
              </div>
              {loading && <div className="text-center py-8 text-gray-500">{getText('common.loading', 'Loading...')}</div>}
              {!loading && services.length === 0 && <div className="text-center py-8 text-gray-500">{getText('common.noData', 'No services available')}</div>}
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => { setSelectedService(service); setStep(2); }}
                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-gray-600"><Clock size={14} /> {service.duration} {getText('member.wellness.minutes', 'minutes')}</span>
                          <span className="flex items-center gap-1 text-gray-600"><Users size={14} /> {getText('member.wellness.maxPersons', 'Max')} {service.capacity} {getText('member.wellness.persons', 'persons')}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-green-600">{getText('member.wellness.freeForMembers', 'FREE for Members')}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedService && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <button onClick={() => setStep(1)} className="text-red-600 mb-4 flex items-center gap-1 hover:underline">
                ← {getText('member.wellness.backToServices', 'Back to Services')}
              </button>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="text-red-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">{getText('member.wellness.selectDate', 'Select Date')}</h2>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-yellow-700">{getText('member.wellness.availableOnly', 'Services available only on Fridays & Saturdays')} | {getText('member.wellness.timings', '5:00 AM - 10:00 PM')} ({getText('member.wellness.lunchBreak', 'Closed 1-2 PM')})</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => { setSelectedDate(date.value); setStep(3); }}
                    className="p-3 text-center rounded-xl border border-gray-200 transition-all hover:border-red-300 hover:bg-red-50"
                  >
                    <p className="font-semibold text-gray-800">{date.display.split(',')[0]}</p>
                    <p className="text-sm text-gray-500">{date.display.split(',')[1]}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && selectedService && selectedDate && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <button onClick={() => setStep(2)} className="text-red-600 mb-4 flex items-center gap-1 hover:underline">
                ← {getText('member.wellness.backToDate', 'Back to Date')}
              </button>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{getText('member.wellness.selectTime', 'Select Time')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedService.name} • {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>
              {error && <div className="mb-4 p-3 bg-yellow-50 rounded-xl text-yellow-700 text-sm">{error}</div>}
              {loading ? (
                <div className="text-center py-12 text-gray-500">{getText('common.loading', 'Loading slots...')}</div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">{getText('common.noData', 'No slots available for this date')}</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={!slot.available}
                        className={`p-3 text-center rounded-xl border transition-all ${
                          selectedSlot?.time === slot.time
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                            : slot.available
                              ? 'border-gray-200 hover:border-red-300 hover:bg-red-50 cursor-pointer bg-white'
                              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <p className="font-semibold text-gray-800">{slot.displayTime}</p>
                        {selectedService.capacity > 1 && (
                          <p className="text-xs text-gray-500 mt-1">{slot.remainingSlots} {getText('member.wellness.left', 'left')}</p>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedSlot && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CheckCircle size={18} /> {getText('member.wellness.bookingSummary', 'Booking Summary')}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">{getText('member.wellness.selectService', 'Service')}:</span>
                            <span className="font-medium text-gray-800">{selectedService.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{getText('member.wellness.selectDate', 'Date')}:</span>
                            <span className="font-medium text-gray-800">{new Date(selectedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{getText('member.wellness.selectTime', 'Time')}:</span>
                            <span className="font-medium text-gray-800">{selectedSlot.displayTime}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-200">
                            <span className="text-gray-600">{getText('common.amount', 'Amount')}:</span>
                            <span className="text-green-600 font-semibold">{getText('member.wellness.freeForMembers', 'FREE for Members')}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleBooking} disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold">
                        {loading ? getText('member.wellness.processing', 'Processing...') : getText('member.wellness.confirmBooking', 'Confirm Booking')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}