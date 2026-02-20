"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, EyeOff } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { saveDrillResult } from "@/lib/actions/drills"

interface BlindSpotDrillProps {
  passage: any
}

export function BlindSpotDrill({ passage }: BlindSpotDrillProps) {
  const [stage, setStage] = useState<"intro" | "reading" | "quiz" | "results">("intro")
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes for reading
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [processedText, setProcessedText] = useState<Array<{ word: string; blurred: boolean }>>([])
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{
      question: string
      options: string[]
      correctAnswer: string
    }>
  >([])
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set())
  const [blurredWordCount, setBlurredWordCount] = useState(0)

  // Process passage text
  useEffect(() => {
    if (passage && passage.text) {
      // Split text into words
      const words = passage.text.split(/\s+/)

      // Process each word
      const processed = words.map((word: string, index: number) => {
        // Determine if this word should be blurred (about 15-20% of words)
        // Don't blur very short words, punctuation, or important keywords
        const shouldBlur =
          word.length > 3 && !word.match(/^[.,;:!?]/) && !isImportantKeyword(word) && Math.random() < 0.18 // 18% chance of blurring

        if (shouldBlur) {
          setBlurredWordCount((prev) => prev + 1)
        }

        return {
          word,
          blurred: shouldBlur,
        }
      })

      setProcessedText(processed)

      // Generate quiz questions
      generateQuizQuestions(words, processed)
    }
  }, [passage])

  // Check if a word is an important keyword (simplified implementation)
  const isImportantKeyword = (word: string): boolean => {
    const lowerWord = word.toLowerCase().replace(/[.,;:!?]$/, "")

    // Don't blur topic-related words
    if (passage.topic && lowerWord.includes(passage.topic.toLowerCase())) {
      return true
    }

    // Don't blur common important words
    const importantWords = ["important", "significant", "key", "main", "critical", "essential"]
    return importantWords.includes(lowerWord)
  }

  // Generate quiz questions about the passage
  const generateQuizQuestions = (words: string[], processed: Array<{ word: string; blurred: boolean }>) => {
    // Find some blurred words to ask about
    const blurredWords = processed.filter((item) => item.blurred).map((item) => item.word.replace(/[.,;:!?]$/, ""))

    // Find some non-blurred words to use as alternative options
    const nonBlurredWords = processed
      .filter((item) => !item.blurred && item.word.length > 3)
      .map((item) => item.word.replace(/[.,;:!?]$/, ""))
      .slice(0, 10) // Take up to 10 non-blurred words

    if (blurredWords.length < 3 || nonBlurredWords.length < 2) return

    // Create questions about the blurred words
    const questions = [
      {
        question: "Which of these words was blurred in the passage?",
        options: [blurredWords[0], nonBlurredWords[0], nonBlurredWords[1]],
        correctAnswer: blurredWords[0],
      },
      {
        question: "What was the main topic of the passage?",
        options: [passage.topic, "Ancient History", "Modern Technology", "Environmental Science"],
        correctAnswer: passage.topic,
      },
      {
        question: "How many words were blurred in the passage?",
        options: ["Less than 5", "Between 5 and 15", "Between 15 and 30", "More than 30"],
        correctAnswer:
          blurredWordCount < 5
            ? "Less than 5"
            : blurredWordCount < 15
              ? "Between 5 and 15"
              : blurredWordCount < 30
                ? "Between 15 and 30"
                : "More than 30",
      },
    ]

    // Shuffle options
    questions.forEach((q) => {
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

  const handleWordHover = (index: number) => {
    if (processedText[index]?.blurred) {
      setRevealedWords((prev) => new Set(prev).add(index))
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setQuizAnswer(answer)
  }

  const handleSubmitQuiz = async () => {
    setStage("results")

    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000
    const readingSpeed = Math.round(passage.wordCount / timeSpentMinutes)
    const comprehensionScore = quizAnswer === quizQuestions[0]?.correctAnswer ? 100 : 0

    try {
      await saveDrillResult({
        drillType: "blind-spot",
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
    setRevealedWords(new Set())
    setBlurredWordCount(0)
    setProcessedText([])

    // Re-process the passage to generate new blurred words
    if (passage && passage.text) {
      const words = passage.text.split(/\s+/)
      const newBlurredWordCount = 0

      const processed = words.map((word: string, index: number) => {
        const shouldBlur =
          word.length > 3 && !word.match(/^[.,;:!?]/) && !isImportantKeyword(word) && Math.random() < 0.18

        return {
          word,
          blurred: shouldBlur,
        }
      })

      setProcessedText(processed)
      generateQuizQuestions(words, processed)
    }
  }

  const calculateResults = () => {
    const timeSpentMs = endTime - startTime
    const timeSpentMinutes = timeSpentMs / 60000 // Convert to minutes
    const readingSpeed = Math.round(passage.wordCount / timeSpentMinutes)

    // Calculate prediction score based on revealed words
    const predictionScore = Math.round(((blurredWordCount - revealedWords.size) / Math.max(blurredWordCount, 1)) * 100)

    // Calculate comprehension score (simplified)
    const comprehensionScore = quizAnswer === quizQuestions[0]?.correctAnswer ? 100 : 0

    return {
      readingSpeed,
      predictionScore,
      comprehensionScore,
      revealedWords: revealedWords.size,
      totalBlurredWords: blurredWordCount,
      timeSpent: Math.round(timeSpentMs / 1000),
    }
  }

  if (stage === "intro") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <EyeOff className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Blind Spot Blur</h2>
        <p className="mb-6 text-muted-foreground">
          Read text with blurred words, predicting their meaning from context.
        </p>
        <div className="mb-8 rounded-lg bg-muted p-4 text-left">
          <h3 className="mb-2 font-medium">Instructions:</h3>
          <p>
            This drill presents a passage with some words blurred out. Try to read the passage and infer the blurred
            words from context. This trains your brain to predict and fill in information, a key skill for speed
            reading.
          </p>
          <p className="mt-2">
            If you need to see a blurred word, hover over it to reveal it, but try to use this sparingly. Your goal is
            to understand the passage while revealing as few words as possible.
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
            <Badge
              variant="outline"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
            >
              Blind Spot Blur
            </Badge>
          </div>

          <TooltipProvider>
            <div className="prose max-w-none dark:prose-invert">
              <div className="leading-relaxed">
                {processedText.map((item, index) =>
                  item.blurred ? (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <span
                          className={`cursor-help transition-all duration-300 ${revealedWords.has(index) ? "" : "blur-sm"
                            }`}
                          onMouseEnter={() => handleWordHover(index)}
                        >
                          {item.word}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>Hover to reveal</span>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span key={index}>{item.word} </span>
                  ),
                )}
              </div>
            </div>
          </TooltipProvider>
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
          <EyeOff className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Drill Completed!</h2>
        <p className="mb-6 text-muted-foreground">Here's how you performed on the Blind Spot Blur drill.</p>

        <div className="mb-8 w-full max-w-md space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Results</CardTitle>
              <CardDescription>Reading performance and prediction ability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Reading Speed</p>
                  <p className="text-xl font-bold">{results.readingSpeed} WPM</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Prediction Score</p>
                  <p className="text-xl font-bold">{results.predictionScore}%</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Words Revealed</p>
                  <p className="text-xl font-bold">
                    {results.revealedWords}/{results.totalBlurredWords}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Comprehension</p>
                  <p className="text-xl font-bold">{results.comprehensionScore}%</p>
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
                {results.predictionScore >= 80
                  ? "Excellent prediction skills! You were able to infer most blurred words from context."
                  : results.predictionScore >= 50
                    ? "Good prediction skills. With practice, you'll get better at inferring words from context."
                    : "You revealed many of the blurred words. Try to use context clues to infer meaning next time."}
              </p>
              <p className="mt-2 text-sm">
                The Blind Spot Blur drill trains your brain to predict and fill in information, which is essential for
                speed reading. By strengthening this skill, you'll be able to read faster while maintaining
                comprehension.
              </p>
              <p className="mt-2 text-sm">
                {results.comprehensionScore >= 100
                  ? "Your comprehension was excellent despite the blurred words!"
                  : "Try to maintain comprehension even when some words are missing or unclear."}
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
