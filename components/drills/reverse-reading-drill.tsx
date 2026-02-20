"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Rewind } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { saveDrillResult } from "@/lib/actions/drills"

interface ReverseReadingDrillProps {
  passage: any
}

export function ReverseReadingDrill({ passage }: ReverseReadingDrillProps) {
  const [stage, setStage] = useState<"intro" | "reading" | "quiz" | "results">("intro")
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes for reading
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [sentences, setSentences] = useState<string[]>([])
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [quizQuestion, setQuizQuestion] = useState<string>("")
  const [quizOptions, setQuizOptions] = useState<string[]>([])
  const [correctAnswer, setCorrectAnswer] = useState<string>("")

  // Split passage into sentences
  useEffect(() => {
    if (passage && passage.text) {
      // Split by sentence endings and filter out empty strings
      const sentenceArray =
        passage.text
          .match(/[^.!?]+[.!?]+/g)
          ?.filter(Boolean)
          .map((s: string) => s.trim()) || []

      setSentences(sentenceArray.reverse()) // Reverse the sentences

      // Generate a simple comprehension question
      generateQuiz(sentenceArray)
    }
  }, [passage])

  // Generate a simple quiz about the passage
  const generateQuiz = (originalSentences: string[]) => {
    // For simplicity, we'll ask about the first (original) sentence
    if (originalSentences.length > 0) {
      const firstSentence = originalSentences[0]
      setQuizQuestion("Which of the following was the first sentence of the passage?")
      setCorrectAnswer(firstSentence)

      // Create options including the correct answer and some distractors
      const options = [firstSentence]

      // Add some incorrect options (other sentences or variations)
      if (originalSentences.length > 2) {
        options.push(originalSentences[Math.floor(originalSentences.length / 2)])
      }

      if (originalSentences.length > 4) {
        options.push(originalSentences[originalSentences.length - 1])
      }

      // Add one more option that's made up
      options.push(`This sentence is related to ${passage.topic} but wasn't in the original passage.`)

      // Shuffle the options
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5)
      setQuizOptions(shuffledOptions)
    }
  }

  useEffect(() => {
    if (stage !== "reading") return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setEndTime(Date.now())
          setStage("quiz")
          return 0
        }
        return prev - 1
      })

      // Update progress
      setProgress((prevProgress) => {
        return 100 - (timeRemaining / 300) * 100
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
    setEndTime(Date.now())
    setStage("quiz")
  }

  const handleAnswerSelect = (answer: string) => {
    setQuizAnswer(answer)
    setIsCorrect(answer === correctAnswer)
  }

  const handleSubmitQuiz = async () => {
    setStage("results")

    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000
    const readingSpeed = Math.round(passage.wordCount / timeSpentMinutes)
    const comprehensionScore = isCorrect ? 100 : 0

    try {
      await saveDrillResult({
        drillType: "reverse-reading",
        wpm: readingSpeed,
        score: comprehensionScore,
        duration: Math.round(timeSpentMs / 1000),
        passageTitle: passage?.title,
        wordsRead: passage?.wordCount
      })
    } catch (e) {
      console.error("Failed to save result", e)
    }
  }

  const handleReset = () => {
    // Reset all state to initial values
    setStage("intro")
    setTimeRemaining(300)
    setProgress(0)
    setStartTime(0)
    setEndTime(0)
    setQuizAnswer(null)
    setIsCorrect(null)

    // Re-process the passage
    if (passage && passage.text) {
      const sentenceArray =
        passage.text
          .match(/[^.!?]+[.!?]+/g)
          ?.filter(Boolean)
          .map((s: string) => s.trim()) || []

      setSentences(sentenceArray.reverse())
      generateQuiz(sentenceArray)
    }
  }

  const calculateResults = () => {
    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000 // Convert to minutes
    const readingSpeed = Math.round(passage.wordCount / timeSpentMinutes)

    return {
      readingSpeed,
      comprehensionScore: isCorrect ? 100 : 0,
      timeSpent: Math.round(timeSpentMs / 1000),
    }
  }

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Rewind className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Reverse Reading</h2>
        <p className="mb-6 text-muted-foreground">
          Read the sentences in reverse order, from the last sentence to the first.
        </p>
        <div className="mb-8 rounded-lg bg-muted p-4 text-left">
          <h3 className="mb-2 font-medium">Instructions:</h3>
          <p>
            This drill presents a passage with sentences in reverse order. Reading backwards helps break fixation habits
            and forces your brain to process each sentence independently. After reading, you'll answer a simple question
            to test your comprehension.
          </p>
        </div>
        <Button size="lg" onClick={handleStartReading}>
          Start Drill
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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">{passage.title}</h3>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Reading in Reverse
            </Badge>
          </div>
          <div className="prose max-w-none dark:prose-invert">
            {sentences.map((sentence, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                <span className="mr-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                  {sentences.length - index}
                </span>
                {sentence}
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stage === "quiz") {
    return (
      <div className="flex flex-col">
        <h3 className="mb-4 text-xl font-semibold">Comprehension Check</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Answer this question to check your understanding of the passage.
        </p>

        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">{quizQuestion}</h4>
          <div className="space-y-3">
            {quizOptions.map((option, index) => (
              <div
                key={index}
                className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${quizAnswer === option
                  ? isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-red-500 bg-red-50 dark:bg-red-950/20"
                  : ""
                  }`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        <Button className="mt-6" onClick={handleSubmitQuiz} disabled={!quizAnswer}>
          Submit Answer
        </Button>
      </div>
    )
  }

  if (stage === "results") {
    const results = calculateResults()

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Rewind className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Drill Completed!</h2>
        <p className="mb-6 text-muted-foreground">Here's how you performed on the Reverse Reading drill.</p>

        <div className="mb-8 w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Results</CardTitle>
              <CardDescription>Reading performance and comprehension</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Reading Speed</p>
                  <p className="text-xl font-bold">{results.readingSpeed} WPM</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Comprehension</p>
                  <p className="text-xl font-bold">{results.comprehensionScore}%</p>
                </div>
                <div className="col-span-2 rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-xl font-bold">{formatTime(results.timeSpent)}</p>
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
                {isCorrect
                  ? "Great job! You were able to maintain comprehension even when reading in reverse order."
                  : "Reading in reverse can be challenging. Try to focus on understanding each sentence independently."}
              </p>
              <p className="mt-2 text-sm">
                Reverse reading helps break fixation habits and forces your brain to process each sentence on its own
                merits. This can improve your ability to extract meaning efficiently when reading normally.
              </p>
              <p className="mt-2 text-sm">
                {results.readingSpeed >= 200
                  ? "Your reading speed while reading in reverse is very good!"
                  : "With practice, your speed at processing text in unusual orders will improve."}
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
