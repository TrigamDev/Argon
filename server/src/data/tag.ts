export default interface Tag {
	id?: number
	name: string
	type: string
	exclude?: boolean
	usages?: number
}

export function compareTags(tagA: Tag, tagB: Tag) {
	if (tagA.id && tagB.id) return tagA.id == tagB.id
	else return tagA.name == tagB.name && tagA.type == tagB.type
}

export function removeDuplicates( tags: Tag[] ) {
	let filtered = tags.filter( ( tag1: Tag, i, arr ) => {
		return arr.findIndex( ( tag2: Tag ) => {
			return compareTags( tag1, tag2 )
		}) === i
	})
	return filtered
}

export function getTagDifference( oldTags: Tag[], newTags: Tag[] ) {
	let removed = oldTags.filter( oldTag => !newTags.some( newTag => compareTags( oldTag, newTag ) ) )
	let unchanged = oldTags.filter( oldTag => newTags.some( newTag => compareTags( oldTag, newTag ) ) )
	let added = newTags.filter( newTag => !oldTags.some( oldTag => compareTags( oldTag, newTag ) ) )
	return { added, removed, unchanged }
}