import Tag from "../data/tag"

export function removeDuplicates(tags: Tag[]) {
	let filtered = tags.filter((tag1: Tag, i, arr) => {
		return arr.findIndex((tag2: Tag) => {
			return tag1.name.toLowerCase() == tag2.name.toLowerCase()
				&& tag1.type.toLowerCase() == tag2.type.toLowerCase()
		}) === i
	})
	return filtered
}