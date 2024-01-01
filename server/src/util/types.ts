import { File } from "../models/file";
import { Post } from "../models/post";
import { Tag } from "../models/tag";

export function assertFile(file: any): File {
    return {
        id: file.id as number || 0,
        url: file.url as string || null,
        thumbnailUrl: file.thumbnailUrl as string || null,
        layeredUrl: file.layeredUrl as string || null,
        sourceUrl: file.sourceUrl as string || null,
        title: file.title as string || null,
        type: file.type as string || "image",
        extension: file.extension as string || null,
        timestamp: file.timestamp as number || 0
    } as File;
}

export function assertPost(post: any): Post {
    return {
        fileId: post.fileId as number || 0,
        id: post.id as number || 0,
        tags: post.tags as Tag[] || [],
        timestamp: post.timestamp as number || 0,
        favorites: post.favorites as number || 0
    } as Post;
};

export function assertTag(tag: any): Tag {
    var safe = tag.safe as boolean;
    if (tag.safe === false) safe = false;
    else safe = true;
    return {
        name: tag.name as string || null,
        type: tag.type as string || null,
        safe: safe
    } as Tag;
}