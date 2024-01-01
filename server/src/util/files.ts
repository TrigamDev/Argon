import sharp from "sharp";
import ffmpeg from 'fluent-ffmpeg';
import { Stream } from "stream";

import FileModel, { File } from "../models/file";

import { baseDir } from "./dir";

const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg" ];
const videoTypes = [ "mp4", "webm", "mov", "avi" ];
const audioTypes = [ "mp3", "wav", "ogg", "flac" ];

export async function createFileId(file: File): Promise<number> {
    let files: File[] = await FileModel.find().exec();
    if (files.length === 0) return 0;
    files.sort((a, b) => a.id - b.id);
    let id = files[files.length - 1].id + 1;
    return id;
}

export function getFileExtension(url: string): string {
    return url.split(".").pop()?.split('?')[0] || "";
};

export function getFileName(url: string): string {
    let split = url.split("/");
    let name = split[split.length - 1];
    return name.split(".").slice(0, -1).join(".");
};

export function getFileType(url: string): "image" | "video" | "audio" | "unknown" {
    let extension = getFileExtension(url);
    if (imageTypes.includes(extension)) return "image";
    if (videoTypes.includes(extension)) return "video";
    if (audioTypes.includes(extension)) return "audio";
    return "unknown";
}

export async function fetchImageUrl(url: string): Promise<Buffer> {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
};

// Purely for logging purposes
function typeEmoji(type: string): string {
    if (type === "image") return "🖼️ ";
    if (type === "video") return "🎥";
    if (type === "audio") return "🎵";
    return "❓";
};

export async function downloadFile(url: string, id: number, name: string, extension: string, type: string) {
    console.log(`\n${typeEmoji(type)} Downloading ${id}_${name}.${extension}...`);
    let fetched = await fetchImageUrl(url);
    writeFile(fetched, id, name, extension, type);
    console.log(`✅ Downloaded ${id}_${name}.${extension}!`)
};

export async function downloadThumbnail(url: string, id: number, name: string, extension: string) {
    console.log(`\n🖼️  Generating thumbnail for ${id}_${name}.${extension}...`);
    let fetched = await fetchImageUrl(url);
    let compressed = await compressImage(fetched);
    // Save thumbnail
    await writeFile(compressed, id, `${name}_thumbnail`, "webp", "image");
    console.log(`✅ Generated thumbnail for ${id}_${name}.${extension}!`)
}

export async function downloadVideoThumbnail(url: string, id: number, name: string, extension: string) {
    console.log(`\n🖼️  Generating thumbnail for ${id}_${name}.${extension}...`);
    let frame = await extractVideoFrame(`${id}_${name}.${extension}`);
    let compressed = await compressImage(frame);
    // Save thumbnail
    await writeFile(compressed, id, `${name}_thumbnail`, "webp", "video");
    console.log(`✅ Generated thumbnail for ${id}_${name}.${extension}!`)
}

export async function writeFile(data: Buffer, id: number, name: string, extension: string, type: string) {
    let baseFile = Bun.file(`${baseDir}/assets/${type}/${id}_${name}.${extension}`);
    await Bun.write(baseFile, data);
}

export async function compressImage(buffer: Buffer): Promise<Buffer> {
    let image = sharp(buffer);
    image.webp({ quality: 75 });
    image.resize(250, 250, { fit: "inside" });
    return await image.toBuffer();
}

export async function extractVideoFrame(file: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        console.log("💽 Processing video frame...")
        let bufferStream = new Stream.PassThrough();
        // Grab frame
        ffmpeg(`./assets/video/${file}`)
            .outputOptions([ '-vframes 1' ])
            .format('image2pipe')
            .pipe(bufferStream, { end: true })
            .on('error', (err) => {
                console.error("💽 Error processing video frame!")
                reject(err);
            });
        // Process stream
        let buffers: Buffer[] = [];
        bufferStream.on('data', (chunk) => buffers.push(chunk));
        bufferStream.on('end', () => {
            console.log("💽 Processed video frame!")
            resolve(Buffer.concat(buffers) as Buffer);
        });
        bufferStream.on('error', (err) => {
            console.error("❗ Error processing video frame!")
            reject(err);
        });
    });
};

export async function uploadFileToDB(fileData: File) {
    try {
        console.log(`\n💾 Saving ${fileData.id}_${fileData.title}.${fileData.extension} to the database...`);
        const newFile = new FileModel(fileData);
        await newFile.save();
        console.log(`💾 Saved ${fileData.id}_${fileData.title}.${fileData.extension} to the database!`);
    } catch (err) {
        console.error(err);
        console.log(`❗ Error saving ${fileData.id}_${fileData.title}.${fileData.extension} to the database!`);
    }
};

export async function getFileById(id: number): Promise<File | null> {
    try { return await FileModel.findOne({ id: id }).exec() as File } catch (err) {
        console.error(err);
        return null;
    }
}