import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

export default function PhysicsVisualizer({
  fNet = 0,
  mass = 10,
  initialVelocity = 0,
  label = 'Object Motion Simulation',
  forces = [] // e.g. [{ name: 'Fapp', value: 50, dir: 'right' }, { name: 'Ffrict', value: 20, dir: 'left' }]
}) {
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(50) // percentage 0-100
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
      const dt = Math.min((time - lastTime) / 1000, 0.1) // clamp dt to max 100ms
      lastTime = time

      const curVel = stateRef.current.vel + accel * dt
      let curPos = stateRef.current.pos + (curVel * dt * 8) // scale for visual speed

      // Boundary bouncing or wrap
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {label}
        </span>
        <div className="flex items-center gap-3 font-mono text-slate-400">
          <span>a: <strong className={accel !== 0 ? 'text-amber-400' : 'text-emerald-400'}>{accel.toFixed(2)} m/s²</strong></span>
          <span>v: <strong className="text-cyan-400">{velocity.toFixed(1)} m/s</strong></span>
          <span>F_net: <strong className={fNet !== 0 ? 'text-rose-400' : 'text-emerald-400'}>{fNet.toFixed(1)} N</strong></span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-28 bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden flex items-end">
        {/* Distance tick marks */}
        <div className="absolute inset-x-0 bottom-0 h-4 border-t border-slate-800 flex justify-between px-4 text-[10px] text-slate-600 font-mono select-none">
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
          {/* Force Vectors Visualized on the Cart */}
          <div className="relative w-16 h-12 flex items-center justify-center">
            {/* Box Body */}
            <div className="w-14 h-10 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded border border-cyan-300/40 shadow-lg flex items-center justify-center text-xs font-bold text-white shadow-cyan-500/20">
              {mass}kg
            </div>

            {/* Left arrow if F_left */}
            {forces.filter(f => f.dir === 'left').map((f, i) => (
              <div key={i} className="absolute right-full top-1/2 -translate-y-1/2 flex items-center pr-1">
                <span className="text-[10px] text-rose-400 font-mono font-bold mr-1">{f.name}</span>
                <div className="h-0.5 bg-rose-500 relative" style={{ width: `${Math.min(Math.max(f.value * 0.8, 15), 60)}px` }}>
                  <div className="absolute left-0 -top-1 border-t-4 border-r-4 border-b-4 border-transparent border-r-rose-500"></div>
                </div>
              </div>
            ))}

            {/* Right arrow if F_right */}
            {forces.filter(f => f.dir === 'right').map((f, i) => (
              <div key={i} className="absolute left-full top-1/2 -translate-y-1/2 flex items-center pl-1">
                <div className="h-0.5 bg-cyan-400 relative" style={{ width: `${Math.min(Math.max(f.value * 0.8, 15), 60)}px` }}>
                  <div className="absolute right-0 -top-1 border-t-4 border-l-4 border-b-4 border-transparent border-l-cyan-400"></div>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold ml-1">{f.name}</span>
              </div>
            ))}
          </div>

          {/* Cart Wheels */}
          <div className="flex gap-6 -mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-slate-400">
          {fNet === 0 ? (
            <span className="text-emerald-400 font-medium">✓ Forces are balanced ($F_{`{net}`} = 0$). Motion is at constant velocity.</span>
          ) : (
            <span className="text-amber-400 font-medium">⚠ Forces are unbalanced ($F_{`{net}`} \neq 0$). Acceleration occurs!</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Simulate'}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
