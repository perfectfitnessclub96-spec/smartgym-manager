// backend/src/jobs/expiryReminderJobs.ts
import cron from 'node-cron';
import Membership from '../models/Membership';
import Member from '../models/Member';
import { sendMembershipExpiryReminder } from '../services/emailService';

// Function to check and send expiry reminders
const checkAndSendExpiryReminders = async () => {
  try {
    console.log('🔍 Running membership expiry reminder check...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeMemberships = await Membership.find({ 
      status: 'ACTIVE',
      expiryDate: { $gte: today }
    }).populate('memberId').populate('planId');
    
    console.log(`📊 Found ${activeMemberships.length} active memberships to check`);
    
    let remindersSent = 0;
    
    for (const membership of activeMemberships) {
      const member = membership.memberId as any;
      const plan = membership.planId as any;
      const expiryDate = new Date(membership.expiryDate);
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (!member?.email) continue;
      
      const lastReminderSent = membership.lastReminderSent || {};
      
      if (daysRemaining === 7 && !lastReminderSent.day7) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day7: new Date() };
        await membership.save();
        console.log(`📧 Sent 7-day expiry reminder to ${member.email}`);
        remindersSent++;
      }
      else if (daysRemaining === 3 && !lastReminderSent.day3) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day3: new Date() };
        await membership.save();
        console.log(`📧 Sent 3-day expiry reminder to ${member.email}`);
        remindersSent++;
      }
      else if (daysRemaining === 2 && !lastReminderSent.day2) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day2: new Date() };
        await membership.save();
        console.log(`📧 Sent 2-day expiry reminder to ${member.email}`);
        remindersSent++;
      }
      else if (daysRemaining === 1 && !lastReminderSent.day1) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day1: new Date() };
        await membership.save();
        console.log(`📧 Sent 1-day expiry reminder to ${member.email}`);
        remindersSent++;
      }
      else if (daysRemaining === 0 && !lastReminderSent.day0) {
        await sendMembershipExpiryReminder(member.email, member.name, plan?.name || 'Membership', daysRemaining, expiryDate);
        membership.lastReminderSent = { ...lastReminderSent, day0: new Date() };
        await membership.save();
        console.log(`📧 Sent expiry day reminder to ${member.email}`);
        remindersSent++;
      }
    }
    
    console.log(`✅ Expiry reminder check completed. Sent ${remindersSent} reminders.`);
  } catch (error) {
    console.error('❌ Error in expiry reminder check:', error);
  }
};

// Function to check and update expired memberships
const updateExpiredMemberships = async () => {
  try {
    console.log('🔍 Checking for expired memberships...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    
    console.log(`✅ Updated ${expiredCount} expired memberships`);
  } catch (error) {
    console.error('❌ Error updating expired memberships:', error);
  }
};

// Schedule the jobs to run daily at 9:00 AM
export const startExpiryReminderJobs = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🕐 Running scheduled expiry reminder job...');
    await checkAndSendExpiryReminders();
    await updateExpiredMemberships();
  });
  
  console.log('✅ Expiry reminder jobs scheduled (runs daily at 9:00 AM)');
};

// For testing purposes
export const runExpiryReminderCheck = async () => {
  await checkAndSendExpiryReminders();
  await updateExpiredMemberships();
};