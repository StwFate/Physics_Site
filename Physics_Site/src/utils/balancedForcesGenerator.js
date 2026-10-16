// Procedural Question Generator for Balanced vs. Unbalanced Forces
// True PRNG generation parameterized by seed.
// - Apprentice: exactly 24 distinct Force Diagram questions (3x mastery requirement of 8)
// - Master: exactly 42 distinct questions: Position-Time Graphs, Dot Diagrams, Multi-Force Diagrams (3x mastery requirement of 14)
// - Wizard: exactly 60 distinct questions: Velocity-Time Graphs, Kinematic Tables, Advanced Multi-Force Scenarios (3x mastery requirement of 20)
// Total: 126 questions across three levels. Zero overlap across levels; every question dynamically adapts to the seed.

function createRng(seed) {
  let s = (seed >>> 0) + 0x6D2B79F5
  return function () {
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    s = (s + 0x6D2B79F5) >>> 0
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]
const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min


export const BRAKING_QUESTION_IDS = new Set([
  'apprentice-3', 'apprentice-10', 'apprentice-14', 'apprentice-16', 'apprentice-21',
  'master-3', 'master-6', 'master-9', 'master-12', 'master-17', 'master-20',
  'master-28', 'master-30', 'master-35', 'master-37', 'master-41',
  'wizard-3', 'wizard-6', 'wizard-9', 'wizard-12', 'wizard-15', 'wizard-24',
  'wizard-26', 'wizard-30', 'wizard-34', 'wizard-36', 'wizard-39', 'wizard-43',
  'wizard-48', 'wizard-52', 'wizard-53', 'wizard-57'
])

export const REVERSAL_QUESTION_IDS = new Set([
  'apprentice-8', 'master-23'
])

export const CONTINUED_QUESTION_IDS = new Set([
  'apprentice-13', 'master-26', 'wizard-18', 'wizard-56'
])

export function tagQuestionMotion(q) {
  if (BRAKING_QUESTION_IDS.has(q.id)) {
    q.motionBehavior = 'braking'
    q.stopAtRest = true
    if (q.simParams) q.simParams.stopAtRest = true
  } else if (REVERSAL_QUESTION_IDS.has(q.id)) {
    q.motionBehavior = 'reversal'
    q.stopAtRest = false
    if (q.simParams) q.simParams.stopAtRest = false
  } else if (CONTINUED_QUESTION_IDS.has(q.id)) {
    q.motionBehavior = 'continued'
    q.stopAtRest = false
    if (q.simParams) q.simParams.stopAtRest = false
  } else {
    q.motionBehavior = q.motionAnswer === 'Constant Speed' ? 'constant' : 'accelerating'
    q.stopAtRest = false
    if (q.simParams) q.simParams.stopAtRest = false
  }
  return q
}

export function generateBalancedQuestions(level, seed = 0) {
  const rng = createRng(seed)

  const hBoxes = ['wooden crate', 'cargo trunk', 'storage container', 'metal equipment box', 'shipping package', 'heavy toolbox']
  const gliders = ['hockey puck', 'curling stone', 'low-friction sled', 'gliding cart', 'air-track glider', 'hover puck']
  const lifts = ['service elevator', 'cargo hoist', 'mining bucket', 'aerial platform', 'cable car', 'window-washing rig']
  const aerials = ['weather capsule', 'model rocket', 'skydiver', 'science probe', 'descending payload', 'drone']
  const vehicles = ['delivery van', 'freight truck', 'sports coupe', 'hybrid sedan', 'electric roadster', 'cargo train']
  const balls = ['bowling ball', 'tennis ball', 'soccer ball', 'baseball', 'basketball', 'steel bearing']
  const marineCraft = ['submersible probe', 'acoustic submarine', 'research hovercraft', 'motorized watercraft']

  // ==========================================
  // APPRENTICE LEVEL: 24 Questions (Force Diagrams)
  // ==========================================
  if (level === 'Apprentice') {
    const questions = []

    // 1. Rightward box, no horizontal forces, balanced
    const b1 = pick(rng, hBoxes)
    const fv1 = randInt(rng, 25, 45)
    questions.push({
      id: 'apprentice-1',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `The diagram represents the forces acting upon a rightward-moving ${b1}. Each arrow represents a force, and arrow length indicates magnitude.`,
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The upward normal force (FN) and downward gravity force (Fg) are equal in magnitude (as indicated by equal arrow lengths) and opposite in direction. There are no horizontal forces. Because the net force is zero (Fnet = 0), the forces are balanced, and the object maintains a constant speed.`,
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: fv1, dir: 'up' }, { name: 'F_grav', value: fv1, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 2. Rightward box, Fa > Ff, speeding up
    const b2 = pick(rng, hBoxes)
    const pull2 = randInt(rng, 40, 55)
    const frict2 = randInt(rng, 12, 22)
    questions.push({
      id: 'apprentice-2',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A rightward-moving ${b2} is pulled across a floor. Vertical forces are equal in magnitude, but the rightward pull exceeds the leftward friction as shown by the arrow lengths.`,
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `Vertical forces balance out (FN and Fg are equal in magnitude and opposite in direction). The rightward applied force (Fa) is larger than the leftward friction force (Ff), as indicated by the longer arrow. The net force is directed to the right (in the direction of motion), causing the object to accelerate and speed up under unbalanced forces.`,
      simParams: { fNet: pull2 - frict2, initialV: 2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: pull2, dir: 'right' }, { name: 'F_frict', value: frict2, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fa' },
          { dir: 'left', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // 3. Rightward glider, only leftward friction, slowing down
    const g3 = pick(rng, gliders)
    const frict3 = randInt(rng, 20, 35)
    questions.push({
      id: 'apprentice-3',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A rightward-moving ${g3} glides across a rough surface. Only friction acts along the horizontal axis.`,
      motionDirection: 'rightward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: `Vertical forces balance (FN and Fg are equal in magnitude and opposite in direction). The only horizontal force is leftward friction (Ff). Because the net force is directed opposite to the rightward motion, the object slows down under an unbalanced net force.`,
      simParams: { stopAtRest: true,  fNet: -frict3, initialV: 7, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: frict3, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // 4. Leftward box, Fa == Ff, constant speed
    const b4 = pick(rng, hBoxes)
    const bal4 = randInt(rng, 20, 35)
    questions.push({
      id: 'apprentice-4',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${b4} slides leftward across the floor while being pushed with a force exactly equal in magnitude to opposing friction.`,
      motionDirection: 'leftward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The leftward applied push (Fa) equals the rightward friction force (Ff) in magnitude (as shown by equal arrow lengths), and vertical forces balance (FN = Fg). Because the net force is zero (Fnet = 0), the forces are balanced, and the object continues to move at constant speed.`,
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: bal4, dir: 'left' }, { name: 'F_frict', value: bal4, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
          { dir: 'right', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // 5. Leftward box, Fa > Ff, speeding up
    const b5 = pick(rng, hBoxes)
    const push5 = randInt(rng, 42, 58)
    const drag5 = randInt(rng, 14, 22)
    questions.push({
      id: 'apprentice-5',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A leftward-moving ${b5} is propelled leftward with a force that exceeds opposing drag, as indicated by the arrow lengths.`,
      motionDirection: 'leftward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `The leftward applied force (Fa) is larger than the rightward drag (Ff), as shown by the longer arrow. The resulting net force is directed to the left (in the direction of motion). This unbalanced net force causes leftward acceleration, so the object speeds up.`,
      simParams: { fNet: -(push5 - drag5), initialV: -2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: push5, dir: 'left' }, { name: 'F_frict', value: drag5, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'large', code: 'Fapp', label: 'Fa' },
          { dir: 'right', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // 6. Upward lift, FT == Fg, constant speed
    const l6 = pick(rng, lifts)
    const tens6 = randInt(rng, 30, 45)
    questions.push({
      id: 'apprentice-6',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${l6} ascends vertically through a shaft. The upward cable tension matches downward gravity in magnitude.`,
      motionDirection: 'upward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The upward tension force (FT) and downward gravity force (Fg) are equal in magnitude (as indicated by equal arrow lengths) and opposite in direction. Because the net force is zero (Fnet = 0), the forces are balanced, and the object travels upward at a constant speed.`,
      simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_tens', value: tens6, dir: 'up' }, { name: 'F_grav', value: tens6, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 7. Downward skydiver, Fg > Fair, speeding up
    const s7 = pick(rng, aerials)
    const grav7 = randInt(rng, 45, 60)
    const air7 = randInt(rng, 15, 25)
    questions.push({
      id: 'apprentice-7',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${s7} plunges downward soon after release. Downward gravity exceeds upward air resistance, as shown by the arrow lengths.`,
      motionDirection: 'downward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `Gravity (Fg) pulls downward with greater magnitude than upward air resistance (Fair), as shown by the longer downward arrow. The unbalanced downward net force acts in the direction of downward motion, accelerating the object downward and speeding it up.`,
      simParams: { fNet: -(grav7 - air7), initialV: -3, forces: [{ name: 'F_air', value: air7, dir: 'up' }, { name: 'F_grav', value: grav7, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'small', code: 'Fair', label: 'Fair' },
          { dir: 'down', magnitude: 'large', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 8. Upward ball, only Fg downwards, slowing down
    const ball8 = pick(rng, balls)
    const grav8 = randInt(rng, 20, 30)
    questions.push({
      id: 'apprentice-8',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${ball8} rises upward after being launched. Ignoring air resistance, only downward gravity acts upon it.`,
      motionDirection: 'upward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'reversal',
      explanation: `The object moves upward, but the only force acting is downward gravity (Fg). The unbalanced downward force opposes the upward motion, causing the object to slow down.`,
      simParams: { stopAtRest: false,  fNet: -grav8, initialV: 6, forces: [{ name: 'F_grav', value: grav8, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 9. Rightward crate, Fa == Ff, constant speed
    const b9 = pick(rng, hBoxes)
    const bal9 = randInt(rng, 25, 40)
    questions.push({
      id: 'apprentice-9',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${b9} is pulled rightward across a warehouse floor. The rightward pulling force matches opposing friction in magnitude.`,
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The rightward pull (Fa) and leftward friction (Ff) are equal in magnitude (as shown by equal arrow lengths) and opposite in direction. The normal force (FN) also balances gravity (Fg). Because the net force is zero, the forces are balanced and the speed is constant.`,
      simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: bal9, dir: 'right' }, { name: 'F_frict', value: bal9, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
          { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // 10. Leftward sled, only rightward friction, slowing down
    const g10 = pick(rng, gliders)
    const frict10 = randInt(rng, 22, 36)
    questions.push({
      id: 'apprentice-10',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${g10} slides leftward across rough ice without being pushed. Friction opposes the motion to the right.`,
      motionDirection: 'leftward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: `The normal force and gravity cancel each other vertically. The only horizontal force is rightward friction (Ff), which directly opposes the leftward motion. This unbalanced net force causes the object to slow down.`,
      simParams: { stopAtRest: true,  fNet: frict10, initialV: -6, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: frict10, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // 11. Downward payload with parachute, Fair == Fg, constant speed
    const a11 = pick(rng, aerials)
    const air11 = randInt(rng, 30, 45)
    questions.push({
      id: 'apprentice-11',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${a11} descends vertically under a parachute at terminal velocity, where upward air resistance equals downward gravity.`,
      motionDirection: 'downward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `Upward air resistance (Fair) matches downward gravity (Fg) in magnitude (as shown by equal arrow lengths). With equal and opposite vertical forces, the net force is zero (Fnet = 0), meaning forces are balanced and the descent continues at constant speed.`,
      simParams: { fNet: 0, initialV: -4, forces: [{ name: 'F_air', value: air11, dir: 'up' }, { name: 'F_grav', value: air11, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fair', label: 'Fair' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 12. Upward rocket, Fthrust > Fg, speeding up
    const a12 = pick(rng, ['model rocket', 'space probe', 'sounding rocket', 'survey drone'])
    const thrust12 = randInt(rng, 50, 65)
    const grav12 = randInt(rng, 20, 30)
    questions.push({
      id: 'apprentice-12',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${a12} launches vertically. The upward engine thrust exceeds downward gravity, as shown by the arrow lengths.`,
      motionDirection: 'upward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `The upward thrust arrow (Fthrust) is noticeably longer than the downward gravity arrow (Fg). Because the net force points upward in the direction of motion, the object accelerates upward and speeds up under unbalanced forces.`,
      simParams: { fNet: thrust12 - grav12, initialV: 3, forces: [{ name: 'F_thrust', value: thrust12, dir: 'up' }, { name: 'F_grav', value: grav12, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'large', code: 'Fthrust', label: 'Fthrust' },
          { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 13. Downward skydiver after chute opens, Fair > Fg, slowing down
    const a13 = pick(rng, ['parachutist', 'recovery capsule', 'airdropped cargo', 'supply crate'])
    const air13 = randInt(rng, 55, 70)
    const grav13 = randInt(rng, 25, 35)
    questions.push({
      id: 'apprentice-13',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${a13} is falling downward just after deploying a large parachute. Upward air resistance exceeds downward gravity.`,
      motionDirection: 'downward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'continued',
      explanation: `The upward air resistance (Fair) arrow is longer than the downward gravity (Fg) arrow. This upward net force opposes the downward direction of motion, causing the descending object to slow down under unbalanced forces.`,
      simParams: { stopAtRest: false,  fNet: air13 - grav13, initialV: -8, forces: [{ name: 'F_air', value: air13, dir: 'up' }, { name: 'F_grav', value: grav13, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'large', code: 'Fair', label: 'Fair' },
          { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 14. Rightward vehicle braking, Ff > Fa, slowing down
    const v14 = pick(rng, vehicles)
    const frict14 = randInt(rng, 45, 60)
    const drive14 = randInt(rng, 10, 20)
    questions.push({
      id: 'apprentice-14',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A rightward-moving ${v14} applies its brakes. Leftward braking friction exceeds forward drive force, as shown by arrow lengths.`,
      motionDirection: 'rightward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: `Vertical forces cancel (FN = Fg). The leftward braking friction arrow (Ff) is longer than the rightward drive arrow (Fa). Because the net force points leftward, opposing the rightward motion, the vehicle slows down under unbalanced forces.`,
      simParams: { stopAtRest: true,  fNet: -(frict14 - drive14), initialV: 8, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: frict14, dir: 'left' }, { name: 'F_app', value: drive14, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'large', code: 'Ffrict', label: 'Ff' },
          { dir: 'right', magnitude: 'small', code: 'Fapp', label: 'Fa' }
        ]
      }
    })

    // 15. Leftward glider, FN == Fg, no horizontal forces, constant speed
    const g15 = pick(rng, gliders)
    const fv15 = randInt(rng, 20, 35)
    questions.push({
      id: 'apprentice-15',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${g15} drifts leftward along a frictionless track with only vertical support forces acting.`,
      motionDirection: 'leftward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The upward normal force (FN) exactly equals the downward gravity force (Fg), and there are no horizontal forces acting. With a net force of zero (Fnet = 0), forces are balanced and the object coasts leftward at constant speed.`,
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: fv15, dir: 'up' }, { name: 'F_grav', value: fv15, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 16. Leftward cart braking, Ff (right) > Fa (left), slowing down
    const b16 = pick(rng, hBoxes)
    const frict16 = randInt(rng, 40, 55)
    const push16 = randInt(rng, 10, 20)
    questions.push({
      id: 'apprentice-16',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${b16} slides leftward across rough ground while being pushed lightly leftward. Opposing friction is significantly larger.`,
      motionDirection: 'leftward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: `Vertical forces balance (FN = Fg). The rightward friction arrow (Ff) is longer than the leftward applied push arrow (Fa). Because the net force points rightward, opposing the leftward motion, the object slows down under unbalanced forces.`,
      simParams: { stopAtRest: true,  fNet: frict16 - push16, initialV: -7, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: frict16, dir: 'right' }, { name: 'F_app', value: push16, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'large', code: 'Ffrict', label: 'Ff' },
          { dir: 'left', magnitude: 'small', code: 'Fapp', label: 'Fa' }
        ]
      }
    })

    // 17. Rightward sled on ice, Fa to right only, speeding up
    const g17 = pick(rng, gliders)
    const push17 = randInt(rng, 25, 40)
    questions.push({
      id: 'apprentice-17',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A rightward-moving ${g17} on frictionless ice is pushed forward by a horizontal applied force with zero friction.`,
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `Vertical forces balance out (FN = Fg). The only horizontal force is the rightward applied force (Fa). Since the net force is directed rightward in the direction of motion, the object speeds up under an unbalanced net force.`,
      simParams: { fNet: push17, initialV: 2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: push17, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa' }
        ]
      }
    })

    // 18. Leftward booster cart, Fthrust to left only, speeding up
    const b18 = pick(rng, hBoxes)
    const thrust18 = randInt(rng, 30, 45)
    questions.push({
      id: 'apprentice-18',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A leftward-moving ${b18} fires a gas thruster to the left. Neglecting friction, only thrust acts horizontally.`,
      motionDirection: 'leftward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `Vertical forces balance (FN = Fg). The leftward thrust force (Fthrust) is unopposed. Because the net force points leftward in the direction of motion, the object accelerates leftward and speeds up under unbalanced forces.`,
      simParams: { fNet: -thrust18, initialV: -2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_thrust', value: thrust18, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'medium', code: 'Fthrust', label: 'Fthrust' }
        ]
      }
    })

    // 19. Upward balloon, Fb == Fg, constant speed
    const a19 = pick(rng, ['weather balloon', 'surveillance aerostat', 'hot-air balloon', 'helium blimp'])
    const buoy19 = randInt(rng, 30, 45)
    questions.push({
      id: 'apprentice-19',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${a19} ascends steadily through calm air. The upward buoyant force matches downward gravity in magnitude.`,
      motionDirection: 'upward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The upward buoyant force (Fb) and downward gravity force (Fg) have equal arrow lengths and opposite directions. Because the net vertical force is zero (Fnet = 0), forces are balanced and the ascent occurs at constant speed.`,
      simParams: { fNet: 0, initialV: 3, forces: [{ name: 'F_buoy', value: buoy19, dir: 'up' }, { name: 'F_grav', value: buoy19, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fbuoy', label: 'Fb' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 20. Downward hoist, FT == Fg, constant speed
    const l20 = pick(rng, lifts)
    const tens20 = randInt(rng, 30, 45)
    questions.push({
      id: 'apprentice-20',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${l20} descends into a shaft. The upward cable tension matches downward gravity in magnitude as indicated by equal arrow lengths.`,
      motionDirection: 'downward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The upward cable tension (FT) and downward gravity force (Fg) are equal in magnitude and opposite in direction. With zero net force (Fnet = 0), forces are balanced, and the descending object maintains a constant speed.`,
      simParams: { fNet: 0, initialV: -4, forces: [{ name: 'F_tens', value: tens20, dir: 'up' }, { name: 'F_grav', value: tens20, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 21. Upward elevator approaching floor, Fg > FT, slowing down
    const l21 = pick(rng, lifts)
    const grav21 = randInt(rng, 45, 60)
    const tens21 = randInt(rng, 15, 25)
    questions.push({
      id: 'apprentice-21',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `An upward-moving ${l21} slows as it reaches the top floor. Downward gravity exceeds upward cable tension as shown by the arrow lengths.`,
      motionDirection: 'upward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: `The downward gravity arrow (Fg) is longer than the upward cable tension arrow (FT). Because the net force points downward, directly opposing the upward motion, the object slows down under unbalanced forces.`,
      simParams: { stopAtRest: true,  fNet: -(grav21 - tens21), initialV: 5, forces: [{ name: 'F_tens', value: tens21, dir: 'up' }, { name: 'F_grav', value: grav21, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'small', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'large', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 22. Downward rock in free fall, only Fg, speeding up
    const ball22 = pick(rng, balls)
    const grav22 = randInt(rng, 25, 40)
    questions.push({
      id: 'apprentice-22',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A heavy ${ball22} falls downward in free fall. Ignoring air drag, gravity is the only force acting.`,
      motionDirection: 'downward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `The only force acting is downward gravity (Fg). The unbalanced net downward force acts in the same direction as the downward motion, accelerating the object and causing it to speed up.`,
      simParams: { fNet: -grav22, initialV: -3, forces: [{ name: 'F_grav', value: grav22, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // 23. Rightward hovercraft, Fa == Fair, constant speed
    const m23 = pick(rng, ['hovercraft', 'maglev test sled', 'aerodynamic glider', 'wind-tunnel carriage'])
    const fv23 = randInt(rng, 25, 40)
    questions.push({
      id: 'apprentice-23',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${m23} cruises rightward at high speed. The forward propulsion force matches opposing aerodynamic resistance in magnitude.`,
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `Forward propulsion (Fa) and opposing aerodynamic drag (Fair) are equal in magnitude (as shown by equal arrow lengths) and opposite in direction. Vertical forces balance (FN = Fg). With zero net force, the forces are balanced and the object travels at a constant speed.`,
      simParams: { fNet: 0, initialV: 6, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fv23, dir: 'right' }, { name: 'F_air', value: fv23, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
          { dir: 'left', magnitude: 'medium', code: 'Fair', label: 'Fair' }
        ]
      }
    })

    // 24. Leftward conveyor cargo, Fa == Ff, constant speed
    const b24 = pick(rng, hBoxes)
    const fv24 = randInt(rng, 20, 35)
    questions.push({
      id: 'apprentice-24',
      level: 'Apprentice',
      representationType: 'force_diagram',
      stem: `A ${b24} travels leftward on a motorized sorting track. Forward belt drive matches opposing resistance as shown by arrow lengths.`,
      motionDirection: 'leftward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The leftward driving force (Fa) is equal in magnitude to the rightward resistive force (Ff), and vertical support forces balance (FN = Fg). With all forces balancing to zero net force, the object moves at a constant speed.`,
      simParams: { fNet: 0, initialV: -4, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fv24, dir: 'left' }, { name: 'F_frict', value: fv24, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
          { dir: 'right', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    return questions.map(tagQuestionMotion)
  }

  // ==========================================
  // MASTER LEVEL: 42 Questions (x-t Graphs, Dot Diagrams, Multi-Force Diagrams)
  // ==========================================
  if (level === 'Master') {
    const questions = []

    // --- 14 Position-Time Graph Questions (master-1 to master-14) ---
    // master-1: constant_pos
    questions.push({
      id: 'master-1',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'The graph illustrates the position of an object moving along a linear track over time at a steady velocity.',
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The position-time graph is a straight line with a constant positive slope. A constant slope means constant velocity. Zero acceleration indicates that the net force is zero, meaning forces are balanced.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 20, dir: 'right' }, { name: 'F_frict', value: 20, dir: 'left' }] },
      renderData: { type: 'position_time_graph', curveType: 'constant_pos' }
    })

    // master-2: speeding_up_pos
    questions.push({
      id: 'master-2',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'The position-time graph shows an object moving in the positive direction with a steepening curve.',
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The slope of the position-time curve gets steeper over time. Since slope equals velocity, the velocity is increasing (speeding up). An acceleration requires an unbalanced net force.',
      simParams: { fNet: 25, initialV: 2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 35, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'speeding_up_pos' }
    })

    // master-3: slowing_down_pos
    questions.push({
      id: 'master-3',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'The position-time graph shows an object whose path flattens out horizontally over time.',
      motionDirection: 'positive',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The slope of the position-time curve decreases toward zero (flattening out). A decreasing slope means decreasing velocity (slowing down). Changing velocity requires an unbalanced force.',
      simParams: { stopAtRest: true,  fNet: -25, initialV: 7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 30, dir: 'left' }] },
      renderData: { type: 'position_time_graph', curveType: 'slowing_down_pos' }
    })

    // master-4: constant_neg
    questions.push({
      id: 'master-4',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'The graph shows the position of an object moving in the negative direction along a straight line.',
      motionDirection: 'negative',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The graph is a straight line with a constant negative slope. The object covers equal negative distance each second. Because velocity is constant, acceleration is zero, indicating balanced forces.',
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 20, dir: 'left' }, { name: 'F_frict', value: 20, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'constant_neg' }
    })

    // master-5: speeding_up_neg
    questions.push({
      id: 'master-5',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'The position-time graph shows an object moving in the negative direction with an increasingly steep downward curve.',
      motionDirection: 'negative',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The curve bends downward with an increasingly negative slope. Because speed is the absolute magnitude of slope, speed is increasing in the negative direction. An unbalanced force accelerates the object.',
      simParams: { fNet: -25, initialV: -2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 35, dir: 'left' }] },
      renderData: { type: 'position_time_graph', curveType: 'speeding_up_neg' }
    })

    // master-6: slowing_down_neg
    questions.push({
      id: 'master-6',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'The position-time graph shows an object moving in the negative direction whose curve flattens toward horizontal.',
      motionDirection: 'negative',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The negative slope of the curve becomes less steep (flatter) over time. Because the magnitude of velocity is decreasing, the object is slowing down. An unbalanced force opposing the negative motion produces this deceleration.',
      simParams: { stopAtRest: true,  fNet: 25, initialV: -7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'slowing_down_neg' }
    })

    // master-7: constant_pos (toy car)
    questions.push({
      id: 'master-7',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'A motorized model car runs along a guided track. Its position vs. time data forms a perfectly straight diagonal line.',
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'A straight diagonal line on an x-t graph represents constant velocity. The slope does not change, indicating that acceleration is zero. According to Newton\'s first law, zero acceleration means forces are balanced.',
      simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 15, dir: 'right' }, { name: 'F_frict', value: 15, dir: 'left' }] },
      renderData: { type: 'position_time_graph', curveType: 'constant_pos' }
    })

    // master-8: speeding_up_pos (scooter)
    questions.push({
      id: 'master-8',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'A commuter on an electric scooter throttles forward. The recorded position curve curves upward more steeply each second.',
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'As time advances, the tangent slope of the position curve becomes steeper. Because slope represents velocity, the scooter is speeding up in the positive direction. Speeding up requires an unbalanced forward net force.',
      simParams: { fNet: 28, initialV: 2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 38, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'speeding_up_pos' }
    })

    // master-9: slowing_down_pos (skateboard)
    questions.push({
      id: 'master-9',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'A coasting skateboarder moves forward into grass. The position curve levels off to a horizontal line.',
      motionDirection: 'positive',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The curve bends and its slope decreases toward zero (horizontal). Decreasing slope represents decreasing speed, meaning the skateboard is slowing down. An unbalanced opposing friction force produces this effect.',
      simParams: { stopAtRest: true,  fNet: -24, initialV: 6, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 30, dir: 'left' }] },
      renderData: { type: 'position_time_graph', curveType: 'slowing_down_pos' }
    })

    // master-10: constant_neg (delivery cart return)
    questions.push({
      id: 'master-10',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'An automated delivery cart returns toward its charging dock in the negative direction, tracing a linear position graph with steady negative slope.',
      motionDirection: 'negative',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'Because the position-time graph has a constant linear slope, velocity is constant. No curvature means zero acceleration, which indicates that all forces acting on the cart are balanced.',
      simParams: { fNet: 0, initialV: -4, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 18, dir: 'left' }, { name: 'F_frict', value: 18, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'constant_neg' }
    })

    // master-11: speeding_up_neg (descending elevator)
    questions.push({
      id: 'master-11',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'A mining hoist begins descending downward into a shaft. The position-time curve bends downward with an increasingly steep slope.',
      motionDirection: 'negative',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The slope becomes steeper in the negative direction, meaning the magnitude of velocity (|v|) is increasing. The hoist is speeding up downward. An unbalanced downward net force accelerates the hoist.',
      simParams: { fNet: -30, initialV: -1, forces: [{ name: 'F_grav', value: 45, dir: 'down' }, { name: 'F_tens', value: 15, dir: 'up' }] },
      renderData: { type: 'position_time_graph', curveType: 'speeding_up_neg' }
    })

    // master-12: slowing_down_neg (rover braking)
    questions.push({
      id: 'master-12',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'A planetary rover traveling in the negative direction engages retro-brakes. Its position curve flattens out horizontally near the bottom.',
      motionDirection: 'negative',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The slope of the position-time curve transitions from a steep negative angle toward horizontal (zero slope). Since speed is the steepness of slope, the rover is slowing down. An unbalanced force opposing the negative motion causes this deceleration.',
      simParams: { stopAtRest: true,  fNet: 26, initialV: -6, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'slowing_down_neg' }
    })

    // master-13: constant_pos (glider)
    questions.push({
      id: 'master-13',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'An ultrasonic ranger tracks an air-track glider traveling in the positive direction. The resulting graph is a uniform straight diagonal line.',
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'A straight diagonal position line confirms uniform displacement per unit time. Constant slope equals constant velocity. With zero acceleration, the net force is zero and forces are balanced.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }] },
      renderData: { type: 'position_time_graph', curveType: 'constant_pos' }
    })

    // master-14: speeding_up_pos (sprinter)
    questions.push({
      id: 'master-14',
      level: 'Master',
      representationType: 'position_time_graph',
      stem: 'A runner accelerates out of the blocks in the positive direction, generating an x-t graph that curves upward with rapidly increasing steepness.',
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The steepening slope of the position-time curve indicates an increasing velocity (speeding up). Accelerating in the positive direction requires an unbalanced positive net force.',
      simParams: { fNet: 32, initialV: 2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 40, dir: 'right' }] },
      renderData: { type: 'position_time_graph', curveType: 'speeding_up_pos' }
    })

    // --- 14 Ticker-tape Dot Diagram Questions (master-15 to master-28) ---
    // master-15: rightward constant
    questions.push({
      id: 'master-15',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A motion sensor records the position of a rightward-moving cart at equal time intervals.',
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The dots are spaced at equal distances across the tape. Covering equal distance in equal time intervals means the speed is constant. Constant speed with no directional change implies balanced forces.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 25, dir: 'right' }, { name: 'F_frict', value: 25, dir: 'left' }] },
      renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'right' }
    })

    // master-16: rightward accelerating
    questions.push({
      id: 'master-16',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A ticker tape attached to a rightward-moving vehicle leaves marks at consecutive equal time intervals.',
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The distance between consecutive dots increases as the vehicle moves to the right. The vehicle covers more distance each interval, meaning it is speeding up. Speeding up requires an unbalanced net force.',
      simParams: { fNet: 30, initialV: 2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 40, dir: 'right' }] },
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'right' }
    })

    // master-17: rightward decelerating
    questions.push({
      id: 'master-17',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A vehicle applies brakes while moving rightward, dropping oil droplets at fixed time intervals.',
      motionDirection: 'rightward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The spacing between successive drops becomes progressively smaller. Traveling less distance each interval indicates the vehicle is slowing down. Deceleration requires an unbalanced net force opposing motion.',
      simParams: { stopAtRest: true,  fNet: -25, initialV: 7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'left' }] },
      renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'right' }
    })

    // master-18: leftward constant
    questions.push({
      id: 'master-18',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A ticker-tape timer records marks as a laboratory cart glides leftward across an air table.',
      motionDirection: 'leftward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The dots are separated by identical spaces along the entire tape in the leftward direction. Constant displacement per time step means uniform speed. Forces must be balanced.',
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 20, dir: 'left' }, { name: 'F_frict', value: 20, dir: 'right' }] },
      renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'left' }
    })

    // master-19: leftward accelerating
    questions.push({
      id: 'master-19',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'The dot diagram records the position of an object moving leftward at equal time increments.',
      motionDirection: 'leftward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The spacing between dots increases in the leftward direction of motion. Covering increasing distance to the left means leftward acceleration (speeding up). An unbalanced force is responsible.',
      simParams: { fNet: -30, initialV: -2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 40, dir: 'left' }] },
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'left' }
    })

    // master-20: leftward decelerating
    questions.push({
      id: 'master-20',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A sled glides leftward onto dry gravel, recording positions at equal time intervals.',
      motionDirection: 'leftward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The spacing between dots shrinks as the sled travels leftward. The sled covers less distance per second and is slowing down due to an unbalanced rightward friction force.',
      simParams: { stopAtRest: true,  fNet: 25, initialV: -7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
      renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'left' }
    })

    // master-21: upward constant
    questions.push({
      id: 'master-21',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A vertical logging tape records positions of a weather capsule ascending upward through a test tower at equal time intervals.',
      motionDirection: 'upward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The vertical spacing between successive dots is constant all the way up the tape. Because equal vertical distance is covered in each interval, the capsule ascends at constant speed. Forces are balanced.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_buoy', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'up' }
    })

    // master-22: upward accelerating
    questions.push({
      id: 'master-22',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A spark generator records positions of an ascending model rocket every tenth of a second.',
      motionDirection: 'upward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The spacing between consecutive dots expands in the upward direction. Covering greater vertical distance each interval indicates upward acceleration (speeding up). An unbalanced upward net force is required.',
      simParams: { fNet: 30, initialV: 2, forces: [{ name: 'F_thrust', value: 50, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'up' }
    })

    // master-23: upward decelerating
    questions.push({
      id: 'master-23',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A vertical strobe flashes at regular intervals as a ball rises upward toward the peak of its trajectory.',
      motionDirection: 'upward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'reversal',
      explanation: 'The gap between successive flashes becomes smaller near the top. Traveling less distance each interval means the ball is slowing down. The downward force of gravity opposes the upward motion, creating an unbalanced decelerating force.',
      simParams: { stopAtRest: false,  fNet: -25, initialV: 7, forces: [{ name: 'F_grav', value: 25, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'up' }
    })

    // master-24: downward constant
    questions.push({
      id: 'master-24',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A descending elevator carriage leaves position markers at equal time increments on a guide rail.',
      motionDirection: 'downward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The downward spacing between marks is perfectly uniform from top to bottom. Constant vertical displacement per interval proves constant descent speed. Upward cable tension balances gravity.',
      simParams: { fNet: 0, initialV: -4, forces: [{ name: 'F_tens', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'down' }
    })

    // master-25: downward accelerating
    questions.push({
      id: 'master-25',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A steel sphere drops through an evacuated tube, illuminated by a strobe flashing at uniform time intervals.',
      motionDirection: 'downward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The distance between consecutive flashes grows larger as the sphere moves downward. The sphere covers more distance each interval, demonstrating that it is speeding up. Unbalanced gravity causes this downward acceleration.',
      simParams: { fNet: -28, initialV: -2, forces: [{ name: 'F_grav', value: 28, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'down' }
    })

    // master-26: downward decelerating
    questions.push({
      id: 'master-26',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A descending payload deploys a parachute, and its position is tracked at equal time steps.',
      motionDirection: 'downward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'continued',
      explanation: 'The downward spacing between markers contracts steadily. The payload travels less distance during each time step, which means it is slowing down under an upward net force from the parachute.',
      simParams: { stopAtRest: false,  fNet: 25, initialV: -8, forces: [{ name: 'F_air', value: 55, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'down' }
    })

    // master-27: rightward accelerating (oil trail)
    questions.push({
      id: 'master-27',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A delivery truck drives rightward away from a loading dock, dripping fluid onto the road at steady 0.5-second intervals.',
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The spacing between fluid drops increases in the rightward direction of travel. Covering greater distance each interval demonstrates that the truck is speeding up under an unbalanced forward net force.',
      simParams: { fNet: 32, initialV: 2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_net', value: 42, dir: 'right' }] },
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'right' }
    })

    // master-28: leftward decelerating (friction slide)
    questions.push({
      id: 'master-28',
      level: 'Master',
      representationType: 'dot_diagram',
      stem: 'A hockey puck shoots leftward onto a rubberized training strip, marking its position every 0.1 seconds.',
      motionDirection: 'leftward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The spacing between marks shrinks progressively in the direction of leftward travel. Because the puck travels less distance each interval, it is slowing down due to opposing friction.',
      simParams: { stopAtRest: true,  fNet: 26, initialV: -7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
      renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'left' }
    })

    // --- 14 Multi-Force Diagram Questions (master-29 to master-42) ---
    // master-29: rightward dual push speeding up
    const fApp29_1 = randInt(rng, 25, 35)
    const fApp29_2 = randInt(rng, 15, 25)
    const fFrict29 = randInt(rng, 15, 25)
    questions.push({
      id: 'master-29',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A rightward-moving crate is pushed by two forward workers while ground friction opposes, as represented in the force diagram.',
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The combined rightward applied forces (Fa1 + Fa2) exceed the opposing leftward friction force (Ff), as shown by the longer rightward arrow. The net force is directed to the right (in the direction of motion), so the crate speeds up under unbalanced forces.',
      simParams: { fNet: fApp29_1 + fApp29_2 - fFrict29, initialV: 3, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app1', value: fApp29_1, dir: 'right' }, { name: 'F_app2', value: fApp29_2, dir: 'right' }, { name: 'F_frict', value: fFrict29, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fa1 + Fa2' },
          { dir: 'left', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // master-30: rightward friction exceeds push slowing down
    const fFrict30 = randInt(rng, 40, 55)
    const fApp30 = randInt(rng, 15, 25)
    questions.push({
      id: 'master-30',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A rightward-moving trunk is pushed rightward, but ground friction is significantly stronger, as indicated by the arrow lengths.',
      motionDirection: 'rightward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The leftward friction force (Ff) exceeds the rightward applied push (Fa), as shown by the longer leftward arrow. The net horizontal force points to the left, opposing the rightward motion and causing the trunk to slow down under unbalanced forces.',
      simParams: { stopAtRest: true,  fNet: -(fFrict30 - fApp30), initialV: 6, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: fFrict30, dir: 'left' }, { name: 'F_app', value: fApp30, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'large', code: 'Ffrict', label: 'Ff' },
          { dir: 'right', magnitude: 'small', code: 'Fapp', label: 'Fa' }
        ]
      }
    })

    // master-31: upward acoustic probe balanced
    const fTens31 = randInt(rng, 35, 50)
    questions.push({
      id: 'master-31',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A deep-sea acoustic probe is hoisted upward through water. Upward tension matches downward gravity in magnitude.',
      motionDirection: 'upward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The upward cable tension (FT) and downward gravity force (Fg) are equal in magnitude (as indicated by equal arrow lengths) and opposite in direction. Because the net force is zero (Fnet = 0), the forces are balanced, and the probe moves upward at a constant speed.',
      simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_tens', value: fTens31, dir: 'up' }, { name: 'F_grav', value: fTens31, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // master-32: upward rocket thrust exceeds Fg + Fair
    const fThrust32 = randInt(rng, 50, 65)
    const fGrav32 = randInt(rng, 18, 25)
    questions.push({
      id: 'master-32',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A probe rocket engine fires on ascent, generating an upward thrust that exceeds downward gravity and drag, as shown by the arrow lengths.',
      motionDirection: 'upward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The upward thrust arrow (Fthrust) is significantly longer than the combined downward forces (Fg + Fair). This net upward force acts in the direction of motion, causing the rocket to speed up under unbalanced forces.',
      simParams: { fNet: fThrust32 - fGrav32, initialV: 3, forces: [{ name: 'F_thrust', value: fThrust32, dir: 'up' }, { name: 'F_grav', value: fGrav32, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'large', code: 'Fthrust', label: 'Fthrust' },
          { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg + Fair' }
        ]
      }
    })

    // master-33: leftward dual pull balanced with friction
    const fBal33 = randInt(rng, 25, 40)
    questions.push({
      id: 'master-33',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A leftward-moving sled is pulled by two cables whose combined pull balances ground friction, as shown by the equal arrow lengths.',
      motionDirection: 'leftward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The combined leftward pull (FT1 + FT2) is equal in magnitude to the opposing rightward friction (Ff), and vertical forces cancel (FN = Fg). Since horizontal and vertical forces both cancel to zero net force, the sled moves at constant speed under balanced forces.',
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_tens', value: fBal33, dir: 'left' }, { name: 'F_frict', value: fBal33, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'medium', code: 'Ftens', label: 'FT1 + FT2' },
          { dir: 'right', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // master-34: rightward drive balances friction and drag
    const fBal34 = randInt(rng, 30, 45)
    questions.push({
      id: 'master-34',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A rightward-moving transport cart maintains motion where forward applied drive matches the combined opposing friction and air drag.',
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The rightward applied force arrow (Fa) has the same length as the opposing leftward resistive force arrow (Ff + Fair). Vertical normal and gravity forces cancel. With zero net force, forces are balanced and the cart maintains constant speed.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fBal34, dir: 'right' }, { name: 'F_frict', value: fBal34, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
          { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff + Fair' }
        ]
      }
    })

    // master-35: leftward motion opposed by stronger rightward force
    const fOpp35 = randInt(rng, 40, 55)
    const fFwd35 = randInt(rng, 15, 25)
    questions.push({
      id: 'master-35',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A heavy container glides leftward while being restrained by opposing rightward ropes that overcome leftward momentum.',
      motionDirection: 'leftward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The rightward restraining force arrow (Ff) is visibly longer than the leftward force arrow (Fa). Because the net force is directed to the right, opposing the leftward motion, the container slows down under unbalanced forces.',
      simParams: { stopAtRest: true,  fNet: fOpp35 - fFwd35, initialV: -6, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: fOpp35, dir: 'right' }, { name: 'F_app', value: fFwd35, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'large', code: 'Ffrict', label: 'Ff' },
          { dir: 'left', magnitude: 'small', code: 'Fapp', label: 'Fa' }
        ]
      }
    })

    // master-36: downward elevator gravity exceeds tension
    const fGrav36 = randInt(rng, 45, 60)
    const fTens36 = randInt(rng, 18, 28)
    questions.push({
      id: 'master-36',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A descending service hoist is lowered with slack in the cable. Downward gravity exceeds upward cable tension as shown by the arrow lengths.',
      motionDirection: 'downward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The downward gravity arrow (Fg) is longer than the upward tension arrow (FT). The net force acts downward in the same direction as the hoist\'s downward travel, causing it to speed up under unbalanced forces.',
      simParams: { fNet: -(fGrav36 - fTens36), initialV: -2, forces: [{ name: 'F_tens', value: fTens36, dir: 'up' }, { name: 'F_grav', value: fGrav36, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'small', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'large', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // master-37: downward elevator braking tension exceeds gravity
    const fTens37 = randInt(rng, 50, 65)
    const fGrav37 = randInt(rng, 20, 30)
    questions.push({
      id: 'master-37',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A descending elevator applies its emergency cable brakes. Upward cable tension exceeds downward gravity as shown by the arrow lengths.',
      motionDirection: 'downward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The upward tension arrow (FT) is longer than the downward gravity arrow (Fg). Because the net force points upward, opposite to the downward direction of motion, the elevator slows down under unbalanced forces.',
      simParams: { stopAtRest: true,  fNet: fTens37 - fGrav37, initialV: -7, forces: [{ name: 'F_tens', value: fTens37, dir: 'up' }, { name: 'F_grav', value: fGrav37, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'large', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // master-38: upward weather sensor buoyant + tension exceeds gravity
    const fUp38 = randInt(rng, 50, 65)
    const fGrav38 = randInt(rng, 20, 30)
    questions.push({
      id: 'master-38',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A submerged sensor package rises vertically with upward buoyancy exceeding downward weight and hydrodynamic drag.',
      motionDirection: 'upward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The upward buoyant force arrow (Fb) is significantly longer than the combined downward forces arrow (Fg + Fair). This net upward force aligns with the upward motion, speeding up the package under unbalanced forces.',
      simParams: { fNet: fUp38 - fGrav38, initialV: 3, forces: [{ name: 'F_buoy', value: fUp38, dir: 'up' }, { name: 'F_grav', value: fGrav38, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'large', code: 'Fbuoy', label: 'Fb' },
          { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg + Fair' }
        ]
      }
    })

    // master-39: rightward train car balanced drive and drag
    const fBal39 = randInt(rng, 35, 50)
    questions.push({
      id: 'master-39',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A rightward-moving train locomotive maintains a steady cruise where wheel drive balances opposing aerodynamic drag and rail friction.',
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The forward wheel traction force (Fa) exactly balances the opposing resistive forces (Ff + Fair) in magnitude, as shown by equal arrow lengths. Normal force balances gravity vertically. With zero net force, motion continues at constant speed under balanced forces.',
      simParams: { fNet: 0, initialV: 6, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fBal39, dir: 'right' }, { name: 'F_frict', value: fBal39, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa (Drive)' },
          { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff + Fair' }
        ]
      }
    })

    // master-40: leftward crate pulled exceeding friction
    const fPull40 = randInt(rng, 45, 60)
    const fFrict40 = randInt(rng, 15, 25)
    questions.push({
      id: 'master-40',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A leftward-moving warehouse container is winched leftward with a cable force that significantly exceeds floor friction.',
      motionDirection: 'leftward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The leftward pulling force (Fa) has a longer arrow than the rightward friction force (Ff). The net force points leftward in the direction of motion, speeding up the container under unbalanced forces.',
      simParams: { fNet: -(fPull40 - fFrict40), initialV: -2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fPull40, dir: 'left' }, { name: 'F_frict', value: fFrict40, dir: 'right' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'large', code: 'Fapp', label: 'Fa' },
          { dir: 'right', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
        ]
      }
    })

    // master-41: upward package lifted by crane slowing down
    const fGrav41 = randInt(rng, 45, 60)
    const fTens41 = randInt(rng, 15, 25)
    questions.push({
      id: 'master-41',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A crane cable decelerates an ascending pallet of bricks as it nears the roof. Downward gravity exceeds upward cable tension.',
      motionDirection: 'upward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
      explanation: 'The downward gravity arrow (Fg) is longer than the upward cable tension arrow (FT). This net downward force opposes the upward direction of motion, causing the pallet to slow down under unbalanced forces.',
      simParams: { stopAtRest: true,  fNet: -(fGrav41 - fTens41), initialV: 5, forces: [{ name: 'F_tens', value: fTens41, dir: 'up' }, { name: 'F_grav', value: fGrav41, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'small', code: 'Ftens', label: 'FT' },
          { dir: 'down', magnitude: 'large', code: 'Fgrav', label: 'Fg' }
        ]
      }
    })

    // master-42: rightward jet hovercraft speeding up
    const fThrust42 = randInt(rng, 50, 65)
    const fAir42 = randInt(rng, 15, 25)
    questions.push({
      id: 'master-42',
      level: 'Master',
      representationType: 'force_diagram',
      stem: 'A rightward-moving test hovercraft fires its fan booster. Forward thrust exceeds opposing air resistance as indicated by the arrow lengths.',
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The rightward thrust arrow (Fa) is visibly longer than the leftward air resistance arrow (Fair). The net force is directed rightward (in the direction of motion), so the hovercraft accelerates and speeds up under unbalanced forces.',
      simParams: { fNet: fThrust42 - fAir42, initialV: 3, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fThrust42, dir: 'right' }, { name: 'F_air', value: fAir42, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fa' },
          { dir: 'left', magnitude: 'small', code: 'Fair', label: 'Fair' }
        ]
      }
    })

    return questions.map(tagQuestionMotion)
  }

  // ==========================================
  // WIZARD LEVEL: 60 Questions (v-t Graphs, Kinematic Tables, Advanced Scenarios)
  // ==========================================
  const questions = []

  // --- 20 Velocity-Time Graph Questions (wizard-1 to wizard-20) ---
  // wizard-1: v-t constant_pos
  questions.push({
    id: 'wizard-1',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'The velocity-time graph represents the motion of an object over time.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'A horizontal line on a velocity-time graph indicates that velocity remains constant over time. The slope (acceleration) is zero. Zero acceleration signifies that all forces acting on the object are balanced.',
    simParams: { fNet: 0, initialV: 6, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 25, dir: 'right' }, { name: 'F_frict', value: 25, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_pos' }
  })

  // wizard-2: v-t speeding_up_pos
  questions.push({
    id: 'wizard-2',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'The velocity-time graph shows an object moving in the positive direction starting from rest.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The line has a positive slope, and velocity increases away from the time axis. Speed is increasing. A non-zero acceleration means the net force is non-zero (unbalanced).',
    simParams: { fNet: 30, initialV: 1, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 30, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_pos' }
  })

  // wizard-3: v-t slowing_down_pos
  questions.push({
    id: 'wizard-3',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'The velocity-time graph depicts an object approaching a stop under braking.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The line slopes downward toward the time axis (velocity decreases toward zero). The magnitude of velocity is decreasing, meaning the object is slowing down. An unbalanced force produces this deceleration.',
    simParams: { stopAtRest: true,  fNet: -25, initialV: 7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_pos' }
  })

  // wizard-4: v-t constant_neg
  questions.push({
    id: 'wizard-4',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'The velocity-time graph illustrates an object moving in the negative direction over time.',
    motionDirection: 'negative',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The graph is a horizontal line below the zero axis. The velocity is constant at a negative value. Because the velocity does not change, acceleration is zero, indicating balanced forces.',
    simParams: { fNet: 0, initialV: -6, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 25, dir: 'left' }, { name: 'F_frict', value: 25, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_neg' }
  })

  // wizard-5: v-t speeding_up_neg
  questions.push({
    id: 'wizard-5',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'The velocity-time graph shows an object moving in the negative direction starting from rest.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The line begins at v = 0 and slants downward into negative numbers, moving farther from the zero axis. The absolute speed |v| is increasing. Speeding up in the negative direction requires an unbalanced negative net force.',
    simParams: { fNet: -30, initialV: -1, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 30, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_neg' }
  })

  // wizard-6: v-t slowing_down_neg
  questions.push({
    id: 'wizard-6',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'The velocity-time graph shows a negative-velocity object coming to rest.',
    motionDirection: 'negative',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The line begins at a negative velocity and slopes upward toward the zero axis. The magnitude of velocity (|v|) decreases toward zero. The object is slowing down due to an unbalanced positive net force.',
    simParams: { stopAtRest: true,  fNet: 25, initialV: -7, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_neg' }
  })

  // wizard-7: v-t constant_pos (electric train)
  questions.push({
    id: 'wizard-7',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A high-speed train travels along a straight test line. Its velocity graph shows a level line at positive velocity.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The velocity-time curve has zero slope, meaning acceleration is zero. The train covers equal distance each second in the positive direction at constant speed. Forces are balanced.',
    simParams: { fNet: 0, initialV: 8, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: 25, dir: 'right' }, { name: 'F_frict', value: 25, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_pos' }
  })

  // wizard-8: v-t speeding_up_pos (dragster)
  questions.push({
    id: 'wizard-8',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A top-fuel dragster fires down the track. Its velocity graph is a steep upward-sloping line in the positive region.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The velocity value increases progressively away from zero over time. Speed is increasing, which means the vehicle is speeding up. A non-zero positive acceleration requires an unbalanced forward net force.',
    simParams: { fNet: 35, initialV: 2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_thrust', value: 45, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_pos' }
  })

  // wizard-9: v-t slowing_down_pos (traffic braking)
  questions.push({
    id: 'wizard-9',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A vehicle enters a school zone and applies brakes. The velocity graph slopes downward toward the zero-line.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Velocity remains positive but approaches zero as time advances. Because the speed (|v|) is decreasing, the vehicle is slowing down. An unbalanced backward friction force causes this deceleration.',
    simParams: { stopAtRest: true,  fNet: -26, initialV: 7, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_pos' }
  })

  // wizard-10: v-t constant_neg (space probe retrograde drift)
  questions.push({
    id: 'wizard-10',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A scientific probe drifts in the negative direction through deep space with no active propulsion.',
    motionDirection: 'negative',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The velocity-time graph is a flat horizontal line below zero. Velocity does not change over time. With zero acceleration, Newton\'s first law guarantees that all forces are balanced.',
    simParams: { fNet: 0, initialV: -7, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_neg' }
  })

  // wizard-11: v-t speeding_up_neg (submersible dive)
  questions.push({
    id: 'wizard-11',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A deep-sea bathyscaphe descends downward with vertical thrusters engaged, tracing a negative velocity that slopes downward away from zero.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The graph slopes downward into larger negative numbers, moving farther away from the time axis. The speed (|v|) is increasing in the negative direction, so the submersible is speeding up under an unbalanced negative net force.',
    simParams: { fNet: -28, initialV: -1, forces: [{ name: 'F_grav', value: 45, dir: 'down' }, { name: 'F_buoy', value: 17, dir: 'up' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_neg' }
  })

  // wizard-12: v-t slowing_down_neg (reverse car braking)
  questions.push({
    id: 'wizard-12',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A car backing up in reverse hits the brake pedal. The velocity curve starts negative and slopes upward toward zero.',
    motionDirection: 'negative',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Velocity starts negative and heads toward zero. The absolute magnitude of velocity is shrinking, meaning the car is slowing down. An unbalanced positive friction force opposes the negative motion.',
    simParams: { stopAtRest: true,  fNet: 24, initialV: -6, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 34, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_neg' }
  })

  // wizard-13: v-t constant_pos (maglev cruise)
  questions.push({
    id: 'wizard-13',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A magnetically levitated train cruises horizontally across a test track at constant elevation.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The velocity-time graph is horizontal. The velocity does not change as time elapses. Zero change in velocity means zero acceleration, which indicates balanced forces.',
    simParams: { fNet: 0, initialV: 8, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: 20, dir: 'right' }, { name: 'F_air', value: 20, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_pos' }
  })

  // wizard-14: v-t speeding_up_pos (hyperloop pod)
  questions.push({
    id: 'wizard-14',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A low-pressure tube pod accelerates out of its terminus station in the positive direction.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The velocity-time graph shows a linear upward slope starting from low velocity. Speed increases over time, meaning the pod is speeding up. A non-zero forward acceleration demands an unbalanced net force.',
    simParams: { fNet: 32, initialV: 2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_thrust', value: 40, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_pos' }
  })

  // wizard-15: v-t slowing_down_pos (freight emergency braking)
  questions.push({
    id: 'wizard-15',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A heavily loaded cargo hauler deploys dynamic retarders on an expressway exit ramp.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The velocity-time line slopes downward toward the time axis. Velocity magnitude decreases over time, confirming that the hauler is slowing down under an unbalanced opposing force.',
    simParams: { stopAtRest: true,  fNet: -28, initialV: 7, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: 38, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_pos' }
  })

  // wizard-16: v-t constant_neg (conveyor return line)
  questions.push({
    id: 'wizard-16',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A return conveyor loop transports empty pallets in the negative direction at steady factory speed.',
    motionDirection: 'negative',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The v-t graph maintains a steady horizontal line below zero. Constant negative velocity with zero slope proves zero acceleration. The forces acting on the pallets are balanced.',
    simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 15, dir: 'left' }, { name: 'F_frict', value: 15, dir: 'right' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_neg' }
  })

  // wizard-17: v-t speeding_up_neg (skydiver head-first dive)
  questions.push({
    id: 'wizard-17',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A skydiver assumes a head-down streamline posture soon after stepping from the plane.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The graph begins near zero and slopes downward into deeper negative values. The absolute magnitude of downward speed is growing, meaning the skydiver is speeding up under an unbalanced downward gravity net force.',
    simParams: { fNet: -30, initialV: -2, forces: [{ name: 'F_grav', value: 50, dir: 'down' }, { name: 'F_air', value: 20, dir: 'up' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_neg' }
  })

  // wizard-18: v-t slowing_down_neg (lunar capsule atmospheric braking)
  questions.push({
    id: 'wizard-18',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A re-entry capsule plunges downward into the upper atmosphere, meeting dense air resistance.',
    motionDirection: 'negative',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'continued',
    explanation: 'The downward velocity is negative, but the curve slopes upward toward the zero axis. The descent speed is decreasing, which means the capsule is slowing down. An unbalanced upward aerodynamic drag force produces this deceleration.',
    simParams: { stopAtRest: false,  fNet: 28, initialV: -8, forces: [{ name: 'F_air', value: 65, dir: 'up' }, { name: 'F_grav', value: 37, dir: 'down' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_neg' }
  })

  // wizard-19: v-t constant_pos (automated guided vehicle)
  questions.push({
    id: 'wizard-19',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'An automated guided vehicle navigates an aisle at programmed uniform speed.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The flat line on the v-t graph indicates unchanging velocity. Without any change in velocity, acceleration is zero, indicating that driving and resistive forces are balanced.',
    simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 18, dir: 'right' }, { name: 'F_frict', value: 18, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'constant_pos' }
  })

  // wizard-20: v-t speeding_up_neg (mine cart down incline)
  questions.push({
    id: 'wizard-20',
    level: 'Wizard',
    representationType: 'velocity_time_graph',
    stem: 'A runaway mine cart rolls in the negative direction down a shaft slope.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The velocity-time graph slopes downward away from zero into larger negative numbers. Absolute speed |v| is increasing. An unbalanced negative net force accelerates the cart.',
    simParams: { fNet: -28, initialV: -1, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_net', value: 35, dir: 'left' }] },
    renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_neg' }
  })

  // --- 20 Kinematic Data Tables (wizard-21 to wizard-40) ---
  // wizard-21: Pos table, constant positive
  const step21 = randInt(rng, 8, 14)
  questions.push({
    id: 'wizard-21',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table displays position-time data for an object moving along a 1D track.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: `During each 1.0-second time interval, the position changes by exactly +${step21}.0 m. A constant rate of displacement means constant velocity. With zero acceleration, the forces are balanced.`,
    simParams: { fNet: 0, initialV: step21, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 20, dir: 'right' }, { name: 'F_frict', value: 20, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: `${step21}.0` },
        { t: '2.0', val: `${step21 * 2}.0` },
        { t: '3.0', val: `${step21 * 3}.0` },
        { t: '4.0', val: `${step21 * 4}.0` },
        { t: '5.0', val: `${step21 * 5}.0` }
      ]
    }
  })

  // wizard-22: Pos table, constant negative
  const step22 = randInt(rng, 8, 14)
  questions.push({
    id: 'wizard-22',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table records position-time data for an object traveling in the negative direction.',
    motionDirection: 'negative',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: `The position decreases by exactly ${step22}.0 m every single second. Because velocity is constant, there is no acceleration, which means net force is zero and forces are balanced.`,
    simParams: { fNet: 0, initialV: -step22, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 20, dir: 'left' }, { name: 'F_frict', value: 20, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: `${step22 * 5}.0` },
        { t: '1.0', val: `${step22 * 4}.0` },
        { t: '2.0', val: `${step22 * 3}.0` },
        { t: '3.0', val: `${step22 * 2}.0` },
        { t: '4.0', val: `${step22}.0` },
        { t: '5.0', val: '0.0' }
      ]
    }
  })

  // wizard-23: Pos table, speeding up positive
  questions.push({
    id: 'wizard-23',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table lists position-time data for an object moving in the positive direction.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Calculating the displacement each second: Δx = 2 m, then 4 m, 6 m, 8 m, 10 m. The distance covered in each consecutive second increases, proving the object is speeding up. Speeding up requires an unbalanced force.',
    simParams: { fNet: 25, initialV: 2, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_net', value: 35, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '2.0' },
        { t: '2.0', val: '6.0' },
        { t: '3.0', val: '12.0' },
        { t: '4.0', val: '20.0' },
        { t: '5.0', val: '30.0' }
      ]
    }
  })

  // wizard-24: Pos table, slowing down positive
  questions.push({
    id: 'wizard-24',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table lists position-time data for an object over consecutive seconds.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Calculating the displacement each second: Δx = 10 m, then 8 m, 6 m, 4 m, 2 m. The distance covered each second decreases over time, showing that the object is slowing down. An unbalanced opposing force causes this deceleration.',
    simParams: { stopAtRest: true,  fNet: -25, initialV: 7, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '10.0' },
        { t: '2.0', val: '18.0' },
        { t: '3.0', val: '24.0' },
        { t: '4.0', val: '28.0' },
        { t: '5.0', val: '30.0' }
      ]
    }
  })

  // wizard-25: Pos table, speeding up negative
  questions.push({
    id: 'wizard-25',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table records position-time coordinates for an object traveling in the negative direction.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Displacements each second are -2 m, -4 m, -6 m, -8 m, -10 m. The object covers an increasing magnitude of distance each second to the negative side. Speeding up requires an unbalanced net force.',
    simParams: { fNet: -26, initialV: -1, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_net', value: 35, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '-2.0' },
        { t: '2.0', val: '-6.0' },
        { t: '3.0', val: '-12.0' },
        { t: '4.0', val: '-20.0' },
        { t: '5.0', val: '-30.0' }
      ]
    }
  })

  // wizard-26: Pos table, slowing down negative
  questions.push({
    id: 'wizard-26',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table provides position data for an object moving in the negative direction toward a stop.',
    motionDirection: 'negative',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Displacements per second are -10 m, -8 m, -6 m, -4 m, -2 m. The magnitude of distance traveled each second decreases, confirming that the object is slowing down. Deceleration requires an unbalanced force.',
    simParams: { stopAtRest: true,  fNet: 25, initialV: -7, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '-10.0' },
        { t: '2.0', val: '-18.0' },
        { t: '3.0', val: '-24.0' },
        { t: '4.0', val: '-28.0' },
        { t: '5.0', val: '-30.0' }
      ]
    }
  })

  // wizard-27: Pos table, linear positive fast
  const step27 = randInt(rng, 15, 22)
  questions.push({
    id: 'wizard-27',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'High-speed track sensors log the linear position of a glider over 5 seconds.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: `The position advances by exactly +${step27}.0 m during each successive second. An unwavering rate of change of position means zero acceleration. Zero acceleration requires balanced forces.`,
    simParams: { fNet: 0, initialV: step27, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 25, dir: 'right' }, { name: 'F_frict', value: 25, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: `${step27}.0` },
        { t: '2.0', val: `${step27 * 2}.0` },
        { t: '3.0', val: `${step27 * 3}.0` },
        { t: '4.0', val: `${step27 * 4}.0` },
        { t: '5.0', val: `${step27 * 5}.0` }
      ]
    }
  })

  // wizard-28: Pos table, linear negative fast
  const step28 = randInt(rng, 15, 22)
  questions.push({
    id: 'wizard-28',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Position coordinates for a robotic rover returning westward along a straight path are logged.',
    motionDirection: 'negative',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: `The position decreases uniformly by ${step28}.0 m every single second. Steady displacement per unit time indicates constant velocity, meaning acceleration is zero and forces are balanced.`,
    simParams: { fNet: 0, initialV: -step28, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 25, dir: 'left' }, { name: 'F_frict', value: 25, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: `-${step28}.0` },
        { t: '2.0', val: `-${step28 * 2}.0` },
        { t: '3.0', val: `-${step28 * 3}.0` },
        { t: '4.0', val: `-${step28 * 4}.0` },
        { t: '5.0', val: `-${step28 * 5}.0` }
      ]
    }
  })

  // wizard-29: Pos table, quadratic acceleration
  questions.push({
    id: 'wizard-29',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'An automated testing carriage accelerates from rest down a test track.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The consecutive displacements are 1 m, 3 m, 5 m, 7 m, 9 m. Because the object covers greater distance during each successive second, it is speeding up under an unbalanced net force.',
    simParams: { fNet: 25, initialV: 1, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_net', value: 35, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '1.0' },
        { t: '2.0', val: '4.0' },
        { t: '3.0', val: '9.0' },
        { t: '4.0', val: '16.0' },
        { t: '5.0', val: '25.0' }
      ]
    }
  })

  // wizard-30: Pos table, deceleration to rest
  questions.push({
    id: 'wizard-30',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Position logs show a vehicle rolling forward while braking steadily to a stop.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The successive displacements per second are 12 m, 9 m, 6 m, 3 m, 0 m. As the distance traveled per second decreases to zero, the vehicle is slowing down under an unbalanced opposing force.',
    simParams: { stopAtRest: true,  fNet: -25, initialV: 8, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Position (m)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '12.0' },
        { t: '2.0', val: '21.0' },
        { t: '3.0', val: '27.0' },
        { t: '4.0', val: '30.0' },
        { t: '5.0', val: '30.0' }
      ]
    }
  })

  // wizard-31: Vel table, constant positive
  const velT31 = randInt(rng, 6, 12)
  questions.push({
    id: 'wizard-31',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The data table directly provides velocity values of an object recorded every second.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The velocity table directly shows that velocity stays steady for all time entries. A constant velocity means acceleration is zero, which requires balanced forces.',
    simParams: { fNet: 0, initialV: velT31, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 20, dir: 'right' }, { name: 'F_frict', value: 20, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: `${velT31}.0` },
        { t: '1.0', val: `${velT31}.0` },
        { t: '2.0', val: `${velT31}.0` },
        { t: '3.0', val: `${velT31}.0` },
        { t: '4.0', val: `${velT31}.0` },
        { t: '5.0', val: `${velT31}.0` }
      ]
    }
  })

  // wizard-32: Vel table, constant negative
  const velT32 = randInt(rng, 6, 12)
  questions.push({
    id: 'wizard-32',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The data table records the velocity of an object traveling in the negative direction.',
    motionDirection: 'negative',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'Velocity remains constant at a negative value across all recorded time steps. Because velocity does not change, acceleration is 0 m/s², meaning forces are balanced.',
    simParams: { fNet: 0, initialV: -velT32, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 20, dir: 'left' }, { name: 'F_frict', value: 20, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: `-${velT32}.0` },
        { t: '1.0', val: `-${velT32}.0` },
        { t: '2.0', val: `-${velT32}.0` },
        { t: '3.0', val: `-${velT32}.0` },
        { t: '4.0', val: `-${velT32}.0` },
        { t: '5.0', val: `-${velT32}.0` }
      ]
    }
  })

  // wizard-33: Vel table, speeding up positive
  const velAcc33 = randInt(rng, 2, 4)
  questions.push({
    id: 'wizard-33',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table records the velocity of an accelerating cart over time.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Velocity increases steadily each second. Because speed is increasing, the object is speeding up. A non-zero acceleration requires an unbalanced force.',
    simParams: { fNet: velAcc33 * 10, initialV: 1, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_net', value: velAcc33 * 10, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: `${velAcc33}.0` },
        { t: '2.0', val: `${velAcc33 * 2}.0` },
        { t: '3.0', val: `${velAcc33 * 3}.0` },
        { t: '4.0', val: `${velAcc33 * 4}.0` },
        { t: '5.0', val: `${velAcc33 * 5}.0` }
      ]
    }
  })

  // wizard-34: Vel table, slowing down positive
  questions.push({
    id: 'wizard-34',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table tracks the velocity of an object as it decelerates along a straight path.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The velocity drops steadily toward zero over time. The speed decreases each interval, so the object is slowing down. An unbalanced net force opposing motion causes this change.',
    simParams: { stopAtRest: true,  fNet: -25, initialV: 7, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '15.0' },
        { t: '1.0', val: '12.0' },
        { t: '2.0', val: '9.0' },
        { t: '3.0', val: '6.0' },
        { t: '4.0', val: '3.0' },
        { t: '5.0', val: '0.0' }
      ]
    }
  })

  // wizard-35: Vel table, speeding up negative
  questions.push({
    id: 'wizard-35',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'The table lists velocity values for an object traveling in the negative direction.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Velocity is negative, indicating travel in the negative direction. The speed (|v|) increases progressively over time. An increasing speed means the object is speeding up, which requires an unbalanced net force.',
    simParams: { fNet: -30, initialV: -1, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_net', value: 40, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '-2.5' },
        { t: '2.0', val: '-5.0' },
        { t: '3.0', val: '-7.5' },
        { t: '4.0', val: '-10.0' },
        { t: '5.0', val: '-12.5' }
      ]
    }
  })

  // wizard-36: Vel table, slowing down negative
  questions.push({
    id: 'wizard-36',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Velocity values are sampled as a negative-traveling vehicle brakes.',
    motionDirection: 'negative',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Velocity is negative, but its magnitude (|v|) drops from 15.0 m/s down to 0.0 m/s. The vehicle is slowing down in the negative direction, driven by an unbalanced positive force.',
    simParams: { stopAtRest: true,  fNet: 25, initialV: -7, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_frict', value: 35, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '-15.0' },
        { t: '1.0', val: '-12.0' },
        { t: '2.0', val: '-9.0' },
        { t: '3.0', val: '-6.0' },
        { t: '4.0', val: '-3.0' },
        { t: '5.0', val: '0.0' }
      ]
    }
  })

  // wizard-37: Vel table, high-speed rail cruising
  questions.push({
    id: 'wizard-37',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Telemetry logs velocity of an express train on a level stretch of track.',
    motionDirection: 'positive',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'Velocity is constant at 40.0 m/s for every entry in the table. Because velocity does not change, acceleration is 0 m/s², which requires all forces to be balanced.',
    simParams: { fNet: 0, initialV: 8, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_app', value: 20, dir: 'right' }, { name: 'F_frict', value: 20, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '40.0' },
        { t: '1.0', val: '40.0' },
        { t: '2.0', val: '40.0' },
        { t: '3.0', val: '40.0' },
        { t: '4.0', val: '40.0' },
        { t: '5.0', val: '40.0' }
      ]
    }
  })

  // wizard-38: Vel table, rocket sled accelerating
  questions.push({
    id: 'wizard-38',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Sensors record the forward velocity of a supersonic sled during engine burn.',
    motionDirection: 'positive',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Velocity increases by 10.0 m/s each second. An increasing speed indicates that the sled is speeding up. A steady positive acceleration requires an unbalanced forward net force.',
    simParams: { fNet: 35, initialV: 2, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_net', value: 45, dir: 'right' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '25.0' },
        { t: '1.0', val: '35.0' },
        { t: '2.0', val: '45.0' },
        { t: '3.0', val: '55.0' },
        { t: '4.0', val: '65.0' },
        { t: '5.0', val: '75.0' }
      ]
    }
  })

  // wizard-39: Vel table, landing airliner braking
  questions.push({
    id: 'wizard-39',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Speedometer data records the velocity of an aircraft during runway rollout.',
    motionDirection: 'positive',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Velocity drops by 12.0 m/s each second until reaching a taxi speed. Because speed is dropping over time, the aircraft is slowing down under an unbalanced opposing braking force.',
    simParams: { stopAtRest: true,  fNet: -28, initialV: 8, forces: [{ name: 'F_norm', value: 25, dir: 'up' }, { name: 'F_grav', value: 25, dir: 'down' }, { name: 'F_frict', value: 40, dir: 'left' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '60.0' },
        { t: '1.0', val: '48.0' },
        { t: '2.0', val: '36.0' },
        { t: '3.0', val: '24.0' },
        { t: '4.0', val: '12.0' },
        { t: '5.0', val: '0.0' }
      ]
    }
  })

  // wizard-40: Vel table, elevator accelerating downward
  questions.push({
    id: 'wizard-40',
    level: 'Wizard',
    representationType: 'kinematic_table',
    stem: 'Velocity data samples an elevator car starting downward from rest.',
    motionDirection: 'negative',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Velocity values become increasingly negative over time (-2.0, -4.0, -6.0, -8.0, -10.0 m/s). Speed (|v|) is growing, indicating that the elevator is speeding up downward under an unbalanced net downward force.',
    simParams: { fNet: -26, initialV: -1, forces: [{ name: 'F_grav', value: 40, dir: 'down' }, { name: 'F_tens', value: 20, dir: 'up' }] },
    renderData: {
      type: 'kinematic_table',
      colHeader: 'Velocity (m/s)',
      rows: [
        { t: '0.0', val: '0.0' },
        { t: '1.0', val: '-2.0' },
        { t: '2.0', val: '-4.0' },
        { t: '3.0', val: '-6.0' },
        { t: '4.0', val: '-8.0' },
        { t: '5.0', val: '-10.0' }
      ]
    }
  })

  // --- 20 Complex Multi-Force Scenarios (wizard-41 to wizard-60) ---
  // wizard-41: highway sedan cruising
  const fCruise41 = randInt(rng, 35, 55)
  questions.push({
    id: 'wizard-41',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A highway sedan cruises rightward across a flat road. The engine forward drive force matches opposing air drag and rolling resistance, as shown by the arrow lengths.',
    motionDirection: 'rightward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The forward drive force (Fa) balances opposing resistive forces (Ff + Fair) in magnitude (as indicated by equal arrow lengths), while vertical normal and gravity forces cancel (FN = Fg). Because the net force is zero (Fnet = 0), the forces are balanced, and the vehicle travels at a constant speed.',
    simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fCruise41, dir: 'right' }, { name: 'F_drag', value: fCruise41, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa (Drive)' },
        { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff + Fair' }
      ]
    }
  })

  // wizard-42: skydiver terminal velocity
  const fSkydive42 = randInt(rng, 45, 65)
  questions.push({
    id: 'wizard-42',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A parachutist falls downward through the atmosphere having attained terminal velocity, where upward air drag matches downward gravity.',
    motionDirection: 'downward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'At terminal velocity, upward aerodynamic drag (Fair) equals downward gravitational attraction (Fg) in magnitude (as indicated by equal arrow lengths). Because the net force is zero (Fnet = 0), the forces are balanced, and the descent occurs at a constant speed.',
    simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_air', value: fSkydive42, dir: 'up' }, { name: 'F_grav', value: fSkydive42, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fair', label: 'Fair' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
      ]
    }
  })

  // wizard-43: locked brakes skidding rightward
  const fSkid43 = randInt(rng, 35, 50)
  questions.push({
    id: 'wizard-43',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A speeding car locks its brakes and skids rightward across the highway.',
    motionDirection: 'rightward',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Vertical forces balance (FN = Fg). The only horizontal force is leftward kinetic friction (Ff), opposing the rightward motion as shown in the force diagram. This unbalanced net force opposes motion, causing the car to slow down.',
    simParams: { stopAtRest: true,  fNet: -fSkid43, initialV: 8, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_frict', value: fSkid43, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'left', magnitude: 'large', code: 'Ffrict', label: 'Ff (Brakes)' }
      ]
    }
  })

  // wizard-44: dragster forward thrust exceeding drag
  const fDragster44 = randInt(rng, 65, 85)
  questions.push({
    id: 'wizard-44',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A dragster accelerates down the strip with forward thrust exceeding opposing aerodynamic drag, as shown by the arrow lengths.',
    motionDirection: 'rightward',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The forward thrust force (Fa) is significantly larger than opposing aerodynamic drag (Fair), as indicated by the longer forward arrow. This unbalanced net forward force acts in the direction of motion, causing the vehicle to speed up.',
    simParams: { fNet: fDragster44, initialV: 2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_thrust', value: fDragster44 + 20, dir: 'right' }, { name: 'F_drag', value: 20, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fthrust' },
        { dir: 'left', magnitude: 'small', code: 'Fair', label: 'Fair' }
      ]
    }
  })

  // wizard-45: strobe photography air puck constant
  questions.push({
    id: 'wizard-45',
    level: 'Wizard',
    representationType: 'dot_diagram',
    stem: 'High-speed strobe photography captures the positions of an air puck gliding across a low-friction table.',
    motionDirection: 'rightward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The strobe flashes at equal time intervals, producing perfectly uniform spacing between dots. Consistent displacement per interval confirms constant speed. Newton’s first law requires forces to be balanced.',
    simParams: { fNet: 0, initialV: 6, forces: [{ name: 'F_norm', value: 20, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }, { name: 'F_app', value: 20, dir: 'right' }, { name: 'F_frict', value: 20, dir: 'left' }] },
    renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'right' }
  })

  // wizard-46: rocket ascending dot diagram expanding
  questions.push({
    id: 'wizard-46',
    level: 'Wizard',
    representationType: 'dot_diagram',
    stem: 'A high-speed sensor captures the positions of a model rocket launching vertically into the air.',
    motionDirection: 'upward',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Successive dot intervals expand in the upward direction. Covering greater vertical distance each second indicates upward acceleration. An unbalanced upward net force drives the acceleration.',
    simParams: { fNet: 30, initialV: 2, forces: [{ name: 'F_thrust', value: 50, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }] },
    renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'up' }
  })

  // wizard-47: submarine ascending at constant speed
  const fSub47 = randInt(rng, 35, 50)
  questions.push({
    id: 'wizard-47',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'An exploration submarine ascends vertically toward the ocean surface at constant velocity. Upward buoyant force matches downward weight and drag.',
    motionDirection: 'upward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The upward buoyant force (Fb) arrow matches the combined downward gravity and hydrodynamic drag arrow (Fg + Fair) in length. Because upward and downward forces are equal in magnitude and opposite in direction, net force is zero and forces are balanced.',
    simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_buoy', value: fSub47, dir: 'up' }, { name: 'F_grav', value: fSub47, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fbuoy', label: 'Fb' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg + Fair' }
      ]
    }
  })

  // wizard-48: elevator ascending while braking near penthouse
  const fGrav48 = randInt(rng, 45, 60)
  const fTens48 = randInt(rng, 18, 28)
  questions.push({
    id: 'wizard-48',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'An elevator moving upward slows down as it approaches the top penthouse floor. Downward gravity exceeds upward cable tension.',
    motionDirection: 'upward',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The downward gravity arrow (Fg) is longer than the upward cable tension arrow (FT). This net downward force opposes the upward motion, slowing the elevator down under unbalanced forces.',
    simParams: { stopAtRest: true,  fNet: -(fGrav48 - fTens48), initialV: 5, forces: [{ name: 'F_tens', value: fTens48, dir: 'up' }, { name: 'F_grav', value: fGrav48, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'small', code: 'Ftens', label: 'FT' },
        { dir: 'down', magnitude: 'large', code: 'Fgrav', label: 'Fg' }
      ]
    }
  })

  // wizard-49: sled pulled leftward by team of dogs balanced
  const fSled49 = randInt(rng, 30, 45)
  questions.push({
    id: 'wizard-49',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A sled pulled leftward across snow by two harness lines travels at steady pace. Combined harness tension equals snow friction.',
    motionDirection: 'leftward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The combined leftward tension (FT1 + FT2) arrow is equal in length to the opposing rightward friction (Ff) arrow, and vertical support forces balance (FN = Fg). Since net force is zero, the forces are balanced and the sled continues at constant speed.',
    simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_tens', value: fSled49, dir: 'left' }, { name: 'F_frict', value: fSled49, dir: 'right' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'left', magnitude: 'medium', code: 'Ftens', label: 'FT1 + FT2' },
        { dir: 'right', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
      ]
    }
  })

  // wizard-50: crate pushed leftward by multiple workers speeding up
  const fPush50 = randInt(rng, 50, 65)
  const fFrict50 = randInt(rng, 18, 25)
  questions.push({
    id: 'wizard-50',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A heavy metal container moving leftward is pushed by workers whose combined force exceeds opposing ground friction, as shown by arrow lengths.',
    motionDirection: 'leftward',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The leftward applied push (Fa1 + Fa2) arrow is longer than the opposing rightward friction arrow (Ff). The net force is directed leftward in the direction of motion, speeding up the container under unbalanced forces.',
    simParams: { fNet: -(fPush50 - fFrict50), initialV: -2, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fPush50, dir: 'left' }, { name: 'F_frict', value: fFrict50, dir: 'right' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'left', magnitude: 'large', code: 'Fapp', label: 'Fa1 + Fa2' },
        { dir: 'right', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
      ]
    }
  })

  // wizard-51: autonomous drone descending at steady rate
  const fDrone51 = randInt(rng, 30, 45)
  questions.push({
    id: 'wizard-51',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A quadcopter delivery drone descends vertically toward a landing pad at constant speed. Rotor thrust matches downward weight.',
    motionDirection: 'downward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The upward rotor thrust arrow (Fa) has the same length as the downward gravity arrow (Fg). Because the upward and downward forces have equal magnitude, net vertical force is zero (Fnet = 0), meaning forces are balanced and descent speed is constant.',
    simParams: { fNet: 0, initialV: -3, forces: [{ name: 'F_app', value: fDrone51, dir: 'up' }, { name: 'F_grav', value: fDrone51, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fapp', label: 'Fthrust' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
      ]
    }
  })

  // wizard-52: lunar lander descending while firing thruster slowing down
  const fThrust52 = randInt(rng, 50, 65)
  const fGrav52 = randInt(rng, 20, 30)
  questions.push({
    id: 'wizard-52',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A lunar lander is falling downward toward the surface while firing its descent engine. Upward rocket thrust exceeds downward lunar gravity.',
    motionDirection: 'downward',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The upward thrust arrow (Fthrust) is longer than the downward gravity arrow (Fg). This net upward force opposes the downward velocity of descent, causing the lander to slow down under unbalanced forces.',
    simParams: { stopAtRest: true,  fNet: fThrust52 - fGrav52, initialV: -6, forces: [{ name: 'F_thrust', value: fThrust52, dir: 'up' }, { name: 'F_grav', value: fGrav52, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'large', code: 'Fthrust', label: 'Fthrust' },
        { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg' }
      ]
    }
  })

  // wizard-53: cart rolling rightward with braking drag slowing down
  const fDrag53 = randInt(rng, 35, 50)
  questions.push({
    id: 'wizard-53',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A rail cart glides rightward with no engine drive while combined friction and magnetic drag oppose motion.',
    motionDirection: 'rightward',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'Vertical forces balance (FN = Fg). The only horizontal force is leftward drag (Ff + Fair), which directly opposes the rightward motion. This unbalanced net force causes the cart to slow down.',
    simParams: { stopAtRest: true,  fNet: -fDrag53, initialV: 7, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_drag', value: fDrag53, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'left', magnitude: 'large', code: 'Fdrag', label: 'Ff + Fair' }
      ]
    }
  })

  // wizard-54: bullet train cruising rightward balanced
  const fTrain54 = randInt(rng, 40, 55)
  questions.push({
    id: 'wizard-54',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'An aerodynamic bullet train travels rightward at a constant 300 km/h where forward electric motor traction matches air drag.',
    motionDirection: 'rightward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The rightward traction arrow (Fa) has the same length as the opposing leftward drag arrow (Fair). Vertical support forces cancel (FN = Fg). Because the net force is zero, forces are balanced and the train moves at constant speed.',
    simParams: { fNet: 0, initialV: 7, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fTrain54, dir: 'right' }, { name: 'F_air', value: fTrain54, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa (Drive)' },
        { dir: 'left', magnitude: 'medium', code: 'Fair', label: 'Fair' }
      ]
    }
  })

  // wizard-55: speedboat accelerating forward
  const fBoat55 = randInt(rng, 50, 65)
  const fDrag55 = randInt(rng, 15, 25)
  questions.push({
    id: 'wizard-55',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A racing speedboat accelerates forward across water with propeller thrust exceeding water drag, as shown by arrow lengths.',
    motionDirection: 'rightward',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'The forward propeller thrust arrow (Fa) is significantly longer than the backward hydrodynamic drag arrow (Fdrag). The net force is directed to the right in the direction of motion, speeding up the boat under unbalanced forces.',
    simParams: { fNet: fBoat55 - fDrag55, initialV: 3, forces: [{ name: 'F_buoy', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fBoat55, dir: 'right' }, { name: 'F_drag', value: fDrag55, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fbuoy', label: 'Fb' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fa' },
        { dir: 'left', magnitude: 'small', code: 'Fdrag', label: 'Fdrag' }
      ]
    }
  })

  // wizard-56: paratrooper in rapid descent with drogue chute slowing down
  const fChute56 = randInt(rng, 55, 70)
  const fGrav56 = randInt(rng, 25, 35)
  questions.push({
    id: 'wizard-56',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A paratrooper descends downward just after popping the drogue chute. Upward aerodynamic drag exceeds downward gravity.',
    motionDirection: 'downward',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'continued',
    explanation: 'The upward aerodynamic drag arrow (Fair) is longer than the downward gravity arrow (Fg). The net upward force opposes the downward velocity, causing the paratrooper to slow down under unbalanced forces.',
    simParams: { stopAtRest: false,  fNet: fChute56 - fGrav56, initialV: -7, forces: [{ name: 'F_air', value: fChute56, dir: 'up' }, { name: 'F_grav', value: fGrav56, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'large', code: 'Fair', label: 'Fair' },
        { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg' }
      ]
    }
  })

  // wizard-57: cargo box slid leftward opposed by safety cable slowing down
  const fTeth57 = randInt(rng, 45, 60)
  const fPush57 = randInt(rng, 15, 25)
  questions.push({
    id: 'wizard-57',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A cargo crate sliding leftward is caught by a rightward safety cable tension that exceeds the leftward applied push.',
    motionDirection: 'leftward',
    motionAnswer: 'Slowing Down',
    forceAnswer: 'Unbalanced',
      motionBehavior: 'braking',
    explanation: 'The rightward cable tension arrow (FT) is longer than the leftward applied push arrow (Fa). Because the net force points rightward, directly opposing the leftward motion, the crate slows down under unbalanced forces.',
    simParams: { stopAtRest: true,  fNet: fTeth57 - fPush57, initialV: -6, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_tens', value: fTeth57, dir: 'right' }, { name: 'F_app', value: fPush57, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'right', magnitude: 'large', code: 'Ftens', label: 'FT' },
        { dir: 'left', magnitude: 'small', code: 'Fapp', label: 'Fa' }
      ]
    }
  })

  // wizard-58: wind tunnel glider held at constant speed
  const fWind58 = randInt(rng, 30, 45)
  questions.push({
    id: 'wizard-58',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A model aircraft moves rightward through a wind tunnel carriage where thrust matches air drag as indicated by arrow lengths.',
    motionDirection: 'rightward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The rightward thrust arrow (Fa) has the same length as the opposing leftward drag arrow (Fair). Vertical aerodynamic lift balances weight (FN = Fg). Because the net force is zero, forces are balanced and motion is at constant speed.',
    simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_app', value: fWind58, dir: 'right' }, { name: 'F_air', value: fWind58, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
        { dir: 'left', magnitude: 'medium', code: 'Fair', label: 'Fair' }
      ]
    }
  })

  // wizard-59: booster sled propelled leftward with zero friction speeding up
  const fBoost59 = randInt(rng, 35, 50)
  questions.push({
    id: 'wizard-59',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A rocket sled traveling leftward fires solid boosters on a frictionless ice plain.',
    motionDirection: 'leftward',
    motionAnswer: 'Speeding Up',
    forceAnswer: 'Unbalanced',
    explanation: 'Vertical forces balance (FN = Fg). The only horizontal force is leftward rocket thrust (Fthrust). Since this unbalanced net force acts in the direction of leftward travel, the sled speeds up.',
    simParams: { fNet: -fBoost59, initialV: -3, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }, { name: 'F_thrust', value: fBoost59, dir: 'left' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
        { dir: 'left', magnitude: 'large', code: 'Fthrust', label: 'Fthrust' }
      ]
    }
  })

  // wizard-60: oceanographic probe terminal descent balanced
  const fSink60 = randInt(rng, 35, 50)
  questions.push({
    id: 'wizard-60',
    level: 'Wizard',
    representationType: 'force_diagram',
    stem: 'A scientific ocean probe sinks vertically at its terminal descent velocity in the ocean abyssal zone.',
    motionDirection: 'downward',
    motionAnswer: 'Constant Speed',
    forceAnswer: 'Balanced',
    explanation: 'The upward resistive and buoyant forces (Fb + Fair) equal the downward gravitational attraction (Fg) in magnitude (as indicated by equal arrow lengths). Because net force is zero (Fnet = 0), forces are balanced and the descent continues at constant speed.',
    simParams: { fNet: 0, initialV: -4, forces: [{ name: 'F_buoy', value: fSink60, dir: 'up' }, { name: 'F_grav', value: fSink60, dir: 'down' }] },
    renderData: {
      type: 'force_diagram',
      forces: [
        { dir: 'up', magnitude: 'medium', code: 'Fbuoy', label: 'Fb + Fair' },
        { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
      ]
    }
  })

  return questions.map(tagQuestionMotion)
}
