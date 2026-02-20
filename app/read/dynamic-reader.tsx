"use client"

import { useState, useEffect } from "react"
import { SimplifiedReader } from "@/components/simplified-reader"

interface DynamicReaderProps {
  text: string
  wpm: number
}

export function DynamicReader({ text, wpm }: DynamicReaderProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <SimplifiedReader text={text} wpm={wpm} />
}
