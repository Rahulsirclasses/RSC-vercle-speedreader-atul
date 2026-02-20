"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Clock, Play, Square, RefreshCw, TrendingUp, LineChartIcon as LineHeight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { saveDrillResult } from "@/lib/actions/drills"

interface SpeedSprintDrillProps {
  passage?: {
    title: string
    content: string
    wordCount: number
    difficulty: string
    category: string
  }
}

export function SpeedSprintDrill({ passage }: SpeedSprintDrillProps) {
  // Default passage if none is provided
  const defaultPassage = {
    title: "The Importance of Speed Reading",
    content:
      "Speed reading is a collection of reading methods which attempt to increase rates of reading without greatly reducing comprehension or retention. Methods include chunking and eliminating subvocalization. No absolute distinct boundary exists between normal reading and speed reading, and there is no distinct boundary for the definition of reading itself. Speed reading is characterized by analyzing trade-offs between measures of speed and comprehension, recognizing that different types of reading call for different speed and comprehension rates, and that those rates may be improved with practice. The many available speed reading training programs include books, videos, software, and seminars.",
    wordCount: 100,
    difficulty: "Intermediate",
    category: "Education",
  }

  // Use the provided passage or fall back to the default
  const activePassage = passage || defaultPassage

  const [targetWpm, setTargetWpm] = useState(300)
  const [isReading, setIsReading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentWpm, setCurrentWpm] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [enableRamping, setEnableRamping] = useState(true)
  const [startingWpm, setStartingWpm] = useState(200)
  const [maxWpm, setMaxWpm] = useState(550)
  const [autoScrollOffset, setAutoScrollOffset] = useState(0)
  const [underlineThickness, setUnderlineThickness] = useState(2) // Default thickness is 2px
  const [underlineColor, setUnderlineColor] = useState("primary") // Default color is primary
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const displayRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const highlightedWordRef = useRef<HTMLSpanElement | null>(null)

  // Process the passage content when it changes
  useEffect(() => {
    if (activePassage && activePassage.content) {
      // Split the content into words
      const contentWords = activePassage.content
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map((word) => word.trim())

      setWords(contentWords)
    } else {
      setWords([])
    }
  }, [activePassage])

  // Auto-scroll to keep the highlighted word visible
  useEffect(() => {
    if (isReading && highlightedWordRef.current && displayRef.current) {
      const wordElement = highlightedWordRef.current
      const container = displayRef.current

      // Get positions
      const wordRect = wordElement.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      // Calculate the bottom threshold (70% of container height)
      const bottomThreshold = containerRect.top + containerRect.height * 0.7

      // If the word is below the threshold, increase the scroll offset
      if (wordRect.bottom > bottomThreshold) {
        // Calculate how much to scroll - one line height (approximately)
        const lineHeight = 28 // Approximate line height in pixels
        setAutoScrollOffset((prev) => prev + lineHeight)
      }
    }
  }, [currentWordIndex, isReading])

  // Reset scroll offset when starting or resetting
  useEffect(() => {
    if (!isReading || currentWordIndex === 0) {
      setAutoScrollOffset(0)
    }
  }, [isReading, currentWordIndex])

  // Calculate the current WPM based on ramping settings and progress
  const calculateCurrentWpm = (wordIndex: number) => {
    if (!enableRamping) return targetWpm

    const progress = Math.min(wordIndex / (words.length - 1), 1)
    return Math.round(startingWpm + progress * (maxWpm - startingWpm))
  }

  // Start the reading timer
  useEffect(() => {
    if (isReading && words.length > 0) {
      startTimeRef.current = Date.now()
      setCurrentWordIndex(0)

      // Set initial WPM
      setCurrentWpm(enableRamping ? startingWpm : targetWpm)

      // Word display timer
      const updateWord = () => {
        const frameTime = Date.now()

        setCurrentWordIndex((prevIndex) => {
          const newIndex = prevIndex + 1

          // Update progress
          const newProgress = Math.min((newIndex / (words.length - 1)) * 100, 100)
          setProgress(newProgress)

          // Update current WPM based on ramping
          const newWpm = calculateCurrentWpm(newIndex)
          setCurrentWpm(newWpm)

          // Update elapsed time
          if (startTimeRef.current) {
            setElapsedTime(frameTime - startTimeRef.current)
          }

          // Check if reading is complete
          if (newIndex >= words.length) {
            handleComplete()
            return prevIndex // Keep the index at the last word
          }

          // Schedule the next word update with the new WPM
          const msPerWord = 60000 / newWpm
          timerRef.current = setTimeout(() => {
            requestAnimationFrame(updateWord)
          }, msPerWord)

          return newIndex
        })
      }

      // Start with the initial WPM
      const initialWpm = enableRamping ? startingWpm : targetWpm
      const msPerWord = 60000 / initialWpm
      timerRef.current = setTimeout(updateWord, msPerWord)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isReading, words, enableRamping, targetWpm, startingWpm, maxWpm])

  const handleStart = () => {
    if (words.length === 0) return

    setIsReading(true)
    setProgress(0)
    setElapsedTime(0)
    setIsComplete(false)
    setCurrentWordIndex(0)
    setAutoScrollOffset(0)
    setCurrentWpm(enableRamping ? startingWpm : targetWpm)
  }

  const handleStop = () => {
    setIsReading(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const handleComplete = async () => {
    setIsReading(false)
    setIsComplete(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Save the drill result to the database
    // The component tracks time in elapsedTime (ms) and sets WPM explicitly based on ramping.
    // If we're ramping, use the max reached. Otherwise use targetWpm.
    const finalWpm = enableRamping ? currentWpm : targetWpm
    const durationSeconds = Math.round(elapsedTime / 1000)

    try {
      await saveDrillResult({
        drillType: "speed-sprint",
        wpm: finalWpm,
        duration: durationSeconds,
        passageTitle: activePassage?.title,
        wordsRead: words.length
      })
    } catch (e) {
      console.error("Failed to save result", e)
    }
  }

  const handleReset = () => {
    setIsReading(false)
    setProgress(0)
    setElapsedTime(0)
    setIsComplete(false)
    setCurrentWordIndex(0)
    setAutoScrollOffset(0)
    setCurrentWpm(enableRamping ? startingWpm : targetWpm)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Group words into lines for better display
  const renderTextLines = () => {
    if (!words.length) return null

    // Calculate how many words to show per line based on container width
    // Using a higher number to fill more of the width
    const wordsPerLine = 18 // Increased from 12 to fill more horizontal space

    // Group words into lines
    const lines: string[][] = []
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine))
    }

    // Map color values to actual CSS colors
    const getUnderlineColor = () => {
      switch (underlineColor) {
        case "primary":
          return "hsl(var(--primary))"
        case "destructive":
          return "hsl(var(--destructive))"
        case "green-600":
          return "#16a34a"
        case "blue-600":
          return "#2563eb"
        case "amber-500":
          return "#f59e0b"
        case "purple-600":
          return "#9333ea"
        default:
          return "hsl(var(--primary))"
      }
    }

    return (
      <div
        className="flex flex-col gap-1 pb-10 w-full"
        style={{
          transform: `translateY(-${autoScrollOffset}px)`,
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="flex flex-wrap w-full justify-start">
            {line.map((word, wordIndex) => {
              const globalWordIndex = lineIndex * wordsPerLine + wordIndex
              const isCurrentWord = globalWordIndex === currentWordIndex

              return (
                <span
                  key={wordIndex}
                  ref={isCurrentWord ? highlightedWordRef : null}
                  className={`${wordIndex > 0 ? "ml-0.5" : ""} transition-all duration-200 ease-out py-0.5`}
                  style={
                    isCurrentWord
                      ? {
                        borderBottom: `${underlineThickness}px solid ${getUnderlineColor()}`,
                      }
                      : {}
                  }
                >
                  {word}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // Render the text with the current word highlighted
  const renderHighlightedText = () => {
    if (!isReading && !isComplete && progress === 0) {
      return (
        <div className="text-center text-muted-foreground">
          <p className="mb-2 text-lg">Set your target speed and press Start</p>
          <p className="text-sm">Words will be underlined one at a time at your selected speed</p>
        </div>
      )
    }

    return (
      <div className="w-full relative" ref={textContainerRef}>
        {renderTextLines()}
      </div>
    )
  }

  // If no passage content is available, show an error message
  if (!activePassage || !activePassage.content) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
        <h3 className="text-lg font-semibold">Error: No passage content available</h3>
        <p className="mt-2">Please try selecting a different passage or contact support if this issue persists.</p>
        <Button className="mt-4" asChild>
          <Link href="/drills">Back to Drills</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm dark:bg-zinc-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-base font-medium">
                Target Speed: {enableRamping ? `${startingWpm}-${maxWpm}` : targetWpm} WPM
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>{startingWpm}</span>
              <Slider
                value={enableRamping ? [startingWpm, maxWpm] : [targetWpm]}
                min={100}
                max={800}
                step={25}
                onValueChange={(value) => {
                  if (enableRamping) {
                    setStartingWpm(value[0])
                    setMaxWpm(value[1])
                  } else {
                    setTargetWpm(value[0])
                  }
                }}
                disabled={isReading}
                className="w-64"
              />
              <span>{enableRamping ? maxWpm : targetWpm}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-base font-medium">Speed Ramping:</span>
            </div>
            <Switch checked={enableRamping} onCheckedChange={setEnableRamping} disabled={isReading} />
          </div>

          {/* Underline Thickness Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <LineHeight className="h-5 w-5 text-muted-foreground" />
                      <span className="text-base font-medium">Underline Thickness:</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Adjust the thickness of the underline indicator</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="font-medium">{underlineThickness}px</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>1</span>
              <Slider
                value={[underlineThickness]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setUnderlineThickness(value[0])}
                disabled={isReading}
                className="w-32"
              />
              <span>5</span>
            </div>
          </div>

          {/* Underline Color Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-medium">Underline Color:</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Choose the color of the underline indicator</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup
              value={underlineColor}
              onValueChange={setUnderlineColor}
              className="flex flex-wrap gap-2"
              disabled={isReading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="primary" id="primary" className="border-primary" />
                <label htmlFor="primary" className="text-sm font-medium cursor-pointer">
                  Primary
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="destructive" id="destructive" className="border-destructive" />
                <label htmlFor="destructive" className="text-sm font-medium cursor-pointer">
                  Red
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="green-600" id="green" className="border-green-600" />
                <label htmlFor="green" className="text-sm font-medium cursor-pointer">
                  Green
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blue-600" id="blue" className="border-blue-600" />
                <label htmlFor="blue" className="text-sm font-medium cursor-pointer">
                  Blue
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="amber-500" id="amber" className="border-amber-500" />
                <label htmlFor="amber" className="text-sm font-medium cursor-pointer">
                  Amber
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="purple-600" id="purple" className="border-purple-600" />
                <label htmlFor="purple" className="text-sm font-medium cursor-pointer">
                  Purple
                </label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Elapsed Time</div>
                <div className="font-mono text-base font-medium">{formatTime(elapsedTime)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Speed</div>
                <div className="font-mono text-base font-medium">{currentWpm} WPM</div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isReading && !isComplete && (
                <Button onClick={handleStart}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              )}
              {isReading && (
                <Button variant="destructive" onClick={handleStop}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
              {(isComplete || (!isReading && progress > 0)) && (
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Text display area with highlighted word */}
      <div
        className="flex-1 flex items-start w-full rounded-lg border bg-card p-4 text-card-foreground shadow-sm dark:bg-zinc-900 overflow-hidden relative"
        ref={displayRef}
        style={{
          minHeight: "300px",
          maxHeight: "calc(100vh - 300px)",
          width: "100%",
        }}
      >
        {renderHighlightedText()}

        {/* Word counter - now in a fixed position at the bottom with background */}
        {(isReading || isComplete || progress > 0) && (
          <div className="absolute bottom-0 left-0 right-0 bg-card dark:bg-zinc-900 py-2 px-4 border-t text-center text-sm text-muted-foreground">
            Word {Math.min(currentWordIndex + 1, words.length)} of {words.length}
          </div>
        )}
      </div>

      {isComplete && (
        <div className="rounded-lg border bg-primary/10 p-4 text-card-foreground shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Reading Complete!</h3>
          <p className="mb-4">
            You read {words.length} words in {formatTime(elapsedTime)} at an average speed of {currentWpm} WPM.
            {enableRamping ? (
              <span className="ml-1">
                Your speed ramped from {startingWpm} to {maxWpm} WPM.
              </span>
            ) : currentWpm >= targetWpm ? (
              <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                Great job meeting your target speed!
              </span>
            ) : (
              <span className="ml-1">Your target was {targetWpm} WPM.</span>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild>
              <Link href="/drills">Back to Drills</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
