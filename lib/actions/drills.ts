"use server"

import connectDB from "@/lib/mongodb"
import DrillResult from "@/models/DrillResult"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function saveDrillResult({
    drillType,
    wpm,
    score,
    duration,
    passageId,
    passageTitle,
    wordsRead,
}: {
    drillType: string
    wpm: number
    score?: number
    duration: number
    passageId?: string
    passageTitle?: string
    wordsRead?: number
}) {
    try {
        const session = await getServerSession(authOptions)

        // If not logged in, we silently ignore saving. 
        // The drill still functions for the user locally.
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        await connectDB()

        const newResult = new DrillResult({
            userId: new mongoose.Types.ObjectId(session.user.id),
            drillType,
            wpm,
            score,
            duration,
            passageId,
            passageTitle,
            wordsRead,
            completedAt: new Date()
        })

        await newResult.save()

        return { success: true }
    } catch (error) {
        console.error("Failed to save drill result:", error)
        return { success: false, error: "Internal server error" }
    }
}
