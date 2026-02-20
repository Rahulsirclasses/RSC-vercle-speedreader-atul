"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { getRunningWordsPassage } from "@/lib/passages"
import { Pause, Play, RotateCcw } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { saveDrillResult } from "@/lib/actions/drills"

export function RunningWordsDrill() {
  const [passage, setPassage] = useState<string>("")
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [wpm, setWpm] = useState(200)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Grid positions: 0-8 (3x3 grid)
  // 0 1 2
  // 3 4 5
  // 6 7 8

  useEffect(() => {
    const passageData = getRunningWordsPassage()
    const passageText = passageData.content
    setPassage(passageText)
    setWords(passageText.split(/\s+/))
  }, [])

  useEffect(() => {
    if (isPlaying && !isComplete) {
      const speed = 60000 / wpm // milliseconds per word

      const id = setInterval(() => {
        setCurrentWordIndex((prevIndex) => {
          const nextIndex = prevIndex + 1

          if (nextIndex >= words.length) {
            setIsPlaying(false)
            setIsComplete(true)

            saveDrillResult({
              drillType: "running-words",
              wpm: wpm,
              duration: Math.round(words.length * 60 / wpm),
              passageTitle: "Running Words Practice",
              wordsRead: words.length
            }).catch(e => console.error("Failed to save result", e))

            return prevIndex
          }

          // Update position (0-8) in 3x3 grid
          setCurrentPosition((prevPosition) => (prevPosition + 1) % 9)

          return nextIndex
        })
      }, speed)

      intervalRef.current = id

      return () => {
        if (id) clearInterval(id)
      }
    }
  }, [isPlaying, isComplete, words.length, wpm])

  const handlePlayPause = () => {
    if (isComplete) {
      // Restart if complete
      setCurrentWordIndex(0)
      setCurrentPosition(0)
      setIsComplete(false)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }

    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setCurrentWordIndex(0)
    setCurrentPosition(0)
    setIsPlaying(false)
    setIsComplete(false)
    intervalRef.current = null
  }

  const getCurrentWord = () => {
    if (currentWordIndex < words.length) {
      return words[currentWordIndex]
    }
    return ""
  }

  const getPositionClass = (position: number) => {
    return position === currentPosition ? "bg-muted" : ""
  }

  const renderCell = (position: number) => {
    if (position === currentPosition) {
      return getCurrentWord()
    }
    return ""
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <Card
            key={index}
            className={`flex h-24 items-center justify-center p-4 text-center text-lg transition-all duration-200 ${getPositionClass(index)}`}
          >
            {renderCell(index)}
          </Card>
        ))}
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePlayPause} disabled={words.length === 0}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} disabled={currentWordIndex === 0 && !isPlaying}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {currentWordIndex}/{words.length} words
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Speed: {wpm} WPM</span>
          </div>
          <Slider
            value={[wpm]}
            min={100}
            max={500}
            step={10}
            onValueChange={(value) => setWpm(value[0])}
            disabled={isPlaying}
          />
        </div>
      </div>
    </div>
  )
}
