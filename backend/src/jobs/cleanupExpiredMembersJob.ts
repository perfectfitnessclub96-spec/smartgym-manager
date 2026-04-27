// backend/src/jobs/cleanupExpiredMembersJob.ts
import cron from 'node-cron';
import Member from '../models/Member';
import Membership from '../models/Membership';
import Booking from '../models/Booking';
import RenewalRequest from '../models/RenewalRequest';
import mongoose from 'mongoose';
import { sendFinalWarningEmail } from '../services/emailService';

// Function to cleanup expired members who haven't renewed
const cleanupExpiredMembers = async () => {
  try {
    console.log('🧹 Running cleanup job for expired members...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate the cutoff date (5 days after expiry)
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - 5);
    
    // Find members with expired membership (expiry date >= 5 days ago)
    const expiredMemberships = await Membership.find({
      status: 'EXPIRED',
      expiryDate: { $lt: cutoffDate }
    }).populate('memberId');
    
    console.log(`📊 Found ${expiredMemberships.length} members expired for more than 5 days`);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const membership of expiredMemberships) {
      const member = membership.memberId as any;
      if (!member) continue;
      
      try {
        // Start a transaction to ensure data consistency
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          // Delete all related data
          
          // 1. Delete all bookings by this member
          await Booking.deleteMany({ memberId: member._id }, { session });
          
          // 2. Delete all renewal requests by this member
          await RenewalRequest.deleteMany({ memberId: member._id }, { session });
          
          // 3. Delete all memberships for this member
          await Membership.deleteMany({ memberId: member._id }, { session });
          
          // 4. Delete the member itself
          await Member.deleteOne({ _id: member._id }, { session });
          
          await session.commitTransaction();
          
          console.log(`🗑️ Deleted member: ${member.name} (${member.email}) - Expired since ${membership.expiryDate.toLocaleDateString()}`);
          deletedCount++;
          
        } catch (error) {
          await session.abortTransaction();
          console.error(`❌ Error deleting member ${member._id}:`, error);
          errorCount++;
        } finally {
          session.endSession();
        }
        
      } catch (error) {
        console.error(`❌ Error processing member ${member._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Cleanup completed. Deleted: ${deletedCount}, Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Error in cleanup job:', error);
  }
};

// Function to send final warning before deletion
const sendFinalWarning = async () => {
  try {
    console.log('🔔 Checking for members to send final warnings...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate warning dates (3 days after expiry)
    const warningDate = new Date(today);
    warningDate.setDate(warningDate.getDate() - 3);
    
    // Find members expired 3 days ago who haven't been warned
    const expiredMemberships = await Membership.find({
      status: 'EXPIRED',
      expiryDate: { $lt: warningDate },
      finalWarningSent: { $ne: true }
    }).populate('memberId');
    
    console.log(`📊 Found ${expiredMemberships.length} members for final warning`);
    
    let warnedCount = 0;
    
    for (const membership of expiredMemberships) {
      const member = membership.memberId as any;
      if (!member || !member.email) continue;
      
      try {
        // Send final warning email
        await sendFinalWarningEmail(member.email, member.name, membership.expiryDate);
        console.log(`⚠️ FINAL WARNING sent to ${member.name} (${member.email}) - Account will be deleted in 2 days`);
        
        // Mark warning as sent
        membership.finalWarningSent = true;
        await membership.save();
        warnedCount++;
        
      } catch (error) {
        console.error(`Error sending warning to ${member.email}:`, error);
      }
    }
    
    console.log(`✅ Sent ${warnedCount} final warnings`);
    
  } catch (error) {
    console.error('Error in final warning check:', error);
  }
};

// Schedule the cleanup job to run daily at 2:00 AM
export const startCleanupJob = () => {
  // Run cleanup daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Running scheduled cleanup job...');
    await sendFinalWarning();
    await cleanupExpiredMembers();
  });
  
  console.log('✅ Cleanup job scheduled (runs daily at 2:00 AM)');
};

// For manual testing
export const runManualCleanup = async () => {
  await sendFinalWarning();
  await cleanupExpiredMembers();
};