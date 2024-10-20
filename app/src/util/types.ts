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
	unknown = "unknown"
}

export interface Tag {
	id?: number
	name: string
	type: string
	safe: boolean,
	usages?: number
}

export enum Sorts {
	postId = "postId",
	postIdReverse = "postIdReverse",
	timestamp = "timestamp",
	timestampReverse = "timestampReverse",
	tagCount = "tagCount",
	tagCountReverse = "tagCountReverse"
}

export interface SearchTag {
	id?: number
	name: string
	type: string
	usages?: number
	exclude: boolean
}