import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const token = req.nextauth.token

        // ── Block Disabled Accounts ──────────────────────────────────────────
        if (token && token.status === "disabled") {
            const url = new URL("/auth/signin", req.url)
            url.searchParams.set("error", "ACCOUNT_DISABLED")
            return NextResponse.redirect(url)
        }

        // ── Admin routes: require role === "admin" ───────────────────────────
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
            if (!token || token.role !== "admin") {
                // API routes → 403, page routes → redirect to home
                if (pathname.startsWith("/api/admin")) {
                    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
                }
                return NextResponse.redirect(new URL("/", req.url))
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            // Only run middleware function when user is authenticated on protected paths
            authorized({ token, req }) {
                const { pathname } = req.nextUrl

                // Admin paths always require auth
                if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
                    return !!token
                }

                // All other matched paths: allow through (handled above)
                return true
            },
        },
    }
)

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/drills/:path*",
        "/stats/:path*",
        "/library/:path*",
        "/reader/:path*",
    ],
}
