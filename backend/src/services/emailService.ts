// backend/src/services/emailService.ts
import nodemailer from 'nodemailer';
import DOMPurify from 'isomorphic-dompurify';

// Create transporter
let transporter: nodemailer.Transporter | null = null;

// Initialize transporter if credentials are available
const initTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // false for port 587, true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Gmail specific settings
      tls: {
        rejectUnauthorized: false, // Only for development
        ciphers: 'SSLv3'
      },
      debug: true, // Enable debug logging
      logger: true // Log SMTP traffic
    });
    console.log('✅ Email transporter configured');
    console.log(`📧 Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    return true;
  } else {
    console.log('⚠️ Email credentials not configured. Emails will be logged to console only.');
    return false;
  }
};

initTransporter();

// Helper function to sanitize strings for XSS prevention
const sanitizeString = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Helper function to sanitize HTML content (allows basic formatting)
const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'p', 'br', 'ul', 'li', 'span', 'h1', 'h2', 'h3', 'h4', 'div'],
    ALLOWED_ATTR: ['style', 'class'],
    ALLOW_DATA_ATTR: false
  });
};

// OTP Email Template
const getOTPTemplate = (otp: string, name: string) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; text-align: center; }
    .otp-code { font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 8px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your verification code is:</p>
      <div class="otp-code">${otp}</div>
      <p>This code is valid for <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
`;
};

// Welcome Email Template
const getWelcomeTemplate = (name: string) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Perfect Fitness Club</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 Welcome to Perfect Fitness Club!</h1></div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your membership has been successfully created at <strong>Perfect Fitness Club</strong>!</p>
      <p>You can now login to your account using your email address. A One-Time Password (OTP) will be sent to this email each time you login.</p>
      <p><strong>Features available to you:</strong></p>
      <ul>
        <li>🏋️ Track your fitness journey</li>
        <li>💆 Book wellness spa services</li>
        <li>📅 Manage your bookings</li>
        <li>🔄 Request membership renewals</li>
        <li>📱 Access member portal</li>
      </ul>
      <p>We're excited to have you as part of our fitness family!</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Membership Expiry Reminder Template
const getExpiryReminderTemplate = (name: string, planName: string, daysRemaining: number, expiryDate: Date) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedPlanName = sanitizeString(planName);
  let subject = '';
  let message = '';
  let urgency = '';
  
  if (daysRemaining === 7) {
    subject = '⚠️ Your Gym Membership Expires in 7 Days';
    message = `Your membership will expire in 7 days on ${expiryDate.toLocaleDateString()}. Renew now to continue your fitness journey without interruption.`;
    urgency = 'low';
  } else if (daysRemaining === 3) {
    subject = '⏰ Your Gym Membership Expires in 3 Days';
    message = `Your membership expires in just 3 days on ${expiryDate.toLocaleDateString()}. Don't wait - renew today!`;
    urgency = 'medium';
  } else if (daysRemaining === 2) {
    subject = '⚠️ Your Gym Membership Expires in 2 Days';
    message = `Your membership expires in 2 days on ${expiryDate.toLocaleDateString()}. Please renew to avoid any disruption.`;
    urgency = 'high';
  } else if (daysRemaining === 1) {
    subject = '🚨 Your Gym Membership Expires TOMORROW!';
    message = `Your membership expires TOMORROW (${expiryDate.toLocaleDateString()}). Renew immediately to continue enjoying our facilities!`;
    urgency = 'critical';
  } else {
    subject = '❌ Your Gym Membership Has Expired';
    message = `Your membership has expired today (${expiryDate.toLocaleDateString()}). Please renew to reactivate your access.`;
    urgency = 'expired';
  }
  
  const urgencyColors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
    expired: '#dc2626'
  };
  
  const color = urgencyColors[urgency as keyof typeof urgencyColors] || '#ef4444';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .days { font-size: 48px; font-weight: bold; color: ${color}; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Perfect Fitness Club</h1>
    </div>
    <div class="content">
      <h2>Dear ${sanitizedName},</h2>
      ${daysRemaining >= 0 ? `<div class="days">${daysRemaining} ${daysRemaining === 1 ? 'DAY' : 'DAYS'} LEFT</div>` : ''}
      <p>${message}</p>
      <p><strong>Plan:</strong> ${sanitizedPlanName}</p>
      <p><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Birthday Email Template
const getBirthdayTemplate = (name: string, age: number) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Happy Birthday!</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; text-align: center; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .cake { font-size: 60px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎂 Happy Birthday!</h1>
    </div>
    <div class="content">
      <div class="cake">🎂 🎈 🎉</div>
      <h2>Dear ${sanitizedName},</h2>
      <p>Wishing you a very <strong>Happy Birthday</strong> from the entire team at <strong>Perfect Fitness Club</strong>!</p>
      ${age > 0 ? `<p>May your ${age}th year bring you good health, happiness, and success!</p>` : ''}
      <p>We are grateful to have you as a valued member of our fitness family.</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Booking Confirmation Email Template
const getBookingConfirmationTemplate = (name: string, serviceName: string, date: string, time: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedService = sanitizeString(serviceName);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .details { background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1> Perfect Fitness Club</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your wellness service has been successfully booked!</p>
      <div class="details">
        <p><strong>Service:</strong> ${sanitizedService}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Amount:</strong> Free for Members</p>
      </div>
      <p>Please arrive 10 minutes before your appointment.</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Cancellation Email Template
const getCancellationTemplate = (name: string, serviceName: string, date: string, time: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedService = sanitizeString(serviceName);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Cancelled</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .details { background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Perfect Fitness Club</h1>
      <p>Booking Cancelled</p>
    </div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your booking has been successfully cancelled.</p>
      <div class="details">
        <p><strong>Service:</strong> ${sanitizedService}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      </div>
      <p>No cancellation fee applied.</p>
      <p>We hope to see you again soon!</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Renewal Request Email Template
const getRenewalRequestTemplate = (name: string, planName: string, isAdmin: boolean = false, memberName?: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedPlanName = sanitizeString(planName);
  const sanitizedMemberName = memberName ? sanitizeString(memberName) : '';
  const subject = isAdmin ? 'New Renewal Request Received' : 'Renewal Request Submitted Successfully';
  const greeting = isAdmin ? `Hello ${sanitizedName},` : `Dear ${sanitizedName},`;
  const message = isAdmin 
    ? `A new renewal request has been submitted by member ${sanitizedMemberName} for the ${sanitizedPlanName} plan. Please review and take action.`
    : `Your renewal request for the ${sanitizedPlanName} plan has been submitted successfully. Our admin will review your request and contact you shortly.`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>${greeting}</h2>
      <p>${message}</p>
      <p>Plan: <strong>${sanitizedPlanName}</strong></p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
  `;
};

// Renewal Status Email Template
const getRenewalStatusTemplate = (name: string, planName: string, status: string, notes?: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedPlanName = sanitizeString(planName);
  const sanitizedNotes = notes ? sanitizeString(notes) : '';
  const statusText = status === 'APPROVED' ? 'Approved' : 'Rejected';
  const statusColor = status === 'APPROVED' ? '#22c55e' : '#ef4444';
  const statusMessage = status === 'APPROVED' 
    ? 'Your renewal request has been approved! Please visit the gym to complete the payment.'
    : 'We regret to inform you that your renewal request has been rejected.';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Renewal Request ${statusText}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .status { display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>Dear ${sanitizedName},</h2>
      <p>Your renewal request for the <strong>${sanitizedPlanName}</strong> plan has been:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span class="status">${statusText}</span>
      </div>
      <p>${statusMessage}</p>
      ${sanitizedNotes ? `<p><strong>Reason:</strong> ${sanitizedNotes}</p>` : ''}
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
  `;
};

// Final Warning Email Template
const getFinalWarningTemplate = (name: string, expiryDate: Date) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title> URGENT: Your Account Will Be Deleted in 2 Days</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>Dear ${sanitizedName},</h2>
      <div class="warning">
        <strong> URGENT: ACCOUNT DELETION WARNING</strong>
      </div>
      <p>Your membership expired on <strong>${expiryDate.toLocaleDateString()}</strong>. You have not renewed your membership yet.</p>
      <p><strong>If you do not renew your membership within the next 2 days, your account and all associated data will be permanently deleted from our system.</strong></p>
      <h3>To keep your account active:</h3>
      <ol>
        <li>Login to your account</li>
        <li>Submit a renewal request</li>
        <li>Complete the payment process</li>
      </ol>
      <p>Don't let your fitness journey end! Renew today to continue enjoying our facilities and services.</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
`;
};

// ==================== EXPORTED FUNCTIONS ====================

// Send OTP Email
export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] OTP to: ${email}`);
      console.log(` Your OTP is: ${otp}`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OTP Verification Code',
      html: getOTPTemplate(otp, name),
    });
    console.log(` OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Welcome Email to: ${email}`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Perfect Fitness Club!',
      html: getWelcomeTemplate(name),
    });
    console.log(` Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send Membership Expiry Reminder
export const sendMembershipExpiryReminder = async (email: string, name: string, planName: string, daysRemaining: number, expiryDate: Date): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Expiry Reminder to: ${email}`);
      console.log(`Days Remaining: ${daysRemaining}`);
      console.log(`=================================\n`);
      return true;
    }
    
    const subject = daysRemaining === 7 ? '⚠️ Your Gym Membership Expires in 7 Days' :
                    daysRemaining === 3 ? '⏰ Your Gym Membership Expires in 3 Days' :
                    daysRemaining === 2 ? '⚠️ Your Gym Membership Expires in 2 Days' :
                    daysRemaining === 1 ? '🚨 Your Gym Membership Expires TOMORROW!' :
                    '❌ Your Gym Membership Has Expired';
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: getExpiryReminderTemplate(name, planName, daysRemaining, expiryDate),
    });
    console.log(` Expiry reminder email sent to ${email} (${daysRemaining} days remaining)`);
    return true;
  } catch (error) {
    console.error('Error sending expiry reminder email:', error);
    return false;
  }
};

// Send Bulk Email (with XSS protection)
export const sendBulkEmail = async (email: string, name: string, title: string, message: string): Promise<boolean> => {
  try {
    const sanitizedTitle = sanitizeString(title);
    const sanitizedMessage = sanitizeHtml(message);
    const sanitizedName = sanitizeString(name);

    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Email to: ${email}`);
      console.log(`Subject: ${sanitizedTitle}`);
      console.log(`Message: ${sanitizedMessage}`);
      console.log(`=================================\n`);
      return true;
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${sanitizedTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Perfect Fitness Club</h1>
    </div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <h3 style="color: #ef4444;">${sanitizedTitle}</h3>
      <div style="white-space: pre-wrap; line-height: 1.6;">${sanitizedMessage}</div>
      <p style="margin-top: 20px;">Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: sanitizedTitle,
      html,
    });
    console.log(` Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send Birthday Email
export const sendBirthdayEmail = async (email: string, name: string, age: number): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Birthday Email to: ${email}`);
      console.log(`Happy Birthday ${name}! 🎂`);
      console.log(`=================================\n`);
      return true;
    }
    
    const subject = `🎂 Happy Birthday, ${name}! 🎉`;
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: getBirthdayTemplate(name, age),
    });
    console.log(`✅ Birthday email sent to ${email} for ${name}`);
    return true;
  } catch (error) {
    console.error('Error sending birthday email:', error);
    return false;
  }
};

// Send Renewal Request Email
export const sendRenewalRequestEmail = async (email: string, name: string, planName: string, memberName?: string): Promise<boolean> => {
  try {
    const isAdmin = !!memberName;
    const subject = isAdmin ? 'New Renewal Request Received' : 'Renewal Request Submitted Successfully';
    
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] ${subject} to: ${email}`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: getRenewalRequestTemplate(name, planName, isAdmin, memberName),
    });
    console.log(`✅ Renewal request email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending renewal request email:', error);
    return false;
  }
};

// Send Renewal Status Email
export const sendRenewalStatusEmail = async (email: string, name: string, planName: string, status: string, notes?: string): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Renewal Status Email to: ${email}`);
      console.log(`Status: ${status}`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Renewal Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      html: getRenewalStatusTemplate(name, planName, status, notes),
    });
    console.log(`✅ Renewal status email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending renewal status email:', error);
    return false;
  }
};

// Send Final Warning Email
export const sendFinalWarningEmail = async (email: string, name: string, expiryDate: Date): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] FINAL WARNING to: ${email}`);
      console.log(`Account will be deleted in 2 days`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '⚠️ URGENT: Your Account Will Be Deleted in 2 Days',
      html: getFinalWarningTemplate(name, expiryDate),
    });
    console.log(`✅ Final warning email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending final warning email:', error);
    return false;
  }
};

// Send Booking Confirmation Email
export const sendBookingConfirmationEmail = async (email: string, name: string, serviceName: string, date: string, time: string): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Booking Confirmation to: ${email}`);
      console.log(`Service: ${serviceName} on ${date} at ${time}`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Booking Confirmation - Perfect Fitness Club',
      html: getBookingConfirmationTemplate(name, serviceName, date, time),
    });
    console.log(`✅ Booking confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
};

// Send Cancellation Email
export const sendCancellationEmail = async (email: string, name: string, serviceName: string, date: string, time: string): Promise<boolean> => {
  try {
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=================================`);
      console.log(` [DEV MODE] Cancellation Email to: ${email}`);
      console.log(`Service: ${serviceName} on ${date} at ${time}`);
      console.log(`=================================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: `"Perfect Fitness Club" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Booking Cancelled - Perfect Fitness Club',
      html: getCancellationTemplate(name, serviceName, date, time),
    });
    console.log(`✅ Cancellation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
};