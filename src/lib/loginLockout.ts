// Failed login attempt tracking and lockout logic
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const FAILED_ATTEMPTS_KEY = 'aisom:failed_attempts';
const LOCKOUT_TIME_KEY = 'aisom:lockout_time';

interface FailedAttemptRecord {
  email: string;
  attempts: number;
  lastAttemptTime: number;
}

export function getFailedAttempts(email: string): FailedAttemptRecord | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
  if (!stored) return null;

  try {
    const records: Record<string, FailedAttemptRecord> = JSON.parse(stored);
    const normalizedEmail = email.toLowerCase();
    return records[normalizedEmail] || null;
  } catch {
    return null;
  }
}

export function recordFailedAttempt(email: string): FailedAttemptRecord {
  if (typeof window === 'undefined') throw new Error('localStorage is not available');

  const normalizedEmail = email.toLowerCase();
  const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
  let records: Record<string, FailedAttemptRecord> = {};

  if (stored) {
    try {
      records = JSON.parse(stored);
    } catch {
      records = {};
    }
  }

  const now = Date.now();
  const record = records[normalizedEmail] || { email: normalizedEmail, attempts: 0, lastAttemptTime: now };

  // Reset attempts if more than the lockout duration has passed
  if (now - record.lastAttemptTime > LOCKOUT_DURATION_MS) {
    record.attempts = 0;
  }

  record.attempts += 1;
  record.lastAttemptTime = now;
  records[normalizedEmail] = record;

  localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(records));
  
  return record;
}

export function isAccountLocked(email: string): boolean {
  const record = getFailedAttempts(email);
  if (!record) return false;

  const now = Date.now();
  const timeSinceLastAttempt = now - record.lastAttemptTime;

  // If lockout duration has passed, reset
  if (timeSinceLastAttempt > LOCKOUT_DURATION_MS) {
    clearFailedAttempts(email);
    return false;
  }

  return record.attempts >= MAX_FAILED_ATTEMPTS;
}

export function getLockoutTimeRemaining(email: string): number {
  const record = getFailedAttempts(email);
  if (!record) return 0;

  const now = Date.now();
  const timeSinceLastAttempt = now - record.lastAttemptTime;
  const remaining = LOCKOUT_DURATION_MS - timeSinceLastAttempt;

  if (record.attempts < MAX_FAILED_ATTEMPTS) return 0;
  return Math.max(0, remaining);
}

export function clearFailedAttempts(email: string): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
  if (!stored) return;

  try {
    const records: Record<string, FailedAttemptRecord> = JSON.parse(stored);
    const normalizedEmail = email.toLowerCase();
    delete records[normalizedEmail];
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(records));
  } catch {
    // Ignore parsing errors
  }
}

export function formatLockoutTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
