import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
  email?: string;
  mobileNumber?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
  },
  mobileNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
    default: 'STAFF'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const AdminUser = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
export default AdminUser;