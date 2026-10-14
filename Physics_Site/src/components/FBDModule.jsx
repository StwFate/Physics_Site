import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Eye } from 'lucide-react'
import confetti from 'canvas-confetti'
import fbdScenarios from '../data/fbdScenarios.json'

const FORCE_TYPES = [
  { code: 0, id: 'None', label: 'None', symbol: '' },
  { code: 1, id: 'Fgrav', label: 'Gravity', symbol: 'F_grav', color: '#dc2626' },
  { code: 2, id: 'Fnorm', label: 'Normal', symbol: 'F_norm', color: '#2563eb' },
  { code: 3, id: 'Ffrict', label: 'Friction', symbol: 'F_frict', color: '#d97706' },
  { code: 4, id: 'Fapp', label: 'Applied', symbol: 'F_app', color: '#16a34a' },
  { code: 5, id: 'Fair', label: 'Air Res.', symbol: 'F_air', color: '#7c3aed' },
  { code: 6, id: 'Fspring', label: 'Spring', symbol: 'F_spring', color: '#db2777' },
  { code: 7, id: 'Ftens', label: 'Tension', symbol: 'F_tens', color: '#ca8a04' },
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

    if (targetH !== magnitudeH && (targetR > 0 || targetL > 0)) {
      const magLabel = targetH === 0 ? 'Equal (Right = Left)' : targetH === 1 ? 'Right > Left' : 'Left > Right'
      issues.push(`Horizontal arrow lengths: Expected ${magLabel}.`)
    }
    if (targetV !== magnitudeV && (targetU > 0 || targetD > 0)) {
      const magLabel = targetV === 0 ? 'Equal (Up = Down)' : targetV === 1 ? 'Up > Down' : 'Down > Up'
      issues.push(`Vertical arrow lengths: Expected ${magLabel}.`)
    }

    setFeedback(issues)

    if (correct) {
      const updated = { ...completedScenarios, [currentScenario.id]: true }
      setCompletedScenarios(updated)
      localStorage.setItem('physix_fbd_completed', JSON.stringify(updated))

      if (Object.keys(updated).length === fbdScenarios.length) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      }
    }
  }

  const getArrowLength = (dir) => {
    const base = 70
    if (dir === 'right') {
      if (magnitudeH === 1) return 100
      if (magnitudeH === 2) return 45
      return base
    }
    if (dir === 'left') {
      if (magnitudeH === 2) return 100
      if (magnitudeH === 1) return 45
      return base
    }
    if (dir === 'up') {
      if (magnitudeV === 1) return 100
      if (magnitudeV === 2) return 45
      return base
    }
    if (dir === 'down') {
      if (magnitudeV === 2) return 100
      if (magnitudeV === 1) return 45
      return base
    }
    return base
  }

  const completedCount = Object.keys(completedScenarios).length

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Free-Body Diagram Constructor
          </h2>
          <p className="text-xs text-slate-500">
            Construct accurate force vectors and compare relative arrow lengths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium font-mono">
            {completedCount} / {fbdScenarios.length} Mastered
          </span>
          <div className="w-28 bg-slate-100 h-2 rounded overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(completedCount / fbdScenarios.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scenario Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {fbdScenarios.map((sc, i) => (
          <button
            key={sc.id}
            onClick={() => setScenarioIndex(i)}
            className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all border ${
              scenarioIndex === i
                ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-sm'
                : completedScenarios[sc.id]
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            #{sc.id}: {sc.objectContext}
          </button>
        ))}
      </div>

      {/* Scenario Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-mono font-bold">
              Scenario {currentScenario.id} of 12
            </span>
            <span className="text-xs font-bold text-slate-900">{currentScenario.title}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">
              Air Resistance: <strong className="text-slate-700">{currentScenario.airResistance}</strong>
            </span>
            <button
              onClick={() => setShowOriginalRef(!showOriginalRef)}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>{showOriginalRef ? 'Hide Ref' : 'Original Ref'}</span>
            </button>
          </div>
        </div>

        <p className="text-slate-800 text-xs sm:text-sm mt-2.5 leading-relaxed font-medium">
          {currentScenario.cleanDescription}
        </p>

        {showOriginalRef && (
          <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-center animate-in fade-in">
            <div className="text-[11px] text-slate-500 mb-2 font-mono">Original Diagram Solution Reference</div>
            <img
              src={`./media/free-body-diagrams/scenario-${currentScenario.id}.png`}
              alt={`Scenario ${currentScenario.id} reference`}
              className="max-h-56 mx-auto rounded border border-slate-200 object-contain"
            />
          </div>
        )}
      </div>

      {/* Construction Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vector Canvas */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center relative min-h-[400px] shadow-sm">
          <div className="text-[11px] font-mono text-slate-400 mb-4">
            Interactive Vector Canvas • Select Forces on Right
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Center Object */}
            <div className="relative z-10 w-20 h-20 bg-slate-900 rounded-md border border-slate-800 shadow-sm flex flex-col items-center justify-center text-center p-1.5">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                {currentScenario.objectContext}
              </span>
            </div>

            {/* Up Vector */}
            {forces.up > 0 && (
              <div
                className="absolute bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-150"
                style={{ height: `${getArrowLength('up')}px`, marginBottom: '40px' }}
              >
                <div className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-white border border-slate-300 text-blue-600 mb-0.5 shadow-sm">
                  {FORCE_TYPES.find(f => f.code === forces.up)?.symbol}
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-blue-600"></div>
                <div className="w-0.5 bg-blue-600 flex-1"></div>
              </div>
            )}

            {/* Down Vector */}
            {forces.down > 0 && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-150"
                style={{ height: `${getArrowLength('down')}px`, marginTop: '40px' }}
              >
                <div className="w-0.5 bg-rose-600 flex-1"></div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-rose-600"></div>
                <div className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-white border border-slate-300 text-rose-600 mt-0.5 shadow-sm">
                  {FORCE_TYPES.find(f => f.code === forces.down)?.symbol}
                </div>
              </div>
            )}

            {/* Left Vector */}
            {forces.left > 0 && (
              <div
                className="absolute right-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-all duration-150"
                style={{ width: `${getArrowLength('left')}px`, marginRight: '40px' }}
              >
                <div className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-white border border-slate-300 text-amber-600 mr-0.5 whitespace-nowrap shadow-sm">
                  {FORCE_TYPES.find(f => f.code === forces.left)?.symbol}
                </div>
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-amber-600"></div>
                <div className="h-0.5 bg-amber-600 flex-1"></div>
              </div>
            )}

            {/* Right Vector */}
            {forces.right > 0 && (
              <div
                className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-all duration-150"
                style={{ width: `${getArrowLength('right')}px`, marginLeft: '40px' }}
              >
                <div className="h-0.5 bg-emerald-600 flex-1"></div>
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-emerald-600"></div>
                <div className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-white border border-slate-300 text-emerald-600 ml-0.5 whitespace-nowrap shadow-sm">
                  {FORCE_TYPES.find(f => f.code === forces.right)?.symbol}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setForces({ right: 0, left: 0, up: 0, down: 0 })
              setIsSubmitted(false)
            }}
            className="mt-3 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Clear Vectors
          </button>
        </div>

        {/* Controls */}
        <div className="lg:col-span-5 space-y-3">
          {/* Select Forces */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5">
            <span className="text-xs font-semibold text-slate-700 block">
              1. Directional Force Assignment
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { dir: 'up', label: 'Upward (↑)' },
                { dir: 'down', label: 'Downward (↓)' },
                { dir: 'left', label: 'Leftward (←)' },
                { dir: 'right', label: 'Rightward (→)' },
              ].map(({ dir, label }) => (
                <div key={dir} className="bg-slate-50 p-2 rounded border border-slate-200">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}</label>
                  <select
                    value={forces[dir]}
                    onChange={(e) => handleForceChange(dir, parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
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

          {/* Magnitude Controls */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5">
            <span className="text-xs font-semibold text-slate-700 block">
              2. Compare Arrow Lengths
            </span>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Horizontal:</span>
              <div className="grid grid-cols-3 gap-1.5">
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
                    className={`py-1 px-1.5 rounded text-xs font-medium border transition-all ${
                      magnitudeH === item.val
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[11px] text-slate-500 block mb-1">Vertical:</span>
              <div className="grid grid-cols-3 gap-1.5">
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
                    className={`py-1 px-1.5 rounded text-xs font-medium border transition-all ${
                      magnitudeV === item.val
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Evaluate Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            {!isSubmitted ? (
              <button
                onClick={checkSolution}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Evaluate Diagram</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                {isCorrect ? (
                  <div className="p-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accurate Diagram! Star Earned ⭐</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {currentScenario.feedback.correct}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <XCircle className="w-4 h-4" />
                      <span>Needs Correction</span>
                    </div>
                    {feedback && feedback.length > 0 && (
                      <ul className="space-y-0.5 list-disc list-inside text-rose-800">
                        {feedback.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-rose-200">
                      <strong>Key Concept:</strong> {currentScenario.misconceptions?.[0]?.explanation || currentScenario.balance?.explanation || 'Consider all forces acting upon the object.'}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Edit
                  </button>
                  {scenarioIndex < fbdScenarios.length - 1 && (
                    <button
                      onClick={() => setScenarioIndex(scenarioIndex + 1)}
                      className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      Next Scenario <ArrowRight className="w-3 h-3" />
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
