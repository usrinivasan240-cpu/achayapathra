'use client';
import * as React from 'react';
import { app, auth, firestore, functions, storage, FirebaseContext } from '.';

export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  return (
    <FirebaseContext.Provider value={{app, auth, firestore, functions, storage}}>
      {children}
    </FirebaseContext.Provider>
  );
}
