import { Post } from "../models/post";

import { getPostById } from "../util/posts";
import { assertPost } from "../util/types";

export async function getPost(req: any, res: any): Promise<Post | null> {
    let id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    let found = await getPostById(id);
    if (found) return res.status(200).json(assertPost(found));
    return res.status(404).json({ error: "Post not found" });
}