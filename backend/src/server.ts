// backend/src/server.ts
import './config/env';
import { config } from './config/env';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import Membership from './models/Membership';  // ✅ ADDED - Import Membership model
import { startReminderJobs } from './jobs/reminderJobs';
import { startExpiryReminderJobs } from './jobs/expiryReminderJobs';
import { startCleanupJob } from './jobs/cleanupExpiredMembersJob';
import { startBirthdayJob } from './jobs/birthdayReminderJob';

const app = express();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
}

// Validate JWT secret strength
if (config.jwtSecret && config.jwtSecret.length < 32 && config.nodeEnv === 'production') {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

// ============ CREATE UPLOADS DIRECTORY ============
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// ============ CORS CONFIGURATION (Must be BEFORE helmet for images) ============
const allowedOrigins = config.corsOrigins;

// Configure CORS with proper image support
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow localhost in development
    if (config.nodeEnv !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    const msg = 'CORS policy does not allow access from this origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
}));

app.options('*', cors());

// ============ MIDDLEWARE ============
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

// ============ SECURITY HEADERS WITH HELMET (Configured for images) ============
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "http://localhost:5173", "https://images.unsplash.com", "https://ui-avatars.com", "https://images.pexels.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", config.frontendUrl, 'http://localhost:5000', 'http://localhost:5173'],
      frameSrc: ["'self'", "https://www.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded from different origin
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ============ STATIC FILE SERVING (For uploaded images) ============
// Serve uploads directory with proper headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path, stat) => {
    // Allow cross-origin access to images
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  }
}));

app.use('/public/uploads', express.static(uploadsDir, {
  setHeaders: (res, path, stat) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
  }
}));

app.use(express.static(path.join(__dirname, '../public')));

// ============ RATE LIMITING ============
if (config.nodeEnv === 'production') {
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
  console.log('✅ Production rate limiting enabled');
} else {
  console.log('⚠️ Development mode: Relaxed rate limiting');
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
}

// Import routes
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import adminRoutes from './routes/adminRoutes';
import membershipRoutes from './routes/membershipRoutes';
import bookingRoutes from './routes/bookingRoutes';
import renewalRoutes from './routes/renewalRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/renewals', renewalRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Debug endpoint - ONLY in development
if (config.nodeEnv !== 'production') {
  app.get('/api/debug/images', (req, res) => {
    fs.readdir(uploadsDir, (err: any, files: string[]) => {
      if (err) {
        return res.json({ error: err.message, uploadsDirectory: uploadsDir });
      }
      res.json({ 
        uploadsDirectory: uploadsDir,
        files: files,
        count: files.length 
      });
    });
  });
  console.log('⚠️ Debug endpoints enabled (development mode only)');
}

// Health check
app.get('/api/health', (req, res) => {
const dbState = mongoose.connection.readyState;
const dbStatusMap: { [key: number]: string } = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};
const dbStatus = dbStatusMap[dbState] || 'unknown';
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
    environment: config.nodeEnv,
    apiUrl: config.frontendUrl
  });
});

// Error handler - Hide stack traces in production
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI = config.mongodbUri;

// ✅ UPDATED - Added async and startup cleanup
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    
    // ✅ ADDED - Run once on startup to clean expired memberships
    try {
      const today = new Date();
      const result = await Membership.updateMany(
        { 
          status: 'ACTIVE', 
          expiryDate: { $lt: today } 
        },
        { $set: { status: 'EXPIRED' } }
      );
      console.log(`✅ Startup cleanup: ${result.modifiedCount} memberships marked as EXPIRED`);
    } catch (error) {
      console.error('❌ Startup cleanup error:', error);
    }
    
    startReminderJobs();
    startExpiryReminderJobs();
    startCleanupJob();
    startBirthdayJob();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  });

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
  console.log(`📸 Images available at: http://localhost:${PORT}/uploads/`);
  if (config.nodeEnv !== 'production') {
    console.log(`🔧 Debug images: http://localhost:${PORT}/api/debug/images`);
  }
});