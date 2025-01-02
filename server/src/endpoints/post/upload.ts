import { Context } from "elysia"

import { getLastPostId } from "@argon/database/posts"

import type Post from "@argon/data/post"
import type ArgonFile from "@argon/data/file"
import { FileType } from "@argon/data/file"
import type Tag from "@argon/data/tag"

import { getWebPath } from "@argon/util/dir"
import { validateUrl } from "@argon/util/url"
import { notifPostUpload } from "@argon/notifs/webhook"
import { Category, Group, log, Status } from "@argon/util/debug"
import { insertPost } from "@argon/database/posts"
import { compressImage } from "@argon/files/thumbnail"
import { downloadFile } from "@argon/files/fileSystem"
import { fetchFileUrl, FileData, getFileExtension, getFileName, getFilePath, getFileType } from "@argon/files/data"
import { getFileFromBlob } from "@argon/files/conversion"

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
export default async function uploadPost( context: Context ) {
	// Input
	let input = parseInput(context.body as FormData)
	if (!input.file && !input.fileUrl) {
		context.set.status = 400
		return { error: "No file provided" }
	}

	// Get precursory info
	const assetsPath = `${getWebPath(context)}/assets`
	let postId = getLastPostId() + 1

	log({
		category: Category.database, status: Status.loading,
		newLine: true, group: Group.start,
		message: `Posting Post #${postId}...`
	})


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
		return { error: "Failed to download file" }
	}

	if (!mainPath) { context.set.status = 500; return { error: "Failed to download file" } }

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
	insertPost( post )
	notifPostUpload( post )

	log({
		category: Category.database, status: Status.success,
		newLine: true, group: Group.end,
		message: `Posted Post #${ postId }!`
	})

	return post
}



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
export async function downloadMainFile(postId: number, file: File, url?: string): Promise<string | null> {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)
	let type = getFileType(`${name}.${extension}`)
	if ( type === FileType.unknown ) return null

	await downloadFile(file, { name, extension, type } as FileData)
	return `${type}/${name}.${extension}`
}

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

	await downloadFile(thumbnail, { name, extension, type: 'thumbnail' } as FileData)
	return `thumbnail/${name}.webp`
}

export async function downloadProjectFile(postId: number, file: File | null, url?: string): Promise<string | null> {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)

	await downloadFile(file, { name, extension, type: 'project' } as FileData)
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
	
	await downloadFile(thumbnail, { name, extension: 'webp', type: 'thumbnail' } as FileData)
	return `thumbnail/${name}.webp`
}