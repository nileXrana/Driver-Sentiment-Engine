/**
 * InMemoryQueue.ts
 * -----------------
 * A generic, type-safe in-memory queue for async task processing.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ DESIGN DECISION (for interview)                               │
 * │                                                               │
 * │ Why in-memory instead of Redis/RabbitMQ?                      │
 * │ - For an MVP, in-memory is simpler and has zero dependencies. │
 * │ - Trade-off: We lose queued items if the server crashes.      │
 * │ - In production, we'd swap this with a Redis-backed queue     │
 * │   (Bull/BullMQ) — but the interface stays the same (OCP).    │
 * │                                                               │
 * │ Thread Safety Note:                                           │
 * │ Node.js is single-threaded, so we don't have true race        │
 * │ conditions. However, we still guard against processing an     │
 * │ empty queue and log state transitions for observability.      │
 * └──────────────────────────────────────────────────────────────┘
 */
import { IQueue } from "../interfaces";
export declare class InMemoryQueue<T> implements IQueue<T> {
    /** The underlying storage — simple array acting as a FIFO queue */
    private readonly items;
    /** Human-readable name for this queue instance (used in logs) */
    private readonly queueName;
    /** Maximum capacity to prevent unbounded memory growth */
    private readonly maxCapacity;
    constructor(queueName: string, maxCapacity?: number);
    /**
     * Producer method — add an item to the back of the queue.
     *
     * Returns the current queue position (useful for API responses
     * so users know their feedback is "in line").
     */
    enqueue(item: T): number;
    /**
     * Consumer method — remove and return the front item.
     * Returns null if the queue is empty (safe to call anytime).
     */
    dequeue(): T | null;
    /** Peek at the front item without removing it */
    peek(): T | null;
    /** Number of items currently in the queue */
    size(): number;
    /** Check if queue is empty — always check this before dequeue in the worker */
    isEmpty(): boolean;
}
//# sourceMappingURL=InMemoryQueue.d.ts.map