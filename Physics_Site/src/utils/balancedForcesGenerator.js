// Procedural Question Generator for Balanced vs. Unbalanced Forces
// True PRNG generation parameterized by seed.
// - Apprentice: exactly 8 distinct Force Diagram questions
// - Master: exactly 14 distinct questions (Position-Time Graphs, Dot Diagrams, Multi-Force Diagrams)
// - Wizard: exactly 20 distinct questions (Velocity-Time Graphs, Kinematic Tables, Advanced Scenarios)
// Zero overlap across levels; every question dynamically adapts to the seed.

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

export function generateBalancedQuestions(level, seed = 0) {
  const rng = createRng(seed)

  const hBoxes = ['wooden crate', 'cargo trunk', 'storage container', 'metal box', 'shipping package']
  const gliders = ['hockey puck', 'curling stone', 'sled', 'gliding cart', 'air-track puck']
  const lifts = ['service elevator', 'cargo hoist', 'mining bucket', 'aerial platform', 'cable car']
  const aerials = ['weather capsule', 'model rocket', 'skydiver', 'probe', 'descending payload']

  if (level === 'Apprentice') {
    const box1 = pick(rng, hBoxes)
    const fVert1 = randInt(rng, 25, 45)

    const box2 = pick(rng, hBoxes)
    const fPull2 = randInt(rng, 40, 55)
    const fFrict2 = randInt(rng, 12, 22)
    const fNet2 = fPull2 - fFrict2

    const glider3 = pick(rng, gliders)
    const fFrict3 = randInt(rng, 20, 35)

    const box4 = pick(rng, hBoxes)
    const fBal4 = randInt(rng, 20, 35)

    const box5 = pick(rng, hBoxes)
    const fPush5 = randInt(rng, 42, 58)
    const fDrag5 = randInt(rng, 14, 22)
    const fNet5 = fPush5 - fDrag5

    const lift6 = pick(rng, lifts)
    const fTens6 = randInt(rng, 30, 45)

    const skydiver7 = pick(rng, aerials)
    const fGrav7 = randInt(rng, 45, 60)
    const fAir7 = randInt(rng, 15, 25)

    const ball8 = pick(rng, ['basketball', 'baseball', 'tennis ball', 'soccer ball'])
    const fGrav8 = randInt(rng, 20, 30)

    return [
      {
        id: `apprentice-1`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `The diagram represents the forces acting upon a rightward-moving ${box1}. Each arrow represents a force, and arrow length indicates magnitude.`,
        motionDirection: 'rightward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: `The upward normal force (FN = ${fVert1} N) and downward gravity force (Fg = ${fVert1} N) are equal in magnitude and opposite in direction. There are no horizontal forces. Because net force is zero (Fnet = 0 N), the forces are balanced, and the object maintains a constant speed.`,
        simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: fVert1, dir: 'up' }, { name: 'F_grav', value: fVert1, dir: 'down' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
          ]
        }
      },
      {
        id: `apprentice-2`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A rightward-moving ${box2} is pulled across a floor. Vertical forces are equal, but the rightward pull (${fPull2} N) exceeds the leftward friction (${fFrict2} N).`,
        motionDirection: 'rightward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: `Vertical forces balance out, but the rightward applied force (${fPull2} N) is larger than the leftward friction force (${fFrict2} N). The net force is directed to the right (Fnet = +${fNet2} N, in the direction of motion), causing the object to accelerate and speed up.`,
        simParams: { fNet: fNet2, initialV: 2, forces: [{ name: 'F_app', value: fPull2, dir: 'right' }, { name: 'F_frict', value: fFrict2, dir: 'left' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
            { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fa' },
            { dir: 'left', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
          ]
        }
      },
      {
        id: `apprentice-3`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A rightward-moving ${glider3} glides across a rough surface. Only friction (${fFrict3} N) acts along the horizontal axis.`,
        motionDirection: 'rightward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: `Vertical forces balance (FN = Fg). The only horizontal force is leftward friction (${fFrict3} N). Because the net force is directed opposite to the rightward motion (Fnet = -${fFrict3} N), the object slows down under an unbalanced net force.`,
        simParams: { fNet: -fFrict3, initialV: 7, forces: [{ name: 'F_frict', value: fFrict3, dir: 'left' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
            { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
          ]
        }
      },
      {
        id: `apprentice-4`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A ${box4} slides leftward across the floor while being pushed with a force exactly equal to opposing friction (${fBal4} N).`,
        motionDirection: 'leftward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: `The leftward applied push equals the rightward friction force (${fBal4} N = ${fBal4} N), and vertical forces balance. The net force is zero. An object in motion with zero net force continues to move at constant speed.`,
        simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_app', value: fBal4, dir: 'left' }, { name: 'F_frict', value: fBal4, dir: 'right' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
            { dir: 'left', magnitude: 'medium', code: 'Fapp', label: 'Fa' },
            { dir: 'right', magnitude: 'medium', code: 'Ffrict', label: 'Ff' }
          ]
        }
      },
      {
        id: `apprentice-5`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A leftward-moving ${box5} is propelled leftward with a strong force (${fPush5} N) against a weak opposing drag (${fDrag5} N).`,
        motionDirection: 'leftward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: `The leftward force (${fPush5} N) is stronger than the rightward drag (${fDrag5} N). The resulting net force is directed to the left (Fnet = -${fNet5} N, in the direction of motion). This causes acceleration to the left, so the object speeds up.`,
        simParams: { fNet: -fNet5, initialV: -2, forces: [{ name: 'F_app', value: fPush5, dir: 'left' }, { name: 'F_frict', value: fDrag5, dir: 'right' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
            { dir: 'left', magnitude: 'large', code: 'Fapp', label: 'Fa' },
            { dir: 'right', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
          ]
        }
      },
      {
        id: `apprentice-6`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A ${lift6} ascends vertically through a shaft at a steady rate. Tension matches gravity (${fTens6} N).`,
        motionDirection: 'upward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: `Upward tension in the support cable (${fTens6} N) equals the downward force of gravity (${fTens6} N). Because the forces are balanced, the elevator has zero acceleration and travels upward at a constant speed.`,
        simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_tens', value: fTens6, dir: 'up' }, { name: 'F_grav', value: fTens6, dir: 'down' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Ftens', label: 'FT' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
          ]
        }
      },
      {
        id: `apprentice-7`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A ${skydiver7} plunges downward soon after release. Gravity (${fGrav7} N) strongly exceeds upward air drag (${fAir7} N).`,
        motionDirection: 'downward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: `Gravity pulls downward with greater magnitude (${fGrav7} N) than upward air drag (${fAir7} N). The unbalanced downward net force accelerates the object downward, speeding up its descent.`,
        simParams: { fNet: -(fGrav7 - fAir7), initialV: -3, forces: [{ name: 'F_air', value: fAir7, dir: 'up' }, { name: 'F_grav', value: fGrav7, dir: 'down' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'small', code: 'Fair', label: 'Fair' },
            { dir: 'down', magnitude: 'large', code: 'Fgrav', label: 'Fg' }
          ]
        }
      },
      {
        id: `apprentice-8`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: `A ${ball8} rises upward after being launched. Ignoring air resistance, only gravity (${fGrav8} N) acts upon it.`,
        motionDirection: 'upward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: `The object moves upward, but the only force acting is downward gravity (${fGrav8} N). The unbalanced downward force opposes the upward motion, causing the object to slow down.`,
        simParams: { fNet: -fGrav8, initialV: 6, forces: [{ name: 'F_grav', value: fGrav8, dir: 'down' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
          ]
        }
      }
    ]
  }

  if (level === 'Master') {
    const v1 = randInt(rng, 4, 8)
    const tInterval = pick(rng, ['0.1', '0.2', '0.5'])
    const fNet11 = randInt(rng, 25, 40)
    const fApp11_1 = randInt(rng, 25, 35)
    const fApp11_2 = randInt(rng, 15, 25)
    const fFrict11 = randInt(rng, 15, 25)

    const fFrict12 = randInt(rng, 40, 55)
    const fApp12 = randInt(rng, 15, 25)

    const fTens13 = randInt(rng, 35, 50)
    const fThrust14 = randInt(rng, 50, 65)
    const fGrav14 = randInt(rng, 18, 25)

    return [
      {
        id: `master-1`,
        level: 'Master',
        representationType: 'position_time_graph',
        stem: `The graph illustrates the position of an object moving along a linear track over time at a steady velocity of +${v1} m/s.`,
        motionDirection: 'positive',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: `The position-time graph is a straight line with a constant positive slope. A constant slope means constant velocity. Zero acceleration indicates that the net force is zero, meaning forces are balanced.`,
        simParams: { fNet: 0, initialV: v1, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
        renderData: { type: 'position_time_graph', curveType: 'constant_pos' }
      },
      {
        id: `master-2`,
        level: 'Master',
        representationType: 'position_time_graph',
        stem: 'The position-time graph shows an object moving in the positive direction with a steepening curve.',
        motionDirection: 'positive',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'The slope of the position-time curve gets steeper over time. Since slope equals velocity, the velocity is increasing (speeding up). An acceleration requires an unbalanced net force.',
        simParams: { fNet: 25, initialV: 2, forces: [{ name: 'F_net', value: 35, dir: 'right' }] },
        renderData: { type: 'position_time_graph', curveType: 'speeding_up_pos' }
      },
      {
        id: `master-3`,
        level: 'Master',
        representationType: 'position_time_graph',
        stem: 'The position-time graph shows an object whose path flattens out horizontally over time.',
        motionDirection: 'positive',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The slope of the position-time curve decreases toward zero (flattening out). A decreasing slope means decreasing velocity (slowing down). Changing velocity requires an unbalanced force.',
        simParams: { fNet: -25, initialV: 7, forces: [{ name: 'F_frict', value: 30, dir: 'left' }] },
        renderData: { type: 'position_time_graph', curveType: 'slowing_down_pos' }
      },
      {
        id: `master-4`,
        level: 'Master',
        representationType: 'position_time_graph',
        stem: 'The graph shows the position of an object moving in the negative direction along a straight line.',
        motionDirection: 'negative',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'The graph is a straight line with a constant negative slope. The object covers equal negative distance each second. Because velocity is constant, acceleration is zero, indicating balanced forces.',
        simParams: { fNet: 0, initialV: -v1, forces: [{ name: 'F_1', value: 20, dir: 'left' }, { name: 'F_2', value: 20, dir: 'right' }] },
        renderData: { type: 'position_time_graph', curveType: 'constant_neg' }
      },
      {
        id: `master-5`,
        level: 'Master',
        representationType: 'dot_diagram',
        stem: `A motion sensor records the position of a rightward-moving cart at equal ${tInterval}-second time intervals.`,
        motionDirection: 'rightward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'The dots are spaced at equal distances across the tape. Covering equal distance in equal time intervals means the speed is constant. Constant speed with no directional change implies balanced forces.',
        simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_1', value: 25, dir: 'right' }, { name: 'F_2', value: 25, dir: 'left' }] },
        renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'right' }
      },
      {
        id: `master-6`,
        level: 'Master',
        representationType: 'dot_diagram',
        stem: `A ticker tape attached to a rightward-moving vehicle leaves marks at consecutive equal ${tInterval}-second time intervals.`,
        motionDirection: 'rightward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'The distance between consecutive dots increases as the vehicle moves to the right. The vehicle covers more distance each interval, meaning it is speeding up. Speeding up requires an unbalanced net force.',
        simParams: { fNet: 30, initialV: 2, forces: [{ name: 'F_net', value: 40, dir: 'right' }] },
        renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'right' }
      },
      {
        id: `master-7`,
        level: 'Master',
        representationType: 'dot_diagram',
        stem: 'A vehicle applies brakes while moving rightward, dropping oil droplets at fixed 1-second intervals.',
        motionDirection: 'rightward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The spacing between successive drops becomes progressively smaller. Traveling less distance each second indicates the vehicle is slowing down. Deceleration requires an unbalanced net force opposing motion.',
        simParams: { fNet: -25, initialV: 7, forces: [{ name: 'F_frict', value: 35, dir: 'left' }] },
        renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'right' }
      },
      {
        id: `master-8`,
        level: 'Master',
        representationType: 'dot_diagram',
        stem: 'The dot diagram records the position of an object moving leftward at equal time increments.',
        motionDirection: 'leftward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'The spacing between dots increases in the leftward direction of motion. Covering increasing distance to the left means leftward acceleration (speeding up). An unbalanced force is responsible.',
        simParams: { fNet: -30, initialV: -2, forces: [{ name: 'F_net', value: 40, dir: 'left' }] },
        renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'left' }
      },
      {
        id: `master-9`,
        level: 'Master',
        representationType: 'dot_diagram',
        stem: 'A sled glides leftward onto dry gravel, recording positions at equal time intervals.',
        motionDirection: 'leftward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The spacing between dots shrinks as the sled travels leftward. The sled covers less distance per second and is slowing down due to an unbalanced rightward friction force.',
        simParams: { fNet: 25, initialV: -7, forces: [{ name: 'F_frict', value: 35, dir: 'right' }] },
        renderData: { type: 'dot_diagram', pattern: 'decelerating', direction: 'left' }
      },
      {
        id: `master-10`,
        level: 'Master',
        representationType: 'position_time_graph',
        stem: 'The position-time graph shows an object moving in the negative direction with an increasingly steep downward curve.',
        motionDirection: 'negative',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'The curve bends downward with an increasingly negative slope. Because speed is the absolute magnitude of slope, speed is increasing. An unbalanced force accelerates the object.',
        simParams: { fNet: -25, initialV: -2, forces: [{ name: 'F_net', value: 35, dir: 'left' }] },
        renderData: { type: 'position_time_graph', curveType: 'speeding_up_neg' }
      },
      {
        id: `master-11`,
        level: 'Master',
        representationType: 'force_diagram',
        stem: `A rightward-moving crate is pushed by two forward workers (${fApp11_1} N and ${fApp11_2} N) while ground friction (${fFrict11} N) opposes.`,
        motionDirection: 'rightward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: `Two rightward applied forces total ${fApp11_1 + fApp11_2} N, which exceeds the leftward friction force (${fFrict11} N). The net force is rightward in the direction of motion (Fnet = +${(fApp11_1 + fApp11_2) - fFrict11} N), so the crate speeds up.`,
        simParams: { fNet: fNet11, initialV: 3, forces: [{ name: 'F_app1', value: fApp11_1, dir: 'right' }, { name: 'F_app2', value: fApp11_2, dir: 'right' }, { name: 'F_frict', value: fFrict11, dir: 'left' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
            { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fa1 + Fa2' },
            { dir: 'left', magnitude: 'small', code: 'Ffrict', label: 'Ff' }
          ]
        }
      },
      {
        id: `master-12`,
        level: 'Master',
        representationType: 'force_diagram',
        stem: `A rightward-moving trunk is pushed rightward (${fApp12} N), but ground friction is significantly stronger (${fFrict12} N).`,
        motionDirection: 'rightward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: `The leftward friction force (${fFrict12} N) exceeds the rightward applied push (${fApp12} N). The net horizontal force points to the left (Fnet = -${fFrict12 - fApp12} N), opposing the rightward motion and causing the trunk to slow down.`,
        simParams: { fNet: -(fFrict12 - fApp12), initialV: 6, forces: [{ name: 'F_frict', value: fFrict12, dir: 'left' }, { name: 'F_app', value: fApp12, dir: 'right' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
            { dir: 'left', magnitude: 'large', code: 'Ffrict', label: 'Ff' },
            { dir: 'right', magnitude: 'small', code: 'Fapp', label: 'Fa' }
          ]
        }
      },
      {
        id: `master-13`,
        level: 'Master',
        representationType: 'force_diagram',
        stem: `A deep-sea acoustic probe is hoisted upward at constant velocity through water. Upward tension equals gravity (${fTens13} N).`,
        motionDirection: 'upward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: `Upward cable tension (${fTens13} N) balances downward gravity (${fTens13} N). When net force is zero, an object moves upward at constant speed.`,
        simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_tens', value: fTens13, dir: 'up' }, { name: 'F_grav', value: fTens13, dir: 'down' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'medium', code: 'Ftens', label: 'FT' },
            { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
          ]
        }
      },
      {
        id: `master-14`,
        level: 'Master',
        representationType: 'force_diagram',
        stem: `A probe rocket engine fires on ascent, generating ${fThrust14} N upward thrust exceeding gravity (${fGrav14} N).`,
        motionDirection: 'upward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: `The upward thrust arrow (${fThrust14} N) is significantly larger than downward gravity (${fGrav14} N). This net upward force causes upward acceleration, so the rocket speeds up.`,
        simParams: { fNet: fThrust14 - fGrav14, initialV: 3, forces: [{ name: 'F_thrust', value: fThrust14, dir: 'up' }, { name: 'F_grav', value: fGrav14, dir: 'down' }] },
        renderData: {
          type: 'force_diagram',
          forces: [
            { dir: 'up', magnitude: 'large', code: 'Fapp', label: 'Fthrust' },
            { dir: 'down', magnitude: 'small', code: 'Fgrav', label: 'Fg + Fair' }
          ]
        }
      }
    ]
  }

  // Wizard Level: 20 Questions
  const vConst1 = randInt(rng, 10, 18)
  const vConstNeg = randInt(rng, 6, 14)
  const aPos2 = randInt(rng, 2, 4)
  const aNeg5 = randInt(rng, 2, 4)

  const stepPos7 = randInt(rng, 8, 14)
  const stepNeg8 = randInt(rng, 8, 14)

  const velT11 = randInt(rng, 6, 12)
  const velAcc12 = randInt(rng, 2, 4)

  const fCruise17 = randInt(rng, 35, 55)
  const fSkydive18 = randInt(rng, 45, 65)
  const fSkid19 = randInt(rng, 35, 50)
  const fDragster20 = randInt(rng, 65, 85)

  return [
    {
      id: `wizard-1`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: `The velocity-time graph represents the motion of an object over a 5.0-second interval maintaining a steady ${vConst1}.0 m/s.`,
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'A horizontal line on a velocity-time graph indicates that velocity remains constant over time. The slope (acceleration) is zero. Zero acceleration signifies that all forces acting on the object are balanced.',
      simParams: { fNet: 0, initialV: vConst1, forces: [{ name: 'F_1', value: 25, dir: 'right' }, { name: 'F_2', value: 25, dir: 'left' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'constant_pos' }
    },
    {
      id: `wizard-2`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: `The velocity-time graph shows an object moving in the positive direction starting from rest with acceleration a = +${aPos2}.0 m/s².`,
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The line has a positive slope, and velocity increases away from the time axis. Speed is increasing. A non-zero acceleration means the net force is non-zero (unbalanced).',
      simParams: { fNet: aPos2 * 10, initialV: 1, forces: [{ name: 'F_net', value: aPos2 * 10, dir: 'right' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_pos' }
    },
    {
      id: `wizard-3`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: 'The velocity-time graph depicts an object approaching a stop under braking.',
      motionDirection: 'positive',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      explanation: 'The line slopes downward toward the time axis (velocity decreases toward zero). The magnitude of velocity is decreasing, meaning the object is slowing down. An unbalanced force produces this deceleration.',
      simParams: { fNet: -25, initialV: 7, forces: [{ name: 'F_frict', value: 35, dir: 'left' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_pos' }
    },
    {
      id: `wizard-4`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: `The velocity-time graph illustrates an object moving in the negative direction at constant -${vConstNeg}.0 m/s.`,
      motionDirection: 'negative',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The graph is a horizontal line below the zero axis. The velocity is constant at a negative value. Because the velocity does not change, acceleration is zero, indicating balanced forces.',
      simParams: { fNet: 0, initialV: -vConstNeg, forces: [{ name: 'F_1', value: 25, dir: 'left' }, { name: 'F_2', value: 25, dir: 'right' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'constant_neg' }
    },
    {
      id: `wizard-5`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: `The velocity-time graph shows an object accelerating in the negative direction from rest (a = -${aNeg5}.0 m/s²).`,
      motionDirection: 'negative',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The line begins at v = 0 and slants downward into negative numbers, moving farther from the zero axis. The absolute speed |v| is increasing. Speeding up in the negative direction requires an unbalanced negative net force.',
      simParams: { fNet: -aNeg5 * 10, initialV: -1, forces: [{ name: 'F_net', value: aNeg5 * 10, dir: 'left' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_neg' }
    },
    {
      id: `wizard-6`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: 'The velocity-time graph shows a negative-velocity object coming to rest.',
      motionDirection: 'negative',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      explanation: 'The line begins at a negative velocity and slopes upward toward the zero axis. The magnitude of velocity (|v|) decreases toward zero. The object is slowing down due to an unbalanced positive net force.',
      simParams: { fNet: 25, initialV: -7, forces: [{ name: 'F_frict', value: 35, dir: 'right' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'slowing_down_neg' }
    },
    {
      id: `wizard-7`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: `The table displays position-time data for an object moving along a 1D track with a constant step of +${stepPos7}.0 m each second.`,
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `During each 1.0-second time interval, the position changes by exactly +${stepPos7}.0 m. A constant rate of displacement means constant velocity (${stepPos7} m/s). With zero acceleration, the forces are balanced.`,
      simParams: { fNet: 0, initialV: stepPos7, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Position (m)',
        rows: [
          { t: '0.0', val: '0.0' },
          { t: '1.0', val: `${stepPos7}.0` },
          { t: '2.0', val: `${stepPos7 * 2}.0` },
          { t: '3.0', val: `${stepPos7 * 3}.0` },
          { t: '4.0', val: `${stepPos7 * 4}.0` },
          { t: '5.0', val: `${stepPos7 * 5}.0` }
        ]
      }
    },
    {
      id: `wizard-8`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: `The table records position-time data for an object traveling in the negative direction by -${stepNeg8}.0 m every second.`,
      motionDirection: 'negative',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The position decreases by exactly ${stepNeg8}.0 m every single second (-${stepNeg8} m/s). Because velocity is constant, there is no acceleration, which means net force is zero and forces are balanced.`,
      simParams: { fNet: 0, initialV: -stepNeg8, forces: [{ name: 'F_1', value: 20, dir: 'left' }, { name: 'F_2', value: 20, dir: 'right' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Position (m)',
        rows: [
          { t: '0.0', val: `${stepNeg8 * 5}.0` },
          { t: '1.0', val: `${stepNeg8 * 4}.0` },
          { t: '2.0', val: `${stepNeg8 * 3}.0` },
          { t: '3.0', val: `${stepNeg8 * 2}.0` },
          { t: '4.0', val: `${stepNeg8}.0` },
          { t: '5.0', val: '0.0' }
        ]
      }
    },
    {
      id: `wizard-9`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: 'The table lists position-time data for an object moving in the positive direction.',
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'Calculating the displacement each second: Δx = 2 m, then 4 m, 6 m, 8 m, 10 m. The distance covered in each consecutive second increases, proving the object is speeding up. Speeding up requires an unbalanced force.',
      simParams: { fNet: 25, initialV: 2, forces: [{ name: 'F_net', value: 35, dir: 'right' }] },
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
    },
    {
      id: `wizard-10`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: 'The table lists position-time data for an object over consecutive seconds.',
      motionDirection: 'positive',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      explanation: 'Calculating the displacement each second: Δx = 10 m, then 8 m, 6 m, 4 m, 2 m. The distance covered each second decreases over time, showing that the object is slowing down. An unbalanced opposing force causes this deceleration.',
      simParams: { fNet: -25, initialV: 7, forces: [{ name: 'F_frict', value: 35, dir: 'left' }] },
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
    },
    {
      id: `wizard-11`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: `The data table directly provides velocity values of an object recorded every second at steady ${velT11}.0 m/s.`,
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `The velocity table directly shows that velocity stays steady at ${velT11}.0 m/s for all time entries. A constant velocity means acceleration is 0 m/s², which requires balanced forces.`,
      simParams: { fNet: 0, initialV: velT11, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Velocity (m/s)',
        rows: [
          { t: '0.0', val: `${velT11}.0` },
          { t: '1.0', val: `${velT11}.0` },
          { t: '2.0', val: `${velT11}.0` },
          { t: '3.0', val: `${velT11}.0` },
          { t: '4.0', val: `${velT11}.0` },
          { t: '5.0', val: `${velT11}.0` }
        ]
      }
    },
    {
      id: `wizard-12`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: `The table records the velocity of an accelerating cart gaining +${velAcc12}.0 m/s each second.`,
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `Velocity increases steadily from 0.0 m/s to ${velAcc12 * 5}.0 m/s (increasing by ${velAcc12}.0 m/s each second). Because speed is increasing, the object is speeding up. A steady acceleration of ${velAcc12}.0 m/s² requires an unbalanced force.`,
      simParams: { fNet: velAcc12 * 10, initialV: 1, forces: [{ name: 'F_net', value: velAcc12 * 10, dir: 'right' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Velocity (m/s)',
        rows: [
          { t: '0.0', val: '0.0' },
          { t: '1.0', val: `${velAcc12}.0` },
          { t: '2.0', val: `${velAcc12 * 2}.0` },
          { t: '3.0', val: `${velAcc12 * 3}.0` },
          { t: '4.0', val: `${velAcc12 * 4}.0` },
          { t: '5.0', val: `${velAcc12 * 5}.0` }
        ]
      }
    },
    {
      id: `wizard-13`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: 'The table tracks the velocity of an object as it decelerates along a straight path.',
      motionDirection: 'positive',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      explanation: 'The velocity drops from 15.0 m/s down to 0.0 m/s over 5 seconds. The speed decreases over time, so the object is slowing down. An unbalanced net force opposing motion causes this change.',
      simParams: { fNet: -25, initialV: 7, forces: [{ name: 'F_frict', value: 35, dir: 'left' }] },
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
    },
    {
      id: `wizard-14`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: 'The table lists velocity values for an object traveling in the negative direction.',
      motionDirection: 'negative',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'Velocity is negative, indicating travel in the negative direction. The speed (|v|) increases from 0.0 m/s to 12.5 m/s. An increasing speed means the object is speeding up, which requires an unbalanced net force.',
      simParams: { fNet: -30, initialV: -1, forces: [{ name: 'F_net', value: 40, dir: 'left' }] },
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
    },
    {
      id: `wizard-15`,
      level: 'Wizard',
      representationType: 'dot_diagram',
      stem: 'High-speed strobe photography captures the positions of an air puck gliding across a low-friction table.',
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The strobe flashes at equal time intervals, producing perfectly uniform spacing between dots. Consistent displacement per interval confirms constant speed. Newton’s first law requires forces to be balanced.',
      simParams: { fNet: 0, initialV: 6, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
      renderData: { type: 'dot_diagram', pattern: 'constant', direction: 'right' }
    },
    {
      id: `wizard-16`,
      level: 'Wizard',
      representationType: 'dot_diagram',
      stem: 'A high-speed sensor captures the positions of a model rocket launching vertically into the air.',
      motionDirection: 'upward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'Successive dot intervals expand in the upward direction. Covering greater vertical distance each second indicates upward acceleration. An unbalanced upward net force drives the acceleration.',
      simParams: { fNet: 30, initialV: 2, forces: [{ name: 'F_thrust', value: 50, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }] },
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'up' }
    },
    {
      id: `wizard-17`,
      level: 'Wizard',
      representationType: 'force_diagram',
      stem: `A highway sedan cruises rightward at steady speed. Engine forward force (${fCruise17} N) exactly matches combined air drag and rolling resistance (${fCruise17} N).`,
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `Forward drive force (${fCruise17} N) balances opposing resistive forces (${fCruise17} N), while vertical normal and gravity forces cancel. With zero net force, the vehicle travels at constant speed.`,
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_app', value: fCruise17, dir: 'right' }, { name: 'F_drag', value: fCruise17, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'medium', code: 'Fapp', label: 'Fa (Drive)' },
          { dir: 'left', magnitude: 'medium', code: 'Ffrict', label: 'Ff + Fair' }
        ]
      }
    },
    {
      id: `wizard-18`,
      level: 'Wizard',
      representationType: 'force_diagram',
      stem: `A parachutist falls downward through the atmosphere having attained terminal velocity (${fSkydive18} N drag = ${fSkydive18} N gravity).`,
      motionDirection: 'downward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: `At terminal velocity, the upward aerodynamic drag (${fSkydive18} N) equals downward gravitational attraction (${fSkydive18} N). The net vertical force is zero, meaning forces are balanced and the descent occurs at constant speed.`,
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_air', value: fSkydive18, dir: 'up' }, { name: 'F_grav', value: fSkydive18, dir: 'down' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fair', label: 'Fair' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' }
        ]
      }
    },
    {
      id: `wizard-19`,
      level: 'Wizard',
      representationType: 'force_diagram',
      stem: `A speeding car locks its brakes and skids rightward across the highway with ${fSkid19} N braking friction.`,
      motionDirection: 'rightward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      explanation: `The only horizontal force is leftward kinetic friction (${fSkid19} N) opposing the rightward motion. The unbalanced net force produces a negative acceleration, causing the car to slow down.`,
      simParams: { fNet: -fSkid19, initialV: 8, forces: [{ name: 'F_frict', value: fSkid19, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'left', magnitude: 'large', code: 'Ffrict', label: 'Ff (Brakes)' }
        ]
      }
    },
    {
      id: `wizard-20`,
      level: 'Wizard',
      representationType: 'force_diagram',
      stem: `A dragster accelerates down the strip with ${fDragster20 + 20} N thrust combating 20 N aerodynamic drag.`,
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: `The massive forward thrust (${fDragster20 + 20} N) significantly outstrips opposing aerodynamic drag (20 N). The large net forward force accelerates the vehicle, so it speeds up rapidly.`,
      simParams: { fNet: fDragster20, initialV: 2, forces: [{ name: 'F_thrust', value: fDragster20 + 20, dir: 'right' }, { name: 'F_drag', value: 20, dir: 'left' }] },
      renderData: {
        type: 'force_diagram',
        forces: [
          { dir: 'up', magnitude: 'medium', code: 'Fnorm', label: 'FN' },
          { dir: 'down', magnitude: 'medium', code: 'Fgrav', label: 'Fg' },
          { dir: 'right', magnitude: 'large', code: 'Fapp', label: 'Fthrust' },
          { dir: 'left', magnitude: 'small', code: 'Fair', label: 'Fair' }
        ]
      }
    }
  ]
}
