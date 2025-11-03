// A typed event emitter for signaling specific, typed errors globally.
import {EventEmitter} from 'events';
import {FirestorePermissionError} from './errors';

// Define the interface for the events and their expected payload types.
interface TypedEvents {
  'permission-error': (error: FirestorePermissionError) => void;
  // Add other typed events here as needed.
}

// Extend EventEmitter and type its methods.
class TypedEventEmitter extends EventEmitter {
  // Type `emit` to ensure the correct payload type for each event.
  emit<E extends keyof TypedEvents>(event: E, ...args: Parameters<TypedEvents[E]>): boolean {
    return super.emit(event, ...args);
  }

  // Type `on` to ensure the correct listener signature for each event.
  on<E extends keyof TypedEvents>(event: E, listener: TypedEvents[E]): this {
    return super.on(event, listener);
  }

  // Type `off` for completeness.
  off<E extends keyof TypedEvents>(event: E, listener: TypedEvents[E]): this {
    return super.off(event, listener);
  }

  // Type `once` for completeness.
  once<E extends keyof TypedEvents>(event: E, listener: TypedEvents[E]): this {
    return super.once(event, listener);
  }
}

// Export a singleton instance of the typed emitter.
export const errorEmitter = new TypedEventEmitter();
