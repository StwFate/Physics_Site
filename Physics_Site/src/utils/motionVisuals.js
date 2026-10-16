/**
 * Visual metadata registry and resolver system for personalized motion simulation.
 * Maps Balanced Forces questions (126 procedural templates + randomized nouns),
 * Free-Body Diagrams (12 scenarios), and Solve It! (8 problem types)
 * to structured visual descriptors: { family, variant, environment, equipment, title, anchor }.
 */

export const NOUN_MAP = {
  // Horizontal Boxes (hBoxes)
  'wooden crate': { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: 'Wooden Crate' },
  'cargo trunk': { family: 'crate', variant: 'cargo-trunk', environment: 'floor', title: 'Cargo Trunk' },
  'storage container': { family: 'crate', variant: 'storage-container', environment: 'floor', title: 'Storage Container' },
  'metal equipment box': { family: 'crate', variant: 'equipment-box', environment: 'floor', title: 'Equipment Box' },
  'shipping package': { family: 'crate', variant: 'shipping-package', environment: 'floor', title: 'Shipping Package' },
  'heavy toolbox': { family: 'crate', variant: 'heavy-toolbox', environment: 'floor', title: 'Heavy Toolbox' },
  'dresser': { family: 'crate', variant: 'dresser', environment: 'floor', title: 'Bedroom Dresser' },

  // Gliders
  'hockey puck': { family: 'glider', variant: 'hockey-puck', environment: 'ice', title: 'Hockey Puck' },
  'curling stone': { family: 'glider', variant: 'curling-stone', environment: 'ice', title: 'Curling Stone' },
  'low-friction sled': { family: 'glider', variant: 'sled', environment: 'ice', title: 'Low-Friction Sled' },
  'gliding cart': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Gliding Cart' },
  'air-track glider': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'hover puck': { family: 'glider', variant: 'hover-puck', environment: 'lab-track', title: 'Hover Puck' },

  // Lifts
  'service elevator': { family: 'elevator', variant: 'elevator-cab', environment: 'shaft', equipment: { cable: true }, title: 'Service Elevator' },
  'cargo hoist': { family: 'elevator', variant: 'cargo-hoist', environment: 'shaft', equipment: { cable: true }, title: 'Cargo Hoist' },
  'mining bucket': { family: 'elevator', variant: 'mining-bucket', environment: 'shaft', equipment: { cable: true }, title: 'Mining Bucket' },
  'aerial platform': { family: 'elevator', variant: 'aerial-platform', environment: 'shaft', equipment: { cable: true }, title: 'Aerial Platform' },
  'cable car': { family: 'elevator', variant: 'cable-car', environment: 'shaft', equipment: { cable: true }, title: 'Cable Car' },
  'window-washing rig': { family: 'elevator', variant: 'window-rig', environment: 'shaft', equipment: { cable: true }, title: 'Window-Washing Rig' },

  // Aerials
  'weather capsule': { family: 'skydiver', variant: 'weather-capsule', environment: 'sky', title: 'Weather Capsule' },
  'model rocket': { family: 'rocket', variant: 'model-rocket', environment: 'sky', equipment: { thruster: true }, title: 'Model Rocket' },
  'skydiver': { family: 'skydiver', variant: 'skydiver', environment: 'sky', title: 'Skydiver' },
  'science probe': { family: 'rocket', variant: 'space-probe', environment: 'sky', title: 'Science Probe' },
  'descending payload': { family: 'skydiver', variant: 'cargo-pod', environment: 'sky', title: 'Descending Payload' },
  'drone': { family: 'drone', variant: 'quadcopter', environment: 'sky', equipment: { rotors: true }, title: 'Quadcopter Drone' },

  // Apprentice-12 Pool
  'space probe': { family: 'rocket', variant: 'space-probe', environment: 'sky', equipment: { thruster: true }, title: 'Space Probe' },
  'sounding rocket': { family: 'rocket', variant: 'sounding-rocket', environment: 'sky', equipment: { thruster: true }, title: 'Sounding Rocket' },
  'survey drone': { family: 'drone', variant: 'quadcopter', environment: 'sky', equipment: { rotors: true }, title: 'Survey Drone' },

  // Apprentice-13 Pool
  'parachutist': { family: 'skydiver', variant: 'parachutist', environment: 'sky', equipment: { parachute: true }, title: 'Parachutist' },
  'recovery capsule': { family: 'skydiver', variant: 'recovery-capsule', environment: 'sky', equipment: { parachute: true }, title: 'Recovery Capsule' },
  'airdropped cargo': { family: 'skydiver', variant: 'cargo-pod', environment: 'sky', equipment: { parachute: true }, title: 'Airdropped Cargo' },
  'supply crate': { family: 'crate', variant: 'wooden-crate', environment: 'sky', equipment: { parachute: true }, title: 'Supply Crate' },

  // Vehicles
  'delivery van': { family: 'car', variant: 'delivery-van', environment: 'road', title: 'Delivery Van' },
  'freight truck': { family: 'car', variant: 'freight-truck', environment: 'road', title: 'Freight Truck' },
  'sports coupe': { family: 'car', variant: 'sports-coupe', environment: 'road', title: 'Sports Coupe' },
  'hybrid sedan': { family: 'car', variant: 'sedan', environment: 'road', title: 'Hybrid Sedan' },
  'electric roadster': { family: 'car', variant: 'sports-coupe', environment: 'road', title: 'Electric Roadster' },
  'cargo train': { family: 'train', variant: 'cargo-train', environment: 'rails', title: 'Cargo Train' },

  // Balls
  'bowling ball': { family: 'ball', variant: 'bowling-ball', environment: 'sky', title: 'Bowling Ball' },
  'tennis ball': { family: 'ball', variant: 'tennis-ball', environment: 'sky', title: 'Tennis Ball' },
  'soccer ball': { family: 'ball', variant: 'soccer-ball', environment: 'sky', title: 'Soccer Ball' },
  'baseball': { family: 'ball', variant: 'baseball', environment: 'sky', title: 'Baseball' },
  'basketball': { family: 'ball', variant: 'basketball', environment: 'sky', title: 'Basketball' },
  'steel bearing': { family: 'ball', variant: 'steel-sphere', environment: 'sky', title: 'Steel Bearing' },

  // Apprentice-19 Pool (Balloons)
  'weather balloon': { family: 'balloon', variant: 'weather-balloon', environment: 'sky', title: 'Weather Balloon' },
  'surveillance aerostat': { family: 'balloon', variant: 'blimp', environment: 'sky', title: 'Surveillance Aerostat' },
  'hot-air balloon': { family: 'balloon', variant: 'hot-air-balloon', environment: 'sky', title: 'Hot-Air Balloon' },
  'helium blimp': { family: 'balloon', variant: 'blimp', environment: 'sky', title: 'Helium Blimp' },

  // Apprentice-23 Pool (High-speed test craft)
  'hovercraft': { family: 'boat', variant: 'hovercraft', environment: 'track', equipment: { propeller: true }, title: 'Hovercraft' },
  'maglev test sled': { family: 'train', variant: 'maglev', environment: 'maglev-track', title: 'Maglev Test Sled' },
  'aerodynamic glider': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Aerodynamic Glider' },
  'wind-tunnel carriage': { family: 'aircraft', variant: 'wind-tunnel-plane', environment: 'lab-track', equipment: { propeller: true }, title: 'Wind-Tunnel Carriage' }
}

export const BALANCED_MASTER_MAP = {
  'master-1': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'master-2': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Accelerating Lab Cart' },
  'master-3': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Decelerating Lab Cart' },
  'master-4': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'master-5': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'master-6': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'master-7': { family: 'car', variant: 'model-car', environment: 'track', title: 'Motorized Model Car' },
  'master-8': { family: 'car', variant: 'scooter', environment: 'road', title: 'Electric Scooter' },
  'master-9': { family: 'car', variant: 'skateboarder', environment: 'turf', title: 'Coasting Skateboarder' },
  'master-10': { family: 'glider', variant: 'agv-cart', environment: 'warehouse', title: 'Automated Delivery Cart' },
  'master-11': { family: 'elevator', variant: 'mining-bucket', environment: 'shaft', equipment: { cable: true }, title: 'Mining Hoist' },
  'master-12': { family: 'car', variant: 'rover', environment: 'regolith', equipment: { thruster: true }, title: 'Planetary Rover' },
  'master-13': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'master-14': { family: 'athlete', variant: 'sprinter', environment: 'track-lane', title: 'Sprinting Runner' },
  'master-15': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Laboratory Cart' },
  'master-16': { family: 'car', variant: 'sedan', environment: 'road', title: 'Passenger Vehicle' },
  'master-17': { family: 'car', variant: 'sedan', environment: 'road', title: 'Braking Vehicle' },
  'master-18': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Laboratory Cart' },
  'master-19': { family: 'glider', variant: 'hover-puck', environment: 'lab-track', title: 'Hover Puck' },
  'master-20': { family: 'glider', variant: 'sled', environment: 'gravel', title: 'Sled on Gravel' },
  'master-21': { family: 'skydiver', variant: 'weather-capsule', environment: 'tower-shaft', title: 'Weather Capsule' },
  'master-22': { family: 'rocket', variant: 'model-rocket', environment: 'sky', equipment: { thruster: true }, title: 'Ascending Model Rocket' },
  'master-23': { family: 'ball', variant: 'baseball', environment: 'sky', title: 'Rising Ball' },
  'master-24': { family: 'elevator', variant: 'elevator-cab', environment: 'shaft', equipment: { cable: true }, title: 'Descending Elevator' },
  'master-25': { family: 'ball', variant: 'steel-sphere', environment: 'vacuum-tube', title: 'Steel Sphere in Vacuum' },
  'master-26': { family: 'skydiver', variant: 'cargo-pod', environment: 'sky', equipment: { parachute: true }, title: 'Descending Payload' },
  'master-27': { family: 'car', variant: 'freight-truck', environment: 'road', title: 'Delivery Truck' },
  'master-28': { family: 'glider', variant: 'hockey-puck', environment: 'ice', title: 'Hockey Puck' },
  'master-29': { family: 'crate', variant: 'wooden-crate', environment: 'warehouse', title: 'Pushed Crate' },
  'master-30': { family: 'crate', variant: 'cargo-trunk', environment: 'floor', title: 'Pushed Trunk' },
  'master-31': { family: 'submarine', variant: 'acoustic-probe', environment: 'underwater', equipment: { cable: true }, title: 'Deep-Sea Acoustic Probe' },
  'master-32': { family: 'rocket', variant: 'space-probe', environment: 'sky', equipment: { thruster: true }, title: 'Probe Rocket' },
  'master-33': { family: 'glider', variant: 'sled', environment: 'snow', equipment: { towCable: true }, title: 'Snow Sled' },
  'master-34': { family: 'glider', variant: 'transport-cart', environment: 'warehouse', title: 'Transport Cart' },
  'master-35': { family: 'crate', variant: 'storage-container', environment: 'warehouse', equipment: { towCable: true }, title: 'Heavy Storage Container' },
  'master-36': { family: 'elevator', variant: 'cargo-hoist', environment: 'shaft', equipment: { cable: true }, title: 'Service Hoist' },
  'master-37': { family: 'elevator', variant: 'elevator-cab', environment: 'shaft', equipment: { cable: true }, title: 'Elevator Carriage' },
  'master-38': { family: 'submarine', variant: 'submersible-probe', environment: 'underwater', title: 'Submerged Sensor Package' },
  'master-39': { family: 'train', variant: 'locomotive', environment: 'rails', title: 'Train Locomotive' },
  'master-40': { family: 'crate', variant: 'storage-container', environment: 'warehouse', equipment: { towCable: true }, title: 'Warehouse Container' },
  'master-41': { family: 'elevator', variant: 'brick-pallet', environment: 'shaft', equipment: { cable: true }, title: 'Pallet of Bricks' },
  'master-42': { family: 'boat', variant: 'hovercraft', environment: 'track', equipment: { propeller: true }, title: 'Test Hovercraft' }
}

export const BALANCED_WIZARD_MAP = {
  'wizard-1': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-2': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Accelerating Lab Cart' },
  'wizard-3': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Braking Lab Cart' },
  'wizard-4': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'wizard-5': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'wizard-6': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'wizard-7': { family: 'train', variant: 'bullet-train', environment: 'rails', title: 'High-Speed Train' },
  'wizard-8': { family: 'car', variant: 'dragster', environment: 'road', equipment: { thruster: true }, title: 'Top-Fuel Dragster' },
  'wizard-9': { family: 'car', variant: 'sedan', environment: 'road', title: 'School Zone Vehicle' },
  'wizard-10': { family: 'rocket', variant: 'space-probe', environment: 'space', title: 'Deep-Space Probe' },
  'wizard-11': { family: 'submarine', variant: 'bathyscaphe', environment: 'underwater', equipment: { thruster: true }, title: 'Deep-Sea Bathyscaphe' },
  'wizard-12': { family: 'car', variant: 'sedan', environment: 'road', title: 'Reversing Car' },
  'wizard-13': { family: 'train', variant: 'maglev', environment: 'maglev-track', title: 'Maglev Train' },
  'wizard-14': { family: 'train', variant: 'tube-pod', environment: 'maglev-track', title: 'Low-Pressure Tube Pod' },
  'wizard-15': { family: 'car', variant: 'freight-truck', environment: 'road', title: 'Heavy Cargo Hauler' },
  'wizard-16': { family: 'crate', variant: 'shipping-package', environment: 'conveyor', title: 'Conveyor Pallet' },
  'wizard-17': { family: 'skydiver', variant: 'skydiver', environment: 'sky', title: 'Streamline Skydiver' },
  'wizard-18': { family: 'skydiver', variant: 'reentry-capsule', environment: 'sky', title: 'Re-entry Capsule' },
  'wizard-19': { family: 'glider', variant: 'agv-cart', environment: 'warehouse', title: 'Automated Guided Vehicle' },
  'wizard-20': { family: 'train', variant: 'mine-cart', environment: 'rails', title: 'Runaway Mine Cart' },
  'wizard-21': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-22': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-23': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-24': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-25': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'wizard-26': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'wizard-27': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Linear Track Glider' },
  'wizard-28': { family: 'car', variant: 'rover', environment: 'regolith', title: 'Robotic Rover' },
  'wizard-29': { family: 'glider', variant: 'test-carriage', environment: 'lab-track', title: 'Automated Testing Carriage' },
  'wizard-30': { family: 'car', variant: 'sedan', environment: 'road', title: 'Braking Vehicle' },
  'wizard-31': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-32': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Lab Dynamics Cart' },
  'wizard-33': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Accelerating Lab Cart' },
  'wizard-34': { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Decelerating Lab Cart' },
  'wizard-35': { family: 'glider', variant: 'air-glider', environment: 'lab-track', title: 'Air-Track Glider' },
  'wizard-36': { family: 'car', variant: 'sedan', environment: 'road', title: 'Negative-Traveling Vehicle' },
  'wizard-37': { family: 'train', variant: 'bullet-train', environment: 'rails', title: 'Express Train' },
  'wizard-38': { family: 'rocket', variant: 'rocket-sled', environment: 'track', equipment: { thruster: true }, title: 'Supersonic Sled' },
  'wizard-39': { family: 'aircraft', variant: 'jet-aircraft', environment: 'runway', equipment: { thruster: true }, title: 'Rollout Jet Aircraft' },
  'wizard-40': { family: 'elevator', variant: 'elevator-cab', environment: 'shaft', equipment: { cable: true }, title: 'Elevator Car' },
  'wizard-41': { family: 'car', variant: 'sedan', environment: 'road', title: 'Highway Sedan' },
  'wizard-42': { family: 'skydiver', variant: 'parachutist', environment: 'sky', equipment: { parachute: true }, title: 'Atmospheric Parachutist' },
  'wizard-43': { family: 'car', variant: 'sports-coupe', environment: 'road', equipment: { lockedWheels: true }, title: 'Skidding Car' },
  'wizard-44': { family: 'car', variant: 'dragster', environment: 'road', equipment: { thruster: true }, title: 'Strip Dragster' },
  'wizard-45': { family: 'glider', variant: 'hover-puck', environment: 'lab-track', title: 'Gliding Air Puck' },
  'wizard-46': { family: 'rocket', variant: 'model-rocket', environment: 'sky', equipment: { thruster: true }, title: 'Vertical Model Rocket' },
  'wizard-47': { family: 'submarine', variant: 'submarine', environment: 'underwater', title: 'Exploration Submarine' },
  'wizard-48': { family: 'elevator', variant: 'elevator-cab', environment: 'shaft', equipment: { cable: true }, title: 'Ascending Elevator' },
  'wizard-49': { family: 'glider', variant: 'sled', environment: 'snow', equipment: { towCable: true }, title: 'Harness Snow Sled' },
  'wizard-50': { family: 'crate', variant: 'storage-container', environment: 'warehouse', title: 'Heavy Metal Container' },
  'wizard-51': { family: 'drone', variant: 'quadcopter', environment: 'sky', equipment: { rotors: true }, title: 'Quadcopter Delivery Drone' },
  'wizard-52': { family: 'rocket', variant: 'lunar-lander', environment: 'space', equipment: { thruster: true }, title: 'Lunar Lander' },
  'wizard-53': { family: 'train', variant: 'mine-cart', environment: 'rails', title: 'Coasting Rail Cart' },
  'wizard-54': { family: 'train', variant: 'bullet-train', environment: 'rails', title: 'Aerodynamic Bullet Train' },
  'wizard-55': { family: 'boat', variant: 'speedboat', environment: 'water', equipment: { propeller: true }, title: 'Racing Speedboat' },
  'wizard-56': { family: 'skydiver', variant: 'paratrooper', environment: 'sky', equipment: { parachute: true }, title: 'Paratrooper with Drogue' },
  'wizard-57': { family: 'crate', variant: 'wooden-crate', environment: 'warehouse', equipment: { towCable: true }, title: 'Cargo Crate with Safety Cable' },
  'wizard-58': { family: 'aircraft', variant: 'wind-tunnel-plane', environment: 'lab-track', equipment: { propeller: true }, title: 'Wind Tunnel Model Aircraft' },
  'wizard-59': { family: 'rocket', variant: 'rocket-sled', environment: 'ice', equipment: { thruster: true }, title: 'Ice Plain Rocket Sled' },
  'wizard-60': { family: 'submarine', variant: 'ocean-probe', environment: 'underwater', title: 'Abyssal Ocean Probe' }
}

export const FBD_SCENARIOS_MAP = {
  1: { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: 'Wooden Crate' },
  2: { family: 'crate', variant: 'dresser', environment: 'floor', title: 'Bedroom Dresser' },
  3: { family: 'car', variant: 'sedan', environment: 'road', equipment: { lockedWheels: true }, title: 'Skidding Car' },
  4: { family: 'ball', variant: 'football', environment: 'field-sky', title: 'Football in Flight' },
  5: { family: 'elevator', variant: 'freight-elevator', environment: 'shaft', equipment: { cable: true }, title: 'Freight Elevator' },
  6: { family: 'skydiver', variant: 'skydiver', environment: 'sky', title: 'Freefall Skydiver' },
  7: { family: 'glider', variant: 'hockey-puck', environment: 'ice', title: 'Hockey Puck' },
  8: { family: 'glider', variant: 'sledder', environment: 'snow', title: 'Sledder on Snow' },
  9: { family: 'ball', variant: 'football', environment: 'field-sky', title: 'Football at Apex' },
  10: { family: 'skydiver', variant: 'parachutist', environment: 'sky', equipment: { parachute: true }, title: 'Deployed Parachutist' },
  11: { family: 'elevator', variant: 'freight-elevator', environment: 'shaft', equipment: { cable: true }, title: 'Freight Elevator' },
  12: { family: 'athlete', variant: 'softball-slider', environment: 'dirt', title: 'Softball Slider' }
}

export const SOLVE_IT_MAP = {
  1: { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: 'Decelerating Box' },
  2: { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: 'Braking Box' },
  3: { family: 'crate', variant: 'cargo-trunk', environment: 'warehouse', title: 'Accelerating Cargo Trunk' },
  4: { family: 'crate', variant: 'storage-container', environment: 'warehouse', title: 'Pushed Storage Container' },
  5: { family: 'glider', variant: 'sled', environment: 'snow', title: 'Accelerating Sled' },
  6: { family: 'crate', variant: 'equipment-box', environment: 'warehouse', title: 'Equipment Box' },
  7: { family: 'crate', variant: 'wooden-crate', environment: 'warehouse', title: 'Heavy Wooden Crate' },
  8: { family: 'glider', variant: 'lab-cart', environment: 'lab-track', title: 'Accelerating Lab Cart' }
}

export function getDefaultAnchor(family, variant, equipment = {}) {
  if (equipment.parachute) return { rx: 46, ry: 58 }
  if (equipment.cable) return { rx: 38, ry: 52 }
  switch (family) {
    case 'ball': return { rx: 22, ry: 22 }
    case 'elevator': return { rx: 38, ry: 48 }
    case 'rocket': return variant === 'rocket-sled' ? { rx: 50, ry: 32 } : { rx: 32, ry: 50 }
    case 'skydiver': return { rx: 36, ry: 36 }
    case 'balloon': return { rx: 44, ry: 56 }
    case 'submarine': return { rx: 52, ry: 32 }
    case 'boat': return { rx: 50, ry: 34 }
    case 'aircraft': return { rx: 52, ry: 32 }
    case 'drone': return { rx: 46, ry: 36 }
    case 'train': return { rx: 54, ry: 38 }
    case 'car': return { rx: 50, ry: 36 }
    case 'athlete': return { rx: 44, ry: 38 }
    case 'glider':
      if (['hockey-puck', 'curling-stone', 'hover-puck'].includes(variant)) return { rx: 38, ry: 24 }
      if (['sled', 'sledder'].includes(variant)) return { rx: 46, ry: 34 }
      return { rx: 48, ry: 36 }
    case 'crate':
    default:
      return { rx: 46, ry: 38 }
  }
}

/**
 * Normalizes visual metadata and calculates accurate force vector anchors.
 */
export function resolveVisualMeta(visual, objectLabel = 'Object', model = null) {
  let base = null
  if (visual && visual.family) {
    base = { ...visual }
  } else if (model?.projectile) {
    base = { family: 'ball', variant: 'football', environment: 'field-sky', title: objectLabel || 'Football' }
  } else if (model?.vertical) {
    base = { family: 'elevator', variant: 'elevator-cab', environment: 'shaft', equipment: { cable: true }, title: objectLabel || 'Elevator' }
  } else {
    base = { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: objectLabel || 'Crate' }
  }

  const equipment = { ...(base.equipment || {}) }
  const anchor = base.anchor || getDefaultAnchor(base.family, base.variant, equipment)
  const environment = base.environment || (model?.vertical ? 'shaft' : model?.projectile ? 'field-sky' : 'floor')
  const title = base.title || objectLabel || 'Object'

  return {
    family: base.family,
    variant: base.variant,
    environment,
    equipment,
    title,
    anchor
  }
}

/**
 * Resolves visual metadata for any Balanced Forces question.
 * Dynamically resolves noun tokens in Apprentice questions or template mappings in Master/Wizard.
 */
export function resolveQuestionVisual(question) {
  if (!question) return resolveVisualMeta(null)

  const id = question.id || ''

  // Master level questions
  if (BALANCED_MASTER_MAP[id]) {
    return resolveVisualMeta(BALANCED_MASTER_MAP[id], BALANCED_MASTER_MAP[id].title)
  }

  // Wizard level questions
  if (BALANCED_WIZARD_MAP[id]) {
    return resolveVisualMeta(BALANCED_WIZARD_MAP[id], BALANCED_WIZARD_MAP[id].title)
  }

  // Apprentice level questions (inspect stem for randomized noun)
  if (id.startsWith('apprentice-')) {
    const stem = (question.stem || '').toLowerCase()
    let matchedNoun = null

    // Sort noun keys by length descending to match longest phrases first (e.g. "metal equipment box" before "box")
    const nounKeys = Object.keys(NOUN_MAP).sort((a, b) => b.length - a.length)
    for (const noun of nounKeys) {
      if (stem.includes(noun)) {
        matchedNoun = noun
        break
      }
    }

    let meta = matchedNoun ? { ...NOUN_MAP[matchedNoun] } : { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: 'Object' }
    meta.equipment = { ...(meta.equipment || {}) }

    // Question-specific overrides
    if (id === 'apprentice-9') {
      meta.environment = 'warehouse'
    } else if (id === 'apprentice-11') {
      meta.equipment.parachute = true
      meta.environment = 'sky'
    } else if (id === 'apprentice-16') {
      meta.environment = 'gravel'
    } else if (id === 'apprentice-18') {
      meta.equipment.thruster = true
    } else if (id === 'apprentice-24') {
      meta.environment = 'conveyor'
    }

    return resolveVisualMeta(meta, meta.title)
  }

  // Fallback
  return resolveVisualMeta(null, question.motionDirection?.includes('up') || question.motionDirection?.includes('down') ? 'Payload' : 'Cart')
}

/**
 * Resolves visual metadata for an FBD scenario.
 */
export function resolveFBDVisual(scenario) {
  if (!scenario) return resolveVisualMeta(null)
  const id = scenario.id
  const base = FBD_SCENARIOS_MAP[id] || { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: scenario.objectContext || 'Object' }
  return resolveVisualMeta(base, scenario.objectContext || base.title)
}

/**
 * Resolves visual metadata for a Solve It! problem.
 */
export function resolveSolveItVisual(problemId, problem) {
  const base = SOLVE_IT_MAP[problemId] || { family: 'crate', variant: 'wooden-crate', environment: 'floor', title: 'Box' }
  return resolveVisualMeta(base, base.title)
}
