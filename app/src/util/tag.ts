import type { Tag } from "./types";

export function parseTagString(tagString: string): Tag[] {
	let tags = tagString.split(' ').map((tag: string) => {
		const match = tag?.match(/^(.*)_\((.*)\)$/)
		if (!match || match.length < 2) return null
		const name = match[1].replace(/^!/, '').toLowerCase()
		const type = match[2].toLowerCase()
		const exclude = match[1].startsWith('!')
		return { name, type, exclude } as Tag
	})
	return removeDuplicates(tags.filter(tag => tag !== null) as Tag[])
}

export function tagsToTagString(tags: Tag[]): string {
	let strings = []
	for (let tag of removeDuplicates(tags)) {
		strings.push(`${tag.exclude ? '!' :''}${tag.name.toLowerCase()}_(${tag.type.toLowerCase()})`)
	}
	return strings.join(' ')
}

export function tagToString(tag: Tag) {
	return `{ "type": "${tag.type}", "name": "${tag.name}", "exclude": ${tag.exclude} }`
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
	let search = tags.filter(postTag => postTag.name == tag.name && postTag.type == tag.type)
	return search.length > 0
}