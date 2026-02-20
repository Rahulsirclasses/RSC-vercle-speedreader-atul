import connectDB from "@/lib/mongodb"
import DrillResult from "@/models/DrillResult"
import ReadingSession from "@/models/ReadingSession"
import { Types } from "mongoose"

export interface UserStats {
    averageWpm: number
    bestWpm: number
    totalSessions: number
    averageComprehension: number
    readingStreak: number
    totalWordsRead: number
    drillBreakdown: {
        drillType: string
        avgWpm: number
        bestWpm: number
        sessions: number
    }[]
}

export async function getUserStats(userId: string): Promise<UserStats> {
    await connectDB()

    if (!Types.ObjectId.isValid(userId)) {
        return {
            averageWpm: 0,
            bestWpm: 0,
            totalSessions: 0,
            averageComprehension: 0,
            readingStreak: 0,
            totalWordsRead: 0,
            drillBreakdown: [],
        }
    }

    const userObjectId = new Types.ObjectId(userId)

    // Aggregate drill stats
    const drillAgg = await DrillResult.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: null,
                avgWpm: { $avg: "$wpm" },
                bestWpm: { $max: "$wpm" },
                totalSessions: { $sum: 1 },
                avgScore: { $avg: "$score" },
                totalWords: { $sum: { $ifNull: ["$wordsRead", 0] } },
            },
        },
    ])

    // Breakdown per drill type
    const drillBreakdown = await DrillResult.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: "$drillType",
                avgWpm: { $avg: "$wpm" },
                bestWpm: { $max: "$wpm" },
                sessions: { $sum: 1 },
            },
        },
        { $sort: { sessions: -1 } },
    ])

    // Reading session stats
    const sessionAgg = await ReadingSession.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: null,
                totalWords: { $sum: "$wordsRead" },
                sessions: { $sum: 1 },
            },
        },
    ])

    const ds = drillAgg[0]
    const ss = sessionAgg[0]

    return {
        averageWpm: ds ? Math.round(ds.avgWpm) : 0,
        bestWpm: ds ? Math.round(ds.bestWpm) : 0,
        totalSessions: (ds?.totalSessions || 0) + (ss?.sessions || 0),
        averageComprehension: ds?.avgScore ? Math.round(ds.avgScore) : 0,
        readingStreak: 0, // Can be computed from session dates in future
        totalWordsRead: (ds?.totalWords || 0) + (ss?.totalWords || 0),
        drillBreakdown: drillBreakdown.map((d) => ({
            drillType: d._id,
            avgWpm: Math.round(d.avgWpm),
            bestWpm: Math.round(d.bestWpm),
            sessions: d.sessions,
        })),
    }
}
