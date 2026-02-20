"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth/auth-form"

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  )
}
