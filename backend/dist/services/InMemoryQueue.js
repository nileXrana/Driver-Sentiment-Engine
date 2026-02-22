"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryQueue = void 0;
class InMemoryQueue {
    constructor(queueName, maxCapacity = 10000) {
        /** The underlying storage — simple array acting as a FIFO queue */
        this.items = [];
        this.queueName = queueName;
        this.maxCapacity = maxCapacity;
        console.log(`[Queue:${this.queueName}] Initialized with max capacity ${this.maxCapacity}.`);
    }
    /**
     * Producer method — add an item to the back of the queue.
     *
     * Returns the current queue position (useful for API responses
     * so users know their feedback is "in line").
     */
    enqueue(item) {
        // Guard: Prevent memory overflow by rejecting when full
        if (this.items.length >= this.maxCapacity) {
            console.warn(`[Queue:${this.queueName}] FULL — rejecting item. Size: ${this.items.length}`);
            throw new Error(`Queue '${this.queueName}' has reached maximum capacity (${this.maxCapacity}).`);
        }
        this.items.push(item);
        const position = this.items.length;
        console.log(`[Queue:${this.queueName}] Enqueued item. Queue size: ${position}`);
        return position;
    }
    /**
     * Consumer method — remove and return the front item.
     * Returns null if the queue is empty (safe to call anytime).
     */
    dequeue() {
        // Guard: Check before shifting to avoid undefined-related bugs
        if (this.isEmpty()) {
            return null;
        }
        const item = this.items.shift(); // shift() removes from front (FIFO)
        console.log(`[Queue:${this.queueName}] Dequeued item. Remaining: ${this.items.length}`);
        return item;
    }
    /** Peek at the front item without removing it */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[0];
    }
    /** Number of items currently in the queue */
    size() {
        return this.items.length;
    }
    /** Check if queue is empty — always check this before dequeue in the worker */
    isEmpty() {
        return this.items.length === 0;
    }
}
exports.InMemoryQueue = InMemoryQueue;
//# sourceMappingURL=InMemoryQueue.js.map