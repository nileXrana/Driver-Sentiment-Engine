// Score Trend Chart

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
  // Format chart data
  const chartData = feedbackHistory.map((item, index) => ({
    name: `#${index + 1}`,
    score: item.sentimentScore,
    label: item.sentimentLabel,
    feedbackText: item.feedbackText,
    date: item.feedbackDate || item.createdAt, // fallback to createdAt if missing
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No feedback history to chart.
      </div>
    );
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const parsedDate = new Date(data.date).toLocaleDateString();
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm max-w-xs">
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold text-gray-800">{label}</p>
            <span className="text-xs text-gray-400 ml-3">{parsedDate}</span>
          </div>
          <div className="mb-2 mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${data.label === 'positive' ? 'bg-green-100 text-green-800' :
              data.label === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {/* Capitalize first letter of label for display */}
              {data.label ? data.label.charAt(0).toUpperCase() + data.label.slice(1) : 'Neutral'}
            </span>
          </div>
          {data.feedbackText && (
            <div className="border-t pt-2 mt-2">
              {data.feedbackText.split(' | ').map((line: string, index: number) => (
                <p key={index} className="text-gray-700 italic text-xs mb-1">
                  "{line}"
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

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
          <Tooltip content={<CustomTooltip />} />
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
