/**
 * FeedbackForm.tsx
 * -----------------
 * The main feedback submission form.
 * 
 * Key behavior:
 * - Fetches feature flags on mount → only renders enabled fields
 * - Submits feedback to the backend API
 * - Shows the sentiment result after submission
 * 
 * Uses controlled inputs (React state drives input values).
 */

"use client";

import { useState } from "react";
import { ApiClient } from "../../lib/ApiClient";
import SentimentResultCard from "./SentimentResultCard";
import {
  FeedbackFormProps,
  SubmitFeedbackPayload,
  FeedbackResult,
} from "../../types";

export default function FeedbackForm({ featureFlags }: FeedbackFormProps) {
  // ─── Form State ──────────────────────────────────
  const [driverId, setDriverId] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [tripId, setTripId] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [submittedBy, setSubmittedBy] = useState<"rider" | "marshal">("rider");

  // ─── UI State ────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState<string>("");

  /**
   * Handle form submission.
   * Validates inputs, calls the API, and displays the result.
   */
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError("");
    setResult(null);

    // Basic client-side validation
    if (!driverId.trim() || !driverName.trim() || !feedbackText.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload: SubmitFeedbackPayload = {
      driverId: driverId.trim(),
      driverName: driverName.trim(),
      tripId: tripId.trim() || `TRIP-${Date.now()}`, // Auto-generate if empty
      feedbackText: feedbackText.trim(),
      submittedBy,
    };

    try {
      setIsSubmitting(true);
      const feedbackResult = await ApiClient.submitFeedback(payload);
      setResult(feedbackResult);

      // Reset form after successful submission
      setFeedbackText("");
      setTripId("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit feedback.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ─── Driver ID (always shown) ───────────────── */}
        <div>
          <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
            Driver ID <span className="text-red-500">*</span>
          </label>
          <input
            id="driverId"
            type="text"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="e.g. DRV001"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
          />
        </div>

        {/* ─── Driver Name (always shown) ─────────────── */}
        <div>
          <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
            Driver Name <span className="text-red-500">*</span>
          </label>
          <input
            id="driverName"
            type="text"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
          />
        </div>

        {/* ─── Trip ID (conditional on feature flag) ──── */}
        {featureFlags.enableTripIdField && (
          <div>
            <label htmlFor="tripId" className="block text-sm font-medium text-gray-700 mb-1">
              Trip ID
            </label>
            <input
              id="tripId"
              type="text"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="e.g. TRIP-1234 (auto-generated if empty)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </div>
        )}

        {/* ─── Submitted By (conditional on flags) ───── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submitted By
          </label>
          <div className="flex gap-4">
            {featureFlags.enableRiderFeedback && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="submittedBy"
                  value="rider"
                  checked={submittedBy === "rider"}
                  onChange={() => setSubmittedBy("rider")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Rider</span>
              </label>
            )}
            {featureFlags.enableMarshalFeedback && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="submittedBy"
                  value="marshal"
                  checked={submittedBy === "marshal"}
                  onChange={() => setSubmittedBy("marshal")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Marshal</span>
              </label>
            )}
          </div>
        </div>

        {/* ─── Feedback Text (always shown) ────────────── */}
        <div>
          <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            id="feedbackText"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe your experience with the driver..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-gray-900"
          />
        </div>

        {/* ─── Error Message ───────────────────────────── */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ─── Submit Button ──────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Analyzing..." : "Submit Feedback"}
        </button>
      </form>

      {/* ─── Sentiment Result (shown after submission) ── */}
      {result && (
        <div className="mt-6">
          <SentimentResultCard
            result={result}
            showDetails={featureFlags.enableSentimentDetails}
          />
        </div>
      )}
    </div>
  );
}
