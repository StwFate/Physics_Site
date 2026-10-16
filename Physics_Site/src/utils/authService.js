import { auth, googleProvider } from './firebase'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

const DEMO_SESSION_KEY = 'physix_demo_google_session'
export const AUTH_USER_CACHE_KEY = 'physix_cached_auth_user'

/**
 * Retrieve synchronously cached student session to eliminate login screen flicker on reload
 */
export function getCachedAuthUser() {
  try {
    const cached = localStorage.getItem(AUTH_USER_CACHE_KEY)
    if (cached) return JSON.parse(cached)
    const demo = localStorage.getItem(DEMO_SESSION_KEY)
    if (demo) return JSON.parse(demo)
  } catch {
    return null
  }
  return null
}

/**
 * Sync user's saved progress to the active module storage keys
 */
export function syncUserProgressOnLogin(uid) {
  if (!uid) return
  try {
    const userProgressKey = `physix_google_${uid}_progress`
    const savedProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}')

    const b = { ...(savedProgress.balanced || {}) }
    const bAns = { ...(savedProgress.balancedAnswers || {}) }
    const f = { ...(savedProgress.fbd || {}) }
    const fAns = { ...(savedProgress.fbdAnswers || {}) }
    const s = { ...(savedProgress.solveit || {}) }
    const sAns = { ...(savedProgress.solveitAnswers || {}) }

    // Self-healing reconciliation: any answered correct problem in active storage or backup MUST count as a star
    try {
      const activeBAns = JSON.parse(localStorage.getItem('physix_balanced_answers') || '{}')
      Object.entries(activeBAns).forEach(([id, ans]) => {
        if (ans && (ans.isCorrect || ans.isSubmitted)) {
          b[id] = true
          bAns[id] = ans
        }
      })
    } catch {}

    Object.entries(bAns).forEach(([id, ans]) => {
      if (ans && (ans.isCorrect || ans.isSubmitted)) {
        b[id] = true
      }
    })

    try {
      const activeFAns = JSON.parse(localStorage.getItem('physix_fbd_answers') || '{}')
      Object.entries(activeFAns).forEach(([id, ans]) => {
        if (ans && Object.keys(ans.forces || {}).length > 0) {
          f[id] = true
          fAns[id] = ans
        }
      })
    } catch {}

    try {
      const activeSAns = JSON.parse(localStorage.getItem('physix_solveit_answers') || '{}')
      Object.entries(activeSAns).forEach(([id, ans]) => {
        if (ans && Object.keys(ans.inputs || {}).length > 0) {
          s[id] = true
          sAns[id] = ans
        }
      })
    } catch {}

    localStorage.setItem('physix_balanced_completed', JSON.stringify(b))
    localStorage.setItem('physix_balanced_answers', JSON.stringify(bAns))
    localStorage.setItem('physix_fbd_completed', JSON.stringify(f))
    localStorage.setItem('physix_fbd_answers', JSON.stringify(fAns))
    localStorage.setItem('physix_solveit_completed', JSON.stringify(s))
    localStorage.setItem('physix_solveit_answers', JSON.stringify(sAns))

    if (savedProgress.studentSeed) {
      localStorage.setItem(`physix_student_seed_${uid}`, String(savedProgress.studentSeed))
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('physix_progress_updated'))
    }
  } catch (err) {
    console.error('Sync progress error:', err)
  }
}

/**
 * Backup active module storage keys to user's personal store
 */
export function backupUserProgress(uid) {
  if (!uid) return
  try {
    const userProgressKey = `physix_google_${uid}_progress`
    const prevBackup = JSON.parse(localStorage.getItem(userProgressKey) || '{}')

    const b = JSON.parse(localStorage.getItem('physix_balanced_completed') || '{}')
    const f = JSON.parse(localStorage.getItem('physix_fbd_completed') || '{}')
    const s = JSON.parse(localStorage.getItem('physix_solveit_completed') || '{}')
    const bAns = JSON.parse(localStorage.getItem('physix_balanced_answers') || '{}')
    const fAns = JSON.parse(localStorage.getItem('physix_fbd_answers') || '{}')
    const sAns = JSON.parse(localStorage.getItem('physix_solveit_answers') || '{}')
    const seed = localStorage.getItem(`physix_student_seed_${uid}`)

    // Self-healing: reconcile any correct answers into completion stars
    Object.entries(bAns).forEach(([id, ans]) => {
      if (ans && (ans.isCorrect || ans.isSubmitted)) {
        b[id] = true
      }
    })
    Object.entries(fAns).forEach(([id, ans]) => {
      if (ans && Object.keys(ans.forces || {}).length > 0) {
        f[id] = true
      }
    })
    Object.entries(sAns).forEach(([id, ans]) => {
      if (ans && Object.keys(ans.inputs || {}).length > 0) {
        s[id] = true
      }
    })

    // Safety guard against logout race condition:
    // If active storage was just wiped, NEVER overwrite an existing non-empty backup!
    const activeCount = Object.keys(b).length + Object.keys(f).length + Object.keys(s).length + Object.keys(bAns).length
    const prevCount = Object.keys(prevBackup.balanced || {}).length + Object.keys(prevBackup.fbd || {}).length + Object.keys(prevBackup.solveit || {}).length
    if (activeCount === 0 && prevCount > 0) {
      return
    }

    // Merge strictly additively so no previously earned stars are lost
    const mergedBalanced = { ...(prevBackup.balanced || {}), ...b }
    const mergedFbd = { ...(prevBackup.fbd || {}), ...f }
    const mergedSolveit = { ...(prevBackup.solveit || {}), ...s }
    const mergedBAns = { ...(prevBackup.balancedAnswers || {}), ...bAns }
    const mergedFAns = { ...(prevBackup.fbdAnswers || {}), ...fAns }
    const mergedSAns = { ...(prevBackup.solveitAnswers || {}), ...sAns }

    localStorage.setItem(
      userProgressKey,
      JSON.stringify({
        balanced: mergedBalanced,
        fbd: mergedFbd,
        solveit: mergedSolveit,
        balancedAnswers: mergedBAns,
        fbdAnswers: mergedFAns,
        solveitAnswers: mergedSAns,
        studentSeed: seed || prevBackup.studentSeed,
        lastUpdated: Date.now(),
      })
    )
  } catch (err) {
    console.error('Backup progress error:', err)
  }
}

/**
 * Authenticate using Google Single Sign-On (SSO)
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    syncUserProgressOnLogin(user.uid)
    const userData = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Student',
      email: user.email,
      photoURL: user.photoURL,
    }
    localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(userData))
    return {
      success: true,
      user: userData,
    }
  } catch (err) {
    console.error('Google Sign-In Error:', err)

    // Handle popup blocked by district browser / Chromebook filter
    if (err.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider)
        return { success: false, redirecting: true }
      } catch (redirectErr) {
        return { success: false, error: redirectErr.message }
      }
    }

    // Informative error message for common Firebase setup states
    if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
      return {
        success: false,
        needsConsoleEnable: true,
        error:
          'Google Sign-In is not yet enabled in your Firebase Console. Go to Firebase Console → Authentication → Sign-in method → Click "Google" → Toggle "Enable" and save.',
      }
    }

    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in cancelled. Please try again.' }
    }

    return { success: false, error: err.message || 'Failed to sign in with Google.' }
  }
}

/**
 * Optional Demo Student login for offline preview / environments before console toggle
 */
export function signInWithDemoGoogle(name = 'Demo Student', email = 'student@school.edu') {
  const demoUser = {
    uid: 'demo_google_student_123',
    displayName: name,
    email: email,
    photoURL: null,
    isDemo: true,
  }
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
  localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(demoUser))
  syncUserProgressOnLogin(demoUser.uid)
  return demoUser
}

/**
 * Subscribe to Firebase auth state changes (and handle demo sessions)
 */
export function subscribeToAuth(callback) {
  // Check for redirect result if redirected on mobile / strict Chromebook
  getRedirectResult(auth)
    .then((result) => {
      if (result && result.user) {
        const user = result.user
        syncUserProgressOnLogin(user.uid)
        const userData = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Student',
          email: user.email,
          photoURL: user.photoURL,
        }
        localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(userData))
        callback(userData)
      }
    })
    .catch((err) => {
      console.error('Redirect sign-in error:', err)
    })

  // Firebase auth listener
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      syncUserProgressOnLogin(firebaseUser.uid)
      const userData = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      }
      localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(userData))
      callback(userData)
    } else {
      // Check if demo user active
      try {
        const demo = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null')
        if (demo) {
          syncUserProgressOnLogin(demo.uid)
          localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(demo))
          callback(demo)
          return
        }
      } catch {
        // ignore
      }
      localStorage.removeItem(AUTH_USER_CACHE_KEY)
      callback(null)
    }
  })

  return unsubscribe
}

/**
 * Sign out active student
 */
export async function signOutStudent(currentUid) {
  try {
    if (currentUid) {
      backupUserProgress(currentUid)
    }
    localStorage.removeItem(AUTH_USER_CACHE_KEY)
    localStorage.removeItem(DEMO_SESSION_KEY)
    localStorage.removeItem('physix_balanced_completed')
    localStorage.removeItem('physix_fbd_completed')
    localStorage.removeItem('physix_solveit_completed')
    localStorage.removeItem('physix_balanced_answers')
    localStorage.removeItem('physix_fbd_answers')
    localStorage.removeItem('physix_solveit_answers')
    await signOut(auth)
  } catch (err) {
    console.error('Sign out error:', err)
  }
}
