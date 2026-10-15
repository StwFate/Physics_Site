import React, { useState } from 'react'
import { Atom, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { signInWithGoogle, signInWithDemoGoogle } from '../utils/authService'

export default function AuthScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsConsoleEnable, setNeedsConsoleEnable] = useState(false)

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    const res = await signInWithGoogle()
    setLoading(false)

    if (res.success && res.user) {
      onLoginSuccess(res.user)
    } else if (res.needsConsoleEnable) {
      setNeedsConsoleEnable(true)
      setError(res.error)
    } else if (res.error) {
      setError(res.error)
    }
  }

  const handleDemoSignIn = () => {
    const user = signInWithDemoGoogle('Student Demo', 'student@school.edu')
    onLoginSuccess(user)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-sm">
        {/* Clean Integrated Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <Atom className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Mr. William's Practice Site
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Newton's Laws Interactive Suite
          </p>
        </div>

        {/* Minimalist Card */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Sign in to Practice</h2>
            <p className="text-xs text-slate-600">
              Continue with your Google account to track your progress and stars.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 font-medium leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <span>{error}</span>
                {needsConsoleEnable && (
                  <div className="pt-2 border-t border-amber-200 text-[11px] space-y-1">
                    <p className="text-amber-950 font-bold">15-Second Setup for Admin:</p>
                    <p className="text-amber-900">
                      In Firebase Console → Authentication → Sign-in method → Click Google → Enable → Save.
                    </p>
                    <a
                      href="https://console.firebase.google.com/project/mr-williams-physics/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold underline"
                    >
                      <span>Open Firebase Auth Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-700">Connecting to Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Optional Demo Mode */}
          {needsConsoleEnable && (
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Continue in Offline Demo Mode</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
          )}

          <p className="text-[11px] text-center text-slate-600 font-medium pt-1">
            Works with school (.edu) and personal Google accounts.
          </p>
        </div>
      </div>
    </div>
  )
}
