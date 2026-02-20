import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Passage from "@/models/Passage"
import { passages, fallbackPassage } from "@/lib/passages"

export async function GET() {
    try {
        await connectDB()

        // Check if we already have passages to avoid duplicates
        const count = await Passage.countDocuments()
        if (count > 0) {
            return NextResponse.json({ message: "Passages already migrated", count })
        }

        // Format hardcoded passages for MongoDB
        const allPassages = [...passages, fallbackPassage].map((p: any) => ({
            title: p.title,
            content: p.content,
            excerpt: p.excerpt,
            wordCount: p.wordCount,
            estimatedTime: p.estimatedTime,
            difficulty: p.difficulty,
            category: p.category || "General",
        }))

        // Insert all
        await Passage.insertMany(allPassages)

        return NextResponse.json({ message: "Migration successful", migratedCount: allPassages.length })
    } catch (error: any) {
        console.error("Migration error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
