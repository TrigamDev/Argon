import { getPostsByTags } from "../util/posts";
import { assertFilterTagList } from "../util/types";

export async function search(req: any, res: any) {
    let tags = req?.body?.tags;
    tags = assertFilterTagList(tags);
    const posts = await getPostsByTags(tags);
    return res.status(200).json(posts);
}