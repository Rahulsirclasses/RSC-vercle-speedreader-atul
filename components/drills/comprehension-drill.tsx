"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Brain } from "lucide-react"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveDrillResult } from "@/lib/actions/drills"

// Types for the comprehension questions
interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

// Generate questions based on the passage
const generateQuestions = (passage: any): Question[] => {
  // In a real app, these would be generated dynamically or stored with the passage
  // For now, we'll create some generic questions that could apply to most passages
  return [
    {
      id: "q1",
      text: "What is the main topic of this passage?",
      options: [
        `The importance of ${passage.topic.toLowerCase()}`,
        `Recent developments in ${passage.topic.toLowerCase()}`,
        `Historical context of ${passage.topic.toLowerCase()}`,
        `Challenges related to ${passage.topic.toLowerCase()}`,
      ],
      correctAnswer: 1, // Index of the correct answer (0-based)
    },
    {
      id: "q2",
      text: "Which of the following best describes the author's tone?",
      options: ["Critical", "Informative", "Persuasive", "Enthusiastic"],
      correctAnswer: 1,
    },
    {
      id: "q3",
      text: "Based on the passage, which conclusion can be drawn?",
      options: [
        "The topic requires further research",
        "The topic is well-understood by experts",
        "The topic has significant implications for the future",
        "The topic is controversial among specialists",
      ],
      correctAnswer: 2,
    },
    {
      id: "q4",
      text: "What would be the most appropriate audience for this passage?",
      options: [
        "Elementary school students",
        "General adult readers",
        "Specialized professionals",
        "Academic researchers",
      ],
      correctAnswer: 1,
    },
    {
      id: "q5",
      text: "Which of the following would be the best title for this passage?",
      options: [
        `Understanding ${passage.topic}`,
        `The Future of ${passage.topic}`,
        `${passage.topic}: A Comprehensive Overview`,
        `${passage.topic} in Modern Society`,
      ],
      correctAnswer: 2,
    },
  ]
}

interface ComprehensionDrillProps {
  passage: any
}

export function ComprehensionDrill({ passage }: ComprehensionDrillProps) {
  const [stage, setStage] = useState<"intro" | "reading" | "questions" | "results">("intro")
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes for reading
  const [progress, setProgress] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [startTime, setStartTime] = useState(0)
  const [readingSpeed, setReadingSpeed] = useState(0)

  // Initialize questions when component mounts or passage changes
  useEffect(() => {
    setQuestions(generateQuestions(passage))
  }, [passage])

  useEffect(() => {
    if (stage !== "reading") return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStage("questions")
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
    const timeSpentMinutes = timeSpentMs / 60000 // Convert to minutes
    const wordsPerMinute = Math.round(passage.wordCount / timeSpentMinutes)
    setReadingSpeed(wordsPerMinute)
    setStage("questions")
  }

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleSubmitAnswers = async () => {
    setStage("results")

    let correct = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    const scorePercentage = Math.round((correct / questions.length) * 100)

    // In reading stage, readingSpeed is calculated when reading finishes and stored in state.
    // Ensure we have a valid time fallback just case, though timeRemaining handles this.
    try {
      await saveDrillResult({
        drillType: "comprehension-time",
        wpm: readingSpeed,
        score: scorePercentage,
        duration: 120 - timeRemaining,
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
    setTimeRemaining(120)
    setProgress(0)
    setAnswers({})
    setStartTime(0)
    setReadingSpeed(0)
    setQuestions(generateQuestions(passage))
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    }
  }

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Comprehension Under Time</h2>
        <p className="mb-6 text-muted-foreground">
          Read the passage within the time limit, then answer comprehension questions.
        </p>
        <div className="mb-8 rounded-lg bg-muted p-4 text-left">
          <h3 className="mb-2 font-medium">Instructions:</h3>
          <p>
            You'll have 2 minutes to read a passage about {passage.topic}. After the time is up or when you're ready,
            you'll answer 5 multiple-choice questions to test your comprehension.
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

  if (stage === "questions") {
    return (
      <div className="flex flex-col">
        <h3 className="mb-4 text-xl font-semibold">Comprehension Questions</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Answer the following questions based on the passage you just read.
        </p>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border p-4">
              <p className="mb-3 font-medium">
                {index + 1}. {question.text}
              </p>
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2 py-1">
                    <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                    <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        <Button
          className="mt-6"
          onClick={handleSubmitAnswers}
          disabled={Object.keys(answers).length < questions.length}
        >
          Submit Answers
        </Button>
      </div>
    )
  }

  if (stage === "results") {
    const score = calculateScore()

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Brain className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Drill Completed!</h2>
        <p className="mb-6 text-muted-foreground">Here's how you performed on the comprehension test.</p>

        <div className="mb-8 w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Results</CardTitle>
              <CardDescription>Comprehension score and reading speed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Comprehension</p>
                  <p className="text-xl font-bold">{score.percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {score.correct} of {score.total} correct
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Reading Speed</p>
                  <p className="text-xl font-bold">{readingSpeed} WPM</p>
                  <p className="text-xs text-muted-foreground">{passage.wordCount} words total</p>
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
                {score.percentage >= 80
                  ? "Excellent comprehension! You maintained good understanding while reading quickly."
                  : score.percentage >= 60
                    ? "Good comprehension. With practice, you can improve both speed and understanding."
                    : "You might want to slow down a bit to improve comprehension. Focus on understanding key points."}
              </p>
              <p className="mt-2 text-sm">
                {readingSpeed >= 400
                  ? "Your reading speed is excellent! Keep practicing to maintain this speed with high comprehension."
                  : readingSpeed >= 300
                    ? "Your reading speed is good. Regular practice will help you improve further."
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
