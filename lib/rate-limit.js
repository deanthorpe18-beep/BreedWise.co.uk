// Simple in-memory rate limiter for API routes.
// Railway runs persistent processes, so this works well without Redis.
// TTL cleanup prevents memory leaks on long-running instances.

const ipLimits = new Map();
const emailLimits = new Map();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function cleanup(map, windowMs) {
  const cutoff = Date.now() - windowMs * 2;
  for (const [key, record] of map) {
    if (record.startTime < cutoff) {
      map.delete(key);
    }
  }
}

function maybeCleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanup(ipLimits, windowMs);
    cleanup(emailLimits, windowMs);
    lastCleanup = now;
  }
}

function isExpired(record, windowMs) {
  return Date.now() - record.startTime > windowMs;
}

function peekLimit(map, key, maxRequests, windowMs) {
  maybeCleanup(windowMs);
  const now = Date.now();
  let record = map.get(key);

  if (!record || isExpired(record, windowMs)) {
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.startTime + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, remaining: maxRequests - record.count };
}

function incrementLimit(map, key, maxRequests, windowMs) {
  maybeCleanup(windowMs);
  const now = Date.now();
  let record = map.get(key);

  if (!record || isExpired(record, windowMs)) {
    record = { count: 1, startTime: now };
    map.set(key, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

function checkLimit(map, key, maxRequests, windowMs) {
  return incrementLimit(map, key, maxRequests, windowMs);
}

export function rateLimitByIp(ip, maxRequests = 10, windowMs = 60000) {
  return checkLimit(ipLimits, ip, maxRequests, windowMs);
}

export function peekRateLimitByIp(ip, maxRequests = 10, windowMs = 60000) {
  return peekLimit(ipLimits, ip, maxRequests, windowMs);
}

export function incrementRateLimitByIp(ip, maxRequests = 10, windowMs = 60000) {
  return incrementLimit(ipLimits, ip, maxRequests, windowMs);
}

export function rateLimitByEmail(email, maxRequests = 5, windowMs = 3600000) {
  return checkLimit(emailLimits, email.toLowerCase(), maxRequests, windowMs);
}

export function rateLimitAuth(ip, maxRequests = 5, windowMs = 300000) {
  return checkLimit(ipLimits, `auth:${ip}`, maxRequests, windowMs);
}
