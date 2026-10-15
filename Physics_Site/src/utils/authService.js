// Secure Student Authentication & Rate-Limiting Service
// Uses Web Crypto API (SHA-256 + cryptographic salt) with brute-force rate-limiting and isolated per-student progress.

const USERS_KEY = 'physix_users_db'
const SESSION_KEY = 'physix_auth_session'
const RATELIMIT_KEY = 'physix_auth_ratelimit'

const MAX_FAILED_ATTEMPTS = 5
const BASE_LOCKOUT_SECONDS = 30
const EXTENDED_LOCKOUT_SECONDS = 60
const SESSION_DURATION_DAYS = 30

/**
 * Generate a cryptographically secure random hexadecimal salt
 */
function generateSalt(length = 16) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(length)
    window.crypto.getRandomValues(bytes)
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback random salt
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Hash password with salt using Web Crypto SHA-256
 */
async function hashPasswordWithSalt(password, salt) {
  const combined = `${salt}:${password}`
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(combined)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Deterministic fallback for environments without crypto.subtle
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return `fallback_${Math.abs(hash).toString(16)}`
}

/**
 * Retrieve rate limiting status
 */
export function getRateLimitStatus() {
  try {
    const record = JSON.parse(localStorage.getItem(RATELIMIT_KEY) || '{}')
    const now = Date.now()
    if (record.lockoutUntil && record.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000)
      return {
        isLocked: true,
        remainingSeconds,
        attemptsRemaining: 0,
        lockoutCount: record.lockoutCount || 1,
      }
    }
    const failedCount = record.count || 0
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - failedCount),
      lockoutCount: record.lockoutCount || 0,
    }
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsRemaining: MAX_FAILED_ATTEMPTS, lockoutCount: 0 }
  }
}

/**
 * Record a failed login attempt and apply lockouts if threshold is reached
 */
function recordFailedAttempt() {
  try {
    const record = JSON.parse(localStorage.getItem(RATELIMIT_KEY) || '{}')
    const now = Date.now()
    const count = (record.count || 0) + 1
    const lockoutCount = record.lockoutCount || 0

    if (count >= MAX_FAILED_ATTEMPTS) {
      const duration = lockoutCount > 0 ? EXTENDED_LOCKOUT_SECONDS : BASE_LOCKOUT_SECONDS
      const lockoutUntil = now + duration * 1000
      localStorage.setItem(
        RATELIMIT_KEY,
        JSON.stringify({
          count: 0,
          lockoutUntil,
          lockoutCount: lockoutCount + 1,
        })
      )
      return { isLocked: true, remainingSeconds: duration, attemptsRemaining: 0 }
    } else {
      localStorage.setItem(
        RATELIMIT_KEY,
        JSON.stringify({
          count,
          lockoutUntil: 0,
          lockoutCount,
        })
      )
      return { isLocked: false, remainingSeconds: 0, attemptsRemaining: MAX_FAILED_ATTEMPTS - count }
    }
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsRemaining: 0 }
  }
}

/**
 * Reset rate limit counter upon successful authentication
 */
function resetRateLimit() {
  try {
    localStorage.removeItem(RATELIMIT_KEY)
  } catch {
    // ignore
  }
}

/**
 * Get all registered users from local database
 */
function getUsersDb() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

/**
 * Save updated users database
 */
function saveUsersDb(db) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(db))
  } catch {
    // ignore
  }
}

/**
 * Save active session
 */
function setSession(username) {
  try {
    const session = {
      username,
      token: generateSalt(24),
      expiresAt: Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    
    // Synchronize user progress sandbox
    syncUserProgressOnLogin(username)
  } catch {
    // ignore
  }
}

/**
 * Sync user's saved progress to the active module storage keys
 */
export function syncUserProgressOnLogin(username) {
  try {
    const normalized = username.trim().toLowerCase()
    const userProgressKey = `physix_user_${normalized}_progress`
    const savedProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}')

    if (savedProgress.balanced) {
      localStorage.setItem('physix_balanced_completed', JSON.stringify(savedProgress.balanced))
    } else {
      localStorage.removeItem('physix_balanced_completed')
    }

    if (savedProgress.fbd) {
      localStorage.setItem('physix_fbd_completed', JSON.stringify(savedProgress.fbd))
    } else {
      localStorage.removeItem('physix_fbd_completed')
    }

    if (savedProgress.solveit) {
      localStorage.setItem('physix_solveit_completed', JSON.stringify(savedProgress.solveit))
    } else {
      localStorage.removeItem('physix_solveit_completed')
    }
  } catch {
    // ignore
  }
}

/**
 * Backup active module storage keys to user's personal store
 */
export function backupUserProgress(username) {
  if (!username) return
  try {
    const normalized = username.trim().toLowerCase()
    const userProgressKey = `physix_user_${normalized}_progress`

    const b = JSON.parse(localStorage.getItem('physix_balanced_completed') || '{}')
    const f = JSON.parse(localStorage.getItem('physix_fbd_completed') || '{}')
    const s = JSON.parse(localStorage.getItem('physix_solveit_completed') || '{}')

    localStorage.setItem(
      userProgressKey,
      JSON.stringify({
        balanced: b,
        fbd: f,
        solveit: s,
        lastUpdated: Date.now(),
      })
    )
  } catch {
    // ignore
  }
}

/**
 * Register a new student account
 */
export async function registerStudent(username, password) {
  const status = getRateLimitStatus()
  if (status.isLocked) {
    return {
      success: false,
      error: `Too many attempts. Please wait ${status.remainingSeconds} seconds before trying again.`,
      lockedOut: true,
      remainingSeconds: status.remainingSeconds,
    }
  }

  const cleanUsername = (username || '').trim()
  if (!cleanUsername) {
    return { success: false, error: 'Please enter a username.' }
  }

  // Username validation: 3-20 chars, alphanumeric + underscores and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  if (!usernameRegex.test(cleanUsername)) {
    return {
      success: false,
      error: 'Username must be 3–20 characters and contain only letters, numbers, hyphens, or underscores.',
    }
  }

  // Password validation: min 6 chars
  if (!password || password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long.',
    }
  }

  const db = getUsersDb()
  const normalizedKey = cleanUsername.toLowerCase()

  if (db[normalizedKey]) {
    return {
      success: false,
      error: 'This username is already taken. Please choose another or log in.',
    }
  }

  // Create salted hash
  const salt = generateSalt(16)
  const hash = await hashPasswordWithSalt(password, salt)

  db[normalizedKey] = {
    username: cleanUsername, // preserve student casing
    salt,
    hash,
    createdAt: Date.now(),
    lastLogin: Date.now(),
  }

  saveUsersDb(db)
  resetRateLimit()
  setSession(cleanUsername)

  return {
    success: true,
    user: { username: cleanUsername },
  }
}

/**
 * Log in an existing student
 */
export async function loginStudent(username, password) {
  const status = getRateLimitStatus()
  if (status.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Temporary lockout active. Please wait ${status.remainingSeconds}s.`,
      lockedOut: true,
      remainingSeconds: status.remainingSeconds,
    }
  }

  const cleanUsername = (username || '').trim()
  if (!cleanUsername || !password) {
    return { success: false, error: 'Please enter both username and password.' }
  }

  const db = getUsersDb()
  const normalizedKey = cleanUsername.toLowerCase()
  const user = db[normalizedKey]

  if (!user) {
    const failInfo = recordFailedAttempt()
    return {
      success: false,
      error: failInfo.isLocked
        ? `Too many failed attempts. Locked out for ${failInfo.remainingSeconds}s.`
        : `Invalid username or password. (${failInfo.attemptsRemaining} attempts left)`,
      lockedOut: failInfo.isLocked,
      remainingSeconds: failInfo.remainingSeconds,
      attemptsRemaining: failInfo.attemptsRemaining,
    }
  }

  // Verify hash
  const computedHash = await hashPasswordWithSalt(password, user.salt)
  if (computedHash !== user.hash) {
    const failInfo = recordFailedAttempt()
    return {
      success: false,
      error: failInfo.isLocked
        ? `Too many failed attempts. Locked out for ${failInfo.remainingSeconds}s.`
        : `Invalid username or password. (${failInfo.attemptsRemaining} attempts left)`,
      lockedOut: failInfo.isLocked,
      remainingSeconds: failInfo.remainingSeconds,
      attemptsRemaining: failInfo.attemptsRemaining,
    }
  }

  // Successful login
  user.lastLogin = Date.now()
  saveUsersDb(db)
  resetRateLimit()
  setSession(user.username)

  return {
    success: true,
    user: { username: user.username },
  }
}

/**
 * Get currently authenticated student session
 */
export function getCurrentUser() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!session || !session.username) return null
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return { username: session.username }
  } catch {
    return null
  }
}

/**
 * Log out active student, persist their progress, and clear active sandbox
 */
export function logoutStudent() {
  try {
    const session = getCurrentUser()
    if (session && session.username) {
      backupUserProgress(session.username)
    }
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('physix_balanced_completed')
    localStorage.removeItem('physix_fbd_completed')
    localStorage.removeItem('physix_solveit_completed')
  } catch {
    // ignore
  }
}
