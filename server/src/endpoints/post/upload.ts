import { Context } from "elysia"

import Database from "bun:sqlite"
import { getLastPostId, insertPost } from "../../util/database"

import { readFile } from 'fs/promises'

import type Post from "../../data/post"
import type ArgonFile from "../../data/file"
import { FileType } from "../../data/file"
import type Tag from "../../data/tag"
import { BunFile } from "bun"

import { getWebPath } from "../../util/dir"
import { FileData, validateUrl, compressImage, downloadFile, fetchFileUrl, getFileExtension, getFileFromBlob, getFileName, getFilePath, getFileType } from "../../util/files"
import { notifPostUpload } from "../../util/webhook"
import { Category, log, Status } from "../../util/debug"

export interface PostInput {
	title?: string
	timestamp?: string | number
	sourceUrl?: string
	tags?: Tag[]

	fileUrl?: string
	file?: Blob
	thumbnailUrl?: string
	thumbnailFile?: Blob
	projectUrl?: string
	projectFile?: Blob
}
export default async function uploadPost(context: Context, db: Database) {
	// Input
	let input = parseInput(context.body as FormData)
	if (!input.file && !input.fileUrl) {
		context.set.status = 400
		return { error: "No file provided" }
	}

	// Get precursory info
	const assetsPath = `${getWebPath(context)}/assets`
	let postId = getLastPostId(db) + 1

	log(Category.database, Status.loading, `Posting Post #${postId}...`, true, true, false)


	//
	//	GET FILES
	//

	// Fetch File Urls
	if (input.fileUrl && validateUrl(input.fileUrl))
		input.file = await fetchFileUrl(input.fileUrl)

	if (input.thumbnailUrl && validateUrl(input.thumbnailUrl))
		input.thumbnailFile = await fetchFileUrl(input.thumbnailUrl)

	if (input.projectUrl && validateUrl(input.projectUrl))
		input.projectFile = await fetchFileUrl(input.projectUrl)


	// Get Main File
	let mainFile: File | null
	if (input.file) mainFile = await getFileFromBlob(
		input.file, getFilePath(postId, input.file, input.fileUrl)
	)
	else { context.set.status = 400; return { error: "No file provided" } }

	// Get Thumbnail File
	let thumbnailFile: File | null = null
	if (input.thumbnailFile) thumbnailFile = await getFileFromBlob(
		input.thumbnailFile, getFilePath(postId, input.thumbnailFile, input.thumbnailUrl)
	)

	// Get Project File
	let projectFile: File | null = null
	if (input.projectFile) projectFile = await getFileFromBlob(
		input.projectFile, getFilePath(postId, input.projectFile, input.projectUrl)
	)


	//
	//	DOWNLOAD FILES
	//
	
	// Download Main File
	let mainPath = await downloadMainFile(postId, mainFile, input.fileUrl)
	if (!mainPath) {
		context.set.status = 500
		return { error: "Failed to download main file" }
	}

	if (!mainPath) { context.set.status = 500; return { error: "Failed to download main file" } }

	// Download Thumbnail File
	let thumbnailPath = await downloadThumbnail(postId, thumbnailFile ?? mainFile, mainFile, input.fileUrl)
	if (!thumbnailPath) thumbnailPath = await copyDefaultThumbnail(postId, mainFile, assetsPath)

	// Download Project File
	let projectPath = await downloadProjectFile(postId, projectFile, input.projectUrl)

	
	//
	//	OUTPUT
	//

	// Construct file object
	let file = {
		url: `${assetsPath}/${mainPath}`,
		thumbnailUrl: thumbnailPath ? `${assetsPath}/${thumbnailPath}` : undefined,
		projectUrl: projectPath ? `${assetsPath}/${projectPath}` : undefined,
		sourceUrl: input.sourceUrl ?? undefined,
		timestamp: input.timestamp ?? 0,
		title: getTitle(input, input.fileUrl),
		type: getFileType(mainPath),
		extension: getFileExtension(mainPath)
	} as ArgonFile
	
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

	log(Category.database, Status.success, `Posted Post #${postId}!`, true, false, true)

	return post
}

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
		return tag
	}) ?? [] as Tag[]
	if (tags === "") tags = undefined

	// Parse timestamp
	let timestamp = input.get("timestamp") as string | number
	if (typeof timestamp === "string") timestamp = parseInt(timestamp)
	
	// Return data
	return {
		title: input.get("title") as string,
		timestamp: timestamp ?? 0,
		sourceUrl: input.get("sourceUrl") as string,
		tags: tags as Tag[] ?? undefined,

		fileUrl: input.get("fileUrl") as string,
		file: input.get("file") as Blob,
		thumbnailUrl: input.get("thumbnailUrl") as string,
		thumbnailFile: input.get("thumbnailFile") as Blob,
		projectUrl: input.get("projectUrl") as string,
		projectFile: input.get("projectFile") as Blob,
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

//
//	File Downloads
//
/**
 * Downloads the main file
 * @param { number } postId The ID of the post
 * @param { Blob | undefined } file The file to download
 * @param { string } url The Url the file is located at
 * @param { boolean } makethumbnail Whether to make a thumbnail of the file
 * @returns { Promise<string | null> } The path of the downloaded file
 */
export async function downloadMainFile(postId: number, file: File, url?: string): Promise<string | null> {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)
	let type = getFileType(`${name}.${extension}`)

	await downloadFile(postId, file, { name, extension, type } as FileData)
	return `${type}/${name}.${extension}`
}

/**
 * Downloads the thumbnail file
 * @param { number } postId The ID of the post
 * @param { Blob | undefined } file The thumbnail file to download
 * @param { Blob | undefined } nameFile The main file to get the name from
 * @param { Blob | undefined } nameUrl The Url of the main file, to get the name from (fallback)
 * @returns { Promise<string | null> } The path of the downloaded thumbnail
 */
export async function downloadThumbnail(postId: number, file: File | null, nameFile: File | null, nameUrl?: string): Promise<string | null> {
	if (!file || !nameFile) return null

	// Get data
	let realName = getFileName(file.name).replace(/[^a-zA-Z\d]/g, '_')
	let realExtension = getFileExtension(file.name)
	let name = getFileName(nameFile.name ?? nameUrl ?? file.name).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(nameFile.name ?? nameUrl ?? file.name)

	// Compress
	let thumbnail = await compressImage(postId, file, getFileType(`${realName}.${realExtension}`))
	if (!thumbnail) return null

	await downloadFile(postId, thumbnail, { name, extension, type: 'thumbnail' } as FileData)
	return `thumbnail/${name}.webp`
}

/**
 * Downloads the project file
 * @param { number } postId The ID of the post
 * @param { Blob | undefined } file The project file to download
 * @param { string } url The Url the project file is located at
 * @returns { Promise<string | null> } The path of the downloaded project file
 */
export async function downloadProjectFile(postId: number, file: File | null, url?: string): Promise<string | null> {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)

	await downloadFile(postId, file, { name, extension, type: 'project' } as FileData)
	return `project/${name}.${extension}`
}

export async function copyDefaultThumbnail(postId: number, file: File | null, assetsPath: string): Promise<string | null> {
	if (!file) return null

	// Get data
	let name = getFileName(file.name).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name)
	let fileType: FileType = getFileType(`${name}.${extension}`)
	
	let defaultFile: Blob | null = null
	switch (fileType) {
		case FileType.audio: defaultFile = await fetchFileUrl(`${assetsPath}/default/audio.png`)
	}
	if (!defaultFile) return null

	let filed: File = await getFileFromBlob(defaultFile) as File

	let thumbnail = await compressImage(postId, filed, FileType.image, 100)
	if (!thumbnail) return null
	
	await downloadFile(postId, thumbnail, { name, extension: 'webp', type: 'thumbnail' } as FileData)
	return `thumbnail/${name}.webp`
}