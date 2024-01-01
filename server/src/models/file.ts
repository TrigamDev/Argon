import { Schema, model } from "mongoose";

export interface File {
    id: number
    url: string
    thumbnailUrl: string
    layeredUrl: string | null
    sourceUrl: string | null
    title: string
    type: "image" | "video" | "audio" | "unknown"
    extension: string
    timestamp: number
};

const fileSchema = new Schema<File>({
    id: { type: Number, required: true },
    url: { type: String, required: false },
    thumbnailUrl: { type: String, required: false },
    layeredUrl: { type: String, required: false },
    sourceUrl: { type: String, required: false },
    title: { type: String, required: false },
    type: { type: String, required: false },
    extension: { type: String, required: false },
    timestamp: { type: Number, required: true, default: 0 }
});

export default model<File>("File", fileSchema);