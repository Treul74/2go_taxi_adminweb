import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Car, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useLogin } from './useLogin'
import '../../styles/tailwind.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

export default function Login() {
  const { login, isSubmitting, error } = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validate(email, password)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    void login(email.trim(), password)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16 font-sans bg-primary bg-[radial-gradient(ellipse_at_top,_#33456a_0%,_#1a2740_60%,_#131d30_100%)]">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-lg bg-accent p-2">
            <Car className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-3xl font-bold text-white">2Go Admin</span>
        </div>
        <p className="mt-2 text-sm tracking-[0.2em] text-slate-400">
          ENTERPRISE CONTROL SHELL
        </p>
      </div>

      <div className="w-full max-w-md rounded-card bg-card p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Please enter your credentials to access the console.
        </p>

        <form className="mt-6" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold tracking-wide text-primary"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@2go.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
            )}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold tracking-wide text-primary"
              >
                PASSWORD
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-accent no-underline hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-11 text-sm text-primary placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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

          <label className="mt-5 flex items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            Remember this device
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-button border-0 bg-accent py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing In…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <hr className="my-6 border-gray-200" />

        <div className="text-center text-sm">
          <p className="text-muted">New to the platform?</p>
          <Link to="/create-account" className="font-bold text-primary no-underline hover:underline">
            Create Enterprise Account
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs tracking-widest text-slate-400">
        <ShieldCheck className="h-4 w-4" />
        256-BIT AES SECURED CONSOLE
      </div>
    </div>
  )
}
