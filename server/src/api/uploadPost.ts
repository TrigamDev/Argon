import app from "../app";
import { File, Post } from "../models/post";
import { Tag } from "../models/tag";

import { assertFile, assertPost, assertTag } from "../util/types";
import { downloadFile, downloadThumbnail, downloadVideoThumbnail,
    getFileExtension, getFileName, getFileType } from "../util/files";
import { getWebPath } from "../util/dir";
import { createPostId, uploadPostToDB } from "../util/posts";

export default async function uploadPost(req: Request, body: any, set: any) {
    const { url, layeredUrl, title, tags, timestamp } = body;
    if (!url) { set.status = 400; return "No file url provided" }

    let id = await createPostId();
    let file = await getFileInfo(req, id, url, layeredUrl, title, timestamp);
    await downloadFiles(file, id, layeredUrl);

    let post = assertPost({ file: file, tags: tags, timestamp: Date.now() } as Post);
    post.id = id;
    await uploadPostToDB(post);

    return post;
}

async function getFileInfo(req: any, id: number, url: string, layeredUrl: string, title: string, timestamp: number): Promise<File> {
    let file = assertFile({ sourceUrl: url, layeredUrl: layeredUrl,
        title: title, timestamp: timestamp, } as File);
    // Title
    file.title = file.title || getFileName(url) || `file_${id}`;
    file.title = file.title.replace(/ /g, "_").replace(/[^a-zA-Z0-9-_]/g, "");
    // Type
    file.type = getFileType(url); 
    file.extension = getFileExtension(url);
    // Urls
    file.url = `${getWebPath(req, app)}/assets/${file.type}/${id}_${file.title}.${file.extension}`;
    file.thumbnailUrl = file.url.split(".").slice(0, -1) + "_thumbnail.webp";
    if (layeredUrl) {
        let layeredExtension = layeredUrl.split(".").pop();
        file.layeredUrl = `${getWebPath(req, app)}/assets/layered/${id}_${file.title}.${layeredExtension}`;
    };

    return file;
}

async function downloadFiles(fileData: File, id: number, layeredUrl: string) {
    await downloadFile(fileData.sourceUrl as string, id, fileData.title, fileData.extension, fileData.type);
    if (layeredUrl) {
        let layeredExtension = layeredUrl.split(".").pop() as string;
        await downloadFile(layeredUrl, id, fileData.title, layeredExtension, "layered");
    }
    if (fileData.type === "image")
        await downloadThumbnail(fileData.sourceUrl as string, id, fileData.title, fileData.extension);
    else if (fileData.type === "video")
        await downloadVideoThumbnail(fileData.sourceUrl as string, id, fileData.title, fileData.extension);
}