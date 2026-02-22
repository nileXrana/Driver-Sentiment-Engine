/**
 * Feedback Page - two-column layout on desktop.
 * Left: decorative image panel. Right: scrollable form.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ApiClient } from "../../lib/ApiClient";
import FeedbackForm from "../../components/feedback/FeedbackForm";
import { FeatureFlags } from "../../types";

export default function FeedbackPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [topAlert, setTopAlert] = useState<string | null>(null);
  const handleSuccess = (msg?: string) => {
    setTopAlert(msg ?? "Feedback submitted.");
    setTimeout(() => setTopAlert(null), 3500);
  };

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
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-blue-50/40 flex flex-col lg:flex-row">

      {/* Top alert (fixed) */}
      {topAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 p-3 bg-green-600 text-white rounded-xl shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="text-sm font-medium">{topAlert}</div>
          </div>
        </div>
      )}

      {/* ── LEFT: Image panel (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 h-full shrink-0 relative flex-col overflow-hidden bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80"
          alt="Passenger looking out of a vehicle window"
          fill
          className="object-cover opacity-60"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent" />

        {/* Text content anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-medium mb-3">
            ⭐ Driver Sentiment Engine
          </div>
          <h2 className="text-2xl font-bold leading-snug mb-2">
            Your voice shapes<br />safer journeys.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            Every rating and comment you leave is analysed in real time to flag safety concerns and reward excellent drivers.
          </p>

          {/* Trust indicators */}
          <div className="mt-4 flex items-center gap-5 text-white/60 text-xs">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Anonymous &amp; Secure
            </span>
            
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-4 lg:px-10">
        <div className="w-full max-w-lg mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Share Your Experience</h1>
            <p className="text-gray-500 text-sm">
              Rate your driver. Your feedback powers our real-time safety analysis.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
              <p className="mt-3 text-gray-500 text-sm">Loading configuration...</p>
            </div>
          )}

          {/* Backend warning */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form card */}
          {flags && (
            <div className="bg-white shadow-sm border border-gray-200 p-4">
              <FeedbackForm featureFlags={flags} onSuccess={handleSuccess} />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

