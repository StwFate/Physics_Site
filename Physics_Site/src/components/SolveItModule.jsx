import React, { useState, useEffect } from 'react'
import { Calculator, CheckCircle2, XCircle, HelpCircle, RotateCcw, Shuffle, Sparkles, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'
import confetti from 'canvas-confetti'
import solveItData from '../data/solveItProblems.json'

// Generates randomized problem parameters with authentic physics ranges
function generateProblemInstance(problemId) {
  const g = 9.8
  const rA = Math.random()
  const rB = Math.random()
  const rC = Math.random()

  let p = {
    id: problemId,
    given: {},
    target: {},
    text: '',
    level: 'Apprentice',
  }

  if (problemId === 1) {
    p.level = 'Apprentice'
    const mass = Math.round((5 + 10 * rA) * 10) / 10
    const muVal = 0.7 + 0.2 * rB
    const Ffrict = Math.round(mass * g * muVal * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Fnet = Ffrict
    const acceln = Math.round((Fnet / mass) * 100) / 100

    p.text = `A frictional force of ${Ffrict} N acts upon a ${mass}-kg rightward-moving box to accelerate it leftward. Complete the diagram and calculate the missing quantities.`
    p.given = { mass, Ffrict }
    p.target = { Fnorm, Fgrav, Ffrict, mass, acceln, Fnet }
  } else if (problemId === 2) {
    p.level = 'Apprentice'
    const mass = Math.round((12 + 20 * rA) * 10) / 10
    const acceln = Math.round((5 + 3 * rB) * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Ffrict = Fnet
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav

    p.text = `A frictional force acts upon a ${mass}-kg rightward-moving box to accelerate it leftward at ${acceln} m/s². Complete the diagram and calculate the missing quantities.`
    p.given = { mass, acceln }
    p.target = { Fnorm, Fgrav, Ffrict, mass, acceln, Fnet }
  } else if (problemId === 3) {
    p.level = 'Master'
    const mass = Math.round((3 + 4 * rA) * 10) / 10
    const Fapp = Math.round(80 + 20 * rB)
    const muVal = 0.5 + 0.4 * rC
    const Ffrict = Math.round(mass * g * muVal * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Fnet = Math.round((Fapp - Ffrict) * 10) / 10
    const acceln = Math.round((Fnet / mass) * 100) / 100

    p.text = `A rightward force of ${Fapp} N is applied to a ${mass}-kg object to accelerate it to the right. The friction force between the object and the surface is ${Ffrict} N. Complete the diagram.`
    p.given = { mass, Fapp, Ffrict }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mass, acceln, Fnet }
  } else if (problemId === 4) {
    p.level = 'Master'
    const mass = Math.round((12 + 5 * rA) * 10) / 10
    const Fapp = Math.round(350 + 200 * rB)
    const acceln = Math.round((12 + 3 * rC) * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Ffrict = Math.round((Fapp - Fnet) * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav

    p.text = `A rightward force of ${Fapp} N is applied to a ${mass}-kg object to accelerate it to the right at ${acceln} m/s². Complete the diagram and find the friction force.`
    p.given = { mass, Fapp, acceln }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mass, acceln, Fnet }
  } else if (problemId === 5) {
    p.level = 'Master'
    const mass = Math.round((6 + 2 * rA) * 10) / 10
    const acceln = Math.round((12 + 8 * rB) * 10) / 10
    const muVal = 0.4 + 0.2 * rC
    const Ffrict = Math.round(mass * g * muVal * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Fapp = Math.round((Ffrict + Fnet) * 10) / 10

    p.text = `A rightward force is applied to a ${mass}-kg object to accelerate it to the right at ${acceln} m/s². The friction force between the object and surface is ${Ffrict} N. Determine the applied force.`
    p.given = { mass, acceln, Ffrict }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mass, acceln, Fnet }
  } else if (problemId === 6) {
    p.level = 'Wizard'
    const mass = Math.round((6 + 2 * rA) * 10) / 10
    const acceln = Math.round((12 + 8 * rB) * 10) / 10
    const mu = Math.round((0.4 + 0.2 * rC) * 1000) / 1000
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Ffrict = Math.round(mu * Fnorm * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Fapp = Math.round((Fnet + Ffrict) * 10) / 10

    p.text = `A rightward force is applied to a ${mass}-kg object to accelerate it to the right at ${acceln} m/s². The coefficient of friction (µ) is ${mu}. Complete the diagram.`
    p.given = { mass, acceln, mu }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mu, mass, acceln, Fnet }
  } else if (problemId === 7) {
    p.level = 'Wizard'
    const mass = Math.round((18 + 12 * rA) * 10) / 10
    const Fapp = Math.round(280 + 80 * rB)
    const mu = Math.round((0.4 + 0.2 * rC) * 1000) / 1000
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Ffrict = Math.round(mu * Fnorm * 10) / 10
    const Fnet = Math.round((Fapp - Ffrict) * 10) / 10
    const acceln = Math.round((Fnet / mass) * 100) / 100

    p.text = `A rightward force of ${Fapp} N is applied to a ${mass}-kg object to accelerate it to the right. The coefficient of friction (µ) is ${mu}. Find the resulting acceleration.`
    p.given = { mass, Fapp, mu }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mu, mass, acceln, Fnet }
  } else {
    // Problem 8
    p.level = 'Wizard'
    const mass = Math.round((5 + 3 * rA) * 10) / 10
    const acceln = Math.round((3 + 2 * rB) * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const mult = 1.3 + 0.4 * rC
    const Fapp = Math.round(Fnet * mult * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Ffrict = Math.round((Fapp - Fnet) * 10) / 10
    const mu = Math.round((Ffrict / Fnorm) * 1000) / 1000

    p.text = `A rightward force of ${Fapp} N is applied to a ${mass}-kg object to accelerate it to the right at ${acceln} m/s². Determine the coefficient of friction (µ).`
    p.given = { mass, acceln, Fapp }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mu, mass, acceln, Fnet }
  }

  return p
}

export default function SolveItModule() {
  const [level, setLevel] = useState('Apprentice')
  const [problemId, setProblemId] = useState(1)
  const [currentProblem, setCurrentProblem] = useState(() => generateProblemInstance(1))
  const [inputs, setInputs] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [fieldResults, setFieldResults] = useState({})
  const [showFormulas, setShowFormulas] = useState(false)
  const [completedProblems, setCompletedProblems] = useState(() => {
    try {
      const saved = localStorage.getItem('physix_solveit_completed')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Pick problems based on active level
  const levelProblemIds = level === 'Apprentice' ? [1, 2] : level === 'Master' ? [3, 4, 5] : [6, 7, 8]

  const loadNewProblem = (id) => {
    const p = generateProblemInstance(id)
    setCurrentProblem(p)
    setProblemId(id)

    // Prepopulate given fields
    const initialInputs = {}
    Object.keys(p.given).forEach((k) => {
      initialInputs[k] = p.given[k].toString()
    })
    setInputs(initialInputs)
    setIsSubmitted(false)
    setFieldResults({})
  }

  useEffect(() => {
    loadNewProblem(levelProblemIds[0])
  }, [level])

  const handleInputChange = (field, val) => {
    setInputs((prev) => ({ ...prev, [field]: val }))
    if (isSubmitted) setIsSubmitted(false)
  }

  const checkAnswers = () => {
    const results = {}
    let allCorrect = true

    Object.keys(currentProblem.target).forEach((key) => {
      // If given in the problem statement, automatically valid
      if (currentProblem.given[key] !== undefined) {
        results[key] = true
        return
      }

      const expected = currentProblem.target[key]
      const userVal = parseFloat(inputs[key])

      if (isNaN(userVal)) {
        results[key] = false
        allCorrect = false
        return
      }

      // Check within +/- 2% tolerance per official engine
      const minVal = 0.98 * expected
      const maxVal = 1.02 * expected

      // Special check for zero or tiny values
      let isWithinTolerance = false
      if (Math.abs(expected) < 0.001) {
        isWithinTolerance = Math.abs(userVal) < 0.05
      } else if (expected < 0) {
        isWithinTolerance = userVal <= minVal && userVal >= maxVal
      } else {
        isWithinTolerance = userVal >= minVal && userVal <= maxVal
      }

      results[key] = isWithinTolerance
      if (!isWithinTolerance) allCorrect = false
    })

    setFieldResults(results)
    setIsSubmitted(true)

    if (allCorrect) {
      const updated = { ...completedProblems, [problemId]: true }
      setCompletedProblems(updated)
      localStorage.setItem('physix_solveit_completed', JSON.stringify(updated))
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } })
    }
  }

  const isFieldGiven = (field) => currentProblem.given[field] !== undefined

  return (
    <div className="space-y-6">
      {/* Top Header & Difficulty Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-md shadow-cyan-500/20">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Solve It! Newton's 2nd Law</h2>
            <p className="text-xs text-slate-400">
              Calculate missing forces, mass, acceleration, and net force with ±2% tolerance.
            </p>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {['Apprentice', 'Master', 'Wizard'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                level === lvl
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Selection & Refresh Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Select Problem:</span>
          {levelProblemIds.map((id) => (
            <button
              key={id}
              onClick={() => loadNewProblem(id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                problemId === id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>Problem {id}</span>
              {completedProblems[id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadNewProblem(problemId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
            title="Randomize numbers for this problem"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Randomize Numbers</span>
          </button>
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showFormulas ? 'Hide Formulas' : 'Formulas & Guide'}</span>
          </button>
        </div>
      </div>

      {/* Formula Cheat Sheet & Helpful Rules Drawer */}
      {showFormulas && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 block mb-1">1. Vertical Equilibrium</span>
            <p>Because there is no vertical acceleration:</p>
            <code className="text-amber-300 font-mono block">F_grav = mass × 9.8 N/kg</code>
            <code className="text-amber-300 font-mono block">F_norm = F_grav</code>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 block mb-1">2. Newton's 2nd Law</span>
            <p>Net force and acceleration are linked:</p>
            <code className="text-emerald-300 font-mono block">F_net = mass × acceleration</code>
            <code className="text-emerald-300 font-mono block">a = F_net / mass</code>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 block mb-1">3. Horizontal Force Balance</span>
            <p>Subtract opposing horizontal forces:</p>
            <code className="text-rose-300 font-mono block">F_net = F_app - F_frict</code>
            <code className="text-rose-300 font-mono block">F_frict = µ × F_norm</code>
          </div>
        </div>
      )}

      {/* Problem Prompt Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-bold">
          Problem #{problemId} Description
        </div>
        <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
          {currentProblem.text}
        </p>
      </div>

      {/* Main Interactive Workspace: Free-Body Diagram with Embedded Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diagram Area */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[460px]">
          <div className="text-xs font-mono text-slate-500 mb-6">
            Enter Force Values Directly on Diagram Vectors (in Newtons)
          </div>

          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Top / Normal Force Vector */}
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pb-12">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold font-mono text-cyan-400">F_norm:</span>
                <input
                  type="number"
                  step="any"
                  disabled={isFieldGiven('Fnorm')}
                  value={inputs['Fnorm'] || ''}
                  onChange={(e) => handleInputChange('Fnorm', e.target.value)}
                  placeholder="?"
                  className={`w-24 px-2 py-1 bg-slate-950 border rounded-lg text-xs font-mono text-center text-white focus:outline-none ${
                    isSubmitted
                      ? fieldResults['Fnorm']
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-rose-500 bg-rose-950/30'
                      : isFieldGiven('Fnorm')
                      ? 'border-slate-800 bg-slate-900/60 opacity-80'
                      : 'border-cyan-500/40 focus:border-cyan-400'
                  }`}
                />
                <span className="text-[10px] text-slate-500 font-mono">N</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-cyan-400"></div>
              <div className="w-1 h-12 bg-cyan-400"></div>
            </div>

            {/* Bottom / Gravity Vector */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pt-12">
              <div className="w-1 h-12 bg-rose-400"></div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400"></div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-bold font-mono text-rose-400">F_grav:</span>
                <input
                  type="number"
                  step="any"
                  disabled={isFieldGiven('Fgrav')}
                  value={inputs['Fgrav'] || ''}
                  onChange={(e) => handleInputChange('Fgrav', e.target.value)}
                  placeholder="?"
                  className={`w-24 px-2 py-1 bg-slate-950 border rounded-lg text-xs font-mono text-center text-white focus:outline-none ${
                    isSubmitted
                      ? fieldResults['Fgrav']
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-rose-500 bg-rose-950/30'
                      : isFieldGiven('Fgrav')
                      ? 'border-slate-800 bg-slate-900/60 opacity-80'
                      : 'border-rose-500/40 focus:border-rose-400'
                  }`}
                />
                <span className="text-[10px] text-slate-500 font-mono">N</span>
              </div>
            </div>

            {/* Left / Friction Vector */}
            <div className="absolute right-1/2 top-1/2 -translate-y-1/2 flex items-center pr-12">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-bold font-mono text-amber-400">F_frict:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="any"
                    disabled={isFieldGiven('Ffrict')}
                    value={inputs['Ffrict'] || ''}
                    onChange={(e) => handleInputChange('Ffrict', e.target.value)}
                    placeholder="?"
                    className={`w-20 px-2 py-1 bg-slate-950 border rounded-lg text-xs font-mono text-center text-white focus:outline-none ${
                      isSubmitted
                        ? fieldResults['Ffrict']
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-rose-500 bg-rose-950/30'
                        : isFieldGiven('Ffrict')
                        ? 'border-slate-800 bg-slate-900/60 opacity-80'
                        : 'border-amber-500/40 focus:border-amber-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">N</span>
                </div>
              </div>
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[10px] border-r-amber-400"></div>
              <div className="h-1 w-12 bg-amber-400"></div>
            </div>

            {/* Right / Applied Vector (Only if applicable) */}
            {currentProblem.target.Fapp !== undefined && (
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pl-12">
                <div className="h-1 w-12 bg-emerald-400"></div>
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-emerald-400"></div>
                <div className="flex flex-col items-start ml-2">
                  <span className="text-xs font-bold font-mono text-emerald-400">F_app:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      disabled={isFieldGiven('Fapp')}
                      value={inputs['Fapp'] || ''}
                      onChange={(e) => handleInputChange('Fapp', e.target.value)}
                      placeholder="?"
                      className={`w-20 px-2 py-1 bg-slate-950 border rounded-lg text-xs font-mono text-center text-white focus:outline-none ${
                        isSubmitted
                          ? fieldResults['Fapp']
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : 'border-rose-500 bg-rose-950/30'
                          : isFieldGiven('Fapp')
                          ? 'border-slate-800 bg-slate-900/60 opacity-80'
                          : 'border-emerald-500/40 focus:border-emerald-400'
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 font-mono">N</span>
                  </div>
                </div>
              </div>
            )}

            {/* Center Object Box */}
            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-2xl border-2 border-cyan-300/40 shadow-xl shadow-cyan-500/20 flex flex-col items-center justify-center p-2 text-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">BOX</span>
              <span className="text-[10px] text-cyan-200 font-mono mt-1">m = {currentProblem.given.mass || '?'} kg</span>
            </div>
          </div>
        </div>

        {/* Right Area: Dynamic Data Table & Evaluation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Motion & Dynamics Table
            </h3>

            {/* Inputs Grid */}
            <div className="space-y-3">
              {/* Mass */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Object Mass:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <input
                    type="number"
                    step="any"
                    disabled={isFieldGiven('mass')}
                    value={inputs['mass'] || ''}
                    onChange={(e) => handleInputChange('mass', e.target.value)}
                    placeholder="?"
                    className={`w-24 px-2 py-1 bg-slate-900 border rounded-lg text-xs text-center text-white focus:outline-none ${
                      isSubmitted
                        ? fieldResults['mass']
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : isFieldGiven('mass')
                        ? 'border-slate-800 bg-slate-900/50 opacity-80'
                        : 'border-cyan-500/40'
                    }`}
                  />
                  <span className="text-xs text-slate-500">kg</span>
                </div>
              </div>

              {/* Net Force */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Net Force (F_net):</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <input
                    type="number"
                    step="any"
                    disabled={isFieldGiven('Fnet')}
                    value={inputs['Fnet'] || ''}
                    onChange={(e) => handleInputChange('Fnet', e.target.value)}
                    placeholder="?"
                    className={`w-24 px-2 py-1 bg-slate-900 border rounded-lg text-xs text-center text-white focus:outline-none ${
                      isSubmitted
                        ? fieldResults['Fnet']
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : isFieldGiven('Fnet')
                        ? 'border-slate-800 bg-slate-900/50 opacity-80'
                        : 'border-cyan-500/40'
                    }`}
                  />
                  <span className="text-xs text-slate-500">N</span>
                </div>
              </div>

              {/* Acceleration */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Acceleration (a):</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <input
                    type="number"
                    step="any"
                    disabled={isFieldGiven('acceln')}
                    value={inputs['acceln'] || ''}
                    onChange={(e) => handleInputChange('acceln', e.target.value)}
                    placeholder="?"
                    className={`w-24 px-2 py-1 bg-slate-900 border rounded-lg text-xs text-center text-white focus:outline-none ${
                      isSubmitted
                        ? fieldResults['acceln']
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : isFieldGiven('acceln')
                        ? 'border-slate-800 bg-slate-900/50 opacity-80'
                        : 'border-cyan-500/40'
                    }`}
                  />
                  <span className="text-xs text-slate-500">m/s²</span>
                </div>
              </div>

              {/* Coefficient of Friction (if applicable) */}
              {currentProblem.target.mu !== undefined && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Coefficient of Friction (µ):</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      step="any"
                      disabled={isFieldGiven('mu')}
                      value={inputs['mu'] || ''}
                      onChange={(e) => handleInputChange('mu', e.target.value)}
                      placeholder="?"
                      className={`w-24 px-2 py-1 bg-slate-900 border rounded-lg text-xs text-center text-white focus:outline-none ${
                        isSubmitted
                          ? fieldResults['mu']
                            ? 'border-emerald-500'
                            : 'border-rose-500'
                          : isFieldGiven('mu')
                          ? 'border-slate-800 bg-slate-900/50 opacity-80'
                          : 'border-cyan-500/40'
                      }`}
                    />
                    <span className="text-xs text-slate-500">ratio</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit & Reset Buttons */}
            <div className="pt-2">
              <button
                onClick={checkAnswers}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Check All Values (±2% Tolerance)</span>
              </button>

              {isSubmitted && (
                <div className="mt-4 p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in">
                  {Object.values(fieldResults).every(Boolean) ? (
                    <div className="text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Outstanding! All values accurately solved! Star Earned ⭐</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-rose-300">
                      <div className="flex items-center gap-2 font-bold text-rose-400">
                        <XCircle className="w-5 h-5 shrink-0" />
                        <span>Some values are outside the ±2% tolerance!</span>
                      </div>
                      <p className="text-slate-400 text-[11px] pt-1">
                        Double check your arithmetic. Remember that vertical forces cancel: F_norm = F_grav = mass × 9.8.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
