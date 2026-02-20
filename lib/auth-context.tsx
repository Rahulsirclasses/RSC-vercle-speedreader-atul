"use client"

import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import type { Session } from "next-auth"
import { useRouter } from "next/navigation"

// ── Types ──────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
  role: "user" | "admin"
  status: "pending" | "active" | "disabled"
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const router = useRouter()
  const [isSignoutLoading, setIsSignoutLoading] = useState(false)

  // ── Real-time Status Check ────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/auth/status", { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()

        if (data.status === "disabled") {
          console.warn("Account disabled detected. Signing out...")
          setIsSignoutLoading(true)
          // Force sign out
          await nextAuthSignOut({
            callbackUrl: "/auth/signin?error=ACCOUNT_DISABLED",
            redirect: true
          })
        }
      } catch (error) {
        console.error("Failed to check auth status:", error)
      }
    }

    // Initial check
    checkStatus()

    // Periodical check (every 30 seconds)
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [status, session])

  if (status === "loading" || isSignoutLoading) {
    console.log(`[PERF:AuthContext] Session loading at ${performance.now().toFixed(2)}ms`);
  } else if (session) {
    console.log(`[PERF:AuthContext] Session loaded at ${performance.now().toFixed(2)}ms`);
  }


  const user: AuthUser | null = session?.user
    ? {
      id: session.user.id,
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      image: session.user.image ?? null,
      role: (session.user.role as "user" | "admin") ?? "user",
      status: (session.user.status as "pending" | "active" | "disabled") ?? "pending",
    }
    : null

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: any }> => {
      try {
        const result = await nextAuthSignIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error === "PENDING_APPROVAL") {
          return { error: { message: "Your account is pending admin approval. You will be notified when approved." } }
        }
        if (result?.error === "ACCOUNT_DISABLED") {
          return { error: { message: "Your account has been disabled. Please contact support." } }
        }
        if (result?.error) {
          return { error: { message: "Invalid email or password" } }
        }

        return { error: null }
      } catch (err) {
        return { error: { message: "An unexpected error occurred during sign in" } }
      }
    },
    [router]
  )

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<{ error: any }> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          return { error: data }
        }

        return { error: null }
      } catch (err) {
        return { error: { message: "An unexpected error occurred during sign up" } }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ callbackUrl: "/auth/signin" })
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
