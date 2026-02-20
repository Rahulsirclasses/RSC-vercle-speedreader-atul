"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { getPassageById, getRandomPassage } from "@/lib/passages"
import { ReadingControls } from "@/components/reading-controls"
import { ReadingModeSelector } from "@/components/reading-mode-selector"
import { SpeedReader } from "@/components/speed-reader"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export function ReadingSession({ initialArticleId }: { initialArticleId?: string }) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wpm, setWpm] = useState(300)
  const [isPlaying, setIsPlaying] = useState(false)
  const [readingMode, setReadingMode] = useState<"normal" | "rsvp" | "highlight">("normal")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // This now runs only on the client side
    const loadArticle = () => {
      try {
        setLoading(true)
        setError(null)
        let selectedArticle

        if (initialArticleId) {
          selectedArticle = getPassageById(initialArticleId)
        }

        if (!selectedArticle) {
          selectedArticle = getRandomPassage()
        }

        if (!selectedArticle) {
          throw new Error("No article found")
        }

        setArticle(selectedArticle)
      } catch (err) {
        console.error("Error loading article:", err)
        setError("Failed to load article. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [initialArticleId])

  const handleWpmChange = (value: number[]) => {
    setWpm(value[0])
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  const handleModeChange = (mode: "normal" | "rsvp" | "highlight") => {
    setReadingMode(mode)
    setIsPlaying(false)
    setProgress(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No article found. Please select an article from the library.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">{article.title}</h2>
            <p className="text-sm text-muted-foreground">
              {article.wordCount} words · {article.estimatedTime} · {article.difficulty} · {article.topic}
            </p>
          </div>

          <ReadingModeSelector activeMode={readingMode} onModeChange={handleModeChange} />

          <div className="mt-6">
            <SpeedReader
              text={article.text}
              wpm={wpm}
              isPlaying={isPlaying}
              mode={readingMode}
              progress={progress}
              onProgressChange={setProgress}
              onComplete={() => setIsPlaying(false)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reading Speed: {wpm} WPM</span>
        </div>
        <Slider value={[wpm]} min={100} max={1000} step={10} onValueChange={handleWpmChange} className="w-full" />

        <ReadingControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          progress={progress}
        />
      </div>
    </div>
  )
}
