import ArgonFile from "@argon/data/file"
import type Tag from "@argon/data/tag"

export default interface Post {
	id: number
	timestamp: number
	tags: Tag[]
	file: ArgonFile
}

export enum SortDirection {
	postId = "postId",
	postIdReverse = "postIdReverse",
	timestamp = "timestamp",
	timestampReverse = "timestampReverse"
}