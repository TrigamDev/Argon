import sharp from "sharp"
import ffmpeg from "fluent-ffmpeg"
import { Stream } from "stream"

import { baseDir } from "./dir"
import { Category, Status, log } from "./debug";

const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg" ];
const videoTypes = [ "mp4", "webm", "mov", "avi" ];
const audioTypes = [ "mp3", "wav", "ogg", "flac" ];

// 
//	File Data
//

/**
 * Gets the file extension from a Url
 * @param { string } url The Url to get the file extension of
 * @returns { string } The file extension
 */
export function getFileExtension(url: string): string {
	if (!url) return "";
	return url.split(".").pop()?.split('?')[0] || "";
}

/**
 * Gets the file name from a Url
 * @param { string } url The Url to get the file name of
 * @returns { string } The file name
 */
export function getFileName(url: string): string {
	if (!url) return "";
	let split = url.split("/")
	let name = split[split.length - 1]
	return name.split(".").slice(0, -1).join(".")
}

/**
 * Gets the file name from a url
 * @param { string } url The Url to get the file type of
 * @returns { string } The file type
 */
export function getFileType(url: string | undefined): "image" | "video" | "audio" | "unknown" {
	if (!url) return "unknown";
	let extension = getFileExtension(url);
	if (imageTypes.includes(extension)) return "image";
	if (videoTypes.includes(extension)) return "video";
	if (audioTypes.includes(extension)) return "audio";
	return "unknown";
}

//
//	File Operations
//

/**
 * Fetches a file buffer from a Url
 * @param { string } url The Url the file is located at
 * @returns { Promise<Buffer> } The fetched file buffer
 */
export async function fetchFileUrl(url: string): Promise<Blob> {
	let response = await fetch(url)
	return await response.blob()
}

/**
 * Compresses an image for use in a thumbnail
 * @param { Buffer | Blob } file The image to compress
 * @param { number } quality The quality of the image
 * @param { number } resolution The resolution of the image
 * @returns { Promise<Buffer> } The compressed image
 */
export async function compressImage(file: Buffer | Blob, quality: number = 75, resolution: number = 250): Promise<Buffer> {
	if (file instanceof Blob) file = await getBufferFromBlob(file)
	return await sharp(file).webp({ quality }).resize(resolution, resolution, { fit: "inside" }).toBuffer()
}

/**
 * Converts a Blob to a Buffer
 * @param { Blob | Buffer } blob The blob to convert
 * @returns { Promise<Buffer> } The converted buffer
 */
export async function getBufferFromBlob(blob: Blob | Buffer): Promise<Buffer> {
	if (blob instanceof Buffer) return blob
	return Buffer.from(await blob.arrayBuffer())
}

/**
 * Saves a file to the server
 * @param { Buffer } data The file data to write
 * @param { number } id The ID of the post
 * @param { FileData } fileData The FileData (name, extension, type) of the file
 */
export async function writeFile(data: Buffer, id: number, fileData: FileData) {
	let fileType = fileData.type ?? getFileType(`${fileData.name}.${fileData.extension}`)
	let path = `${baseDir}/assets/${fileType}/${id}_${fileData.name}.${fileData.extension}`
	await Bun.write(path, data)
}

/**
 * Downloads a file to the server
 * @param { number } postId The ID of the post
 * @param { Blob } file The file to download
 * @param { FileData } fileData The FileData (name, extension, type) of the file
 */
export async function downloadFile(postId: number, file: Blob | Buffer, fileData: FileData) {
	if (!file) return
	log(Category.download, Status.loading, `Downloading ${fileData.type === 'thumbnail' ? 'thumbnail for ' : ''}${fileData.name}.${fileData.extension}...`, true)

	let extension = fileData.type === 'thumbnail' ? 'webp' : fileData.extension
	let dataReal = { name: fileData.name, extension, type: fileData.type } as FileData

	let fileBuffer = await getBufferFromBlob(file)
	await writeFile(fileBuffer, postId, dataReal)

	log(Category.download, Status.success, `Downloaded ${fileData.type === 'thumbnail' ? 'thumbnail for ' : ''}${fileData.name}.${fileData.extension}!`)
}

export interface FileData {
	name: string
	extension: string
	type: string
}