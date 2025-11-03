'use client';
import {createContext, useContext, useEffect, useState} from 'react';
import {initializeApp, getApp, getApps, FirebaseApp} from 'firebase/app';
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {getFirestore, Firestore} from 'firebase/firestore';
import {
  getFunctions,
  Functions,
} from 'firebase/functions';
import {
  getStorage,
  FirebaseStorage,
} from 'firebase/storage';
import {
  onSnapshot,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore';
import { FirebaseClientProvider } from './client-provider';

// The use* hooks are designed to be called from client components.
// If you need to use Firebase on the server, see firebase-admin.ts.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

const FirebaseContext = createContext<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  functions: Functions;
  storage: FirebaseStorage;
} | null>(null);

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === null) {
        throw new Error("useFirebase must be used within a FirebaseProvider");
    }
    return context;
}

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useFunctions = () => useFirebase().functions;
export const useStorage = () => useFirebase().storage;


/**
 * A hook that returns the currently signed-in user.
 * @returns The currently signed-in user, or null if there is none.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setIsUserLoading(false);
    });
    return unsubscribe;
  }, [auth]);
  return {user, isUserLoading};
}

export function useDoc<T>(ref: DocumentReference<DocumentData>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      ref,
      doc => {
        setData(doc.data() as T);
        setIsLoading(false);
      },
      error => {
        console.error('Error fetching document:', error);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [ref.path]);

  return {data, isLoading};
}

export { FirebaseClientProvider, FirebaseContext, app, auth, firestore, functions, storage };
