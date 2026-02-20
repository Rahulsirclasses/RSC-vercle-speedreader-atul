"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, Eye, EyeOff, Lightbulb, MoveHorizontal, Rewind, Zap } from "lucide-react"
import Link from "next/link"
import { SpeedReader } from "@/components/speed-reader"
import { FixationBreaker } from "@/components/drills/fixation-breaker"
import { BlindSpotBlur } from "@/components/drills/blind-spot-blur"
import { ReverseReading } from "@/components/drills/reverse-reading"
import { sampleText } from "@/app/drills/[id]/page"

interface DrillContentProps {
  drill: any
  id: string
}

export function DrillContent({ drill, id }: DrillContentProps) {
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes in seconds
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isStarted || isCompleted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsCompleted(true)
          return 0
        }
        return prev - 1
      })

      // Update progress
      setProgress((prevProgress) => {
        const initialTime = getDrillTime(drill.time)
        return 100 - (timeRemaining / initialTime) * 100
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, isCompleted, drill.time, timeRemaining])

  const getIcon = () => {
    switch (drill.icon) {
      case "zap":
        return <Zap className="h-6 w-6" />
      case "brain":
        return <Brain className="h-6 w-6" />
      case "eye":
        return <Eye className="h-6 w-6" />
      case "lightbulb":
        return <Lightbulb className="h-6 w-6" />
      case "rewind":
        return <Rewind className="h-6 w-6" />
      case "move-horizontal":
        return <MoveHorizontal className="h-6 w-6" />
      case "eye-off":
        return <EyeOff className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDrillTime = (timeString: string): number => {
    // Parse time strings like "3 mins" or "3-5 mins"
    const match = timeString.match(/(\d+)(?:-(\d+))?\s*mins?/)
    if (match) {
      // If it's a range, take the average
      if (match[2]) {
        return ((Number.parseInt(match[1]) + Number.parseInt(match[2])) / 2) * 60
      }
      // Otherwise just use the single value
      return Number.parseInt(match[1]) * 60
    }
    return 180 // Default to 3 minutes
  }

  const handleComplete = () => {
    setIsCompleted(true)
  }

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">{getIcon()}</div>
        <h2 className="mb-2 text-2xl font-bold">{drill.name}</h2>
        <p className="mb-6 text-muted-foreground">{drill.description}</p>
        <div className="mb-8 rounded-lg bg-muted p-4 text-left">
          <h3 className="mb-2 font-medium">Instructions:</h3>
          <p>{drill.instructions}</p>
        </div>
        <Button size="lg" onClick={() => setIsStarted(true)}>
          Start Drill
        </Button>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Zap className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Drill Completed!</h2>
        <p className="mb-6 text-muted-foreground">Great job completing the {drill.name} drill.</p>

        <div className="mb-8 w-full max-w-md rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-medium">Your Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">Reading Speed</p>
              <p className="text-xl font-bold">380 WPM</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">Comprehension</p>
              <p className="text-xl font-bold">85%</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsStarted(false)
              setIsCompleted(false)
              setTimeRemaining(getDrillTime(drill.time))
              setProgress(0)
            }}
          >
            Try Again
          </Button>
          <Button asChild>
            <Link href="/drills">Back to Drills</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Render different drill types
  switch (drill.type) {
    case "speed":
    case "flash":
      return (
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleComplete}>
              End Drill
            </Button>
          </div>
          <Progress value={progress} className="mb-6" />
          <div className="flex-1 rounded-lg border p-6">
            <SpeedReader
              text={sampleText}
              wpm={drill.type === "flash" ? 400 : 350}
              mode={drill.type === "flash" ? "flashing" : "normal"}
              chunkSize={drill.type === "flash" ? 1 : 3}
              onComplete={handleComplete}
            />
          </div>
        </div>
      )
    case "fixation":
      return (
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleComplete}>
              End Drill
            </Button>
          </div>
          <Progress value={progress} className="mb-6" />
          <div className="flex-1 rounded-lg border p-6">
            <FixationBreaker text={sampleText} onComplete={handleComplete} />
          </div>
        </div>
      )
    case "blind-spot":
      return (
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleComplete}>
              End Drill
            </Button>
          </div>
          <Progress value={progress} className="mb-6" />
          <div className="flex-1 rounded-lg border p-6">
            <BlindSpotBlur text={sampleText} onComplete={handleComplete} />
          </div>
        </div>
      )
    case "reverse":
      return (
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleComplete}>
              End Drill
            </Button>
          </div>
          <Progress value={progress} className="mb-6" />
          <div className="flex-1 rounded-lg border p-6">
            <ReverseReading text={sampleText} onComplete={handleComplete} />
          </div>
        </div>
      )
    case "comprehension":
      return (
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleComplete}>
              End Drill
            </Button>
          </div>
          <Progress value={progress} className="mb-6" />
          <div className="flex-1 rounded-lg border p-6">
            <div className="prose max-w-none dark:prose-invert">
              <p>{sampleText}</p>
            </div>
            <Button className="mt-6" onClick={handleComplete}>
              I'm Done Reading
            </Button>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p>This drill type is not yet implemented.</p>
          <Button className="mt-4" onClick={handleComplete}>
            End Drill
          </Button>
        </div>
      )
  }
}
