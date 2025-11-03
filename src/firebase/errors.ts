// A collection of custom error types for the application.

/**
 * A custom error for Firestore permission-denied errors.
 * Extends the global Error object with a `details` property.
 */
export class FirestorePermissionError extends Error {
  details: {
    operation: string;
    path: string;
    userId: string | null;
  };

  /**
   * @param operation The attempted Firestore operation (e.g., 'get', 'set', 'delete').
   * @param path The Firestore path that was accessed.
   * @param userId The ID of the user who attempted the operation.
   */
  constructor(operation: string, path: string, userId: string | null) {
    const message = `Firestore permission denied on '${path}' for user '${
      userId || 'anonymous'
    }'.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.details = {operation, path, userId};
  }
}
