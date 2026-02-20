"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Pause, Play, RotateCcw, Settings, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getRunningWordsPassage } from "@/lib/passages"

export default function RunningWordsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [wpm, setWpm] = useState(200)
  const [currentPosition, setCurrentPosition] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Get passage from the library
  useEffect(() => {
    async function setPassage() {
      try {
        const selectedPassage = await getRandomPassage();
        if (!selectedPassage) {
          setPassage(fallbackPassage);
          setIsLoading(false);
          return;
        }
        
        const formattedPassage = {
          id: selectedPassage._id,
          title: selectedPassage.title,
          text: selectedPassage.content,
          content: selectedPassage.content,
          topic: selectedPassage.category,
          category: selectedPassage.category,
          difficulty: selectedPassage.difficulty,
          wordCount: selectedPassage.wordCount,
          estimatedTime: selectedPassage.estimatedTime,
        }
        setPassage(formattedPassage);
      } catch (error) {
        console.error("Error getting passage:", error);
        setPassage(fallbackPassage);
      }
      setIsLoading(false);
    }
    setPassage();
  }, [])

  // Calculate the delay between words based on WPM
  const getDelay = () => {
    return 60000 / wpm
  }

  // Start the drill
  const startDrill = () => {
    if (isComplete) {
      resetDrill()
    }

    setIsRunning(true)

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up the interval to show words
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1

        if (nextIndex >= words.length) {
          // End of passage
          clearInterval(intervalRef.current!)
          setIsRunning(false)
          setIsComplete(true)
          return prevIndex
        }

        // Update grid position
        setCurrentPosition((prevPos) => (prevPos + 1) % 9)

        return nextIndex
      })
    }, getDelay())
  }

  // Pause the drill
  const pauseDrill = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Reset the drill
  const resetDrill = () => {
    pauseDrill()
    setCurrentIndex(0)
    setIsComplete(false)
    setCurrentPosition(0)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Get the current word
  const getCurrentWord = () => {
    if (currentIndex < 0 || currentIndex >= words.length) {
      return ""
    }
    return words[currentIndex]
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Running Words</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetDrill}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Speed (WPM)</span>
                    <span className="text-sm text-muted-foreground">{wpm}</span>
                  </div>
                  <Slider
                    value={[wpm]}
                    min={100}
                    max={800}
                    step={10}
                    onValueChange={(value) => setWpm(value[0])}
                    disabled={isRunning}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mb-6 max-w-3xl">
        <p className="mb-4 text-muted-foreground">
          This drill helps expand your peripheral vision and reading field by displaying words in a 3x3 grid pattern.
          Words appear one at a time, moving from left to right, top to bottom.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Running Words Drill</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-2">
            {/* Running Words Drill Component */}
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-3 gap-3 mx-auto">
                {Array(9)
                  .fill(0)
                  .map((_, index) => (
                    <Card
                      key={index}
                      className={`flex h-16 w-20 items-center justify-center p-2 text-center text-base transition-all duration-200 sm:h-20 sm:w-28 ${
                        index === currentPosition && isRunning ? "bg-muted" : ""
                      }`}
                    >
                      {index === currentPosition ? getCurrentWord() : ""}
                    </Card>
                  ))}
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Button onClick={isRunning ? pauseDrill : startDrill} disabled={words.length === 0} className="px-6">
                    {isRunning ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {isComplete ? "Restart" : "Start"}
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {currentIndex}/{words.length} words
                  </div>
                </div>

                {/* Speed Adjustor */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Speed</span>
                    <span className="text-sm font-medium">{wpm} WPM</span>
                  </div>
                  <Slider
                    value={[wpm]}
                    min={100}
                    max={800}
                    step={10}
                    onValueChange={(value) => setWpm(value[0])}
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 font-medium">Instructions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Words will appear one at a time in the grid</li>
                <li>• Focus on recognizing each word quickly</li>
                <li>• Try to maintain comprehension of the text</li>
                <li>• Adjust the speed to challenge yourself</li>
                <li>• Practice regularly to improve your reading field</li>
              </ul>
            </div>

            {isComplete && (
              <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                <h3 className="mb-2 font-medium text-green-700 dark:text-green-300">Drill Complete!</h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  You've completed the Running Words drill at {wpm} WPM.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
