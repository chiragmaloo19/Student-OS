import { useState, useCallback } from 'react'
import api from '../lib/api'

/**
 * useApi — generic hook for making API calls with loading/error state
 * @returns {{ data, loading, error, execute }}
 */
export function useApi() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (method, url, payload = null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api[method](url, payload)
      setData(res.data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Something went wrong'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, execute }
}

export default useApi
