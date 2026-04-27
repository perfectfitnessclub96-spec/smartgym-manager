// backend/src/controllers/membershipController.ts
import { Request, Response } from 'express';
import Member from '../models/Member';
import Membership from '../models/Membership';
import MembershipPlan from '../models/MembershipPlan';
import RenewalRequest from '../models/RenewalRequest';
import Booking from '../models/Booking';
import { sendWelcomeEmail } from '../services/emailService';

// Add new member (Admin only) - Using Email as Login ID
export const addMember = async (req: Request, res: Response) => {
  try {
    const { name, email, mobileNumber, planId, joiningDate, address, dateOfBirth, gender, photo } = req.body;
    
    console.log('📝 Adding member with data:', { name, email, planId, joiningDate });
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Member name is required' });
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required. Email will be used as Login ID.' });
    }
    
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }
    
    if (!joiningDate) {
      return res.status(400).json({ message: 'Joining date is required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    // Check if member with this email already exists
    const existingMember = await Member.findOne({ email: email.toLowerCase().trim() });
    if (existingMember) {
      return res.status(400).json({ 
        message: 'Member with this email already exists. Email is the unique Login ID.' 
      });
    }
    
    // Get the plan
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }
    
    console.log('📋 Selected plan:', plan.name, 'Duration:', plan.durationInDays, 'days');
    
    // Create member (email is the login ID)
    const memberData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      joinDate: new Date(joiningDate),
      status: 'ACTIVE',
      isFirstLogin: true
    };
    
    // Add optional fields if provided
    if (mobileNumber && mobileNumber.trim()) {
      memberData.mobileNumber = mobileNumber.trim();
    }
    if (address && address.trim()) {
      memberData.address = address.trim();
    }
    if (dateOfBirth) {
      memberData.dateOfBirth = new Date(dateOfBirth);
    }
    if (gender) {
      memberData.gender = gender;
    }
    if (photo && photo.trim()) {
      memberData.photo = photo;
    }
    
    const member = await Member.create(memberData);
    console.log('✅ Member created:', member._id, 'Email (Login ID):', member.email);
    
    // Calculate membership dates
    const startDate = new Date(joiningDate);
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + plan.durationInDays);
    
    console.log('📅 Membership period:', startDate, 'to', expiryDate);
    
    // Create membership
    const membership = await Membership.create({
      memberId: member._id,
      planId: plan._id,
      startDate,
      expiryDate,
      status: 'ACTIVE',
      amount: plan.price
    });
    console.log('✅ Membership created:', membership._id);
    
    // Send welcome email
    if (member.email) {
      await sendWelcomeEmail(member.email, member.name);
      console.log(`📧 Welcome email sent to ${member.email}`);
    }
    
    res.status(201).json({ 
      success: true, 
      data: { 
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          mobileNumber: member.mobileNumber || '',
          photo: member.photo
        },
        membership: {
          _id: membership._id,
          plan: {
            name: plan.name,
            price: plan.price,
            durationInDays: plan.durationInDays
          },
          startDate,
          expiryDate,
          amount: plan.price
        }
      },
      message: `Member added successfully! Login ID: ${member.email}`
    });
  } catch (error: any) {
    console.error('Error adding member:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({ 
          message: 'Member with this email already exists. Email is the unique Login ID.' 
        });
      }
      if (field === 'mobileNumber') {
        return res.status(400).json({ 
          message: 'Member with this mobile number already exists' 
        });
      }
      return res.status(400).json({ 
        message: `Member with this ${field} already exists` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error adding member', 
      error: error.message 
    });
  }
};

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query: any = {};
    
    if (search && typeof search === 'string') {
      // Escape regex special characters to prevent NoSQL injection
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query = {
        $or: [
          { name: { $regex: escapedSearch, $options: 'i' } },
          { mobileNumber: { $regex: escapedSearch, $options: 'i' } },
          { email: { $regex: escapedSearch, $options: 'i' } }
        ]
      };
    }
    
    const members = await Member.find(query).sort({ createdAt: -1 });
    
    const membersWithMembership = await Promise.all(
      members.map(async (member) => {
        const currentMembership = await Membership.findOne({
          memberId: member._id,
          status: 'ACTIVE'
        }).populate('planId');
        
        return {
          ...member.toObject(),
          currentMembership
        };
      })
    );
    
    res.json({ success: true, data: membersWithMembership });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members', error });
  }
};

// Get single member - with populated planId
export const getMemberById = async (req: Request, res: Response) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const currentMembership = await Membership.findOne({
      memberId: member._id,
      status: 'ACTIVE'
    }).populate('planId');
    
    const membershipHistory = await Membership.find({
      memberId: member._id
    }).populate('planId').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { 
        member, 
        currentMembership, 
        membershipHistory 
      }
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ message: 'Error fetching member', error });
  }
};

// Get member dashboard
export const getMemberDashboard = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).memberId;
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const currentMembership = await Membership.findOne({
      memberId: member._id,
      status: 'ACTIVE'
    }).populate('planId');
    
    let daysRemaining = 0;
    let status = 'No Active Membership';
    
    if (currentMembership) {
      const today = new Date();
      const expiryDate = new Date(currentMembership.expiryDate);
      
      if (today > expiryDate) {
        status = 'Expired';
        daysRemaining = 0;
      } else {
        status = 'Active';
        daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      }
    }
    
    const existingRequest = await RenewalRequest.findOne({
      memberId: member._id,
      status: 'PENDING'
    });
    
    res.json({
      success: true,
      data: {
        member,
        currentMembership,
        daysRemaining,
        status,
        hasPendingRenewal: !!existingRequest
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};

// Get membership plans
export const getMembershipPlans = async (req: Request, res: Response) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans', error });
  }
};

// Get expiring soon
export const getExpiringSoon = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringMemberships = await Membership.find({
      status: 'ACTIVE',
      expiryDate: { $lte: sevenDaysFromNow, $gte: today }
    }).populate('memberId').populate('planId');
    
    res.json({ success: true, data: expiringMemberships });
  } catch (error) {
    console.error('Error fetching expiring members:', error);
    res.status(500).json({ message: 'Error fetching expiring members', error });
  }
};

// Get admin statistics
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    console.log('getAdminStats called - fetching dashboard data');
    
    const totalMembers = await Member.countDocuments();
    const activeMemberships = await Membership.countDocuments({ status: 'ACTIVE' });
    const pendingRenewals = await RenewalRequest.countDocuments({ status: 'PENDING' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow }
    });
    
    const activeMembershipsData = await Membership.find({ status: 'ACTIVE' }).populate('planId');
    let monthlyRevenue = 0;
    activeMembershipsData.forEach(membership => {
      monthlyRevenue += membership.amount || 0;
    });
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoon = await Membership.countDocuments({
      status: 'ACTIVE',
      expiryDate: { $lte: sevenDaysFromNow, $gte: today }
    });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newMembersThisMonth = await Member.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    console.log('Stats calculated:', { totalMembers, activeMemberships, monthlyRevenue, todayBookings });
    
    res.json({
      success: true,
      data: {
        totalMembers,
        activeMemberships,
        monthlyRevenue,
        todayBookings,
        pendingRenewals,
        expiringSoon,
        newMembersThisMonth,
        revenueGrowth: 0
      }
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: (error as any).message });
  }
};

// Renew membership
export const renewMembership = async (req: Request, res: Response) => {
  try {
    const { memberId, planId, paymentMethod } = req.body;
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    const currentMembership = await Membership.findOne({
      memberId: member._id,
      status: 'ACTIVE'
    });
    
    let startDate = new Date();
    let expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.durationInDays);
    
    if (currentMembership && currentMembership.expiryDate > new Date()) {
      startDate = currentMembership.expiryDate;
      expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + plan.durationInDays);
    }
    
    const membership = await Membership.create({
      memberId: member._id,
      planId,
      startDate,
      expiryDate,
      status: 'ACTIVE',
      amount: plan.price
    });
    
    res.json({
      success: true,
      data: membership,
      message: 'Membership renewed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error renewing membership', error });
  }
};

// Get monthly revenue
export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = [];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59);
      
      const memberships = await Membership.find({
        startDate: { $gte: monthStart, $lte: monthEnd }
      });
      
      const monthlyRevenue = memberships.reduce((total, membership) => total + (membership.amount || 0), 0);
      
      revenueData.push({
        month: months[i],
        revenue: monthlyRevenue
      });
    }
    
    res.json({ success: true, data: revenueData });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Error fetching revenue data', error });
  }
};

// Get total revenue
export const getTotalRevenue = async (req: Request, res: Response) => {
  try {
    const activeMemberships = await Membership.find({ status: 'ACTIVE' }).populate('planId');
    let totalMonthlyRevenue = 0;
    let totalYearlyRevenue = 0;
    
    activeMemberships.forEach(membership => {
      totalMonthlyRevenue += membership.amount || 0;
      if ((membership.planId as any)?.duration === 'YEARLY') {
        totalYearlyRevenue += membership.amount || 0;
      }
    });
    
    res.json({ 
      success: true, 
      data: {
        totalMonthlyRevenue,
        totalYearlyRevenue,
        activeMembershipsCount: activeMemberships.length
      }
    });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    res.status(500).json({ message: 'Error fetching revenue data', error });
  }
};

// Get plan distribution
export const getPlanDistribution = async (req: Request, res: Response) => {
  try {
    const distribution = await Membership.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $lookup: {
          from: 'membershipplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: '$plan.name',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const planColors: Record<string, string> = {
      'Monthly Plan': '#3b82f6',
      'Quarterly Plan': '#22c55e',
      'Half-Yearly Plan': '#f59e0b',
      'Yearly Plan': '#8b5cf6',
      'Couple Plan': '#ec4899'
    };
    
    const result = distribution.map(item => ({
      name: item._id,
      value: item.count,
      revenue: item.totalRevenue,
      color: planColors[item._id] || '#6b7280'
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching plan distribution:', error);
    res.status(500).json({ message: 'Error fetching plan distribution', error });
  }
};