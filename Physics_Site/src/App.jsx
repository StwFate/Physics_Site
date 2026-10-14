import React, { useState, useEffect } from 'react'
import { Atom, Compass, ArrowRightLeft, Calculator, Sparkles, Award, RotateCcw, Zap, ExternalLink, CheckCircle } from 'lucide-react'
import BalancedForcesModule from './components/BalancedForcesModule'
import FBDModule from './components/FBDModule'
import SolveItModule from './components/SolveItModule'

export default function App() {
  const [activeTab, setActiveTab] = useState('balanced')
  const [stats, setStats] = useState({ balanced: 0, fbd: 0, solveit: 0 })

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
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleResetAllProgress = () => {
    if (window.confirm('Are you sure you want to reset all earned stars and progress?')) {
      localStorage.removeItem('physix_balanced_completed')
      localStorage.removeItem('physix_fbd_completed')
      localStorage.removeItem('physix_solveit_completed')
      updateStats()
      window.location.reload()
    }
  }

  const totalMastered = stats.balanced + stats.fbd + stats.solveit

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/90 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <Atom className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                  PhysixLab
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AD-FREE • 60 FPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Newton's Laws Interactive Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('balanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'balanced'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">1. Balanced Forces</span>
              <span className="md:hidden">Balanced</span>
              {stats.balanced > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-900 text-cyan-300 rounded text-[10px] font-mono">
                  {stats.balanced}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fbd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'fbd'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden md:inline">2. Free-Body Diagrams</span>
              <span className="md:hidden">FBD</span>
              {stats.fbd > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-900 text-cyan-300 rounded text-[10px] font-mono">
                  {stats.fbd}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('solveit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'solveit'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden md:inline">3. Solve It! (F=ma)</span>
              <span className="md:hidden">Solve It</span>
              {stats.solveit > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-900 text-cyan-300 rounded text-[10px] font-mono">
                  {stats.solveit}
                </span>
              )}
            </button>
          </div>

          {/* Quick Stats & Reset */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>{totalMastered} Stars Earned</span>
            </div>
            <button
              onClick={handleResetAllProgress}
              title="Reset All Progress"
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'balanced' && <BalancedForcesModule />}
        {activeTab === 'fbd' && <FBDModule />}
        {activeTab === 'solveit' && <SolveItModule />}
      </main>

      {/* Modern High-Performance Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">PhysixLab</span>
            <span>•</span>
            <span>Ad-free, zero-lag replacement for Physics Classroom interactives</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 100% Curricular Fidelity
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Real-time 60 FPS Physics
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
