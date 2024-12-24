'use client'

import moment from "moment"

import { useStore } from "@nanostores/react"
import { dimensions, size, duration } from "../../stores/file"

import type { Post } from "../../util/types"

import "./post-data.css"
import { isUrlValid } from "@argon/util/url"

export const prerender = false
const durationTypes = [ 'video', 'audio' ]

interface Props { post: Post }
export default function PostData({ post }: Props) {
	
	const $dimensions = useStore(dimensions)
	const $size = useStore(size)
	const $duration = useStore(duration)

	let isSourceValid = isUrlValid(post?.file?.sourceUrl)
	let sourceName = isSourceValid ? new URL(post?.file?.sourceUrl)?.hostname : null

	let newTab = false
	let sourceUrl = post?.file?.sourceUrl
	switch (sourceName) {
		case 'discord.com': { sourceUrl = `discord://${post?.file?.sourceUrl}`; break }
		default: { newTab = true }
	}

	return (
		<ul className="post-info">
			{ /* Post info */}
			<li className="post-info-field" id="post-id">Post ID: { post?.id }</li>
			<li className="post-info-field" id="post-file-timestamp">Created: { displayTimestamp(post?.file?.timestamp) }</li>
			<li className="post-info-field" id="post-timestamp">Posted: { displayTimestamp(post?.timestamp) }</li>
			{ /* File info */ }
			{ post?.file?.type != "audio" && <li className="post-info-field" id="post-resolution">Resolution: {$dimensions?.width}x{$dimensions?.height}</li> }
			<li className="post-info-field" id="post-size">Size: {formatFileSize($size)}</li>
			<li className="post-info-field" id="post-file-type">Type: {post?.file?.type}</li>
			<li className="post-info-field" id="post-file-extenstion">Extension: {post?.file?.extension}</li>
			{ durationTypes.includes(post?.file?.type) && <li className="post-info-field" id="post-duration">Duration: {formatDuration($duration)}</li> }
			{ /* URLs */ }
			{ sourceName && <li className="post-info-field" id="post-file-source">Source: <a href={sourceUrl} target={ newTab ? "_blank" : "_self" }>{sourceName}</a></li> }
		</ul>
	)
}

function displayTimestamp(timestamp: number) {
	return moment(timestamp).format("M/D/YYYY h:mm A")
}

function formatFileSize(fileSize: number) {
	if (!fileSize) return "0 B";
	if (fileSize < 1000) return `${fileSize} B`;
	else if (fileSize < 1000000) return `${roundToTwo(fileSize / 1000)} KB`;
	else if (fileSize < 1000000000) return `${roundToTwo(fileSize / 1000000)} MB`;
	else return `${roundToTwo(fileSize / 1000000000)} GB`;
}

function roundToTwo(num: number) {
	return Math.round((num + Number.EPSILON) * 100) / 100
}

function formatDuration(duration: number) {
	let songDuration = moment.duration(duration, 'seconds')
	return [
		songDuration.minutes(),
		songDuration.seconds()
	].map(v => v.toString().padStart(2, '0')).join(':')
}