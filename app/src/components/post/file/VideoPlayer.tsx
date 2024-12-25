import { useEffect, useRef } from "react"

import { dimensions, duration } from "@argon/stores/file"

import type { Post } from "@argon/util/types"

import "@argon/components/post/file/post-file.css"

export const prerender = false

interface Props { post: Post }
export default function VideoPlayer({ post }: Props) {
	let self = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		let dataVideo = document.createElement('video')
		dataVideo.src = post.file.url
		dataVideo.load()
		dataVideo.onloadedmetadata = () => {
			dimensions.set({ width: dataVideo.videoWidth, height: dataVideo.videoHeight })
			duration.set(dataVideo.duration)
		}
	}, [ post ])

	return (
		<video ref={self} id="post-video" className="post-file" controls>
			<source src={post.file.url} type="video/mp4" title={post.file.title} data-fluid-hd/>
		</video>
	)
}