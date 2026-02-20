import connectDB from "@/lib/mongodb"
import DrillResult, { IDrillResult, DrillType } from "@/models/DrillResult"
import { Types } from "mongoose"

export interface SaveDrillResultInput {
    userId: string
    drillType: DrillType
    wpm: number
    score?: number
    duration: number
    passageId?: string
    passageTitle?: string
    wordsRead?: number
}

export async function saveDrillResult(
    data: SaveDrillResultInput
): Promise<IDrillResult> {
    await connectDB()
    return DrillResult.create({
        ...data,
        userId: new Types.ObjectId(data.userId),
        completedAt: new Date(),
    })
}

export async function getDrillResultsByUser(
    userId: string,
    limit = 50
): Promise<IDrillResult[]> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return []
    return DrillResult.find({ userId: new Types.ObjectId(userId) })
        .sort({ completedAt: -1 })
        .limit(limit)
        .lean<IDrillResult[]>()
}

export async function getBestDrillResult(
    userId: string,
    drillType: DrillType
): Promise<IDrillResult | null> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return null
    return DrillResult.findOne({
        userId: new Types.ObjectId(userId),
        drillType,
    })
        .sort({ wpm: -1 })
        .lean<IDrillResult>()
}

export async function getDrillStatsByUser(userId: string): Promise<
    {
        drillType: DrillType
        avgWpm: number
        bestWpm: number
        sessions: number
        avgScore: number | null
    }[]
> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return []

    const results = await DrillResult.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$drillType",
                avgWpm: { $avg: "$wpm" },
                bestWpm: { $max: "$wpm" },
                sessions: { $sum: 1 },
                avgScore: { $avg: "$score" },
            },
        },
    ])

    return results.map((r) => ({
        drillType: r._id as DrillType,
        avgWpm: Math.round(r.avgWpm),
        bestWpm: Math.round(r.bestWpm),
        sessions: r.sessions,
        avgScore: r.avgScore != null ? Math.round(r.avgScore) : null,
    }))
}

export async function getLeaderboard(
    drillType?: DrillType,
    limit = 10
): Promise<
    { userId: string; wpm: number; score: number | null; drillType: DrillType }[]
> {
    await connectDB()
    const match = drillType ? { drillType } : {}
    return DrillResult.aggregate([
        { $match: match },
        { $sort: { wpm: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $project: {
                userId: "$userId",
                wpm: 1,
                score: 1,
                drillType: 1,
                userName: "$user.name",
                userEmail: "$user.email",
            },
        },
    ])
}
