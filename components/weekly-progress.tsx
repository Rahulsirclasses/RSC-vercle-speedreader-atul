"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { day: "Mon", wpm: 320 },
  { day: "Tue", wpm: 350 },
  { day: "Wed", wpm: 310 },
  { day: "Thu", wpm: 380 },
  { day: "Fri", wpm: 400 },
  { day: "Sat", wpm: 420 },
  { day: "Sun", wpm: 390 },
]

export function WeeklyProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>Your reading speed over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} WPM`, "Reading Speed"]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
