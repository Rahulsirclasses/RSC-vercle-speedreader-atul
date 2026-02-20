"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ComprehensionDrill } from "@/components/drills/comprehension-drill"
import { getRandomPassage } from "@/lib/passages"

// Define a fallback passage to use if needed
const fallbackPassage = {
  id: "fallback-passage",
  title: "The Importance of Critical Thinking",
  text: "Critical thinking is the analysis of available facts, evidence, observations, and arguments to form a judgment. The subject is complex; several different definitions exist, which generally include the rational, skeptical, and unbiased analysis or evaluation of factual evidence. Critical thinking is self-directed, self-disciplined, self-monitored, and self-corrective thinking. It presupposes assent to rigorous standards of excellence and mindful command of their use. It entails effective communication and problem-solving abilities as well as a commitment to overcome native egocentrism and sociocentrism.",
  topic: "Education",
  wordCount: 200,
  difficulty: "medium",
  estimatedTime: "4 mins",
}

export default function ComprehensionTimePage() {
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
          id: (selectedPassage as any)?._id || (selectedPassage as any)?.id,
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
          <h1 className="text-3xl font-bold tracking-tight">Comprehension Under Time</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Comprehension Under Time</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <ComprehensionDrill passage={passage} />
        </CardContent>
      </Card>
    </div>
  )
}
