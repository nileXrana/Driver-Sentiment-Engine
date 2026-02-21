/**
 * NotificationBell.tsx
 * ---------------------
 * Global notification bell that lives in the Navbar.
 * Fetches alerts every 10 seconds and shows unresolved count as a badge.
 * Clicking the bell reveals a dropdown with each alert and a "Resolve" button.
 * Resolved alerts are persisted in localStorage so they survive page refreshes.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ApiClient } from "../lib/ApiClient";
import { Alert } from "../types";

const POLL_INTERVAL_MS = 10_000;
const STORAGE_KEY = "resolved_alerts";

/** Read resolved IDs from localStorage */
function loadResolved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persist resolved IDs to localStorage */
function saveResolved(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota exceeded - ignore */
  }
}

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydrate resolved set from localStorage once on mount
  useEffect(() => {
    setResolvedIds(loadResolved());
  }, []);

  // Poll alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await ApiClient.getAlerts();
      setAlerts(data);
    } catch {
      /* network error - keep stale data */
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Derived values ───────────────────────────
  // Fetch all drivers to check feedback count
  const [drivers, setDrivers] = useState<{ driverId: string; totalTrips: number }[]>([]);
  useEffect(() => {
    ApiClient.getAllDrivers().then((ds) => {
      setDrivers(ds.map(d => ({ driverId: d.driverId, totalTrips: d.totalTrips })));
    });
  }, []);

  // Only show alerts for drivers with >= 5 feedbacks
  const unresolvedAlerts = alerts.filter((a) => {
    if (resolvedIds.has(a._id)) return false;
    const driver = drivers.find(d => d.driverId === a.driverId);
    return driver && driver.totalTrips >= 5;
  });
  const unresolvedCount = unresolvedAlerts.length;

  // ─── Handlers ─────────────────────────────────
  const handleResolve = (alertId: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      next.add(alertId);
      saveResolved(next);
      return next;
    });
  };

  const toggleDropdown = () => setOpen((prev) => !prev);

  // ─── Time-ago helper ──────────────────────────
  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
        aria-label={`Notifications: ${unresolvedCount} unresolved`}
      >
        {/* Bell SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unresolvedCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-gray-900 leading-none">
            {unresolvedCount > 99 ? "99+" : unresolvedCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              ALERTS
            </h3>
            <span className="text-xs text-gray-500">
              {unresolvedCount} unresolved
            </span>
          </div>

          {/* Alert list */}
          <div className="overflow-y-auto max-h-[calc(70vh-48px)] divide-y divide-gray-100">
            {unresolvedAlerts.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <span className="text-3xl">🎉</span>
                <p className="mt-2 text-sm text-gray-500">All clear! No unresolved alerts.</p>
              </div>
            ) : (
              unresolvedAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Red dot indicator */}
                    <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {alert.driverName}
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            {alert.driverId}
                          </span>
                        </p>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          {timeAgo(alert.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-0.5">
                        Score dropped to{' '}
                        <span className="font-semibold text-red-600">
                          {alert.currentScore.toFixed(1)}
                        </span>
                      </p>

                      {/* Resolve button */}
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-black border border-black rounded-md hover:bg-gray-900 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
