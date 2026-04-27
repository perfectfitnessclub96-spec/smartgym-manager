import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from '../models/AdminUser';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartgym';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // First, clean up any documents with null mobileNumber
    const cleanupResult = await AdminUser.updateMany(
      { mobileNumber: null },
      { $unset: { mobileNumber: 1 } }
    );
    if (cleanupResult.modifiedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanupResult.modifiedCount} record(s) with null mobileNumber`);
    }

    // Delete any documents with null mobileNumber
    const deleteResult = await AdminUser.deleteMany({ mobileNumber: null });
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} record(s) with null mobileNumber`);
    }

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ 
      email: 'admin@kartikienterprises.com' 
    });
    
    if (existingAdmin) {
      console.log('\n✅ Admin already exists!');
      console.log('=' .repeat(50));
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('📱 Mobile:', existingAdmin.mobileNumber || 'Not set');
      console.log('=' .repeat(50));
      console.log('\n🔐 You can login at: http://localhost:5173/admin-login\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new admin
    const admin = await AdminUser.create({
      email: 'admin@kartikienterprises.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    });

    console.log('\n' + '=' .repeat(50));
    console.log('✅ ADMIN CREATED SUCCESSFULLY!');
    console.log('=' .repeat(50));
    console.log('📧 Email: admin@kartikienterprises.com');
    console.log('👤 Name: Super Admin');
    console.log('🔑 Role: SUPER_ADMIN');
    console.log('🆔 ID:', admin._id);
    console.log('=' .repeat(50));
    
    console.log('\n🔐 LOGIN INSTRUCTIONS:');
    console.log('1. Open browser: http://localhost:5173');
    console.log('2. Click "ADMIN LOGIN" button');
    console.log('3. Enter email: admin@kartikienterprises.com');
    console.log('4. Click "Send OTP"');
    console.log('5. Check THIS terminal for the OTP code');
    console.log('6. Enter the OTP and you\'re in!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 11000) {
      console.log('\n⚠️ Duplicate key error. Run these commands in MongoDB shell:\n');
      console.log('   mongosh');
      console.log('   use smartgym');
      console.log('   db.adminusers.deleteMany({})');
      console.log('   exit\n');
      console.log('Then run this script again.\n');
    }
    
    process.exit(1);
  }
};

// Run the function
createAdmin();