import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import ForceSymbol from './ForceSymbol'

export default function PhysicsVisualizer({
  fNet = 0,
  mass = 10,
  initialVelocity = 0,
  label = 'Object Motion Simulation',
  forces = []
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(50)
  const [velocity, setVelocity] = useState(initialVelocity)
  const animFrameRef = useRef(null)
  const stateRef = useRef({ pos: 50, vel: initialVelocity })

  const accel = mass > 0 ? fNet / mass : 0

  useEffect(() => {
    stateRef.current = { pos: 50, vel: initialVelocity }
    setPosition(50)
    setVelocity(initialVelocity)
  }, [initialVelocity, fNet, mass])

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    let lastTime = performance.now()

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      const curVel = stateRef.current.vel + accel * dt
      let curPos = stateRef.current.pos + (curVel * dt * 8)

      if (curPos > 90) {
        curPos = 90
        stateRef.current.vel = -Math.abs(curVel) * 0.5
      } else if (curPos < 10) {
        curPos = 10
        stateRef.current.vel = Math.abs(curVel) * 0.5
      } else {
        stateRef.current.vel = curVel
      }

      stateRef.current.pos = curPos
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
    stateRef.current = { pos: 50, vel: initialVelocity }
    setPosition(50)
    setVelocity(initialVelocity)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          {label}
        </span>
        <div className="flex items-center gap-3 font-mono text-slate-600">
          <span>a: <strong className={accel !== 0 ? 'text-blue-700' : 'text-emerald-700'}>{accel.toFixed(2)} m/s²</strong></span>
          <span>v: <strong className="text-slate-800">{velocity.toFixed(1)} m/s</strong></span>
          <span className="flex items-center gap-1">
            <ForceSymbol type="Fnet" />: <strong className={fNet !== 0 ? 'text-rose-700' : 'text-emerald-700'}>{fNet.toFixed(1)} N</strong>
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-24 bg-slate-50 rounded border border-slate-200 overflow-hidden flex items-end">
        {/* Tick marks */}
        <div className="absolute inset-x-0 bottom-0 h-4 border-t border-slate-200 flex justify-between px-4 text-[10px] text-slate-400 font-mono select-none">
          <span>0m</span>
          <span>25m</span>
          <span>50m</span>
          <span>75m</span>
          <span>100m</span>
        </div>

        {/* The Cart Object */}
        <div
          className="absolute bottom-4 -translate-x-1/2 transition-transform duration-75 flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="relative w-14 h-10 flex items-center justify-center">
            {/* Box Body */}
            <div className="w-12 h-8 bg-slate-800 rounded border border-slate-900 shadow-sm flex items-center justify-center text-[11px] font-bold text-white">
              {mass}kg
            </div>

            {/* Left force arrow */}
            {forces.filter(f => f.dir === 'left').map((f, i) => (
              <div key={i} className="absolute right-full top-1/2 -translate-y-1/2 flex items-center pr-1 pointer-events-none">
                {f.name.startsWith('F_') ? (
                  <ForceSymbol sub={f.name.replace('F_', '')} className="text-[11px] text-rose-600 mr-1" />
                ) : (
                  <span className="text-[10px] text-rose-600 font-mono font-bold mr-1">{f.name}</span>
                )}
                <div className="h-0.5 bg-rose-600 relative" style={{ width: `${Math.min(Math.max(f.value * 0.8, 15), 55)}px` }}>
                  <div className="absolute left-0 -top-1 border-t-4 border-r-4 border-b-4 border-transparent border-r-rose-600"></div>
                </div>
              </div>
            ))}

            {/* Right force arrow */}
            {forces.filter(f => f.dir === 'right').map((f, i) => (
              <div key={i} className="absolute left-full top-1/2 -translate-y-1/2 flex items-center pl-1 pointer-events-none">
                <div className="h-0.5 bg-blue-600 relative" style={{ width: `${Math.min(Math.max(f.value * 0.8, 15), 55)}px` }}>
                  <div className="absolute right-0 -top-1 border-t-4 border-l-4 border-b-4 border-transparent border-l-blue-600"></div>
                </div>
                {f.name.startsWith('F_') ? (
                  <ForceSymbol sub={f.name.replace('F_', '')} className="text-[11px] text-blue-600 ml-1" />
                ) : (
                  <span className="text-[10px] text-blue-600 font-mono font-bold ml-1">{f.name}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cart Wheels */}
          <div className="flex gap-5 -mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-xs text-slate-600">
          {fNet === 0 ? (
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
              ✓ Forces are balanced (<ForceSymbol type="Fnet" /> = 0). Constant velocity.
            </span>
          ) : (
            <span className="text-amber-700 font-medium inline-flex items-center gap-1">
              ⚠ Forces are unbalanced (<ForceSymbol type="Fnet" /> ≠ 0). Acceleration occurs.
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Simulate'}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-md text-xs transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
