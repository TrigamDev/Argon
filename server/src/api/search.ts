import { getPostsByTags, paginate } from "../util/posts";
import { assertFilterTagList } from "../util/types";

export async function search(req: any, res: any) {
    // Info
    const { page, pageSize, sort, tags } = req?.body;
    let currentPage = page || 1;
    let sizePage = pageSize || 50;
    // Get posts, sort, paginate
    let posts = paginate(await getPostsByTags(assertFilterTagList(tags)), currentPage, sizePage, sort);
    return res.status(200).json(posts);
};

export function getSorted(sortType: string) {
    switch (sortType) {
        case "oldPosted": return (a: any, b: any) => a?.timestamp - b?.timestamp;
        case "newPosted": return (a: any, b: any) => b?.timestamp - a?.timestamp;
        case "oldest": return (a: any, b: any) => a?.file?.timestamp - b?.file?.timestamp;
        default:
        case "newest": return (a: any, b: any) => b?.file?.timestamp - a?.file?.timestamp;
    }
};