import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserStats } from "@/lib/db/stats"
import { getLeaderboard } from "@/lib/db/drills"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const [stats, leaderboard] = await Promise.all([
            getUserStats(session.user.id),
            getLeaderboard(undefined, 10),
        ])

        return NextResponse.json({ stats, leaderboard })
    } catch (error: any) {
        console.error("GET /api/stats error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
