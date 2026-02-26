import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { loginUser } from "@/services/authService"
import { upsertGoogleUser, updateLastLogin } from "@/lib/db/user"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                try {
                    const user = await loginUser(credentials.email, credentials.password)
                    return user
                } catch (error: any) {
                    console.error("❌ [Credentials] Error in authorize:", error);

                    if (
                        error.message === "PENDING_APPROVAL" ||
                        error.message === "ACCOUNT_DISABLED"
                    ) {
                        throw new Error(error.message)
                    }
                    return null
                }
            },
        }),

        // Google Provider - Conditional on credentials existing
        ...(process.env.GOOGLE_CLIENT_ID &&
            process.env.GOOGLE_CLIENT_SECRET &&
            !process.env.GOOGLE_CLIENT_ID.includes("your-google-client-id")
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    authorization: {
                        params: {
                            prompt: "consent",
                            access_type: "offline",
                            response_type: "code",
                        },
                    },
                }),
            ]
            : []),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async signIn({ user, account }) {
            try {
                // DEBUG LOGS START
                console.log("🔍 Google SignIn Callback Start", {
                    provider: account?.provider,
                    email: user?.email,
                    name: user?.name
                });

                if (account?.provider === "google") {
                    console.log("🔍 Upserting Google User...");

                    const dbUser = await upsertGoogleUser({
                        name: user.name || "Google User",
                        email: user.email!,
                        image: user.image || undefined,
                    })

                    console.log("🔍 Google User Upserted:", dbUser ? dbUser._id : "NULL");

                    if (!dbUser) {
                        console.error("❌ Google User Upsert Failed (returned null/undefined)");
                        return "/auth/signin?error=OAuthSignin"
                    }

                    if (dbUser.status === "pending") {
                        console.log("🔍 Google User Pending");
                        return "/auth/signin?error=PENDING_APPROVAL"
                    }
                    if (dbUser.status === "disabled") {
                        console.log("🔍 Google User Disabled");
                        return "/auth/signin?error=ACCOUNT_DISABLED"
                    }

                    // Handle manual "approve" status gracefully by treating it as active
                    if (dbUser.status === "approve" || dbUser.status === "active") {
                        console.log("✅ Google User Active/Approved");
                    }

                    await updateLastLogin(dbUser._id.toString())

                        ; (user as any).id = dbUser._id.toString()
                        ; (user as any).role = dbUser.role
                        ; (user as any).status = dbUser.status

                    return true;
                }
                return true
            } catch (error: any) {
                console.error("❌ Google Signin Error:", error.message, error.stack);
                return "/auth/signin?error=OAuthSignin"
            }
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id || user.id
                token.name = user.name
                token.email = user.email
                token.picture = user.image
                token.role = (user as any).role || "user"
                token.status = (user as any).status || "pending"
            }
            return token
        },

        async session({ session, token }) {
            const start = performance.now();
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.name = token.name as string
                session.user.email = token.email as string
                session.user.image = token.picture as string | null
                session.user.role = token.role as string
                session.user.status = token.status as string
            }
            console.log(`[PERF:NextAuth] session callback resolved in ${(performance.now() - start).toFixed(2)}ms`);
            return session
        },
    },

    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
