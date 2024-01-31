import { Post } from "../models/post";
import { getPostById, paginate } from "../util/posts";
import { assertPost } from "../util/types";

export async function postList(req: any, res: any) {
    const { ids, page, pageSize, sort } = req?.body;
    let posts: Post[] = [];
    for (let id of ids) {
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
        let post = await getPostById(id);
        if (post) posts.push(assertPost(post));
    }
    let paginated = paginate(posts, page, pageSize, sort);
    return res.status(200).json(paginated);
}