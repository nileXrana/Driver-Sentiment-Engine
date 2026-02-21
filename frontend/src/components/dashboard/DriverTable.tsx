/**
 * DriverTable.tsx
 * ----------------
 * Displays all drivers with their live sentiment scores.
 * 
 * Key behavior:
 * - Rows are color-coded by sentiment (Negative = red, Neutral = yellow, Positive = green)
 * - Clicking a row selects the driver for detailed view
 */

"use client";

import { DriverTableProps, Driver } from "../../types";

/** Map risk level to sentiment label */
const getSentiment = (riskLevel: Driver["riskLevel"]): "Negative" | "Neutral" | "Positive" => {
  switch (riskLevel) {
    case "HIGH":   return "Negative";
    case "MEDIUM": return "Neutral";
    case "LOW":    return "Positive";
  }
};

export default function DriverTable({ drivers, onDriverSelect }: DriverTableProps) {
  const getRowStyle = (riskLevel: Driver["riskLevel"]): string => {
    switch (riskLevel) {
      case "HIGH":
        return "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500";
      case "MEDIUM":
        return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-500";
      case "LOW":
        return "bg-white hover:bg-gray-50 border-l-4 border-l-green-500";
    }
  };

  const getSentimentBadge = (riskLevel: Driver["riskLevel"]): string => {
    switch (riskLevel) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
    }
  };

  if (drivers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No drivers found.</p>
        <p className="text-sm mt-1">Submit some feedback to see drivers here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border-0">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-[11px] sm:text-xs uppercase tracking-tight">
            <th className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium">Driver ID</th>
            <th className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium">Name</th>
            <th className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-center">Score</th>
            <th className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-center">Sentiment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {drivers.map((driver: Driver) => (
            <tr
              key={driver.driverId}
              onClick={() => onDriverSelect(driver.driverId)}
              className={`cursor-pointer transition ${getRowStyle(driver.riskLevel)}`}
            >
              <td className="px-2 sm:px-4 py-1.5 sm:py-2 font-mono text-[11px] sm:text-xs text-gray-700">
                {driver.driverId}
              </td>
              <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-900">
                {driver.name}
              </td>
              <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-center">
                <span className="text-[11px] sm:text-xs font-bold text-gray-900">
                  {driver.averageScore.toFixed(1)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500">/5</span>
              </td>
              <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-center">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${getSentimentBadge(driver.riskLevel)}`}>
                  {getSentiment(driver.riskLevel)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
