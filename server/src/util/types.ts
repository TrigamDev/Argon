import { File, Post } from "../models/post";
import { FilterTag, Tag } from "../models/tag";

export function assertFile(file: any): File {
    return {
        url: file?.url as string || null,
        thumbnailUrl: file?.thumbnailUrl as string || null,
        layeredUrl: file?.layeredUrl as string || null,
        sourceUrl: file?.sourceUrl as string || null,
        title: file?.title as string || null,
        type: file?.type as string || "image",
        extension: file?.extension as string || null,
        timestamp: file?.timestamp as number || 0
    } as File;
}

export function assertPost(post: any): Post {
    let tagList = post?.tags?.map((tag: any) => assertTag(tag)) as Tag[];
    return {
        file: assertFile(post.file),
        id: post.id as number || 0,
        tags: tagList || [],
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
};

export function assertTagList(tags: any[]): Tag[] {
    return tags.map((tag) => assertTag(tag));
};

export function assertFilterTag(filter: any): FilterTag {
    return {
        name: filter.name as string || null,
        type: filter.type as string || null,
        exclude: filter.exclude as boolean || false
    } as FilterTag;
};

export function assertFilterTagList(filters: any[]): FilterTag[] {
    if (!filters || filters?.length === 0) return [];
    return filters.map((filter) => assertFilterTag(filter));
};