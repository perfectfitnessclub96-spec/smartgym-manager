// backend/src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️ Running in development with missing env vars may cause issues');
  }
}

// Validate JWT secret strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartgym',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'],
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    otpMax: parseInt(process.env.OTP_RATE_LIMIT_MAX || '10', 10),
    loginMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
  },
  
  // Security
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '15', 10),
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  accountLockoutMinutes: parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES || '30', 10),
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};

console.log(`✅ Environment: ${config.nodeEnv}`);
console.log(`✅ API URL: ${config.nodeEnv === 'production' ? config.frontendUrl : 'http://localhost:5173'}`);