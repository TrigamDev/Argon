import { getPostsByTags } from "../util/posts";

export async function getTags(req: any, res: any) {
    const posts = await getPostsByTags([]);
    let tags: any[] = [];
    for (let post of posts) {
        for (let tag of post.tags) {
            let found = false;
            for (let t of tags) {
                if (t.name === tag.name && t.type === tag.type) {
                    t.count++; found = true; break;
                }
            }
            if (!found) tags.push({ name: tag.name, type: tag.type, count: 1 });
        }
    };
    return res.status(200).json(tags);
}