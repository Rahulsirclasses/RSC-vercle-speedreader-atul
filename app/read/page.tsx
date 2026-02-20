"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { passages, getImportedPassages } from "@/lib/passages"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, Square } from "lucide-react"

// Dynamically import the SimplifiedReader with no SSR
const DynamicSimplifiedReader = dynamic(
  () => import("@/components/simplified-reader").then((mod) => mod.SimplifiedReader),
  { ssr: false },
)

export default function ReadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [wpm, setWpm] = useState(300)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRamping, setIsRamping] = useState(false)
  const [startingWpm, setStartingWpm] = useState(300)
  const [targetWpm] = useState(1000) // Fixed target of 1000 WPM
  const [rampingProgress, setRampingProgress] = useState(0)
  const [rampingStartTime, setRampingStartTime] = useState<number | null>(null)

  // Ramping duration in milliseconds (5 minutes = 300,000ms)
  const RAMPING_DURATION = 300000 // 5 minutes

  // Get article ID from URL params - memoized to prevent infinite loops
  const articleId = useMemo(() => {
    return searchParams.get("article")
  }, [searchParams])

  // Get all passages - memoized to prevent recalculation
  const allPassages = useMemo(() => {
    try {
      const importedPassages = getImportedPassages()
      return [...passages, ...importedPassages]
    } catch (error) {
      console.error("Error getting passages:", error)
      return passages
    }
  }, [])

  // Load article when component mounts or articleId changes
  useEffect(() => {
    setIsClient(true)
    setLoading(true)
    setError(null)

    try {
      console.log("Loading article with ID:", articleId)
      console.log(
        "Available passages:",
        allPassages.map((p) => ({ id: p.id, title: p.title })),
      )

      let selectedArticle = null

      if (articleId) {
        selectedArticle = allPassages.find((p) => p.id === articleId)
        console.log("Found article:", selectedArticle)
      }

      if (!selectedArticle && allPassages.length > 0) {
        // No article ID or article not found, use the first one as default
        selectedArticle = allPassages[0]
        console.log("Using default article:", selectedArticle)
      }

      if (selectedArticle) {
        setArticle(selectedArticle)
      } else {
        setError("No articles available")
      }
    } catch (err) {
      console.error("Error loading article:", err)
      setError("An error occurred while loading the article")
    } finally {
      setLoading(false)
    }
  }, [articleId, allPassages])

  // Gradual ramping effect - increases speed gradually over 5 minutes
  useEffect(() => {
    if (!isRamping || !rampingStartTime) return

    const interval = setInterval(() => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - rampingStartTime
      const progress = Math.min(elapsedTime / RAMPING_DURATION, 1)

      setRampingProgress(progress)

      if (progress >= 1) {
        // Ramping complete
        setIsRamping(false)
        setWpm(targetWpm)
      } else {
        // Calculate current WPM using smooth easing
        // Using easeInOut curve for natural acceleration/deceleration
        const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        const currentWpm = Math.round(startingWpm + (targetWpm - startingWpm) * easedProgress)
        setWpm(currentWpm)
      }
    }, 1000) // Update every second for smooth but not overwhelming updates

    return () => clearInterval(interval)
  }, [isRamping, startingWpm, targetWpm, rampingStartTime])

  const handleStartingWpmChange = (value: number[]) => {
    if (!isRamping) {
      setStartingWpm(value[0])
      setWpm(value[0])
    }
  }

  const handlePassageChange = (passageId: string) => {
    // Only navigate if it's a different passage
    if (passageId !== articleId) {
      router.push(`/read?article=${encodeURIComponent(passageId)}`)
    }
  }

  const handleStartRamping = () => {
    setWpm(startingWpm) // Start from selected starting speed
    setRampingProgress(0)
    setRampingStartTime(Date.now())
    setIsRamping(true)
  }

  const handleStopRamping = () => {
    setIsRamping(false)
    setRampingProgress(0)
    setRampingStartTime(null)
  }

  // Calculate estimated time remaining for ramping
  const getTimeRemaining = () => {
    if (!isRamping || !rampingStartTime) return ""
    const elapsed = Date.now() - rampingStartTime
    const remaining = Math.max(0, RAMPING_DURATION - elapsed)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Speed Reading</h1>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Speed Reading</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Speed Reading Session</CardTitle>
            {article && (
              <div className="mt-2">
                <h2 className="text-xl font-semibold">{article.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {article.wordCount} words · {article.difficulty} · {article.category || article.topic}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="mb-4 text-red-500">{error}</p>
                <Button asChild>
                  <Link href="/library">Return to Library</Link>
                </Button>
              </div>
            ) : !article ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="mb-4 text-muted-foreground">No article selected</p>
                <Button asChild>
                  <Link href="/library">Choose an Article</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Passage Selection Dropdown */}
                <div className="mb-6">
                  <label htmlFor="passage-select" className="mb-2 block text-sm font-medium">
                    Select Passage
                  </label>
                  <Select value={article.id} onValueChange={handlePassageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a passage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Built-in Passages</SelectLabel>
                        {passages.map((passage) => (
                          <SelectItem key={passage.id} value={passage.id}>
                            {passage.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>

                      {getImportedPassages().length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Imported Passages</SelectLabel>
                          {getImportedPassages().map((passage) => (
                            <SelectItem key={passage.id} value={passage.id}>
                              {passage.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speed Ramping Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">
                      Current Speed: {wpm} WPM
                      {isRamping && (
                        <span className="ml-2 text-sm text-blue-400">
                          (Ramping to 1000 WPM - {getTimeRemaining()} remaining)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Starting Speed: {startingWpm} WPM</span>
                        <span>Target Speed: {targetWpm} WPM</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Speed will gradually increase from {startingWpm} to {targetWpm} WPM over 5 minutes
                      </div>
                    </div>

                    {!isRamping && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Set Starting Speed</label>
                        <Slider
                          value={[startingWpm]}
                          min={100}
                          max={900}
                          step={10}
                          onValueChange={handleStartingWpmChange}
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleStartRamping}
                        disabled={isRamping}
                        variant="default"
                        size="lg"
                        className="flex-1"
                      >
                        {isRamping ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Ramping in Progress...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Start Gradual Speed Training
                          </>
                        )}
                      </Button>

                      {isRamping && (
                        <Button onClick={handleStopRamping} variant="destructive" size="lg">
                          <Square className="mr-2 h-4 w-4" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </div>

                  {isRamping && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="mb-3 flex justify-between text-sm text-muted-foreground">
                        <span>Training Progress</span>
                        <span>{Math.round(rampingProgress * 100)}% Complete</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-1000"
                          style={{ width: `${rampingProgress * 100}%` }}
                        />
                      </div>
                      <div className="mt-3 text-center text-sm text-muted-foreground">
                        Your reading speed is gradually increasing. Stay focused and let your eyes adapt to the pace.
                      </div>
                    </div>
                  )}
                </div>

                {/* Use the dynamically imported component */}
                {article && <DynamicSimplifiedReader text={article.content || article.text || ""} wpm={wpm} />}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
