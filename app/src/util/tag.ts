import type { Tag } from "@argon/util/types"

export function parseTagString(tagString: string): Tag[] {
	let tags = tagString.split(' ').map((tag: string) => {
		const match = tag?.match(/^(.*)_\((.*)\)$/)
		if (!match || match.length < 2) return null
		const name = match[1].replace(/^!/, '').toLowerCase()
		const type = match[2].toLowerCase()
		const exclude = match[1].startsWith('!') ?? false
		return { name, type, exclude } as Tag
	})
	return removeDuplicates(tags.filter(tag => tag !== null) as Tag[])
}

export function tagsToTagString(tags: Tag[]): string {
	let strings = []
	for (let tag of removeDuplicates(tags)) {
		strings.push(`${tag.exclude ? '!' : ''}${tag.name.toLowerCase()}_(${tag.type.toLowerCase()})`)
	}
	return strings.join(' ')
}

export function tagToString(tag: Tag) {
	return `{ "type": "${tag.type}", "name": "${tag.name}", "exclude": ${tag.exclude ?? false} }`
}
export function tagsToString(tags: Tag[]) {
	return `[${tags.map(tag => tagToString(tag)).join(", ")}]`
}

export function removeDuplicates(tags: Tag[]) {
	let filtered = tags.filter((tag1: Tag, i, arr) => {
		return arr.findIndex((tag2: Tag) => {
			return tag1.name.toLowerCase() == tag2.name.toLowerCase()
				&& tag1.type.toLowerCase() == tag2.type.toLowerCase()
		}) === i
	})
	return filtered
}

export function hasTag(tags: Tag[], tag: Tag) {
	let search = tags.filter(postTag => areTagsEqual( postTag, tag ) )
	return search.length > 0
}

export function areTagsEqual(tagA: Tag, tagB: Tag): boolean {
	return tagA?.name === tagB?.name && tagA?.type === tagB?.type
}

export function sortTagsByName( tags: Tag[] ): Tag[] {
	return tags?.sort( ( tagA: Tag, tagB: Tag ) => tagA.name.localeCompare( tagB.name ) )
}

export function sortTagsByUsages( tags: Tag[] ): Tag[] {
	let alphabetical = sortTagsByName( tags )
	return alphabetical?.sort( ( tagA: Tag, tagB: Tag ) => (tagB.usages ?? 0) - (tagA.usages ?? 0) )
}

export function sortTagsByType( tags: Tag[] ): Tag[] {
	let grouped = groupTags( tags )
	const typeOrder = [
		'artist', 'character',
		'expression', 'characteristic', 'action', 'clothing', 'location',
		'object', 'copyright',
		'nsfw',
		'medium', 'style', 'source', 'meta'
	]

	// Specified types
	let sorted: Tag[] = []
	for ( const type of typeOrder ) {
		if ( type in grouped ) {
			let sortedType = sortTagsByUsages( grouped[ type ] ) ?? []
			sorted?.push( ...sortedType )
		}
	}

	// Remaining types
	const remainingTypes = Object.keys( grouped ).filter( type => !typeOrder.includes( type ) )
	remainingTypes.sort()

	for ( const type of remainingTypes ) {
		let sortedType = sortTagsByUsages( grouped[ type ] ) ?? []
		sorted?.push( ...sortedType )
	}

	return sorted
}

export function groupTags( tags: Tag[] ): { [ key: string]: Tag[] } {
	let grouped: { [ key: string ]: Tag[] } = {}
	tags.forEach( ( tag: Tag ) => {
		if ( !grouped[ tag.type ] ) grouped[ tag.type ] = []
		grouped[ tag.type ].push( tag )
	})
	return grouped
}