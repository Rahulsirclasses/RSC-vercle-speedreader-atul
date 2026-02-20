/**
 * Seed script — creates the first admin user in MongoDB.
 * Run once with: node scripts/seed-admin.mjs
 */

import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const MONGODB_URI = "mongodb://localhost:27017/speed-reading-app"

const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true, lowercase: true },
        password: String,
        image: { type: String, default: null },
        provider: { type: String, default: "credentials" },
        role: { type: String, default: "user" },
        status: { type: String, default: "pending" },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
        lastLogin: { type: Date, default: null },
    },
    { timestamps: true }
)

const User = mongoose.models.User || mongoose.model("User", UserSchema)

async function seed() {
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB:", MONGODB_URI)

    const adminEmail = "admin@speedreading.com"
    const adminPassword = "Admin@123456"
    const adminName = "Admin"

    const existing = await User.findOne({ email: adminEmail })
    if (existing) {
        console.log(`⚠️  Admin already exists: ${adminEmail}`)
        await mongoose.disconnect()
        return
    }

    const hashed = await bcrypt.hash(adminPassword, 12)
    await User.create({
        name: adminName,
        email: adminEmail,
        password: hashed,
        provider: "credentials",
        role: "admin",
        status: "active",
    })

    console.log("🎉 Admin user created!")
    console.log("   Email:   ", adminEmail)
    console.log("   Password:", adminPassword)
    console.log("   Role:     admin")
    console.log("   Status:   active")
    console.log("")
    console.log("👉 Login at: http://localhost:3000/auth/signin")
    console.log("👉 Admin dashboard: http://localhost:3000/admin/users")

    await mongoose.disconnect()
}

seed().catch((err) => {
    console.error("❌ Seed error:", err.message)
    process.exit(1)
})
