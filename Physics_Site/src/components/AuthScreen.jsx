import React, { useState, useEffect } from 'react'
import { Atom, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { loginStudent, registerStudent, getRateLimitStatus } from '../utils/authService'

export default function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)

  // Check rate limit status on mount and countdown
  useEffect(() => {
    const checkRateLimit = () => {
      const status = getRateLimitStatus()
      if (status.isLocked) {
        setCooldown(status.remainingSeconds)
        setAttemptsRemaining(0)
      } else {
        setCooldown(0)
        setAttemptsRemaining(status.attemptsRemaining)
      }
    }

    checkRateLimit()
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          checkRateLimit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate password strength for signup
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-slate-200', score: 0 }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', score: 25 }
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', score: 50 }
    if (score === 3) return { label: 'Good', color: 'bg-blue-600', score: 75 }
    return { label: 'Strong', color: 'bg-emerald-600', score: 100 }
  }

  const passStrength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (cooldown > 0) {
      setError(`Temporary lockout active. Please wait ${cooldown} seconds.`)
      return
    }

    const cleanUser = username.trim()
    if (!cleanUser) {
      setError('Please enter your username.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-type your password.')
        return
      }

      setLoading(true)
      const res = await registerStudent(cleanUser, password)
      setLoading(false)

      if (res.success) {
        onLoginSuccess(res.user)
      } else {
        setError(res.error)
        if (res.lockedOut) {
          setCooldown(res.remainingSeconds)
        }
      }
    } else {
      // Login mode
      setLoading(true)
      const res = await loginStudent(cleanUser, password)
      setLoading(false)

      if (res.success) {
        onLoginSuccess(res.user)
      } else {
        setError(res.error)
        if (res.lockedOut) {
          setCooldown(res.remainingSeconds)
          setAttemptsRemaining(0)
        } else if (res.attemptsRemaining !== undefined) {
          setAttemptsRemaining(res.attemptsRemaining)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Top Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl shadow-md flex items-center justify-center mb-3">
            <Atom className="w-7 h-7 animate-spin-slow" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Mr. William's Practice Site
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Newton's Laws Interactive Suite • Student Access
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white py-8 px-6 shadow-md border border-slate-200 rounded-xl sm:px-10">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`flex-1 py-2 rounded-md transition-all text-center ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`flex-1 py-2 rounded-md transition-all text-center ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Rate Limit Active Warning Banner */}
          {cooldown > 0 && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium"
            >
              <Clock className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
              <span>
                Rate limit active: Too many failed attempts. Please wait{' '}
                <strong className="font-mono text-rose-900">{cooldown}s</strong> before trying again.
              </span>
            </div>
          )}

          {/* Form Error Banner */}
          {error && cooldown === 0 && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* The Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="auth-username" className="block text-xs font-semibold text-slate-800 mb-1">
                Username
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={cooldown > 0 || loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'signup' ? 'e.g., alex_physics' : 'Enter your username'}
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              {mode === 'signup' && (
                <p className="mt-1 text-[11px] text-slate-600">
                  3–20 characters. Letters, numbers, hyphens, and underscores only.
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-800 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  disabled={cooldown > 0 || loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  className="block w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength bar for signup */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passStrength.color}`}
                      style={{ width: `${passStrength.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                    <span>Strength: {passStrength.label}</span>
                    <span>Min 6 characters</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-slate-800 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={cooldown > 0 || loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">Passwords do not match yet.</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-[11px] text-emerald-700 font-medium">✓ Passwords match</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={cooldown > 0 || loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Log In to Practice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Create Account & Start</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security & Classroom Notice */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-700 text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted Student Credentials</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Passwords are salted and cryptographically hashed with SHA-256 before storage.
              Please record your username and password in your physics notes so you can resume your mastery anytime!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
