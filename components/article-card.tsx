"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Play } from "lucide-react"
import Link from "next/link"

interface ArticleCardProps {
  id: string
  title: string
  excerpt: string
  wordCount: number
  estimatedTime: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  content?: string
}

export function ArticleCard({
  id,
  title,
  excerpt,
  wordCount,
  estimatedTime,
  difficulty,
  category,
  content,
}: ArticleCardProps) {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <Badge variant="secondary" className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit">
          {category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{excerpt}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{estimatedTime}</span>
          </div>
        </div>

        <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Link href={`/read?article=${encodeURIComponent(id)}`}>
            <Play className="mr-2 h-4 w-4" />
            Start Reading
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
