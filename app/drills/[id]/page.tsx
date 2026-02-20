import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DrillContent } from "@/components/drills/drill-content"
import { notFound } from "next/navigation"

const drillData = {
  "speed-sprint": {
    name: "Speed Sprint",
    description: "Read 300–500 words at target WPM, no pause",
    time: "3 mins",
    icon: "zap",
    instructions:
      "Read as quickly as you can while maintaining comprehension. Your goal is to complete the passage at your target WPM.",
    type: "speed",
  },
  "comprehension-time": {
    name: "Comprehension Under Time",
    description: "Timed reading + 5 MCQs",
    time: "5 mins",
    icon: "brain",
    instructions:
      "Read the passage quickly, then answer the comprehension questions that follow. You'll be scored on both speed and accuracy.",
    type: "comprehension",
  },
  "word-reveal": {
    name: "Word Reveal",
    description: "Flash 1–3 words with speed ramping",
    time: "2–3 mins",
    icon: "eye",
    instructions:
      "Words will flash on screen at increasing speeds. Try to comprehend each word or phrase as it appears.",
    type: "flash",
  },
  "running-words": {
    name: "Running Words",
    description: "Words appear in a 3x3 grid pattern",
    time: "3 mins",
    icon: "grid",
    instructions:
      "Words will appear one at a time in a 3x3 grid, moving from left to right, top to bottom. This helps improve peripheral vision and expand your reading field.",
    type: "grid",
  },
  "main-idea": {
    name: "Main Idea Match",
    description: "Match passage to summary",
    time: "5 mins",
    icon: "lightbulb",
    instructions: "Read the passage, then select the summary that best captures the main idea of the text.",
    type: "comprehension",
  },
  "reverse-reading": {
    name: "Reverse Reading",
    description: "Read backwards (sentence-wise)",
    time: "5 mins",
    icon: "rewind",
    instructions:
      "Read the sentences in reverse order, from the last sentence to the first. This helps break fixation habits.",
    type: "reverse",
  },
  "fixation-breaker": {
    name: "Fixation Breaker",
    description: "Read staggered columns",
    time: "3 mins",
    icon: "move-horizontal",
    instructions: "Read text arranged in staggered columns. This trains your eyes to move efficiently across text.",
    type: "fixation",
  },
  "blind-spot": {
    name: "Blind Spot Blur",
    description: "Read with missing words for prediction",
    time: "3–5 mins",
    icon: "eye-off",
    instructions: "Some words in the text will be blurred or missing. Try to infer the missing words as you read.",
    type: "blind-spot",
  },
}

export const sampleText = `Speed reading is a collection of reading methods which attempt to increase rates of reading without greatly reducing comprehension or retention. Methods include chunking and eliminating subvocalization. No absolute distinct "normal" and "speed-reading" exists; reading speeds are variable. Speed reading is characterized by analyzing trade-offs between measures of speed and comprehension, recognizing that different types of reading call for different speed and comprehension rates, and that those rates may be improved with practice. The many available speed reading training programs include books, videos, software, and seminars. Speed reading is characterized by an analysis of trade-offs between measures of speed and comprehension, recognizing that different types of reading call for different speed and comprehension rates, and that those rates may be improved with practice.`

export default function DrillPage({ params }: { params: { id: string } }) {
  const id = params.id
  const drill = drillData[id as keyof typeof drillData]

  // If drill doesn't exist, show 404
  if (!drill) {
    return notFound()
  }

  // For specialized drills, redirect to their dedicated pages
  if (id === "speed-sprint") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Speed Sprint drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/speed-sprint">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For comprehension-time drill, redirect to dedicated page
  if (id === "comprehension-time") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Comprehension Under Time drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/comprehension-time">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For word-reveal drill, redirect to dedicated page
  if (id === "word-reveal") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Word Reveal drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/word-reveal">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For running-words drill, redirect to dedicated page
  if (id === "running-words") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Running Words drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/running-words">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For main-idea drill, redirect to dedicated page
  if (id === "main-idea") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Main Idea Match drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/main-idea">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For reverse-reading drill, redirect to dedicated page
  if (id === "reverse-reading") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Reverse Reading drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/reverse-reading">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For fixation-breaker drill, redirect to dedicated page
  if (id === "fixation-breaker") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Fixation Breaker drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/fixation-breaker">Go to Drill</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For blind-spot drill, redirect to dedicated page
  if (id === "blind-spot") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/drills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p>Redirecting to the Blind Spot Blur drill...</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/drills/blind-spot">Go to Drill</Link>
                </Button>
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
        <h1 className="text-3xl font-bold tracking-tight">{drill.name}</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <DrillContent drill={drill} id={id} />
        </CardContent>
      </Card>
    </div>
  )
}
