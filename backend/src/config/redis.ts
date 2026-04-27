import Redis from 'ioredis';

let redis: Redis | null = null;
let isRedisAvailable = false;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      // Don't retry too aggressively
      if (times > 3) {
        console.log('⚠️ Redis not available, falling back to memory storage');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 1000, 3000);
      return delay;
    },
    maxRetriesPerRequest: 1,
    enableReadyCheck: false
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
    isRedisAvailable = true;
  });

  redis.on('error', (err) => {
    if (!isRedisAvailable) {
      // Only log once
      console.log('⚠️ Redis not available, OTP will use memory storage');
      isRedisAvailable = false;
    }
  });
} catch (error) {
  console.log('⚠️ Redis not configured, using memory storage for OTP');
}

export const getRedis = () => redis;
export const isRedisReady = () => isRedisAvailable && redis !== null;
export default redis;