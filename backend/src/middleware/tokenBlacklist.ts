// backend/src/middleware/tokenBlacklist.ts
import { Request, Response, NextFunction } from 'express';

// Simple in-memory blacklist (use Redis in production for scalability)
const tokenBlacklist = new Set<string>();
const blacklistTimestamps = new Map<string, number>();

// Clean up expired tokens every hour (tokens expire after 7 days)
setInterval(() => {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  for (const [token, timestamp] of blacklistTimestamps.entries()) {
    if (now - timestamp > sevenDays) {
      tokenBlacklist.delete(token);
      blacklistTimestamps.delete(token);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export const blacklistToken = (token: string): void => {
  if (!token) return;
  tokenBlacklist.add(token);
  blacklistTimestamps.set(token, Date.now());
  console.log(`🔒 Token blacklisted: ${token.substring(0, 20)}...`);
};

export const isTokenBlacklisted = (token: string): boolean => {
  if (!token) return false;
  return tokenBlacklist.has(token);
};

export const removeTokenFromBlacklist = (token: string): void => {
  if (!token) return;
  tokenBlacklist.delete(token);
  blacklistTimestamps.delete(token);
};

export const getBlacklistSize = (): number => {
  return tokenBlacklist.size;
};

// Middleware to check if token is blacklisted
export const tokenBlacklistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  
  if (token && isTokenBlacklisted(token)) {
    res.clearCookie('token');
    return res.status(401).json({ 
      message: 'Session has been invalidated. Please login again.' 
    });
  }
  
  next();
};

// Optional: Redis implementation for production (scales better)
// export const createRedisBlacklist = (redisClient: any) => {
//   return {
//     blacklistToken: async (token: string, expiresInSeconds: number = 604800) => {
//       await redisClient.setEx(`blacklist:${token}`, expiresInSeconds, '1');
//     },
//     isTokenBlacklisted: async (token: string) => {
//       const result = await redisClient.get(`blacklist:${token}`);
//       return result === '1';
//     },
//     removeTokenFromBlacklist: async (token: string) => {
//       await redisClient.del(`blacklist:${token}`);
//     }
//   };
// };