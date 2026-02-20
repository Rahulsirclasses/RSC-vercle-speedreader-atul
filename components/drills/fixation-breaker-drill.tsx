"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, MoveHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { saveDrillResult } from "@/lib/actions/drills"

interface FixationBreakerDrillProps {
  passage: any
}

export function FixationBreakerDrill({ passage }: FixationBreakerDrillProps) {
  const [stage, setStage] = useState<"intro" | "reading" | "quiz" | "results">("intro")
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes for reading
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [leftColumn, setLeftColumn] = useState<string[]>([])
  const [rightColumn, setRightColumn] = useState<string[]>([])
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{
      question: string
      options: string[]
      correctAnswer: string
    }>
  >([])

  // Process passage into columns
  useEffect(() => {
    if (passage && passage.text) {
      // Split by sentence endings and filter out empty strings
      const sentences =
        passage.text
          .match(/[^.!?]+[.!?]+/g)
          ?.filter(Boolean)
          .map((s: string) => s.trim()) || []

      // Divide sentences into two columns
      const left: string[] = []
      const right: string[] = []

      sentences.forEach((sentence: any, index: number) => {
        if (index % 2 === 0) {
          left.push(sentence)
        } else {
          right.push(sentence)
        }
      })

      setLeftColumn(left)
      setRightColumn(right)

      // Generate quiz questions
      generateQuizQuestions(sentences)
    }
  }, [passage])

  // Generate quiz questions about the passage
  const generateQuizQuestions = (sentences: string[]) => {
    if (sentences.length < 3) return

    // Create 3 simple questions about the content
    const questions = [
      {
        question: "Which of the following sentences appeared in the passage?",
        options: [
          sentences[Math.floor(Math.random() * sentences.length)],
          `This sentence about ${passage.topic} was not in the passage.`,
          `This is a made-up sentence related to ${passage.topic}.`,
        ],
        correctAnswer: sentences[Math.floor(Math.random() * sentences.length)],
      },
      {
        question: "What was the main topic of the passage?",
        options: [passage.topic, "Ancient History", "Modern Technology", "Environmental Science"],
        correctAnswer: passage.topic,
      },
      {
        question: "How would you describe the difficulty level of this passage?",
        options: ["Beginner", "Intermediate", "Advanced", "Expert"],
        correctAnswer: passage.difficulty,
      },
    ]

    // Ensure the correct answer is in the options
    questions.forEach((q) => {
      if (!q.options.includes(q.correctAnswer)) {
        q.options[0] = q.correctAnswer
      }

      // Shuffle options
      q.options.sort(() => Math.random() - 0.5)
    })

    setQuizQuestions(questions)
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
        return 100 - (timeRemaining / 180) * 100
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
  }

  const handleSubmitQuiz = async () => {
    setStage("results")

    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000
    const readingSpeed = Math.round(passage.wordCount / timeSpentMinutes)

    let correctAnswers = 0
    if (quizAnswer === quizQuestions[0].correctAnswer) {
      correctAnswers++
    }
    const comprehensionScore = Math.round((correctAnswers / 1) * 100)

    try {
      await saveDrillResult({
        drillType: "fixation-breaker",
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
    setTimeRemaining(180)
    setProgress(0)
    setStartTime(0)
    setEndTime(0)
    setQuizAnswer(null)

    // Re-process the passage
    if (passage && passage.text) {
      const sentences =
        passage.text
          .match(/[^.!?]+[.!?]+/g)
          ?.filter(Boolean)
          .map((s: string) => s.trim()) || []

      // Divide sentences into two columns
      const left: string[] = []
      const right: string[] = []

      sentences.forEach((sentence: any, index: number) => {
        if (index % 2 === 0) {
          left.push(sentence)
        } else {
          right.push(sentence)
        }
      })

      setLeftColumn(left)
      setRightColumn(right)
      generateQuizQuestions(sentences)
    }
  }

  const calculateResults = () => {
    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000 // Convert to minutes
    const readingSpeed = Math.round(passage.wordCount / timeSpentMinutes)

    // Calculate comprehension score
    let correctAnswers = 0
    if (quizAnswer === quizQuestions[0].correctAnswer) {
      correctAnswers++
    }

    const comprehensionScore = Math.round((correctAnswers / 1) * 100)

    return {
      readingSpeed,
      comprehensionScore,
      timeSpent: Math.round(timeSpentMs / 1000),
    }
  }

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MoveHorizontal className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Fixation Breaker</h2>
        <p className="mb-6 text-muted-foreground">
          Read text arranged in staggered columns to train your eyes to move efficiently.
        </p>
        <div className="mb-8 rounded-lg bg-muted p-4 text-left">
          <h3 className="mb-2 font-medium">Instructions:</h3>
          <p>
            This drill presents a passage with sentences arranged in two columns. Reading in this format helps break
            fixation habits and trains your eyes to move more efficiently across text. After reading, you'll answer a
            simple question to test your comprehension.
          </p>
          <p className="mt-2">
            Try to read smoothly from the left column to the right column, maintaining a steady pace and comprehension.
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
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Staggered Columns
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              {leftColumn.map((sentence: any, index: number) => (
                <p key={`left-${index}`} className="text-sm">
                  {sentence}
                </p>
              ))}
            </div>
            <div className="space-y-4 pt-8">
              {rightColumn.map((sentence: any, index: number) => (
                <p key={`right-${index}`} className="text-sm">
                  {sentence}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "quiz") {
    const currentQuestion = quizQuestions[0]

    return (
      <div className="flex flex-col">
        <h3 className="mb-4 text-xl font-semibold">Comprehension Check</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Answer this question to check your understanding of the passage.
        </p>

        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">{currentQuestion?.question}</h4>
          <RadioGroup value={quizAnswer || ""} onValueChange={handleAnswerSelect}>
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button className="mt-6" onClick={handleSubmitQuiz} disabled={!quizAnswer}>
          Submit Quiz
        </Button>
      </div>
    )
  }

  if (stage === "results") {
    const { readingSpeed, comprehensionScore, timeSpent } = calculateResults()

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Results</h2>
        <Card className="w-[80%]">
          <CardHeader>
            <CardTitle>Reading Performance</CardTitle>
            <CardDescription>Here's how you did on this drill.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-semibold">Reading Speed:</p>
                <p className="text-muted-foreground">{readingSpeed} words per minute</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Comprehension:</p>
                <p className="text-muted-foreground">{comprehensionScore}%</p>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">Time Spent:</p>
              <p className="text-muted-foreground">{timeSpent} seconds</p>
            </div>
          </CardContent>
        </Card>
        <Button className="mt-6" onClick={handleReset}>
          Try Again
        </Button>
      </div>
    )
  }

  return null
}
