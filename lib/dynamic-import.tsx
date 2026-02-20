"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface DynamicImportProps {
  children: () => React.ReactNode
}

export function DynamicImport({ children }: DynamicImportProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children()}</>
}
