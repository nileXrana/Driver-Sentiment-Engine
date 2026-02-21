/**
 * ScoreChart.tsx
 * ---------------
 * Line chart showing a driver's sentiment score trend over time.
 * Uses the 'recharts' library for simple, declarative charting.
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ScoreChartProps } from "../../types";

export default function ScoreChart({ driverName, feedbackHistory }: ScoreChartProps) {
  // Transform feedback data into the shape recharts expects
  const chartData = feedbackHistory.map((item, index) => ({
    name: `#${index + 1}`,
    score: item.sentimentScore,
    label: item.sentimentLabel,
    trip: item.tripId,
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No feedback history to chart.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-3">
        Score Trend for {driverName}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
            formatter={(value) => [`${value}/5`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: "#3b82f6" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
