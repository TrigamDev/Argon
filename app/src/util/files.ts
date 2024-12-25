import { FileType } from "@argon/util/types"

export const imageTypes = [ "png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "tiff" ]
export const videoTypes = [ "mp4", "webm", "mov", "avi", "flv", "vob", "mpeg", "m4v" ]
export const audioTypes = [ "mp3", "wav", "ogg", "flac" ]
export const projectTypes = [ "mdp", "psd", "xcf", "afphoto", "afdesign", "kra", "ai", "svg", "clip", "procreate", "blend", "anim", "ma", "mb", "mp", "dwg", "obj", "abl", "ablbundle", "als", "flp" ]

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

export function getTypeFromMime(mime: string): FileType {
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
		case FileType.project: return projectTypes.map(el => `.${el}`).join(',')
		default: return imageTypes.concat(videoTypes).concat(audioTypes).map(el => `.${el}`).join(',')
	}
}