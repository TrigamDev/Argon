import type { Tag } from "@argon/util/types"

// Parse tags
export function parseTagString(tagString: string): Tag[] {
	const split = tagString.split(/\s+/)
	const tags: Tag[] = []

	for ( const tag of split ) {
		if ( !isTagValid( tag ) ) continue
		
		const [ exclude, name, type ] = parseTagComponents( tag )
		const parsed: Tag = {
			name: name?.toLowerCase() ?? '',
			type: type?.toLowerCase() ?? '',
			exclude: exclude === '!'
		}

		tags.push( parsed )
	}

	return removeDuplicates(tags.filter(tag => tag !== null) as Tag[])
}

export function isTagValid( tag: string ): boolean {
	return /^[!]?[\w\-]+_\(.*\)$/i.test( tag )
}

export function parseTagComponents( tag: string ): [ string | null, string | null, string | null ] {
	const match = tag.match( /^(!)?([\w\-]+)_\((.*?)\)$/i )
	return match ? [ match[1], match[2], match[3] ] : [ null, null, null ]
}


// Convert between tags and tag strings

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