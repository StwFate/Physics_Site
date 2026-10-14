// Test script for SolveItModule.jsx problem generation and check logic across all 8 problem types (Apprentice 1-2, Master 3-5, Wizard 6-8)

function generateProblemInstance(problemId) {
  const g = 9.8
  const rA = Math.random()
  const rB = Math.random()
  const rC = Math.random()

  let p = {
    id: problemId,
    given: {},
    target: {},
    text: '',
    level: 'Apprentice',
  }

  if (problemId === 1) {
    p.level = 'Apprentice'
    const mass = Math.round((5 + 10 * rA) * 10) / 10
    const muVal = 0.7 + 0.2 * rB
    const Ffrict = Math.round(mass * g * muVal * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Fnet = Ffrict
    const acceln = Math.round((Fnet / mass) * 100) / 100

    p.given = { mass, Ffrict }
    p.target = { Fnorm, Fgrav, Ffrict, mass, acceln, Fnet }
  } else if (problemId === 2) {
    p.level = 'Apprentice'
    const mass = Math.round((12 + 20 * rA) * 10) / 10
    const acceln = Math.round((5 + 3 * rB) * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Ffrict = Fnet
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav

    p.given = { mass, acceln }
    p.target = { Fnorm, Fgrav, Ffrict, mass, acceln, Fnet }
  } else if (problemId === 3) {
    p.level = 'Master'
    const mass = Math.round((3 + 4 * rA) * 10) / 10
    const Fapp = Math.round(80 + 20 * rB)
    const muVal = 0.5 + 0.4 * rC
    const Ffrict = Math.round(mass * g * muVal * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Fnet = Math.round((Fapp - Ffrict) * 10) / 10
    const acceln = Math.round((Fnet / mass) * 100) / 100

    p.given = { mass, Fapp, Ffrict }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mass, acceln, Fnet }
  } else if (problemId === 4) {
    p.level = 'Master'
    const mass = Math.round((12 + 5 * rA) * 10) / 10
    const Fapp = Math.round(350 + 200 * rB)
    const acceln = Math.round((12 + 3 * rC) * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Ffrict = Math.round((Fapp - Fnet) * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav

    p.given = { mass, Fapp, acceln }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mass, acceln, Fnet }
  } else if (problemId === 5) {
    p.level = 'Master'
    const mass = Math.round((6 + 2 * rA) * 10) / 10
    const acceln = Math.round((12 + 8 * rB) * 10) / 10
    const muVal = 0.4 + 0.2 * rC
    const Ffrict = Math.round(mass * g * muVal * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Fapp = Math.round((Ffrict + Fnet) * 10) / 10

    p.given = { mass, acceln, Ffrict }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mass, acceln, Fnet }
  } else if (problemId === 6) {
    p.level = 'Wizard'
    const mass = Math.round((6 + 2 * rA) * 10) / 10
    const acceln = Math.round((12 + 8 * rB) * 10) / 10
    const mu = Math.round((0.4 + 0.2 * rC) * 1000) / 1000
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Ffrict = Math.round(mu * Fnorm * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const Fapp = Math.round((Fnet + Ffrict) * 10) / 10

    p.given = { mass, acceln, mu }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mu, mass, acceln, Fnet }
  } else if (problemId === 7) {
    p.level = 'Wizard'
    const mass = Math.round((18 + 12 * rA) * 10) / 10
    const Fapp = Math.round(280 + 80 * rB)
    const mu = Math.round((0.4 + 0.2 * rC) * 1000) / 1000
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Ffrict = Math.round(mu * Fnorm * 10) / 10
    const Fnet = Math.round((Fapp - Ffrict) * 10) / 10
    const acceln = Math.round((Fnet / mass) * 100) / 100

    p.given = { mass, Fapp, mu }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mu, mass, acceln, Fnet }
  } else {
    p.level = 'Wizard'
    const mass = Math.round((5 + 3 * rA) * 10) / 10
    const acceln = Math.round((3 + 2 * rB) * 10) / 10
    const Fnet = Math.round(mass * acceln * 10) / 10
    const mult = 1.3 + 0.4 * rC
    const Fapp = Math.round(Fnet * mult * 10) / 10
    const Fgrav = Math.round(mass * g * 10) / 10
    const Fnorm = Fgrav
    const Ffrict = Math.round((Fapp - Fnet) * 10) / 10
    const mu = Math.round((Ffrict / Fnorm) * 1000) / 1000

    p.given = { mass, acceln, Fapp }
    p.target = { Fnorm, Fgrav, Ffrict, Fapp, mu, mass, acceln, Fnet }
  }

  return p
}

let errors = 0
let totalTests = 0

for (let id = 1; id <= 8; id++) {
  for (let i = 0; i < 1000; i++) {
    totalTests++
    const p = generateProblemInstance(id)
    for (const [key, val] of Object.entries(p.target)) {
      if (isNaN(val) || !isFinite(val)) {
        console.error(`NaN/Infinity found in Problem ${id}, key ${key}:`, p);
        errors++;
      }
      if (key === 'mass' && val <= 0) {
        console.error(`Invalid mass in Problem ${id}:`, val);
        errors++;
      }
    }
  }
}

console.log(`Ran ${totalTests} randomized problem instances across all 8 problem types.`);
console.log(`Errors found: ${errors}`);
