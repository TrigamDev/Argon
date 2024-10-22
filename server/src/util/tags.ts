import Tag from "../data/tag"
import { SearchTag } from "./database"

export function removeDuplicates(tags: Tag[] | SearchTag[]) {
	let filtered = tags.filter((tag1: Tag | SearchTag, i, arr) => {
		return arr.findIndex((tag2: Tag | SearchTag) => {
			return tag1.name == tag2.name && tag1.type == tag2.type
		}) === i
	})
	console.log(filtered)
	return filtered
}