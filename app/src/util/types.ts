export interface Post {
	id: number
	timestamp: number
	tags: Tag[]
	file: File
}

export interface File {
	url: string
	thumbnailUrl: string
	projectUrl: string
	sourceUrl: string
	timestamp: number
	title: string
	type: FileType
	extension: string
}

export enum FileType {
	image = "image",
	video = "video",
	audio = "audio",
	project = "project",
	unknown = "unknown"
}

export interface Tag {
	id?: number
	name: string
	type: string
	usages?: number
	exclude?: boolean
}