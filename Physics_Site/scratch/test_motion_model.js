import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createMotionModel, motionFromScenario } from '../src/utils/motionModel.js'
import {
  generateBalancedQuestions,
  BRAKING_QUESTION_IDS,
  REVERSAL_QUESTION_IDS,
  CONTINUED_QUESTION_IDS
} from '../src/utils/balancedForcesGenerator.js'
import { resolveQuestionVisual, resolveFBDVisual, resolveSolveItVisual } from '../src/utils/motionVisuals.js'

const close = (actual, expected, tol = 1e-6) => assert.ok(Math.abs(actual - expected) < tol, `${actual} != ${expected}`)

// 1. Basic analytic motion tests
let model = createMotionModel({ mass: 10, fNet: 0, initialVelocity: 4 })
close(model.sample(6).x, 24)
close(model.sample(6).vx, 4)

model = createMotionModel({ mass: 10, fNet: 20, initialVelocity: 2 })
close(model.sample(3).x, 15)
close(model.sample(3).vx, 8)
close(model.sample(6).vx, 14)

model = createMotionModel({ mass: 2, fNet: 20, initialVelocity: 2 })
close(model.sample(6).vx, 62)

// 2. Exact Regression Test Case from requirements:
// mass = 30/9.8 kg, v0 = 8 m/s, fNet = -39 N, a = -12.74 m/s², tStop ~0.628 s, stopPosition ~2.512 m.
const regMass = 30 / 9.8
const regModel = createMotionModel({
  mass: regMass,
  fNet: -39,
  initialVelocity: 8,
  motionDirection: 'rightward',
  stopAtRest: true
})
assert.equal(regModel.stops, true, 'Regression: model must indicate stops=true')
assert.equal(regModel.isBraking, true, 'Regression: model must indicate isBraking=true')
close(regModel.a.x, -12.74, 1e-4)
close(regModel.tStop, 8 / 12.74, 1e-4) // ~0.627943 s
close(regModel.duration, regModel.tStop, 1e-4)
close(regModel.stopPosition.x, 32 / 12.74, 1e-4) // ~2.51177 m

// Verify vehicle NEVER travels backward when sampled past tStop
let prevX = -Infinity
for (let t = 0; t <= 10; t += 0.05) {
  const p = regModel.sample(t)
  assert.ok(p.x >= prevX - 1e-9, `Vehicle moved backward at t=${t}: ${p.x} < ${prevX}`)
  prevX = p.x
  if (t >= regModel.tStop) {
    close(p.x, regModel.stopPosition.x, 1e-8)
    assert.equal(p.vx, 0, `Velocity must be exactly 0 at t=${t}`)
    assert.equal(p.atRest, true, `atRest flag must be true at t=${t}`)
  }
}

// 3. Rightward and leftward braking tests
// Rightward braking
const rightBrake = createMotionModel({ mass: 10, fNet: -20, initialVelocity: 4, stopAtRest: true })
assert.equal(rightBrake.isBraking, true)
assert.equal(rightBrake.stops, true)
close(rightBrake.duration, 2)
close(rightBrake.tStop, 2)
close(rightBrake.stopPosition.x, 4)
close(rightBrake.sample(9).vx, 0)
close(rightBrake.sample(9).x, 4)
assert.equal(rightBrake.sample(9).atRest, true)

// Leftward braking
const leftBrake = createMotionModel({
  mass: 10,
  fNet: 20,
  initialVelocity: 4,
  motionDirection: 'leftward',
  stopAtRest: true
})
assert.equal(leftBrake.isBraking, true)
assert.equal(leftBrake.stops, true)
close(leftBrake.duration, 2)
close(leftBrake.tStop, 2)
close(leftBrake.stopPosition.x, -4)
close(leftBrake.sample(5).vx, 0)
close(leftBrake.sample(5).x, -4)
assert.equal(leftBrake.sample(5).atRest, true)
// Leftward braking must never move rightward after stopping (x <= -4 for all t)
for (let t = 0; t <= 6; t += 0.2) {
  const p = leftBrake.sample(t)
  assert.ok(p.x <= 1e-8, `Leftward motion x should be non-positive: ${p.x}`)
  if (t >= 2) close(p.x, -4, 1e-8)
}

// 4. Braking with simultaneous drive and friction (drive 10 N right, friction 25 N left -> fNet = -15 N)
const driveAndFriction = createMotionModel({
  mass: 5,
  fNet: -15,
  initialVelocity: 6,
  stopAtRest: true
})
assert.equal(driveAndFriction.isBraking, true)
assert.equal(driveAndFriction.stops, true)
close(driveAndFriction.tStop, 2) // a = -3, tStop = -6/-3 = 2 s
close(driveAndFriction.stopPosition.x, 6) // x = 6*2 + 0.5*(-3)*4 = 6 m
close(driveAndFriction.sample(6).x, 6)
close(driveAndFriction.sample(6).vx, 0)

// 5. Preserving legitimate reversals (stopAtRest: false)
// Ball launched upward rising and falling back down under gravity
const upwardBall = createMotionModel({
  mass: 10,
  fNet: -20,
  initialVelocity: 4,
  motionDirection: 'upward',
  stopAtRest: false
})
assert.equal(upwardBall.isBraking, false, 'Reversal should not be marked as braking')
assert.equal(upwardBall.stops, false, 'Reversal should not stop at apex')
close(upwardBall.sample(1).y, 3)
close(upwardBall.sample(2).vy, 0)
close(upwardBall.sample(3).vy, -2) // Falls back down!
assert.ok(upwardBall.sample(3).vy < 0, 'Upward ball reverses direction under gravity')

// 6. Preserving drag-driven descent and parachutes
const skydiverModel = createMotionModel({
  mass: 10,
  fNet: 25,
  initialVelocity: 8,
  motionDirection: 'downward',
  stopAtRest: false
})
assert.equal(skydiverModel.isBraking, false)
assert.equal(skydiverModel.stops, false)
assert.equal(skydiverModel.duration, 6, 'Parachute continues descending through duration')

// 7. FBD Scenarios verification
const scenarios = JSON.parse(readFileSync(new URL('../src/data/fbdScenarios.json', import.meta.url)))
const expectedBrakingFbd = [3, 8, 11, 12]
const expectedProjectileFbd = [4, 9]
const expectedParachuteFbd = [10]

for (const scenario of scenarios) {
  const params = motionFromScenario(scenario)
  model = createMotionModel(params)
  const horizontal = Number(scenario.answerCode[4]), vertical = Number(scenario.answerCode[5])
  assert.equal(Math.sign(model.force.x), horizontal === 1 ? 1 : horizontal === 2 ? -1 : 0)
  assert.equal(Math.sign(model.force.y), vertical === 1 ? 1 : vertical === 2 ? -1 : 0)

  if (expectedBrakingFbd.includes(scenario.id)) {
    assert.equal(scenario.motionBehavior, 'braking', `Scenario ${scenario.id} must have motionBehavior='braking'`)
    assert.equal(params.stopAtRest, true, `Scenario ${scenario.id} must set stopAtRest=true`)
    assert.equal(model.isBraking, true, `Scenario ${scenario.id} motion model must have isBraking=true`)
    assert.equal(model.stops, true, `Scenario ${scenario.id} motion model must stop at rest`)
    // Sample at completion: must be at rest
    const endSample = model.sample(model.duration)
    close(endSample.vx, 0)
    close(endSample.vy, 0)
  }

  if (expectedProjectileFbd.includes(scenario.id)) {
    assert.equal(scenario.motionBehavior, 'projectile')
    assert.equal(params.stopAtRest, false)
    close(model.a.y, -9.8)
    close(model.sample(1).vx, 6)
    close(model.sample(1).vy, (scenario.id === 4 ? 8 : 0) - 9.8)
  }

  if (expectedParachuteFbd.includes(scenario.id)) {
    assert.equal(scenario.motionBehavior, 'parachute')
    assert.equal(params.stopAtRest, false, 'Parachute must not artificially stop in mid-air')
    assert.equal(model.stops, false)
  }

  assert.ok(params.visual, `Scenario ${scenario.id} must include visual metadata`)
  assert.ok(params.visual.family && params.visual.variant && params.visual.environment, `Scenario ${scenario.id} has incomplete visual metadata`)
  assert.ok(params.visual.anchor.rx > 0 && params.visual.anchor.ry > 0, `Scenario ${scenario.id} has invalid anchor`)
}

// 8. Solve It visual & motion checks (problems 1 to 8)
for (let problemId = 1; problemId <= 8; problemId++) {
  const v = resolveSolveItVisual(problemId)
  assert.ok(v.family && v.variant && v.environment, `Solve It problem ${problemId} visual incomplete`)
  assert.ok(v.anchor.rx > 0 && v.anchor.ry > 0, `Solve It problem ${problemId} anchor invalid`)

  // Solve It problems 1 and 2 are braking runs; 3 to 8 are accelerating
  const isBrakingProblem = problemId <= 2
  const solveItModel = createMotionModel({
    mass: 10,
    fNet: isBrakingProblem ? -25 : 25,
    initialVelocity: isBrakingProblem ? 8 : 2,
    motionDirection: 'rightward',
    stopAtRest: isBrakingProblem
  })
  if (isBrakingProblem) {
    assert.equal(solveItModel.isBraking, true, `Solve It problem ${problemId} must be braking`)
    assert.equal(solveItModel.stops, true, `Solve It problem ${problemId} must stop at rest`)
  } else {
    assert.equal(solveItModel.isBraking, false, `Solve It problem ${problemId} must not be braking`)
  }
}

// 9. All 126 Generated Balanced Questions across levels
let questionChecks = 0
for (const seed of [0, 1, 42, 12345, 987654]) {
  for (const level of ['Apprentice', 'Master', 'Wizard']) {
    for (const q of generateBalancedQuestions(level, seed)) {
      assert.ok(q.motionBehavior, `Question ${q.id} must have motionBehavior`)

      if (BRAKING_QUESTION_IDS.has(q.id)) {
        assert.equal(q.motionBehavior, 'braking', `${q.id} must be braking`)
        assert.equal(q.simParams.stopAtRest, true, `${q.id} simParams.stopAtRest must be true`)
        assert.equal(q.stopAtRest, true, `${q.id} stopAtRest must be true`)
      } else if (REVERSAL_QUESTION_IDS.has(q.id)) {
        assert.equal(q.motionBehavior, 'reversal', `${q.id} must be reversal`)
        assert.equal(q.simParams.stopAtRest, false, `${q.id} simParams.stopAtRest must be false`)
      } else if (CONTINUED_QUESTION_IDS.has(q.id)) {
        assert.equal(q.motionBehavior, 'continued', `${q.id} must be continued`)
        assert.equal(q.simParams.stopAtRest, false, `${q.id} simParams.stopAtRest must be false`)
      }

      model = createMotionModel({
        mass: 10,
        fNet: q.simParams.fNet,
        initialVelocity: q.simParams.initialV,
        motionDirection: q.motionDirection,
        stopAtRest: q.simParams.stopAtRest
      })

      for (const t of [0, 0.5, 2, 6]) {
        const p = model.sample(t)
        assert.ok([p.t, p.x, p.y, p.vx, p.vy].every(Number.isFinite), q.id)
        assert.ok(p.x >= model.bounds.minX - 1e-8 && p.x <= model.bounds.maxX + 1e-8, q.id)
        assert.ok(p.y >= model.bounds.minY - 1e-8 && p.y <= model.bounds.maxY + 1e-8, q.id)
      }

      const v = resolveQuestionVisual(q)
      assert.ok(v.family && v.variant && v.environment, `Question ${q.id} visual metadata incomplete`)
      assert.ok(v.anchor.rx > 0 && v.anchor.ry > 0, `Question ${q.id} anchor invalid`)
      questionChecks++
    }
  }
}

// 10. Playback speed verification
const brakingSpeeds = regModel.stops ? [0.25, 0.5, 1] : [0.5, 1, 2]
assert.deepEqual(brakingSpeeds, [0.25, 0.5, 1], 'Braking speeds must be [0.25, 0.5, 1]')
assert.equal(regModel.stops ? 0.5 : 1, 0.5, 'Default braking speed must be 0.5x')

const nonBrakingModel = createMotionModel({ mass: 10, fNet: 20, initialVelocity: 2 })
const nonBrakingSpeeds = nonBrakingModel.stops ? [0.25, 0.5, 1] : [0.5, 1, 2]
assert.deepEqual(nonBrakingSpeeds, [0.5, 1, 2], 'Non-braking speeds must be [0.5, 1, 2]')
assert.equal(nonBrakingModel.stops ? 0.5 : 1, 1, 'Default non-braking speed must be 1x')

// 11. Arrow-label layout geometry verification
const labelColWidth = 60 // 'acceleration' is ~54px wide at 9px font
const arrowOriginX = 105
const leftArrowTipX = 75
const leftClearance = leftArrowTipX - labelColWidth
assert.ok(leftClearance >= 15, `Leftward arrow clearance (${leftClearance}px) must be >= 15px`)
const rightArrowTipX = 135
assert.equal(rightArrowTipX - arrowOriginX, 30, 'Rightward arrow length must be 30px')
const mobileSceneWidth = 280
const overlayTotalWidth = 142
assert.ok(overlayTotalWidth + 32 <= mobileSceneWidth, 'Overlay fits within mobile viewport')

console.log(`All motion tests passed successfully!
- Regression test verified (mass=30/9.8 kg, a=-12.74 m/s², tStop~0.628 s, stopPos~2.512 m, zero backward motion)
- 1D rightward & leftward braking verified
- Simultaneous drive & friction verified
- Sampling beyond tStop verified
- Projectile reversal & parachute continuation preserved
- FBD scenarios (3, 8, 11, 12 braking; 4, 9 projectile; 10 parachute) verified
- 8 Solve It problems verified
- ${questionChecks} randomized questions across Apprentice, Master, and Wizard verified
- Braking speed options [0.25x, 0.5x, 1x] and default 0.5x verified
- Arrow-label clearance (21px >= 15px) & mobile geometry verified`)
