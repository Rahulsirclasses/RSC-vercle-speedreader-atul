"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  // Start with false for SSR to avoid hydration mismatch
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Skip media query matching during SSR
    if (typeof window === "undefined") return

    // Create the media query list
    const media = window.matchMedia(query)

    // Define the change handler
    const listener = () => setMatches(media.matches)

    // Set the initial value
    setMatches(media.matches)

    // Add the callback as a listener
    if (media.addEventListener) {
      media.addEventListener("change", listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Remove the listener on cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}
