import { useState, useEffect, useCallback } from 'react'

export function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    refetch()
  }, dependencies)

  return { data, loading, error, refetch }
}

export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutationFn(...args)
        return result.data
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutationFn]
  )

  return { mutate, loading, error }
}
