// In-Memory Queue

import { IQueue } from "../interfaces";

export class InMemoryQueue<T> implements IQueue<T> {
  // Underlying array items
  private readonly items: T[] = [];

  // Queue name
  private readonly queueName: string;

  // Max capacity
  private readonly maxCapacity: number;

  constructor(queueName: string, maxCapacity: number = 10000) {
    this.queueName = queueName;
    this.maxCapacity = maxCapacity;
    console.log(`[Queue:${this.queueName}] Initialized with max capacity ${this.maxCapacity}.`);
  }

  // Add item to queue back
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

  // Dequeue front item
  public dequeue(): T | null {
    // Guard: Check before shifting to avoid undefined-related bugs
    if (this.isEmpty()) {
      return null;
    }

    const item = this.items.shift()!; // shift() removes from front (FIFO)
    console.log(`[Queue:${this.queueName}] Dequeued item. Remaining: ${this.items.length}`);
    return item;
  }

  // Peek at the front item
  public peek(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  // Items count
  public size(): number {
    return this.items.length;
  }

  // State check
  public isEmpty(): boolean {
    return this.items.length === 0;
  }
}
