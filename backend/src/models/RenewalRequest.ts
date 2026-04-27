import mongoose, { Schema, Document } from 'mongoose';

export interface IRenewalRequest extends Document {
  memberId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  requestedPlanId: mongoose.Types.ObjectId;
  requestedDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RenewalRequestSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  membershipId: {
    type: Schema.Types.ObjectId,
    ref: 'Membership',
    required: true
  },
  requestedPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  notes: String,
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date
}, { timestamps: true });

export default mongoose.model<IRenewalRequest>('RenewalRequest', RenewalRequestSchema);