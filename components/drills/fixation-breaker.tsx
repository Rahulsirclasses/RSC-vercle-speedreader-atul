"use client"
import { Button } from "@/components/ui/button"

interface FixationBreakerProps {
  text: string
  onComplete: () => void
}

export function FixationBreaker({ text, onComplete }: FixationBreakerProps) {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Read the staggered columns below. This trains your eyes to move efficiently across text.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          {sentences
            .filter((_, i) => i % 2 === 0)
            .map((sentence, index) => (
              <p key={`left-${index}`} className="text-sm">
                {sentence}
              </p>
            ))}
        </div>
        <div className="space-y-4 pt-8">
          {sentences
            .filter((_, i) => i % 2 === 1)
            .map((sentence, index) => (
              <p key={`right-${index}`} className="text-sm">
                {sentence}
              </p>
            ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button onClick={onComplete}>Complete Drill</Button>
      </div>
    </div>
  )
}
