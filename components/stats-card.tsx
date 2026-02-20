import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change.startsWith("+")

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">{icon}</div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <div className="mt-1 flex items-center gap-1">
              {isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : change.startsWith("-") ? (
                <ArrowDown className="h-3 w-3 text-red-600" />
              ) : null}
              <span
                className={`text-xs ${isPositive ? "text-green-600" : change.startsWith("-") ? "text-red-600" : "text-muted-foreground"}`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
