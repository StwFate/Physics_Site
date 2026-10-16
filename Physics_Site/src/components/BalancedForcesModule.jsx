import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Shuffle,
  Star
} from 'lucide-react'
import confetti from 'canvas-confetti'
import PhysicsVisualizer from './PhysicsVisualizer'
import BalancedForcesVisuals from './BalancedForcesVisuals'
import { generateBalancedQuestions } from '../utils/balancedForcesGenerator'
import { resolveQuestionVisual } from '../utils/motionVisuals'
import { getStudentSeed, shuffleWithSeed, incrementStudentSeed } from '../utils/studentSeed'
import { backupUserProgress } from '../utils/authService'

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
  const [autoPlayKey, setAutoPlayKey] = useState(0)
  const simRef = useRef(null)
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('physix_balanced_completed')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [savedAnswers, setSavedAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('physix_balanced_answers')
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

  useEffect(() => {
    const reload = () => {
      try {
        const b = JSON.parse(localStorage.getItem('physix_balanced_completed') || '{}')
        const ans = JSON.parse(localStorage.getItem('physix_balanced_answers') || '{}')
        let changed = false
        Object.entries(ans).forEach(([id, a]) => {
          if (a && (a.isCorrect || a.isSubmitted) && !b[id]) {
            b[id] = true
            changed = true
          }
        })
        if (changed) {
          localStorage.setItem('physix_balanced_completed', JSON.stringify(b))
        }
        setCompletedQuestions(b)
        setSavedAnswers(ans)
      } catch {}
    }
    reload()
    setSeed(getStudentSeed(currentUser?.uid))
    window.addEventListener('physix_progress_updated', reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener('physix_progress_updated', reload)
      window.removeEventListener('storage', reload)
    }
  }, [currentUser?.uid])

  useEffect(() => {
    const qId = currentQ?.id
    const isCompleted = !!completedQuestions[qId]
    const saved = savedAnswers[qId]

    if (saved && saved.isSubmitted) {
      setSelectedMotion(saved.selectedMotion || null)
      setSelectedForce(saved.selectedForce || null)
      setIsSubmitted(true)
      setIsCorrect(saved.isCorrect ?? isCompleted)
    } else if (isCompleted) {
      // Previously completed question: prefill correct answers for review
      setSelectedMotion(currentQ?.motionAnswer || null)
      setSelectedForce(currentQ?.forceAnswer || null)
      setIsSubmitted(true)
      setIsCorrect(true)
    } else {
      setSelectedMotion(null)
      setSelectedForce(null)
      setIsSubmitted(false)
      setIsCorrect(false)
    }
  }, [currentIndex, currentLevel, seed, currentQ?.id, completedQuestions, savedAnswers])

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

    const correctMotion = currentQ.motionAnswer || ''
    const correctForce = currentQ.forceAnswer || ''

    const motionMatch = selectedMotion.toLowerCase() === correctMotion.toLowerCase()
    const forceMatch =
      selectedForce.toLowerCase() === correctForce.toLowerCase() ||
      selectedForce.toLowerCase().startsWith(correctForce.toLowerCase())

    const correct = motionMatch && forceMatch
    setIsCorrect(correct)
    setIsSubmitted(true)

    if (correct) {
      // Auto-run the simulation and bring it into view
      setAutoPlayKey((k) => k + 1)
      setTimeout(() => {
        simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 120)

      const newCompleted = { ...completedQuestions, [currentQ.id]: true }
      setCompletedQuestions(newCompleted)
      localStorage.setItem('physix_balanced_completed', JSON.stringify(newCompleted))

      // Persist student's answered choices so they can review how they solved it
      const newAnswers = {
        ...savedAnswers,
        [currentQ.id]: {
          selectedMotion,
          selectedForce,
          isSubmitted: true,
          isCorrect: true
        }
      }
      setSavedAnswers(newAnswers)
      localStorage.setItem('physix_balanced_answers', JSON.stringify(newAnswers))

      if (currentUser?.uid) {
        backupUserProgress(currentUser.uid)
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('physix_progress_updated'))
      }

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

  const getHeadline = () => {
    if (currentQ?.representationType === 'position_time_graph' || currentQ?.representationType === 'velocity_time_graph') {
      return 'Read the graph.'
    }
    if (currentQ?.representationType === 'dot_diagram') {
      return 'Read the motion dots.'
    }
    if (currentQ?.representationType === 'kinematic_table') {
      return 'Read the table.'
    }
    return 'Read the forces.'
  }

  const cleanStem = currentQ?.stem || 'A cargo trunk is moving to the right. Each arrow shows a force; its length shows the magnitude.'

  return (
    <div className="space-y-3">
      {/* Level Selector & Mastery Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Level Switcher Pills */}
        <div className="flex items-center gap-2">
          {['Apprentice', 'Master', 'Wizard'].map((lvl) => {
            const count = LEVEL_COUNTS[lvl] || 0
            const isActive = currentLevel === lvl
            return (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'border border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border border-slate-200 text-slate-800 bg-white hover:bg-slate-50'
                }`}
              >
                {lvl} ({count})
              </button>
            )
          })}
        </div>

        {/* Right side controls: Mastered count, Progress bar, Shuffle */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-medium">
            {completedInLevel} / {masteryGoal} mastered
          </span>
          <div
            className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden"
            title={`${completedInLevel} / ${masteryGoal} mastered`}
          >
            <div
              className={`h-full transition-all duration-300 ${
                isLevelMastered ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.min(100, (completedInLevel / masteryGoal) * 100)}%`
              }}
            ></div>
          </div>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer ml-1"
            title="Generate new randomized variations"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600" />
            <span>Shuffle</span>
          </button>
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
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Proceed to Master Level (14)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {currentLevel === 'Master' && (
            <button
              onClick={() => handleLevelChange('Wizard')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Proceed to Wizard Level (20)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {currentLevel === 'Wizard' && (
            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>🏆 Grandmaster Replay (Shuffle Pool)</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Question Number Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none w-full">
        {questions.map((q, idx) => {
          const num = String(idx + 1).padStart(2, '0')
          const isCurrent = currentIndex === idx
          const isMastered = !!completedQuestions[q.id]
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`min-w-9 h-8 px-2 flex items-center justify-center rounded text-xs transition-all shrink-0 cursor-pointer ${
                isMastered
                  ? isCurrent
                    ? 'border-2 border-amber-400 bg-amber-50/90 text-amber-950 font-bold ring-1 ring-amber-300 shadow-xs'
                    : 'border-2 border-amber-300/90 bg-amber-50/50 text-amber-900 font-semibold hover:bg-amber-100/70 hover:border-amber-400 shadow-2xs'
                  : isCurrent
                  ? 'border-2 border-blue-600 text-blue-600 font-bold bg-white'
                  : 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium'
              }`}
              title={`Question ${num} ${isMastered ? '(Completed ⭐)' : ''}`}
            >
              {num}
            </button>
          )
        })}
      </div>

      {/* Main Question Workspace Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Eyebrow, Headline, Subtitle, Canvas, Nav Buttons */}
          <div className="lg:col-span-6 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
                  QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                </span>
                {completedQuestions[currentQ?.id] && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                    Completed
                  </span>
                )}
              </div>
              <h2 className="text-2xl xl:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {getHeadline()}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                {cleanStem}
              </p>

              {/* Dynamic Force Diagram Canvas */}
              <div className="flex-1 flex items-center justify-center my-1">
                <BalancedForcesVisuals question={currentQ} />
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50/50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Right Column: Make your prediction, Q1, Divider, Q2, Check answer */}
          <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                Make your prediction.
              </h2>

              <div className="space-y-3">
                {/* Q1: State of motion */}
                <div className="space-y-3">
                  <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <span className="text-blue-600 font-extrabold mr-2">01</span>
                    <span>What is the state of motion?</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Speeding up', val: 'Speeding Up' },
                      { label: 'Slowing down', val: 'Slowing Down' },
                      { label: 'Constant speed', val: 'Constant Speed' }
                    ].map(({ label, val }) => {
                      const isSelected = selectedMotion === val
                      return (
                        <div
                          key={val}
                          onClick={() => !isSubmitted && setSelectedMotion(val)}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/30'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-3.5 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-blue-600 bg-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Horizontal Divider */}
                <div className="border-t border-slate-200 my-2"></div>

                {/* Q2: Balanced or Unbalanced */}
                <div className="space-y-3">
                  <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center">
                    <span className="text-blue-600 font-extrabold mr-2">02</span>
                    <span>Are the forces balanced?</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Balanced forces', val: 'Balanced' },
                      { label: 'Unbalanced forces', val: 'Unbalanced' }
                    ].map(({ label, val }) => {
                      const isSelected = selectedForce === val
                      return (
                        <div
                          key={val}
                          onClick={() => !isSubmitted && setSelectedForce(val)}
                          className={`flex items-center px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/30'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-3.5 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-blue-600 bg-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Check answer & Feedback */}
            <div className="mt-3">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedMotion || !selectedForce}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    !selectedMotion || !selectedForce
                      ? 'bg-[#BCC5D3] text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm'
                  }`}
                >
                  <span>Check answer →</span>
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in">
                  {isCorrect ? (
                    <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct! Star Earned ⭐</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">{currentQ.explanation}</p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 text-sm">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Not quite — Try Again!</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        Analyze the force balance and direction of motion:
                      </p>
                      <ul className="list-disc pl-4 text-slate-600 text-xs space-y-0.5">
                        <li>
                          If forces cancel out (<span className="font-serif italic font-bold">F</span><sub className="font-sans font-bold text-[10px]">net</sub> = 0), velocity is <strong>constant</strong> (Newton's 1st Law).
                        </li>
                        <li>
                          If an unbalanced net force aligns with motion, it <strong>speeds up</strong>; if opposing motion, it <strong>slows down</strong>.
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Actions after submission */}
                  {!isCorrect ? (
                    <button
                      onClick={() => {
                        setIsSubmitted(false)
                        setIsCorrect(false)
                        setSelectedMotion(null)
                        setSelectedForce(null)
                      }}
                      className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Try Again</span>
                    </button>
                  ) : (
                    <div>
                      {currentIndex < questions.length - 1 ? (
                        <button
                          onClick={handleNext}
                          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <span>Next Question →</span>
                        </button>
                      ) : isLevelMastered ? (
                        currentLevel === 'Apprentice' ? (
                          <button
                            onClick={() => handleLevelChange('Master')}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-md animate-pulse cursor-pointer"
                          >
                            <span>Level Mastered! Proceed to Master Level (14) →</span>
                          </button>
                        ) : currentLevel === 'Master' ? (
                          <button
                            onClick={() => handleLevelChange('Wizard')}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-md animate-pulse cursor-pointer"
                          >
                            <span>Level Mastered! Proceed to Wizard Level (20) →</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleShuffle}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
                          >
                            <span>🏆 Grandmaster Complete! Shuffle & Practice Again</span>
                          </button>
                        )
                      ) : null}

                      {isCorrect && (
                        <button
                          onClick={() => {
                            setIsSubmitted(false)
                            setIsCorrect(false)
                            setSelectedMotion(null)
                            setSelectedForce(null)
                            const nextAnswers = { ...savedAnswers }
                            delete nextAnswers[currentQ.id]
                            setSavedAnswers(nextAnswers)
                            localStorage.setItem('physix_balanced_answers', JSON.stringify(nextAnswers))
                          }}
                          className="w-full mt-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors cursor-pointer text-center"
                        >
                          Practice this question again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Physics Simulation - Only visible after correctly answering */}
      {isCorrect && (
        <div ref={simRef} className="scroll-mb-4 animate-in fade-in duration-300">
          <PhysicsVisualizer
            fNet={fNet}
            mass={(simForces.find(f => /grav/i.test(f.name))?.value || 98) / 9.8}
            initialVelocity={initialV}
            label={`${currentQ?.id ? currentQ.id.charAt(0).toUpperCase() + currentQ.id.slice(1) : ''} Motion Model`}
            forces={simForces}
            isSubmitted={isSubmitted}
            motionDirection={currentQ?.motionDirection}
            autoPlayKey={autoPlayKey}
            objectLabel={currentQ ? resolveQuestionVisual(currentQ).title : 'Object'}
            visual={currentQ ? resolveQuestionVisual(currentQ) : undefined}
            stopAtRest={simForces.filter(f => f.dir === 'left' || f.dir === 'right').every(f => /frict|drag|air/i.test(f.name))}
          />
        </div>
      )}
    </div>
  )
}
