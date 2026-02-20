"use client"

import { DrillCard } from "@/components/drill-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain, Eye, EyeOff, Grid3X3, Lightbulb, MoveHorizontal, Rewind, Zap } from "lucide-react"
import Link from "next/link"

const drills = [
  {
    id: "speed-sprint",
    title: "Speed Sprint",
    description: "Read 300–500 words at target WPM, no pause",
    time: "3–5 mins",
    icon: <Zap className="h-5 w-5" />,
    href: "/drills/speed-sprint",
  },
  {
    id: "comprehension-time",
    title: "Comprehension Under Time",
    description: "Timed reading + 5 MCQs",
    time: "5 mins",
    icon: <Brain className="h-5 w-5" />,
    href: "/drills/comprehension-time",
  },
  {
    id: "word-reveal",
    title: "Word Reveal",
    description: "Flash 1–3 words with speed ramping",
    time: "2–3 mins",
    icon: <Eye className="h-5 w-5" />,
    href: "/drills/word-reveal",
  },
  {
    id: "running-words",
    title: "Running Words",
    description: "Words appear in a 3x3 grid pattern",
    time: "3 mins",
    icon: <Grid3X3 className="h-5 w-5" />,
    href: "/drills/running-words",
  },
  {
    id: "main-idea",
    title: "Main Idea Match",
    description: "Match passage to summary",
    time: "5 mins",
    icon: <Lightbulb className="h-5 w-5" />,
    href: "/drills/main-idea",
  },
  {
    id: "reverse-reading",
    title: "Reverse Reading",
    description: "Read backwards (sentence-wise)",
    time: "5 mins",
    icon: <Rewind className="h-5 w-5" />,
    href: "/drills/reverse-reading",
  },
  {
    id: "fixation-breaker",
    title: "Fixation Breaker",
    description: "Read staggered columns",
    time: "3 mins",
    icon: <MoveHorizontal className="h-5 w-5" />,
    href: "/drills/fixation-breaker",
  },
  {
    id: "blind-spot",
    title: "Blind Spot Blur",
    description: "Read with missing words for prediction",
    time: "3–5 mins",
    icon: <EyeOff className="h-5 w-5" />,
    href: "/drills/blind-spot",
  },
]

export default function DrillsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Reading Drills</h1>
      </div>

      <p className="mb-6 text-muted-foreground">Select a drill to practice specific reading skills and techniques</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drills.map((drill) => (
          <DrillCard
            key={drill.id}
            title={drill.title}
            description={drill.description}
            time={drill.time}
            icon={drill.icon}
            href={drill.href}
          />
        ))}
      </div>
    </div>
  )
}
