import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Member validation
export const validateMember = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('mobileNumber').optional().matches(/^[0-9]{10}$/),
  body('planId').isMongoId(),
  body('joiningDate').isISO8601(),
  body('address').optional().trim().escape(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  handleValidationErrors
];

// Booking validation
export const validateBooking = [
  body('serviceId').isMongoId(),
  body('bookingDate').isISO8601(),
  body('startTime').isISO8601(),
  handleValidationErrors
];

// Search validation
export const validateSearch = [
  query('search').optional().trim().escape().isLength({ max: 100 }),
  handleValidationErrors
];