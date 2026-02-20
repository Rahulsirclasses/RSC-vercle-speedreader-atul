"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { BlindSpotDrill } from "@/components/drills/blind-spot-drill"
import { getRandomPassage } from "@/lib/actions/content"

// Define a fallback passage to use if needed
const fallbackPassage = {
  id: "fallback-passage",
  title: "The Power of Prediction in Reading",
  text: "Prediction is a powerful cognitive skill that enhances reading comprehension and speed. When readers predict what comes next in a text, they actively engage with the material and process information more efficiently. This skill leverages prior knowledge and context clues to anticipate content, allowing readers to confirm or adjust their understanding as they progress. Skilled readers make predictions automatically, often without conscious awareness. Developing prediction ability involves practice with various text types and attention to patterns in language and content. As prediction accuracy improves, reading becomes more fluid and enjoyable, with less cognitive load required for basic comprehension.",
  topic: "Reading Psychology",
  difficulty: "Intermediate",
  wordCount: 150,
  estimatedTime: "3 mins",
}

export default function BlindSpotPage() {
  const [passage, setPassage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    fetchPassage();
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Blind Spot Blur</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading passage...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/drills">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Blind Spot Blur</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <BlindSpotDrill passage={passage} />
        </CardContent>
      </Card>
    </div>
  )
}
