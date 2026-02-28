import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEZVEFsQloinsGu6G0-Dx8j4FFgga4foA",
  authDomain: "vistoamericano-58f87.firebaseapp.com",
  projectId: "vistoamericano-58f87",
  storageBucket: "vistoamericano-58f87.firebasestorage.app",
  messagingSenderId: "187926514883",
  appId: "1:187926514883:web:5967c91d2fd9b920f4e676"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
