import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, Eye, Sparkles, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import confetti from 'canvas-confetti'
import fbdScenarios from '../data/fbdScenarios.json'

const FORCE_TYPES = [
  { code: 0, id: 'None', label: 'None', symbol: '' },
  { code: 1, id: 'Fgrav', label: 'Gravity', symbol: 'F_grav', color: '#f87171' },
  { code: 2, id: 'Fnorm', label: 'Normal', symbol: 'F_norm', color: '#38bdf8' },
  { code: 3, id: 'Ffrict', label: 'Friction', symbol: 'F_frict', color: '#fb923c' },
  { code: 4, id: 'Fapp', label: 'Applied', symbol: 'F_app', color: '#4ade80' },
  { code: 5, id: 'Fair', label: 'Air Res.', symbol: 'F_air', color: '#a78bfa' },
  { code: 6, id: 'Fspring', label: 'Spring', symbol: 'F_spring', color: '#f472b6' },
  { code: 7, id: 'Ftens', label: 'Tension', symbol: 'F_tens', color: '#facc15' },
]

export default function FBDModule() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [forces, setForces] = useState({
    right: 0,
    left: 0,
    up: 0,
    down: 0,
  })
  const [magnitudeH, setMagnitudeH] = useState(0) // 0: Right=Left, 1: Right>Left, 2: Left>Right
  const [magnitudeV, setMagnitudeV] = useState(0) // 0: Up=Down, 1: Up>Down, 2: Down>Up
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showOriginalRef, setShowOriginalRef] = useState(false)
  const [completedScenarios, setCompletedScenarios] = useState(() => {
    try {
      const saved = localStorage.getItem('physix_fbd_completed')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const currentScenario = fbdScenarios[scenarioIndex]

  // Reset inputs when switching scenario
  useEffect(() => {
    setForces({ right: 0, left: 0, up: 0, down: 0 })
    setMagnitudeH(0)
    setMagnitudeV(0)
    setIsSubmitted(false)
    setIsCorrect(false)
    setFeedback(null)
    setShowOriginalRef(false)
  }, [scenarioIndex])

  const handleForceChange = (dir, code) => {
    setForces((prev) => ({ ...prev, [dir]: code }))
    setIsSubmitted(false)
  }

  const checkSolution = () => {
    const studentCode = `${forces.right}${forces.left}${forces.up}${forces.down}${magnitudeH}${magnitudeV}`
    const targetCode = currentScenario.answerCode

    const correct = studentCode === targetCode
    setIsCorrect(correct)
    setIsSubmitted(true)

    // Build smart feedback breakdown
    const issues = []
    const targetR = parseInt(targetCode[0])
    const targetL = parseInt(targetCode[1])
    const targetU = parseInt(targetCode[2])
    const targetD = parseInt(targetCode[3])
    const targetH = parseInt(targetCode[4])
    const targetV = parseInt(targetCode[5])

    if (forces.right !== targetR) {
      const expected = FORCE_TYPES.find(f => f.code === targetR)?.label || 'None'
      issues.push(`Rightward force: Expected ${expected}.`)
    }
    if (forces.left !== targetL) {
      const expected = FORCE_TYPES.find(f => f.code === targetL)?.label || 'None'
      issues.push(`Leftward force: Expected ${expected}.`)
    }
    if (forces.up !== targetU) {
      const expected = FORCE_TYPES.find(f => f.code === targetU)?.label || 'None'
      issues.push(`Upward force: Expected ${expected}.`)
    }
    if (forces.down !== targetD) {
      const expected = FORCE_TYPES.find(f => f.code === targetD)?.label || 'None'
      issues.push(`Downward force: Expected ${expected}.`)
    }

    // Check magnitudes only if relevant forces are active
    if (targetH !== magnitudeH && (targetR > 0 || targetL > 0)) {
      const magLabel = targetH === 0 ? 'Equal (Right = Left)' : targetH === 1 ? 'Right > Left (accelerating right)' : 'Left > Right (accelerating left)'
      issues.push(`Horizontal arrow lengths should be: ${magLabel}.`)
    }
    if (targetV !== magnitudeV && (targetU > 0 || targetD > 0)) {
      const magLabel = targetV === 0 ? 'Equal (Up = Down)' : targetV === 1 ? 'Up > Down (accelerating up)' : 'Down > Up (accelerating down)'
      issues.push(`Vertical arrow lengths should be: ${magLabel}.`)
    }

    setFeedback(issues)

    if (correct) {
      const updated = { ...completedScenarios, [currentScenario.id]: true }
      setCompletedScenarios(updated)
      localStorage.setItem('physix_fbd_completed', JSON.stringify(updated))

      if (Object.keys(updated).length === fbdScenarios.length) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
      }
    }
  }

  // Calculate arrow pixel lengths based on magnitudes
  const getArrowLength = (dir) => {
    const base = 75
    if (dir === 'right') {
      if (magnitudeH === 1) return 105
      if (magnitudeH === 2) return 50
      return base
    }
    if (dir === 'left') {
      if (magnitudeH === 2) return 105
      if (magnitudeH === 1) return 50
      return base
    }
    if (dir === 'up') {
      if (magnitudeV === 1) return 105
      if (magnitudeV === 2) return 50
      return base
    }
    if (dir === 'down') {
      if (magnitudeV === 2) return 105
      if (magnitudeV === 1) return 50
      return base
    }
    return base
  }

  const completedCount = Object.keys(completedScenarios).length

  return (
    <div className="space-y-6">
      {/* Header & Scenario Carousel Indicator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Free-Body Diagram Interactive
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              12 Scenarios
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the active force vectors and compare arrow lengths to represent the object's net force.
          </p>
        </div>

        {/* Completed Count & Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Mastery Progress</div>
            <div className="text-sm font-bold text-white font-mono">
              {completedCount} / {fbdScenarios.length} Diagrams Mastered
            </div>
          </div>
          <div className="w-24 sm:w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${(completedCount / fbdScenarios.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scenario Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {fbdScenarios.map((sc, i) => (
          <button
            key={sc.id}
            onClick={() => setScenarioIndex(i)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              scenarioIndex === i
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : completedScenarios[sc.id]
                ? 'bg-slate-800/80 border border-emerald-500/40 text-emerald-300 hover:bg-slate-700/80'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {completedScenarios[sc.id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>#{sc.id}: {sc.objectContext}</span>
          </button>
        ))}
      </div>

      {/* Scenario Problem Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md text-xs font-mono font-bold">
              Scenario {currentScenario.id} of 12
            </span>
            <span className="text-sm font-bold text-white">{currentScenario.title}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Air Resistance: <strong className={currentScenario.airResistance === 'Consider' ? 'text-amber-400' : 'text-slate-400'}>{currentScenario.airResistance}</strong>
            </span>
            <button
              onClick={() => setShowOriginalRef(!showOriginalRef)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showOriginalRef ? 'Hide Reference' : 'Original Diagram'}</span>
            </button>
          </div>
        </div>

        <p className="text-slate-200 text-sm sm:text-base mt-3 leading-relaxed font-medium">
          {currentScenario.cleanDescription}
        </p>

        {showOriginalRef && (
          <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center animate-in fade-in">
            <div className="text-xs text-slate-400 mb-2 font-mono">Original Reference Solution Snapshot</div>
            <img
              src={`./media/free-body-diagrams/scenario-${currentScenario.id}.png`}
              alt={`Scenario ${currentScenario.id} reference`}
              className="max-h-64 mx-auto rounded border border-slate-800 object-contain"
            />
          </div>
        )}
      </div>

      {/* Interactive FBD Construction Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vector Canvas with Dynamic SVG */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[440px]">
          <div className="absolute top-3 left-4 text-xs font-mono text-slate-500">
            Interactive Vector Canvas • Click Force Selectors to Build
          </div>

          {/* SVG Canvas */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Center Object */}
            <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-2xl border-2 border-cyan-300/40 shadow-xl shadow-cyan-500/20 flex flex-col items-center justify-center text-center p-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {currentScenario.objectContext}
              </span>
              <span className="text-[10px] text-cyan-200 font-mono mt-0.5">FBD Node</span>
            </div>

            {/* Upward Vector */}
            {forces.up > 0 && (
              <div
                className="absolute bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-200"
                style={{ height: `${getArrowLength('up')}px`, marginBottom: '48px' }}
              >
                <div className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-cyan-400 mb-1">
                  {FORCE_TYPES.find(f => f.code === forces.up)?.symbol}
                </div>
                {/* Arrowhead Up */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-cyan-400"></div>
                {/* Arrow Stem */}
                <div className="w-1 bg-cyan-400 flex-1"></div>
              </div>
            )}

            {/* Downward Vector */}
            {forces.down > 0 && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-200"
                style={{ height: `${getArrowLength('down')}px`, marginTop: '48px' }}
              >
                {/* Arrow Stem */}
                <div className="w-1 bg-rose-400 flex-1"></div>
                {/* Arrowhead Down */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400"></div>
                <div className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-rose-400 mt-1">
                  {FORCE_TYPES.find(f => f.code === forces.down)?.symbol}
                </div>
              </div>
            )}

            {/* Leftward Vector */}
            {forces.left > 0 && (
              <div
                className="absolute right-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-all duration-200"
                style={{ width: `${getArrowLength('left')}px`, marginRight: '48px' }}
              >
                <div className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-amber-400 mr-1 whitespace-nowrap">
                  {FORCE_TYPES.find(f => f.code === forces.left)?.symbol}
                </div>
                {/* Arrowhead Left */}
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[10px] border-r-amber-400"></div>
                {/* Arrow Stem */}
                <div className="h-1 bg-amber-400 flex-1"></div>
              </div>
            )}

            {/* Rightward Vector */}
            {forces.right > 0 && (
              <div
                className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-all duration-200"
                style={{ width: `${getArrowLength('right')}px`, marginLeft: '48px' }}
              >
                {/* Arrow Stem */}
                <div className="h-1 bg-emerald-400 flex-1"></div>
                {/* Arrowhead Right */}
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-emerald-400"></div>
                <div className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-emerald-400 ml-1 whitespace-nowrap">
                  {FORCE_TYPES.find(f => f.code === forces.right)?.symbol}
                </div>
              </div>
            )}
          </div>

          {/* Quick Clear Button */}
          <button
            onClick={() => {
              setForces({ right: 0, left: 0, up: 0, down: 0 })
              setIsSubmitted(false)
            }}
            className="mt-2 text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
          >
            Clear All Vectors
          </button>
        </div>

        {/* Right: Force Selector Controls & Magnitude Sizing */}
        <div className="lg:col-span-5 space-y-4">
          {/* Force Pickers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Assign Forces in Each Direction
            </h3>

            {/* Up / Down / Left / Right Selectors */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { dir: 'up', label: 'Upward Force (↑)' },
                { dir: 'down', label: 'Downward Force (↓)' },
                { dir: 'left', label: 'Leftward Force (←)' },
                { dir: 'right', label: 'Rightward Force (→)' },
              ].map(({ dir, label }) => (
                <div key={dir} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">{label}</label>
                  <select
                    value={forces[dir]}
                    onChange={(e) => handleForceChange(dir, parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {FORCE_TYPES.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.label} {f.symbol ? `(${f.symbol})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Relative Magnitude Selectors */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              2. Compare Arrow Magnitudes
            </h3>

            {/* Horizontal Sizing */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Horizontal Arrow Lengths:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 0, label: 'Equal (L = R)' },
                  { val: 1, label: 'Right > Left' },
                  { val: 2, label: 'Left > Right' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setMagnitudeH(item.val)
                      setIsSubmitted(false)
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      magnitudeH === item.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Sizing */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Vertical Arrow Lengths:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 0, label: 'Equal (U = D)' },
                  { val: 1, label: 'Up > Down' },
                  { val: 2, label: 'Down > Up' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setMagnitudeV(item.val)
                      setIsSubmitted(false)
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      magnitudeV === item.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submission & Feedback Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            {!isSubmitted ? (
              <button
                onClick={checkSolution}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Evaluate Diagram</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                {isCorrect ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Perfect Free-Body Diagram! ⭐</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentScenario.feedback.correct}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <XCircle className="w-5 h-5" />
                      <span>Diagram Needs Adjustment</span>
                    </div>
                    {feedback && feedback.length > 0 && (
                      <ul className="text-xs space-y-1 list-disc list-inside text-rose-200">
                        {feedback.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-rose-500/20">
                      <strong>Key Concept:</strong> {currentScenario.misconceptions?.[0]?.explanation || currentScenario.balance?.explanation || 'Consider all contact and non-contact forces acting upon the object.'}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Edit Diagram
                  </button>
                  {scenarioIndex < fbdScenarios.length - 1 && (
                    <button
                      onClick={() => setScenarioIndex(scenarioIndex + 1)}
                      className="flex-1 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      Next Scenario <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
