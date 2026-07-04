import { useState } from 'react'
import {
  createAdminRecord,
  resendAdminVerificationEmail,
  signOutAdmin,
  signUpAdmin,
  verifyAdminEmail,
} from '../../lib/auth'

export type CreateAccountStep = 'form' | 'verify' | 'pending'

export interface AdminFormValues {
  fullName: string
  email: string
  phone: string
  password: string
  province: string
  district: string
  city: string
  description: string
}

export function useCreateAccount() {
  const [step, setStep] = useState<CreateAccountStep>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingValues, setPendingValues] = useState<AdminFormValues | null>(null)

  async function saveAdminRecord(authId: string, values: AdminFormValues) {
    await createAdminRecord({
      authId,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      province: values.province,
      district: values.district,
      city: values.city,
      description: values.description,
    })
    await signOutAdmin()
    setStep('pending')
  }

  async function submit(values: AdminFormValues) {
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await signUpAdmin({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      })

      if (data?.requireEmailVerification) {
        setPendingValues(values)
        setStep('verify')
        return
      }

      if (data?.user) {
        await saveAdminRecord(data.user.id, values)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function verify(otp: string) {
    if (!pendingValues) return
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await verifyAdminEmail(pendingValues.email, otp)
      if (!data?.user) {
        throw new Error('Verification failed. Please try again.')
      }
      await saveAdminRecord(data.user.id, pendingValues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function resendCode() {
    if (!pendingValues) return
    setError(null)
    try {
      await resendAdminVerificationEmail(pendingValues.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend the code.')
    }
  }

  return {
    step,
    isSubmitting,
    error,
    pendingEmail: pendingValues?.email ?? null,
    submit,
    verify,
    resendCode,
  }
}
