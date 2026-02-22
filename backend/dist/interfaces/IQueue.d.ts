/**
 * IQueue.ts
 * ---------
 * Generic contract for an in-memory queue.
 *
 * Design Decision:
 * A generic interface lets us reuse the same queue for different
 * data types (feedback items, alert events, etc.) - similar to
 * Java's Queue<T> interface.
 */
export interface IQueue<T> {
    /** Add an item to the back of the queue (producer side) */
    enqueue(item: T): void;
    /** Remove and return the item at the front (consumer side), or null if empty */
    dequeue(): T | null;
    /** Peek at the front item without removing it */
    peek(): T | null;
    /** Current number of items waiting to be processed */
    size(): number;
    /** Check if queue has no items */
    isEmpty(): boolean;
}
//# sourceMappingURL=IQueue.d.ts.map