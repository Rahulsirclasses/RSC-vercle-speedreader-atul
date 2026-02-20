import mongoose, { Schema, Document, Model } from "mongoose"

export type DrillType =
    | "speed-sprint"
    | "comprehension-time"
    | "word-reveal"
    | "running-words"
    | "main-idea"
    | "reverse-reading"
    | "fixation-breaker"
    | "blind-spot"

export interface IDrillResult extends Document {
    userId: mongoose.Types.ObjectId
    drillType: DrillType
    wpm: number
    score?: number         // comprehension percentage (0-100)
    duration: number       // seconds
    passageId?: string
    passageTitle?: string
    wordsRead?: number
    completedAt: Date
    createdAt: Date
    updatedAt: Date
}

const DrillResultSchema = new Schema<IDrillResult>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        drillType: {
            type: String,
            required: true,
            enum: [
                "speed-sprint",
                "comprehension-time",
                "word-reveal",
                "running-words",
                "main-idea",
                "reverse-reading",
                "fixation-breaker",
                "blind-spot",
            ],
        },
        wpm: {
            type: Number,
            required: true,
            min: 0,
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        passageId: {
            type: String,
            default: null,
        },
        passageTitle: {
            type: String,
            default: null,
        },
        wordsRead: {
            type: Number,
            default: null,
        },
        completedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    { timestamps: true }
)

// Indexes for stats queries and leaderboard
DrillResultSchema.index({ userId: 1, completedAt: -1 })
DrillResultSchema.index({ userId: 1, drillType: 1 })
DrillResultSchema.index({ wpm: -1 })
DrillResultSchema.index({ drillType: 1, wpm: -1 }) // for leaderboard per drill

const DrillResult: Model<IDrillResult> =
    mongoose.models.DrillResult ||
    mongoose.model<IDrillResult>("DrillResult", DrillResultSchema)

export default DrillResult
