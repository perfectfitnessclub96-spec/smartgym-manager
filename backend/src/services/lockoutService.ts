// backend/src/services/lockoutService.ts
interface LockoutEntry {
  count: number;
  lockUntil: number | null;
  lastAttempt: number;
}

const lockoutMap = new Map<string, LockoutEntry>();

// Clean up old lockout entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [identifier, entry] of lockoutMap.entries()) {
    // Remove entries older than 1 hour that aren't locked
    if (!entry.lockUntil && now - entry.lastAttempt > 60 * 60 * 1000) {
      lockoutMap.delete(identifier);
    }
    // Remove expired locks
    if (entry.lockUntil && entry.lockUntil < now) {
      lockoutMap.delete(identifier);
    }
  }
}, 60 * 60 * 1000);

export const checkAccountLockout = (identifier: string): { locked: boolean; remainingMinutes?: number } => {
  const entry = lockoutMap.get(identifier.toLowerCase());
  if (entry?.lockUntil && entry.lockUntil > Date.now()) {
    const remainingMinutes = Math.ceil((entry.lockUntil - Date.now()) / 60000);
    return { locked: true, remainingMinutes };
  }
  return { locked: false };
};

export const recordFailedAttempt = (identifier: string): void => {
  const normalizedId = identifier.toLowerCase();
  const existingEntry = lockoutMap.get(normalizedId);
  
  const entry: LockoutEntry = existingEntry || { 
    count: 0, 
    lockUntil: null, 
    lastAttempt: Date.now() 
  };
  
  entry.count++;
  entry.lastAttempt = Date.now();
  
  // Lock account after 5 failed attempts
  if (entry.count >= 5 && !entry.lockUntil) {
    entry.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
    console.log(`🔒 Account locked for ${identifier} until ${new Date(entry.lockUntil).toISOString()}`);
  }
  
  lockoutMap.set(normalizedId, entry);
};

export const resetFailedAttempts = (identifier: string): void => {
  lockoutMap.delete(identifier.toLowerCase());
};

export const getFailedAttemptCount = (identifier: string): number => {
  const entry = lockoutMap.get(identifier.toLowerCase());
  return entry?.count || 0;
};

export const isAccountLocked = (identifier: string): boolean => {
  const entry = lockoutMap.get(identifier.toLowerCase());
  if (entry?.lockUntil && entry.lockUntil > Date.now()) {
    return true;
  }
  return false;
};

export const getLockTimeRemaining = (identifier: string): number => {
  const entry = lockoutMap.get(identifier.toLowerCase());
  if (entry?.lockUntil && entry.lockUntil > Date.now()) {
    return Math.ceil((entry.lockUntil - Date.now()) / 60000);
  }
  return 0;
};