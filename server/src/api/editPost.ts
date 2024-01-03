import { Tag } from "../models/tag";
import { getPostById } from "../util/posts";
import { assertPost, assertTag } from "../util/types";

export async function editPost(params: any, body: any, set: any) {
    const { id } = params;
    const { timestamp, tags } = body;
    if (!id) { set.status = 400; return "No post id provided" }
    let post = await getPostById(id);
    if (!post) { set.status = 404; return "Post not found" }

    console.log(`\n🔧 ⚫ Editing post ${post.id}...`)
    if (timestamp || timestamp === 0) post.file.timestamp = timestamp;
    if (tags) post.tags = tags?.map((tag: any) => assertTag(tag)) as Tag[];;

    console.log(`\n💾 ⚫ Saving post ${post.id} to the database...`);
    await post.save();
    console.log(`💾 ✅ Saved post ${post.id} to the database!`);
    set.status = 200;
    console.log(`\n🔧 ✅ Edited post ${post.id}!`)
    return assertPost(post);
}