// Feedback Form

"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "../../lib/ApiClient";
import { FeedbackFormProps, SubmitFeedbackPayload, FeedbackResult } from "../../types";

// Feature Flags
const DEFAULT_CONFIG = {
  enableDriver: true,
  enableMarshal: false,
  enableApp: false,
};

// Types
interface FeedbackData {
  // User info
  userName: string;
  // Driver info
  driverId: string;
  driverName: string;
  // Driver section
  driverRating: number;   // 1-5, 0 = not rated
  driverComment: string;
  // Marshal section
  marshalRating: number;
  marshalComment: string;
  // App section
  appRating: number;
  appComment: string;
}

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  label: string;
}

// Date Helpers
function getTodayDate(): string {
  const d = new Date();
  const day = d.getDay();
  if (day === 0) {
    const sat = new Date(d);
    sat.setDate(d.getDate() - 1);
    return sat.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

function isTodayWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function isWorkingDay(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

function getPreviousWorkingDay(): string {
  return getPreviousDay();
}

function getPreviousDay(): string {
  const d = new Date();
  const day = d.getDay();
  if (day === 0) {
    const fri = new Date(d);
    fri.setDate(d.getDate() - 2);
    return fri.toISOString().slice(0, 10);
  }

  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return prev.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// Star Rating Component
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
                className={`h-7 w-7 transition-colors ${filled ? "text-amber-400" : "text-gray-200"
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

// Section Card Component
const INPUT_CLASS =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white outline-none transition text-gray-900 placeholder:text-gray-400 text-sm";

function SectionCard({
  title, emoji, ratingValue, commentValue, onRatingChange, onCommentChange, commentPlaceholder,
}: {
  title: string;
  emoji: string;
  ratingValue: number;
  commentValue: string;
  onRatingChange: (r: number) => void;
  onCommentChange: (val: string) => void;
  commentPlaceholder: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>

      <StarRating
        value={ratingValue}
        onChange={onRatingChange}
        label="Tap a star to rate"
      />

      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Your comments <span className="text-red-400">*</span>
        </label>
        <textarea
          value={commentValue}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={commentPlaceholder}
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
        />
        <p className="mt-1 text-xs text-gray-400 text-right">{commentValue.length} chars</p>
      </div>
    </div>
  );
}

// Form Component
export default function FeedbackForm({ featureFlags, onSuccess }: FeedbackFormProps) {
  // Merge flags
  const CONFIG = {
    enableDriver: featureFlags?.enableRiderFeedback ?? DEFAULT_CONFIG.enableDriver,
    enableMarshal: featureFlags?.enableMarshalFeedback ?? DEFAULT_CONFIG.enableMarshal,
    enableApp: featureFlags?.enableAppFeedback ?? DEFAULT_CONFIG.enableApp,
  };

  // Form state
  const [formData, setFormData] = useState<FeedbackData>({
    userName: "",
    driverId: "",
    driverName: "",
    driverRating: 0,
    driverComment: "",
    marshalRating: 0,
    marshalComment: "",
    appRating: 0,
    appComment: "",
  });

  // Date selection
  const todayDate = getTodayDate();
  const prevDate = getPreviousDay();
  const prevWorkDay = getPreviousWorkingDay();
  const isWeekend = isTodayWeekend();
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const todayIsWorking = isWorkingDay(todayDate);
  const prevIsWorking = isWorkingDay(prevDate);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState<string>("");

  // Driver lookup
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");

  useEffect(() => {

    if (!formData.driverId.trim()) {
      setLookupStatus("idle");
      update("driverName", "");
      return;
    }

    // Debounce lookup
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


    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.driverId]);

  // Helpers
  const update = <K extends keyof FeedbackData>(key: K, value: FeedbackData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white outline-none transition text-gray-900 placeholder:text-gray-400 text-sm";

  // Submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Validation
    if (!formData.userName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!formData.driverId.trim() || !formData.driverName.trim()) {
      setError("Please enter a valid Driver ID.");
      return;
    }


    if (CONFIG.enableDriver) {
      if (formData.driverRating === 0) {
        setError("Please give a star rating for your Driver.");
        return;
      }
      if (!formData.driverComment.trim()) {
        setError("Please leave a comment for your Driver.");
        return;
      }
    }

    if (CONFIG.enableMarshal) {
      if (formData.marshalRating === 0) {
        setError("Please give a star rating for the Marshal.");
        return;
      }
      if (!formData.marshalComment.trim()) {
        setError("Please leave a comment for the Marshal.");
        return;
      }
    }

    if (CONFIG.enableApp) {
      if (formData.appRating === 0) {
        setError("Please give a star rating for the App Experience.");
        return;
      }
      if (!formData.appComment.trim()) {
        setError("Please leave a comment for the App Experience.");
        return;
      }
    }

    // Combine feedback text
    const commentParts: string[] = [];
    if (CONFIG.enableDriver && formData.driverRating > 0)
      commentParts.push(`Rating (${formData.driverRating}/5): ${formData.driverComment}`);
    if (CONFIG.enableMarshal && formData.marshalRating > 0)
      commentParts.push(`Marshal (${formData.marshalRating}/5): ${formData.marshalComment}`);
    if (CONFIG.enableApp && formData.appRating > 0)
      commentParts.push(`App (${formData.appRating}/5): ${formData.appComment}`);

    const payload: SubmitFeedbackPayload = {
      driverId: formData.driverId.trim(),
      driverName: formData.driverName.trim(),
      feedbackText: commentParts.join(" | "),
      rating: formData.driverRating > 0 ? formData.driverRating : (formData.marshalRating > 0 ? formData.marshalRating : formData.appRating),
      userName: formData.userName.trim(),
      feedbackDate: selectedDate,
      driverRating: formData.driverRating > 0 ? formData.driverRating : undefined,
      driverFeedbackText: formData.driverComment.trim() || undefined,
    };

    console.log("[FeedbackForm] Submitting payload:", JSON.stringify(payload, null, 2));

    // Prevent weekend submissions
    if (!isWorkingDay(selectedDate)) {
      setError("Feedback can only be submitted for working days (Mon-Fri). Please try on a working day.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Duplicate check
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
      // Reset form
      setFormData((prev) => ({
        ...prev,
        driverRating: 0, driverComment: "",
        marshalRating: 0, marshalComment: "",
        appRating: 0, appComment: "",
      }));
      // Notify parent
      try {
        onSuccess?.("Feedback submitted.");
      } catch {

      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* User Name */}
        <div>
          <label htmlFor="userName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input
            id="userName" type="text"
            value={formData.userName}
            onChange={(e) => update("userName", e.target.value)}
            placeholder="Name"
            className={inputClass}
          />
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Feedback For <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-amber-600 mb-2">Feedback for weekdays (Mon–Fri) only.</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(todayDate)}
              disabled={!todayIsWorking}
              className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium border transition whitespace-nowrap ${selectedDate === todayDate
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                } ${!todayIsWorking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Today - {formatDateLabel(todayDate)}
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(prevDate)}
              disabled={!prevIsWorking}
              className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium border transition whitespace-nowrap ${selectedDate === prevDate
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                } ${!prevIsWorking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Yesterday - {formatDateLabel(prevDate)}
            </button>
          </div>
        </div>

        {/* Driver Info */}
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

        {/* Driver Rating */}
        {CONFIG.enableDriver && (
          <SectionCard
            title="Rate your Driver"
            emoji="🧑‍✈️"
            ratingValue={formData.driverRating}
            commentValue={formData.driverComment}
            onRatingChange={(r) => update("driverRating", r)}
            onCommentChange={(val) => update("driverComment", val)}
            commentPlaceholder="Was the driver polite, professional, on time? Any concerns?"
          />
        )}

        {/* Marshal Rating */}
        {CONFIG.enableMarshal && (
          <SectionCard
            title="Rate the Marshal"
            emoji="🦺"
            ratingValue={formData.marshalRating}
            commentValue={formData.marshalComment}
            onRatingChange={(r) => update("marshalRating", r)}
            onCommentChange={(val) => update("marshalComment", val)}
            commentPlaceholder="How did the marshal handle boarding, safety checks, or assistance?"
          />
        )}

        {/* App Rating */}
        {CONFIG.enableApp && (
          <SectionCard
            title="App Experience"
            emoji="📱"
            ratingValue={formData.appRating}
            commentValue={formData.appComment}
            onRatingChange={(r) => update("appRating", r)}
            onCommentChange={(val) => update("appComment", val)}
            commentPlaceholder="Was the booking fast? Did GPS tracking work properly?"
          />
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isWorkingDay(selectedDate)}
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
              </>
            )}
          </button>
        </div>

      </form>


    </div>
  );
}

