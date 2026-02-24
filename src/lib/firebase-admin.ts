import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let isInitialized = false;
let initError: string | null = null;

function initializeFirebaseAdmin() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const keyFilePath = join(process.cwd(), 'firebase-key.json');
    const serviceAccount = JSON.parse(readFileSync(keyFilePath, 'utf-8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }

    adminAuth = admin.auth();
    adminDb = admin.firestore();

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    initError = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error initializing Firebase Admin:', error);
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'vistoamericano-58f87' });
    }
  }
}

// Initialize on module load
initializeFirebaseAdmin();

export { adminAuth, adminDb, initError };
export default admin;
