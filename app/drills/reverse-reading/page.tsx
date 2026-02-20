"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReverseReadingDrill } from "@/components/drills/reverse-reading-drill"
import { getRandomPassage } from "@/lib/actions/content"

// Define a fallback passage to use if needed
const fallbackPassage = {
  id: "fallback-passage",
  title: "The Benefits of Reading",
  text: "Reading is a fundamental skill that offers numerous cognitive and emotional benefits. Regular reading improves vocabulary, enhances comprehension, and strengthens analytical thinking skills. It also reduces stress, increases empathy, and provides entertainment and knowledge. Reading exposes individuals to diverse perspectives and cultures, broadening their worldview. In children, reading supports language development and academic success. For adults, it helps maintain cognitive function as they age. Whether fiction or non-fiction, digital or print, reading remains one of the most accessible and effective ways to learn and grow throughout life.",
  topic: "Reading Benefits",
  difficulty: "Easy",
  wordCount: 150,
  estimatedTime: "3 mins",
}

export default function ReverseReadingPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Reverse Reading</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Reverse Reading</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <ReverseReadingDrill passage={passage} />
        </CardContent>
      </Card>
    </div>
  )
}
