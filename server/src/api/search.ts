import { getPostsByTags } from "../util/posts";
import { assertFilterTagList } from "../util/types";

export async function search(req: any, res: any) {
    const { page, pageSize, sort, tags } = req?.body;
    const posts = await getPostsByTags(assertFilterTagList(tags));
    let sorted = posts.sort(getSorted(sort));
    let currentPage = page || 1;
    let sizePage = pageSize || 50;
    let paged = sorted.slice((currentPage - 1) * sizePage, currentPage * sizePage);
    return res.status(200).json({ posts: paged, pages: Math.ceil(sorted.length / sizePage) });
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