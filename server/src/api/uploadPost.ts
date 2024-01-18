import { File, Post } from "../models/post";

import { assertFile, assertPost } from "../util/types";
import { downloadFileFromUrl, downloadThumbnailFromUrl } from "../util/files"
import { downloadFileFromFile, downloadThumbnailFromFile } from "../util/files";
import { downloadVideoThumbnail, getFileExtension, getFileName, getFileType } from "../util/files";
import { getWebPath } from "../util/dir";
import { createPostId, uploadPostToDB } from "../util/posts";

export default async function uploadPost(req: any, res: any) {
    // Recieve data
    const { url, layeredUrl, sourceUrl, title, tags, timestamp } = req?.body;
    const { file, layeredFile } = getFiles(req?.files);
    if (!url && !file) return res.status(400).json({ error: "No url/file provided" });
    
    // Process and download files
    let id = await createPostId();
    console.log(`\n💾 ⚫ Saving Post #${id} to the server...`)
    let postFile = await getFileInfo(req, id, url, file, layeredUrl, layeredFile, sourceUrl, title, timestamp);
    if (url) await downloadFilesFromUrl(postFile, id, layeredUrl, layeredFile);
    else if (file) await downloadFilesFromFiles(postFile, id, file, layeredFile);
    
    // Add extra data
    postFile.sourceUrl = sourceUrl;
    let postTags = tags;
    if (!postTags || postTags?.length === 0) postTags = [{ name: "untagged", type: "meta", safe: true }];

    // Upload to database
    let post = assertPost({ file: postFile, tags: postTags, timestamp: Date.now() } as Post);
    post.id = id;
    await uploadPostToDB(post);
    console.log(`💾 ✅ Saved Post #${id} to the server!`)

    return res.status(200).json(post);
}

async function getFileInfo(req: any, id: number, url: string, file: any, layeredUrl: string, layeredFile: any, sourceUrl: string, title: string, timestamp: number): Promise<File> {
    let postFile = assertFile({ sourceUrl: url, layeredUrl: layeredUrl,
        title: title, timestamp: Number(timestamp), } as File);
    // Title
    postFile.title = postFile.title || file?.originalname?.split('.')?.slice(0, -1)?.join('.') || getFileName(url) || `file_${id}`;
    postFile.title = postFile.title.replace(/ /g, "_").replace(/[^a-zA-Z0-9-_]/g, "");
    // Type
    postFile.type = file ? getFileType(file?.originalname) : getFileType(url); 
    postFile.extension = file ? getFileExtension(file?.originalname) : getFileExtension(url);
    // Urls
    postFile.url = `${getWebPath(req)}/assets/${postFile.type}/${id}_${postFile.title}.${postFile.extension}`;
    postFile.thumbnailUrl = postFile.url.split(".").slice(0, -1) + "_thumbnail.webp";
    if (layeredUrl) {
        let layeredExtension = layeredUrl.split(".").pop();
        postFile.layeredUrl = `${getWebPath(req)}/assets/layered/${id}_${postFile.title}.${layeredExtension}`;
    };

    return postFile;
}

async function downloadFilesFromUrl(fileData: File, id: number, layeredUrl: string, layeredFile: any) {
    await downloadFileFromUrl(fileData.sourceUrl as string, id, fileData.title, fileData.extension, fileData.type);
    if (layeredUrl) {
        let layeredExtension = layeredUrl.split(".").pop() as string;
        await downloadFileFromUrl(layeredUrl, id, fileData.title, layeredExtension, "layered");
    }
    if (fileData.type === "image")
        await downloadThumbnailFromUrl(fileData.sourceUrl as string, id, fileData.title, fileData.extension);
    else if (fileData.type === "video")
        await downloadVideoThumbnail(id, fileData.title, fileData.extension);
};

async function downloadFilesFromFiles(fileData: File, id: number, file: any, layeredFile: any) {
    await downloadFileFromFile(file, id, fileData.title, fileData.extension, fileData.type);
    if (layeredFile) {
        let layeredExtension = layeredFile.originalname.split(".").pop() as string;
        await downloadFileFromFile(layeredFile, id, fileData.title, layeredExtension, "layered");
    }
    if (fileData.type === "image")
        await downloadThumbnailFromFile(file, id, fileData.title, fileData.extension);
    else if (fileData.type === "video")
        await downloadVideoThumbnail(id, fileData.title, fileData.extension);
};

function getFiles(files: any[]) {
    let file: any = undefined;
    let layeredFile: any = undefined;
    files.forEach((f: any) => {
        if (f.fieldname === "file") file = f;
        else if (f.fieldname === "layeredFile") layeredFile = f;
    });
    return { file, layeredFile };
}