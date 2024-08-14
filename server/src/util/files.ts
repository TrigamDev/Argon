import sharp from "sharp"
import FfmpegCommand from 'fluent-ffmpeg'
import { PassThrough, Readable } from "stream"
import { unlink, lstat, rm, readFile, exists, mkdir } from "fs/promises"

import { FileType } from "../data/file"

import { baseDir } from "./dir"
import { Category, Status, log } from "./debug"
import { notifError } from "./webhook"

const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg" ]
const videoTypes = [ "mp4", "webm", "mov", "avi" ]
const audioTypes = [ "mp3", "wav", "ogg", "flac" ]

// 
//	File Data
//

/**
 * Gets the file extension from a Url
 * @param { string } url The Url to get the file extension of
 * @returns { string } The file extension
 */
export function getFileExtension(url: string): string {
	if (!url) return ""
	return url.split(".").pop()?.split('?')[0] || ""
}

/**
 * Gets the file name from a Url
 * @param { string } url The Url to get the file name of
 * @returns { string } The file name
 */
export function getFileName(url: string): string {
	if (!url) return ""
	let split = url.split("/")
	let name = split[split.length - 1]
	return name.split(".").slice(0, -1).join(".")
}

/**
 * Gets the file name from a url
 * @param { string } url The Url to get the file type of
 * @returns { string } The file type
 */
export function getFileType(url: string | undefined): FileType {
	if (!url) return FileType.unknown
	let extension = getFileExtension(url)
	if (imageTypes.includes(extension)) return FileType.image
	if (videoTypes.includes(extension)) return FileType.video
	if (audioTypes.includes(extension)) return FileType.audio
	return FileType.unknown
}

export async function doesFileExist(path: string): Promise<boolean> {
	return await lstat(path).then(() => true).catch(() => false)
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
export async function compressImage(postId: number, file: Blob, fileType: FileType, quality: number = 75, resolution: number = 250): Promise<Buffer | null> {
	let fileBuffer: Buffer = await getBufferFromBlob(file)
	if (fileType === FileType.video) fileBuffer = await extractVideoFrame(postId, file)
	try {
		let compressed = await sharp(fileBuffer).webp({ quality }).resize(resolution, resolution, { fit: "inside" }).toBuffer()
		return compressed
	} catch (error) {
		log(Category.download, Status.error, `Failed to compress image: ${error}`, true)
		return null
	}
}

export async function extractVideoFrame(postId: number, file: Blob): Promise<Buffer> {
	// Path
	let name = getFileName(file.name).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name)
	let now = Date.now()

	const path = `${baseDir}/assets/video/${postId}_${name}.${extension}`
	const tempPath = `${baseDir}/assets/temp/${now}_${postId}_${name}.webp`
	
	// Create temp directory
	let tempDirExists = await exists(`${baseDir}/assets/temp`)
	if (!tempDirExists)
		await mkdir(`${baseDir}/assets/temp`)
	
	log(Category.download, Status.loading, `Extracting video frame for ${postId}_${name}.${extension}...`, true)

	return new Promise(async (resolve, reject) => {
		if (await doesFileExist(path)) {
			// Command
			FfmpegCommand(path)
				.outputOptions([
					'-vframes 1',
					'-vcodec webp'
				])
				.output(tempPath)

				.on('error', (error: Error) => {
					log(Category.download, Status.error, error.message)
					notifError(error)
					reject(error)
				})
				.on('end', async () => {
					log(Category.download, Status.success, `Extracted video frame for ${name}.${extension}!`)

					const frameBuffer = await readFile(tempPath)
					resolve(frameBuffer)

					unlink(tempPath)
				})
				.run()
		}
	})
}

export function getStreamFromBuffer(buffer: Buffer): Readable {
	let stream = new PassThrough()
	stream.write(buffer)
	stream.end()
	return stream
}

/**
 * Converts a Blob to a Buffer
 * @param { Blob | Buffer } blob The blob to convert
 * @returns { Promise<Buffer> } The converted buffer
 */
export async function getBufferFromBlob(blob: Blob | Buffer): Promise<Buffer> {
	if (!blob || (blob instanceof Blob && !blob.arrayBuffer)) return Buffer.of();
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

/**
 * Replaces a file for a post
 * @param { number } postId The ID of the post 
 * @param { Blob | Buffer } file The file to replace 
 * @param { FileData } fileData The FileData (name, extension, type) of the file 
 * @param { Database } db The database to use 
 */
export async function replaceFile(postId: number, oldFileData: FileData, file: Blob | Buffer, fileData: FileData) {
	log(Category.database, Status.loading, `Replacing File for Post #${postId}...`, true)

	// Delete old file
	deleteFile(postId, oldFileData)

	// Download new file
	await downloadFile(postId, file, fileData)

	log(Category.database, Status.success, `Replaced File for Post #${postId}!`)
}

/**
 * Deletes a file for a post
 * @param { number } postId The ID of the post 
 * @param { Database } db The database to use
 */
export async function deleteFile(postId: number, fileData: FileData) {
	log(Category.database, Status.loading, `Deleting File for Post #${postId}...`, true)
	
	let fileType = fileData.type ?? getFileType(`${fileData.name}.${fileData.extension}`)
	let path = `${baseDir}/assets/${fileType}/${postId}_${fileData.name}.${fileData.extension}`
	await unlink(path)

	log(Category.database, Status.success, `Deleted File for Post #${postId}!`)
}

/**
 * Deletes all the files in the assets directory
 */
export async function clearFiles() {
	for (let fileType of [ "image", "video", "audio", "thumbnail", "project", "temp", "unknown" ]) {
		let path = `${baseDir}/assets/${fileType}`
		let exists = await lstat(path).then(() => true).catch(() => false)
		if (exists) {
			rm(path, { recursive: true, force: true }).then(() => {
				log(Category.download, Status.success, `Cleared ${fileType} files!`)
			})
		}
	}
}

export interface FileData {
	name: string
	extension: string
	type: string
}