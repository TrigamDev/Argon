import { atom } from "nanostores"

// Handle post types
export enum PostHandleType {
	Show, Blur, Hide
}
export const handleNSFW = atom<PostHandleType>(PostHandleType.Blur)
export const handleSuggestive = atom<PostHandleType>(PostHandleType.Show)
export const handleUntagged = atom<PostHandleType>(PostHandleType.Show)

// Sorting
export enum SortDirection {
	postId = "postId",
	postIdReverse = "postIdReverse",
	timestamp = "timestamp",
	timestampReverse = "timestampReverse",
	tagCount = "tagCount",
	tagCountReverse = "tagCountReverse"
}
export const sortPosts = atom<SortDirection>(SortDirection.timestamp)

// Animations
export const animations = atom(true)

// Searching
export const tagSuggestions = atom(true)

// Stupid
export const bumpscuous = atom(false)