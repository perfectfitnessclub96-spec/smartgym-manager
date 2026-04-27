export const CONSTANTS = {
  OTP_EXPIRY_SECONDS: 300,
  JWT_EXPIRY_DAYS: '7d',
  PASSWORD_MIN_LENGTH: 8,
  BOOKING_BUFFER_MINUTES: 10,
  OPERATING_HOURS: { 
    start: 5, 
    end: 22, 
    lunchBreakStart: 13, 
    lunchBreakEnd: 14 
  },
  ALLOWED_DAYS: [5, 6],
  DEFAULT_PAGE_LIMIT: 10,
  MAX_PAGE_LIMIT: 50
} as const;