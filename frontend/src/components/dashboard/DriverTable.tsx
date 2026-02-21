/**
 * DriverTable.tsx
 * ----------------
 * Displays all drivers with their live sentiment scores.
 * 
 * Key behavior:
 * - Rows are color-coded by risk level (HIGH = red, MEDIUM = yellow, LOW = default)
 * - Clicking a row selects the driver for detailed view
 */

"use client";

import { DriverTableProps, Driver } from "../../types";

export default function DriverTable({ drivers, onDriverSelect }: DriverTableProps) {
  /**
   * Get row styling based on risk level.
   * HIGH risk drivers are highlighted in red so admins spot them immediately.
   */
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

  /** Badge color for the risk level pill */
  const getRiskBadge = (riskLevel: Driver["riskLevel"]): string => {
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
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <th className="px-6 py-3 font-medium">Driver ID</th>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium text-center">Score</th>
            <th className="px-6 py-3 font-medium text-center">Trips</th>
            <th className="px-6 py-3 font-medium text-center">Risk Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {drivers.map((driver: Driver) => (
            <tr
              key={driver.driverId}
              onClick={() => onDriverSelect(driver.driverId)}
              className={`cursor-pointer transition ${getRowStyle(driver.riskLevel)}`}
            >
              <td className="px-6 py-4 font-mono text-sm text-gray-700">
                {driver.driverId}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">
                {driver.name}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-lg font-bold text-gray-900">
                  {driver.averageScore.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">/5</span>
              </td>
              <td className="px-6 py-4 text-center text-gray-600">
                {driver.totalTrips}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadge(driver.riskLevel)}`}>
                  {driver.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
