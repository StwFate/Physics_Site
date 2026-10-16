import { resolveFBDVisual } from './motionVisuals.js'

// Constant-force motion in SI units. Display scale never changes the physics.
export function createMotionModel({ mass = 10, fNet = 0, initialVelocity = 0,
  motionDirection = 'rightward', initialVelocityVector, netForceVector, stopAtRest = false }) {
  const vertical = /^(up|upward|down|downward)$/.test(motionDirection)
  const negative = /^(left|leftward|negative|down|downward)$/.test(motionDirection)
  const signedVelocity = Math.abs(initialVelocity) * (negative ? -1 : 1)
  const v0 = initialVelocityVector || (vertical ? { x: 0, y: signedVelocity } : { x: signedVelocity, y: 0 })
  const force = netForceVector || (vertical ? { x: 0, y: fNet } : { x: fNet, y: 0 })
  const safeMass = Number.isFinite(mass) && mass > 0 ? mass : 10
  const a = { x: force.x / safeMass, y: force.y / safeMass }
  const stopTime = stopAtRest && v0.x * a.x < 0 && !v0.y && !a.y ? -v0.x / a.x : null
  // End friction-only runs at rest, where the constant kinetic-friction model ends.
  const projectileDuration = initialVelocityVector && a.y < 0
    ? (v0.y > 0 ? -2 * v0.y / a.y : 1.5) : 6
  const duration = stopTime !== null ? Math.min(6, stopTime) : projectileDuration
  const sample = time => {
    const t = Math.max(0, Math.min(duration, time))
    return { t, x: v0.x * t + 0.5 * a.x * t * t, y: v0.y * t + 0.5 * a.y * t * t,
      vx: v0.x + a.x * t, vy: v0.y + a.y * t }
  }
  const points = Array.from({ length: 61 }, (_, i) => sample(duration * i / 60))
  const xs = points.map(p => p.x), ys = points.map(p => p.y)
  // Turning points must remain inside the viewport, including projectile apices.
  if (a.x && -v0.x / a.x > 0 && -v0.x / a.x < duration) xs.push(sample(-v0.x / a.x).x)
  if (a.y && -v0.y / a.y > 0 && -v0.y / a.y < duration) ys.push(sample(-v0.y / a.y).y)
  return { mass: safeMass, force, a, v0, vertical, projectile: !!initialVelocityVector,
    duration, stops: stopTime !== null && stopTime <= 6, sample, points,
    bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) } }
}

// FBD questions specify relative magnitudes; these SI values are illustrative.
export function motionFromScenario(scenario) {
  const verticalUnit = 98 / (scenario.vectors.down?.magnitude || 1)
  const forces = Object.entries(scenario.vectors).filter(([, f]) => f.code > 0).map(([dir, f]) => ({
    name: f.symbol, dir, value: f.magnitude * (dir === 'up' || dir === 'down' ? verticalUnit : 30),
  }))
  const netForceVector = forces.reduce((v, f) => ({
    x: v.x + (f.dir === 'right' ? f.value : f.dir === 'left' ? -f.value : 0),
    y: v.y + (f.dir === 'up' ? f.value : f.dir === 'down' ? -f.value : 0),
  }), { x: 0, y: 0 })
  const projectile = scenario.id === 4 || scenario.id === 9
  return { mass: 10, forces, netForceVector, initialVelocity: 5,
    motionDirection: scenario.motion.direction,
    initialVelocityVector: projectile ? { x: 6, y: scenario.id === 4 ? 8 : 0 } : undefined,
    stopAtRest: !projectile && forces.some(f => f.dir === 'left') && !forces.some(f => f.dir === 'right'),
    objectLabel: scenario.objectContext, illustrative: true,
    visual: resolveFBDVisual(scenario),
  }
}
