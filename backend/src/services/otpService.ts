// backend/src/services/otpService.ts
import { sendOTPEmail as sendEmail } from './emailService';

// In-memory OTP store
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (identifier: string, otp: string): void => {
  otpStore.set(identifier.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0
  });
  
  setTimeout(() => {
    if (otpStore.get(identifier.toLowerCase())?.otp === otp) {
      otpStore.delete(identifier.toLowerCase());
    }
  }, 5 * 60 * 1000);
};

export const verifyOTP = (identifier: string, otp: string): { valid: boolean; message: string } => {
  const stored = otpStore.get(identifier.toLowerCase());
  if (!stored) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (stored.expiresAt < Date.now()) {
    otpStore.delete(identifier.toLowerCase());
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (stored.attempts >= 3) {
    otpStore.delete(identifier.toLowerCase());
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  if (stored.otp !== otp) {
    stored.attempts++;
    otpStore.set(identifier.toLowerCase(), stored);
    return { valid: false, message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.` };
  }
  
  otpStore.delete(identifier.toLowerCase());
  return { valid: true, message: 'OTP verified successfully' };
};

export const clearOTP = (identifier: string): void => {
  otpStore.delete(identifier.toLowerCase());
};

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  return await sendEmail(email, otp, name);
};