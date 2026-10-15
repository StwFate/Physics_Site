import { auth, googleProvider } from './firebase'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

const DEMO_SESSION_KEY = 'physix_demo_google_session'

/**
 * Sync user's saved progress to the active module storage keys
 */
export function syncUserProgressOnLogin(uid) {
  if (!uid) return
  try {
    const userProgressKey = `physix_google_${uid}_progress`
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
export function backupUserProgress(uid) {
  if (!uid) return
  try {
    const userProgressKey = `physix_google_${uid}_progress`

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
 * Authenticate using Google Single Sign-On (SSO)
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    syncUserProgressOnLogin(user.uid)
    return {
      success: true,
      user: {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Student',
        email: user.email,
        photoURL: user.photoURL,
      },
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
        callback({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Student',
          email: user.email,
          photoURL: user.photoURL,
        })
      }
    })
    .catch((err) => {
      console.error('Redirect sign-in error:', err)
    })

  // Firebase auth listener
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      syncUserProgressOnLogin(firebaseUser.uid)
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      })
    } else {
      // Check if demo user active
      try {
        const demo = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null')
        if (demo) {
          syncUserProgressOnLogin(demo.uid)
          callback(demo)
          return
        }
      } catch {
        // ignore
      }
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
    localStorage.removeItem(DEMO_SESSION_KEY)
    localStorage.removeItem('physix_balanced_completed')
    localStorage.removeItem('physix_fbd_completed')
    localStorage.removeItem('physix_solveit_completed')
    await signOut(auth)
  } catch (err) {
    console.error('Sign out error:', err)
  }
}
