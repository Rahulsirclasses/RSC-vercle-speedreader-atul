import connectDB from "@/lib/mongodb"
import User, { IUser, UserStatus, UserRole } from "@/models/User"
import { Types } from "mongoose"

// ── Create / Find ──────────────────────────────────────────────────────────

export async function createUser(
    name: string,
    email: string,
    hashedPassword: string
): Promise<IUser> {
    await connectDB()
    return User.create({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        provider: "credentials",
        status: "pending",
        role: "user",
    })
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    await connectDB()
    return User.findOne({ email: email.toLowerCase().trim() }).lean<IUser>()
}

export async function getUserById(id: string): Promise<IUser | null> {
    await connectDB()
    if (!Types.ObjectId.isValid(id)) return null
    return User.findById(id).lean<IUser>()
}

// ── Google OAuth Upsert ────────────────────────────────────────────────────

export async function upsertGoogleUser(profile: {
    name: string
    email: string
    image?: string
}): Promise<IUser> {
    await connectDB()

    const existing = await User.findOne({
        email: profile.email.toLowerCase().trim(),
    })

    if (existing) {
        // Update image if changed, record last Google profile update
        existing.image = profile.image || existing.image
        existing.name = profile.name || existing.name
        await existing.save()
        return existing.toObject() as IUser
    }

    // New Google user — always starts pending
    console.log("🔍 Creating new Google user with profile:", JSON.stringify(profile, null, 2));
    try {
        const newUser = await User.create({
            name: profile.name,
            email: profile.email.toLowerCase().trim(),
            image: profile.image || null,
            provider: "google",
            status: "pending",
            role: "user",
            password: null,
        });
        console.log("✅ New Google user created:", newUser._id);
        return newUser;
    } catch (error: any) {
        console.error("🔥🔥🔥 User.create failed:", error.message);
        if (error.errors) {
            console.error("🔥🔥🔥 Validation errors:", JSON.stringify(error.errors, null, 2));
        }
        throw error;
    }
}

// ── Password Reset ─────────────────────────────────────────────────────────

export async function updateUserPassword(
    userId: string,
    hashedPassword: string
): Promise<boolean> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return false
    const result = await User.findByIdAndUpdate(userId, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
    })
    return !!result
}

export async function setResetToken(
    email: string,
    token: string,
    expires: Date
): Promise<boolean> {
    await connectDB()
    const result = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { resetPasswordToken: token, resetPasswordExpires: expires }
    )
    return !!result
}

export async function getUserByResetToken(
    token: string
): Promise<IUser | null> {
    await connectDB()
    return User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
    }).lean<IUser>()
}

// ── Last Login ─────────────────────────────────────────────────────────────

export async function updateLastLogin(userId: string): Promise<void> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() })
}

// ── Admin Operations ───────────────────────────────────────────────────────

export async function getAllUsers(): Promise<IUser[]> {
    await connectDB()
    return User.find({})
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 })
        .lean<IUser[]>()
}

export async function updateUserStatus(
    userId: string,
    status: UserStatus
): Promise<IUser | null> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return null
    return User.findByIdAndUpdate(userId, { status }, { new: true })
        .select("-password")
        .lean<IUser>()
}

export async function updateUserRole(
    userId: string,
    role: UserRole
): Promise<IUser | null> {
    await connectDB()
    if (!Types.ObjectId.isValid(userId)) return null
    return User.findByIdAndUpdate(userId, { role }, { new: true })
        .select("-password")
        .lean<IUser>()
}
