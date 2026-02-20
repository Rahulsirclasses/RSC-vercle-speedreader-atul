"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

type SidebarContextType = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  isMobile: boolean
}

// Create a default context value to avoid undefined errors
const defaultContextValue: SidebarContextType = {
  isOpen: true,
  setIsOpen: () => {},
  toggleSidebar: () => {},
  isMobile: false,
}

const SidebarContext = React.createContext<SidebarContextType>(defaultContextValue)

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(true)
  // Initialize with false to avoid hydration mismatch
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close sidebar on mobile by default, but keep it open on desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
      }
    }

    // Set initial state
    handleResize()

    // Add event listener with debounce to avoid excessive renders
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100)
    }

    window.addEventListener("resize", debouncedResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const toggleSidebar = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => {
    return { isOpen, setIsOpen, toggleSidebar, isMobile }
  }, [isOpen, toggleSidebar, isMobile])

  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  return context
}
