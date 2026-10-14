import React, { useState } from 'react'
import { Atom, Compass, ArrowRightLeft, Calculator, Sparkles, CheckCircle2 } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('balanced')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PhysixLab
              </h1>
              <p className="text-xs text-slate-400 font-medium">Newtonian Mechanics Mastery</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('balanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'balanced'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Balanced Forces</span>
            </button>
            <button
              onClick={() => setActiveTab('fbd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'fbd'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Free-Body Diagrams</span>
            </button>
            <button
              onClick={() => setActiveTab('second-law')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'second-law'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Solve It! (F=ma)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Fast, Ad-Free Physics Interactives
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Newton's Laws Concept & Problem Suite
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Select one of the three interactive modules above to practice balanced vs. unbalanced forces, construct dynamic free-body diagrams, and solve Newton's second law problems with instant visual simulation.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        PhysixLab • Built for Physics Extra Credit • Zero ads, instant 60 FPS physics
      </footer>
    </div>
  )
}
