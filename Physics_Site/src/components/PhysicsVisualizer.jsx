import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import ForceSymbol from './ForceSymbol'

export default function PhysicsVisualizer({
  fNet = 0,
  mass = 10,
  initialVelocity = 0,
  label = 'Object Motion Simulation',
  forces = [],
  isSubmitted = false,
  motionDirection = 'rightward'
}) {
  const formattedLabel = label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(50)

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

  useEffect(() => {
    stateRef.current = { pos: 50, vel: effectiveInitialVelocity }
    setPosition(50)
    setVelocity(effectiveInitialVelocity)
  }, [effectiveInitialVelocity, fNet, mass])

  useEffect(() => {
    if (!isSubmitted) {
      setIsPlaying(false)
      stateRef.current = { pos: 50, vel: effectiveInitialVelocity }
      setPosition(50)
      setVelocity(effectiveInitialVelocity)
    }
  }, [isSubmitted, effectiveInitialVelocity])

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    let lastTime = performance.now()

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      let curVel = stateRef.current.vel + accel * dt

      // If decelerating under opposing net force, come to a natural stop at 0
      if ((stateRef.current.vel > 0 && curVel < 0) || (stateRef.current.vel < 0 && curVel > 0)) {
        curVel = 0
        stateRef.current.vel = 0
        setVelocity(0)
        setIsPlaying(false)
        return
      }

      let curPos = stateRef.current.pos + curVel * dt * 8

      // Natural boundary loop/wrap-around
      if (curPos > 90) {
        curPos = 12
      } else if (curPos < 10) {
        curPos = 88
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
  }, [isPlaying, accel])

  const handleReset = () => {
    setIsPlaying(false)
    stateRef.current = { pos: 50, vel: effectiveInitialVelocity }
    setPosition(50)
    setVelocity(effectiveInitialVelocity)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          {formattedLabel} ({isVertical ? 'Vertical Motion Model' : 'Horizontal Track Model'})
        </span>
        <div className="flex items-center gap-3 font-mono text-slate-600">
          <span>
            a:{' '}
            {isSubmitted ? (
              <strong className={accel !== 0 ? 'text-blue-700' : 'text-emerald-700'}>
                {accel.toFixed(2)} m/s²
              </strong>
            ) : (
              <span className="text-slate-400 font-bold">?</span>
            )}
          </span>
          <span>
            v:{' '}
            <strong className="text-slate-800">
              {isSubmitted ? `${velocity.toFixed(1)} m/s` : '?'}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <ForceSymbol type="Fnet" />:{' '}
            {isSubmitted ? (
              <strong className={fNet !== 0 ? 'text-rose-700' : 'text-emerald-700'}>
                {fNet.toFixed(1)} N
              </strong>
            ) : (
              <span className="text-slate-400 font-bold">?</span>
            )}
          </span>
        </div>
      </div>

      {isVertical ? (
        /* Vertical Motion Track (Elevator / Payload / Rocket) */
        <div className="relative h-36 bg-slate-50 rounded border border-slate-200 overflow-hidden flex items-center justify-center">
          {/* Vertical Height Scale on Left */}
          <div className="absolute left-3 inset-y-2 flex flex-col justify-between text-[10px] text-slate-400 font-mono select-none border-r border-slate-200 pr-2">
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
                    className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center pt-1 pointer-events-none"
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
                      code={f.name || 'Fgrav'}
                      className="text-[11px] text-rose-600 mt-0.5"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        /* Horizontal Motion Track (Carts / Crates) */
        <div className="relative h-36 bg-slate-50 rounded border border-slate-200 overflow-hidden flex flex-col justify-end">
          {/* Ground Track Line */}
          <div className="absolute inset-x-0 bottom-9 h-0.5 bg-slate-300"></div>

          {/* Tick marks */}
          <div className="absolute inset-x-0 bottom-0 h-5 border-t border-slate-200 flex justify-between px-4 text-[10px] text-slate-400 font-mono select-none">
            <span>0m</span>
            <span>25m</span>
            <span>50m</span>
            <span>75m</span>
            <span>100m</span>
          </div>

          {/* The Cart Object */}
          <div
            className="absolute bottom-9 -translate-x-1/2 transition-transform duration-75 flex flex-col items-center"
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
                    code={f.name || 'Fnorm'}
                    className="text-[11px] text-blue-600 mb-0.5"
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

            <div className="relative w-14 h-10 flex items-center justify-center">
              {/* Box Body */}
              <div className="w-12 h-8 bg-slate-800 rounded border border-slate-900 shadow-sm flex items-center justify-center text-[11px] font-bold text-white">
                {mass}kg
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
                      className="text-[11px] text-rose-600 mr-1"
                    />
                    <div
                      className="h-0.5 bg-rose-600 relative"
                      style={{
                        width: `${Math.min(Math.max(f.value * 0.8, 15), 55)}px`
                      }}
                    >
                      <div className="absolute left-0 -top-1 border-t-4 border-r-4 border-b-4 border-transparent border-r-rose-600"></div>
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

            {/* Cart Wheels */}
            <div className="flex gap-5 -mt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600"></div>
            </div>

            {/* Downward force vector (e.g. Gravity Fg) */}
            {isSubmitted && forces
              .filter((f) => f.dir === 'down')
              .map((f, i) => (
                <div
                  key={i}
                  className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center pt-0.5 pointer-events-none z-10"
                >
                  <div
                    className="w-0.5 bg-rose-600 relative"
                    style={{
                      height: `${Math.min(Math.max(f.value * 0.7, 15), 24)}px`
                    }}
                  >
                    <div className="absolute -bottom-1 -left-1 border-t-4 border-l-4 border-r-4 border-transparent border-t-rose-600"></div>
                  </div>
                  <ForceSymbol
                    code={f.name || 'Fgrav'}
                    className="text-[11px] text-rose-600 mt-0.5"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-xs text-slate-600">
          {isSubmitted ? (
            fNet === 0 ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                ✓ Forces are balanced (<ForceSymbol type="Fnet" /> = 0). Constant velocity.
              </span>
            ) : (
              <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                ⚠ Forces are unbalanced (<ForceSymbol type="Fnet" /> ≠ 0). Acceleration occurs.
              </span>
            )
          ) : (
            <span className="text-slate-400 italic">
              Submit your answer above to evaluate forces and run simulation.
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => isSubmitted && setIsPlaying(!isPlaying)}
            disabled={!isSubmitted}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              isSubmitted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer'
                : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title={isSubmitted ? (isPlaying ? 'Pause' : 'Simulate') : 'Submit your answer above to enable simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Simulate'}
          </button>
          <button
            onClick={handleReset}
            disabled={!isSubmitted}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              isSubmitted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer'
                : 'bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
