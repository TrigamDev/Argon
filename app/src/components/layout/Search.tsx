import { useEffect } from "react"
import { get } from "../../util/api";

import Awesomplete from "awesomplete";
import { getTagIcon, tagStringToTag } from "../../util/tag";

const tags = await get('gettags');
let excluding = false;
let query = '';

function getTag(name: string, type: string) {
    let tag = tags.find((tag: any) => {
        return tag.name === name && tag.type === type;
    });
    return tag;
}

export default function Search({ onSearch, onChange, initValue, hideButton, excludeExcluding, big, id }: { onSearch: CallableFunction, onChange: CallableFunction, initValue?: string, hideButton?: boolean, excludeExcluding?: boolean, big?: boolean, id?: string }) {
    useEffect(() => {
        let input = document.querySelector('.search-bar') as HTMLTextAreaElement;
        new Awesomplete(input!, {
            list: tags.map((tag: any) => {
                return { label: tag.name, value: `${tag.name}_(${tag.type})` };
            }),
            minChars: 1,
            maxItems: 10,
            autoFirst: true,
            item: function(text, input) {
                if (input.split(' ')[input.split(' ').length - 1].startsWith('!')) excluding = true;
                else excluding = false;
                const match = input.match(/[^ ]*$/);
                return suggestionItem(text, match?.[0] || '');
            },
            filter: function(text: any, input) {
                let filter = Awesomplete.FILTER_CONTAINS(text, input.match(/[^ !]*$/)?.[0] || '');
                if (excludeExcluding) filter = filter = Awesomplete.FILTER_CONTAINS(text, input.match(/[^ ]*$/)?.[0] || '');
                if (input.includes(text.value)) return false;
                return filter;
            },
            replace: function(text: any) {
                var before = input?.value.match(/^.+ \s*|/)?.[0] || '';
                input.value = before + (excluding ? '!' : '') + text.value + " ";
                query = input.value;
                onChange(query);
            }
        });
    }, []);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSearch(query);
    }

    const handleChange = (e: any) => {
        query = e.target.value;
        onChange(query);
    }

    return (
        <form id={ id ?? 'search' } onSubmit={handleSubmit}>
            { !big && <input type="text" placeholder="Search" className="search-bar" onChange={handleChange}/> }
            { big && <textarea placeholder="Search" className="search-bar" defaultValue={initValue} spellCheck="false" onChange={handleChange}/> }
            { !hideButton && <input type="image" id="search-button" src="/icons/search.svg" className="nav-button nav-icon"/> }
        </form>
    )
};

function suggestionItem(item: any, input: string) {
    // Get tag info
    let tagInfo = tagStringToTag(item.value);
    if (!tagInfo) return document.createElement("div");
    let tag = getTag(tagInfo.name, tagInfo.type);
    let i = getTagIcon(tag);

    // Containers
    let container = document.createElement("div")
        container.className = "suggestion";
    let tagName = document.createElement("span")
        tagName.className = "tag-name";
    let label = document.createElement("span")
        label.className = "label";

    // Text
    // Icon
    let icon = document.createElement("img")
        icon.src = getTagIcon(tag);
        icon.className = "icon";
    let before = document.createElement("span")
        before.textContent = item.label.substring(0, item.label.indexOf(input));
    let highlight = document.createElement("strong")
        highlight.textContent = input;
    let rest = document.createElement("span")
        rest.textContent = item.label.substring(item.label.indexOf(input) + input.length);
    
    // Count
    let count = document.createElement("span")
        count.textContent = `(${tag?.count})`;
        count.className = "count";
    
    // Icon
    if (i) tagName.appendChild(icon);
    // Tag name
    label.appendChild(before);
    label.appendChild(highlight);
    label.appendChild(rest);

    tagName.appendChild(label);
    container.appendChild(tagName);
    // Count
    container.appendChild(count);
    return container;
}