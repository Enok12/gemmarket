'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isAdmin: false,
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('gem_token')
      const savedUser  = localStorage.getItem('gem_user')
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  function login(newUser, newToken) {
    setUser(newUser)
    setToken(newToken)
    localStorage.setItem('gem_token', newToken)
    localStorage.setItem('gem_user', JSON.stringify(newUser))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('gem_token')
    localStorage.removeItem('gem_user')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, isAdmin: user?.role === 'ADMIN' }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
