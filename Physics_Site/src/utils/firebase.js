import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB8RQRJK8IE4ewy8FDF8CPQ39ZNh7IJaBM",
  authDomain: "mr-williams-physics.firebaseapp.com",
  projectId: "mr-williams-physics",
  storageBucket: "mr-williams-physics.firebasestorage.app",
  messagingSenderId: "352019500608",
  appId: "1:352019500608:web:d77f86fce78a0e751c59a5",
  measurementId: "G-7XMG4FRNTC",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})
