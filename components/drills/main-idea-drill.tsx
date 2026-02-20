"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Lightbulb } from "lucide-react"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { saveDrillResult } from "@/lib/actions/drills"

// Generate summaries for the passage
const generateSummaries = (passage: any): { text: string; isCorrect: boolean }[] => {
  // In a real app, these would be generated with AI or stored with the passage
  // For now, we'll create one correct summary and three incorrect ones

  const correctSummary = `This passage provides an overview of ${passage.topic}, discussing its key aspects, implications, and importance in today's context.`

  const incorrectSummaries = [
    `This passage primarily focuses on the historical development of ${passage.topic}, tracing its evolution through different time periods.`,
    `This passage presents a critical analysis of common misconceptions about ${passage.topic} and offers alternative perspectives.`,
    `This passage examines the relationship between ${passage.topic} and various socioeconomic factors, highlighting regional differences.`,
  ]

  // Combine and shuffle
  const allSummaries = [
    { text: correctSummary, isCorrect: true },
    ...incorrectSummaries.map((text) => ({ text, isCorrect: false })),
  ]

  // Fisher-Yates shuffle algorithm
  for (let i = allSummaries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[allSummaries[i], allSummaries[j]] = [allSummaries[j], allSummaries[i]]
  }

  return allSummaries
}

interface MainIdeaDrillProps {
  passage: any
}

export function MainIdeaDrill({ passage }: MainIdeaDrillProps) {
  const [stage, setStage] = useState<"intro" | "reading" | "matching" | "results">("intro")
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes for reading
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [readingSpeed, setReadingSpeed] = useState(0)
  const [readingDurationMs, setReadingDurationMs] = useState(0)
  const [selectedSummary, setSelectedSummary] = useState<number | null>(null)
  const [summaries, setSummaries] = useState<{ text: string; isCorrect: boolean }[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Generate summaries when passage changes
  useEffect(() => {
    if (passage) {
      setSummaries(generateSummaries(passage))
    }
  }, [passage])

  useEffect(() => {
    if (stage !== "reading") return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStage("matching")
          return 0
        }
        return prev - 1
      })

      // Update progress
      setProgress((prevProgress) => {
        return 100 - (timeRemaining / 120) * 100
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [stage, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartReading = () => {
    setStage("reading")
    setStartTime(Date.now())
  }

  const handleFinishReading = () => {
    const endTime = Date.now()
    const timeSpentMs = endTime - startTime
    setReadingDurationMs(timeSpentMs)
    const timeSpentMinutes = timeSpentMs / 60000 // Convert to minutes
    const wordsPerMinute = Math.round(passage.wordCount / timeSpentMinutes)
    setReadingSpeed(wordsPerMinute)
    setStage("matching")
  }

  const handleSummarySelect = (index: number) => {
    setSelectedSummary(index)
  }

  const handleSubmit = async () => {
    if (selectedSummary !== null) {
      const isAnsCorrect = summaries[selectedSummary].isCorrect
      setIsCorrect(isAnsCorrect)

      const fallbackMs = Date.now() - (startTime || Date.now())
      const timeSpentMs = readingDurationMs > 0 ? readingDurationMs : fallbackMs

      try {
        await saveDrillResult({
          drillType: "main-idea",
          wpm: readingSpeed,
          score: isAnsCorrect ? 100 : 0,
          duration: Math.round(timeSpentMs / 1000),
          passageTitle: passage?.title,
          wordsRead: passage?.wordCount
        })
      } catch (e) {
        console.error("Failed to save result", e)
      }

      setTimeout(() => {
        setStage("results")
      }, 1500)
    }
  }

  const handleReset = () => {
    // Reset all state to initial values
    setStage("intro")
    setTimeRemaining(120)
    setProgress(0)
    setStartTime(0)
    setReadingSpeed(0)
    setSelectedSummary(null)
    setIsCorrect(null)
    setSummaries(generateSummaries(passage))
  }

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Main Idea Match</h2>
        <p className="mb-6 text-muted-foreground">
          Read the passage and identify the summary that best captures the main idea.
        </p>
        <div className="mb-8 rounded-lg bg-muted p-4 text-left">
          <h3 className="mb-2 font-medium">Instructions:</h3>
          <p>
            You'll have 2 minutes to read a passage about {passage.topic}. After reading, you'll be presented with four
            possible summaries. Select the one that best represents the main idea of the passage.
          </p>
        </div>
        <Button size="lg" onClick={handleStartReading}>
          Start Reading
        </Button>
      </div>
    )
  }

  if (stage === "reading") {
    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleFinishReading}>
            I'm Done Reading
          </Button>
        </div>
        <Progress value={progress} className="mb-6" />
        <div className="flex-1 rounded-lg border p-6">
          <h3 className="mb-4 text-xl font-semibold">{passage.title}</h3>
          <div className="prose max-w-none dark:prose-invert">
            <p className="leading-relaxed">{passage.text}</p>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "matching") {
    return (
      <div className="flex flex-col">
        <h3 className="mb-4 text-xl font-semibold">Select the Main Idea</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Choose the summary that best captures the main idea of the passage you just read.
        </p>

        <RadioGroup value={selectedSummary?.toString()} onValueChange={(value) => handleSummarySelect(Number(value))}>
          <div className="space-y-4">
            {summaries.map((summary, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 transition-colors ${isCorrect !== null
                  ? summary.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : selectedSummary === index
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : ""
                  : ""
                  }`}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value={index.toString()} id={`summary-${index}`} className="mt-1" />
                  <Label htmlFor={`summary-${index}`} className="flex-1 cursor-pointer">
                    {summary.text}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>

        <Button className="mt-6" onClick={handleSubmit} disabled={selectedSummary === null || isCorrect !== null}>
          Submit Answer
        </Button>
      </div>
    )
  }

  if (stage === "results") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Lightbulb className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Drill Completed!</h2>
        <p className="mb-6 text-muted-foreground">Here's how you performed on the Main Idea Match drill.</p>

        <div className="mb-8 w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Results</CardTitle>
              <CardDescription>Main idea identification and reading speed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Main Idea</p>
                  <p className="text-xl font-bold">{isCorrect ? "Correct" : "Incorrect"}</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Reading Speed</p>
                  <p className="text-xl font-bold">{readingSpeed} WPM</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-medium">The correct main idea was:</h4>
                <p className="rounded-lg bg-green-50 p-3 text-sm dark:bg-green-950/20">
                  {summaries.find((s) => s.isCorrect)?.text}
                </p>
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
                {isCorrect
                  ? "Great job identifying the main idea! This skill is crucial for effective reading comprehension and retention."
                  : "Identifying the main idea can be challenging. Try focusing on the overall theme rather than specific details."}
              </p>
              <p className="mt-2 text-sm">
                {readingSpeed >= 400
                  ? "Your reading speed is excellent! The key is to maintain this speed while still grasping the main ideas."
                  : readingSpeed >= 300
                    ? "Your reading speed is good. With practice, you can improve further while maintaining comprehension."
                    : "Your reading speed has room for improvement. Try the Speed Sprint drill to increase your pace."}
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
