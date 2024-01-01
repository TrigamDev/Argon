import { Post } from "../models/post";

import { getPostById } from "../util/posts";
import { assertPost } from "../util/types";

export async function getPost(params: any): Promise<Post | null> {
    let found = await getPostById(Number(params.id));
    if (found) return assertPost(found);
    return null;
}