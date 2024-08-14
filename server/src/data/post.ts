import File from "./file"
import type Tag from "./tag"

export default interface Post {
	id: number
	timestamp: number
	tags: Tag[]
	file: File
}