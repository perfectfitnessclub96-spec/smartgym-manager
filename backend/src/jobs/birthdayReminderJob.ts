// backend/src/jobs/birthdayReminderJob.ts
import cron from 'node-cron';
import Member from '../models/Member';
import { sendBirthdayEmail } from '../services/emailService';

// Function to check and send birthday wishes
const checkAndSendBirthdayWishes = async () => {
  try {
    console.log('🎂 Running birthday wish check...');
    
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    // Find members whose birthday is today
    const members = await Member.find({
      status: 'ACTIVE',
      dateOfBirth: { $exists: true, $ne: null }
    });
    
    let birthdayCount = 0;
    let emailSent = 0;
    
    for (const member of members) {
      if (member.dateOfBirth) {
        const dob = new Date(member.dateOfBirth);
        const birthMonth = dob.getMonth() + 1;
        const birthDay = dob.getDate();
        
        // Check if today is their birthday
        if (birthMonth === todayMonth && birthDay === todayDay) {
          birthdayCount++;
          
          // Check if we already sent birthday wish this year
          const lastWish = member.lastBirthdayWishSent;
          const currentYear = today.getFullYear();
          const lastWishYear = lastWish ? new Date(lastWish).getFullYear() : 0;
          
          if (lastWishYear !== currentYear && member.email) {
            // Calculate age
            let age = currentYear - dob.getFullYear();
            
            // Send birthday email
            const sent = await sendBirthdayEmail(member.email, member.name, age);
            
            if (sent) {
              // Update last birthday wish sent date
              member.lastBirthdayWishSent = new Date();
              await member.save();
              emailSent++;
              console.log(`🎂 Birthday wish sent to ${member.name} (Age: ${age})`);
            }
          } else if (lastWishYear === currentYear) {
            console.log(`⏭️ Birthday wish already sent to ${member.name} this year`);
          }
        }
      }
    }
    
    console.log(`✅ Birthday check completed. Found ${birthdayCount} birthdays, sent ${emailSent} wishes.`);
    
  } catch (error) {
    console.error('❌ Error in birthday wish check:', error);
  }
};

// Schedule the birthday job to run daily at 8:00 AM
export const startBirthdayJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('🕐 Running scheduled birthday wish job...');
    await checkAndSendBirthdayWishes();
  });
  
  console.log('✅ Birthday wish job scheduled (runs daily at 8:00 AM)');
};

// For manual testing
export const runManualBirthdayCheck = async () => {
  await checkAndSendBirthdayWishes();
};