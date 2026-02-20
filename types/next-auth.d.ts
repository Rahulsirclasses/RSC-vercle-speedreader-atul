import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name: string
            email: string
            image?: string | null
            role: string         // "user" | "admin"
            status: string       // "pending" | "active" | "disabled"
        }
    }

    interface User {
        id: string
        name: string
        email: string
        image?: string | null
        role?: string
        status?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        status: string
    }
}
