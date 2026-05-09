'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export function useApi() {
  const { token } = useAuth()

  const request = useCallback(
    async (path, options = {}) => {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(path, {
        method: options.method || 'GET',
        headers,
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      return data.data
    },
    [token]
  )

  return { request }
}

export function useListings(params = {}) {
  const [listings, setListings]   = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const key = JSON.stringify(params)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams(params).toString()
      const res   = await fetch(`/api/listings?${query}`)
      const data  = await res.json()
      if (data.success) {
        setListings(data.data.listings)
        setPagination(data.data.pagination)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => { fetchListings() }, [fetchListings])

  return { listings, pagination, loading, error, refetch: fetchListings }
}
