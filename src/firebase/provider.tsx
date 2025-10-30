
'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import type {Auth} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';

import { initializeFirebase } from './';

export interface FirebaseSDK {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export interface FirebaseContextValue {
  sdk: FirebaseSDK | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  sdk: null,
  loading: true,
});

export function FirebaseProvider(props: React.PropsWithChildren) {
  const [sdk, setSdk] = useState<FirebaseSDK | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {firebaseApp, db, auth} = initializeFirebase();
    setSdk({firebaseApp, firestore: db, auth});
    setLoading(false);
  }, []);

  return (
    <FirebaseContext.Provider value={{sdk, loading}}>
      {props.children}
    </FirebaseContext.Provider>
  );
}

export const FirebaseClientProvider = FirebaseProvider;

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function useFirebaseApp() {
  const {sdk} = useFirebase();
  return sdk?.firebaseApp ?? null;
}

export function useFirestore() {
  const {sdk} = useFirebase();
  return sdk?.firestore ?? null;
}

export function useAuth() {
  const {sdk} = useFirebase();
  return sdk?.auth ?? null;
}

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState(auth?.currentUser);

  useEffect(() => {
    if (!auth) return;
    const { onAuthStateChanged } = require('firebase/auth');
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  return user;
}

export function useCollection<T>(path: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!firestore) return;
    const {collection, onSnapshot} = require('firebase/firestore');
    const unsubscribe = onSnapshot(collection(firestore, path), snapshot => {
      setData(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as T)));
    });
    return () => unsubscribe();
  }, [firestore, path]);

  return data;
}

export function useDoc<T>(path: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!firestore) return;
    const {doc, onSnapshot} = require('firebase/firestore');
    const unsubscribe = onSnapshot(doc(firestore, path), snapshot => {
      setData({id: snapshot.id, ...snapshot.data()} as T);
    });
    return () => unsubscribe();
  }, [firestore, path]);

  return data;
}
