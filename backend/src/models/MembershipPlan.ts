import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipPlan extends Document {
  name: string;
  duration: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
  durationInDays: number;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
    required: true
  },
  durationInDays: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model<IMembershipPlan>('MembershipPlan', MembershipPlanSchema);