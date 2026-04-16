import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email?: string;  // Made optional
  mobileNumber: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  emergencyContact?: string;
  joinDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true  // Allows null/undefined values
  },
  mobileNumber: {
    type: String,
    required: true
  },
  address: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  emergencyContact: String,
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

export default mongoose.model<IMember>('Member', MemberSchema);