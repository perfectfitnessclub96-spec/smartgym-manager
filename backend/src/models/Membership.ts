// backend/src/models/Membership.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
  memberId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  expiryDate: Date;
  gracePeriodEnd?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'CANCELLED';
  amount: number;
  lastReminderSent?: {
    day7?: Date;
    day3?: Date;
    day2?: Date;
    day1?: Date;
    day0?: Date;
  };
  finalWarningSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  gracePeriodEnd: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'GRACE_PERIOD', 'CANCELLED'],
    default: 'ACTIVE'
  },
  amount: {
    type: Number,
    required: true
  },
  lastReminderSent: {
    day7: Date,
    day3: Date,
    day2: Date,
    day1: Date,
    day0: Date
  },
  finalWarningSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes for better query performance
MembershipSchema.index({ expiryDate: 1, status: 1 });
MembershipSchema.index({ memberId: 1, status: 1 });
MembershipSchema.index({ expiryDate: 1, finalWarningSent: 1 });

export default mongoose.model<IMembership>('Membership', MembershipSchema);