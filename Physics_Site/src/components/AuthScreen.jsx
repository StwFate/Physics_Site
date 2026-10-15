import React, { useState } from 'react'
import { Atom, ShieldCheck, Sparkles, BookOpen, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100 rounded-full blur-3xl"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Top Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center mb-3">
            <Atom className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
            Mr. William's Practice Site
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Newton's Laws Interactive Suite
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 border border-slate-200/80 rounded-2xl sm:px-10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Student Access</h2>
            <p className="text-xs text-slate-600 font-medium">
              Sign in with your school or personal Google account to continue.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 font-medium leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span>{error}</span>
                {needsConsoleEnable && (
                  <div className="mt-2 pt-2 border-t border-amber-200/80 text-[11px] space-y-1.5">
                    <p className="text-amber-950 font-semibold">Quick Setup for Teacher / Admin:</p>
                    <ol className="list-decimal list-inside text-amber-900 space-y-0.5">
                      <li>Open your Firebase Console Authentication tab.</li>
                      <li>Click <strong>Sign-in method</strong> → select <strong>Google</strong>.</li>
                      <li>Toggle <strong>Enable</strong>, select your support email, and click <strong>Save</strong>.</li>
                    </ol>
                    <a
                      href="https://console.firebase.google.com/project/mr-williams-physics/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold underline mt-1"
                    >
                      <span>Open Firebase Auth Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary Google Sign-In Button */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl shadow-xs bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-sm font-semibold transition-all duration-150 hover:shadow-md hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-700">Connecting to Google...</span>
                </div>
              ) : (
                <>
                  {/* Official Google G Logo SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Demo Student Login Fallback */}
            {needsConsoleEnable && (
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Continue as Demo Student (Offline Mode)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Education & Chromebook Feature Pills */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chromebook & Google Classroom Ready</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Saves your stars, mastery, and badges automatically</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Apprentice, Master, and Wizard question pools</span>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-[11px] text-center text-slate-500 leading-relaxed">
            Authentication is powered by Google Firebase. Only your name and email are used to save your classroom progress.
          </p>
        </div>
      </div>
    </div>
  )
}
