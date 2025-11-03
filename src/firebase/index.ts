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
  httpsCallable,
  connectFunctionsEmulator,
} from 'firebase/functions';
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator,
} from 'firebase/storage';
import {
  doc,
  getDoc,
  DocumentData,
  onSnapshot,
  DocumentReference,
} from 'firebase/firestore';

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

const FirebaseContext = createContext<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  functions: Functions;
  storage: FirebaseStorage;
} | null>(null);

/**
 * A hook that returns the Firebase app object.
 * @returns The Firebase app object.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * A hook that returns the Firebase Auth object.
 * @returns The Firebase Auth object.
 */
export function useAuth() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

/**
 * A hook that returns the Firebase Firestore object.
 * @returns The Firebase Firestore object.
 */
export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}

/**
 * A hook that returns the Firebase Functions object.
 * @returns The Firebase Functions object.
 */
export function useFunctions() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFunctions must be used within a FirebaseProvider');
  }
  return context.functions;
}

/**
 * A hook that returns the Firebase Storage object.
 * @returns The Firebase Storage object.
 */
export function useStorage() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useStorage must be used within a FirebaseProvider');
  }
  return context.storage;
}

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

/**
 * A component that provides the Firebase app object to its children.
 * @param children The children to render.
 * @returns The provider component.
 */
export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  const storage = getStorage(app);

  return (
    <FirebaseContext.Provider
      value={{app, auth, firestore, functions, storage}}
    >
      {children}
    </FirebaseContext.Provider>
  );
}
