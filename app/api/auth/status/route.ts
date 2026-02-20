import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserById } from "@/lib/db/user"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ status: "unauthenticated" })
        }

        const user = await getUserById(session.user.id)

        if (!user) {
            return NextResponse.json({ status: "not_found" })
        }

        return NextResponse.json({
            status: user.status,
            role: user.role
        })
    } catch (error) {
        console.error("Auth status check error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
