import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchAllUsers } from "@/services/adminService"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const users = await fetchAllUsers()
        return NextResponse.json({ users })
    } catch (error: any) {
        console.error("GET /api/admin/users error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
