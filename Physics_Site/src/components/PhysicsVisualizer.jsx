import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Activity, Play, Pause, RotateCcw, MoveRight, CircleDot } from 'lucide-react'
import ForceSymbol, { FORCE_REGISTRY } from './ForceSymbol'
import { createMotionModel } from '../utils/motionModel'
import { resolveVisualMeta } from '../utils/motionVisuals'
import { EnvironmentBackdrop, PersonalizedMotionObject } from './MotionVisualRenderers'
import './PhysicsVisualizer.css'

const COLORS = { Fgrav: '#ce3e61', F_grav: '#ce3e61', Fnorm: '#4677cc', F_norm: '#4677cc',
  Ffrict: '#a56813', F_frict: '#a56813', Fair: '#8353b5', F_air: '#8353b5',
  Ftens: '#4677cc', F_tens: '#4677cc', Fapp: '#0052ff', F_app: '#0052ff' }
const colorOf = f => COLORS[f.name] || '#0052ff'
const number = (v, digits = 1) => (Math.abs(v) < 0.0001 ? 0 : v).toFixed(digits)
const directionOf = (v, vertical) => Math.abs(v) < 0.001 ? 'at rest' : vertical ? (v > 0 ? 'upward' : 'downward') : v > 0 ? 'rightward' : 'leftward'
const forceSub = f => FORCE_REGISTRY[f.name]?.sub || String(f.name).replace(/^F_?/, '').replace('buoy', 'b')

function VelocityGraph({ model, time }) {
  const values = model.points.map(p => model.projectile ? Math.hypot(p.vx, p.vy) : model.vertical ? p.vy : p.vx)
  const min = Math.min(0, ...values), max = Math.max(0, ...values), span = Math.max(1, max - min)
  const y = v => 57 - (v - min) / span * 46
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${i / 60 * 180 + 4},${y(v)}`).join(' ')
  const p = model.sample(time)
  const value = model.projectile ? Math.hypot(p.vx, p.vy) : model.vertical ? p.vy : p.vx
  return <>
    <svg viewBox="0 0 192 74" className="motion-graph" role="img" aria-label={`${model.projectile ? 'Speed' : 'Velocity'} versus time for this run`}>
      <path d="M4 5V60H188" fill="none" stroke="#d6e0ed" />
      <line x1="4" x2="188" y1={y(0)} y2={y(0)} stroke="#d6e0ed" strokeDasharray="3 3" />
      <path d={path} fill="none" stroke="#008575" strokeWidth="2" />
      <line x1={4 + time / model.duration * 180} x2={4 + time / model.duration * 180} y1="5" y2="60" stroke="#0052ff" strokeDasharray="2 3" />
      <circle cx={4 + time / model.duration * 180} cy={y(value)} r="3.5" fill="#008575" stroke="white" strokeWidth="1.5" />
      <text x="4" y="72" fontSize="8" fill="#53657c">0 s</text><text x="184" y="72" textAnchor="end" fontSize="8" fill="#53657c">{number(model.duration)} s</text>
      <text x="186" y="9" textAnchor="end" fontSize="8" fill="#53657c">{number(max)} m/s</text>
    </svg>
    <div className="motion-chart-note">{model.projectile ? 'Speed includes both directions.' : 'Slope = acceleration. Dashed line = zero.'}</div>
  </>
}

export default function PhysicsVisualizer({ fNet = 0, mass = 10, initialVelocity = 0,
  label = 'Motion model', forces = [], isSubmitted = false, motionDirection = 'rightward',
  autoPlayKey = 0, initialVelocityVector, netForceVector, stopAtRest = false,
  motionBehavior, objectLabel = 'Object', illustrative = false, visual }) {
  const id = `motion-${useId().replace(/:/g, '')}`
  // Compare values, rather than array identities, so parent progress updates don't reset a run.
  const signature = JSON.stringify({ fNet, mass, initialVelocity, motionDirection, initialVelocityVector, netForceVector, stopAtRest, motionBehavior, label, forces })
  const model = useMemo(() => createMotionModel(JSON.parse(signature)), [signature])
  const resolvedVisual = useMemo(() => resolveVisualMeta(visual, objectLabel, model), [visual, objectLabel, model])

  const isBrakingSim = Boolean(model.stops || model.isBraking || motionBehavior === 'braking')
  const availableSpeeds = useMemo(() => isBrakingSim ? [0.25, 0.5, 1] : [0.5, 1, 2], [isBrakingSim])
  const defaultSpeed = isBrakingSim ? 0.5 : 1

  const [prevSignature, setPrevSignature] = useState(signature)
  const [rate, setRate] = useState(defaultSpeed)

  if (prevSignature !== signature) {
    setPrevSignature(signature)
    setRate(defaultSpeed)
  }

  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showForces, setShowForces] = useState(true)
  const [showTrail, setShowTrail] = useState(true)
  const [sceneWidth, setSceneWidth] = useState(720)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const clock = useRef(0)
  const stageRef = useRef(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { setReducedMotion(query.matches); if (query.matches) setPlaying(false) }
    query.addEventListener('change', change)
    const observer = new ResizeObserver(([entry]) => setSceneWidth(Math.max(280, entry.contentRect.width)))
    observer.observe(stageRef.current)
    return () => { query.removeEventListener('change', change); observer.disconnect() }
  }, [])

  useEffect(() => {
    clock.current = 0
    setTime(0)
    setPlaying(isSubmitted && autoPlayKey > 0 && !reducedMotion)
  }, [signature, autoPlayKey, isSubmitted, reducedMotion])

  useEffect(() => {
    if (!playing || !isSubmitted) return
    let frame, previous
    const tick = now => {
      if (previous !== undefined && !document.hidden) {
        clock.current = Math.min(model.duration, clock.current + Math.min((now - previous) / 1000, 0.05) * rate)
        setTime(clock.current)
      }
      previous = now
      if (clock.current < model.duration) frame = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, rate, model, isSubmitted])

  const state = model.sample(time)
  const vertical = model.vertical
  const speed = model.projectile ? Math.hypot(state.vx, state.vy) : vertical ? state.vy : state.vx
  const acceleration = model.projectile ? Math.hypot(model.a.x, model.a.y) : vertical ? model.a.y : model.a.x
  const force = model.projectile ? Math.hypot(model.force.x, model.force.y) : vertical ? model.force.y : model.force.x
  const balanced = Math.abs(model.force.x) + Math.abs(model.force.y) < 0.001
  const atEnd = time >= model.duration - 0.015
  const isStoppedAtRest = Boolean((atEnd && (model.stops || model.isBraking)) || state.atRest)
  const currentSpeed = isStoppedAtRest ? 0 : speed
  const power = state.vx * model.a.x + state.vy * model.a.y
  const status = isStoppedAtRest ? 'At rest' : balanced ? 'Constant velocity' : power < -0.001 ? 'Slowing down' : 'Speeding up'
  const visibleForces = forces.filter(f => f.value > 0)
  const displayedForcesOnObject = (isStoppedAtRest && (model.stops || model.isBraking))
    ? visibleForces.filter(f => f.dir !== 'left' && f.dir !== 'right')
    : visibleForces
  const maxForce = Math.max(1, ...visibleForces.map(f => f.value))
  const { minX, maxX, minY, maxY } = model.bounds
  const compactScene = sceneWidth < 500
  const travelWidth = Math.max(40, sceneWidth - (compactScene ? 220 : 310))
  const scale = Math.min(travelWidth / Math.max(1, maxX - minX), 70 / Math.max(1, maxY - minY))
  const toScreen = p => ({ x: sceneWidth / 2 + (p.x - (minX + maxX) / 2) * scale,
    y: vertical || model.projectile ? 164 - (p.y - (minY + maxY) / 2) * scale : 177 })
  const position = toScreen(state)
  const pastDots = Array.from({ length: 13 }, (_, i) => model.sample(i * model.duration / 12)).filter(p => p.t <= time + 0.001)
  const reset = () => { clock.current = 0; setTime(0); setPlaying(false) }
  const togglePlayback = () => { if (atEnd) { clock.current = 0; setTime(0) }; setPlaying(p => !p) }
  const scrub = e => {
    const v = Number(e.target.value)
    const t = v >= model.duration - 0.015 ? model.duration : v
    clock.current = t
    setTime(t)
    setPlaying(false)
  }
  const display = (v, digits) => isSubmitted ? number(v, digits) : '—'
  const velocityLabel = model.projectile ? 'Speed' : 'Velocity'
  const velocityAngle = model.projectile ? Math.atan2(-state.vy, state.vx) * 180 / Math.PI : vertical ? -90 : 0

  return <section className="motion-model" aria-label={label}>
    <div className="motion-header">
      <div className="motion-heading"><span className="motion-heading-icon"><Activity size={18} aria-hidden="true" /></span><div><h3>Motion model</h3><p>Follow the forces. See what changes.</p></div></div>
      <div className={`motion-badge ${balanced || isStoppedAtRest ? 'is-balanced' : ''}`}><span className="motion-dot" />{isSubmitted ? status : 'Ready to explore'}</div>
    </div>
    <div className="motion-metrics">
      {[['Elapsed time', time, 's', 1], [velocityLabel, currentSpeed, 'm/s', 2], [model.projectile ? 'Acceleration magnitude' : 'Acceleration', acceleration, 'm/s²', 2], [model.projectile ? 'Net force magnitude' : 'Net force', force, 'N', 1]].map(([name, value, unit, digits]) => <div className="motion-metric" key={name}>
        <span className="motion-metric-label">{name}</span><span className="motion-metric-value">{display(value, digits)} <small>{unit}</small></span>
      </div>)}
    </div>
    <div className="motion-workspace">
      <div className="motion-stage" ref={stageRef}>
        <div className="motion-stage-top"><strong>{model.projectile ? 'Projectile motion' : vertical ? 'Vertical motion' : 'Horizontal motion'}</strong><span>{model.projectile ? '+x right · +y up' : vertical ? '+ upward' : '+ rightward'}</span></div>
        <svg className="motion-scene" viewBox={`0 0 ${sceneWidth} 310`} role="img" aria-label={`${resolvedVisual.title || objectLabel} ${model.projectile ? 'following a projectile path' : `moving ${directionOf(currentSpeed, vertical)}`}. ${status}.`}>
          <defs>
            <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#e3ebf7" strokeWidth=".75" /></pattern>
            <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0.5" y2="1"><stop stopColor="#4188ff" /><stop offset="1" stopColor="#0052ed" /></linearGradient>
            {[['velocity', '#008575'], ['acceleration', '#c07a15']].map(([key, color]) => <marker key={key} id={`${id}-${key}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill={color} /></marker>)}
          </defs>
          <rect width={sceneWidth} height="310" fill={`url(#${id}-grid)`} />
          <EnvironmentBackdrop
            visual={resolvedVisual}
            sceneWidth={sceneWidth}
            vertical={vertical}
            projectile={model.projectile}
            minX={minX}
            maxX={maxX}
            minY={minY}
            maxY={maxY}
            toScreen={toScreen}
            number={number}
            id={id}
          />
          {model.projectile && <path d={model.points.map((p, i) => { const s = toScreen(p); return `${i ? 'L' : 'M'}${s.x},${s.y}` }).join(' ')} fill="none" stroke="#b9cbe4" strokeWidth="1.5" strokeDasharray="4 6" />}
          {showTrail && pastDots.map((p, i) => { const s = toScreen(p); return <circle key={i} cx={s.x} cy={s.y} r="3.5" fill="#94abc9" opacity={0.25 + i / 20} /> })}
          <g transform={`translate(${position.x} ${position.y})`}>
            <PersonalizedMotionObject
              visual={resolvedVisual}
              vertical={vertical}
              projectile={model.projectile}
              mass={model.mass}
              wheelAngle={state.x * 28}
              velocity={currentSpeed}
              motionDirection={motionDirection}
              forces={displayedForcesOnObject}
              id={id}
            />
            {showForces && isSubmitted && displayedForcesOnObject.map((f, i) => {
              const length = f.value / maxForce * (compactScene || vertical ? 30 : 60)
              const dx = f.dir === 'right' ? 1 : f.dir === 'left' ? -1 : 0
              const dy = f.dir === 'up' ? -1 : f.dir === 'down' ? 1 : 0
              const start = dx ? (resolvedVisual.anchor?.rx || 46) : (resolvedVisual.anchor?.ry || 38)
              const offset = displayedForcesOnObject.filter((other, j) => j < i && other.dir === f.dir).length * 22
              const x1 = dx * start + (dy ? offset : 0), y1 = dy * start + (dx ? offset : 0)
              const x2 = x1 + dx * length, y2 = y1 + dy * length
              return <g key={`${f.name}-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colorOf(f)} strokeWidth="2.5" />
                <path d="M-6 -4L0 0L-6 4" fill="none" stroke={colorOf(f)} strokeWidth="2.5" transform={`translate(${x2} ${y2}) rotate(${dx ? dx > 0 ? 0 : 180 : dy > 0 ? 90 : -90})`} />
                <text x={x2 + (dx ? dx * 9 : 10)} y={y2 + (dy < 0 ? -8 : dy > 0 ? 14 : 4)} textAnchor={dx < 0 ? 'end' : 'start'} fontSize="13" fill={colorOf(f)} fontWeight="700" stroke="#f8fbff" strokeWidth="3" paintOrder="stroke"><tspan fontFamily="Georgia" fontStyle="italic">F</tspan><tspan baselineShift="sub" fontSize="9">{forceSub(f)}</tspan></text>
              </g>
            })}
          </g>
          {isSubmitted && <g transform={`translate(${sceneWidth < 500 && vertical ? 18 : 32} 57)`}>
            <text x="0" y="0" fontSize="9" fill="#52647e">velocity</text>
            {!isStoppedAtRest && Math.abs(currentSpeed) >= 0.001 ? (
              <line
                x1="105"
                y1="-4"
                x2={105 + Math.sign(currentSpeed) * 30}
                y2="-4"
                stroke="#008575"
                strokeWidth="2.5"
                markerEnd={`url(#${id}-velocity)`}
                transform={model.projectile ? `rotate(${velocityAngle} 105 -4)` : vertical ? `rotate(-90 105 -4)` : undefined}
              />
            ) : (
              <text x="105" y="0" fontSize="10" fill="#52647e">0</text>
            )}
            <text x="0" y="26" fontSize="9" fill="#52647e">acceleration</text>
            {!isStoppedAtRest && Math.abs(acceleration) >= 0.001 ? (
              <line
                x1="105"
                y1="22"
                x2={105 + Math.sign(acceleration) * 30}
                y2="22"
                stroke="#c07a15"
                strokeWidth="2.5"
                markerEnd={`url(#${id}-acceleration)`}
                transform={vertical ? 'rotate(-90 105 22)' : model.projectile ? 'rotate(90 105 22)' : undefined}
              />
            ) : (
              <text x="105" y="26" fontSize="10" fill="#52647e">0</text>
            )}
          </g>}
        </svg>
        <div className="motion-stage-legend"><span><i className="motion-key" />Forces</span><span><i className="motion-key velocity" />Velocity</span>{showTrail && <span><i className="motion-key trail" />Equal-time positions</span>}</div>
      </div>
      <aside className="motion-inspector" aria-label="Motion insights">
        <div><h4 className="motion-inspector-title">{velocityLabel} / time</h4><VelocityGraph model={model} time={time} /></div>
        <div><h4 className="motion-inspector-title">Forces on the object</h4>{visibleForces.map((f, i) => <div className="motion-force-row" key={i}><span className="motion-force-label"><i className="motion-force-swatch" style={{ background: colorOf(f) }} /><ForceSymbol sub={forceSub(f)} /></span><span className="motion-force-row-value">{number(f.value)} N {({ up: '↑', down: '↓', left: '←', right: '→' })[f.dir]}</span></div>)}</div>
        <p className="motion-observation">{isStoppedAtRest && (model.stops || model.isBraking) ? <><strong>Run complete. At rest. </strong>This braking run ends when the object comes to rest. Retained force and acceleration values describe the active braking segment; once stopped, braking forces drop to zero so the object remains at rest rather than reversing.</> : <><strong>{atEnd ? 'Run complete. ' : 'What to notice. '}</strong>{balanced ? 'Equal and opposite forces cancel. The velocity stays the same.' : model.projectile ? 'Gravity changes vertical velocity. Horizontal velocity stays constant.' : model.stops ? 'Friction opposes the motion. This run ends when the object comes to rest.' : 'A net force changes velocity in its direction. Dots spread out as speed increases and move closer as speed decreases.'}</>}</p>
      </aside>
    </div>
    <div className="motion-toolbar">
      <div className="motion-controls">
        <button className="motion-play" onClick={togglePlayback} disabled={!isSubmitted}>{playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}{playing ? 'Pause' : atEnd ? 'Replay' : time > 0 ? 'Resume' : 'Play'}</button>
        <button className="motion-restart" onClick={reset} disabled={!isSubmitted} aria-label="Reset motion to the beginning"><RotateCcw size={13} aria-hidden="true" />Reset</button>
        <div className="motion-speeds" role="group" aria-label="Playback speed">{availableSpeeds.map(r => <button key={r} onClick={() => setRate(r)} aria-pressed={rate === r} aria-label={`${r} times playback speed`}>{r}×</button>)}</div>
      </div>
      <div className="motion-options"><button className="motion-toggle" aria-pressed={showForces} onClick={() => setShowForces(v => !v)}><MoveRight size={13} aria-hidden="true" />Forces</button><button className="motion-toggle" aria-pressed={showTrail} onClick={() => setShowTrail(v => !v)}><CircleDot size={13} aria-hidden="true" />Motion trail</button></div>
    </div>
    <div className="motion-timeline"><input type="range" min="0" max={model.duration} step="0.01" value={time} disabled={!isSubmitted} onChange={scrub} aria-label="Scrub motion timeline" aria-valuetext={`${number(time, 2)} of ${number(model.duration, 2)} seconds`} /><span className="motion-time">{number(time)} / {number(model.duration)} s</span></div>
    <p className="motion-footnote">{illustrative ? 'Illustrative values show the scenario’s relative force strengths. ' : ''}Forces are held constant during each run. {model.projectile ? 'The full trajectory is fitted to the scene.' : 'Positive and negative values indicate direction; the scene fits the full run.'} {reducedMotion ? 'Automatic playback is off for reduced motion. Use Play or the timeline.' : 'Drag the timeline to inspect any moment.'}</p>
  </section>
}
