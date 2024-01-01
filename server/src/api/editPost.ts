import { Post } from "../models/post";
import { getPostById } from "../util/posts";
import { assertPost } from "../util/types";

export async function editPost(params: any, body: any, set: any) {
    const { id } = params;
    const { fileId, tags } = body;
    if (!id) { set.status = 400; return "No post id provided" }
    let post = await getPostById(id);
    if (!post) { set.status = 404; return "Post not found" }

    if (fileId || fileId === 0) post.fileId = fileId;
    if (tags) post.tags = tags;

    await post.save();
    set.status = 200;
    return assertPost(post);
}