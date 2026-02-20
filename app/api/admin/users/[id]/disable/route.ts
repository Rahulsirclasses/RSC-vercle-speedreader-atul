import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { disableUser } from "@/services/adminService"

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const resolvedParams = await context.params
        // Prevent admin from disabling themselves
        if (resolvedParams.id === session.user.id) {
            return NextResponse.json({ error: "Cannot disable your own account" }, { status: 400 })
        }

        const user = await disableUser(resolvedParams.id)
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        console.error("PATCH /api/admin/users/[id]/disable error:", error)
        return NextResponse.json({ error: "Failed to disable user" }, { status: 500 })
    }
}
