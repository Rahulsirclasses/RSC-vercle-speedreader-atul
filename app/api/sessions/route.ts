import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { saveReadingSession, getSessionsByUser } from "@/lib/db/sessions"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const sessions = await getSessionsByUser(session.user.id, 20)
        return NextResponse.json({ sessions })
    } catch (error: any) {
        console.error("GET /api/sessions error:", error)
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { passageId, passageTitle, startWpm, endWpm, duration, wordsRead, wasRamping } = body

        if (!passageId || startWpm == null || endWpm == null || duration == null || wordsRead == null) {
            return NextResponse.json(
                { error: "passageId, startWpm, endWpm, duration, and wordsRead are required" },
                { status: 400 }
            )
        }

        const result = await saveReadingSession({
            userId: session.user.id,
            passageId,
            passageTitle,
            startWpm,
            endWpm,
            duration,
            wordsRead,
            wasRamping: !!wasRamping,
        })

        return NextResponse.json({ success: true, result }, { status: 201 })
    } catch (error: any) {
        console.error("POST /api/sessions error:", error)
        return NextResponse.json({ error: "Failed to save reading session" }, { status: 500 })
    }
}
