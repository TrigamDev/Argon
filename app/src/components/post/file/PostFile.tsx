import { useEffect } from "react"

import { dimensions, size } from "../../../stores/file"

import type { Post } from "../../../util/types"

import "./post-file.css"
import VideoPlayer from "./VideoPlayer"
import Visualizer from "./Visualizer"

export const prerender = false

interface Props { post: Post }
export default function PostFile({ post }: Props) {

	// Load file
	useEffect(() => {
		if (post.file.type === 'image') loadImageData(post)
	}, [ post ])

	// Load file size
	useEffect(() => {
		async function loadFileSize() {
			const fileSize = await getFileSize(post.file.url)
			if (fileSize && !isNaN(fileSize)) size.set(fileSize)
		}
		loadFileSize()
	}, [ post ])

	return (
		<div className="post-file-container">
			{ /* Image */ }
			{ post && post.file && post.file.type === 'image' &&
				<img className="post-file" src={post.file.thumbnailUrl}
					alt={post.file.title} title={post.file.title} loading="eager"
				/>
			}

			{ /* Video */ }
			{ post && post.file && post.file.type === 'video' &&
				<VideoPlayer post={post} />
			}

			{ /* Audio */ }
			{ post && post.file && post.file.type === 'audio' &&
				<Visualizer post={post} bars={true}/>
			}
		</div>
	)
}

async function getFileSize(url: string) {
	const response = await fetch(url)
	const blob = await response.blob()
	return blob.size
}

function loadImageData(post: Post) {
	// Get element
	let imageElem = document.querySelector('.post-file') as HTMLImageElement
	if (!imageElem) return

	// Load image
	let loader = new Image()
	loader.src = post.file.url
	loader.onload = () => {
		imageElem.src = loader.src
		// Set props
		dimensions.set({ width: loader.width, height: loader.height })
	}
}