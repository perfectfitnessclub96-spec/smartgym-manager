// backend/src/controllers/renewalController.ts
import { Request, Response } from 'express';
import Member from '../models/Member';
import Membership from '../models/Membership';
import MembershipPlan from '../models/MembershipPlan';
import RenewalRequest from '../models/RenewalRequest';
import AdminUser from '../models/AdminUser';
import { sendRenewalRequestEmail, sendRenewalStatusEmail } from '../services/emailService';

// Member requests renewal with plan selection
export const requestRenewal = async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    const memberId = (req as any).memberId;
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const currentMembership = await Membership.findOne({
      memberId: member._id,
      status: { $in: ['ACTIVE', 'GRACE_PERIOD'] }
    });
    
    if (!currentMembership) {
      return res.status(400).json({ message: 'No active membership found to renew' });
    }
    
    const requestedPlan = await MembershipPlan.findById(planId);
    if (!requestedPlan) {
      return res.status(404).json({ message: 'Selected plan not found' });
    }
    
    const existingRequest = await RenewalRequest.findOne({
      memberId: member._id,
      status: 'PENDING'
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending renewal request' });
    }
    
    const renewalRequest = await RenewalRequest.create({
      memberId: member._id,
      membershipId: currentMembership._id,
      requestedPlanId: planId,
      requestedDate: new Date(),
      status: 'PENDING'
    });
    
    const populatedRequest = await RenewalRequest.findById(renewalRequest._id)
      .populate('memberId', 'name mobileNumber email')
      .populate('membershipId')
      .populate('requestedPlanId', 'name price durationInDays');
    
    // Send email to member
    await sendRenewalRequestEmail(member.email, member.name, requestedPlan.name);
    
    // Send email to admins
    const admins = await AdminUser.find({ isActive: true, role: { $in: ['SUPER_ADMIN', 'ADMIN'] } });
    for (const admin of admins) {
      if (admin.email) {
        await sendRenewalRequestEmail(admin.email, admin.name, requestedPlan.name, member.name);
      }
    }
    
    res.status(201).json({
      success: true,
      data: populatedRequest,
      message: 'Renewal request sent successfully. Admin will contact you.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error requesting renewal', error });
  }
};

// Get all renewal requests (Admin only)
export const getAllRenewalRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const requests = await RenewalRequest.find(query)
      .populate('memberId', 'name mobileNumber email')
      .populate('membershipId')
      .populate('requestedPlanId', 'name price durationInDays')
      .sort({ requestedDate: -1 });
    
    console.log(`Found ${requests.length} renewal requests`);
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching renewal requests', error });
  }
};

// Get renewal requests by status (Admin only)
export const getRenewalRequestsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    
    const requests = await RenewalRequest.find({ status })
      .populate('memberId', 'name mobileNumber email')
      .populate('membershipId')
      .populate('requestedPlanId', 'name price durationInDays')
      .sort({ requestedDate: -1 });
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching renewal requests', error });
  }
};

// Get single renewal request by ID
export const getRenewalRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const request = await RenewalRequest.findById(id)
      .populate('memberId', 'name mobileNumber email')
      .populate('membershipId')
      .populate('requestedPlanId', 'name price durationInDays')
      .populate('processedBy', 'name');
    
    if (!request) {
      return res.status(404).json({ message: 'Renewal request not found' });
    }
    
    res.json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching renewal request', error });
  }
};

// Update renewal request status (Admin only)
export const updateRenewalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = (req as any).adminId;
    
    const renewalRequest = await RenewalRequest.findById(id)
      .populate('memberId')
      .populate('requestedPlanId');
      
    if (!renewalRequest) {
      return res.status(404).json({ message: 'Renewal request not found' });
    }
    
    renewalRequest.status = status;
    if (notes) {
      renewalRequest.notes = notes;
    }
    renewalRequest.processedBy = adminId;
    renewalRequest.processedAt = new Date();
    await renewalRequest.save();
    
    const member = renewalRequest.memberId as any;
    const plan = renewalRequest.requestedPlanId as any;
    
    // Send email to member about the status update
    await sendRenewalStatusEmail(member.email, member.name, plan?.name, status, notes);
    
    const updatedRequest = await RenewalRequest.findById(id)
      .populate('memberId', 'name mobileNumber email')
      .populate('membershipId')
      .populate('requestedPlanId', 'name price durationInDays');
    
    res.json({
      success: true,
      data: updatedRequest,
      message: `Renewal request ${status.toLowerCase()}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating renewal request', error });
  }
};

// Delete renewal request (Admin only)
export const deleteRenewalRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const renewalRequest = await RenewalRequest.findByIdAndDelete(id);
    
    if (!renewalRequest) {
      return res.status(404).json({ message: 'Renewal request not found' });
    }
    
    res.json({ success: true, message: 'Renewal request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting renewal request', error });
  }
};

// Get count of pending renewal requests
export const getPendingCount = async (req: Request, res: Response) => {
  try {
    const count = await RenewalRequest.countDocuments({ status: 'PENDING' });
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pending count', error });
  }
};