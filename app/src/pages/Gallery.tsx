import { useEffect, useState } from "react";

import ImageGrid from "../components/gallery/ImageGrid"
import Navbar from "../components/layout/Navbar"
import Paginate from "../components/layout/Paginate";

import { post } from "../util/api";
import { tagStringToTag } from "../util/tag";

import "./Gallery.css";

async function search(page?: number, tags?: any[], sort?: string) {
    let searched = await post('search', {
        page: page || 1,
        pageSize: 60,
        tags: tags || [],
        sort: sort || 'newest'
    });
    return searched;
}

export default function Gallery() {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [listBookmarks, setListBookmarks] = useState(false);

    const [tags, setTags] = useState<any[]>([]);
    const [sort, setSort] = useState('newest');
    const [blurNSFW, setBlurNSFW] = useState(true);
    const [blurSuggestive, setBlurSuggestive] = useState(true);
    const [blurUntagged, setBlurUntagged] = useState(false);

    useEffect(() => {
        update();
        document.getElementById('content')?.scroll({ top: 0, behavior: 'smooth' });
    }, [page, sort, listBookmarks]);

    async function update(query?: string, clearPage?: boolean) {
        let isSearch = query !== undefined;
        let tagged = getTagsFromQuery(query || '');
        if (isSearch) setTags(tagged);
        // Search
        let searched;
        if (!listBookmarks) searched = await search(page, (isSearch ? tagged : tags) || [], sort);
        else searched = await bookmarked();
        setPosts(searched?.posts ?? []);
        // Page
        setPages(searched?.pages ?? 1);
        if (clearPage) setPage(1);
    }

    async function bookmarked() {
        let bookmarks = localStorage.getItem('bookmarks');
        bookmarks = JSON.parse(bookmarks as string);
        if (!bookmarks) return;
        let bookPosts = await post('postlist', {
            ids: bookmarks,
            page: page,
            pageSize: 60,
            sort: sort
        });
        return bookPosts;
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
                toggleBookmarks={() => setListBookmarks(!listBookmarks)}
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