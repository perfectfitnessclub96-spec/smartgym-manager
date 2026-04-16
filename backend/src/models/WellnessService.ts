import mongoose, { Schema, Document } from 'mongoose';

export interface IWellnessService extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WellnessServiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model<IWellnessService>('WellnessService', WellnessServiceSchema);