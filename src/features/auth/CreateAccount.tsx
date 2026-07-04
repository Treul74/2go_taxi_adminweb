import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useCreateAccount, type AdminFormValues } from './useCreateAccount'
import '../../styles/tailwind.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,}$/

interface FieldErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}

function validate(values: AdminFormValues, confirmPassword: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

const inputClass =
  'mt-2 w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
const labelClass = 'block text-sm font-medium text-primary'

export default function CreateAccount() {
  const { step, isSubmitting, error, pendingEmail, submit, verify, resendCode } =
    useCreateAccount()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [otp, setOtp] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const values: AdminFormValues = {
      fullName,
      email,
      phone,
      password,
      province,
      district,
      city,
      description,
    }

    const errors = validate(values, confirmPassword)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    void submit(values)
  }

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void verify(otp)
  }

  return (
    <div className="min-h-screen w-full font-sans">
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-500 via-slate-400 to-accent" />

      <div className="flex min-h-[calc(100svh-6px)] w-full flex-col items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-2xl rounded-card bg-card p-10 shadow-xl">
          {step === 'form' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-primary">2Go</h2>
                <h1 className="mt-6 text-2xl font-bold text-primary">Create your account</h1>
                <p className="mt-1 text-sm text-muted">Join the leading logistics platform</p>
              </div>

              <form className="mt-8" noValidate onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.fullName)}
                        className={inputClass}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-xs text-danger">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.email)}
                        className={inputClass}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.phone)}
                        className={inputClass}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClass}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.password)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 flex items-center border-0 bg-transparent px-3 text-gray-400 [appearance:none] hover:text-primary"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 flex items-center border-0 bg-transparent px-3 text-gray-400 [appearance:none] hover:text-primary"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-danger">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <hr className="my-6 border-gray-200" />

                <p className="text-xs font-bold tracking-wide text-muted">
                  LOCATION DETAILS (OPTIONAL)
                </p>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <label htmlFor="province" className={labelClass}>
                      Province
                    </label>
                    <input
                      id="province"
                      type="text"
                      placeholder="Enter province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className={labelClass}>
                      District
                    </label>
                    <input
                      id="district"
                      type="text"
                      placeholder="Enter district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Tell us a bit about this account (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-danger">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-8 w-full rounded-button border-0 bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating Account…' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                Already have an account?{' '}
                <Link to="/" className="font-bold text-primary no-underline hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}

          {step === 'verify' && (
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-primary">2Go</h2>
              <h1 className="mt-6 text-2xl font-bold text-primary">Verify your email</h1>
              <p className="mt-1 text-sm text-muted">
                Enter the 6-digit code sent to <span className="font-semibold">{pendingEmail}</span>
              </p>

              <form className="mt-8 text-left" noValidate onSubmit={handleVerify}>
                <label htmlFor="otp" className={labelClass}>
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.5em] text-primary placeholder:tracking-normal placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />

                {error && (
                  <p role="alert" className="mt-4 text-sm text-danger">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="mt-6 w-full rounded-button border-0 bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Verifying…' : 'Verify & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => void resendCode()}
                  className="mt-4 w-full border-0 bg-transparent py-1 text-sm font-semibold text-accent [appearance:none] hover:underline"
                >
                  Resend code
                </button>
              </form>
            </div>
          )}

          {step === 'pending' && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" strokeWidth={1.5} />
              <h1 className="mt-6 text-2xl font-bold text-primary">Account Created</h1>
              <p className="mt-2 text-sm text-muted">
                Account pending approval by Super Administrator
              </p>
              <Link
                to="/"
                className="mt-8 inline-block w-full rounded-button border-0 bg-accent py-3 text-sm font-bold text-white no-underline shadow-lg shadow-accent/30 transition hover:brightness-105"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs tracking-widest text-muted">
          <ShieldCheck className="h-4 w-4" />© 2026 2Go Logistics Platform. All rights reserved.
        </div>
      </div>
    </div>
  )
}
