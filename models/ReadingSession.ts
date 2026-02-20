import mongoose, { Schema, Document, Model } from "mongoose"

export interface IReadingSession extends Document {
    userId: mongoose.Types.ObjectId
    passageId: string
    passageTitle?: string
    startWpm: number
    endWpm: number
    duration: number       // seconds
    wordsRead: number
    wasRamping: boolean
    completedAt: Date
    createdAt: Date
    updatedAt: Date
}

const ReadingSessionSchema = new Schema<IReadingSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        passageId: {
            type: String,
            required: true,
        },
        passageTitle: {
            type: String,
            default: null,
        },
        startWpm: {
            type: Number,
            required: true,
            min: 0,
        },
        endWpm: {
            type: Number,
            required: true,
            min: 0,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        wordsRead: {
            type: Number,
            required: true,
            min: 0,
        },
        wasRamping: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    { timestamps: true }
)

ReadingSessionSchema.index({ userId: 1, completedAt: -1 })
ReadingSessionSchema.index({ userId: 1 })

const ReadingSession: Model<IReadingSession> =
    mongoose.models.ReadingSession ||
    mongoose.model<IReadingSession>("ReadingSession", ReadingSessionSchema)

export default ReadingSession
