/**
 * AlertList.tsx
 * --------------
 * Displays a list of system alerts for low-scoring drivers.
 * Used in the admin dashboard's alert section.
 */

"use client";

import { AlertListProps } from "../../types";

export default function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No alerts. All drivers are performing well.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          {/* Warning icon */}
          <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">&#9888;</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-red-800 text-sm">
                {alert.driverName} ({alert.driverId})
              </span>
              <span className="text-xs text-red-500 flex-shrink-0">
                {new Date(alert.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Score dropped to <strong>{alert.currentScore.toFixed(1)}</strong> (threshold: {alert.threshold})
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
