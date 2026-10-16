import React, { useState, useEffect } from 'react'
import { ArrowLeftRight, Move, Calculator, Star, LogOut } from 'lucide-react'
import BalancedForcesModule from './components/BalancedForcesModule'
import FBDModule from './components/FBDModule'
import SolveItModule from './components/SolveItModule'
import AuthScreen, { DopplerLogo } from './components/AuthScreen'
import { subscribeToAuth, signOutStudent, backupUserProgress, getCachedAuthUser } from './utils/authService'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCachedAuthUser())
  const [authInitialized, setAuthInitialized] = useState(() => !!getCachedAuthUser())
  const [activeTab, setActiveTab] = useState('balanced')
  const [stats, setStats] = useState({ balanced: 0, fbd: 0, solveit: 0 })

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user)
      setAuthInitialized(true)
    })
    return () => unsubscribe && unsubscribe()
  }, [])

  const updateStats = () => {
    try {
      const b = JSON.parse(localStorage.getItem('physix_balanced_completed') || '{}')
      const f = JSON.parse(localStorage.getItem('physix_fbd_completed') || '{}')
      const s = JSON.parse(localStorage.getItem('physix_solveit_completed') || '{}')
      setStats({
        balanced: Object.keys(b).length,
        fbd: Object.keys(f).length,
        solveit: Object.keys(s).length,
      })
      if (currentUser?.uid) {
        backupUserProgress(currentUser.uid)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (currentUser) {
      updateStats()
      const interval = setInterval(updateStats, 1000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const handleResetAllProgress = () => {
    if (!currentUser) return
    if (window.confirm(`Reset all earned stars and progress for ${currentUser.displayName}?`)) {
      localStorage.removeItem('physix_balanced_completed')
      localStorage.removeItem('physix_fbd_completed')
      localStorage.removeItem('physix_solveit_completed')
      backupUserProgress(currentUser.uid)
      updateStats()
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    if (!currentUser) return
    if (window.confirm(`Sign out of ${currentUser.displayName}'s account?`)) {
      await signOutStudent(currentUser.uid)
      setCurrentUser(null)
      setStats({ balanced: 0, fbd: 0, solveit: 0 })
    }
  }

  const totalMastered = stats.balanced + stats.fbd + stats.solveit

  // Prevent brief flash of login screen on page refresh while restoring auth state
  if (!authInitialized && !currentUser) {
    return <div className="min-h-screen bg-white" />
  }

  // Gate the application: Require login / account creation first
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Tier 1: Top Global Header */}
      <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-full flex items-center justify-between">
          {/* Left: DopplerLogo + Mr. William's Practice Site */}
          <div className="flex items-center gap-3">
            <DopplerLogo className="h-6 w-auto" />
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Mr. William’s Practice Site
            </span>
          </div>

          {/* Right: Avatar, Display Name, Stars, Divider, Sign out */}
          <div className="flex items-center gap-4 text-sm font-medium text-slate-800">
            <div className="flex items-center gap-2">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {(currentUser.displayName || 'S')[0].toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                {currentUser.displayName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              <Star className="w-4 h-4 text-slate-600 stroke-[1.5]" />
              <span>{totalMastered} stars</span>
            </div>

            <div className="h-4 w-px bg-slate-300"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              title="Sign out of student account"
              aria-label="Sign out of student account"
            >
              <LogOut className="w-4 h-4 text-slate-700" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tier 2: Secondary Module Navigation Bar */}
      <nav aria-label="Module Navigation" className="h-12 bg-white border-b border-slate-200">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-full flex items-center gap-8">
          <button
            role="tab"
            aria-selected={activeTab === 'balanced'}
            onClick={() => setActiveTab('balanced')}
            className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'balanced'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-900 hover:text-blue-600'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Balanced forces</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'fbd'}
            onClick={() => setActiveTab('fbd')}
            className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'fbd'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-900 hover:text-blue-600'
            }`}
          >
            <Move className="w-4 h-4" />
            <span>Free-body diagrams</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'solveit'}
            onClick={() => setActiveTab('solveit')}
            className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'solveit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-900 hover:text-blue-600'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Solve it! (<span className="font-serif italic font-bold">F</span> = ma)</span>
          </button>
        </div>
      </nav>

      {/* Main Interactive Content */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
        {activeTab === 'balanced' && <BalancedForcesModule currentUser={currentUser} />}
        {activeTab === 'fbd' && <FBDModule currentUser={currentUser} />}
        {activeTab === 'solveit' && <SolveItModule currentUser={currentUser} />}
      </main>
    </div>
  )
}
