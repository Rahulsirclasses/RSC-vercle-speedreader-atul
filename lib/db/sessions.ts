import connectDB from "@/lib/mongodb"
import ReadingSession, { IReadingSession } from "@/models/ReadingSession"
import { Types } from "mongoose"

export interface SaveReadingSessionInput {
    userId: string
    passageId: string
    passageTitle?: string
    startWpm: number
    endWpm: number
    duration: number
    wordsRead: number
    wasRamping: boolean
}

export async function saveReadingSession(
    data: SaveReadingSessionInput
): Promise<IReadingSession> {
    await connectDB()
    return ReadingSession.create({
        ...data,
        userId: new Types.ObjectId(data.userId),
        completedAt: new Date(),
    })
}

export async function getSessionsByUser(
    userId: string,
    limit = 20
): Promise<IReadingSession[]> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return []
    return ReadingSession.find({ userId: new Types.ObjectId(userId) })
        .sort({ completedAt: -1 })
        .limit(limit)
        .lean<IReadingSession[]>()
}
