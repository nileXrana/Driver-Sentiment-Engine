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

  /** Human-readable label like "positive", "negative", "neutral" */
  label: "positive" | "negative" | "neutral";

  /** How many sentiment-carrying words we actually found */
  matchedWordCount: number;

  /** The sentiment words we detected (useful for debugging) */
  matchedWords: string[];
}

export interface ISentimentAnalyzer {
  /**
   * Analyzes text (and optionally a literal star rating) and returns a structured sentiment result.
   * 
   * @param text The unstructured feedback text to analyze.
   * @param userRating The explicit 1-5 star rating submitted by the user.
   */
  analyze(text: string, userRating?: number): SentimentResult;
}
