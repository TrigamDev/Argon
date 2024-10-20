import { FileType } from "./types"

export const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg" ]
export const videoTypes = [ "mp4", "webm", "mov", "avi" ]
export const audioTypes = [ "mp3", "wav", "ogg", "flac" ]

export function getFileType(url: string | undefined): FileType {
	if (!url) return FileType.unknown
	let extension = getFileExtension(url)
	if (imageTypes.includes(extension)) return FileType.image
	if (videoTypes.includes(extension)) return FileType.video
	if (audioTypes.includes(extension)) return FileType.audio
	return FileType.unknown
}

export function getFileExtension(url: string): string {
	if (!url) return ""
	return url.split(".").pop()?.split('?')[0] || ""
}

export function getMimeType(mime: string): FileType {
	let type = mime.split('/')[0]
	switch (type) {
		case 'image': return FileType.image
		case 'video': return FileType.video
		case 'audio': return FileType.audio
		default: return FileType.unknown
	}
}

export function extensionList(type: FileType): string | null {
	switch (type) {
		case FileType.image: return imageTypes.map(el => `.${el}`).join(',')
		case FileType.video: return videoTypes.map(el => `.${el}`).join(',')
		case FileType.audio: return audioTypes.map(el => `.${el}`).join(',')
		default: null
	}
	return null
}