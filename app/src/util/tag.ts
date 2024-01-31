export function getTagIcon(tag: any) {
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

export function tagStringToTag(tagString: string) {
    const match = tagString?.match(/^(.*)_\((.*)\)$/);
    if (!match) return;
    const safe = !match[1].startsWith('!');
    const name = match[1].replace(/^!/, '');
    const type = match[2];
    return { name, type, safe };
}

export function tagStringToTags(tagString: string) {
    return tagString.split(' ').map(tagStringToTag).filter(tag => tag);
}

export function tagToTagString(tag: any) {
    return `${tag.safe ? '' : '!'}${tag.name}_(${tag.type})`;
}