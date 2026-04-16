import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Member from '../models/Member';

// Store OTPs temporarily
const otpStore = new Map();

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, role } = req.body;

    if (!mobileNumber || !role) {
      return res.status(400).json({ message: 'Mobile number and role are required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    otpStore.set(mobileNumber, {
      otp,
      role,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log(`📱 OTP for ${mobileNumber} (${role}): ${otp}`);

    res.json({ message: 'OTP sent successfully', debug: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, otp } = req.body;

    const storedData = otpStore.get(mobileNumber);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(mobileNumber);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    let user = await User.findOne({ mobileNumber });
    
    if (!user) {
      user = await User.create({ 
        mobileNumber, 
        role: storedData.role 
      });

      if (storedData.role === 'MEMBER') {
        await Member.create({
          userId: user._id,
          name: 'New Member',
          email: `${mobileNumber}@temp.com`,
          mobileNumber
        });
      }
    }

    // Fixed JWT sign
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    otpStore.delete(mobileNumber);

    res.json({ 
      message: 'Login successful',
      user: { id: user._id, mobileNumber: user.mobileNumber, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};