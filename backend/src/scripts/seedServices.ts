import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const WellnessService = require('../models/WellnessService').default;

const services = [
  {
    name: 'Steam Bath',
    description: 'Relaxing steam therapy for muscle recovery and detoxification',
    duration: 15,
    priceForMember: 0,
    priceForGuest: 200,
    capacity: 2,
    category: 'STEAM_BATH',
    isActive: true
  },
  {
    name: 'Foot Massage',
    description: 'Rejuvenating foot reflexology massage',
    duration: 15,
    priceForMember: 0,
    priceForGuest: 300,
    capacity: 1,
    category: 'FOOT_THERAPY',
    isActive: true
  },
  {
    name: 'Full Body Massage',
    description: 'Deep tissue relaxation massage for whole body',
    duration: 15,
    priceForMember: 0,
    priceForGuest: 300,
    capacity: 1,
    category: 'MASSAGE',
    isActive: true
  },
  {
    name: 'Foot Kansa Thalee',
    description: 'Traditional foot therapy using Kansa bowl',
    duration: 10,
    priceForMember: 0,
    priceForGuest: 300,
    capacity: 1,
    category: 'FOOT_THERAPY',
    isActive: true
  }
];

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    await WellnessService.deleteMany({});
    console.log('Cleared existing services');
    
    await WellnessService.insertMany(services);
    console.log('Wellness services seeded successfully!');
    
    const insertedServices = await WellnessService.find();
    console.log('\nAvailable Services:');
   insertedServices.forEach((service: any) => {
      console.log(`  - ${service.name} (${service.duration} mins) - Member: Free, Guest: ₹${service.priceForGuest}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();