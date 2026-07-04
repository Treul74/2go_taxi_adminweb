import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPassword } from '../../lib/auth'

export function useLogin() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(email: string, password: string) {
    setError(null)
    setIsSubmitting(true)
    try {
      await signInWithPassword(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { login, isSubmitting, error }
}
