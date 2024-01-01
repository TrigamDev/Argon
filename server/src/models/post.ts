import { Schema, model } from "mongoose";

import { Tag } from "./tag";

export interface Post {
    fileId: number
    id: number
    tags: Tag[]
    timestamp: number
    favorites: number
};

const postSchema = new Schema<Post>({
    fileId: { type: Number, required: true },
    id: { type: Number, required: true },
    tags: { type: [Object], required: false },
    timestamp: { type: Number, required: true, default: 0 },
    favorites: { type: Number, required: false, default: 0 }
});

export default model<Post>("Post", postSchema);