"use client"
import { Button } from "@/components/ui/button"

interface ReverseReadingProps {
  text: string
  onComplete: () => void
}

export function ReverseReading({ text, onComplete }: ReverseReadingProps) {
  // Split text into sentences and reverse the order
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).reverse()

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Read the sentences in reverse order, from the last sentence to the first. This helps break fixation habits.
        </p>
      </div>

      <div className="prose max-w-none dark:prose-invert">
        {sentences.map((sentence, index) => (
          <p key={index} className="mb-4 leading-relaxed">
            <span className="mr-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
              {sentences.length - index}
            </span>
            {sentence}
          </p>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Button onClick={onComplete}>Complete Drill</Button>
      </div>
    </div>
  )
}
