/**
 * BLACK S.H.E.E.P. - Firebase Client Initialization & Firestore Connection
 * Configured for project eqverse-c4890 with Analytics & Firestore
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('[Firebase Analytics] Initialized successfully for measurement ID:', firebaseConfig.measurementId);
      }
    })
    .catch((err) => {
      console.warn('[Firebase Analytics] Not supported in current browser context:', err);
    });
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_health', 'test'));
    console.log('[Firestore] Database connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Please check your Firebase configuration.');
    }
  }
}

// Initial connection test on boot as required by Firebase skill
testConnection();
