// backend/src/controllers/notificationController.ts
import { Request, Response } from 'express';
import Member from '../models/Member';
import { sendBulkEmail } from '../services/emailService';

// Send email to all members
export const sendEmailToAllMembers = async (req: Request, res: Response) => {
  try {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Get all active members with email
    const members = await Member.find({ 
      status: 'ACTIVE',
      email: { $exists: true, $ne: null }
    });
    
    if (members.length === 0) {
      return res.status(404).json({ message: 'No active members found with email addresses' });
    }
    
    let sentCount = 0;
    let failedCount = 0;
    
    // Send email to all members
    for (const member of members) {
      if (member.email) {
        const sent = await sendBulkEmail(member.email, member.name, title, message);
        if (sent) {
          sentCount++;
        } else {
          failedCount++;
        }
      }
    }
    
    res.json({
      success: true,
      message: `Email sent to ${sentCount} members${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      data: { sentCount, failedCount, totalMembers: members.length }
    });
  } catch (error) {
    console.error('Error sending email notifications:', error);
    res.status(500).json({ message: 'Error sending email notifications', error });
  }
};