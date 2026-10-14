// Procedural Question Generator for Balanced vs. Unbalanced Forces
// Guarantees:
// - Apprentice: exactly 8 distinct Force Diagram questions
// - Master: exactly 14 distinct questions (Position-Time Graphs, Dot Diagrams, Multi-Force Diagrams)
// - Wizard: exactly 20 distinct questions (Velocity-Time Graphs, Kinematic Tables, Advanced Scenarios)
// Zero overlap across levels; every question has distinct visual parameters and physics.

export function generateBalancedQuestions(level, seed = 0) {
  if (level === 'Apprentice') {
    return [
      {
        id: `apprentice-1`,
        level: 'Apprentice',
        representationType: 'force_diagram',
        stem: 'The diagram represents the forces acting upon a rightward-moving object. Each arrow represents a force, and arrow length indicates magnitude.',
        motionDirection: 'rightward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'The upward normal force and downward gravity force are equal in magnitude and opposite in direction. There are no horizontal forces. Because net force is zero (Fnet = 0 N), the forces are balanced, and the object maintains a constant speed.',
        simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_norm', value: 30, dir: 'up' }, { name: 'F_grav', value: 30, dir: 'down' }] },
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
        stem: 'A rightward-moving box is pulled across a floor. Vertical forces are equal, but the rightward pull exceeds the leftward friction.',
        motionDirection: 'rightward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'Vertical forces balance out, but the rightward applied force is larger than the leftward friction force. The net force is directed to the right (in the direction of motion), causing the box to accelerate and speed up.',
        simParams: { fNet: 30, initialV: 2, forces: [{ name: 'F_app', value: 45, dir: 'right' }, { name: 'F_frict', value: 15, dir: 'left' }] },
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
        stem: 'A rightward-moving hockey puck glides across rough ice. Only friction acts along the horizontal axis.',
        motionDirection: 'rightward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The vertical forces balance (FN = Fg). The only horizontal force is leftward friction. Because the net force is directed opposite to the rightward motion, the object slows down. An unbalanced net force is present.',
        simParams: { fNet: -25, initialV: 7, forces: [{ name: 'F_frict', value: 25, dir: 'left' }] },
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
        stem: 'A crate slides leftward across the floor while being pushed with a force exactly equal to opposing friction.',
        motionDirection: 'leftward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'The leftward applied force equals the rightward friction force, and vertical forces balance. The net force is zero. An object in motion with zero net force continues to move at constant speed.',
        simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_app', value: 25, dir: 'left' }, { name: 'F_frict', value: 25, dir: 'right' }] },
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
        stem: 'A leftward-moving cart is propelled leftward with a strong force against a weak opposing drag.',
        motionDirection: 'leftward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'The leftward force is stronger than the rightward drag. The resulting net force is directed to the left (same direction as motion). This causes acceleration to the left, so the cart speeds up.',
        simParams: { fNet: -30, initialV: -2, forces: [{ name: 'F_app', value: 45, dir: 'left' }, { name: 'F_frict', value: 15, dir: 'right' }] },
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
        stem: 'An elevator ascends upward through a building shaft at a steady rate.',
        motionDirection: 'upward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'Upward tension in the cable equals the downward force of gravity. Because the forces are balanced, the elevator has zero acceleration and travels upward at a constant speed.',
        simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_tens', value: 35, dir: 'up' }, { name: 'F_grav', value: 35, dir: 'down' }] },
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
        stem: 'A skydiver plunges downward soon after leaping from an aircraft. Gravity strongly exceeds air drag.',
        motionDirection: 'downward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'Gravity pulls downward with greater magnitude than upward air resistance. The unbalanced downward net force accelerates the skydiver downward, speeding up their descent.',
        simParams: { fNet: -30, initialV: -3, forces: [{ name: 'F_air', value: 15, dir: 'up' }, { name: 'F_grav', value: 45, dir: 'down' }] },
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
        stem: 'A basketball rises upward after being shot. Ignoring air resistance, only gravity acts upon the ball.',
        motionDirection: 'upward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The ball moves upward, but the only force acting is downward gravity. The unbalanced downward force opposes the upward motion, causing the ball to slow down.',
        simParams: { fNet: -25, initialV: 6, forces: [{ name: 'F_grav', value: 25, dir: 'down' }] },
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
    return [
      {
        id: `master-1`,
        level: 'Master',
        representationType: 'position_time_graph',
        stem: 'The graph illustrates the position of an object moving along a linear track over time.',
        motionDirection: 'positive',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'The position-time graph is a straight line with a constant positive slope. A constant slope means constant velocity. Zero acceleration indicates that the net force is zero, meaning forces are balanced.',
        simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
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
        simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_1', value: 20, dir: 'left' }, { name: 'F_2', value: 20, dir: 'right' }] },
        renderData: { type: 'position_time_graph', curveType: 'constant_neg' }
      },
      {
        id: `master-5`,
        level: 'Master',
        representationType: 'dot_diagram',
        stem: 'A motion sensor records the position of a rightward-moving cart at equal 0.2-second time intervals.',
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
        stem: 'A ticker tape attached to a rightward-moving vehicle leaves marks at consecutive equal time intervals.',
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
        stem: 'A car applies brakes while moving rightward, dropping oil droplets at fixed 1-second intervals.',
        motionDirection: 'rightward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The spacing between successive drops becomes progressively smaller. Traveling less distance each second indicates the car is slowing down. Deceleration requires an unbalanced net force opposing motion.',
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
        stem: 'A rightward-moving crate is pushed by two forward workers while friction opposes.',
        motionDirection: 'rightward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'Two rightward forces (Fa1 + Fa2) total more magnitude than the leftward friction force. The net force is rightward in the direction of motion, so the crate speeds up.',
        simParams: { fNet: 30, initialV: 3, forces: [{ name: 'F_app1', value: 30, dir: 'right' }, { name: 'F_app2', value: 20, dir: 'right' }, { name: 'F_frict', value: 20, dir: 'left' }] },
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
        stem: 'A rightward-moving trunk is pushed rightward, but ground friction is significantly stronger.',
        motionDirection: 'rightward',
        motionAnswer: 'Slowing Down',
        forceAnswer: 'Unbalanced',
        explanation: 'The leftward friction force exceeds the rightward applied push. The net horizontal force points to the left, opposing the rightward motion and causing the trunk to slow down.',
        simParams: { fNet: -25, initialV: 6, forces: [{ name: 'F_frict', value: 45, dir: 'left' }, { name: 'F_app', value: 20, dir: 'right' }] },
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
        stem: 'A deep-sea acoustic probe is hoisted upward at constant velocity through the water.',
        motionDirection: 'upward',
        motionAnswer: 'Constant Speed',
        forceAnswer: 'Balanced',
        explanation: 'Upward cable tension and buoyancy together balance downward gravity and water drag. When net force is zero, an object moves upward at constant speed.',
        simParams: { fNet: 0, initialV: 4, forces: [{ name: 'F_tens', value: 40, dir: 'up' }, { name: 'F_grav', value: 40, dir: 'down' }] },
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
        stem: 'A rocket engine ignites on ascent, producing massive upward thrust exceeding gravity and aerodynamic drag.',
        motionDirection: 'upward',
        motionAnswer: 'Speeding Up',
        forceAnswer: 'Unbalanced',
        explanation: 'The upward thrust arrow is significantly larger than downward gravity and drag combined. This net upward force causes upward acceleration, so the rocket speeds up.',
        simParams: { fNet: 35, initialV: 3, forces: [{ name: 'F_thrust', value: 55, dir: 'up' }, { name: 'F_grav', value: 20, dir: 'down' }] },
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

  // Wizard Level: 20 Questions (Velocity-Time Graphs, Kinematic Tables, Advanced Scenarios)
  return [
    {
      id: `wizard-1`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: 'The velocity-time graph represents the motion of an object over a 5.0-second interval.',
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'A horizontal line on a velocity-time graph indicates that velocity remains constant over time. The slope (acceleration) is zero. Zero acceleration signifies that all forces acting on the object are balanced.',
      simParams: { fNet: 0, initialV: 6, forces: [{ name: 'F_1', value: 25, dir: 'right' }, { name: 'F_2', value: 25, dir: 'left' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'constant_pos' }
    },
    {
      id: `wizard-2`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: 'The velocity-time graph shows an object moving in the positive direction starting from rest.',
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The line has a positive slope, and velocity increases away from the time axis (from 0 to 20 m/s). Speed is increasing. A non-zero acceleration means the net force is non-zero (unbalanced).',
      simParams: { fNet: 30, initialV: 1, forces: [{ name: 'F_net', value: 40, dir: 'right' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'speeding_up_pos' }
    },
    {
      id: `wizard-3`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: 'The velocity-time graph depicts an object approaching a stop.',
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
      stem: 'The velocity-time graph illustrates an object moving in the negative direction.',
      motionDirection: 'negative',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The graph is a horizontal line below the zero axis. The velocity is constant at a negative value. Because the velocity does not change, acceleration is zero, indicating balanced forces.',
      simParams: { fNet: 0, initialV: -6, forces: [{ name: 'F_1', value: 25, dir: 'left' }, { name: 'F_2', value: 25, dir: 'right' }] },
      renderData: { type: 'velocity_time_graph', curveType: 'constant_neg' }
    },
    {
      id: `wizard-5`,
      level: 'Wizard',
      representationType: 'velocity_time_graph',
      stem: 'The velocity-time graph shows an object moving in the negative direction starting from rest.',
      motionDirection: 'negative',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The line begins at v = 0 and slants downward into negative numbers, moving farther from the zero axis. The absolute speed |v| is increasing. Speeding up in the negative direction requires an unbalanced negative net force.',
      simParams: { fNet: -30, initialV: -1, forces: [{ name: 'F_net', value: 40, dir: 'left' }] },
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
      stem: 'The table displays position-time data for an object moving along a 1D track.',
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'During each 1.0-second time interval, the position changes by exactly +10.0 m. A constant rate of displacement means constant velocity (10 m/s). With zero acceleration, the forces are balanced.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Position (m)',
        rows: [
          { t: '0.0', val: '0.0' },
          { t: '1.0', val: '10.0' },
          { t: '2.0', val: '20.0' },
          { t: '3.0', val: '30.0' },
          { t: '4.0', val: '40.0' },
          { t: '5.0', val: '50.0' }
        ]
      }
    },
    {
      id: `wizard-8`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: 'The table records position-time data for an object traveling in the negative direction.',
      motionDirection: 'negative',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The position decreases by exactly 10.0 m every single second (-10 m/s). Because velocity is constant, there is no acceleration, which means net force is zero and forces are balanced.',
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_1', value: 20, dir: 'left' }, { name: 'F_2', value: 20, dir: 'right' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Position (m)',
        rows: [
          { t: '0.0', val: '50.0' },
          { t: '1.0', val: '40.0' },
          { t: '2.0', val: '30.0' },
          { t: '3.0', val: '20.0' },
          { t: '4.0', val: '10.0' },
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
      stem: 'The data table directly provides velocity values of an object recorded every second.',
      motionDirection: 'positive',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'The velocity table directly shows that velocity stays steady at 8.0 m/s for all time entries. A constant velocity means acceleration is 0 m/s², which requires balanced forces.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_1', value: 20, dir: 'right' }, { name: 'F_2', value: 20, dir: 'left' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Velocity (m/s)',
        rows: [
          { t: '0.0', val: '8.0' },
          { t: '1.0', val: '8.0' },
          { t: '2.0', val: '8.0' },
          { t: '3.0', val: '8.0' },
          { t: '4.0', val: '8.0' },
          { t: '5.0', val: '8.0' }
        ]
      }
    },
    {
      id: `wizard-12`,
      level: 'Wizard',
      representationType: 'kinematic_table',
      stem: 'The table records the velocity of an object moving in the positive direction.',
      motionDirection: 'positive',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'Velocity increases from 0.0 m/s to 15.0 m/s (increasing by 3.0 m/s each second). Because speed is increasing, the object is speeding up. A steady acceleration of 3.0 m/s² requires an unbalanced force.',
      simParams: { fNet: 30, initialV: 1, forces: [{ name: 'F_net', value: 40, dir: 'right' }] },
      renderData: {
        type: 'kinematic_table',
        colHeader: 'Velocity (m/s)',
        rows: [
          { t: '0.0', val: '0.0' },
          { t: '1.0', val: '3.0' },
          { t: '2.0', val: '6.0' },
          { t: '3.0', val: '9.0' },
          { t: '4.0', val: '12.0' },
          { t: '5.0', val: '15.0' }
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
      explanation: 'The velocity drops from 15.0 m/s down to 0.0 m/s over 5 seconds. The speed decreases over time, so the object is slowing down. An unbalanced net force opposing the motion causes this change.',
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
      renderData: { type: 'dot_diagram', pattern: 'accelerating', direction: 'right' }
    },
    {
      id: `wizard-17`,
      level: 'Wizard',
      representationType: 'force_diagram',
      stem: 'A highway sedan cruises rightward at 65 mph. The engine drive force exactly matches combined air drag and rolling friction.',
      motionDirection: 'rightward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'Forward drive force (Fa = 50 N) balances opposing resistive forces (Fair + Ff = 50 N), while vertical normal and gravity forces cancel. With zero net force, the vehicle travels at constant speed.',
      simParams: { fNet: 0, initialV: 5, forces: [{ name: 'F_app', value: 30, dir: 'right' }, { name: 'F_drag', value: 30, dir: 'left' }] },
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
      stem: 'A parachutist falls downward through the atmosphere having attained terminal velocity.',
      motionDirection: 'downward',
      motionAnswer: 'Constant Speed',
      forceAnswer: 'Balanced',
      explanation: 'At terminal velocity, the upward aerodynamic drag equals downward gravitational attraction. The net vertical force is zero, meaning forces are balanced and the descent occurs at constant speed.',
      simParams: { fNet: 0, initialV: -5, forces: [{ name: 'F_air', value: 35, dir: 'up' }, { name: 'F_grav', value: 35, dir: 'down' }] },
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
      stem: 'A speeding car locks its brakes and skids rightward across the highway surface.',
      motionDirection: 'rightward',
      motionAnswer: 'Slowing Down',
      forceAnswer: 'Unbalanced',
      explanation: 'The only horizontal force is leftward kinetic friction opposing the rightward motion. The unbalanced net force produces a negative acceleration, causing the car to slow down.',
      simParams: { fNet: -35, initialV: 8, forces: [{ name: 'F_frict', value: 40, dir: 'left' }] },
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
      stem: 'A dragster accelerates down the strip with 180 N thrust combating 40 N aerodynamic drag.',
      motionDirection: 'rightward',
      motionAnswer: 'Speeding Up',
      forceAnswer: 'Unbalanced',
      explanation: 'The massive forward thrust significantly outstrips opposing aerodynamic drag. The large net forward force accelerates the vehicle, so it speeds up rapidly.',
      simParams: { fNet: 40, initialV: 2, forces: [{ name: 'F_thrust', value: 60, dir: 'right' }, { name: 'F_drag', value: 20, dir: 'left' }] },
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
