"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentAnalysisService = void 0;
class SentimentAnalysisService {
    constructor() {
        // Initialize word dictionaries in the constructor (loaded once, reused forever)
        this.positiveWords = new Set([
            // General positive
            "good", "great", "excellent", "amazing", "wonderful", "fantastic",
            "awesome", "outstanding", "perfect", "superb", "brilliant",
            // Driving-specific positive
            "safe", "smooth", "clean", "friendly", "polite", "punctual",
            "comfortable", "helpful", "professional", "courteous", "pleasant",
            "careful", "fast", "efficient", "reliable", "respectful",
            "kind", "nice", "calm", "gentle", "skilled",
            // Experience positive
            "loved", "enjoyed", "happy", "satisfied", "impressed",
            "recommend", "best", "thank", "thanks", "appreciate",
        ]);
        this.negativeWords = new Set([
            // General negative
            "bad", "terrible", "horrible", "awful", "worst", "poor",
            "dreadful", "disappointing", "unacceptable", "pathetic",
            // Driving-specific negative
            "rude", "dangerous", "reckless", "dirty", "late", "slow",
            "aggressive", "unsafe", "careless", "rough", "unprofessional",
            "rash", "speeding", "honking", "yelling", "smoking",
            // Experience negative
            "hated", "angry", "upset", "scared", "frustrated",
            "complained", "never", "avoid", "worse", "nightmare",
            "overcharged", "refused", "lost", "wrong", "broke",
        ]);
        console.log(`[SentimentEngine] Initialized with ${this.positiveWords.size} positive ` +
            `and ${this.negativeWords.size} negative words.`);
    }
    /**
     * Analyze a feedback string and produce a sentiment score.
     *
     * @param text - Raw feedback like "The driver was very rude and aggressive"
     * @param userRating - Optional explicit 1-5 star rating from the user
     * @returns SentimentResult with score (1-5), label, and matched words
     */
    analyze(text, userRating) {
        // Step 1: Tokenize — convert to lowercase and split into individual words
        // We remove punctuation so "great!" becomes "great" and matches our dictionary
        const words = this.tokenize(text);
        // Step 2: Count positive and negative word matches
        let positiveCount = 0;
        let negativeCount = 0;
        const matchedWords = [];
        for (const word of words) {
            // O(1) lookup in each Set — this is the core efficiency gain
            if (this.positiveWords.has(word)) {
                positiveCount++;
                matchedWords.push(`+${word}`); // Prefix with + for clarity in debugging
            }
            else if (this.negativeWords.has(word)) {
                negativeCount++;
                matchedWords.push(`-${word}`); // Prefix with - for clarity
            }
        }
        // Step 3: Calculate the NLP sentiment score on a 1-5 scale
        const nlpScore = this.calculateScore(positiveCount, negativeCount, words.length);
        // Step 4: If a user explicitly provided a 1-5 rating, blend it 50/50 with the NLP score.
        // Otherwise, just rely purely on the text analysis.
        let finalScore = nlpScore;
        if (userRating !== undefined && userRating >= 1 && userRating <= 5) {
            finalScore = (nlpScore + userRating) / 2;
            // Round to one decimal place for clean dashboard rendering
            finalScore = Math.round(finalScore * 10) / 10;
        }
        // Step 5: Derive a human-readable label from the final combined score
        const label = this.scoreToLabel(finalScore);
        return {
            score: finalScore,
            label,
            matchedWordCount: positiveCount + negativeCount,
            matchedWords,
        };
    }
    /**
     * Tokenize input text into an array of clean, lowercase words.
     * Removes punctuation and extra whitespace.
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z\s]/g, "") // Strip everything except letters and spaces
            .split(/\s+/) // Split on whitespace
            .filter((word) => word.length > 1); // Remove single-character artifacts
    }
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
    calculateScore(positiveCount, negativeCount, totalWords) {
        const sentimentWordCount = positiveCount + negativeCount;
        // If we found no sentiment-carrying words, the feedback is neutral
        if (sentimentWordCount === 0) {
            return 3;
        }
        // Ratio ranges from -1.0 (all negative) to +1.0 (all positive)
        const ratio = (positiveCount - negativeCount) / sentimentWordCount;
        // Map the -1 to +1 range onto 1 to 5
        // Formula: score = (ratio + 1) / 2 * 4 + 1
        // When ratio = -1 → score = 1, ratio = 0 → score = 3, ratio = +1 → score = 5
        const rawScore = ((ratio + 1) / 2) * 4 + 1;
        // Round to one decimal place for readability
        return Math.round(rawScore * 10) / 10;
    }
    scoreToLabel(score) {
        if (score >= 3.5)
            return "positive";
        if (score >= 2.5)
            return "neutral";
        return "negative";
    }
}
exports.SentimentAnalysisService = SentimentAnalysisService;
//# sourceMappingURL=SentimentAnalysisService.js.map