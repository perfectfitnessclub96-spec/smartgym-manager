import { Request, Response } from 'express';
import AdminUser from '../models/AdminUser';
import Member from '../models/Member';
import Membership from '../models/Membership'; // ✅ ADDED - Import Membership model
import { sendWelcomeEmail } from '../services/emailService';
import { runManualCleanup } from '../jobs/cleanupExpiredMembersJob';

// Get all admins (Super Admin only)
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await AdminUser.find().sort({ createdAt: -1 }).select('-__v');
    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error fetching admins' });
  }
};

// Add new admin (Super Admin only) - FIXED VERSION
export const addAdmin = async (req: Request, res: Response) => {
  try {
    const { email, mobileNumber, name, role } = req.body;
    const currentAdminId = (req as any).adminId;
    
    console.log('📝 Adding admin with data:', { email, mobileNumber, name, role });
    
    // Check if current user is Super Admin
    const currentAdmin = await AdminUser.findById(currentAdminId);
    if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only Super Admin can add new admins' });
    }
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Admin name is required' });
    }
    
    // Prepare admin data - ONLY include fields that are provided
    const adminData: any = {
      name: name.trim(),
      role: role || 'STAFF',
      isActive: true
    };
    
    // Only add email if provided and not empty
    if (email && email.trim() !== '') {
      adminData.email = email.toLowerCase().trim();
      
      // Check if email already exists
      const existingEmail = await AdminUser.findOne({ email: adminData.email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }
    }
    
    // Only add mobileNumber if provided and not empty
    if (mobileNumber && mobileNumber.trim() !== '') {
      adminData.mobileNumber = mobileNumber.trim();
      
      // Check if mobile already exists
      const existingMobile = await AdminUser.findOne({ mobileNumber: adminData.mobileNumber });
      if (existingMobile) {
        return res.status(400).json({ message: 'Admin with this mobile number already exists' });
      }
    }
    
    // If no email or mobile provided, return error
    if (!adminData.email && !adminData.mobileNumber) {
      return res.status(400).json({ message: 'Either email or mobile number is required' });
    }
    
    const admin = await AdminUser.create(adminData);
    console.log('✅ Admin created:', admin._id);
    
    // Send welcome email only if email is provided
    if (admin.email) {
      await sendWelcomeEmail(admin.email, admin.name);
      console.log(`📧 Welcome email sent to ${admin.email}`);
    }
    
    // Return response without sensitive data
    res.status(201).json({ 
      success: true, 
      data: {
        _id: admin._id,
        email: admin.email || null,
        mobileNumber: admin.mobileNumber || null,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      },
      message: 'Admin added successfully'
    });
  } catch (error: any) {
    console.error('Error adding admin:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `Admin with this ${field} already exists` });
    }
    
    res.status(500).json({ message: 'Error adding admin', error: error.message });
  }
};

// Update admin (Super Admin only)
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;
    const currentAdminId = (req as any).adminId;
    
    const currentAdmin = await AdminUser.findById(currentAdminId);
    if (currentAdmin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only Super Admin can update admins' });
    }
    
    // Prevent self-role change
    if (currentAdminId === id && role && role !== currentAdmin?.role) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const admin = await AdminUser.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ success: true, data: admin, message: 'Admin updated successfully' });
  } catch (error: any) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
};

// Delete admin (Super Admin only)
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentAdminId = (req as any).adminId;
    
    const currentAdmin = await AdminUser.findById(currentAdminId);
    if (currentAdmin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only Super Admin can delete admins' });
    }
    
    if (currentAdminId === id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    const admin = await AdminUser.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Error deleting admin' });
  }
};

// Trigger cleanup job manually (Admin only)
export const triggerCleanup = async (req: Request, res: Response) => {
  try {
    const currentAdminId = (req as any).adminId;
    const currentAdmin = await AdminUser.findById(currentAdminId);
    
    if (currentAdmin?.role !== 'SUPER_ADMIN' && currentAdmin?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    await runManualCleanup();
    res.json({ success: true, message: 'Cleanup job triggered successfully' });
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    res.status(500).json({ message: 'Error triggering cleanup', error });
  }
};

// Get today's birthdays
export const getTodaysBirthdays = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    const members = await Member.find({
      status: 'ACTIVE',
      dateOfBirth: { $exists: true, $ne: null }
    });
    
    const birthdays = [];
    
    for (const member of members) {
      if (member.dateOfBirth) {
        const dob = new Date(member.dateOfBirth);
        const birthMonth = dob.getMonth() + 1;
        const birthDay = dob.getDate();
        
        if (birthMonth === todayMonth && birthDay === todayDay) {
          const age = today.getFullYear() - dob.getFullYear();
          birthdays.push({
            name: member.name,
            email: member.email,
            age: age,
            wishSent: member.lastBirthdayWishSent ? new Date(member.lastBirthdayWishSent).getFullYear() === today.getFullYear() : false
          });
        }
      }
    }
    
    res.json({ success: true, data: birthdays });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({ message: 'Error fetching birthdays', error });
  }
};

// ✅ ADDED - Force update expired memberships (Admin only)
export const forceExpiryUpdate = async (req: Request, res: Response) => {
  try {
    const currentAdminId = (req as any).adminId;
    const currentAdmin = await AdminUser.findById(currentAdminId);
    
    // Check if user has admin access
    if (currentAdmin?.role !== 'SUPER_ADMIN' && currentAdmin?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const today = new Date();
    const result = await Membership.updateMany(
      { 
        status: 'ACTIVE', 
        expiryDate: { $lt: today } 
      },
      { $set: { status: 'EXPIRED' } }
    );
    
    console.log(`🔧 Force expiry update: ${result.modifiedCount} memberships marked as EXPIRED by ${currentAdmin.email || currentAdmin.name}`);
    
    res.json({ 
      success: true, 
      message: `${result.modifiedCount} memberships marked as expired`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error in force expiry update:', error);
    res.status(500).json({ message: 'Error updating expired memberships' });
  }
};