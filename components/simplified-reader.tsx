"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { saveReadingSession } from "@/lib/actions/reading"

interface SimplifiedReaderProps {
  text: string
  wpm: number
}

export function SimplifiedReader({ text, wpm }: SimplifiedReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])

  // Safely split text into words on component mount
  useEffect(() => {
    try {
      if (typeof text === "string") {
        const wordArray = text.split(/\s+/).filter((word) => word.length > 0)
        setWords(wordArray)
      } else {
        console.error("Text is not a string:", text)
        setWords([])
      }
    } catch (error) {
      console.error("Error processing text:", error)
      setWords([])
    }
  }, [text])

  // Handle play/pause with dynamic WPM
  useEffect(() => {
    if (!isPlaying || words.length === 0) return

    const intervalTime = 60000 / wpm // Convert WPM to milliseconds per word
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= words.length - 1) {
          setIsPlaying(false)

          // Trigger save action when reaching the end
          const durationSeconds = Math.round(words.length * 60 / wpm)
          saveReadingSession({
            startWpm: wpm,
            endWpm: wpm,
            durationSeconds,
            wordsRead: words.length,
            wasRamping: false
          }).catch(e => console.error("Failed to save reading session:", e))

          return prev
        }
        return prev + 1
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [isPlaying, words, wpm]) // Include wpm in dependencies for real-time updates

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentWordIndex(0)
  }

  // Simple progress calculation
  const progress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex h-48 items-center justify-center">
          <div className="text-center">
            <p className="text-5xl font-bold text-center min-h-[4rem] flex items-center justify-center mb-4">
              {words.length > 0 && currentWordIndex < words.length ? words[currentWordIndex] : "Ready to start"}
            </p>
            <div className="text-sm text-muted-foreground">
              Focus on the word above and let your eyes adapt to the changing pace
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Word {currentWordIndex + 1} of {words.length}
            </span>
            <span className="font-medium">{wpm} WPM</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button onClick={handlePlayPause} size="lg" className="px-8">
          {isPlaying ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isPlaying ? "Pause Reading" : "Start Reading"}
        </Button>
        <Button variant="outline" onClick={handleReset} size="lg" className="px-6 bg-transparent">
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>
    </div>
  )
}

// Add default export for dynamic import
export default SimplifiedReader
