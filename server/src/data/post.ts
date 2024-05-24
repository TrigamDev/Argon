import type Tag from "./tag"

export default interface Post {
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
}