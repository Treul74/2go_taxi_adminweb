import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Car, Mail, MailCheck, RotateCcw } from 'lucide-react'
import { useForgotPassword } from './useForgotPassword'
import '../../styles/tailwind.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword() {
  const { submit, isSubmitting, isSubmitted, error } = useForgotPassword()

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) {
      setFieldError('Email address is required.')
      return
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError('Enter a valid email address.')
      return
    }

    setFieldError(undefined)
    void submit(trimmed)
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-4 py-12 font-sans">
      <div className="mb-6 flex items-center gap-2">
        <Car className="h-6 w-6 text-primary" strokeWidth={2.5} />
        <span className="text-2xl font-extrabold text-primary">2Go</span>
      </div>

      <div className="w-full max-w-md rounded-card bg-card p-8 text-center shadow-xl">
        {!isSubmitted ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <RotateCcw className="h-6 w-6 text-muted" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-primary">Forgot Password?</h1>
            <p className="mt-1 text-sm text-muted">Enter your email to receive a reset link.</p>

            <form className="mt-6 text-left" noValidate onSubmit={handleSubmit}>
              <label htmlFor="email" className="block text-sm font-medium text-primary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(fieldError)}
                  className="mt-2 w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              {fieldError && <p className="mt-1 text-xs text-danger">{fieldError}</p>}

              {error && (
                <p role="alert" className="mt-4 text-sm text-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-button border-0 bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <hr className="mt-6 border-gray-200" />

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <MailCheck className="h-6 w-6 text-success" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-primary">Check your email</h1>
            <p className="mt-1 text-sm text-muted">Check your email for reset link</p>

            <hr className="mt-6 border-gray-200" />

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Privacy Policy <span className="mx-1">&middot;</span> Contact Support
      </p>
    </div>
  )
}
