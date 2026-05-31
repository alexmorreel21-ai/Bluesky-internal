import { useCallback, useState } from 'react'

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (request: () => Promise<T>) => {
    setLoading(true)
    setError(null)

    try {
      const result = await request()
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, execute, setData, setError }
}
