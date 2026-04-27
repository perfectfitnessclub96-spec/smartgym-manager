import cron from 'node-cron';
import Booking from '../models/Booking';
import Membership from '../models/Membership';
import Member from '../models/Member';
import { sendMembershipExpiryReminder } from '../services/emailService';

const sendEmailReminder = async (email: string, name: string, subject: string, message: string) => {
  console.log(`📧 Email to ${email}: ${subject} - ${message}`);
  return true;
};

export const startReminderJobs = () => {
  
  // Check for booking reminders (1 day before)
  cron.schedule('0 8 * * *', async () => {
    console.log('🔄 Running booking reminder check...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    const dayBeforeBookings = await Booking.find({
      status: 'CONFIRMED',
      startTime: {
        $gte: tomorrow,
        $lt: tomorrowEnd
      }
    }).populate('memberId').populate('serviceId');
    
    for (const booking of dayBeforeBookings) {
      const member = booking.memberId as any;
      const service = booking.serviceId as any;
      if (member && member.email) {
        const date = new Date(booking.startTime).toLocaleDateString('en-IN');
        const time = new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        await sendEmailReminder(member.email, member.name, 'Booking Reminder', `Your ${service.name} is tomorrow at ${time} on ${date}`);
      }
    }
  });
  
  // Run daily at 9 AM to check membership expiries
  cron.schedule('0 9 * * *', async () => {
    console.log('🔄 Running membership expiry check...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all active memberships
    const activeMemberships = await Membership.find({ 
      status: 'ACTIVE',
      expiryDate: { $gte: today }
    }).populate('memberId').populate('planId');
    
    for (const membership of activeMemberships) {
      const member = membership.memberId as any;
      const plan = membership.planId as any;
      const expiryDate = new Date(membership.expiryDate);
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      const lastReminderSent = membership.lastReminderSent || {};
      
      if (daysRemaining === 7 && !lastReminderSent.day7) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day7: new Date() };
        await membership.save();
        console.log(`📧 Sent 7-day expiry reminder to ${member.email}`);
      }
      else if (daysRemaining === 3 && !lastReminderSent.day3) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day3: new Date() };
        await membership.save();
        console.log(`📧 Sent 3-day expiry reminder to ${member.email}`);
      }
      else if (daysRemaining === 2 && !lastReminderSent.day2) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day2: new Date() };
        await membership.save();
        console.log(`📧 Sent 2-day expiry reminder to ${member.email}`);
      }
      else if (daysRemaining === 1 && !lastReminderSent.day1) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day1: new Date() };
        await membership.save();
        console.log(`📧 Sent 1-day expiry reminder to ${member.email}`);
      }
      else if (daysRemaining === 0 && !lastReminderSent.day0) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day0: new Date() };
        await membership.save();
        console.log(`📧 Sent expiry day reminder to ${member.email}`);
      }
    }
    
    // Update expired memberships
    const expiredMemberships = await Membership.find({
      status: 'ACTIVE',
      expiryDate: { $lt: today }
    });
    
    let expiredCount = 0;
    for (const membership of expiredMemberships) {
      membership.status = 'EXPIRED';
      await membership.save();
      console.log(`⏰ Membership ${membership._id} marked as expired`);
      expiredCount++;
    }
    
    console.log(`✅ Expiry check completed. Updated ${expiredCount} expired memberships.`);
  });
  
  console.log('✅ Reminder jobs started (using email notifications)');
};