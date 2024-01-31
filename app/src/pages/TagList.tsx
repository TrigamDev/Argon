import { useEffect, useState } from "react";
import Masonry from "react-responsive-masonry";

import { get } from "../util/api";
import TagNav from "../components/layout/TagNav";

import "./TagList.css";
import { getTagIcon } from "../util/tag";

export default function TagList() {
    const [tags, setTags] = useState<any[]>([]);

    useEffect(() => {
        async function fetchTags() {
            let tags = await get("gettags");
            let grouped = tagsToGrouped(tags);
            setTags(grouped);
        };
        fetchTags();
    }, []);

    function tagsToGrouped(tags: any[]) {
        let grouped: any = {};
        tags.forEach((tag: any) => {
            if (!grouped[tag.type]) grouped[tag.type] = [];
            grouped[tag.type].push(tag);
        });
        // Sort Groups
        grouped = Object.keys(grouped).sort().reduce((acc: any, key: any) => {
            acc[key] = grouped[key];
            return acc;
        }, {});
        return grouped;
    };

    return (
        <div>
            <TagNav tags={tags}/>
            <div id="content">
                <div id="tag-list">
                    <Masonry columnsCount={3}>
                        {Object.keys(tags).map((type: any) => {
                            let icon = getTagIcon({ name: '', type: type });
                            return (
                                <div key={type} id={'tag-' + type} className="tagbox">
                                    <div className="label">
                                        { icon && <img src={icon} alt={type} title={type} className="icon"/> }
                                        <span>{titleCase(type)}</span>
                                    </div>
                                    <ul className="tags-actually">
                                        {tags[type].map((tag: any) => (
                                            <li key={tag.name} className="tag">{tag.name} ({tag.count})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        )}
                    </Masonry>
                </div>
            </div>
        </div>
    )
}

function titleCase(str: string) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}