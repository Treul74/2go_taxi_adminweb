import { useState } from 'react'
import { sendPasswordResetEmail } from '../../lib/auth'

export function useForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(email: string) {
    setError(null)
    setIsSubmitting(true)
    try {
      await sendPasswordResetEmail(email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting, isSubmitted, error }
}
