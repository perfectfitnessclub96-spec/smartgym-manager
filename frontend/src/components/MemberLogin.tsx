import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import axios from '../config/axios';

export default function MemberLogin() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'MEMBER') {
      navigate('/member/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, resendDisabled]);

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { 
        identifier: email, 
        type: 'MEMBER'
      });
      setStep('otp');
      setTimer(60);
      setResendDisabled(true);
      toast.success('OTP sent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/verify-otp', { 
        identifier: email, 
        otp: otpValue, 
        type: 'MEMBER' 
      });
      if (response.data.user) {
        setAuth(response.data.user);
        toast.success('Login successful!');
        navigate('/member/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { 
        identifier: email, 
        type: 'MEMBER'
      });
      setTimer(60);
      setResendDisabled(true);
      toast.success('OTP resent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    
    if (digits) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      document.getElementById(`otp-${nextIndex}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
     <div className="absolute top-8 left-8 cursor-pointer" onClick={() => navigate('/')}>
  <div className="flex items-center gap-3">
    <img 
      src="/logo.png" 
      alt="Gym Logo" 
      className="h-10 w-auto object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent) {
          const fallback = document.createElement('div');
          fallback.className = 'text-red-600';
          fallback.innerHTML = '💪';
          fallback.style.fontSize = '28px';
          parent.appendChild(fallback);
        }
      }}
    />
    <div>
      <span className="text-2xl font-bold text-gray-800">Perfect</span>
      <span className="text-2xl font-bold text-red-600"> Fitness</span>
      <p className="text-xs text-gray-500">Club</p>
    </div>
  </div>
</div>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-red-600" size={36} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Member Login</h2>
            <p className="text-gray-500">Sign in with your email address</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 text-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter 6-digit OTP sent to {email}
                </label>
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">Paste OTP or type manually</p>
              </div>
              
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Verify & Login
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setStep('email');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="w-full text-gray-500 hover:text-gray-700 transition"
              >
                ← Back to email
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={resendDisabled}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">Access your fitness journey</p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 text-sm transition flex items-center justify-center gap-1 mx-auto"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">Secure Member Portal • OTP Authentication</p>
        </div>
      </div>
    </div>
  );
}