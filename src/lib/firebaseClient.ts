// Only used to sync newly created customer accounts (name/phone/email) across
// totens. Nothing else in the app depends on this -- browsing, the
// recommendation engine, the scanner and everything else keep working fully
// offline even if this is never configured or the device has no connection.
//
// The Firebase SDK is loaded lazily (only when configured and actually used)
// so it never adds weight to the app when this feature is off.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let firestorePromise: ReturnType<typeof loadFirestore> | null = null

async function loadFirestore() {
  const [{ getApps, initializeApp }, { getFirestore }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
  ])
  const app = getApps()[0] ?? initializeApp(firebaseConfig)
  return getFirestore(app)
}

export const getFirestoreInstance = () => {
  if (!isFirebaseConfigured) return null
  firestorePromise ??= loadFirestore()
  return firestorePromise
}
