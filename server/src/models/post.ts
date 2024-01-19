import { Schema, model } from "mongoose";

import { Tag } from "./tag";

export interface File {
    url: string
    musicCoverUrl: string | null
    thumbnailUrl: string
    layeredUrl: string | null
    sourceUrl: string | null
    title: string
    type: "image" | "video" | "audio" | "unknown"
    extension: string
    timestamp: number
};

export interface Post {
    file: File
    id: number
    tags: Tag[]
    timestamp: number
    favorites: number
};

const postSchema = new Schema<Post>({
    file: { type: Object, required: true },
    id: { type: Number, required: true },
    tags: { type: [Object], required: false },
    timestamp: { type: Number, required: true, default: 0 },
    favorites: { type: Number, required: false, default: 0 }
});

export default model<Post>("Post", postSchema);