import { useEffect } from "react"

import { useStore } from "@nanostores/react"
import { postList, pageSize, currentPage, filterTags, sort } from "../../stores/postList"

import { getPosts } from "../../util/api"
import type { Post } from "../../util/types"

import GalleryFile from "./GalleryFile"

import "./gallery.css"

export default function Gallery() {

	// Props
	const $postList = useStore(postList)
	const $pageSize = useStore(pageSize)
	const $currentPage = useStore(currentPage)
	const $filterTags = useStore(filterTags)
	const $sort = useStore(sort)

	// Load posts
	useEffect(() => {
		async function loadPosts() {
			let posts = await getPosts(new Request('/api/search'))
			if (posts) postList.set(posts)
		}
		loadPosts()
	}, [$pageSize, $currentPage, $filterTags, $sort])

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