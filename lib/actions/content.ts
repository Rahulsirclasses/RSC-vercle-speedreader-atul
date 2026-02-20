"use server"

import connectDB from "@/lib/mongodb"
import Passage from "@/models/Passage"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import User from "@/models/User"

export async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return false
    }

    await connectDB()
    const user = await User.findById(session.user.id)
    return user?.role === "admin"
}

export async function getPassages() {
    try {
        await connectDB()
        const passages = await Passage.find().sort({ createdAt: -1 }).lean()

        // Convert ObjectIds to strings for Client Components
        return JSON.parse(JSON.stringify(passages))
    } catch (error) {
        console.error("Failed to fetch passages:", error)
        return []
    }
}

export async function getPassageById(id: string) {
    try {
        await connectDB()
        const passage = await Passage.findById(id).lean()
        if (!passage) return null
        return JSON.parse(JSON.stringify(passage))
    } catch (error) {
        console.error("Failed to fetch passage:", error)
        return null
    }
}

export async function createPassage(data: any) {
    try {
        const isAdmin = await checkAdmin()
        if (!isAdmin) return { success: false, error: "Unauthorized" }

        await connectDB()
        const newPassage = new Passage(data)
        await newPassage.save()

        return { success: true, passage: JSON.parse(JSON.stringify(newPassage)) }
    } catch (error: any) {
        console.error("Failed to create passage:", error)
        return { success: false, error: error.message || "Failed to create passage" }
    }
}

export async function updatePassage(id: string, data: any) {
    try {
        const isAdmin = await checkAdmin()
        if (!isAdmin) return { success: false, error: "Unauthorized" }

        await connectDB()
        const updated = await Passage.findByIdAndUpdate(id, data, { new: true }).lean()

        if (!updated) return { success: false, error: "Passage not found" }

        return { success: true, passage: JSON.parse(JSON.stringify(updated)) }
    } catch (error: any) {
        console.error("Failed to update passage:", error)
        return { success: false, error: error.message || "Failed to update passage" }
    }
}

export async function deletePassage(id: string) {
    try {
        const isAdmin = await checkAdmin()
        if (!isAdmin) return { success: false, error: "Unauthorized" }

        await connectDB()
        await Passage.findByIdAndDelete(id)

        return { success: true }
    } catch (error: any) {
        console.error("Failed to delete passage:", error)
        return { success: false, error: error.message || "Failed to delete passage" }
    }
}

export async function getRandomPassage(options?: { minWords?: number, maxWords?: number, difficulty?: string }) {
  try {
    await connectDB();
    const query: any = {};
    if (options?.difficulty) query.difficulty = options.difficulty;
    if (options?.minWords || options?.maxWords) {
      query.wordCount = {};
      if (options.minWords) query.wordCount.$gte = options.minWords;
      if (options.maxWords) query.wordCount.$lte = options.maxWords;
    }

    const count = await Passage.countDocuments(query);
    if (count === 0) {
      const anyPassage = await Passage.aggregate([{ $sample: { size: 1 } }]);
      return anyPassage.length > 0 ? JSON.parse(JSON.stringify(anyPassage[0])) : null;
    }

    const random = await Passage.aggregate([
      { $match: query },
      { $sample: { size: 1 } }
    ]);

    return random.length > 0 ? JSON.parse(JSON.stringify(random[0])) : null;
  } catch (error) {
    console.error("Failed to fetch random passage:", error);
    return null;
  }
}
