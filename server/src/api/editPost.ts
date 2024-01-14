import { Tag } from "../models/tag";
import { getPostById } from "../util/posts";
import { assertPost, assertTag } from "../util/types";

export async function editPost(req: any, res: any,) {
    const { id } = req?.params;
    const { timestamp, tags } = req?.body;
    if (!id) return res.status(400).json({ error: "No id provided" });
    let post = await getPostById(id);
    if (!post) return res.status(404).json({ error: "No post found" });

    console.log(`\n🔧 ⚫ Editing post ${post.id}...`)
    if (timestamp || timestamp === 0) post.file.timestamp = timestamp;
    if (tags) post.tags = tags?.map((tag: any) => assertTag(tag)) as Tag[];;

    console.log(`\n💾 ⚫ Saving post ${post.id} to the database...`);
    await post.save();
    console.log(`💾 ✅ Saved post ${post.id} to the database!`);
    console.log(`\n🔧 ✅ Edited post ${post.id}!`)
    return res.status(200).json(assertPost(post));
}