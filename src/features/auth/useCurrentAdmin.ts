import { useEffect, useState } from 'react'
import { getCurrentAdmin, type CurrentAdmin } from '../../lib/auth'

export function useCurrentAdmin() {
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getCurrentAdmin()
      .then((result) => {
        if (isMounted) setAdmin(result)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { admin, isLoading }
}
