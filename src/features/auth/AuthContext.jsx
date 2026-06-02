import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, DEMO_MODE, ADMIN_EMAIL } from '../../firebase/firebase'

const AuthContext = createContext(null)

// Demo user shown when Firebase isn't configured yet
const DEMO_USER = {
  uid: 'demo-user',
  email: 'coach@uesl.demo',
  displayName: 'Coach Davis',
  role: 'admin',
  approved: true,
  avatarUrl: '',
  games: ['Valorant', 'Rocket League'],
  skills: ['Coaching', 'Strategy'],
  bio: 'Head coach of United Esports League',
  twitchUrl: '',
  youtubeUrl: '',
}

// Build the default user-doc fields for a brand-new account.
// The admin email is auto-approved; everyone else starts pending.
function defaultUserDoc(email, displayName) {
  const isAdmin = (email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
  return {
    displayName: displayName || (email ? email.split('@')[0] : 'Member'),
    email: email || '',
    role: isAdmin ? 'admin' : 'pending',
    approved: isAdmin,
    avatarUrl: '',
    games: [],
    skills: [],
    bio: '',
    twitchUrl: '',
    youtubeUrl: '',
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_MODE ? { uid: DEMO_USER.uid, email: DEMO_USER.email, displayName: DEMO_USER.displayName } : null)
  const [userProfile, setUserProfile] = useState(DEMO_MODE ? DEMO_USER : null)
  const [loading, setLoading] = useState(!DEMO_MODE)

  async function register(email, password, displayName) {
    if (DEMO_MODE) return
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    // New accounts start pending (admin email auto-approved). Role is assigned on approval.
    await setDoc(doc(db, 'users', cred.user.uid), defaultUserDoc(email, displayName))
    return cred
  }

  // Make sure a /users/{uid} doc exists for an authenticated user.
  // Covers accounts that authenticated but never got a Firestore doc.
  async function ensureUserDoc(user) {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    const isAdminEmail = (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()

    if (!snap.exists()) {
      await setDoc(ref, defaultUserDoc(user.email, user.displayName))
      return
    }
    // Self-heal the admin's doc if it predates the approval system
    // (e.g. created by older code without approved:true / role:'admin').
    const data = snap.data()
    if (isAdminEmail && (data.approved !== true || data.role !== 'admin')) {
      await setDoc(ref, { approved: true, role: 'admin' }, { merge: true })
    }
  }

  function login(email, password) {
    if (DEMO_MODE) return Promise.resolve()
    return signInWithEmailAndPassword(auth, email, password)
  }

  function resetPassword(email) {
    if (DEMO_MODE) return Promise.resolve()
    return sendPasswordResetEmail(auth, email)
  }

  function logout() {
    if (DEMO_MODE) return Promise.resolve()
    return signOut(auth)
  }

  async function fetchProfile(uid) {
    if (DEMO_MODE) return
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      setUserProfile({ uid, ...snap.data() })
    }
  }

  useEffect(() => {
    if (DEMO_MODE) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await ensureUserDoc(user)
        await fetchProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Derived access flags
  const isAdmin = (currentUser?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
  const isApproved = isAdmin || userProfile?.approved === true || DEMO_MODE
  const canApprove = isAdmin || userProfile?.role === 'admin' || userProfile?.role === 'coach'

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    resetPassword,
    fetchProfile,
    isAdmin,
    isApproved,
    canApprove,
    isDemoMode: DEMO_MODE,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
