/**
 * FeedbackForm.tsx
 * -----------------
 * Section-based feedback form with star ratings + text comments.
 *
 * Design decisions:
 * - CONFIG object controls which sections render (feature flags).
 * - A single `formData` state object tracks all ratings and comments.
 * - Comment text is the primary input for the sentiment analysis engine.
 * - Star ratings provide structured sentiment data alongside free text.
 */

"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "../../lib/ApiClient";
import SentimentResultCard from "./SentimentResultCard";
import { FeedbackFormProps, SubmitFeedbackPayload, FeedbackResult } from "../../types";

// ─── Feature flag config ─────────────────────────────────────────────────────
// Override defaults with prop values when the backend is available.
const DEFAULT_CONFIG = {
  enableDriver:  true,
  enableMarshal: false,
};

// ─── Strict types ────────────────────────────────────────────────────────────
interface FeedbackData {
  // User info
  userName:       string;
  // Driver info
  driverId:       string;
  driverName:     string;
  // Driver section
  driverRating:   number;   // 1-5, 0 = not rated
  driverComment:  string;
  // Marshal section
  marshalRating:  number;
  marshalComment: string;
}

interface StarRatingProps {
  value:    number;
  onChange: (rating: number) => void;
  label:    string;
}

// ─── Date helpers ────────────────────────────────────────────────────────────
// Returns "YYYY-MM-DD" for today in the user's local timezone
function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Returns "YYYY-MM-DD" for the previous working day (Mon→Fri, skips weekends)
function getPreviousWorkingDay(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  let daysBack = 1;
  if (day === 1) daysBack = 3; // Monday → back to Friday
  if (day === 0) daysBack = 2; // Sunday → back to Friday
  const prev = new Date(now);
  prev.setDate(prev.getDate() - daysBack);
  return prev.toISOString().slice(0, 10);
}

// Format "YYYY-MM-DD" to a readable label like "Fri, 20 Feb"
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid timezone shift
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Star Rating sub-component ───────────────────────────────────────────────
function StarRating({ value, onChange, label }: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${star} out of 5`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-7 w-7 transition-colors ${
                  filled ? "text-amber-400" : "text-gray-200"
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-1 text-sm text-gray-500 self-center">{value}/5</span>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function FeedbackForm({ featureFlags }: FeedbackFormProps) {
  // Merge flag prop values into the config (runtime overrides compile-time defaults)
  const CONFIG = {
    enableDriver:  DEFAULT_CONFIG.enableDriver,
    enableMarshal: featureFlags?.enableMarshalFeedback ?? DEFAULT_CONFIG.enableMarshal,
  };

  // ─── Single state object for all form data ──────────────────
  const [formData, setFormData] = useState<FeedbackData>({
    userName:       "",
    driverId:       "",
    driverName:     "",
    driverRating:   0,
    driverComment:  "",
    marshalRating:  0,
    marshalComment: "",
  });

  // ─── Feedback date selection ─────────────────────────────────
  const todayDate    = getTodayDate();
  const prevWorkDay  = getPreviousWorkingDay();
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result,       setResult]       = useState<FeedbackResult | null>(null);
  const [error,        setError]        = useState<string>("");

  // ─── Driver name auto-lookup ─────────────────────────────────
  // States to show lookup status next to the Driver Name field
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");

  useEffect(() => {
    // Only look up if the ID looks like a real driver ID (non-empty)
    if (!formData.driverId.trim()) {
      setLookupStatus("idle");
      update("driverName", "");
      return;
    }

    // Debounce: wait 500ms after the user stops typing before hitting the API
    const timer = setTimeout(async () => {
      setLookupStatus("loading");
      try {
        const driver = await ApiClient.getDriver(formData.driverId.trim().toUpperCase());
        update("driverName", driver.name);
        setLookupStatus("found");
      } catch {
        update("driverName", "");
        setLookupStatus("not_found");
      }
    }, 500);

    // Cleanup: cancel the timer if the user keeps typing
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.driverId]);

  // ─── Helpers ────────────────────────────────────────────────
  const update = <K extends keyof FeedbackData>(key: K, value: FeedbackData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white outline-none transition text-gray-900 placeholder:text-gray-400 text-sm";

  // ─── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Validate required driver info
    if (!formData.userName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!formData.driverId.trim() || !formData.driverName.trim()) {
      setError("Please enter a valid Driver ID — the driver name must be auto-filled before submitting.");
      return;
    }

    // Validate at least one rating was given
    const hasRating = formData.driverRating > 0 || formData.marshalRating > 0;
    if (!hasRating) {
      setError("Please give at least one star rating before submitting.");
      return;
    }

    // Validate at least one comment (primary input for sentiment engine)
    const primaryComment = formData.driverComment || formData.marshalComment;
    if (!primaryComment.trim()) {
      setError("Please write a comment — it helps our sentiment engine analyse your experience.");
      return;
    }

    // Build the feedback text: combine all comments with labels for richer analysis
    const commentParts: string[] = [];
    if (CONFIG.enableDriver && formData.driverRating > 0)
      commentParts.push(`Driver (${formData.driverRating}/5): ${formData.driverComment}`);
    if (CONFIG.enableMarshal && formData.marshalRating > 0)
      commentParts.push(`Marshal (${formData.marshalRating}/5): ${formData.marshalComment}`);

    const payload: SubmitFeedbackPayload = {
      driverId:     formData.driverId.trim(),
      driverName:   formData.driverName.trim(),
      tripId:       `TRIP-${Date.now()}`,
      feedbackText: commentParts.join(" | "),
      submittedBy:  "rider",
      userName:     formData.userName.trim(),
      feedbackDate: selectedDate,
    };

    // Log the final JSON payload (simulating API call structure)
    console.log("[FeedbackForm] Submitting payload:", JSON.stringify(payload, null, 2));

    try {
      setIsSubmitting(true);

      // ─── Duplicate check: has this user already given feedback for this driver on this date? ───
      const alreadyExists = await ApiClient.checkFeedbackExists(
        formData.userName.trim(),
        formData.driverId.trim(),
        selectedDate
      );
      if (alreadyExists) {
        setError(`You have already submitted feedback for ${formData.driverName} on ${formatDateLabel(selectedDate)}. Duplicate submissions are not allowed.`);
        setIsSubmitting(false);
        return;
      }

      const feedbackResult = await ApiClient.submitFeedback(payload);
      setResult(feedbackResult);
      // Reset comment fields after success; keep driver info
      setFormData((prev) => ({
        ...prev,
        driverRating: 0, driverComment: "",
        marshalRating: 0, marshalComment: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Section card helper ────────────────────────────────────
  const SectionCard = ({
    title, emoji, ratingKey, commentKey, commentPlaceholder,
  }: {
    title: string;
    emoji: string;
    ratingKey:       "driverRating" | "marshalRating";
    commentKey:      "driverComment" | "marshalComment";
    commentPlaceholder: string;
  }) => (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>

      <StarRating
        value={formData[ratingKey]}
        onChange={(r) => update(ratingKey, r)}
        label="Tap a star to rate"
      />

      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Your comments <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData[commentKey]}
          onChange={(e) => update(commentKey, e.target.value)}
          placeholder={commentPlaceholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <p className="mt-1 text-xs text-gray-400 text-right">{formData[commentKey].length} chars</p>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Your Name ────────────────────────────── */}
        <div>
          <label htmlFor="userName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input
            id="userName" type="text"
            value={formData.userName}
            onChange={(e) => update("userName", e.target.value)}
            placeholder="e.g. John Doe"
            className={inputClass}
          />
        </div>

        {/* ── Feedback Date toggle ─────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Feedback For <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(todayDate)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                selectedDate === todayDate
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              Today — {formatDateLabel(todayDate)}
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(prevWorkDay)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                selectedDate === prevWorkDay
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              Prev Day — {formatDateLabel(prevWorkDay)}
            </button>
          </div>
        </div>

        {/* ── Driver info row ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="driverId" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Driver ID <span className="text-red-400">*</span>
            </label>
            <input
              id="driverId" type="text"
              value={formData.driverId}
              onChange={(e) => update("driverId", e.target.value.toUpperCase())}
              placeholder="e.g. DRV001"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="driverName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Driver Name
              {lookupStatus === "loading" && (
                <span className="ml-2 text-blue-400 font-normal normal-case">looking up...</span>
              )}
              {lookupStatus === "found" && (
                <span className="ml-2 text-green-500 font-normal normal-case">✓ found</span>
              )}
              {lookupStatus === "not_found" && (
                <span className="ml-2 text-red-400 font-normal normal-case">ID not found</span>
              )}
            </label>
            <input
              id="driverName" type="text"
              value={formData.driverName}
              readOnly
              placeholder="Auto-filled from Driver ID"
              className={`${inputClass} bg-gray-100 cursor-not-allowed text-gray-500`}
            />
          </div>
        </div>

        {/* ── Driver section ────────────────────────── */}
        {CONFIG.enableDriver && (
          <SectionCard
            title="Rate your Driver"
            emoji="🧑‍✈️"
            ratingKey="driverRating"
            commentKey="driverComment"
            commentPlaceholder="Was the driver polite, professional, on time? Any concerns?"
          />
        )}

        {/* ── Marshal section (hidden by default) ───── */}
        {CONFIG.enableMarshal && (
          <SectionCard
            title="Rate the Marshal"
            emoji="🦺"
            ratingKey="marshalRating"
            commentKey="marshalComment"
            commentPlaceholder="How did the marshal handle boarding, safety checks, or assistance?"
          />
        )}

        {/* ── Error ─────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Submit ────────────────────────────────── */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing your feedback...
              </>
            ) : (
              <>
                Submit Feedback
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>

      </form>

      {/* ── Sentiment result ──────────────────────── */}
      {result && (
        <div className="mt-6">
          <SentimentResultCard
            result={result}
            showDetails={featureFlags?.enableSentimentDetails ?? true}
          />
        </div>
      )}
    </div>
  );
}

