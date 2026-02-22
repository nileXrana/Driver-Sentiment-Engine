/**
 * SentimentAnalysisService.ts
 * ----------------------------
 * Rule-Based Sentiment Engine using the Bag-of-Words approach.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ ALGORITHM EXPLANATION (for interview)                         │
 * │                                                               │
 * │ 1. We maintain two Sets: positiveWords and negativeWords.     │
 * │    Using Set gives us O(1) lookup per word (vs O(n) for an   │
 * │    array). For 'n' words in the feedback, total time is O(n).│
 * │                                                               │
 * │ 2. We tokenize the input, then count how many words appear   │
 * │    in each set.                                               │
 * │                                                               │
 * │ 3. We compute a raw ratio: (positive - negative) / total     │
 * │    and map it to a 1-5 scale.                                │
 * │                                                               │
 * │ TIME COMPLEXITY:  O(n) where n = number of words in text     │
 * │ SPACE COMPLEXITY: O(k) where k = size of our word dictionary │
 * └──────────────────────────────────────────────────────────────┘
 */
import { ISentimentAnalyzer, SentimentResult } from "../interfaces";
export declare class SentimentAnalysisService implements ISentimentAnalyzer {
    /**
     * Using Set<string> for O(1) average-case lookup efficiency.
     * A Java developer would recognize this as similar to HashSet<String>.
     */
    private readonly positiveWords;
    private readonly negativeWords;
    constructor();
    /**
     * Analyze a feedback string and produce a sentiment score.
     *
     * @param text - Raw feedback like "The driver was very rude and aggressive"
     * @param userRating - Optional explicit 1-5 star rating from the user
     * @returns SentimentResult with score (1-5), label, and matched words
     */
    analyze(text: string, userRating?: number): SentimentResult;
    /**
     * Tokenize input text into an array of clean, lowercase words.
     * Removes punctuation and extra whitespace.
     */
    private tokenize;
    /**
     * Convert positive/negative counts into a 1-5 score.
     *
     * Formula:
     *   ratio = (positiveCount - negativeCount) / totalSentimentWords
     *   This gives a value between -1 (all negative) and +1 (all positive).
     *   We then map this to our 1-5 scale.
     *
     * Edge case: If no sentiment words are found, we return a neutral 3.
     */
    private calculateScore;
    private scoreToLabel;
}
//# sourceMappingURL=SentimentAnalysisService.d.ts.map