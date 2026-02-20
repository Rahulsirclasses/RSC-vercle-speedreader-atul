"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Eye, Zap } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { saveDrillResult } from "@/lib/actions/drills"

interface WordRevealDrillProps {
  passage: any
}

export function WordRevealDrill({ passage }: WordRevealDrillProps) {
  const [stage, setStage] = useState<"intro" | "drill" | "results">("intro")
  const [words, setWords] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(300) // words per minute
  const [chunkSize, setChunkSize] = useState(1) // words per flash
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [maxSpeed, setMaxSpeed] = useState(300)

  // Initialize words from passage
  useEffect(() => {
    if (passage && passage.text) {
      setWords(passage.text.split(/\s+/))
    }
  }, [passage])

  // Calculate delay based on speed
  const getDelay = useCallback(() => {
    return 60000 / speed // milliseconds per word
  }, [speed])

  // Handle the word reveal animation
  useEffect(() => {
    if (!isRunning || words.length === 0) return

    const timer = setTimeout(() => {
      if (currentIndex < words.length - chunkSize) {
        setCurrentIndex(currentIndex + chunkSize)
        setProgress((currentIndex / words.length) * 100)

        // Gradually increase speed if below max
        if (speed < maxSpeed) {
          setSpeed((prev) => Math.min(prev + 5, maxSpeed))
        }
      } else {
        setIsRunning(false)
        const finalEndTime = Date.now()
        setEndTime(finalEndTime)
        setProgress(100)

        // Calculate and save results immediately using fresh values
        const timeSpentMs = finalEndTime - startTime
        const timeSpentMinutes = timeSpentMs / 60000
        const effectiveWpm = Math.round(words.length / timeSpentMinutes)

        saveDrillResult({
          drillType: "word-reveal",
          wpm: effectiveWpm,
          duration: Math.round(timeSpentMs / 1000),
          passageTitle: passage?.title,
          wordsRead: words.length
        }).catch(e => console.error("Failed to save result", e))

        setTimeout(() => {
          setStage("results")
        }, 1000)
      }
    }, getDelay())

    return () => clearTimeout(timer)
  }, [currentIndex, words.length, isRunning, chunkSize, getDelay, speed, maxSpeed])

  const handleStart = () => {
    setStage("drill")
    setCurrentIndex(0)
    setProgress(0)
    setSpeed(300) // Start at base speed
    setStartTime(Date.now())
  }

  const handleDrillStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleChunkSizeChange = (value: number[]) => {
    setChunkSize(value[0])
  }

  const handleMaxSpeedChange = (value: number[]) => {
    setMaxSpeed(value[0])
  }

  const handleReset = () => {
    // Reset all state to initial values
    setStage("intro")
    setCurrentIndex(0)
    setIsRunning(false)
    setSpeed(300)
    setProgress(0)
    setStartTime(0)
    setEndTime(0)
    setChunkSize(1)
    setMaxSpeed(300)
  }

  const getCurrentChunk = () => {
    if (words.length === 0 || currentIndex >= words.length) return ""

    const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(" ")
    return chunk
  }

  const calculateResults = () => {
    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000 // Convert to minutes
    const effectiveWpm = Math.round(words.length / timeSpentMinutes)

    return {
      wordsProcessed: words.length,
      timeSpentSeconds: Math.round(timeSpentMs / 1000),
      effectiveWpm,
      maxSpeedReached: maxSpeed,
    }
  }

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Eye className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Word Reveal Drill</h2>
        <p className="mb-6 text-muted-foreground">
          Words will flash on screen at increasing speeds. Try to comprehend each word or phrase as it appears.
        </p>

        <div className="mb-8 w-full max-w-md space-y-6 rounded-lg bg-muted p-4 text-left">
          <div>
            <h3 className="mb-2 font-medium">Words per Flash</h3>
            <div className="flex items-center gap-4">
              <Slider
                value={[chunkSize]}
                min={1}
                max={3}
                step={1}
                onValueChange={handleChunkSizeChange}
                className="w-full"
              />
              <span className="w-8 text-center">{chunkSize}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Maximum Speed (WPM)</h3>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxSpeed]}
                min={300}
                max={1000}
                step={50}
                onValueChange={handleMaxSpeedChange}
                className="w-full"
              />
              <span className="w-16 text-center">{maxSpeed}</span>
            </div>
          </div>

          <div className="rounded-lg bg-background p-3">
            <h3 className="mb-2 font-medium">How it works:</h3>
            <p className="text-sm text-muted-foreground">
              This drill will flash {chunkSize === 1 ? "one word" : `${chunkSize} words`} at a time, starting at 300 WPM
              and gradually increasing to {maxSpeed} WPM. Try to read and comprehend each flash.
            </p>
          </div>
        </div>

        <Button size="lg" onClick={handleStart}>
          Start Drill
        </Button>
      </div>
    )
  }

  if (stage === "drill") {
    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{speed} WPM</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {chunkSize} word{chunkSize > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {isRunning ? (
            <Button variant="outline" size="sm" onClick={handlePause}>
              Pause
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleDrillStart}>
              {currentIndex === 0 ? "Start" : "Resume"}
            </Button>
          )}
        </div>

        <Progress value={progress} className="mb-6" />

        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border p-6">
          {isRunning ? (
            <div className="text-center text-3xl font-medium">{getCurrentChunk()}</div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-lg font-medium">{currentIndex === 0 ? "Ready to begin" : "Paused"}</p>
              <p className="text-sm text-muted-foreground">
                {currentIndex === 0
                  ? "Press Start to begin the word reveal drill"
                  : `${Math.round((currentIndex / words.length) * 100)}% complete`}
              </p>
              <Button onClick={handleDrillStart}>{currentIndex === 0 ? "Start" : "Resume"}</Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (stage === "results") {
    const results = calculateResults()

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Eye className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Drill Completed!</h2>
        <p className="mb-6 text-muted-foreground">Here's how you performed on the Word Reveal drill.</p>

        <div className="mb-8 w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Results</CardTitle>
              <CardDescription>Word reveal performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Words Processed</p>
                  <p className="text-xl font-bold">{results.wordsProcessed}</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-xl font-bold">{results.timeSpentSeconds}s</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Effective Speed</p>
                  <p className="text-xl font-bold">{results.effectiveWpm} WPM</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Max Speed</p>
                  <p className="text-xl font-bold">{maxSpeed} WPM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Analysis</CardTitle>
              <CardDescription>What your results mean</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {results.effectiveWpm >= 500
                  ? "Excellent performance! Your visual processing speed is very high."
                  : results.effectiveWpm >= 400
                    ? "Great job! You're developing good visual processing speed."
                    : "Good start! Regular practice will help increase your visual processing speed."}
              </p>
              <p className="mt-2 text-sm">
                {chunkSize >= 2
                  ? "Reading multiple words at once is an advanced technique that will significantly boost your reading speed."
                  : "Try increasing to 2 or 3 words per flash as you get more comfortable with this exercise."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/drills">Back to Drills</Link>
          </Button>
          <Button onClick={handleReset}>Try Again</Button>
        </div>
      </div>
    )
  }

  return null
}
