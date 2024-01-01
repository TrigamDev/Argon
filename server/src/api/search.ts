import { getPostsByTags } from "../util/posts";
import { assertFilterTagList } from "../util/types";

export async function search(request: any, body: any, set: any) {
    let { tags } = body;
    tags = assertFilterTagList(tags);
    const posts = await getPostsByTags(tags);
    set.status = 200;
    return posts;
}