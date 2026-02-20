"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartDataPoint {
  day: string;
  wpm: number;
  comprehension?: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip
            formatter={(value, name) => [
              name === "wpm" ? `${value} WPM` : `${value}%`,
              name === "wpm" ? "Reading Speed" : "Comprehension",
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="wpm"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="comprehension"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
