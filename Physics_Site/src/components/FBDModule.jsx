import React, { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Eye, Plus, X, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'
import fbdScenarios from '../data/fbdScenarios.json'

const FORCE_TYPES = [
  { code: 1, id: 'Fgrav', label: 'Gravity', symbol: 'F_grav', color: 'text-rose-600 border-rose-300 bg-rose-50' },
  { code: 2, id: 'Fnorm', label: 'Normal', symbol: 'F_norm', color: 'text-blue-600 border-blue-300 bg-blue-50' },
  { code: 3, id: 'Ffrict', label: 'Friction', symbol: 'F_frict', color: 'text-amber-600 border-amber-300 bg-amber-50' },
  { code: 4, id: 'Fapp', label: 'Applied', symbol: 'F_app', color: 'text-emerald-600 border-emerald-300 bg-emerald-50' },
  { code: 5, id: 'Fair', label: 'Air Resistance', symbol: 'F_air', color: 'text-purple-600 border-purple-300 bg-purple-50' },
  { code: 7, id: 'Ftens', label: 'Tension', symbol: 'F_tens', color: 'text-yellow-700 border-yellow-300 bg-yellow-50' },
  { code: 6, id: 'Fspring', label: 'Spring', symbol: 'F_spring', color: 'text-pink-600 border-pink-300 bg-pink-50' },
]

export default function FBDModule() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [forces, setForces] = useState({ right: 0, left: 0, up: 0, down: 0 })
  const [strengths, setStrengths] = useState({ right: 'normal', left: 'normal', up: 'normal', down: 'normal' })
  const [activePopover, setActivePopover] = useState(null) // 'up' | 'down' | 'left' | 'right' | null
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

  const popoverRef = useRef(null)
  const currentScenario = fbdScenarios[scenarioIndex]

  // Reset when changing scenario
  useEffect(() => {
    setForces({ right: 0, left: 0, up: 0, down: 0 })
    setStrengths({ right: 'normal', left: 'normal', up: 'normal', down: 'normal' })
    setActivePopover(null)
    setIsSubmitted(false)
    setIsCorrect(false)
    setFeedback(null)
    setShowOriginalRef(false)
  }, [scenarioIndex])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActivePopover(null)
      }
    }
    if (activePopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activePopover])

  const handleSelectForce = (dir, code) => {
    setForces((prev) => ({ ...prev, [dir]: code }))
    setStrengths((prev) => ({ ...prev, [dir]: 'normal' }))
    setActivePopover(null)
    setIsSubmitted(false)
  }

  const handleRemoveForce = (dir) => {
    setForces((prev) => ({ ...prev, [dir]: 0 }))
    setStrengths((prev) => ({ ...prev, [dir]: 'normal' }))
    setIsSubmitted(false)
  }

  const handleToggleStrength = (dir) => {
    setStrengths((prev) => ({
      ...prev,
      [dir]: prev[dir] === 'normal' ? 'strong' : 'normal',
    }))
    setIsSubmitted(false)
  }

  // Automatic derivation of horizontal (H) and vertical (V) magnitude codes
  const computeMagnitudeCodes = () => {
    // Horizontal (H): 0 = Equal, 1 = Right > Left, 2 = Left > Right
    let H = 0
    if (forces.right > 0 && forces.left > 0) {
      if (strengths.right === 'strong' && strengths.left !== 'strong') H = 1
      else if (strengths.left === 'strong' && strengths.right !== 'strong') H = 2
      else H = 0
    } else if (forces.right > 0) {
      H = 1
    } else if (forces.left > 0) {
      H = 2
    } else {
      H = 0
    }

    // Vertical (V): 0 = Equal, 1 = Up > Down, 2 = Down > Up
    let V = 0
    if (forces.up > 0 && forces.down > 0) {
      if (strengths.up === 'strong' && strengths.down !== 'strong') V = 1
      else if (strengths.down === 'strong' && strengths.up !== 'strong') V = 2
      else V = 0
    } else if (forces.up > 0) {
      V = 1
    } else if (forces.down > 0) {
      V = 2
    } else {
      V = 0
    }

    return { H, V }
  }

  const checkSolution = () => {
    const { H, V } = computeMagnitudeCodes()
    const studentCode = `${forces.right}${forces.left}${forces.up}${forces.down}${H}${V}`
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
      const exp = FORCE_TYPES.find((f) => f.code === targetR)?.label || 'None'
      issues.push(`Right side: Expected ${exp}.`)
    }
    if (forces.left !== targetL) {
      const exp = FORCE_TYPES.find((f) => f.code === targetL)?.label || 'None'
      issues.push(`Left side: Expected ${exp}.`)
    }
    if (forces.up !== targetU) {
      const exp = FORCE_TYPES.find((f) => f.code === targetU)?.label || 'None'
      issues.push(`Top side: Expected ${exp}.`)
    }
    if (forces.down !== targetD) {
      const exp = FORCE_TYPES.find((f) => f.code === targetD)?.label || 'None'
      issues.push(`Bottom side: Expected ${exp}.`)
    }

    if (targetH !== H && (targetR > 0 || targetL > 0)) {
      const expStr =
        targetH === 0
          ? 'Equal (Normal vs Normal)'
          : targetH === 1
          ? 'Rightward force should be Strong (longer than left)'
          : 'Leftward force should be Strong (longer than right)'
      issues.push(`Horizontal arrow lengths: ${expStr}.`)
    }
    if (targetV !== V && (targetU > 0 || targetD > 0)) {
      const expStr =
        targetV === 0
          ? 'Equal (Normal vs Normal)'
          : targetV === 1
          ? 'Upward force should be Strong (longer than down)'
          : 'Downward force should be Strong (longer than up)'
      issues.push(`Vertical arrow lengths: ${expStr}.`)
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

  const getArrowPixelLength = (dir) => {
    return strengths[dir] === 'strong' ? 110 : 70
  }

  const { H, V } = computeMagnitudeCodes()
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
            Click the <strong className="text-blue-600 font-bold">+</strong> on each side of the box to add forces, then toggle <strong className="text-slate-800">Normal</strong> or <strong className="text-slate-800">Strong</strong>.
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

      {/* Scenario Description Card */}
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
            <div className="text-[11px] text-slate-500 mb-2 font-mono">Original Solution Reference</div>
            <img
              src={`./media/free-body-diagrams/scenario-${currentScenario.id}.png`}
              alt={`Scenario ${currentScenario.id} reference`}
              className="max-h-56 mx-auto rounded border border-slate-200 object-contain"
            />
          </div>
        )}
      </div>

      {/* Interactive FBD Canvas & Dynamic Status Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Direct-Manipulation Vector Canvas */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[460px] shadow-sm select-none">
          <div className="text-[11px] font-mono text-slate-400 mb-8 text-center">
            Click the <strong className="text-blue-600 font-bold">+</strong> button on any side to add a force arrow. Click the force tag to toggle <strong className="text-slate-700">Normal / Strong</strong>.
          </div>

          {/* Central Workspace Container */}
          <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Center Box */}
            <div className="relative z-10 w-24 h-24 bg-slate-900 rounded-lg border border-slate-800 shadow-md flex flex-col items-center justify-center text-center p-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {currentScenario.objectContext}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">Object</span>

              {/* Edge '+' Button: Top (Upward) */}
              {forces.up === 0 && (
                <button
                  onClick={() => setActivePopover(activePopover === 'up' ? null : 'up')}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110 active:scale-95"
                  title="Add upward force"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* Edge '+' Button: Bottom (Downward) */}
              {forces.down === 0 && (
                <button
                  onClick={() => setActivePopover(activePopover === 'down' ? null : 'down')}
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110 active:scale-95"
                  title="Add downward force"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* Edge '+' Button: Left (Leftward) */}
              {forces.left === 0 && (
                <button
                  onClick={() => setActivePopover(activePopover === 'left' ? null : 'left')}
                  className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110 active:scale-95"
                  title="Add leftward force"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* Edge '+' Button: Right (Rightward) */}
              {forces.right === 0 && (
                <button
                  onClick={() => setActivePopover(activePopover === 'right' ? null : 'right')}
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110 active:scale-95"
                  title="Add rightward force"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* UPWARD VECTOR */}
            {forces.up > 0 && (
              <div
                className="absolute bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto transition-all duration-200"
                style={{ height: `${getArrowPixelLength('up')}px`, marginBottom: '48px' }}
              >
                {/* Vector Tag & Controls */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white shadow-sm text-xs font-mono mb-1">
                  <span className="font-bold text-blue-600">
                    {FORCE_TYPES.find((f) => f.code === forces.up)?.symbol}
                  </span>
                  <button
                    onClick={() => handleToggleStrength('up')}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border transition-colors ${
                      strengths.up === 'strong'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Click to toggle Normal vs Strong"
                  >
                    {strengths.up === 'strong' ? 'Strong' : 'Normal'}
                  </button>
                  <button
                    onClick={() => handleRemoveForce('up')}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                    title="Remove force"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {/* Arrowhead */}
                <div
                  onClick={() => handleToggleStrength('up')}
                  className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-blue-600 cursor-pointer hover:border-b-blue-700 transition-colors"
                  title="Click to toggle length"
                ></div>
                {/* Stem */}
                <div
                  onClick={() => handleToggleStrength('up')}
                  className="w-1 bg-blue-600 flex-1 cursor-pointer hover:bg-blue-700 transition-colors"
                  title="Click to toggle length"
                ></div>
              </div>
            )}

            {/* DOWNWARD VECTOR */}
            {forces.down > 0 && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto transition-all duration-200"
                style={{ height: `${getArrowPixelLength('down')}px`, marginTop: '48px' }}
              >
                {/* Stem */}
                <div
                  onClick={() => handleToggleStrength('down')}
                  className="w-1 bg-rose-600 flex-1 cursor-pointer hover:bg-rose-700 transition-colors"
                  title="Click to toggle length"
                ></div>
                {/* Arrowhead */}
                <div
                  onClick={() => handleToggleStrength('down')}
                  className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-600 cursor-pointer hover:border-t-rose-700 transition-colors"
                  title="Click to toggle length"
                ></div>
                {/* Vector Tag & Controls */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white shadow-sm text-xs font-mono mt-1">
                  <span className="font-bold text-rose-600">
                    {FORCE_TYPES.find((f) => f.code === forces.down)?.symbol}
                  </span>
                  <button
                    onClick={() => handleToggleStrength('down')}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border transition-colors ${
                      strengths.down === 'strong'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Click to toggle Normal vs Strong"
                  >
                    {strengths.down === 'strong' ? 'Strong' : 'Normal'}
                  </button>
                  <button
                    onClick={() => handleRemoveForce('down')}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                    title="Remove force"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* LEFTWARD VECTOR */}
            {forces.left > 0 && (
              <div
                className="absolute right-1/2 top-1/2 -translate-y-1/2 flex items-center justify-end pointer-events-auto transition-all duration-200"
                style={{ marginRight: '48px' }}
              >
                {/* Vector Tag & Controls */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white shadow-sm text-xs font-mono mr-2 whitespace-nowrap">
                  <button
                    onClick={() => handleRemoveForce('left')}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                    title="Remove force"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleToggleStrength('left')}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border transition-colors ${
                      strengths.left === 'strong'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Click to toggle Normal vs Strong"
                  >
                    {strengths.left === 'strong' ? 'Strong' : 'Normal'}
                  </button>
                  <span className="font-bold text-amber-600">
                    {FORCE_TYPES.find((f) => f.code === forces.left)?.symbol}
                  </span>
                </div>
                {/* Arrowhead */}
                <div
                  onClick={() => handleToggleStrength('left')}
                  className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[10px] border-r-amber-600 cursor-pointer hover:border-r-amber-700 transition-colors shrink-0"
                  title="Click to toggle length"
                ></div>
                {/* Stem */}
                <div
                  onClick={() => handleToggleStrength('left')}
                  className="h-1 bg-amber-600 cursor-pointer hover:bg-amber-700 transition-all duration-200"
                  style={{ width: `${strengths.left === 'strong' ? 100 : 60}px` }}
                  title="Click to toggle length"
                ></div>
              </div>
            )}

            {/* RIGHTWARD VECTOR */}
            {forces.right > 0 && (
              <div
                className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto transition-all duration-200"
                style={{ marginLeft: '48px' }}
              >
                {/* Stem */}
                <div
                  onClick={() => handleToggleStrength('right')}
                  className="h-1 bg-emerald-600 cursor-pointer hover:bg-emerald-700 transition-all duration-200"
                  style={{ width: `${strengths.right === 'strong' ? 100 : 60}px` }}
                  title="Click to toggle length"
                ></div>
                {/* Arrowhead */}
                <div
                  onClick={() => handleToggleStrength('right')}
                  className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-emerald-600 cursor-pointer hover:border-l-emerald-700 transition-colors shrink-0"
                  title="Click to toggle length"
                ></div>
                {/* Vector Tag & Controls */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white shadow-sm text-xs font-mono ml-2 whitespace-nowrap">
                  <span className="font-bold text-emerald-600">
                    {FORCE_TYPES.find((f) => f.code === forces.right)?.symbol}
                  </span>
                  <button
                    onClick={() => handleToggleStrength('right')}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border transition-colors ${
                      strengths.right === 'strong'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Click to toggle Normal vs Strong"
                  >
                    {strengths.right === 'strong' ? 'Strong' : 'Normal'}
                  </button>
                  <button
                    onClick={() => handleRemoveForce('right')}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                    title="Remove force"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* FLOATING FORCE PICKER POPOVER */}
            {activePopover && (
              <div
                ref={popoverRef}
                className={`absolute z-30 bg-white border border-slate-300 rounded-lg p-2.5 shadow-xl w-52 animate-in fade-in zoom-in-95 duration-100 ${
                  activePopover === 'up'
                    ? 'bottom-full mb-6 left-1/2 -translate-x-1/2'
                    : activePopover === 'down'
                    ? 'top-full mt-6 left-1/2 -translate-x-1/2'
                    : activePopover === 'left'
                    ? 'right-full mr-6 top-1/2 -translate-y-1/2'
                    : 'left-full ml-6 top-1/2 -translate-y-1/2'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-600">
                  <span>Add {activePopover.toUpperCase()} Force</span>
                  <button
                    onClick={() => setActivePopover(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {FORCE_TYPES.map((f) => (
                    <button
                      key={f.code}
                      onClick={() => handleSelectForce(activePopover, f.code)}
                      className="w-full px-2 py-1.5 rounded text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
                    >
                      <span>{f.label}</span>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                        {f.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset All Forces Link */}
          <button
            onClick={() => {
              setForces({ right: 0, left: 0, up: 0, down: 0 })
              setStrengths({ right: 'normal', left: 'normal', up: 'normal', down: 'normal' })
              setIsSubmitted(false)
            }}
            className="mt-6 text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
          >
            Clear All Vectors
          </button>
        </div>

        {/* Right Column: Live Balance Insight & Evaluation */}
        <div className="lg:col-span-4 space-y-3">
          {/* Active Forces & Balance Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Diagram State & Net Force
            </span>

            {/* Live Vector Badges */}
            <div className="space-y-2">
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[11px] font-medium mb-1">Horizontal State:</span>
                {forces.left === 0 && forces.right === 0 ? (
                  <span className="text-slate-500 italic">No horizontal forces</span>
                ) : (
                  <div className="flex items-center justify-between font-mono font-semibold">
                    <span>
                      {forces.left > 0 ? `${FORCE_TYPES.find((f) => f.code === forces.left)?.symbol} (${strengths.left})` : 'None'}{' '}
                      vs{' '}
                      {forces.right > 0 ? `${FORCE_TYPES.find((f) => f.code === forces.right)?.symbol} (${strengths.right})` : 'None'}
                    </span>
                    <span className={H === 0 ? 'text-emerald-700' : 'text-blue-700'}>
                      {H === 0 ? 'Balanced' : H === 1 ? 'Right > Left' : 'Left > Right'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[11px] font-medium mb-1">Vertical State:</span>
                {forces.up === 0 && forces.down === 0 ? (
                  <span className="text-slate-500 italic">No vertical forces</span>
                ) : (
                  <div className="flex items-center justify-between font-mono font-semibold">
                    <span>
                      {forces.up > 0 ? `${FORCE_TYPES.find((f) => f.code === forces.up)?.symbol} (${strengths.up})` : 'None'}{' '}
                      vs{' '}
                      {forces.down > 0 ? `${FORCE_TYPES.find((f) => f.code === forces.down)?.symbol} (${strengths.down})` : 'None'}
                    </span>
                    <span className={V === 0 ? 'text-emerald-700' : 'text-blue-700'}>
                      {V === 0 ? 'Balanced' : V === 1 ? 'Up > Down' : 'Down > Up'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Check Button */}
            <button
              onClick={checkSolution}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Evaluate Diagram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Evaluation Results Card */}
          {isSubmitted && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 animate-in fade-in">
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
                    <span>Needs Adjustment</span>
                  </div>
                  {feedback && feedback.length > 0 && (
                    <ul className="space-y-0.5 list-disc list-inside text-rose-800">
                      {feedback.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-rose-200">
                    <strong>Key Concept:</strong>{' '}
                    {currentScenario.misconceptions?.[0]?.explanation ||
                      currentScenario.balance?.explanation ||
                      'Consider all forces acting upon the object.'}
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
  )
}
