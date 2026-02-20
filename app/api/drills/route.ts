import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { saveDrillResult, getDrillResultsByUser, getDrillStatsByUser } from "@/lib/db/drills"
import { DrillType } from "@/models/DrillResult"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const stats = await getDrillStatsByUser(session.user.id)
        const recent = await getDrillResultsByUser(session.user.id, 20)

        return NextResponse.json({ stats, recent })
    } catch (error: any) {
        console.error("GET /api/drills error:", error)
        return NextResponse.json({ error: "Failed to fetch drill data" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { drillType, wpm, score, duration, passageId, passageTitle, wordsRead } = body

        if (!drillType || wpm == null || duration == null) {
            return NextResponse.json(
                { error: "drillType, wpm, and duration are required" },
                { status: 400 }
            )
        }

        const result = await saveDrillResult({
            userId: session.user.id,
            drillType: drillType as DrillType,
            wpm,
            score,
            duration,
            passageId,
            passageTitle,
            wordsRead,
        })

        return NextResponse.json({ success: true, result }, { status: 201 })
    } catch (error: any) {
        console.error("POST /api/drills error:", error)
        return NextResponse.json({ error: "Failed to save drill result" }, { status: 500 })
    }
}
