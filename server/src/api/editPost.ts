import PostModel from '../models/post';
import { Tag } from "../models/tag";
import { getPostById } from "../util/posts";
import { assertPost, assertTag, assertTagList } from "../util/types";

export default async function editPost(req: any, res: any,) {
    const { id } = req?.params;
    const { timestamp, tags, sourceUrl } = req?.body;
    if (!id) return res.status(400).json({ error: "No id provided" });
    let post = await getPostById(id);
    if (!post) return res.status(404).json({ error: "No post found" });

    console.log(`\n🔧 ⚫ Editing post ${post.id}...\n`)
    if (timestamp || timestamp === 0) {
        console.log(`🔧 🕒 Editing post ${post.id}'s timestamp to: ${new Date(timestamp)}`)
        post.file.timestamp = timestamp;
    };
    if (post && tags) {
        console.log(`🔧 🏷️  Editing post ${post.id}'s tags to: ${JSON.stringify(tags)}`)
        post.tags = assertTagList(tags);
        if (post.tags.length > 1) {
            console.log(`🔧 🏷️  Removing untagged tag from post ${post.id}`)
            post.tags = post.tags.filter((tag: Tag) => tag.name !== "untagged");
        }
        if (post.tags.length === 0) {
            console.log(`🔧 🏷️  Adding untagged tag to post ${post.id}`)
            post.tags.push(assertTag({ name: "untagged", type: "meta", safe: true }));
        }
    };
    if (sourceUrl) {
        console.log(`🔧 🌐 Editing post ${post.id}'s sourceUrl to: ${sourceUrl}`)
        post.file.sourceUrl = sourceUrl;
    };

    console.log(`\n💾 ⚫ Saving post ${post.id} to the database...`);
    await PostModel.findOneAndUpdate({ id: id }, {
        file: post.file,
        tags: post.tags,
    }, { new: true });

    console.log(`💾 ✅ Saved post ${post.id} to the database!`);
    console.log(`\n🔧 ✅ Edited post ${post.id}!`)
    return res.status(200).json(assertPost(post));
}