import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  memberId?: mongoose.Types.ObjectId;
  guestName?: string;
  guestPhone?: string;
  serviceId: mongoose.Types.ObjectId;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member'
  },
  guestName: String,
  guestPhone: String,
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'WellnessService',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'CONFIRMED'
  },
  amount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Add indexes for better query performance
BookingSchema.index({ bookingDate: 1, startTime: 1, serviceId: 1 });
BookingSchema.index({ memberId: 1, status: 1 });
BookingSchema.index({ status: 1, bookingDate: 1 });
BookingSchema.index({ startTime: 1 }); // For reminder queries

export default mongoose.model<IBooking>('Booking', BookingSchema);