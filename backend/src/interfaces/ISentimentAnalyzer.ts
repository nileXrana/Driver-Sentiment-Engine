/**
 * ISentimentAnalyzer.ts
 * ---------------------
 * Contract for any sentiment analysis implementation.
 * 
 * Design Decision:
 * We use an interface so we can swap the Bag-of-Words engine
 * with an ML-based one later without touching the rest of the codebase.
 * This follows the Dependency Inversion Principle (SOLID "D").
 */

export interface SentimentResult {
  /** Score on a 1-5 scale (1 = very negative, 5 = very positive) */
  score: number;

  /** Human-readable label like "Positive", "Negative", "Neutral" */
  label: string;

  /** How many sentiment-carrying words we actually found */
  matchedWordCount: number;

  /** The sentiment words we detected (useful for debugging) */
  matchedWords: string[];
}

export interface ISentimentAnalyzer {
  /**
   * Analyze a raw feedback string and return a structured sentiment result.
   * @param text - The raw feedback text from a user
   */
  analyze(text: string): SentimentResult;
}
