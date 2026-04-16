import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  mobileNumber: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MEMBER'],
    default: 'MEMBER'
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);