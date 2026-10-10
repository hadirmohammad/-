import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  onSnapshot,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { QuranDailyPlan, SurahProgress, UserSettings } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Test connection on boot as mandated by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
      return false;
    }
    // Expected permission error on non-existent test document is fine
    return true;
  }
}

// Ensure user is signed in (anonymous by default for immediate sync)
export async function ensureSignedIn(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous sign in failed or offline', err);
    return null;
  }
}

// Google Sign-In for cross-device linking
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
  // Re-sign in anonymously so the app continues functioning
  await signInAnonymously(auth);
}

// Cloud sync: Daily Plan
export async function saveCloudDailyPlan(userId: string, plan: QuranDailyPlan): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'plan', 'current');
    await setDoc(
      ref,
      {
        ...plan,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save daily plan to cloud', err);
  }
}

export function subscribeToCloudDailyPlan(
  userId: string,
  onUpdate: (plan: QuranDailyPlan) => void
): () => void {
  const ref = doc(db, 'users', userId, 'plan', 'current');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as QuranDailyPlan;
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Daily plan snapshot listener error:', err);
    }
  );
}

// Cloud sync: Surahs Progress
export async function saveCloudProgress(
  userId: string,
  progressMap: Record<number, SurahProgress>
): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'progress', 'all');
    await setDoc(
      ref,
      {
        userId,
        data: progressMap,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save progress map to cloud', err);
  }
}

export function subscribeToCloudProgress(
  userId: string,
  onUpdate: (progressMap: Record<number, SurahProgress>) => void
): () => void {
  const ref = doc(db, 'users', userId, 'progress', 'all');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        const docData = snapshot.data();
        if (docData && docData.data) {
          onUpdate(docData.data as Record<number, SurahProgress>);
        }
      }
    },
    (err) => {
      console.warn('Progress snapshot listener error:', err);
    }
  );
}

// Cloud sync: User Settings
export async function saveCloudSettings(
  userId: string,
  settings: UserSettings
): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'settings', 'current');
    await setDoc(
      ref,
      {
        ...settings,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save settings to cloud', err);
  }
}

export function subscribeToCloudSettings(
  userId: string,
  onUpdate: (settings: UserSettings) => void
): () => void {
  const ref = doc(db, 'users', userId, 'settings', 'current');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserSettings;
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Settings snapshot listener error:', err);
    }
  );
}

// Multi-device sync code linking
export async function linkDeviceByCode(sourceCode: string): Promise<boolean> {
  try {
    const cleanCode = sourceCode.trim().toUpperCase();
    const syncDoc = await getDoc(doc(db, 'syncCodes', cleanCode));
    if (syncDoc.exists()) {
      const data = syncDoc.data();
      if (data && data.userId) {
        localStorage.setItem('mutqin_linked_uid', data.userId);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Failed to link device by code', err);
    return false;
  }
}

export async function createSyncCodeForUser(userId: string): Promise<string> {
  // Generate a clean 6-digit alphanumeric code
  const code = 'Q' + Math.floor(10000 + Math.random() * 90000).toString();
  try {
    await setDoc(doc(db, 'syncCodes', code), {
      userId,
      code,
      createdAt: new Date().toISOString(),
    });
    return code;
  } catch {
    return 'Q' + userId.substring(0, 5).toUpperCase();
  }
}
