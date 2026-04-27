import { Request, Response } from 'express';
import Booking from '../models/Booking';
import WellnessService from '../models/WellnessService';
import Member from '../models/Member';
import Membership from '../models/Membership';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '../services/emailService';

const OPERATING_HOURS = {
  start: 5,
  end: 22,
  lunchBreakStart: 13,
  lunchBreakEnd: 14
};

const ALLOWED_DAYS = [5, 6];
const BUFFER_MINUTES = 10;

const isAllowedDay = (date: Date): boolean => {
  const day = date.getDay();
  return ALLOWED_DAYS.includes(day);
};

const isValidTimeSlot = (startTime: Date): boolean => {
  const hour = startTime.getHours();
  if (hour < OPERATING_HOURS.start || hour >= OPERATING_HOURS.end) {
    return false;
  }
  if (hour >= OPERATING_HOURS.lunchBreakStart && hour < OPERATING_HOURS.lunchBreakEnd) {
    return false;
  }
  return true;
};

const generateTimeSlots = async (serviceId: string, date: Date): Promise<any[]> => {
  const service = await WellnessService.findById(serviceId);
  if (!service) return [];

  const slots: any[] = [];
  const startHour = OPERATING_HOURS.start;
  const endHour = OPERATING_HOURS.end;
  const totalSlotDuration = service.duration + BUFFER_MINUTES;
  
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);
  
  let currentTime = new Date(baseDate);
  currentTime.setHours(startHour, 0, 0);
  
  const endTime = new Date(baseDate);
  endTime.setHours(endHour, 0, 0);
  
  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);
    
    if (slotEnd.getHours() >= endHour && slotEnd.getMinutes() > 0) {
      break;
    }
    
    const slotHour = currentTime.getHours();
    if (slotHour >= OPERATING_HOURS.lunchBreakStart && slotHour < OPERATING_HOURS.lunchBreakEnd) {
      currentTime = new Date(baseDate);
      currentTime.setHours(OPERATING_HOURS.lunchBreakEnd, 0, 0);
      continue;
    }
    
    if (isValidTimeSlot(currentTime)) {
      const existingBookings = await Booking.find({
        serviceId,
        startTime: {
          $gte: new Date(currentTime),
          $lt: new Date(slotEnd)
        },
        status: 'CONFIRMED'
      });
      
      const bookedCount = existingBookings.length;
      const isAvailable = bookedCount < service.capacity;
      
      const bufferStart = new Date(currentTime);
      bufferStart.setMinutes(bufferStart.getMinutes() - BUFFER_MINUTES);
      
      const bufferBookings = await Booking.find({
        serviceId,
        startTime: { 
          $gte: bufferStart, 
          $lt: currentTime 
        },
        status: 'CONFIRMED'
      });
      
      const hasBufferConflict = bufferBookings.length > 0;
      
      slots.push({
        time: currentTime.toISOString(),
        displayTime: currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        available: isAvailable && !hasBufferConflict,
        bookedCount,
        capacity: service.capacity,
        remainingSlots: service.capacity - bookedCount
      });
    }
    
    currentTime = new Date(currentTime);
    currentTime.setMinutes(currentTime.getMinutes() + totalSlotDuration);
  }
  
  return slots;
};

export const getServices = async (req: Request, res: Response) => {
  try {
    console.log('Fetching wellness services...');
    const services = await WellnessService.find({ isActive: true });
    console.log(`Found ${services.length} services`);
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { serviceId, date } = req.query;
    
    if (!serviceId || !date) {
      return res.status(400).json({ message: 'Service ID and date are required' });
    }
    
    const bookingDate = new Date(date as string);
    
    if (!isAllowedDay(bookingDate)) {
      return res.json({ 
        success: true, 
        data: [], 
        message: 'Services available only on Fridays & Saturdays' 
      });
    }
    
    const slots = await generateTimeSlots(serviceId as string, bookingDate);
    res.json({ success: true, data: slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching slots', error });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, bookingDate, startTime } = req.body;
    const memberId = (req as any).memberId;
    
    const service = await WellnessService.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const date = new Date(bookingDate);
    if (!isAllowedDay(date)) {
      return res.status(400).json({ message: 'Bookings only on Fridays & Saturdays' });
    }
    
    const startDateTime = new Date(startTime);
    if (!isValidTimeSlot(startDateTime)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }
    
    const slots = await generateTimeSlots(serviceId, date);
    const selectedSlot = slots.find(slot => slot.time === startTime);
    
    if (!selectedSlot || !selectedSlot.available) {
      return res.status(400).json({ message: 'Slot no longer available' });
    }
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const activeMembership = await Membership.findOne({
      memberId: member._id,
      status: 'ACTIVE',
      expiryDate: { $gt: new Date() }
    });
    
    if (!activeMembership) {
      return res.status(400).json({ message: 'Active membership required for free booking' });
    }
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);
    
    const booking = await Booking.create({
      memberId: member._id,
      serviceId,
      bookingDate: date,
      startTime: startDateTime,
      endTime: endDateTime,
      status: 'CONFIRMED',
      amount: service.priceForMember
    });
    
    const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = startDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    if (member.email) {
      await sendBookingConfirmationEmail(member.email, member.name, service.name, dateStr, timeStr);
    }
    
    res.status(201).json({ 
      success: true, 
      data: booking,
      message: 'Booking confirmed!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).memberId;
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const bookings = await Booking.find({ memberId: member._id })
      .populate('serviceId')
      .sort({ startTime: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = (req as any).memberId;
    
    const booking = await Booking.findById(id).populate('serviceId').populate('memberId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // ✅ SECURITY FIX: Only allow members to cancel their own bookings
    if (booking.memberId && booking.memberId.toString() !== memberId) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }
    
    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }
    
    booking.status = 'CANCELLED';
    await booking.save();
    
    const member = booking.memberId as any;
    const service = booking.serviceId as any;
    
    if (member && member.email) {
      const dateStr = new Date(booking.bookingDate).toLocaleDateString('en-IN');
      const timeStr = new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      await sendCancellationEmail(member.email, member.name, service.name, dateStr, timeStr);
    }
    
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling booking', error });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('memberId', 'name mobileNumber email')
      .populate('serviceId')
      .sort({ createdAt: -1 });
    
    console.log('Bookings with service details:', bookings.map(b => ({
      id: b._id,
      serviceName: (b.serviceId as any)?.name || 'No service',
      memberName: (b.memberId as any)?.name || 'Guest'
    })));
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};