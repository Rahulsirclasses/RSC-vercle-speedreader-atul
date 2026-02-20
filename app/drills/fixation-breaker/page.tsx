"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { FixationBreakerDrill } from "@/components/drills/fixation-breaker-drill"
import { passages } from "@/lib/passages"

// Define multiple fallback passages to ensure variety
const fallbackPassages = [
  {
    id: "fallback-passage-1",
    title: "Improving Reading Efficiency",
    text: "Reading efficiency combines speed and comprehension to maximize information intake. Efficient readers process text quickly while maintaining high understanding. Several techniques can improve reading efficiency, including previewing material, identifying key points, and eliminating distractions. Reducing subvocalization, the habit of pronouncing words in your head, can significantly increase reading speed. Practicing eye movement exercises helps reduce fixation time and expand peripheral vision. Regular practice with increasingly challenging materials gradually builds reading stamina and skill. As efficiency improves, readers can adjust their approach based on the purpose and complexity of the text.",
    topic: "Reading Techniques",
    difficulty: "Intermediate",
    wordCount: 150,
    estimatedTime: "3 mins",
  },
  {
    id: "fallback-passage-2",
    title: "The Power of Focused Attention",
    text: "Focused attention is the ability to concentrate on a specific task or stimulus while ignoring distractions. In our increasingly connected world, this skill has become both more valuable and more challenging to maintain. Research shows that the average person is distracted or interrupted every three minutes, and it can take up to 23 minutes to regain complete focus. Regular practice of attention-focusing exercises can strengthen this cognitive muscle. Techniques such as mindfulness meditation, the Pomodoro method, and digital detoxes have proven effective for many people. By improving your ability to focus, you can enhance productivity, learning capacity, and even creative problem-solving abilities.",
    topic: "Cognitive Skills",
    difficulty: "Intermediate",
    wordCount: 150,
    estimatedTime: "3 mins",
  },
  {
    id: "fallback-passage-3",
    title: "Understanding Visual Processing",
    text: "Visual processing is how the brain interprets what the eyes see. This complex system involves not just the eyes, but multiple areas of the brain working in concert. When reading, your eyes don't move smoothly across the text but instead make a series of jumps called saccades, with brief stops called fixations. During fixations, which typically last 200-250 milliseconds, your brain processes the text. Skilled readers make fewer fixations, effectively taking in more text with each stop. The peripheral vision also plays a crucial role, previewing upcoming text and helping the brain decide where to fixate next. Understanding these mechanics can help readers develop strategies to process text more efficiently.",
    topic: "Cognitive Science",
    difficulty: "Intermediate",
    wordCount: 150,
    estimatedTime: "3 mins",
  },
]

export default function FixationBreakerPage() {
  // Force client-side rendering only
  const [mounted, setMounted] = useState(false)
  const [passage, setPassage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(Date.now()) // Unique key for forcing remount

  // Function to get a truly random passage
  const getRandomPassage = () => {
    // First try to get suitable passages from our library
    const suitablePassages = passages.filter((p) => p.wordCount >= 180 && p.wordCount <= 300)

    // If we have suitable passages, pick one randomly
    if (suitablePassages.length > 0) {
      const randomIndex = Math.floor(Math.random() * suitablePassages.length)
      const selectedPassage = suitablePassages[randomIndex]

      // Format the passage
      return {
        id: `${selectedPassage.id}-${Date.now()}`, // Add timestamp to ensure uniqueness
        title: selectedPassage.title,
        text: (selectedPassage as any)?.content,
        topic: (selectedPassage as any)?.category,
        difficulty: selectedPassage.difficulty,
        wordCount: selectedPassage.wordCount,
        estimatedTime: selectedPassage.estimatedTime,
        timestamp: Date.now(), // Add timestamp for debugging
      }
    }

    // If no suitable passages, use a random fallback
    const randomFallbackIndex = Math.floor(Math.random() * fallbackPassages.length)
    return {
      ...fallbackPassages[randomFallbackIndex],
      timestamp: Date.now(), // Add timestamp for debugging
    }
  }

  // Function to refresh the passage
  const refreshPassage = () => {
    setIsLoading(true)
    setKey(Date.now()) // Force component remount

    // Select a new passage with a slight delay
    setTimeout(() => {
      const newPassage = getRandomPassage()
      console.log("New passage selected:", newPassage.title, "at", new Date().toISOString())
      setPassage(newPassage)
      setIsLoading(false)
    }, 200)
  }

  // Initial mount effect
  useEffect(() => {
    async function fetchPassage() {
      try {
        const selectedPassage = await getRandomPassage();
        if (!selectedPassage) {
          setPassage(fallbackPassage);
          setIsLoading(false);
          return;
        }
        
        const formattedPassage = {
          id: (selectedPassage as any)?._id,
          title: selectedPassage.title,
          text: (selectedPassage as any)?.content,
          content: (selectedPassage as any)?.content,
          topic: (selectedPassage as any)?.category,
          category: (selectedPassage as any)?.category,
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
    fetchPassage();
  }, [])

  // Don't render anything until client-side mounted
  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Fixation Breaker</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading a new passage...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Fixation Breaker</h1>
        </div>

        <Button variant="outline" size="sm" onClick={refreshPassage} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          New Passage
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Force remount when passage changes */}
          <div key={key}>{passage && <FixationBreakerDrill passage={passage} />}</div>
        </CardContent>
      </Card>

      {/* Debug info - remove in production */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Passage ID: {passage?.id}</p>
        <p>Selected at: {new Date(passage?.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  )
}
