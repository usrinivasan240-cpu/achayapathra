'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * A hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the 'roles_admin' collection
 * with the user's UID as the document ID, or if their email matches the admin email.
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

  // An admin is either defined by the admin email or by the existence of a doc in roles_admin collection.
  const isEmailAdmin = user?.email === 'watson777@gmail.com';
  const isRoleAdmin = !!adminDoc;
  const isAdmin = isEmailAdmin || isRoleAdmin;
  
  // The loading state depends on both the user and the document fetch.
  const isAdminLoading = isUserLoading || docLoading;

  return { isAdmin, isAdminLoading };
}
