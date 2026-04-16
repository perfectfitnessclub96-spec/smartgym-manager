import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  category: string;
  quantity: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR' | 'OUT_OF_SERVICE';
  purchaseDate: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  category: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    enum: ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'OUT_OF_SERVICE'],
    default: 'GOOD'
  },
  purchaseDate: Date,
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  location: String,
  notes: String
}, { timestamps: true });

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);