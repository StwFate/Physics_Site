import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Activity, Play, Pause, RotateCcw, MoveRight, CircleDot } from 'lucide-react'
import ForceSymbol, { FORCE_REGISTRY } from './ForceSymbol'
import { createMotionModel } from '../utils/motionModel'
import './PhysicsVisualizer.css'

const COLORS = { Fgrav: '#ce3e61', F_grav: '#ce3e61', Fnorm: '#4677cc', F_norm: '#4677cc',
  Ffrict: '#a56813', F_frict: '#a56813', Fair: '#8353b5', F_air: '#8353b5',
  Ftens: '#4677cc', F_tens: '#4677cc', Fapp: '#0052ff', F_app: '#0052ff' }
const colorOf = f => COLORS[f.name] || '#0052ff'
const number = (v, digits = 1) => (Math.abs(v) < 0.0001 ? 0 : v).toFixed(digits)
const directionOf = (v, vertical) => Math.abs(v) < 0.001 ? 'at rest' : vertical ? (v > 0 ? 'upward' : 'downward') : v > 0 ? 'rightward' : 'leftward'
const forceSub = f => FORCE_REGISTRY[f.name]?.sub || String(f.name).replace(/^F_?/, '').replace('buoy', 'b')

function MotionObject({ vertical, projectile, mass, label, id, wheelAngle }) {
  if (projectile) return <g>
    <circle r="19" fill={`url(#${id}-body)`} stroke="#003cc0" strokeWidth="1.5" />
    <path d="M-10 -12 Q8 -19 13 -5" fill="none" stroke="#ffffff88" strokeWidth="3" strokeLinecap="round" />
    <path d="M-15 9 Q0 2 15 9" stroke="#ffffff55" fill="none" />
  </g>
  return <g>
    <ellipse cx="0" cy="35" rx="49" ry="5" fill="#1e4a8920" />
    <rect x="-43" y="-25" width="86" height="51" rx="10" fill={`url(#${id}-body)`} stroke="#003cc0" strokeWidth="1.5" />
    <rect x="-37" y="-20" width="74" height="3" rx="1.5" fill="#ffffff65" />
    {vertical && <><rect x="-50" y="-20" width="5" height="42" rx="2" fill="#91a6c7" /><rect x="45" y="-20" width="5" height="42" rx="2" fill="#91a6c7" /></>}
    <text y="-2" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">{label.length > 13 ? 'Object' : label}</text>
    <text y="14" textAnchor="middle" fill="#e2ecff" fontSize="11" fontWeight="600">{Number(mass.toFixed(2))} kg</text>
    {!vertical && [-27, 27].map(x => <g key={x} transform={`translate(${x} 28) rotate(${wheelAngle})`}>
      <circle r="9" fill="#173052" /><circle r="5" fill="#7f96b6" /><path d="M-4 0H4M0 -4V4" stroke="#d8e2f0" strokeWidth="1.5" /><circle r="1.5" fill="#173052" />
    </g>)}
  </g>
}

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
  objectLabel = 'Object', illustrative = false }) {
  const id = `motion-${useId().replace(/:/g, '')}`
  // Compare values, rather than array identities, so parent progress updates don't reset a run.
  const signature = JSON.stringify({ fNet, mass, initialVelocity, motionDirection, initialVelocityVector, netForceVector, stopAtRest, label, forces })
  const model = useMemo(() => createMotionModel(JSON.parse(signature)), [signature])
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
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
  const atEnd = time >= model.duration - 0.0001
  const power = state.vx * model.a.x + state.vy * model.a.y
  const status = atEnd && model.stops ? 'At rest' : balanced ? 'Constant velocity' : power < -0.001 ? 'Slowing down' : 'Speeding up'
  const visibleForces = forces.filter(f => f.value > 0)
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
  const scrub = e => { clock.current = Number(e.target.value); setTime(clock.current); setPlaying(false) }
  const display = (v, digits) => isSubmitted ? number(v, digits) : '—'
  const velocityLabel = model.projectile ? 'Speed' : 'Velocity'
  const velocityAngle = model.projectile ? Math.atan2(-state.vy, state.vx) * 180 / Math.PI : vertical ? -90 : 0

  return <section className="motion-model" aria-label={label}>
    <div className="motion-header">
      <div className="motion-heading"><span className="motion-heading-icon"><Activity size={18} aria-hidden="true" /></span><div><h3>Motion model</h3><p>Follow the forces. See what changes.</p></div></div>
      <div className={`motion-badge ${balanced ? 'is-balanced' : ''}`}><span className="motion-dot" />{isSubmitted ? status : 'Ready to explore'}</div>
    </div>
    <div className="motion-metrics">
      {[['Elapsed time', time, 's', 1], [velocityLabel, speed, 'm/s', 2], [model.projectile ? 'Acceleration magnitude' : 'Acceleration', acceleration, 'm/s²', 2], [model.projectile ? 'Net force magnitude' : 'Net force', force, 'N', 1]].map(([name, value, unit, digits]) => <div className="motion-metric" key={name}>
        <span className="motion-metric-label">{name}</span><span className="motion-metric-value">{display(value, digits)} <small>{unit}</small></span>
      </div>)}
    </div>
    <div className="motion-workspace">
      <div className="motion-stage" ref={stageRef}>
        <div className="motion-stage-top"><strong>{model.projectile ? 'Projectile motion' : vertical ? 'Vertical motion' : 'Horizontal motion'}</strong><span>{model.projectile ? '+x right · +y up' : vertical ? '+ upward' : '+ rightward'}</span></div>
        <svg className="motion-scene" viewBox={`0 0 ${sceneWidth} 310`} role="img" aria-label={`${objectLabel} ${model.projectile ? 'following a projectile path' : `moving ${directionOf(speed, vertical)}`}. ${status}.`}>
          <defs>
            <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#e3ebf7" strokeWidth=".75" /></pattern>
            <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0.5" y2="1"><stop stopColor="#4188ff" /><stop offset="1" stopColor="#0052ed" /></linearGradient>
            {[['velocity', '#008575'], ['acceleration', '#c07a15']].map(([key, color]) => <marker key={key} id={`${id}-${key}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill={color} /></marker>)}
          </defs>
          <rect width={sceneWidth} height="310" fill={`url(#${id}-grid)`} />
          {!vertical && !model.projectile && <><rect x="20" y="215" width={sceneWidth - 40} height="7" rx="3.5" fill="#e1e9f5" /><line x1="20" y1="214" x2={sceneWidth - 20} y2="214" stroke="#b6c7df" />{(sceneWidth < 450 ? [0, 1] : [0, .25, .5, .75, 1]).map(v => { const p = toScreen({ x: minX + (maxX - minX) * v, y: 0 }); return <g key={v}><line x1={p.x} x2={p.x} y1="222" y2="228" stroke="#92a7c4" /><text x={p.x} y="243" textAnchor="middle" fill="#627692" fontSize="9">{number(minX + (maxX - minX) * v)} m</text></g> })}</>}
          {vertical && <><rect x={sceneWidth / 2 - 59} y="48" width="118" height="206" rx="8" fill="#edf3fc" fillOpacity=".6" stroke="#d3deee" />{[-53, 53].map(x => <line key={x} x1={sceneWidth / 2 + x} x2={sceneWidth / 2 + x} y1="54" y2="248" stroke="#bacbe1" strokeWidth="3" />)}{[0, .5, 1].map(v => <text key={v} x={sceneWidth / 2 - 83} y={203 - v * 70} textAnchor="end" fill="#627692" fontSize="9">{number(minY + (maxY - minY) * v)} m</text>)}</>}
          {model.projectile && <path d={model.points.map((p, i) => { const s = toScreen(p); return `${i ? 'L' : 'M'}${s.x},${s.y}` }).join(' ')} fill="none" stroke="#b9cbe4" strokeWidth="1.5" strokeDasharray="4 6" />}
          {showTrail && pastDots.map((p, i) => { const s = toScreen(p); return <circle key={i} cx={s.x} cy={s.y} r="3.5" fill="#94abc9" opacity={0.25 + i / 20} /> })}
          <g transform={`translate(${position.x} ${position.y})`}>
            <MotionObject vertical={vertical} projectile={model.projectile} mass={model.mass} label={objectLabel} id={id} wheelAngle={state.x * 28} />
            {showForces && isSubmitted && visibleForces.map((f, i) => {
              const length = f.value / maxForce * (compactScene || vertical ? 30 : 60)
              const dx = f.dir === 'right' ? 1 : f.dir === 'left' ? -1 : 0
              const dy = f.dir === 'up' ? -1 : f.dir === 'down' ? 1 : 0
              const start = dx ? (model.projectile ? 23 : 49) : (model.projectile ? 23 : 40)
              const offset = visibleForces.filter((other, j) => j < i && other.dir === f.dir).length * 22
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
            <text y="0" fontSize="9" fill="#52647e">velocity</text>
            <line x1="70" y1="-4" x2={70 + (Math.abs(speed) < .001 ? 0 : Math.sign(speed) * 32)} y2="-4" stroke="#008575" strokeWidth="2.5" markerEnd={Math.abs(speed) < .001 ? undefined : `url(#${id}-velocity)`} transform={`rotate(${velocityAngle} 70 -4)`} />
            <text y="26" fontSize="9" fill="#52647e">acceleration</text>
            {Math.abs(acceleration) > .001 ? <line x1="70" y1="22" x2={70 + Math.sign(acceleration) * 32} y2="22" stroke="#c07a15" strokeWidth="2.5" markerEnd={`url(#${id}-acceleration)`} transform={vertical ? 'rotate(-90 70 22)' : model.projectile ? 'rotate(90 70 22)' : undefined} /> : <text x="70" y="26" fontSize="10" fill="#52647e">0</text>}
          </g>}
        </svg>
        <div className="motion-stage-legend"><span><i className="motion-key" />Forces</span><span><i className="motion-key velocity" />Velocity</span>{showTrail && <span><i className="motion-key trail" />Equal-time positions</span>}</div>
      </div>
      <aside className="motion-inspector" aria-label="Motion insights">
        <div><h4 className="motion-inspector-title">{velocityLabel} / time</h4><VelocityGraph model={model} time={time} /></div>
        <div><h4 className="motion-inspector-title">Forces on the object</h4>{visibleForces.map((f, i) => <div className="motion-force-row" key={i}><span className="motion-force-label"><i className="motion-force-swatch" style={{ background: colorOf(f) }} /><ForceSymbol sub={forceSub(f)} /></span><span className="motion-force-row-value">{number(f.value)} N {({ up: '↑', down: '↓', left: '←', right: '→' })[f.dir]}</span></div>)}</div>
        <p className="motion-observation"><strong>{atEnd ? 'Run complete. ' : 'What to notice. '}</strong>{balanced ? 'Equal and opposite forces cancel. The velocity stays the same.' : model.projectile ? 'Gravity changes vertical velocity. Horizontal velocity stays constant.' : model.stops ? 'Friction opposes the motion. This run ends when the object comes to rest.' : 'A net force changes velocity in its direction. Dots spread out as speed increases and move closer as speed decreases.'}</p>
      </aside>
    </div>
    <div className="motion-toolbar">
      <div className="motion-controls">
        <button className="motion-play" onClick={togglePlayback} disabled={!isSubmitted}>{playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}{playing ? 'Pause' : atEnd ? 'Replay' : time > 0 ? 'Resume' : 'Play'}</button>
        <button className="motion-restart" onClick={reset} disabled={!isSubmitted} aria-label="Reset motion to the beginning"><RotateCcw size={13} aria-hidden="true" />Reset</button>
        <div className="motion-speeds" role="group" aria-label="Playback speed">{[0.5, 1, 2].map(r => <button key={r} onClick={() => setRate(r)} aria-pressed={rate === r} aria-label={`${r} times playback speed`}>{r}×</button>)}</div>
      </div>
      <div className="motion-options"><button className="motion-toggle" aria-pressed={showForces} onClick={() => setShowForces(v => !v)}><MoveRight size={13} aria-hidden="true" />Forces</button><button className="motion-toggle" aria-pressed={showTrail} onClick={() => setShowTrail(v => !v)}><CircleDot size={13} aria-hidden="true" />Motion trail</button></div>
    </div>
    <div className="motion-timeline"><input type="range" min="0" max={model.duration} step="0.01" value={time} disabled={!isSubmitted} onChange={scrub} aria-label="Scrub motion timeline" aria-valuetext={`${number(time, 2)} of ${number(model.duration, 2)} seconds`} /><span className="motion-time">{number(time)} / {number(model.duration)} s</span></div>
    <p className="motion-footnote">{illustrative ? 'Illustrative values show the scenario’s relative force strengths. ' : ''}Forces are held constant during each run. {model.projectile ? 'The full trajectory is fitted to the scene.' : 'Positive and negative values indicate direction; the scene fits the full run.'} {reducedMotion ? 'Automatic playback is off for reduced motion. Use Play or the timeline.' : 'Drag the timeline to inspect any moment.'}</p>
  </section>
}
