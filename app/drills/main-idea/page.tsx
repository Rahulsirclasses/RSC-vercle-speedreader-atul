"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MainIdeaDrill } from "@/components/drills/main-idea-drill"
import { getRandomPassage } from "@/lib/actions/content"

// Define a fallback passage to use if needed
const fallbackPassage = {
  id: "fallback-passage",
  title: "Critical Thinking in the Digital Age",
  text: "Critical thinking is essential in the digital age where information is abundant but not always reliable. It involves analyzing facts, evidence, and arguments to form reasoned judgments. In an era of social media and instant news, the ability to evaluate sources, identify biases, and distinguish between fact and opinion has become increasingly important. Critical thinking enables individuals to navigate the complex information landscape, make informed decisions, and avoid manipulation. Developing this skill requires practice, curiosity, and a willingness to question assumptions. Educational institutions and workplaces now emphasize critical thinking as a core competency for success in the 21st century.",
  topic: "Critical Thinking",
  difficulty: "Intermediate",
  wordCount: 150,
  estimatedTime: "3 mins",
}

export default function MainIdeaPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Main Idea Match</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Main Idea Match</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <MainIdeaDrill passage={passage} />
        </CardContent>
      </Card>
    </div>
  )
}
