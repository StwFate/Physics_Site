import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Zap, Scale, ChevronLeft, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import balancedData from '../data/balancedForcesQuestions.json'
import PhysicsVisualizer from './PhysicsVisualizer'

export default function BalancedForcesModule() {
  const [currentLevel, setCurrentLevel] = useState('Apprentice')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedMotion, setSelectedMotion] = useState(null)
  const [selectedForce, setSelectedForce] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('physix_balanced_completed')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Filter questions for the chosen level based on availableInLevels or groupId
  const questions = (balancedData.questions || []).filter((q) => {
    if (currentLevel === 'Apprentice') {
      return q.availableInLevels ? q.availableInLevels.includes('Apprentice') : q.groupId <= 4
    }
    if (currentLevel === 'Master') {
      return q.availableInLevels ? q.availableInLevels.includes('Master') : q.groupId <= 8
    }
    return true
  })

  const currentQ = questions[currentIndex] || questions[0] || {
    id: 1,
    groupId: 1,
    stem: 'Loading...',
    image: 'Q1.jpg',
    motionDirection: 'rightward',
    representationType: 'force_diagram',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: ''
  }

  useEffect(() => {
    setSelectedMotion(null)
    setSelectedForce(null)
    setIsSubmitted(false)
    setIsCorrect(false)
  }, [currentIndex, currentLevel])

  const handleLevelChange = (lvl) => {
    setCurrentLevel(lvl)
    setCurrentIndex(0)
  }

  const handleSubmit = () => {
    if (!selectedMotion || !selectedForce) return

    const correctMotion = currentQ.motionAnswer
    const correctForce = currentQ.forceAnswer

    const correct = selectedMotion === correctMotion && selectedForce === correctForce
    setIsCorrect(correct)
    setIsSubmitted(true)

    if (correct) {
      const newCompleted = { ...completedQuestions, [currentQ.id]: true }
      setCompletedQuestions(newCompleted)
      localStorage.setItem('physix_balanced_completed', JSON.stringify(newCompleted))

      // Trigger confetti if this completes all questions in the level
      const levelQuestions = questions.map(q => q.id)
      const allDone = levelQuestions.every(id => newCompleted[id])
      if (allDone) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const completedInLevel = questions.filter(q => completedQuestions[q.id]).length

  // Calculate visualizer forces based on question
  let fNet = 0
  let initialV = 0
  let simForces = []
  const isLeftward = currentQ.motionDirection && currentQ.motionDirection.toLowerCase().includes('left')

  if (currentQ.forceAnswer === 'Balanced') {
    fNet = 0
    initialV = isLeftward ? -5 : 5
    simForces = [
      { name: 'F_1', value: 30, dir: 'left' },
      { name: 'F_2', value: 30, dir: 'right' }
    ]
  } else {
    // Unbalanced
    if (currentQ.motionAnswer === 'Speeding Up') {
      fNet = isLeftward ? -25 : 25
      initialV = isLeftward ? -2 : 2
      simForces = isLeftward
        ? [{ name: 'F_net', value: 45, dir: 'left' }, { name: 'f', value: 15, dir: 'right' }]
        : [{ name: 'F_net', value: 45, dir: 'right' }, { name: 'f', value: 15, dir: 'left' }]
    } else {
      // Slowing Down
      fNet = isLeftward ? 25 : -25
      initialV = isLeftward ? -7 : 7
      simForces = isLeftward
        ? [{ name: 'f', value: 35, dir: 'right' }]
        : [{ name: 'f', value: 35, dir: 'left' }]
    }
  }

  const reprLabel = currentQ.representationType
    ? currentQ.representationType.replace('_', ' ').toUpperCase()
    : 'DIAGRAM'

  return (
    <div className="space-y-6">
      {/* Top Bar: Level Selector & Progress Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Level Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {['Apprentice', 'Master', 'Wizard'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentLevel === lvl
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Progress Stars */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Level Progress</div>
            <div className="text-sm font-bold text-white font-mono">
              {completedInLevel} / {questions.length} Mastered
            </div>
          </div>
          <div className="w-24 sm:w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${questions.length > 0 ? (completedInLevel / questions.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Representation (Diagram / Graph / Data Table) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold font-mono">
                Question {currentIndex + 1} of {questions.length} • Group {currentQ.groupId}
              </span>
              <span className="text-slate-400 font-medium">
                Type: <strong className="text-slate-200">{reprLabel}</strong>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-slate-100 mb-4 leading-relaxed">
              {currentQ.stem}
            </h3>

            {/* Media Asset Display */}
            <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-center justify-center min-h-[220px] overflow-hidden group">
              <img
                src={`./media/balanced-forces/${currentQ.image}`}
                alt={`Question ${currentQ.id} diagram`}
                className="max-h-56 max-w-full object-contain rounded transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 rounded text-[10px] text-slate-400 font-mono capitalize">
                Motion: {currentQ.motionDirection}
              </div>
            </div>
          </div>

          {/* Question Navigation Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800 text-xs">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="font-mono text-slate-400 text-xs">
              ID #{currentQ.id} {completedQuestions[currentQ.id] && '⭐'}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Prompts & Evaluation */}
        <div className="lg:col-span-6 space-y-5">
          {/* Prompt 1: Motion State */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Prompt 1: What is the state of motion?
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {['Speeding Up', 'Slowing Down', 'Constant Speed'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedMotion(opt)}
                  disabled={isSubmitted}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    selectedMotion === opt
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt 2: Force State */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Prompt 2: Are the forces balanced or unbalanced?
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {['Balanced', 'Unbalanced'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedForce(opt)}
                  disabled={isSubmitted}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedForce === opt
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{opt} Forces</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action & Feedback Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedMotion || !selectedForce}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Check My Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                {isCorrect ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm space-y-1">
                      <div className="font-bold text-emerald-400">Spot on! Star Earned ⭐</div>
                      <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm space-y-1">
                      <div className="font-bold text-rose-400">Not quite right!</div>
                      <p className="text-slate-300 leading-relaxed">
                        Correct: <strong>{currentQ.motionAnswer}</strong> with{' '}
                        <strong>{currentQ.forceAnswer} Forces</strong>.
                      </p>
                      <p className="text-slate-400 text-xs mt-1">{currentQ.explanation}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setSelectedMotion(null)
                      setSelectedForce(null)
                    }}
                    className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Try Again
                  </button>
                  {currentIndex < questions.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="flex-1 py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      Next Question <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Interactive Motion Simulator Sandbox */}
      <PhysicsVisualizer
        fNet={fNet}
        mass={10}
        initialVelocity={initialV}
        label={`Visual Physics Simulation • Question ${currentQ.id} Dynamic Model`}
        forces={simForces}
      />
    </div>
  )
}
