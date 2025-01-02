import { FileType } from "@argon/data/file"

export const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "tiff" ]
export const videoTypes = [ "mp4", "webm", "mov", "avi" ]
export const audioTypes = [ "mp3", "wav", "ogg", "flac" ]

export interface FileData {
	name: string
	extension: string
	type: string
}

export function getFileExtension(url: string): string {
	if (!url) return ""
	let extension = url.split(/[#?]/)[0].split('.')?.pop()?.trim() || ""
	return (extension.includes('/') ? "" : extension).toLowerCase()
}

export function getFilePath(postId: number, file: Blob | undefined, url?: string): string | null {
	if (!file) return null
	let name = getFileName(file.name ?? url).replace(/[^a-zA-Z\d]/g, '_')
	let extension = getFileExtension(file.name ?? url)

	return `${postId}_${name}.${extension}`
}

export function getFileName(url: string): string {
	if (!url) return ""
	let split = url.split("/")
	let name = split[split.length - 1]
	return name.split(".").slice(0, -1).join(".")
}

export function getFileType(url: string | undefined): FileType {
	if (!url) return FileType.unknown
	let extension = getFileExtension(url)
	if (imageTypes.includes(extension)) return FileType.image
	if (videoTypes.includes(extension)) return FileType.video
	if (audioTypes.includes(extension)) return FileType.audio
	return FileType.unknown
}

export async function fetchFileUrl(url: string): Promise<Blob> {
	let response = await fetch(url)
	return await response.blob()
}