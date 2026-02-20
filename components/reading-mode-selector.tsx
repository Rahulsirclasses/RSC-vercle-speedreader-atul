"use client"
import { Card } from "@/components/ui/card"
import { Eye, Zap, BookOpen } from "lucide-react"

interface ReadingModeSelectorProps {
  activeMode: string
  onModeChange: (mode: any) => void
}

export function ReadingModeSelector({ activeMode, onModeChange }: ReadingModeSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Reading Mode</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Card
          className={`cursor-pointer p-3 transition-colors ${
            activeMode === "normal" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => onModeChange("normal")}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Normal</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Read text normally</p>
        </Card>

        <Card
          className={`cursor-pointer p-3 transition-colors ${
            activeMode === "rsvp" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => onModeChange("rsvp")}
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">RSVP</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Rapid Serial Visual Presentation</p>
        </Card>

        <Card
          className={`cursor-pointer p-3 transition-colors ${
            activeMode === "highlight" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => onModeChange("highlight")}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Highlight</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Highlight words as you read</p>
        </Card>
      </div>
    </div>
  )
}
