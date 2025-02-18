import { useEffect } from "react"

import { useStore } from "@nanostores/react"
import { postList, pageSize, currentPage, filterTags, sort } from "@argon/stores/postList"
import { handleNSFW, handleSuggestive, handleUntagged, animations, PostHandleType } from "@argon/stores/options"

import type { Post } from "@argon/util/types"

import { getPosts } from "@argon/util/api"
import { parseTagString, tagsToTagString } from "@argon/util/tag"

import GalleryFile from "@argon/components/gallery/GalleryFile.tsx"

import "@argon/components/gallery/gallery.css"

export default function Gallery() {

	// Search
	const $postList = useStore( postList )

	// Page
	const $pageSize = useStore( pageSize )
	const $currentPage = useStore( currentPage )

	// Filter + Sort
	const $filterTags = useStore( filterTags )
	const $sort = useStore( sort )

	// Handle post types
	const $handleNSFW = useStore( handleNSFW )
	const $handleSuggestive = useStore( handleSuggestive )
	const $handleUntagged = useStore( handleUntagged )

	// Load posts
	async function loadPosts() {
		loadUrlSearch()
		let searchTags = parseTagString( $filterTags )

		// Post type
		if ( $handleNSFW === PostHandleType.Hide )
			searchTags.push({ name: 'nsfw', type: 'nsfw', exclude: true })
		if ( $handleSuggestive === PostHandleType.Hide )
			searchTags.push({ name: 'suggestive', type: 'nsfw', exclude: true })
		if ( $handleUntagged === PostHandleType.Hide )
			searchTags.push({ name: 'untagged', type: 'meta', exclude: true })

		let posts = await getPosts(
			new Request( '/api/search' ),
			{ tags: searchTags, sort: $sort }
		)
		if ( posts ) postList.set( posts )
	}

	useEffect(() => { loadPosts() }, [
		$pageSize, $currentPage, $filterTags, $sort,
		$handleNSFW, $handleSuggestive, $handleUntagged
	])

	function loadUrlSearch() {
		let params = new URLSearchParams( window.location.search )
		let query = params.get( 'q' )

		if ( !query ) return
		let urlTags = parseTagString( query )

		if (urlTags.length != 0 && $filterTags.length === 0)
			filterTags.set( tagsToTagString( urlTags ) )
	}

	return (
		<div className="gallery">
			{ $postList?.length > 0 && $postList.map( ( post: Post ) => {
				if ( post.id ) return (
					<GalleryFile key={ post.id } post={ post } />
				)
			})}
		</div>
	)

}