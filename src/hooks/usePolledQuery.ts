import { useCallback, useEffect, useRef, useState } from 'react'

interface PolledQueryOptions {
  intervalMs?: number
}

export function usePolledQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  { intervalMs }: PolledQueryOptions = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // refetch sets loading/data/error state; this is the standard fetch-on-mount-and-deps-change
    // pattern (react.dev/reference/react/useEffect#fetching-data-with-effects), not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch()

    if (!intervalMs) return
    const id = setInterval(() => void refetch(), intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, isLoading, error, refetch }
}
