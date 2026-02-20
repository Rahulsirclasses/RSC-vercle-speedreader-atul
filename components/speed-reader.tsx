"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"

interface SpeedReaderProps {
  text: string
  wpm: number
  isPlaying: boolean
  mode: "normal" | "rsvp" | "highlight" | "flashing" | "focus"
  progress: number
  onProgressChange: (progress: number) => void
  chunkSize?: number
  onComplete?: () => void
}

export function SpeedReader({
  text,
  wpm,
  isPlaying,
  mode = "normal",
  progress,
  onProgressChange,
  chunkSize = 1,
  onComplete,
}: SpeedReaderProps) {
  const [currentPosition, setCurrentPosition] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [displayText, setDisplayText] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Safely split text into words
  useEffect(() => {
    try {
      if (typeof text === "string") {
        const wordArray = text.split(/\s+/).filter((word) => word.length > 0)
        setWords(wordArray)
        setDisplayText(text)
      } else {
        console.error("Text is not a string:", text)
        setWords([])
        setDisplayText("Error loading text")
      }
    } catch (error) {
      console.error("Error processing text:", error)
      setWords([])
      setDisplayText("Error processing text")
    }
  }, [text])

  // Update current position based on progress
  useEffect(() => {
    if (!isPlaying && words.length > 0) {
      const newPosition = Math.floor(progress * words.length)
      setCurrentPosition(newPosition)
    }
  }, [progress, words.length, isPlaying])

  // Handle reading logic
  useEffect(() => {
    if (words.length === 0) return

    if (isPlaying) {
      const msPerWord = 60000 / wpm

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        setCurrentPosition((prev) => {
          const next = prev + (chunkSize || 1)

          // Update progress
          const newProgress = next / words.length
          onProgressChange(Math.min(newProgress, 1))

          // Check if we've reached the end
          if (next >= words.length) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (onComplete) onComplete()
            return prev
          }

          return next
        })
      }, msPerWord)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [isPlaying, words.length, wpm, chunkSize, onProgressChange, onComplete])

  // Render different reading modes
  const renderContent = () => {
    try {
      if (words.length === 0) {
        return <p className="text-center text-muted-foreground">No text to display</p>
      }

      switch (mode) {
        case "rsvp":
        case "flashing":
          return (
            <div className="flex h-40 items-center justify-center">
              <p className="text-2xl font-medium">{currentPosition < words.length ? words[currentPosition] : ""}</p>
            </div>
          )

        case "highlight":
        case "focus":
          const beforeWords = words.slice(0, currentPosition).join(" ")
          const currentWord = words[currentPosition] || ""
          const afterWords = words.slice(currentPosition + 1).join(" ")

          return (
            <div className="prose max-w-none dark:prose-invert">
              <p>
                <span className="text-muted-foreground">{beforeWords} </span>
                <span className="bg-primary/20 font-bold">{currentWord}</span>
                <span className="text-muted-foreground"> {afterWords}</span>
              </p>
            </div>
          )

        case "normal":
        default:
          return (
            <div className="prose max-w-none dark:prose-invert">
              <p>{displayText}</p>
            </div>
          )
      }
    } catch (error) {
      console.error("Error rendering content:", error)
      return <p className="text-center text-red-500">Error displaying content</p>
    }
  }

  return <Card className="overflow-auto p-6">{renderContent()}</Card>
}
