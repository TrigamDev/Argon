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

export function getTagDifference(oldTags: Tag[], newTags: Tag[]) {
	let removed = oldTags.filter( oldTag => !newTags.some( newTag => compareTags(oldTag, newTag) ) )
	let unchanged = oldTags.filter( oldTag => newTags.some( newTag => compareTags(oldTag, newTag) ) )
	let added = newTags.filter( newTag => !oldTags.some( oldTag => compareTags(oldTag, newTag) ) )
	return { added, removed, unchanged }
}

export function compareTags(tagA: Tag, tagB: Tag) {
	if (tagA.id && tagB.id) return tagA.id == tagB.id
	else return tagA.name == tagB.name && tagA.type == tagB.type
}