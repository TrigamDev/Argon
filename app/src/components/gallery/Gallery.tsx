import { useEffect } from "react"

import { useStore } from "@nanostores/react"
import { postList, pageSize, currentPage, filterTags, sort } from "../../stores/postList"
import { handleNSFW, handleSuggestive, handleUntagged, animations, tagSuggestions } from "@argon/stores/options"

import { getPosts } from "../../util/api"
import type { Post } from "../../util/types"

import GalleryFile from "./GalleryFile"

import "./gallery.css"
import { tagStringToSearchTags } from "@argon/util/tag"

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
	useEffect(() => {
		async function loadPosts() {
			loadUrlSearch()
			let posts = await getPosts(new Request('/api/search'), $filterTags)
			if (posts) postList.set(posts)
		}
		loadPosts()
	}, [$pageSize, $currentPage, $filterTags, $sort])

	function loadUrlSearch() {
		let params = new URLSearchParams(window.location.search)
		let query = params.get('q')

		if (!query) return
		let urlTags = tagStringToSearchTags(query)

		if (urlTags.length != 0 && $filterTags.length === 0)
			filterTags.set(urlTags)
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