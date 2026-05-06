// backend/src/models/Member.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  name: string;
  email: string;  // Email is the unique login identifier
  mobileNumber?: string;
  photo?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  joinDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isFirstLogin: boolean;
  lastBirthdayWishSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,  // Email is unique login ID
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  mobileNumber: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
photo: {
  type: String,
  default: function() {
    return `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(this.name)}&length=2&size=120&font-size=40&bold=true`;
  }
},
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  lastBirthdayWishSent: Date
}, {
  timestamps: true
});

// Create indexes
MemberSchema.index({ email: 1 }, { unique: true });
MemberSchema.index({ mobileNumber: 1 }, { unique: true, sparse: true });
MemberSchema.index({ status: 1 });
MemberSchema.index({ joinDate: 1 });

const Member = mongoose.model<IMember>('Member', MemberSchema);

export default Member;