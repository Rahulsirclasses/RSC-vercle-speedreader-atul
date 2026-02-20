"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw } from "lucide-react"

interface ReadingControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  progress: number
}

export function ReadingControls({ isPlaying, onPlayPause, onReset, progress }: ReadingControlsProps) {
  return (
    <div className="space-y-4">
      <Progress value={progress * 100} className="h-2 w-full" />

      <div className="flex justify-center gap-2">
        <Button onClick={onPlayPause} variant="outline" size="icon">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button onClick={onReset} variant="outline" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
