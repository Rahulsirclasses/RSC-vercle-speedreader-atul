"use client"
import { Button } from "@/components/ui/button"

interface BlindSpotBlurProps {
  text: string
  onComplete: () => void
}

export function BlindSpotBlur({ text, onComplete }: BlindSpotBlurProps) {
  // Process text to blur random words
  const processText = () => {
    const words = text.split(" ")
    // Blur approximately 15% of words
    return words.map((word, index) => {
      // Don't blur very short words or punctuation
      if (word.length <= 2 || Math.random() > 0.15) {
        return <span key={index}>{word} </span>
      }
      return (
        <span
          key={index}
          className="blur-sm hover:blur-none transition-all duration-300 cursor-help"
          title="Hover to reveal"
        >
          {word}{" "}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Some words are blurred. Try to infer them as you read. Hover over a blurred word to reveal it.
        </p>
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <p className="leading-relaxed">{processText()}</p>
      </div>

      <div className="mt-4 flex justify-center">
        <Button onClick={onComplete}>Complete Drill</Button>
      </div>
    </div>
  )
}
