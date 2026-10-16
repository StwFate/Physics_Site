import React, { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import ForceSymbol from './ForceSymbol'

export default function PhysicsVisualizer({
  fNet = 0,
  mass = 10,
  initialVelocity = 0,
  label = 'Object Motion Simulation',
  forces = [],
  isSubmitted = false,
  motionDirection = 'rightward',
  autoPlayKey = 0
}) {
  const formattedLabel = label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(50)
  const [runId, setRunId] = useState(0)

  const isVertical =
    motionDirection === 'up' ||
    motionDirection === 'upward' ||
    motionDirection === 'down' ||
    motionDirection === 'downward'

  const getDirectedVelocity = (v, dir) => {
    const isNeg = dir === 'left' || dir === 'leftward' || dir === 'negative' || dir === 'down' || dir === 'downward'
    const isPos = dir === 'right' || dir === 'rightward' || dir === 'positive' || dir === 'up' || dir === 'upward'
    if (isNeg && v > 0) return -v
    if (isPos && v < 0) return -v
    return v
  }

  const effectiveInitialVelocity = getDirectedVelocity(initialVelocity, motionDirection)
  const [velocity, setVelocity] = useState(effectiveInitialVelocity)
  const animFrameRef = useRef(null)
  const stateRef = useRef({ pos: 50, vel: effectiveInitialVelocity })

  const accel = mass > 0 ? fNet / mass : 0

  const getInitialPosition = () => {
    if (isVertical) {
      return effectiveInitialVelocity > 0 ? 25 : 75
    }
    return effectiveInitialVelocity > 0 ? 18 : 82
  }

  useEffect(() => {
    const initPos = getInitialPosition()
    stateRef.current = { pos: initPos, vel: effectiveInitialVelocity }
    setPosition(initPos)
    setVelocity(effectiveInitialVelocity)
  }, [effectiveInitialVelocity, fNet, mass, isVertical])

  useEffect(() => {
    if (!isSubmitted) {
      setIsPlaying(false)
      const initPos = getInitialPosition()
      stateRef.current = { pos: initPos, vel: effectiveInitialVelocity }
      setPosition(initPos)
      setVelocity(effectiveInitialVelocity)
    }
  }, [isSubmitted, effectiveInitialVelocity, isVertical])

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    let lastTime = performance.now()

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.08)
      lastTime = time

      // Update velocity continuously according to Fnet = ma
      let curVel = stateRef.current.vel + accel * dt

      // Clamp velocity to a fun, readable maximum
      const MAX_SPEED = 14
      if (curVel > MAX_SPEED) curVel = MAX_SPEED
      if (curVel < -MAX_SPEED) curVel = -MAX_SPEED

      let curPos = stateRef.current.pos + curVel * dt * 8

      // Continuous motion loop without stopping at zero velocity
      if (isVertical) {
        // Vertical shaft: elevator, rocket, projectile
        if (curPos > 82) {
          curPos = 82
          if (curVel > 0) curVel = -Math.abs(curVel) * 0.85
        } else if (curPos < 18) {
          curPos = 18
          if (curVel < 0) curVel = Math.abs(curVel) * 0.85
        }
      } else {
        // Horizontal track: cart, crate, puck
        if (curPos > 92) {
          if (accel === 0 || curVel > 0) {
            curPos = 8 // wrap around for continuous glide
          } else {
            curPos = 92
            curVel = -Math.abs(curVel) * 0.85
          }
        } else if (curPos < 8) {
          if (accel === 0 || curVel < 0) {
            curPos = 92 // wrap around for continuous glide
          } else {
            curPos = 8
            curVel = Math.abs(curVel) * 0.85
          }
        }
      }

      stateRef.current.pos = curPos
      stateRef.current.vel = curVel
      setPosition(curPos)
      setVelocity(curVel)

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, accel, runId, isVertical])

  // Reset to the starting state and run the simulation continuously from the beginning
  const startSimulation = () => {
    const initPos = getInitialPosition()
    stateRef.current = { pos: initPos, vel: effectiveInitialVelocity }
    setPosition(initPos)
    setVelocity(effectiveInitialVelocity)
    setRunId((id) => id + 1)
    setIsPlaying(true)
  }

  // Auto-run when the parent signals (e.g. after a correct answer)
  useEffect(() => {
    if (autoPlayKey > 0 && isSubmitted) startSimulation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayKey])
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-xs">
      {/* Simulation Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-extrabold text-base text-slate-900 tracking-tight">
          Motion model
        </span>
        <div className="flex items-center gap-6 text-sm text-slate-800 font-medium">
          <span>
            a: <strong className="font-semibold text-slate-900">{isSubmitted ? `${accel.toFixed(2)} m/s²` : '—'}</strong>
          </span>
          <span>
            v: <strong className="font-semibold text-slate-900">{isSubmitted ? `${velocity.toFixed(1)} m/s` : '—'}</strong>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="font-serif italic font-bold">F</span><sub className="font-sans font-bold text-xs">net</sub>:{' '}
            <strong className="font-semibold text-slate-900 ml-1">
              {isSubmitted ? `${fNet.toFixed(1)} N` : '—'}
            </strong>
          </span>
        </div>
      </div>

      {isVertical ? (
        /* Vertical Motion Track (Elevator / Payload / Rocket) */
        <div className="relative h-56 sm:h-64 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
          {/* Vertical Height Scale on Left */}
          <div className="absolute left-3 inset-y-3 flex flex-col justify-between text-[10px] text-slate-700 font-semibold font-mono select-none border-r border-slate-300 pr-2.5">
            <span>100m</span>
            <span>75m</span>
            <span>50m</span>
            <span>25m</span>
            <span>0m</span>
          </div>

          {/* Vertical Guide Track */}
          <div className="w-16 h-full border-x border-slate-200 bg-slate-100/50 relative">
            {/* The Vertical Object */}
            <div
              className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75 flex flex-col items-center"
              style={{ bottom: `${position}%` }}
            >
              {/* Upward force vector */}
              {isSubmitted && forces
                .filter((f) => f.dir === 'up')
                .map((f, i) => (
                  <div
                    key={i}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center pb-1 pointer-events-none"
                  >
                    <ForceSymbol
                      code={f.name || 'Ftens'}
                      className="text-[11px] text-blue-600 mb-0.5"
                    />
                    <div
                      className="w-0.5 bg-blue-600 relative"
                      style={{
                        height: `${Math.min(Math.max(f.value * 0.7, 15), 45)}px`
                      }}
                    >
                      <div className="absolute -top-1 -left-1 border-b-4 border-l-4 border-r-4 border-transparent border-b-blue-600"></div>
                    </div>
                  </div>
                ))}

              {/* Capsule Body */}
              <div className="w-11 h-8 bg-slate-800 rounded border border-slate-900 shadow-sm flex items-center justify-center text-[10px] font-bold text-white">
                {mass}kg
              </div>

              {/* Downward force vector */}
              {isSubmitted && forces
                .filter((f) => f.dir === 'down')
                .map((f, i) => (
                  <div
                    key={i}
                    className="absolute top-full left-1/2 -translate-x-1/2 flex items-center pt-1 pointer-events-none"
                  >
                    <div
                      className="w-0.5 bg-rose-600 relative"
                      style={{
                        height: `${Math.min(Math.max(f.value * 0.7, 15), 45)}px`
                      }}
                    >
                      <div className="absolute -bottom-1 -left-1 border-t-4 border-l-4 border-r-4 border-transparent border-t-rose-600"></div>
                    </div>
                    <ForceSymbol
                      code="Fgrav"
                      sub="g"
                      className="text-[11px] text-rose-600 ml-1.5 font-bold"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        /* Horizontal Motion Track (Carts / Crates) */
        <div className="relative h-28 sm:h-32 bg-white overflow-hidden flex flex-col justify-end my-1 select-none">
          {/* Ground Track Line */}
          <div className="absolute inset-x-0 bottom-6 h-[1.5px] bg-slate-400"></div>

          {/* Tick marks on ground line */}
          <div className="absolute inset-x-0 bottom-6 pointer-events-none">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="absolute top-0 w-px h-2 bg-slate-400 -translate-x-1/2"
                style={{ left: `${tick}%` }}
              ></div>
            ))}
          </div>

          {/* Metric labels below ticks */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none text-[11px] text-slate-600 font-medium">
            <span className="absolute left-0">0 m</span>
            <span className="absolute left-1/4 -translate-x-1/2">25 m</span>
            <span className="absolute left-1/2 -translate-x-1/2">50 m</span>
            <span className="absolute left-3/4 -translate-x-1/2">75 m</span>
            <span className="absolute right-0">100 m</span>
          </div>

          {/* The Cart Object */}
          <div
            className="absolute bottom-6 -translate-x-1/2 transition-transform duration-75 flex flex-col items-center pointer-events-none"
            style={{ left: `${position}%` }}
          >
            {/* Upward force vector (e.g. Normal Force FN) */}
            {isSubmitted && forces
              .filter((f) => f.dir === 'up')
              .map((f, i) => (
                <div
                  key={i}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center pb-1 pointer-events-none"
                >
                  <ForceSymbol
                    code="Fnorm"
                    sub="N"
                    className="text-[11px] text-blue-600 mb-0.5 font-bold"
                  />
                  <div
                    className="w-0.5 bg-blue-600 relative"
                    style={{
                      height: `${Math.min(Math.max(f.value * 0.7, 15), 35)}px`
                    }}
                  >
                    <div className="absolute -top-1 -left-1 border-b-4 border-l-4 border-r-4 border-transparent border-b-blue-600"></div>
                  </div>
                </div>
              ))}

            <div className="relative flex items-center justify-center">
              {/* Sleek Royal Blue Cart Body */}
              <div className="w-14 h-6 bg-[#0052FF] rounded-md shadow-xs flex items-center justify-center text-xs font-bold text-white">
                {mass} kg
              </div>

              {/* Left force arrow */}
              {isSubmitted && forces
                .filter((f) => f.dir === 'left')
                .map((f, i) => (
                  <div
                    key={i}
                    className="absolute right-full top-1/2 -translate-y-1/2 flex items-center pr-1 pointer-events-none"
                  >
                    <ForceSymbol
                      code={f.name}
                      className="text-[11px] text-blue-600 mr-1"
                    />
                    <div
                      className="h-0.5 bg-blue-600 relative"
                      style={{
                        width: `${Math.min(Math.max(f.value * 0.8, 15), 55)}px`
                      }}
                    >
                      <div className="absolute left-0 -top-1 border-t-4 border-r-4 border-b-4 border-transparent border-r-blue-600"></div>
                    </div>
                  </div>
                ))}

              {/* Right force arrow */}
              {isSubmitted && forces
                .filter((f) => f.dir === 'right')
                .map((f, i) => (
                  <div
                    key={i}
                    className="absolute left-full top-1/2 -translate-y-1/2 flex items-center pl-1 pointer-events-none"
                  >
                    <div
                      className="h-0.5 bg-blue-600 relative"
                      style={{
                        width: `${Math.min(Math.max(f.value * 0.8, 15), 55)}px`
                      }}
                    >
                      <div className="absolute right-0 -top-1 border-t-4 border-l-4 border-b-4 border-transparent border-l-blue-600"></div>
                    </div>
                    <ForceSymbol
                      code={f.name}
                      className="text-[11px] text-blue-600 ml-1"
                    />
                  </div>
                ))}
            </div>

            {/* Cart Wheels directly rolling on the track line */}
            <div className="flex gap-7 -mt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-950"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-950"></div>
            </div>

            {/* Downward force vector (e.g. Gravity Fg) */}
            {isSubmitted && forces
              .filter((f) => f.dir === 'down')
              .map((f, i) => (
                <div
                  key={i}
                  className="absolute top-full left-1/2 -translate-x-1/2 flex items-center pt-0.5 pointer-events-none z-10"
                >
                  <div
                    className="w-0.5 bg-blue-600 relative"
                    style={{
                      height: `${Math.min(Math.max(f.value * 0.7, 15), 24)}px`
                    }}
                  >
                    <div className="absolute -bottom-1 -left-1 border-t-4 border-l-4 border-r-4 border-transparent border-t-blue-600"></div>
                  </div>
                  <ForceSymbol
                    code="Fgrav"
                    sub="g"
                    className="text-[12px] text-blue-600 ml-1.5 font-bold"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Controls and Feedback */}
      <div className="flex items-center justify-between mt-3 pt-2">
        <p className="text-xs text-slate-600 font-normal">
          {isSubmitted ? (
            fNet === 0 ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                ✓ Forces are balanced (<span className="font-serif italic font-bold">F</span><sub className="font-sans font-bold text-xs">net</sub> = 0). Constant velocity.
              </span>
            ) : (
              <span className="text-amber-800 font-semibold inline-flex items-center gap-1">
                ⚠ Forces are unbalanced (<span className="font-serif italic font-bold">F</span><sub className="font-sans font-bold text-xs">net</sub> ≠ 0). Acceleration occurs.
              </span>
            )
          ) : (
            <span>Check your answer to unlock the simulation.</span>
          )}
        </p>
        <button
          onClick={() => isSubmitted && startSimulation()}
          disabled={!isSubmitted}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            isSubmitted
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer shadow-2xs'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
          title={isSubmitted ? 'Simulate (restarts from the beginning)' : 'Submit your answer above to enable simulation'}
          aria-label="Run motion simulation from the beginning"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simulate</span>
        </button>
      </div>
    </div>
  )
}
