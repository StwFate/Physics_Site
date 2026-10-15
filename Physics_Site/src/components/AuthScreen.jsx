import React, { useState } from 'react'
import { AlertCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { signInWithGoogle, signInWithDemoGoogle } from '../utils/authService'

export function DopplerLogo({ className = 'h-7 w-auto' }) {
  return (
    <svg className={className} viewBox="0 0 52 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Solid blue circle */}
      <circle cx="12" cy="12" r="10" fill="#0052FF" />
      {/* First wave arc */}
      <path
        d="M 27 5 C 31.5 8.5 31.5 15.5 27 19"
        stroke="#0052FF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Second wave arc */}
      <path
        d="M 35 3 C 41.5 7.5 41.5 16.5 35 21"
        stroke="#0052FF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none">
      {/* Top Navigation Bar */}
      <header className="h-16 sm:h-18 border-b border-black bg-white px-6 sm:px-10 lg:px-14 flex items-center justify-between shrink-0 z-10">
        {/* Left: Doppler Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <DopplerLogo className="h-6 sm:h-7 lg:h-8 w-auto" />
          <span className="font-bold text-base sm:text-lg lg:text-xl tracking-tight text-black">
            Mr. William’s Practice Site
          </span>
        </div>

        {/* Right: Newton's Laws Tag */}
        <div className="font-bold text-xs sm:text-sm lg:text-sm tracking-[0.22em] text-black uppercase">
          NEWTON’S LAWS
        </div>
      </header>

      {/* Main Split-Screen Section */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Electric Blue Hero Canvas */}
        <div className="bg-[#0052FF] p-8 sm:p-12 lg:p-14 xl:p-16 2xl:p-20 flex flex-col justify-between text-white relative min-h-[580px] lg:min-h-0">
          {/* Top Heading */}
          <div className="space-y-3 sm:space-y-4 pt-2">
            <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold tracking-tight text-white leading-[0.98]">
              Put physics<br />in motion.
            </h1>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-normal text-white/95 tracking-tight pt-1">
              Three laws. Real understanding.
            </p>
          </div>

          {/* Center Graphic: Prominent Scaled Physics Illustration */}
          <div className="my-auto py-8 sm:py-12 lg:py-14 flex items-center justify-start w-full">
            <svg
              className="w-full max-w-[640px] lg:max-w-[700px] xl:max-w-[780px] 2xl:max-w-[900px] h-auto drop-shadow-md transition-all duration-300"
              viewBox="0 0 540 250"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Horizontal dashed center-line */}
              <line
                x1="0"
                y1="115"
                x2="246"
                y2="115"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="7 7"
              />

              {/* Dashed Strobe Circles (radius 48) */}
              {/* Circle 1 */}
              <circle
                cx="58"
                cy="115"
                r="48"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="7 7"
                fill="none"
              />
              {/* Circle 2 */}
              <circle
                cx="132"
                cy="115"
                r="48"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="7 7"
                fill="none"
              />
              {/* Circle 3 */}
              <circle
                cx="216"
                cy="115"
                r="48"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="7 7"
                fill="none"
              />

              {/* Solid White Disc (radius 84 = 1.75x of 48) */}
              <circle cx="330" cy="115" r="84" fill="#ffffff" />

              {/* Bold Yellow Force Vector Arrow */}
              {/* Arrow Shaft */}
              <rect
                x="246"
                y="103"
                width="186"
                height="24"
                fill="#FFE500"
              />
              {/* Large Crisp Arrow Head */}
              <polygon
                points="430,75 506,115 430,155"
                fill="#FFE500"
              />

              {/* Force Label Centered in Top Half of White Disc */}
              <text
                x="330"
                y="78"
                textAnchor="middle"
                fill="#000000"
                fontFamily="inherit"
                fontWeight="900"
                fontSize="17"
                letterSpacing="0.16em"
              >
                FORCE
              </text>

              {/* Motion Indicator Baseline */}
              <line
                x1="250"
                y1="212"
                x2="410"
                y2="212"
                stroke="white"
                strokeWidth="3"
              />
              {/* Motion Label */}
              <text
                x="330"
                y="236"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="inherit"
                fontWeight="700"
                fontSize="14"
                letterSpacing="0.24em"
              >
                MOTION →
              </text>
            </svg>
          </div>

          {/* Bottom 3 Laws Badges */}
          <div className="pt-4 flex items-center gap-4 sm:gap-8 2xl:gap-12 text-xs sm:text-sm 2xl:text-base font-bold tracking-[0.16em] text-white uppercase whitespace-nowrap">
            <span>01 / INERTIA</span>
            <div className="w-[1.5px] h-4 bg-white/40 shrink-0" />
            <span>02 / FORCE</span>
            <div className="w-[1.5px] h-4 bg-white/40 shrink-0" />
            <span>03 / REACTION</span>
          </div>
        </div>

        {/* Right Side: Clean White Auth Panel */}
        <div className="bg-white p-8 sm:p-12 lg:p-14 xl:p-16 2xl:p-20 flex flex-col justify-between">
          <div className="max-w-[440px] xl:max-w-[500px] 2xl:max-w-[560px] w-full mx-auto lg:mx-0 my-auto py-4">
            {/* Tagline */}
            <div className="text-xs sm:text-[13px] 2xl:text-sm font-bold tracking-[0.22em] text-[#0052FF] uppercase mb-4">
              LET’S GET STARTED
            </div>

            {/* Main Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[60px] 2xl:text-[68px] font-black text-black tracking-tight leading-[1.04] mb-6">
              Your next<br />
              breakthrough<br />
              starts here.
            </h2>

            {/* Subtext */}
            <p className="text-base sm:text-lg xl:text-xl text-slate-800 font-normal leading-relaxed mb-8">
              Sign in to practice Newton’s laws and save your progress.
            </p>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5 font-medium leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
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

            {/* Continue with Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-13 sm:h-14 xl:h-15 bg-white hover:bg-slate-50 active:bg-slate-100 border border-black rounded-md flex items-center justify-center gap-3.5 px-6 font-semibold text-black text-sm sm:text-base xl:text-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-700 font-medium text-sm sm:text-base">Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 xl:w-6 xl:h-6 shrink-0" viewBox="0 0 24 24">
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
                  <span className="font-semibold text-slate-900">Continue with Google</span>
                </>
              )}
            </button>

            {/* Helper microcopy */}
            <p className="text-xs sm:text-sm xl:text-base text-slate-500 mt-3 font-normal">
              Use your school or personal Google account.
            </p>

            {/* Optional Fallback Demo Mode */}
            {needsConsoleEnable && (
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <span>Continue in Offline Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Bottom Star Guarantee */}
          <div className="flex items-center gap-3 text-xs sm:text-sm xl:text-base text-slate-800 font-medium pt-8 lg:pt-0">
            <svg
              className="w-5 h-5 xl:w-6 xl:h-6 text-black stroke-[1.6] fill-none shrink-0"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <span>Your progress, saved as you go.</span>
          </div>
        </div>
      </main>
    </div>
  )
}
