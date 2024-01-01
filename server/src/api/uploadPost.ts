import app from "../app";
import { File } from "../models/file";
import { Post } from "../models/post";
import { Tag } from "../models/tag";

import { assertFile, assertPost, assertTag } from "../util/types";
import { createFileId, downloadFile, downloadThumbnail, downloadVideoThumbnail,
    getFileExtension, getFileName, getFileType, uploadFileToDB } from "../util/files";
import { getWebPath } from "../util/dir";
import { createPostId, uploadPostToDB } from "../util/posts";

export default async function uploadPost(req: Request, body: any, set: any) {
    const { url, layeredUrl, title, tags, timestamp } = body;
    if (!url) { set.status = 400; return "No file url provided" }

    let file = await getFileInfo(req, url, layeredUrl, title, timestamp);
    await downloadFiles(file);
    await uploadFileToDB(file);

    let tagList = tags?.map((tag: any) => assertTag(tag)) as Tag[];
    let post = assertPost({ fileId: file.id, tags: tagList, timestamp: Date.now() } as Post);
    post.id = await createPostId();
    await uploadPostToDB(post);

    return post;
}

async function getFileInfo(req: any, url: string, layeredUrl: string, title: string, timestamp: number): Promise<File> {
    let file = assertFile({ sourceUrl: url, layeredUrl: layeredUrl,
        title: title, timestamp: timestamp, } as File);
    // Id and Title
    let newId = await createFileId(file); file.id = newId;
    file.title = file.title || getFileName(url) || `file_${newId}`;
    file.title = file.title.replace(/ /g, "_").replace(/[^a-zA-Z0-9-_]/g, "");
    // Type
    file.type = getFileType(url); 
    file.extension = getFileExtension(url);
    // Urls
    file.url = `${getWebPath(req, app)}/assets/${file.type}/${file.id}_${file.title}.${file.extension}`;
    file.thumbnailUrl = file.url.split(".").slice(0, -1) + "_thumbnail.webp";

    return file;
}

async function downloadFiles(fileData: File) {
    await downloadFile(fileData.sourceUrl as string, fileData.id, fileData.title, fileData.extension, fileData.type);
    if (fileData.type === "image")
        await downloadThumbnail(fileData.sourceUrl as string, fileData.id, fileData.title, fileData.extension);
    else if (fileData.type === "video")
        await downloadVideoThumbnail(fileData.sourceUrl as string, fileData.id, fileData.title, fileData.extension);
}