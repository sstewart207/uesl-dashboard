import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, increment,
  onSnapshot, setDoc, arrayUnion, arrayRemove, runTransaction,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

// Wrap a query in a live listener WITH an error handler. Without this, a
// failed listener (permission denied / missing index) fails silently and
// leaves the UI stuck on "Loading…". On error we log it and return [] so
// the component clears its loading state and shows an empty state instead.
function subscribeQuery(q, cb, map = d => ({ id: d.id, ...d.data() })) {
  return onSnapshot(
    q,
    snap => cb(snap.docs.map(map)),
    err => { console.error('Firestore listener failed:', err); cb([]) }
  )
}

/* ---------------- POSTS ---------------- */

export async function createPost(data) {
  return addDoc(collection(db, 'posts'), {
    ...data,
    likeCount: 0,
    commentCount: 0,
    likedBy: [],
    isPinned: false,
    createdAt: serverTimestamp(),
  })
}

// Live subscription to posts. Pass a hub to filter, or null for all.
export function subscribePosts(hub, cb) {
  let q
  if (hub) {
    q = query(collection(db, 'posts'), where('hub', '==', hub), orderBy('createdAt', 'desc'))
  } else {
    q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
  }
  return subscribeQuery(q, cb)
}

export async function getPost(id) {
  const snap = await getDoc(doc(db, 'posts', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getPostsByAuthor(uid) {
  const q = query(collection(db, 'posts'), where('authorUid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Toggle a like atomically using the likedBy array
export async function togglePostLike(postId, uid) {
  const ref = doc(db, 'posts', postId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const likedBy = snap.data().likedBy || []
    const alreadyLiked = likedBy.includes(uid)
    tx.update(ref, {
      likedBy: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
      likeCount: increment(alreadyLiked ? -1 : 1),
    })
  })
}

export async function setPostPinned(postId, isPinned) {
  return updateDoc(doc(db, 'posts', postId), { isPinned })
}

export async function deletePost(postId) {
  return deleteDoc(doc(db, 'posts', postId))
}

/* ---------------- COMMENTS ---------------- */

export function subscribeComments(postId, cb) {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'))
  return subscribeQuery(q, cb)
}

export async function addComment(postId, data) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) })
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(-1) })
}

/* ---------------- EVENTS ---------------- */

export function subscribeEvents(cb) {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'))
  return subscribeQuery(q, cb)
}

export async function createEvent(data) {
  return addDoc(collection(db, 'events'), { ...data, rsvps: {}, createdAt: serverTimestamp() })
}

export async function setEventRsvp(eventId, uid, status) {
  return updateDoc(doc(db, 'events', eventId), { [`rsvps.${uid}`]: status })
}

export async function deleteEvent(eventId) {
  return deleteDoc(doc(db, 'events', eventId))
}

/* ---------------- BULLETINS ---------------- */

export function subscribeBulletins(cb) {
  const q = query(collection(db, 'bulletins'), orderBy('createdAt', 'desc'))
  return subscribeQuery(q, cb)
}

export async function createBulletin(data) {
  return addDoc(collection(db, 'bulletins'), { ...data, createdAt: serverTimestamp() })
}

export async function deleteBulletin(id) {
  return deleteDoc(doc(db, 'bulletins', id))
}

/* ---------------- TOURNAMENTS ---------------- */

export function subscribeTournaments(cb) {
  const q = query(collection(db, 'tournaments'), orderBy('startDate', 'asc'))
  return subscribeQuery(q, cb)
}

export async function createTournament(data) {
  return addDoc(collection(db, 'tournaments'), { ...data, participants: [], createdAt: serverTimestamp() })
}

export async function joinTournament(tournamentId, participant) {
  return updateDoc(doc(db, 'tournaments', tournamentId), {
    participants: arrayUnion(participant),
  })
}

/* ---------------- USERS / MEMBERS ---------------- */

export function subscribeMembers(cb) {
  const q = query(collection(db, 'users'), orderBy('displayName', 'asc'))
  return subscribeQuery(q, cb, d => ({ uid: d.id, ...d.data() }))
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(uid, data) {
  return updateDoc(doc(db, 'users', uid), data)
}

// Upload an avatar image to Storage and save its URL on the user doc.
export async function uploadAvatar(uid, file) {
  const storageRef = ref(storage, `avatars/${uid}/${Date.now()}-${file.name}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  await updateDoc(doc(db, 'users', uid), { avatarUrl: url })
  return url
}

/* ---------------- APPROVALS (admin/coach) ---------------- */

// Live list of every user — used by the admin approval page.
export function subscribeAllUsers(cb) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  return subscribeQuery(q, cb, d => ({ uid: d.id, ...d.data() }))
}

// Approve a pending user and assign their role (student | coach).
export async function approveUser(uid, role = 'student') {
  return updateDoc(doc(db, 'users', uid), { approved: true, role })
}

// Change a member's role.
export async function setUserRole(uid, role) {
  return updateDoc(doc(db, 'users', uid), { role })
}

// Revoke access (set back to pending).
export async function revokeUser(uid) {
  return updateDoc(doc(db, 'users', uid), { approved: false, role: 'pending' })
}

// Permanently delete a user doc (coach/admin only — enforced by Firestore rules).
export async function deleteUserDoc(uid) {
  return deleteDoc(doc(db, 'users', uid))
}

/* ---------------- NOTIFICATIONS ---------------- */

export function subscribeNotifications(uid, cb) {
  const q = query(collection(db, 'notifications', uid, 'items'), orderBy('createdAt', 'desc'), limit(50))
  return subscribeQuery(q, cb)
}

export async function createNotification(forUid, data) {
  // Fire-and-forget at call sites — swallow + log so a failed notification
  // write never becomes a silent unhandled rejection.
  try {
    return await addDoc(collection(db, 'notifications', forUid, 'items'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    })
  } catch (e) {
    console.error('createNotification failed:', e)
  }
}

export async function markNotificationRead(uid, notifId) {
  return updateDoc(doc(db, 'notifications', uid, 'items', notifId), { read: true })
}

export async function markAllNotificationsRead(uid, notifIds) {
  await Promise.all(notifIds.map(id =>
    updateDoc(doc(db, 'notifications', uid, 'items', id), { read: true })
  ))
}
