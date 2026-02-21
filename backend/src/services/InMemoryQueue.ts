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

export class InMemoryQueue<T> implements IQueue<T> {
  /** The underlying storage — simple array acting as a FIFO queue */
  private readonly items: T[] = [];

  /** Human-readable name for this queue instance (used in logs) */
  private readonly queueName: string;

  /** Maximum capacity to prevent unbounded memory growth */
  private readonly maxCapacity: number;

  constructor(queueName: string, maxCapacity: number = 10000) {
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
  public enqueue(item: T): number {
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
  public dequeue(): T | null {
    // Guard: Check before shifting to avoid undefined-related bugs
    if (this.isEmpty()) {
      return null;
    }

    const item = this.items.shift()!; // shift() removes from front (FIFO)
    console.log(`[Queue:${this.queueName}] Dequeued item. Remaining: ${this.items.length}`);
    return item;
  }

  /** Peek at the front item without removing it */
  public peek(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  /** Number of items currently in the queue */
  public size(): number {
    return this.items.length;
  }

  /** Check if queue is empty — always check this before dequeue in the worker */
  public isEmpty(): boolean {
    return this.items.length === 0;
  }
}
