import { insforge } from './insforge'

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await insforge.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.statusCode === 403) {
      throw new Error('Please verify your email before signing in.')
    }
    throw new Error(error.message || 'Invalid email or password.')
  }

  if (data.user.id) {
    void insforge.database
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('auth_id', data.user.id)
  }

  return data
}

export interface AdminSignUpInput {
  fullName: string
  email: string
  password: string
}

export async function signUpAdmin({ fullName, email, password }: AdminSignUpInput) {
  const { data, error } = await insforge.auth.signUp({ email, password, name: fullName })

  if (error) {
    throw new Error(error.message || 'Unable to create account.')
  }

  return data
}

export async function verifyAdminEmail(email: string, otp: string) {
  const { data, error } = await insforge.auth.verifyEmail({ email, otp })

  if (error) {
    if (error.statusCode === 400) {
      throw new Error('Invalid or expired verification code.')
    }
    throw new Error(error.message || 'Unable to verify your email.')
  }

  return data
}

export async function resendAdminVerificationEmail(email: string) {
  const { error } = await insforge.auth.resendVerificationEmail({ email })

  if (error) {
    throw new Error(error.message || 'Unable to resend the verification code.')
  }
}

export interface AdminRecordInput {
  authId: string
  fullName: string
  email: string
  phone: string
  province?: string
  district?: string
  city?: string
  description?: string
}

export async function createAdminRecord(input: AdminRecordInput) {
  const { error } = await insforge.database.from('admins').insert([
    {
      auth_id: input.authId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      province: input.province || null,
      district: input.district || null,
      city: input.city || null,
      description: input.description || null,
    },
  ])

  if (error) {
    throw new Error(error.message || 'Unable to save account details.')
  }
}

export async function signOutAdmin() {
  await insforge.auth.signOut()
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await insforge.auth.sendResetPasswordEmail({ email })

  if (error) {
    throw new Error(error.message || 'Unable to send the reset link. Please try again.')
  }
}

export interface CurrentAdmin {
  name: string
  email: string
  avatarUrl: string | null
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const { data, error } = await insforge.auth.getCurrentUser()

  if (error || !data.user) return null

  return {
    name: data.user.profile?.name || data.user.email,
    email: data.user.email,
    avatarUrl: data.user.profile?.avatar_url ?? null,
  }
}
