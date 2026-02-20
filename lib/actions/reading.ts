"use server"

import connectDB from "@/lib/mongodb"
import ReadingSession from "@/models/ReadingSession"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function saveReadingSession({
    passageId,
    passageTitle,
    startWpm,
    endWpm,
    durationSeconds,
    wordsRead,
    wasRamping = false,
}: {
    passageId?: string
    passageTitle?: string
    startWpm: number
    endWpm: number
    durationSeconds: number
    wordsRead: number
    wasRamping?: boolean
}) {
    try {
        const session = await getServerSession(authOptions)

        // If not logged in, we silently ignore saving
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        await connectDB()

        const newSession = new ReadingSession({
            userId: new mongoose.Types.ObjectId(session.user.id),
            passageId: passageId || "custom",
            passageTitle: passageTitle || "Custom Reading",
            startWpm,
            endWpm,
            duration: durationSeconds,
            wordsRead,
            wasRamping,
            completedAt: new Date()
        })

        await newSession.save()

        return { success: true }
    } catch (error) {
        console.error("Failed to save reading session:", error)
        return { success: false, error: "Internal server error" }
    }
}
