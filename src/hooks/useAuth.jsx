'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  sessionExpired: () => {},
  isLoading: true,
  isAdmin: false,
})

/**
 * Reads the `exp` claim out of a JWT without verifying it (real verification
 * happens server-side). Returns expiry in ms since epoch, or null if unreadable.
 */
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function isExpired(token) {
  const exp = getTokenExpiry(token)
  return exp !== null && Date.now() >= exp
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const expiryTimer = useRef(null)

  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    try {
      localStorage.removeItem('gem_token')
      localStorage.removeItem('gem_user')
      document.cookie = 'token=; path=/; max-age=0'
    } catch {
      // ignore
    }
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current)
      expiryTimer.current = null
    }
  }, [])

  // Auto-clear the session the moment the token expires while a tab is open,
  // so the UI never shows "logged in" with a token the server will reject.
  const scheduleExpiry = useCallback((t) => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current)
    const exp = getTokenExpiry(t)
    if (!exp) return
    const ms = exp - Date.now()
    // setTimeout maxes out around 24.8 days; our tokens are well under that.
    if (ms > 0 && ms < 2147483647) {
      expiryTimer.current = setTimeout(() => {
        clearSession()
        toast.error('Your session has expired. Please sign in again.')
      }, ms)
    }
  }, [clearSession])

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('gem_token')
      const savedUser  = localStorage.getItem('gem_user')
      if (savedToken && savedUser) {
        // Stale login from a previous day/week — drop it instead of restoring a
        // session that looks valid but fails on every authenticated request.
        if (isExpired(savedToken)) {
          clearSession()
        } else {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
          scheduleExpiry(savedToken)
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
    return () => { if (expiryTimer.current) clearTimeout(expiryTimer.current) }
  }, [clearSession, scheduleExpiry])

  function login(newUser, newToken) {
    setUser(newUser)
    setToken(newToken)
    localStorage.setItem('gem_token', newToken)
    localStorage.setItem('gem_user', JSON.stringify(newUser))
    document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    scheduleExpiry(newToken)
  }

  function logout() {
    clearSession()
  }

  /**
   * Called when the server rejects our token (401). Clears the stale session and
   * sends the user to sign in again, returning them to where they were.
   */
  const sessionExpired = useCallback((redirectTo) => {
    clearSession()
    toast.error('Your session has expired. Please sign in again.')
    const target = redirectTo || (typeof window !== 'undefined' ? window.location.pathname : '/')
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${encodeURIComponent(target)}`
    }
  }, [clearSession])

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, sessionExpired, isLoading, isAdmin: user?.role === 'ADMIN' }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
