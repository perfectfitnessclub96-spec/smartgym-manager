// src/components/AdminLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import axios from '../config/axios';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user, checkAuth } = useAuthStore();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      await checkAuth();
      if (isAuthenticated && user?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    };
    checkAuthStatus();
  }, []);

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
      console.log('Sending OTP to:', email);
      const response = await axios.post('/api/auth/send-otp', { 
        identifier: email, 
        type: 'ADMIN'
      });
      console.log('OTP sent response:', response.data);
      toast.success('OTP sent to your email!');
      setStep('otp');
      setTimer(60);
      setResendDisabled(true);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
      toast.error(errorMsg);
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
      console.log('Verifying OTP for:', email, 'OTP:', otpValue);
      const response = await axios.post('/api/auth/verify-otp', { 
        identifier: email, 
        otp: otpValue, 
        type: 'ADMIN' 
      });
      
      console.log('Verify OTP response:', response.data);
      
      if (response.data.user) {
        setAuth(response.data.user);
        toast.success('Login successful!');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      const errorMsg = err.response?.data?.message || 'Invalid OTP';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { 
        identifier: email, 
        type: 'ADMIN'
      });
      setTimer(60);
      setResendDisabled(true);
      toast.success('OTP resent successfully!');
    } catch (err: any) {
      toast.error('Failed to resend OTP');
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
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
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
      document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
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

      {/* Login Card */}
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Mail className="text-red-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in with your email address</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 'email' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email address" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 bg-white" 
                    required 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Use: admin@perfectfitness.com</p>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Sending...</>
                ) : (
                  <>Send OTP <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Input */
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
                      className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 bg-white" 
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">Check terminal for OTP (development mode)</p>
              </div>
              <button 
                onClick={handleVerifyOTP} 
                disabled={loading} 
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Verifying...</>
                ) : (
                  <>Verify & Login</>
                )}
              </button>
              <button 
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }} 
                className="w-full text-gray-500 hover:text-gray-700 transition text-sm"
              >
                ← Back
              </button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">Resend OTP in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                ) : (
                  <button onClick={handleResendOTP} disabled={resendDisabled} className="text-sm text-red-600 hover:underline disabled:opacity-50">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">Access your fitness journey</p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm transition flex items-center justify-center gap-1 mx-auto">
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">Secure Admin Portal • OTP Authentication</p>
        </div>
      </div>
    </div>
  );
}