import mongoose, { Schema, Document } from 'mongoose';

export interface IWellnessService extends Document {
  name: string;
  description: string;
  duration: number;
  priceForMember: number;
  priceForGuest: number;
  capacity: number;
  category: 'STEAM_BATH' | 'MASSAGE' | 'FOOT_THERAPY';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessServiceSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['Steam Bath', 'Foot Massage', 'Full Body Massage', 'Foot Kansa Thalee']
  },
  description: String,
  duration: {
    type: Number,
    required: true
  },
  priceForMember: {
    type: Number,
    default: 0
  },
  priceForGuest: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    enum: ['STEAM_BATH', 'MASSAGE', 'FOOT_THERAPY'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model<IWellnessService>('WellnessService', WellnessServiceSchema);