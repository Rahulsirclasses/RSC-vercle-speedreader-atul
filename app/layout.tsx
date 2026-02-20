import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { TopNavbar } from "@/components/top-navbar"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers/providers"

const inter = Inter({ subsets: ["latin"] })

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Speed Reading App",
  description: "Improve your reading speed and comprehension with interactive drills",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <TopNavbar />
                <main>{children}</main>
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
