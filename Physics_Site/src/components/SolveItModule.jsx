import React, { useState, useEffect } from 'react'
import { Calculator, CheckCircle2, XCircle, Shuffle, BookOpen } from 'lucide-react'
import confetti from 'canvas-confetti'
import ForceSymbol from './ForceSymbol'

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

  const levelProblemIds = level === 'Apprentice' ? [1, 2] : level === 'Master' ? [3, 4, 5] : [6, 7, 8]

  const loadNewProblem = (id) => {
    const p = generateProblemInstance(id)
    setCurrentProblem(p)
    setProblemId(id)

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

      const absExpected = Math.abs(expected)
      const absUser = Math.abs(userVal)

      let isWithinTolerance = false
      if (absExpected < 0.001) {
        isWithinTolerance = absUser < 0.05
      } else {
        const signedMatch = expected < 0
          ? userVal <= 0.98 * expected && userVal >= 1.02 * expected
          : userVal >= 0.98 * expected && userVal <= 1.02 * expected
        const magnitudeMatch = absUser >= 0.98 * absExpected && absUser <= 1.02 * absExpected
        isWithinTolerance = signedMatch || magnitudeMatch
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
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } })
    }
  }

  const isFieldGiven = (field) => currentProblem.given[field] !== undefined

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Solve It! Newton's 2nd Law</h2>
            <p className="text-xs text-slate-500">
              Calculate missing variables with standard ±2% tolerance.
            </p>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
          {['Apprentice', 'Master', 'Wizard'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                level === lvl
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Selection Strip */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Problems:</span>
          {levelProblemIds.map((id) => (
            <button
              key={id}
              onClick={() => loadNewProblem(id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 border ${
                problemId === id
                  ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Problem {id}</span>
              {completedProblems[id] && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadNewProblem(problemId)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
            title="Generate new numbers"
          >
            <Shuffle className="w-3 h-3" />
            <span>Randomize Numbers</span>
          </button>
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 rounded text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3 h-3 text-blue-600" />
            <span>{showFormulas ? 'Hide Formulas' : 'Formulas'}</span>
          </button>
        </div>
      </div>

      {/* Formula Cheat Sheet */}
      {showFormulas && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3 shadow-sm animate-in fade-in">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Vertical Equilibrium</span>
            <div className="text-slate-800 font-mono flex items-center gap-1">
              <ForceSymbol type="Fgrav" /> = m × 9.8 N/kg
            </div>
            <div className="text-slate-800 font-mono flex items-center gap-1">
              <ForceSymbol type="Fnorm" /> = <ForceSymbol type="Fgrav" />
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Newton's 2nd Law</span>
            <div className="text-slate-800 font-mono flex items-center gap-1">
              <ForceSymbol type="Fnet" /> = m × a
            </div>
            <div className="text-slate-800 font-mono flex items-center gap-1">
              a = <ForceSymbol type="Fnet" /> / m
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Horizontal Forces</span>
            <div className="text-slate-800 font-mono flex items-center gap-1">
              <ForceSymbol type="Fnet" /> = <ForceSymbol type="Fapp" /> - <ForceSymbol type="Ffrict" />
            </div>
            <div className="text-slate-800 font-mono flex items-center gap-1">
              <ForceSymbol type="Ffrict" /> = µ × <ForceSymbol type="Fnorm" />
            </div>
          </div>
        </div>
      )}

      {/* Problem Description Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="text-[11px] font-mono text-slate-700 uppercase tracking-wider mb-1 font-bold">
          Problem #{problemId} Description
        </div>
        <p className="text-slate-900 text-xs sm:text-sm leading-relaxed font-medium">
          {currentProblem.text}
        </p>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Diagram Area */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center relative min-h-[420px] shadow-sm">
          <div className="text-xs font-mono text-slate-700 mb-6 font-semibold">
            Enter Force Values Directly on Diagram Vectors (in Newtons)
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Top / Normal Force Vector */}
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pb-10">
              <div className="flex items-center gap-1 mb-1.5">
                <label htmlFor="diagram-input-fnorm" className="text-xs font-bold text-blue-700 flex items-center gap-0.5 cursor-pointer">
                  <ForceSymbol type="Fnorm" />:
                </label>
                <input
                  id="diagram-input-fnorm"
                  type="number"
                  step="any"
                  disabled={isFieldGiven('Fnorm')}
                  value={inputs['Fnorm'] || ''}
                  onChange={(e) => handleInputChange('Fnorm', e.target.value)}
                  placeholder="?"
                  aria-label="Normal force (F_N) in Newtons"
                  className={`w-20 px-1.5 py-0.5 bg-white border rounded text-xs font-mono text-center text-slate-900 focus:outline-none ${
                    isSubmitted
                      ? fieldResults['Fnorm']
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-rose-500 bg-rose-50'
                      : isFieldGiven('Fnorm')
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-slate-300 focus:border-blue-600 shadow-sm'
                  }`}
                />
                <span className="text-xs text-slate-700 font-bold font-mono">N</span>
              </div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-blue-600"></div>
              <div className="w-0.5 h-10 bg-blue-600"></div>
            </div>

            {/* Bottom / Gravity Vector */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center pt-10">
              <div className="w-0.5 h-10 bg-rose-600"></div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-rose-600"></div>
              <div className="flex items-center gap-1 mt-1.5">
                <label htmlFor="diagram-input-fgrav" className="text-xs font-bold text-rose-700 flex items-center gap-0.5 cursor-pointer">
                  <ForceSymbol type="Fgrav" />:
                </label>
                <input
                  id="diagram-input-fgrav"
                  type="number"
                  step="any"
                  disabled={isFieldGiven('Fgrav')}
                  value={inputs['Fgrav'] || ''}
                  onChange={(e) => handleInputChange('Fgrav', e.target.value)}
                  placeholder="?"
                  aria-label="Gravity force (F_g) in Newtons"
                  className={`w-20 px-1.5 py-0.5 bg-white border rounded text-xs font-mono text-center text-slate-900 focus:outline-none ${
                    isSubmitted
                      ? fieldResults['Fgrav']
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-rose-500 bg-rose-50'
                      : isFieldGiven('Fgrav')
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-slate-300 focus:border-rose-600 shadow-sm'
                  }`}
                />
                <span className="text-xs text-slate-700 font-bold font-mono">N</span>
              </div>
            </div>

            {/* Left / Friction Vector */}
            <div className="absolute right-1/2 top-1/2 -translate-y-1/2 flex items-center pr-10">
              <div className="flex flex-col items-end mr-1.5">
                <label htmlFor="diagram-input-ffrict" className="text-xs font-bold text-amber-700 flex items-center gap-0.5 cursor-pointer">
                  <ForceSymbol type="Ffrict" />:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="diagram-input-ffrict"
                    type="number"
                    step="any"
                    disabled={isFieldGiven('Ffrict')}
                    value={inputs['Ffrict'] || ''}
                    onChange={(e) => handleInputChange('Ffrict', e.target.value)}
                    placeholder="?"
                    aria-label="Friction force (F_f) in Newtons"
                    className={`w-18 px-1.5 py-0.5 bg-white border rounded text-xs font-mono text-center text-slate-900 focus:outline-none ${
                      isSubmitted
                        ? fieldResults['Ffrict']
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-rose-500 bg-rose-50'
                        : isFieldGiven('Ffrict')
                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                        : 'border-slate-300 focus:border-amber-600 shadow-sm'
                    }`}
                  />
                  <span className="text-xs text-slate-700 font-bold font-mono">N</span>
                </div>
              </div>
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-amber-600"></div>
              <div className="h-0.5 w-10 bg-amber-600"></div>
            </div>

            {/* Right / Applied Vector */}
            {currentProblem.target.Fapp !== undefined && (
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pl-10">
                <div className="h-0.5 w-10 bg-emerald-600"></div>
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-emerald-600"></div>
                <div className="flex flex-col items-start ml-1.5">
                  <label htmlFor="diagram-input-fapp" className="text-xs font-bold text-emerald-700 flex items-center gap-0.5 cursor-pointer">
                    <ForceSymbol type="Fapp" />:
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id="diagram-input-fapp"
                      type="number"
                      step="any"
                      disabled={isFieldGiven('Fapp')}
                      value={inputs['Fapp'] || ''}
                      onChange={(e) => handleInputChange('Fapp', e.target.value)}
                      placeholder="?"
                      aria-label="Applied force (F_a) in Newtons"
                      className={`w-18 px-1.5 py-0.5 bg-white border rounded text-xs font-mono text-center text-slate-900 focus:outline-none ${
                        isSubmitted
                          ? fieldResults['Fapp']
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-rose-500 bg-rose-50'
                          : isFieldGiven('Fapp')
                          ? 'border-slate-200 bg-slate-50 text-slate-600'
                          : 'border-slate-300 focus:border-emerald-600 shadow-sm'
                      }`}
                    />
                    <span className="text-xs text-slate-700 font-bold font-mono">N</span>
                  </div>
                </div>
              </div>
            )}

            {/* Center Box */}
            <div className="w-20 h-20 bg-slate-900 rounded-md border border-slate-800 shadow-sm flex flex-col items-center justify-center p-1 text-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">BOX</span>
              <span className="text-xs text-slate-200 font-mono mt-0.5 font-semibold">m = {currentProblem.given.mass || '?'} kg</span>
            </div>
          </div>
        </div>

        {/* Right Table */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Dynamics Variables Table
            </h3>

            <div className="space-y-2">
              {/* Mass */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <label htmlFor="table-input-mass" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Mass (m):
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    id="table-input-mass"
                    type="number"
                    step="any"
                    disabled={isFieldGiven('mass')}
                    value={inputs['mass'] || ''}
                    onChange={(e) => handleInputChange('mass', e.target.value)}
                    placeholder="?"
                    aria-label="Mass (m) in kilograms"
                    className={`w-20 px-1.5 py-0.5 bg-white border rounded text-xs text-center text-slate-900 focus:outline-none ${
                      isSubmitted
                        ? fieldResults['mass'] ? 'border-emerald-500' : 'border-rose-500'
                        : isFieldGiven('mass') ? 'border-slate-200 bg-slate-100 text-slate-600 font-medium' : 'border-slate-300'
                    }`}
                  />
                  <span className="text-xs text-slate-700 font-bold">kg</span>
                </div>
              </div>

              {/* Net Force */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <label htmlFor="table-input-fnet" className="text-xs font-semibold text-slate-800 flex items-center gap-1 cursor-pointer">
                  Net Force (<ForceSymbol type="Fnet" />):
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    id="table-input-fnet"
                    type="number"
                    step="any"
                    disabled={isFieldGiven('Fnet')}
                    value={inputs['Fnet'] || ''}
                    onChange={(e) => handleInputChange('Fnet', e.target.value)}
                    placeholder="?"
                    aria-label="Net force (F_net) in Newtons"
                    className={`w-20 px-1.5 py-0.5 bg-white border rounded text-xs text-center text-slate-900 focus:outline-none ${
                      isSubmitted
                        ? fieldResults['Fnet'] ? 'border-emerald-500' : 'border-rose-500'
                        : isFieldGiven('Fnet') ? 'border-slate-200 bg-slate-100 text-slate-600 font-medium' : 'border-slate-300'
                    }`}
                  />
                  <span className="text-xs text-slate-700 font-bold">N</span>
                </div>
              </div>

              {/* Acceleration */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <label htmlFor="table-input-acceln" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Acceleration (a):
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    id="table-input-acceln"
                    type="number"
                    step="any"
                    disabled={isFieldGiven('acceln')}
                    value={inputs['acceln'] || ''}
                    onChange={(e) => handleInputChange('acceln', e.target.value)}
                    placeholder="?"
                    aria-label="Acceleration (a) in meters per second squared"
                    className={`w-20 px-1.5 py-0.5 bg-white border rounded text-xs text-center text-slate-900 focus:outline-none ${
                      isSubmitted
                        ? fieldResults['acceln'] ? 'border-emerald-500' : 'border-rose-500'
                        : isFieldGiven('acceln') ? 'border-slate-200 bg-slate-100 text-slate-600 font-medium' : 'border-slate-300'
                    }`}
                  />
                  <span className="text-xs text-slate-700 font-bold">m/s²</span>
                </div>
              </div>

              {/* Friction Coeff (µ) */}
              {currentProblem.target.mu !== undefined && (
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <label htmlFor="table-input-mu" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Coeff. of Friction (µ):
                  </label>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      id="table-input-mu"
                      type="number"
                      step="any"
                      disabled={isFieldGiven('mu')}
                      value={inputs['mu'] || ''}
                      onChange={(e) => handleInputChange('mu', e.target.value)}
                      placeholder="?"
                      aria-label="Coefficient of friction (mu), unitless ratio"
                      className={`w-20 px-1.5 py-0.5 bg-white border rounded text-xs text-center text-slate-900 focus:outline-none ${
                        isSubmitted
                          ? fieldResults['mu'] ? 'border-emerald-500' : 'border-rose-500'
                          : isFieldGiven('mu') ? 'border-slate-200 bg-slate-100 text-slate-600 font-medium' : 'border-slate-300'
                      }`}
                    />
                    <span className="text-xs text-slate-700 font-bold">ratio</span>
                  </div>
                </div>
              )}
            </div>

            {/* Check Button */}
            <div className="pt-2">
              <button
                onClick={checkAnswers}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Check Values (±2% Tolerance)</span>
              </button>

              {isSubmitted && (
                <div className="mt-3 p-3 rounded border text-xs leading-relaxed animate-in fade-in">
                  {Object.values(fieldResults).every(Boolean) ? (
                    <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>All values accurately calculated! Star Earned ⭐</span>
                    </div>
                  ) : (
                    <div className="text-rose-700 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Some values outside ±2% tolerance!</span>
                      </div>
                      <p className="text-slate-600 text-[11px] flex items-center gap-1 flex-wrap">
                        <span>Vertical balance: <ForceSymbol type="Fnorm" /> = <ForceSymbol type="Fgrav" /> = m × 9.8. Then evaluate horizontal forces with <ForceSymbol type="Fnet" /> = m × a.</span>
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
