"use server"

import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import ReadingSession from "@/models/ReadingSession"
import DrillResult from "@/models/DrillResult"
import mongoose from "mongoose"

export async function getUserStats(userId: string) {
    try {
        await connectDB()

        const objectId = new mongoose.Types.ObjectId(userId)

        // 1. Overview Stats
        // Aggregate Reading Sessions for Average WPM and Reading Streak
        const readingStats = await ReadingSession.aggregate([
            { $match: { userId: objectId } },
            {
                $group: {
                    _id: null,
                    avgWpm: { $avg: "$endWpm" },
                    totalSessions: { $sum: 1 },
                    lastSessionDate: { $max: "$completedAt" },
                    firstSessionDate: { $min: "$completedAt" },
                }
            }
        ])

        // Aggregate Drill Results for Average Comprehension (score exists only on some drills)
        const comprehensionStats = await DrillResult.aggregate([
            { $match: { userId: objectId, score: { $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgComprehension: { $avg: "$score" }
                }
            }
        ])

        // Calculate Reading Streak
        const streakStats = await calculateStreak(objectId)

        // 2. Weekly Progress Chart Data
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const weeklyProgress = await ReadingSession.aggregate([
            { $match: { userId: objectId, completedAt: { $gte: oneWeekAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: "$completedAt" }, // 1 (Sun) to 7 (Sat)
                    avgWpm: { $avg: "$endWpm" }
                }
            },
            { $sort: { "_id": 1 } }
        ])

        // Map weekly progress over the last 7 days to chart format (Mon-Sun)
        const weeklyProgressMap = new Map<number, number>()
        weeklyProgress.forEach((item) => {
            // Adjust dayOfWeek so Mon=1, Sun=7
            let mappedDay = item._id - 1
            if (mappedDay === 0) mappedDay = 7
            weeklyProgressMap.set(mappedDay, item.avgWpm)
        })

        const chartData = []
        const todayDay = new Date().getDay() || 7 // 1-7 (Mon-Sun)
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        for (let i = 6; i >= 0; i--) {
            let dayIndex = todayDay - i
            if (dayIndex <= 0) dayIndex += 7
            chartData.push({
                day: daysOfWeek[dayIndex - 1],
                wpm: Math.round(weeklyProgressMap.get(dayIndex) || 0)
            })
        }

        // 3. Drill Performance Stats
        const drillStats = await DrillResult.aggregate([
            { $match: { userId: objectId } },
            {
                $group: {
                    _id: "$drillType",
                    bestSpeed: { $max: "$wpm" },
                    avgSpeed: { $avg: "$wpm" },
                    avgComprehension: { $avg: "$score" },
                    totalSessions: { $sum: 1 }
                }
            }
        ])

        // Map drill stats to an easy to render format
        const formattedDrillStats = drillStats.reduce((acc, current) => {
            acc[current._id] = {
                bestSpeed: Math.round(current.bestSpeed || 0),
                avgSpeed: Math.round(current.avgSpeed || 0),
                avgComprehension: Math.round(current.avgComprehension || 0),
                sessions: current.totalSessions
            }
            return acc
        }, {} as Record<string, any>)

        // 4. Recent Comprehension Tests
        const recentTests = await DrillResult.find({ userId: objectId, score: { $ne: null } })
            .sort({ completedAt: -1 })
            .limit(5)
            .lean()

        const formattedRecentTests = recentTests.map((test) => ({
            id: test._id.toString(),
            date: new Date(test.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            passage: test.passageTitle || test.drillType,
            wpm: test.wpm,
            score: test.score
        }))

        // Helper to format average numbers
        const avgWpm = readingStats.length > 0 ? Math.round(readingStats[0].avgWpm) : 0
        const avgComprehension = comprehensionStats.length > 0 ? Math.round(comprehensionStats[0].avgComprehension) : 0

        return {
            overview: {
                avgWpm,
                avgComprehension,
                streak: streakStats.currentStreak,
                rank: "Top " + await calculateUserRank(objectId, avgWpm) + "%"
            },
            chartData,
            drillStats: formattedDrillStats,
            recentTests: formattedRecentTests
        }

    } catch (error) {
        console.error("Error fetching user stats:", error)
        throw new Error("Failed to fetch user stats")
    }
}

async function calculateStreak(userId: mongoose.Types.ObjectId): Promise<{ currentStreak: number }> {
    // Basic streak calculation: consecutive days with at least one reading session or drill
    // This is a simplified version. A robust version would look at distinct dates.
    const sessions = await ReadingSession.aggregate([
        { $match: { userId } },
        {
            $project: {
                dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }
            }
        },
        { $group: { _id: "$dateStr" } },
        { $sort: { _id: -1 } }
    ])

    if (sessions.length === 0) return { currentStreak: 0 }

    let currentStreak = 0;
    let targetDate = new Date();
    // Normalize targetDate to midnight
    targetDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
        const sessionDate = new Date(sessions[i]._id);
        sessionDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(targetDate.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0 || diffDays === 1) {
            // Count today or yesterday as continuing the streak
            currentStreak++;
            targetDate = sessionDate; // Move target back day by day
        } else if (diffDays > 1 && i === 0) {
            // The most recent session is more than 1 day ago. Streak is 0.
            break;
        } else {
            // Gap in days, streak broken
            break;
        }
    }

    return { currentStreak }
}

async function calculateUserRank(userId: mongoose.Types.ObjectId, userAvgWpm: number): Promise<number> {
    if (userAvgWpm === 0) return 100 // default rank
    // Find how many users have a higher avg WPM
    // For simplicity, we can do a global aggregation. In prod, this should be cached or pre-computed
    const allUsersAvg = await ReadingSession.aggregate([
        {
            $group: {
                _id: "$userId",
                avgWpm: { $avg: "$endWpm" }
            }
        }
    ])

    const totalUsers = allUsersAvg.length
    if (totalUsers <= 1) return 1 // Top 1% if only user

    const usersWithHigherWpm = allUsersAvg.filter(u => u.avgWpm > userAvgWpm).length
    const rankPercentile = Math.ceil(((usersWithHigherWpm + 1) / totalUsers) * 100)

    // Ensure it looks nice (e.g. 1%, 5%, 10%, etc)
    const roundedPercentile = Math.ceil(rankPercentile / 5) * 5
    return Math.max(1, Math.min(100, roundedPercentile)) // Bound between 1 and 100
}

export async function getLeaderboard() {
    try {
        await connectDB()

        // Get Top Speed Readers (Highest Avg WPM across reading sessions)
        const topReaders = await ReadingSession.aggregate([
            {
                $group: {
                    _id: "$userId",
                    avgWpm: { $avg: "$endWpm" },
                }
            },
            { $sort: { avgWpm: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    avgWpm: { $round: ["$avgWpm", 0] },
                    name: "$user.name",
                    image: "$user.image"
                }
            }
        ])

        // Get Top Comprehenders (Highest Avg Score across Drill Results)
        const topComprehenders = await DrillResult.aggregate([
            { $match: { score: { $ne: null } } },
            {
                $group: {
                    _id: "$userId",
                    avgComprehension: { $avg: "$score" },
                    avgWpm: { $avg: "$wpm" }
                }
            },
            { $sort: { avgComprehension: -1, avgWpm: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    avgComprehension: { $round: ["$avgComprehension", 0] },
                    avgWpm: { $round: ["$avgWpm", 0] },
                    name: "$user.name",
                    image: "$user.image"
                }
            }
        ])

        return {
            topSpeedReaders: topReaders.map(r => ({
                id: r._id.toString(),
                name: r.name,
                image: r.image,
                wpm: r.avgWpm,
                // Optional: We could do a second lookup for comprehension, but estimating for now
                comprehension: "N/A"
            })),
            topComprehenders: topComprehenders.map(c => ({
                id: c._id.toString(),
                name: c.name,
                image: c.image,
                comprehension: c.avgComprehension,
                wpm: c.avgWpm
            }))
        }
    } catch (error) {
        console.error("Error fetching leaderboard:", error)
        throw new Error("Failed to fetch leaderboard")
    }
}
