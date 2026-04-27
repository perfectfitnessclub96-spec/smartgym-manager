// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser';
import Member from '../models/Member';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail as sendOTPService, clearOTP } from '../services/otpService';
import { sendWelcomeEmail } from '../services/emailService';
import { checkAccountLockout, recordFailedAttempt, resetFailedAttempts } from '../services/lockoutService';
import { blacklistToken } from '../middleware/tokenBlacklist';

// Send OTP based on user type
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { identifier, type } = req.body;
    
    if (!identifier || !type) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check account lockout before sending OTP
    const lockoutCheck = checkAccountLockout(identifier);
    if (lockoutCheck.locked) {
      return res.status(429).json({ 
        message: `Account is temporarily locked. Please try again after ${lockoutCheck.remainingMinutes} minutes.` 
      });
    }

    // Check if it's a valid email
    if (!identifier.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    let user = null;
    let userName = '';
    
    if (type === 'ADMIN') {
      user = await AdminUser.findOne({ email: identifier.toLowerCase().trim() });
      if (!user) {
        return res.status(404).json({ message: 'No admin account found with this email' });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: 'Your account is inactive. Please contact support.' });
      }
      userName = user.name;
    } else if (type === 'MEMBER') {
      user = await Member.findOne({ email: identifier.toLowerCase().trim() });
      if (!user) {
        return res.status(404).json({ message: 'No member account found with this email' });
      }
      if (user.status !== 'ACTIVE') {
        return res.status(401).json({ message: 'Your account is inactive. Please contact admin.' });
      }
      userName = user.name;
    } else {
      return res.status(400).json({ message: 'Invalid login type' });
    }

    const otp = generateOTP();
    storeOTP(identifier, otp);
    
    const sent = await sendOTPService(identifier, otp, userName);
    
    if (!sent && process.env.NODE_ENV === 'development') {
      console.log(`\n=================================`);
      console.log(`📧 [DEV MODE] OTP to: ${identifier}`);
      console.log(`🔑 Your OTP is: ${otp}`);
      console.log(`=================================\n`);
    }

    res.json({ message: `OTP sent to your email address` });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Verify OTP and Login with Lockout Protection
export const verifyOTPAndLogin = async (req: Request, res: Response) => {
  try {
    const { identifier, otp, type } = req.body;

    if (!identifier || !otp || !type) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check account lockout before verification
    const lockoutCheck = checkAccountLockout(identifier);
    if (lockoutCheck.locked) {
      return res.status(429).json({ 
        message: `Account is temporarily locked. Please try again after ${lockoutCheck.remainingMinutes} minutes.` 
      });
    }

    const verification = verifyOTP(identifier, otp);
    if (!verification.valid) {
      // Record failed attempt on invalid OTP
      recordFailedAttempt(identifier);
      return res.status(400).json({ message: verification.message });
    }

    // Reset failed attempts on successful login
    resetFailedAttempts(identifier);

    let userData: any = null;
    let tokenPayload: any = {};

    if (type === 'ADMIN') {
      const admin = await AdminUser.findOne({ email: identifier.toLowerCase().trim() });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      userData = {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: 'admin'
      };
      tokenPayload = { adminId: admin._id, role: admin.role, type: 'admin' };
    } else {
      const member = await Member.findOne({ email: identifier.toLowerCase().trim() });
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      userData = {
        memberId: member._id,
        email: member.email,
        name: member.name,
        role: 'MEMBER',
        type: 'member',
        isFirstLogin: member.isFirstLogin
      };
      tokenPayload = { memberId: member._id, role: 'MEMBER', type: 'member', isFirstLogin: member.isFirstLogin };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const token = jwt.sign(tokenPayload, secret, { expiresIn: '7d' } as jwt.SignOptions);

    // Set secure cookie options
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    clearOTP(identifier);

    res.json({ 
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// Change password (for member)
export const changePassword = async (req: Request, res: Response) => {
  res.status(400).json({ message: 'Password change is not required with OTP login.' });
};

// Get member info
export const getMemberInfo = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).memberId;
    const member = await Member.findById(memberId);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const nameParts = (member.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({ 
      success: true, 
      data: {
        _id: member._id,
        name: member.name,
        firstName: firstName,
        lastName: lastName,
        email: member.email,
        mobileNumber: member.mobileNumber,
        gender: member.gender || '',
        dateOfBirth: member.dateOfBirth,
        address: member.address || '',
        location: (member as any).location || '',
        postalCode: (member as any).postalCode || '',
        city: (member as any).city || '',
        state: (member as any).state || '',
        joinDate: member.joinDate,
        isFirstLogin: member.isFirstLogin,
        status: member.status,
        photo: member.photo
      }
    });
  } catch (error) {
    console.error('Error fetching member info:', error);
    res.status(500).json({ message: 'Error fetching member info', error });
  }
};

// Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).memberId;
    const { name, firstName, lastName, email, mobileNumber, gender, dateOfBirth, address, location, city, state, postalCode } = req.body;
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    if (firstName || lastName) {
      const first = firstName || (member.name || '').split(' ')[0] || '';
      const last = lastName || (member.name || '').split(' ').slice(1).join(' ') || '';
      member.name = `${first} ${last}`.trim();
    } else if (name) {
      member.name = name;
    }
    
    if (email) member.email = email.toLowerCase();
    member.mobileNumber = mobileNumber || member.mobileNumber;
    member.gender = gender || member.gender;
    member.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : member.dateOfBirth;
    member.address = address || member.address;
    (member as any).location = location || (member as any).location;
    (member as any).city = city || (member as any).city;
    (member as any).state = state || (member as any).state;
    (member as any).postalCode = postalCode || (member as any).postalCode;
    
    await member.save();
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// Logout with token blacklist
export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (token) {
    blacklistToken(token);
  }
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// Get current user - FIXED VERSION
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type === 'admin') {
      const admin = await AdminUser.findById(decoded.adminId).select('-__v');
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      return res.json({ 
        user: { 
          id: admin._id, 
          email: admin.email, 
          mobileNumber: admin.mobileNumber, 
          name: admin.name, 
          role: admin.role 
        } 
      });
    } 
    
    if (decoded.type === 'member') {
      const member = await Member.findById(decoded.memberId).select('-__v');
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return res.json({ 
        user: { 
          memberId: member._id, 
          email: member.email, 
          name: member.name, 
          role: 'MEMBER', 
          isFirstLogin: member.isFirstLogin 
        } 
      });
    }
    
    return res.status(401).json({ message: 'Invalid token type' });
  } catch (error: any) {
    console.error('GetMe error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};