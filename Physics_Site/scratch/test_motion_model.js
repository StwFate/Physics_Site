import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createMotionModel, motionFromScenario } from '../src/utils/motionModel.js'
import { generateBalancedQuestions } from '../src/utils/balancedForcesGenerator.js'
import { resolveQuestionVisual, resolveFBDVisual, resolveSolveItVisual } from '../src/utils/motionVisuals.js'

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`)
let model = createMotionModel({ mass: 10, fNet: 0, initialVelocity: 4 })
close(model.sample(6).x, 24)
close(model.sample(6).vx, 4)
model = createMotionModel({ mass: 10, fNet: 20, initialVelocity: 2 })
close(model.sample(3).x, 15)
close(model.sample(3).vx, 8)
// No arbitrary maximum speed: a = F / m for the entire run.
close(model.sample(6).vx, 14)
model = createMotionModel({ mass: 2, fNet: 20, initialVelocity: 2 })
close(model.sample(6).vx, 62)
model = createMotionModel({ mass: 10, fNet: -20, initialVelocity: 4, stopAtRest: true })
close(model.duration, 2)
close(model.sample(9).vx, 0)
close(model.sample(9).x, 4)
model = createMotionModel({ mass: 10, fNet: -20, initialVelocity: 4, motionDirection: 'leftward' })
close(model.sample(2).vx, -8)
model = createMotionModel({ mass: 10, fNet: -20, initialVelocity: 4, motionDirection: 'upward' })
close(model.sample(1).y, 3)
close(model.sample(3).vy, -2)

const scenarios = JSON.parse(readFileSync(new URL('../src/data/fbdScenarios.json', import.meta.url)))
for (const scenario of scenarios) {
  const params = motionFromScenario(scenario)
  model = createMotionModel(params)
  const horizontal = Number(scenario.answerCode[4]), vertical = Number(scenario.answerCode[5])
  assert.equal(Math.sign(model.force.x), horizontal === 1 ? 1 : horizontal === 2 ? -1 : 0)
  assert.equal(Math.sign(model.force.y), vertical === 1 ? 1 : vertical === 2 ? -1 : 0)
  if (scenario.id === 4 || scenario.id === 9) {
    close(model.a.y, -9.8)
    close(model.sample(1).vx, 6)
    close(model.sample(1).vy, (scenario.id === 4 ? 8 : 0) - 9.8)
  }
  assert.ok(params.visual, `Scenario ${scenario.id} must include visual metadata`)
  assert.ok(params.visual.family && params.visual.variant && params.visual.environment, `Scenario ${scenario.id} has incomplete visual metadata`)
  assert.ok(params.visual.anchor.rx > 0 && params.visual.anchor.ry > 0, `Scenario ${scenario.id} has invalid anchor`)
}

// Solve It visual checks (problems 1 to 8)
for (let problemId = 1; problemId <= 8; problemId++) {
  const v = resolveSolveItVisual(problemId)
  assert.ok(v.family && v.variant && v.environment, `Solve It problem ${problemId} visual incomplete`)
  assert.ok(v.anchor.rx > 0 && v.anchor.ry > 0, `Solve It problem ${problemId} anchor invalid`)
}

let questionChecks = 0
for (const seed of [0, 1, 42, 12345, 987654]) {
  for (const level of ['Apprentice', 'Master', 'Wizard']) {
    for (const q of generateBalancedQuestions(level, seed)) {
      model = createMotionModel({ mass: 10, fNet: q.simParams.fNet, initialVelocity: q.simParams.initialV, motionDirection: q.motionDirection })
      for (const t of [0, 0.5, 2, 6]) {
        const p = model.sample(t)
        assert.ok(Object.values(p).every(Number.isFinite), q.id)
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
console.log(`Motion checks passed: analytic motion, signs, stopping, 12 FBD scenarios, 8 Solve It problems, ${questionChecks} generated question instances with personalized visuals.`)

