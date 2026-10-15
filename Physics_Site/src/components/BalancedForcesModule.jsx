import React, { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Scale,
  ChevronLeft,
  ChevronRight,
  Shuffle
} from 'lucide-react'
import confetti from 'canvas-confetti'
import PhysicsVisualizer from './PhysicsVisualizer'
import BalancedForcesVisuals from './BalancedForcesVisuals'
import { generateBalancedQuestions } from '../utils/balancedForcesGenerator'
import { getStudentSeed, shuffleWithSeed, incrementStudentSeed } from '../utils/studentSeed'

const MASTERY_GOALS = {
  Apprentice: 8,
  Master: 14,
  Wizard: 20
}

const LEVEL_COUNTS = {
  Apprentice: 8,
  Master: 14,
  Wizard: 20
}

export default function BalancedForcesModule({ currentUser }) {
  const [currentLevel, setCurrentLevel] = useState('Apprentice')
  const [seed, setSeed] = useState(() => getStudentSeed(currentUser?.uid))
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

  // Procedurally generate unique questions for the active level and pre-shuffle per student
  const questions = useMemo(() => {
    const raw = generateBalancedQuestions(currentLevel, seed)
    const levelOffset = currentLevel === 'Apprentice' ? 101 : currentLevel === 'Master' ? 202 : 303
    return shuffleWithSeed(raw, seed + levelOffset)
  }, [currentLevel, seed])

  const currentQ = questions[currentIndex] || questions[0]
  const masteryGoal = MASTERY_GOALS[currentLevel] || 8

  const formatQuestionId = (id) => {
    if (!id) return ''
    return id.charAt(0).toUpperCase() + id.slice(1)
  }

  useEffect(() => {
    setSeed(getStudentSeed(currentUser?.uid))
  }, [currentUser?.uid])

  useEffect(() => {
    setSelectedMotion(null)
    setSelectedForce(null)
    setIsSubmitted(false)
    setIsCorrect(false)
  }, [currentIndex, currentLevel, seed])

  const handleLevelChange = (lvl) => {
    setCurrentLevel(lvl)
    setCurrentIndex(0)
  }

  const handleShuffle = () => {
    const nextSeed = incrementStudentSeed(currentUser?.uid)
    setSeed(nextSeed)
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

      const newlyCompletedInLevel = questions.filter((q) => newCompleted[q.id]).length
      if (newlyCompletedInLevel === masteryGoal || newlyCompletedInLevel === questions.length) {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } })
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

  const completedInLevel = questions.filter((q) => completedQuestions[q.id]).length
  const isLevelMastered = completedInLevel >= masteryGoal
  const allPoolDone = questions.length > 0 && questions.every((q) => completedQuestions[q.id])
  const firstUnmasteredIndex = questions.findIndex((q) => !completedQuestions[q.id])

  // Simulation parameters directly from dynamic question physics
  const fNet = currentQ?.simParams?.fNet !== undefined
    ? currentQ.simParams.fNet
    : (currentQ?.forceAnswer === 'Balanced' ? 0 : 25)
  const initialV = currentQ?.simParams?.initialV !== undefined
    ? currentQ.simParams.initialV
    : 5
  const simForces = currentQ?.simParams?.forces || [
    { name: 'F_app', value: 25, dir: 'right' },
    { name: 'F_frict', value: 25, dir: 'left' }
  ]

  const reprLabel = currentQ?.representationType
    ? currentQ.representationType.replace(/_/g, ' ').toUpperCase()
    : 'DIAGRAM'

  return (
    <div className="space-y-4">
      {/* Level Selector & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Minimalist Level Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
          {['Apprentice', 'Master', 'Wizard'].map((lvl) => {
            const count = LEVEL_COUNTS[lvl] || 0
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

        {/* Right side controls: Regenerate & Progress */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium transition-colors shadow-2xs"
            title="Generate new randomized variations"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600" />
            <span>Shuffle</span>
          </button>

          <span className="text-xs text-slate-500 font-medium font-mono">
            {completedInLevel} / {masteryGoal} Mastered ({questions.length} in pool)
          </span>
          <div className="w-24 bg-slate-100 h-2 rounded overflow-hidden border border-slate-200" title={`${completedInLevel} / ${masteryGoal} Mastered`}>
            <div
              className={`h-full transition-all duration-300 ${isLevelMastered ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{
                width: `${Math.min(100, (completedInLevel / masteryGoal) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Level Mastered Celebration Banner */}
      {isLevelMastered && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                {currentLevel} Level Mastered! ({completedInLevel} / {masteryGoal} Mastered • {questions.length} in Pool)
              </div>
              <div className="text-[11px] text-emerald-700">
                {currentLevel === 'Wizard'
                  ? 'Grandmaster achievement unlocked! You have mastered all three tiers of Balanced Forces. Feel free to explore the remaining questions in the pool or shuffle for a new run!'
                  : `Mastery goal reached! You can advance to ${currentLevel === 'Apprentice' ? 'Master (14)' : 'Wizard (20)'} anytime, or keep practicing the remaining questions in this pool.`}
              </div>
            </div>
          </div>
          {currentLevel === 'Apprentice' && (
            <button
              onClick={() => handleLevelChange('Master')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Proceed to Master Level (14)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {currentLevel === 'Master' && (
            <button
              onClick={() => handleLevelChange('Wizard')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Proceed to Wizard Level (20)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {currentLevel === 'Wizard' && (
            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>🏆 Grandmaster Replay (Shuffle Pool)</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Question Selector Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-2 shadow-sm">
        <span className="text-xs text-slate-500 font-semibold whitespace-nowrap pl-1 shrink-0">
          Questions:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin w-full">
          {questions.map((q, idx) => {
            const isMastered = !!completedQuestions[q.id]
            const isCurrent = currentIndex === idx
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 border whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                    : isMastered
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title={`Question ${idx + 1} (${isMastered ? 'Mastered ⭐' : 'Unmastered'})`}
              >
                <span>Q{idx + 1}</span>
                {isMastered && <span className="text-amber-500 text-[11px] leading-none">⭐</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Question Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Representation */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2.5 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
                Question {currentIndex + 1} of {questions.length} • {currentLevel}
              </span>
              <span className="text-slate-500 font-medium">
                Type: <strong className="text-slate-800">{reprLabel}</strong>
              </span>
            </div>

            <p className="text-sm font-medium text-slate-900 mb-4 leading-relaxed">
              {currentQ.stem}
            </p>

            {/* Dynamic Generated Visual Representation */}
            <div className="relative bg-slate-50 rounded border border-slate-200 p-3 flex flex-col items-center justify-center min-h-[230px]">
              <BalancedForcesVisuals question={currentQ} />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono font-medium capitalize shadow-2xs">
                Motion: {currentQ.motionDirection}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous question"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="font-mono text-slate-700 text-xs flex items-center gap-1.5">
              <span>{formatQuestionId(currentQ.id)}</span>
              {completedQuestions[currentQ.id] ? (
                <span className="text-amber-600 font-bold">⭐ Mastered</span>
              ) : (
                <span className="text-slate-600 font-medium">(Unmastered)</span>
              )}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              aria-label="Next question"
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
            <div className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              1. What is the state of motion?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Speeding Up', 'Slowing Down', 'Constant Speed'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedMotion(opt)}
                  disabled={isSubmitted}
                  aria-pressed={selectedMotion === opt}
                  aria-label={`Motion state option: ${opt}`}
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
            <div className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              2. Are the forces balanced or unbalanced?
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Balanced', 'Unbalanced'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isSubmitted && setSelectedForce(opt)}
                  disabled={isSubmitted}
                  aria-pressed={selectedForce === opt}
                  aria-label={`Force state option: ${opt} Forces`}
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
                  <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <XCircle className="w-4 h-4" />
                      <span>Not quite — Try Again!</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      Analyze the force balance and direction of motion:
                    </p>
                    <ul className="list-disc pl-4 text-slate-600 text-[11px] space-y-0.5">
                      <li>If forces cancel out (<span className="font-serif italic">F</span><sub className="font-sans font-bold">net</sub> = 0), velocity is <strong>constant</strong> (Newton's 1st Law).</li>
                      <li>If an unbalanced net force aligns with motion, it <strong>speeds up</strong>; if opposing motion, it <strong>slows down</strong>.</li>
                    </ul>
                  </div>
                )}

                {/* Gated Action Buttons */}
                {!isCorrect ? (
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setIsCorrect(false)
                      setSelectedMotion(null)
                      setSelectedForce(null)
                    }}
                    className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Try Again</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : isLevelMastered ? (
                      currentLevel === 'Apprentice' ? (
                        <button
                          onClick={() => handleLevelChange('Master')}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center justify-center gap-2 transition-colors shadow-md animate-pulse"
                        >
                          <span>Level Mastered! Proceed to Master Level (14)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : currentLevel === 'Master' ? (
                        <button
                          onClick={() => handleLevelChange('Wizard')}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center justify-center gap-2 transition-colors shadow-md animate-pulse"
                        >
                          <span>Level Mastered! Proceed to Wizard Level (20)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleShuffle}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                        >
                          <span>🏆 Grandmaster Complete! Shuffle & Practice Again</span>
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 text-center font-medium">
                          You completed Question {questions.length}, but have {completedInLevel} of {masteryGoal} stars needed for mastery.
                        </div>
                        {firstUnmasteredIndex >= 0 && (
                          <button
                            onClick={() => setCurrentIndex(firstUnmasteredIndex)}
                            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <span>Jump to Unmastered Question (Q{firstUnmasteredIndex + 1})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
        label={`${formatQuestionId(currentQ.id)} Motion Model`}
        forces={simForces}
        isSubmitted={isSubmitted}
        motionDirection={currentQ?.motionDirection}
      />
    </div>
  )
}
