import type { SearchTag, Tag } from "./types";

export function getTagIcon(tag: Tag | SearchTag) {
    switch (tag.type) {
        case 'artist': return '/icons/tag/artist.svg';
        case 'character': return '/icons/tag/character.svg';
        case 'expression': return '/icons/tag/expression.svg';
        case 'action': return '/icons/tag/action.svg';
        case 'object': return '/icons/tag/object.svg';
        case 'content': return '/icons/tag/content.svg';
        case 'copyright': return '/icons/tag/copyright.svg';
        case 'meta': return '/icons/tag/meta.svg';
        default: return '';
    }
}

export function tagStringToTag(tagString: string): Tag | null {
    const match = tagString?.match(/^(.*)_\((.*)\)$/);
    if (!match) return null
    const safe = !match[1].startsWith('!');
    const name = match[1].replace(/^!/, '');
    const type = match[2];
    return { name, type, safe };
}

export function tagStringToSearchTag(tagString: string): SearchTag | null {
    const match = tagString?.match(/^(.*)_\((.*)\)$/);
    if (!match) return null
    const exclude = match[1].startsWith('!');
    const name = match[1].replace(/^!/, '');
    const type = match[2];
    return { name, type, exclude };
}

export function tagStringToTags(tagString: string): Tag[] {
    return tagString.split(' ').map(tagStringToTag).filter(tag => tag) as Tag[];
}

export function tagStringToSearchTags(tagString: string): SearchTag[] {
	if (tagString == "") return []
    return tagString.split(' ').map(tagStringToSearchTag).filter(tag => tag) as SearchTag[];
}

export function tagToTagString(tag: Tag | SearchTag): string {
	let exclamation = false
	let asTag = tag as Tag; let asSearch = tag as SearchTag;
	// Tag is a normal tag and unsafe
	if (!asTag.safe && !asSearch.exclude) exclamation = true
	// Tag is a search tag and excluding
	if (!asTag.safe && asSearch.exclude) exclamation = true
    return `${exclamation ? '!' : ''}${tag.name}_(${tag.type})`;
}

export function tagsToTagString(tags: Tag[] | SearchTag[]) {
	let tagStrings: string[] = []
	for (let tag of tags) {
		let stringedTag = tagToTagString(tag)
		if (!tagStrings.includes(stringedTag)) tagStrings.push(stringedTag)
	}
	return tagStrings.join(' ')
}

export function tagToString(tag: Tag) {
	return `{ "type": "${tag.type}", "name": "${tag.name}", "safe": ${tag.safe} }`
}

export function tagsToString(tags: Tag[]) {
	return `[${tags.map(tag => tagToString(tag)).join(", ")}]`
} 