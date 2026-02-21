/**
 * SentimentResultCard.tsx
 * ------------------------
 * Displays the sentiment analysis result after feedback submission.
 * 
 * Shows the score, label, and optionally the matched sentiment words
 * (controlled by the enableSentimentDetails feature flag).
 */

"use client";

import { SentimentResultProps } from "../../types";

export default function SentimentResultCard({ result, showDetails }: SentimentResultProps) {
  /**
   * Pick a color based on the sentiment score.
   * Score 1-2 = red, 2-3 = orange, 3-4 = yellow, 4-5 = green
   */
  const getScoreColor = (score: number): string => {
    if (score >= 4) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 2) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  /** Visual bar width based on 1-5 scale → 0-100% */
  const scorePercentage = ((result.sentimentScore - 1) / 4) * 100;

  return (
    <div className={`p-5 rounded-lg border-2 ${getScoreColor(result.sentimentScore)}`}>
      <h3 className="text-lg font-semibold mb-3">Sentiment Analysis Result</h3>

      {/* ─── Score Display ───────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl font-bold">{result.sentimentScore}/5</span>
        <span className="text-lg font-medium px-3 py-1 rounded-full bg-white/50">
          {result.sentimentLabel}
        </span>
      </div>

      {/* ─── Score Bar ───────────────────────────── */}
      <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-current transition-all duration-500"
          style={{ width: `${scorePercentage}%` }}
        />
      </div>

      {/* ─── Matched Words (optional, controlled by flag) */}
      {showDetails && result.matchedWords.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Detected sentiment words:</p>
          <div className="flex flex-wrap gap-2">
            {result.matchedWords.map((word, index) => {
              const isPositive = word.startsWith("+");
              return (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full font-mono ${
                    isPositive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Queue Info ──────────────────────────── */}
      <p className="text-xs mt-3 opacity-70">
        Queue position: #{result.queuePosition} &middot; Processing in background
      </p>
    </div>
  );
}
