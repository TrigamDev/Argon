import type { Tag } from "./types";

export function parseTagString(tagString: string): Tag[] {
	let tags = tagString.split(' ').map((tag: string) => {
		const match = tag?.match(/^(.*)_\((.*)\)$/)
		if (!match || match.length < 2) return {} as Tag
		const name = match[1].replace(/^!/, '').toLowerCase()
		const type = match[2].toLowerCase()
		return { name, type } as Tag
	})
	return tags
}

export function tagsToTagString(tags: Tag[]): string {
	let strings = []
	for (let tag of tags) {
		strings.push(`${tag.exclude ? '!' :''}${tag.name}_(${tag.type})`)
	}
	return strings.join(' ')
}

export function tagToString(tag: Tag) {
	return `{ "type": "${tag.type}", "name": "${tag.name}" }`
}
export function tagsToString(tags: Tag[]) {
	return `[${tags.map(tag => tagToString(tag)).join(", ")}]`
}

export function removeDuplicates(tags: Tag[]) {
	let filtered = tags.filter((tag1: Tag, i, arr) => {
		return arr.findIndex((tag2: Tag) => {
			return tag1.name == tag2.name && tag1.type == tag2.type
		}) === i
	})
	return filtered
}

export function hasTag(tags: Tag[], tag: Tag) {
	let search = tags.filter(postTag => postTag.name == tag.name && postTag.type == tag.type)
	return search.length > 0
}