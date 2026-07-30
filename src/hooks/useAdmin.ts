'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * A hook to determine if the current user has admin privileges.
 * It checks for the user's super admin email or a record in the 'roles_admin' collection.
 * @returns An object containing `isAdmin` (boolean) and `isAdminLoading` (boolean).
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Hardcoded super admin check for usrinivasan240@gmail.com
  const isSuperAdminEmail = user?.email === "usrinivasan240@gmail.com";

  const adminDocRef = useMemoFirebase(() => {
    // If the user is a super admin by email, we conceptually don't need to wait for the doc check,
    // but we define it for general administrative role management.
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading: docLoading } = useDoc(adminDocRef);

  // An admin is defined by the super admin email or an entry in roles_admin
  const isAdmin = isSuperAdminEmail || !!adminDoc;
  
  // If they are super admin by email, we don't need to wait for the document result.
  const isAdminLoading = isUserLoading || (docLoading && !isSuperAdminEmail);

  return { isAdmin, isAdminLoading };
}