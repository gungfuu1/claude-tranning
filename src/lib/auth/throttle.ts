// BR-06: lock an account for 15 minutes after 5 consecutive failed logins.
export const MAX_LOGIN_FAILURES = 5;
export const LOCKOUT_MINUTES = 15;

export type Throttle = { failedCount: number; lockedUntil: Date | null };

export const UNLOCKED: Throttle = { failedCount: 0, lockedUntil: null };

export const isLocked = (t: Throttle, now: Date) => t.lockedUntil !== null && now < t.lockedUntil;

// A failure while locked changes nothing, so nobody can keep someone else's account locked (spec 003 §6).
// Reaching the limit locks the account and restarts the count, giving 5 fresh attempts once it unlocks.
export function afterFailure(t: Throttle, now: Date): Throttle {
  if (isLocked(t, now)) return t;
  const failedCount = t.failedCount + 1;
  return failedCount >= MAX_LOGIN_FAILURES
    ? { failedCount: 0, lockedUntil: new Date(now.getTime() + LOCKOUT_MINUTES * 60_000) }
    : { failedCount, lockedUntil: null };
}

export const afterSuccess = (): Throttle => UNLOCKED;
