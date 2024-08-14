import { Context } from "elysia"

import Database from "bun:sqlite"
import { getLastPostId, insertPost } from "../../util/database"

import type Post from "../../data/post"
import type File from "../../data/file"
import type Tag from "../../data/tag"

import { getWebPath } from "../../util/dir"
import { FileData, compressImage, downloadFile, fetchFileUrl, getBufferFromBlob, getFileExtension, getFileName, getFileType } from "../../util/files"
import { notifPostUpload } from "../../util/webhook"

export default async function uploadPost(context: Context, db: Database) {
	// Input
	let input = parseInput(context.body as FormData)
	if (!input.file && !input.fileUrl) {
		context.set.status = 400
		return { error: "No file provided" }
	}
	const assetsPath = `${getWebPath(context)}/assets`

	// Fetch files
	if (input.fileUrl) input.file = await fetchFileUrl(input.fileUrl)
	if (input.thumbnailUrl) input.thumbnailFile = await fetchFileUrl(input.thumbnailUrl)
	if (input.projectUrl) input.projectFile = await fetchFileUrl(input.projectUrl)
	
	let postId = getLastPostId(db) + 1

	// Download files
	let mainPath = await downloadMainFile(postId, input.file, input.fileUrl, !(input.thumbnailFile || input.thumbnailUrl))
	if (!mainPath) {
		context.set.status = 500
		return { error: "Failed to download main file" }
	}
	let thumbnailPath = await downloadThumbnail(postId, input.thumbnailFile, input.file, input.fileUrl)
	let projectPath = await downloadProjectFile(postId, input.projectFile, input.projectUrl)

	if (!mainPath) {
		context.set.status = 500
		return { error: "Failed to download main file" }
	}

	// Get thumbnail path if not provided
	if (!thumbnailPath && mainPath) {
		let split = mainPath.split('/')
		split[0] = 'thumbnail'
		split[1] = split[1].replace(/\..+$/, '.webp')
		thumbnailPath = split.join('/')
	}
	
	// Construct file object
	let file = {
		url: `${assetsPath}/${mainPath}`,
		thumbnailUrl: `${assetsPath}/${thumbnailPath}`,
		projectUrl: projectPath ? `${assetsPath}/${projectPath}` : undefined,
		sourceUrl: input.sourceUrl ?? undefined,
		timestamp: input.timestamp ?? 0,
		title: getTitle(input, input.fileUrl),
		type: getFileType(mainPath),
		extension: getFileExtension(mainPath)
	} as File
	
	// Construct post object
	let post = {
		id: postId,
		timestamp: new Date().getTime(),
		tags: input.tags ?? [],
		file: file
	} as Post

	// Save to database
	insertPost(post, db)
	notifPostUpload(post)

	return post
}

//
//	Download Functions
//
/**
 * Downloads the main file
 * @param { number } postId The ID of the post
 * @param { Blob | undefined } file The file to download
 * @param { string } url The Url the file is located at
 * @param { boolean } makethumbnail Whether to make a thumbnail of the file
 * @returns { Promise<string | null> } The path of the downloaded file
 */
export async function downloadMainFile(postId: number, file: Blob | undefined, url?: string, makethumbnail: boolean = true): Promise<string | null> {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)
	let type = getFileType(`${name}.${extension}`)

	await downloadFile(postId, file, { name, extension, type } as FileData)
	
	// Thumbnail
	let thumbnailType = (type === "image" || type === "video")
	if (thumbnailType && makethumbnail) {
		let thumbnail = await downloadThumbnail(postId, file, file, url)
		if (!thumbnail) return null
	}

	return `${type}/${postId}_${name}.${extension}`
}

/**
 * Downloads the thumbnail file
 * @param { number } postId The ID of the post
 * @param { Blob | undefined } file The thumbnail file to download
 * @param { Blob | undefined } nameFile The main file to get the name from
 * @param { Blob | undefined } nameUrl The Url of the main file, to get the name from (fallback)
 * @returns { Promise<string | null> } The path of the downloaded thumbnail
 */
export async function downloadThumbnail(postId: number, file: Blob | undefined, nameFile: Blob | undefined, nameUrl?: string): Promise<string | null> {
	if (!file || !nameFile) return null

	// Get data
	let name = getFileName(nameFile.name ?? nameUrl ?? file.name).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(nameFile.name ?? nameUrl ?? file.name)
	Object.defineProperty(file, 'name', { value: `${name}.${extension}` })

	// Compress
	let thumbnail = await compressImage(postId, file, getFileType(`${name}.${extension}`))
	if (!thumbnail) return null

	await downloadFile(postId, thumbnail, { name, extension, type: 'thumbnail' } as FileData)
	return `thumbnail/${postId}_${name}.webp`
}

/**
 * Downloads the project file
 * @param { number } postId The ID of the post
 * @param { Blob | undefined } file The project file to download
 * @param { string } url The Url the project file is located at
 * @returns { Promise<string | null> } The path of the downloaded project file
 */
export async function downloadProjectFile(postId: number, file: Blob | undefined, url?: string): Promise<string | null> {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)

	await downloadFile(postId, file, { name, extension, type: 'project' } as FileData)
	return `project/${postId}_${name}.${extension}`
}

//
//	Input Parsing
//
/**
 * Parses the request body into a PostInput object
 * @param { FormData } input
 * @returns { PostInput }
 */
export function parseInput(input: FormData): PostInput {
	// Parse tags
	let tags = input.get("tags") as string | Tag[] | undefined
	if (typeof tags === "string" && tags !== "") tags = JSON.parse(tags) as Tag[]

	// Verify tags
	if (tags) tags = tags?.map(tag => {
		if (!tag.name) tag.name = "unknown"
		if (!tag.type) tag.type = "unknown"
		if (tag.safe === undefined) tag.safe = true
		return tag
	}) ?? [] as Tag[]
	if (tags === "") tags = undefined

	// Parse timestamp
	let timestamp = input.get("timestamp") as string | number
	if (typeof timestamp === "string") timestamp = parseInt(timestamp)
	
	// Return data
	return {
		fileUrl: input.get("fileUrl") as string,
		file: input.get("file") as Blob,
		thumbnailUrl: input.get("thumbnailUrl") as string,
		thumbnailFile: input.get("thumbnailFile") as Blob,
		projectUrl: input.get("projectUrl") as string,
		projectFile: input.get("projectFile") as Blob,
		timestamp: timestamp ?? 0,
		tags: tags as Tag[] ?? undefined,
		sourceUrl: input.get("sourceUrl") as string,
		title: input.get("title") as string,
	}
}

/**
 * Finds the name of the file
 * @param { PostInput } input 
 * @param { string | undefined } path 
 * @returns { string }
 */
function getTitle(input: PostInput, path: string | undefined): string {
	let name = input.title ?? ''
	if ((!name || name === '') && path) name = getFileName(path)
	if ((!name || name === '') && input.file) name = getFileName(input.file.name)
	if ((!name || name === '') && input.fileUrl) name = getFileName(input.fileUrl)
	return name ?? 'file'
}

export interface PostInput {
	fileUrl?: string
	file?: Blob
	thumbnailUrl?: string
	thumbnailFile?: Blob
	projectUrl?: string
	projectFile?: Blob
	timestamp?: string | number
	tags?: Tag[]
	sourceUrl?: string
	title?: string
}