import { useEffect } from "react"

import { useStore } from "@nanostores/react"
import { postList, pageSize, currentPage, filterTags, sort } from "@argon/stores/postList"
import { handleNSFW, handleSuggestive, handleUntagged, animations, tagSuggestions } from "@argon/stores/options"

import { getPosts } from "@argon/util/api"
import type { Post } from "@argon/util/types"

import GalleryFile from "@argon/components/gallery/GalleryFile"

import "@argon/components/gallery/gallery.css"
import { parseTagString, tagsToTagString } from "@argon/util/tag"

export default function Gallery() {

	// Search
	const $postList = useStore(postList)

	// Page
	const $pageSize = useStore(pageSize)
	const $currentPage = useStore(currentPage)

	// Filter + Sort
	const $filterTags = useStore(filterTags)
	const $sort = useStore(sort)

	// Load posts
	async function loadPosts() {
		loadUrlSearch()
		let posts = await getPosts( new Request('/api/search'), parseTagString( $filterTags ) )
		if (posts) postList.set(posts)
	}

	useEffect(() => { loadPosts() }, [
		$pageSize, $currentPage, $filterTags, $sort
	])

	function loadUrlSearch() {
		let params = new URLSearchParams(window.location.search)
		let query = params.get('q')

		if (!query) return
		let urlTags = parseTagString(query)

		if (urlTags.length != 0 && $filterTags.length === 0)
			filterTags.set( tagsToTagString( urlTags ) )
	}

	return (
		<div className="gallery">
			{ $postList?.length > 0 && $postList.map((post: Post) => {
				if (post.id) return (
					<GalleryFile key={post.id} post={post} />
				)
			})}
		</div>
	)

}