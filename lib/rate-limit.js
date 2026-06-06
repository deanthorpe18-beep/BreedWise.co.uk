// Simple in-memory rate limiter for API routes.
// For production, replace with Redis or Upstash Ratelimit.

const ipLimits = new Map();
const emailLimits = new Map();

function isExpired(record, windowMs) {
  return Date.now() - record.startTime > windowMs;
}

function checkLimit(map, key, maxRequests, windowMs) {
  const now = Date.now();
  let record = map.get(key);

  if (!record || isExpired(record, windowMs)) {
    record = { count: 1, startTime: now };
    map.set(key, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.startTime + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function rateLimitByIp(ip, maxRequests = 10, windowMs = 60000) {
  return checkLimit(ipLimits, ip, maxRequests, windowMs);
}

export function rateLimitByEmail(email, maxRequests = 5, windowMs = 3600000) {
  return checkLimit(emailLimits, email.toLowerCase(), maxRequests, windowMs);
}

export function rateLimitAuth(ip, maxRequests = 5, windowMs = 300000) {
  return checkLimit(ipLimits, `auth:${ip}`, maxRequests, windowMs);
}
