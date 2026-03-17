'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  cpf: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithCPF: (cpf: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createUser: (cpf: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createAdminIfNotExists: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email
const ADMIN_EMAIL = 'admin@vistoamericano.com';
const DEFAULT_PASSWORD = '123456';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else if (user.email === ADMIN_EMAIL) {
            // Create admin document if it doesn't exist
            try {
              const adminData: UserData = {
                uid: user.uid,
                email: user.email,
                cpf: '00000000000',
                role: 'admin',
                createdAt: new Date()
              };
              await setDoc(doc(db, 'users', user.uid), adminData);
              setUserData(adminData);
            } catch (writeError) {
              console.error('Could not create admin doc, using local data:', writeError);
              // Still set admin data locally even if Firestore write fails
              setUserData({
                uid: user.uid,
                email: user.email,
                cpf: '00000000000',
                role: 'admin',
                createdAt: new Date()
              });
            }
          } else {
            // User exists in Auth but not in Firestore - create basic userData
            setUserData({
              uid: user.uid,
              email: user.email || '',
              cpf: '',
              role: 'user',
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If admin, create admin data locally
          if (user.email === ADMIN_EMAIL) {
            setUserData({
              uid: user.uid,
              email: user.email,
              cpf: '00000000000',
              role: 'admin',
              createdAt: new Date()
            });
          } else {
            // Set basic user data
            setUserData({
              uid: user.uid,
              email: user.email || '',
              cpf: '',
              role: 'user',
              createdAt: new Date()
            });
          }
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithCPF = async (cpf: string, password: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Check if it's admin login (special case)
    if (cleanCpf === '00000000000' || cpf.toLowerCase() === 'admin') {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      return;
    }
    
    // Find user by CPF in authorized_cpfs collection
    const cpfDoc = await getDoc(doc(db, 'authorized_cpfs', cleanCpf));
    
    if (!cpfDoc.exists()) {
      throw new Error('CPF não autorizado. Entre em contato com a administração.');
    }
    
    const cpfData = cpfDoc.data();
    
    // Check if blocked
    if (cpfData.blocked) {
      throw new Error('CPF bloqueado. Entre em contato com a administração.');
    }
    
    // Get the email associated with this CPF
    const email = cpfData.email;
    
    if (!email || !cpfData.hasAccount) {
      throw new Error('CPF autorizado, mas sem conta criada. Entre em contato com a administração para criar sua conta.');
    }
    
    // Sign in with Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('invalid-credential') || error.message.includes('wrong-password')) {
          throw new Error('CPF ou senha incorretos.');
        }
      }
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserData(null);
  };

  const createUser = async (cpf: string, email: string, password: string) => {
    // Check if CPF is authorized
    const cleanCpf = cpf.replace(/\D/g, '');
    const cpfDoc = await getDoc(doc(db, 'authorized_cpfs', cleanCpf));
    
    if (!cpfDoc.exists()) {
      throw new Error('CPF não autorizado. Entre em contato com a administração.');
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      cpf: cleanCpf,
      role: 'user',
      createdAt: serverTimestamp()
    });

    // Update authorized_cpfs to mark as having account
    await setDoc(doc(db, 'authorized_cpfs', cleanCpf), {
      ...cpfDoc.data(),
      hasAccount: true,
      email: email,
      userId: userCredential.user.uid
    }, { merge: true });
  };

  const createAdminIfNotExists = async (email: string, password: string) => {
    if (email !== ADMIN_EMAIL) {
      throw new Error('Este email não é autorizado como administrador.');
    }

    try {
      // Try to create admin user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create admin document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        cpf: '00000000000',
        role: 'admin',
        createdAt: serverTimestamp()
      });
    } catch (error: unknown) {
      // If user already exists, just sign in
      if (error instanceof Error && error.message.includes('email-already-in-use')) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw error;
      }
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn,
      signInWithCPF,
      signOut,
      createUser,
      resetPassword,
      createAdminIfNotExists
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export default password for use in admin
export const getDefaultPassword = () => DEFAULT_PASSWORD;
