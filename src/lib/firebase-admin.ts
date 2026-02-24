import admin from 'firebase-admin';
import { GoogleAuth, JWT } from 'google-auth-library';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let isInitialized = false;

async function getAccessToken(keyFilePath: string): Promise<string> {
  const auth = new GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      'https://www.googleapis.com/auth/firebase',
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/firebase.messaging',
      'https://www.googleapis.com/auth/identitytoolkit',
      'https://www.googleapis.com/auth/cloud-platform'
    ]
  });

  const client = await auth.getClient() as JWT;
  await client.authorize();
  return client.credentials.access_token || '';
}

async function initializeFirebaseAdmin() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const keyFilePath = join(process.cwd(), 'firebase-key.json');
    const serviceAccount = JSON.parse(readFileSync(keyFilePath, 'utf-8'));
    const projectId = serviceAccount.project_id;

    // Initialize with application default credentials
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;

    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: projectId,
      });
    }

    // Get access token to verify auth works
    const token = await getAccessToken(keyFilePath);
    console.log('✅ Google Auth token obtained');

    adminAuth = admin.auth();
    adminDb = admin.firestore();

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'vistoamericano-58f87' });
    }
  }
}

// Initialize asynchronously
let initPromise: Promise<void> | null = null;

export function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializeFirebaseAdmin();
  }
  return initPromise;
}

// Start initialization
ensureInitialized();

export { adminAuth, adminDb };
export default admin;
