import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database'
import { rtdb } from './firebase'

// Online presence via Realtime Database. RTDB is used (not Firestore) because it
// has a server-side onDisconnect() that fires when a client's socket drops — so
// we don't need a polling "heartbeat" that would burn Firestore read quota.
// See docs discussion: connection-state writes only, billed by bandwidth, ~free
// at club scale.

// Mark this user online and register an auto-offline for when their connection
// drops (tab close, network loss, sleep). Returns a cleanup fn that detaches the
// listener and best-effort marks them offline on explicit logout.
export function goOnline(uid) {
  if (!rtdb || !uid) return () => {}
  const userRef = ref(rtdb, `presence/${uid}`)
  const connectedRef = ref(rtdb, '.info/connected')

  const unsub = onValue(connectedRef, (snap) => {
    if (snap.val() === false) return
    // Queue the offline write FIRST so it's armed server-side before we go online;
    // RTDB runs it for us if the connection drops.
    onDisconnect(userRef)
      .set({ online: false, lastChanged: serverTimestamp() })
      .then(() => set(userRef, { online: true, lastChanged: serverTimestamp() }))
      .catch(() => {})
  })

  return () => {
    unsub()
    set(userRef, { online: false, lastChanged: serverTimestamp() }).catch(() => {})
  }
}

// Subscribe to the set of currently-online uids. cb receives a string[] of uids.
export function subscribeOnline(cb) {
  if (!rtdb) { cb([]); return () => {} }
  const presenceRef = ref(rtdb, 'presence')
  return onValue(
    presenceRef,
    (snap) => {
      const val = snap.val() || {}
      cb(Object.keys(val).filter(uid => val[uid]?.online === true))
    },
    () => cb([]),
  )
}
