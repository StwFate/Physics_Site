import React, { useState, useEffect } from 'react'
import { Atom, Compass, ArrowRightLeft, Calculator, Award, RotateCcw } from 'lucide-react'
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
    if (window.confirm('Reset all earned stars and progress?')) {
      localStorage.removeItem('physix_balanced_completed')
      localStorage.removeItem('physix_fbd_completed')
      localStorage.removeItem('physix_solveit_completed')
      updateStats()
      window.location.reload()
    }
  }

  const totalMastered = stats.balanced + stats.fbd + stats.solveit

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Minimalist Light Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <Atom className="w-5 h-5 text-blue-600" />
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Mr. William's Practice Site
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Newton's Laws
              </span>
            </div>
          </div>

          {/* Minimalist Segmented Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('balanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'balanced'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Balanced Forces</span>
              {stats.balanced > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                  {stats.balanced}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fbd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'fbd'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Free-Body Diagrams</span>
              {stats.fbd > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                  {stats.fbd}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('solveit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'solveit'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Solve It! (F=ma)</span>
              {stats.solveit > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                  {stats.solveit}
                </span>
              )}
            </button>
          </div>

          {/* Quick Stats & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{totalMastered} Stars</span>
            </div>
            <button
              onClick={handleResetAllProgress}
              title="Reset Progress"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Content (Footer removed per user request) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'balanced' && <BalancedForcesModule />}
        {activeTab === 'fbd' && <FBDModule />}
        {activeTab === 'solveit' && <SolveItModule />}
      </main>
    </div>
  )
}
