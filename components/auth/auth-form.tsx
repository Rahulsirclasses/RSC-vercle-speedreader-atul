"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn as nextAuthSignIn } from "next-auth/react"

interface AuthFormProps {
  mode: "signin" | "signup" | "reset"
  onModeChange: (mode: "signin" | "signup" | "reset") => void
}

// ── Google Icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ── URL Error Alert (separate component so useSearchParams is Suspense-safe) ─
function UrlErrorAlert() {
  const searchParams = useSearchParams()
  const urlError = searchParams?.get("error")

  if (urlError === "PENDING_APPROVAL") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your account is pending admin approval. You'll be notified once approved.
        </AlertDescription>
      </Alert>
    )
  }
  if (urlError === "ACCOUNT_DISABLED") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your account has been disabled. Please contact support.
        </AlertDescription>
      </Alert>
    )
  }
  return null
}

// ── Auth Form ───────────────────────────────────────────────────────────────
export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === "reset") {
        setError("Not Implemented")
      } else if (mode === "signin") {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
        else {
          console.group(`[PERF:Navigation] Auth -> Dashboard`);
          console.time(`login-to-dashboard`);
          performance.mark("login-success");
          console.log(`[PERF:AuthForm] Login success - initiating router.push("/") at ${performance.now().toFixed(2)}ms`);
          router.push("/")
        }
      } else if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your full name")
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, name.trim())
        if (error) {
          setError(error.message)
        } else {
          setSuccess(
            "Account created! Your account is pending admin approval. You will be notified once approved."
          )
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      await nextAuthSignIn("google", { callbackUrl: "/" })
    } catch {
      setError("Google sign-in failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  const getTitle = () => {
    if (mode === "signin") return "Sign In"
    if (mode === "signup") return "Create Account"
    return "Reset Password"
  }

  const getDescription = () => {
    if (mode === "signin") return "Welcome back! Sign in to continue reading."
    if (mode === "signup") return "Create an account to start improving your reading skills."
    return "Enter your email and we'll send a reset link."
  }

  const getButtonText = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (mode === "signin") return "Sign In"
    if (mode === "signup") return "Create Account"
    return "Send Reset Email"
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{getTitle()}</CardTitle>
        <CardDescription className="text-center">{getDescription()}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* URL-based error — uses Suspense-safe UrlErrorAlert */}
          <Suspense fallback={null}>
            <UrlErrorAlert />
          </Suspense>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign-In — signin / signup only */}
          {mode !== "reset" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Name field — signup only */}
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {getButtonText()}
          </Button>

          <div className="text-center text-sm space-y-2">
            {mode === "signin" && (
              <>
                <button
                  type="button"
                  onClick={() => onModeChange("reset")}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
                <div>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => onModeChange("signup")}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <div>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => onModeChange("signin")}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Sign in
                </button>
              </div>
            )}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => onModeChange("signin")}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Back to sign in
              </button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
