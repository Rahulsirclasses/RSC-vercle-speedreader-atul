import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

// Quick debug route — DELETE this file after login works
// GET /api/debug-auth
export async function GET() {
    try {
        await connectDB()

        const user = await User.findOne({ email: "admin@speedreading.com" })
        if (!user) {
            return NextResponse.json({ error: "User not found in DB" }, { status: 404 })
        }

        const passwordMatch = await bcrypt.compare("Admin@123456", user.password || "")

        return NextResponse.json({
            found: true,
            email: user.email,
            provider: user.provider,
            role: user.role,
            status: user.status,
            hasPassword: !!user.password,
            passwordMatch,
            passwordLength: user.password?.length,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
    }
}
