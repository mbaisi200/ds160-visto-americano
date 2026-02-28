import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let isInitialized = false;
let initError: string | null = null;

function getServiceAccount() {
  // Priority 1: Environment variables (for Vercel/production)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    console.log('📦 Using Firebase credentials from environment variables');
    return {
      type: 'service_account',
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
    };
  }

  // Priority 2: Local file (for development)
  try {
    const keyFilePath = join(process.cwd(), 'firebase-key.json');
    const fileContent = readFileSync(keyFilePath, 'utf-8');
    console.log('📦 Using Firebase credentials from local file');
    return JSON.parse(fileContent);
  } catch {
    return null;
  }
}

function initializeFirebaseAdmin() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const serviceAccount = getServiceAccount();

    if (!serviceAccount) {
      initError = 'Firebase credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars or create firebase-key.json';
      console.error('❌', initError);
      if (!admin.apps.length) {
        admin.initializeApp({ projectId: 'vistoamericano-58f87' });
      }
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
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
