import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 5 requests per hour — register
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix:  'ratelimit:register',
})

// 10 requests per hour — login
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix:  'ratelimit:login',
})

// 3 requests per hour — resend OTP
export const resendOtpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix:  'ratelimit:resend-otp',
})

// 10 requests per hour — verify OTP
export const verifyOtpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix:  'ratelimit:verify-otp',
})

// 20 requests per hour — create listing
export const createListingLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix:  'ratelimit:create-listing',
})

// 30 requests per hour — upload
export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  prefix:  'ratelimit:upload',
})

export async function checkRateLimit(limiter, req) {
  const ip =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  return {
    success,
    limit,
    remaining,
    reset,
    ip,
  }
}