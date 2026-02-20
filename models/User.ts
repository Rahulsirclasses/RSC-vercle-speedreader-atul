import mongoose, { Schema, Document, Model } from "mongoose"

export type UserStatus = "pending" | "active" | "disabled" | "approve"
export type UserRole = "user" | "admin"
export type UserProvider = "credentials" | "google"

export interface IUser extends Document {
    name: string
    email: string
    password?: string            // null for Google users
    image?: string
    provider: UserProvider
    role: UserRole
    status: UserStatus
    resetPasswordToken?: string
    resetPasswordExpires?: Date
    lastLogin?: Date
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name too long"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        password: {
            type: String,
            default: null, // null for OAuth users
        },
        image: {
            type: String,
            default: null,
        },
        provider: {
            type: String,
            enum: ["credentials", "google"],
            default: "credentials",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["pending", "active", "disabled", "approve"],
            default: "pending",
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
)

// Indexes (email uniqueness is handled by unique:true in field definition above)
UserSchema.index({ status: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ resetPasswordToken: 1 })
UserSchema.index({ createdAt: -1 })

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
