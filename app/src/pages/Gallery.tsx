import { useEffect, useState } from "react";

import ImageGrid from "../components/gallery/ImageGrid"
import Navbar from "../components/layout/Navbar"

import { post } from "../util/api";
import { tagStringToTag } from "../util/tag";

import "../css/gallery/gallery.css";
import Paginate from "../components/layout/Paginate";

async function search(page?: number, tags?: any[], sort?: string) {
    let searched = await post('search', {
        page: page || 1,
        tags: tags || [],
        sort: sort || 'newest'
    });
    return searched;
}

export default function Gallery() {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [tags, setTags] = useState<any[]>([]);
    const [sort, setSort] = useState('newest');
    const [blurNSFW, setBlurNSFW] = useState(true);
    const [blurSuggestive, setBlurSuggestive] = useState(true);
    const [blurUntagged, setBlurUntagged] = useState(false);

    useEffect(() => {
        update();
    }, [page, sort]);

    async function update(query?: string, clearPage?: boolean) {
        let isSearch = query !== undefined;
        let tagged = getTagsFromQuery(query || '');
        if (isSearch) setTags(tagged);
        // Search
        let searched = await search(page, (isSearch ? tagged : tags) || [], sort);
        setPosts(searched.posts);
        // Page
        setPages(searched.pages);
        if (clearPage) setPage(1);
    }

    function updateSettings(settings: any) {
        if (settings.sort) setSort(settings.sort);
        if (settings.blurNSFW !== undefined) setBlurNSFW(settings.blurNSFW);
        if (settings.blurSuggestive !== undefined) setBlurSuggestive(settings.blurSuggestive);
        if (settings.blurUntagged !== undefined) setBlurUntagged(settings.blurUntagged);
    };

    return (
        <div id="gallery">
            <Navbar
                updatePosts={update}
                updateSettings={updateSettings}
            />
            <div id="content">
                <ImageGrid posts={posts} settings={{ blurNSFW, blurSuggestive, blurUntagged }}/>
            </div>
            <Paginate
                pages={pages}
                onPageChange={setPage}
            />
        </div>
    )
}

function getTagsFromQuery(query: string) {
    if (!query || query === '') return [];
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