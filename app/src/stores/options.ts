import { atom } from "nanostores"

// Handle post types
export enum PostHandleType {
	Show = "Show",
	Blur = "Blur",
	Hide = "Hide"
}
export const handleNSFW = atom<PostHandleType>(PostHandleType.Blur)
export const handleSuggestive = atom<PostHandleType>(PostHandleType.Show)
export const handleUntagged = atom<PostHandleType>(PostHandleType.Show)

// Animations
export const animations = atom(true)

// Searching
export const tagSuggestions = atom(true)

// Stupid
export const bumpscuous = atom(false)