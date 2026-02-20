import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { makeAdmin } from "@/services/adminService"

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
        const user = await makeAdmin(resolvedParams.id)
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        console.error("PATCH /api/admin/users/[id]/make-admin error:", error)
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }
}
