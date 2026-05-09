import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-prod'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function getTokenFromRequest(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  return req.cookies.get('token')?.value || null
}

export function getUserFromRequest(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}
