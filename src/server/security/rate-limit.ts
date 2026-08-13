const attempts = new Map<string, { count: number; resetsAt: number }>();
export function checkRateLimit(key: string, limit = 5, windowMs = 10 * 60_000) {
  const now = Date.now(); const current = attempts.get(key);
  if (!current || current.resetsAt < now) { attempts.set(key, { count: 1, resetsAt: now + windowMs }); return true; }
  if (current.count >= limit) return false; current.count += 1; return true;
}
