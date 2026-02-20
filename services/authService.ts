import bcrypt from "bcryptjs"
import {
    createUser,
    getUserByEmail,
    updateLastLogin,
} from "@/lib/db/user"

const SALT_ROUNDS = 12

/**
 * Register a new email/password user.
 * Created with status = "pending" — needs admin approval to log in.
 */
export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    if (!name?.trim()) throw new Error("Name is required")
    if (!email?.trim()) throw new Error("Email is required")
    if (!password || password.length < 6)
        throw new Error("Password must be at least 6 characters")

    const existing = await getUserByEmail(email)
    if (existing) throw new Error("An account with this email already exists")

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await createUser(name.trim(), email.toLowerCase().trim(), hashedPassword)
    return { user }
}

/**
 * Validate credentials for NextAuth CredentialsProvider.
 * Returns null (block login) if user not found, wrong password, or non-active status.
 */
export async function loginUser(email: string, password: string) {
    if (!email || !password) return null

    console.log("🔍 [AuthService] Checking credentials for:", email);
    const user = await getUserByEmail(email)
    if (!user) {
        console.log("❌ [AuthService] User not found for email:", email);
        return null;
    }

    // Block non-credentials users trying to use password login
    if (user.provider !== "credentials") {
        console.log("❌ [AuthService] User provider mismatch:", user.provider);
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password || "")
    if (!isValid) {
        console.log("❌ [AuthService] Invalid password for:", email);
        return null;
    }

    // Enforce admin approval
    // We throw errors so the UI can show specific messages
    if (user.status === "pending") {
        console.log("❌ [AuthService] User pending approval");
        throw new Error("PENDING_APPROVAL")
    }
    if (user.status === "disabled") {
        console.log("❌ [AuthService] User disabled");
        throw new Error("ACCOUNT_DISABLED")
    }

    // Record last login
    await updateLastLogin(user._id.toString())

    console.log("✅ [AuthService] Login successful for:", email);

    // Return safe user object
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image || null,
        role: user.role,
        status: user.status,
    }
}
