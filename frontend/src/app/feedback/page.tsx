/**
 * Feedback Page — moved from home to its own route.
 * Fetches feature flags on mount and conditionally renders the form.
 */

"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "../../lib/ApiClient";
import FeedbackForm from "../../components/feedback/FeedbackForm";
import { FeatureFlags } from "../../types";

export default function FeedbackPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadFlags = async (): Promise<void> => {
      try {
        const featureFlags = await ApiClient.getFeatureFlags();
        setFlags(featureFlags);
      } catch (err) {
        console.error("Failed to load feature flags:", err);
        setError("Could not connect to the server. Please ensure the backend is running.");
        setFlags({
          enableRiderFeedback: true,
          enableMarshalFeedback: false,
          enableTripIdField: true,
          enableSentimentDetails: true,
          enableAlertDashboard: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Feedback</h1>
        <p className="text-gray-500">
          Rate your driver experience. Our sentiment engine will analyze your feedback instantly.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-3 text-gray-500 text-sm">Loading configuration...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error}
        </div>
      )}

      {flags && <FeedbackForm featureFlags={flags} />}
    </div>
  );
}
