import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  image: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'Uncategorized'
  }
}, { timestamps: true });

// Add index for better query performance
EquipmentSchema.index({ category: 1 });
EquipmentSchema.index({ name: 1 });

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);