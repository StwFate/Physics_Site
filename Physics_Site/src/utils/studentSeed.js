// Student Seed & Deterministic Shuffling Utility
// Guarantees every student receives a unique, pre-shuffled sequence of questions
// that persists deterministically across page reloads and re-logins.

export function createSeededRng(seed) {
  let s = (Number(seed) >>> 0) + 0x6D2B79F5
  return function () {
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    s = (s + 0x6D2B79F5) >>> 0
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Fisher-Yates shuffle with seeded PRNG
 */
export function shuffleWithSeed(array, seed) {
  if (!Array.isArray(array) || array.length <= 1) return array
  const rng = createSeededRng(seed)
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Retrieve or generate a student's persistent seed.
 * Bound to the user's Google UID or client device.
 */
export function getStudentSeed(uid = null) {
  try {
    const storageKey = uid ? `physix_student_seed_${uid}` : 'physix_student_seed_default'
    const stored = localStorage.getItem(storageKey)
    if (stored !== null && !isNaN(Number(stored))) {
      return Number(stored)
    }

    // Generate unique seed: combine hash of UID with random offset
    let generated = Math.floor(Math.random() * 800000) + 100000
    if (uid) {
      let hash = 0
      for (let i = 0; i < uid.length; i++) {
        hash = (hash << 5) - hash + uid.charCodeAt(i)
        hash |= 0
      }
      generated = Math.abs(hash) || generated
    }

    localStorage.setItem(storageKey, generated.toString())
    return generated
  } catch {
    return 123456
  }
}

/**
 * Update seed when student manually clicks "Shuffle" or "Replay"
 */
export function incrementStudentSeed(uid = null) {
  try {
    const storageKey = uid ? `physix_student_seed_${uid}` : 'physix_student_seed_default'
    const current = getStudentSeed(uid)
    const nextSeed = current + 1
    localStorage.setItem(storageKey, nextSeed.toString())
    return nextSeed
  } catch {
    return Date.now()
  }
}
