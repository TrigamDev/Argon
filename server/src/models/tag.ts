import { Schema, model } from "mongoose";

export interface Tag {
    name: string
    type: string
    safe: boolean
}

export interface FilterTag {
    name: string
    type: string
    exclude: boolean
}

const tagSchema = new Schema<Tag>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    safe: { type: Boolean, required: true, default: true }
});

export default model<Tag>("Tag", tagSchema);