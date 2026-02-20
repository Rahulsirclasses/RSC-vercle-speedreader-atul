import mongoose, { Schema, Document } from "mongoose"

export interface IPassage extends Document {
    title: string
    content: string
    excerpt: string
    wordCount: number
    estimatedTime: string
    difficulty: "Easy" | "Medium" | "Hard"
    category: string
    createdAt: Date
    updatedAt: Date
}

const PassageSchema = new Schema<IPassage>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        excerpt: { type: String, required: true },
        wordCount: { type: Number, required: true },
        estimatedTime: { type: String, required: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
        category: { type: String, required: true },
    },
    { timestamps: true }
)

export default mongoose.models.Passage || mongoose.model<IPassage>("Passage", PassageSchema)
