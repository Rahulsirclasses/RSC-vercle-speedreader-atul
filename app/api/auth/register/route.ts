import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/services/authService"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            )
        }

        await registerUser(name, email, password)

        return NextResponse.json(
            { success: true, message: "Account created successfully" },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Registration error:", error)

        // Handle duplicate key error from MongoDB
        if (error.code === 11000 || error.message?.includes("already exists")) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Registration failed" },
            { status: 400 }
        )
    }
}
