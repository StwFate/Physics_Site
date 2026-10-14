import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Zap, Scale, ChevronLeft, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import balancedData from '../data/balancedForcesQuestions.json'
import PhysicsVisualizer from './PhysicsVisualizer'

const LEVEL_QUESTION_IDS = {
  Apprentice: [1, 2, 5, 7, 9, 10, 13, 14],
  Master: [1, 2, 5, 7, 10, 13, 17, 18, 19, 20, 23, 24, 25, 26],
  Wizard: [1, 5, 11, 13, 17, 18, 19, 20, 23, 24, 25, 26, 29, 30, 31, 32, 35, 37, 41, 42],
}

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

  // Filter curated questions for the chosen level: 8 Apprentice, 14 Master, 20 Wizard
  const targetIds = LEVEL_QUESTION_IDS[currentLevel] || LEVEL_QUESTION_IDS.Apprentice
  const questions = targetIds
    .map((id) => (balancedData.questions || []).find((q) => q.id === id))
    .filter(Boolean)

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

      const levelQuestions = questions.map(q => q.id)
      const allDone = levelQuestions.every(id => newCompleted[id])
      if (allDone) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
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
    <div className="space-y-4">
      {/* Level Selector & Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Minimalist Level Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
          {['Apprentice', 'Master', 'Wizard'].map((lvl) => {
            const count = LEVEL_QUESTION_IDS[lvl]?.length || 0
            return (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  currentLevel === lvl
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl} ({count})
              </button>
            )
          })}
        </div>

        {/* Level Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium font-mono">
            {completedInLevel} / {questions.length} Mastered
          </span>
          <div className="w-28 bg-slate-100 h-2 rounded overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${questions.length > 0 ? (completedInLevel / questions.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Question Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Representation */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2.5 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
                Question {currentIndex + 1} of {questions.length} • Group {currentQ.groupId}
              </span>
              <span className="text-slate-500 font-medium">
                Type: <strong className="text-slate-800">{reprLabel}</strong>
              </span>
            </div>

            <p className="text-sm font-medium text-slate-900 mb-4 leading-relaxed">
              {currentQ.stem}
            </p>

            {/* Media Asset Display */}
            <div className="relative bg-slate-50 rounded border border-slate-200 p-4 flex items-center justify-center min-h-[220px]">
              <img
                src={`./media/balanced-forces/${currentQ.image}`}
                alt={`Question ${currentQ.id} diagram`}
                className="max-h-56 max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-mono capitalize">
                Motion: {currentQ.motionDirection}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="font-mono text-slate-400 text-xs">
              #{currentQ.id} {completedQuestions[currentQ.id] && '⭐'}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Prompts & Feedback */}
        <div className="lg:col-span-6 space-y-4">
          {/* Prompt 1: Motion State */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              1. What is the state of motion?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Speeding Up', 'Slowing Down', 'Constant Speed'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedMotion(opt)}
                  disabled={isSubmitted}
                  className={`py-2 px-2.5 rounded border text-xs font-medium transition-all text-center ${
                    selectedMotion === opt
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt 2: Force State */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              2. Are the forces balanced or unbalanced?
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Balanced', 'Unbalanced'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedForce(opt)}
                  disabled={isSubmitted}
                  className={`py-2 px-2.5 rounded border text-xs font-medium transition-all text-center ${
                    selectedForce === opt
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {opt} Forces
                </button>
              ))}
            </div>
          </div>

          {/* Evaluate & Result Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedMotion || !selectedForce}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Check Answer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                {isCorrect ? (
                  <div className="p-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct! Star Earned ⭐</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
                  </div>
                ) : (
                  <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      Correct: <strong>{currentQ.motionAnswer}</strong> with{' '}
                      <strong>{currentQ.forceAnswer} Forces</strong>.
                    </p>
                    <p className="text-slate-600 text-[11px] pt-1">{currentQ.explanation}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setSelectedMotion(null)
                      setSelectedForce(null)
                    }}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Try Again
                  </button>
                  {currentIndex < questions.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      Next <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Physics Simulation */}
      <PhysicsVisualizer
        fNet={fNet}
        mass={10}
        initialVelocity={initialV}
        label={`Question ${currentQ.id} Motion Model`}
        forces={simForces}
      />
    </div>
  )
}
