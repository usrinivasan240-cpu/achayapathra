'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * A hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the 'roles_admin' collection
 * with the user's UID as the document ID.
 * @returns An object containing `isAdmin` (boolean) and `isAdminLoading` (boolean).
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading: docLoading } = useDoc(adminDocRef);

  // The user is an admin if the admin document exists.
  const isAdmin = !!adminDoc;
  
  // The loading state depends on both the user and the document fetch.
  const isAdminLoading = isUserLoading || docLoading;

  return { isAdmin, isAdminLoading };
}
