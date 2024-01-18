import { useEffect, useState } from "react";
import ImageGrid from "../components/gallery/ImageGrid"
import Navbar from "../components/layout/Navbar"

import "../css/gallery.css";
import { post } from "../util/api";
import { tagStringToTag } from "../util/tag";

async function search(tags: any[]) {
    let searched = await post('search', {
        tags: tags
    });
    let sorted = searched.sort((a: any, b: any) => {
        return b.file.timestamp - a.file.timestamp;
    });
    return sorted;
}

export default function Gallery() {
    const [posts, setPosts] = useState<any[]>([]);
    useEffect(() => {
        updatePosts();
    }, []);

    async function updatePosts() {
        let posts = await search([]);
        setPosts(posts);
    }

    async function handleSearch(query: string) {
        let tags = getTagsFromQuery(query);
        let posts = await search(tags ?? []);
        setPosts(posts);
    }

    return (
        <div id="gallery">
            <Navbar
                onSearch={handleSearch}
                updatePosts={updatePosts}
            />
            <div id="content">
                <ImageGrid posts={posts}/>
            </div>
        </div>
    )
}

function getTagsFromQuery(query: string) {
    if (!query || query === '') return;
    query.trim();
    let tags = query.split(' ').map((tag: string) => {
        if (tag === '') return;
        let exclude = false;
        if (tag.startsWith('!')) {
            exclude = true;
            tag = tag.substring(1);
        }
        let tagged = tagStringToTag(tag);
        if (!tagged) return;
        const name = tagged.name;
        const type = tagged.type;
        return { name, type, exclude };
    });
    tags = tags.filter((tag: any) => tag);
    return tags;
}