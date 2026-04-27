import express from 'express';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth';
import {
  getServices,
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
} from '../controllers/bookingController';

const router = express.Router();

// Public routes (with authentication)
router.get('/services', authenticate, getServices);
router.get('/availability', authenticate, getAvailableSlots);

// Member routes
router.post('/bookings', authenticate, requireMember, createBooking);
router.get('/my-bookings', authenticate, requireMember, getMyBookings);
router.put('/bookings/:id/cancel', authenticate, requireMember, cancelBooking);

// Admin routes
router.get('/all', authenticate, requireAdmin, getAllBookings);

export default router;