import {doc, setDoc, Firestore, DocumentData} from 'firebase/firestore';
import {errorEmitter} from './error-emitter';
import {FirestorePermissionError} from './errors';

/**
 * An async function that sets a document in Firestore and handles permission
 * errors by emitting a global 'permission-error' event. This allows the UI
 * to continue and the error to be handled by a global error boundary.
 *
 * @param firestore A Firestore instance.
 * @param path The path to the document to set.
 * @param data The data to set in the document.
 */
export async function setDocumentNonBlocking(
  firestore: Firestore,
  path: string,
  data: DocumentData
) {
  try {
    await setDoc(doc(firestore, path), data);
  } catch (err: any) {
    // Check if the error is a Firestore permission-denied error.
    if (err.code === 'permission-denied') {
      // Get the current user ID from the auth instance.
      const userId = firestore.app.options.auth?.currentUser?.uid || null;

      // Create a custom error object with details about the operation.
      const permissionError = new FirestorePermissionError('set', path, userId);

      // Emit a global 'permission-error' event for a global error boundary to catch.
      errorEmitter.emit('permission-error', permissionError);
    } else {
      // For any other errors, re-throw them to be handled locally.
      throw err;
    }
  }
}
