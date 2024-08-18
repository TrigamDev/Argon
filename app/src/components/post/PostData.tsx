import moment from "moment"

import { useStore } from "@nanostores/react"
import { dimensions, size, duration } from "../../stores/file"

import type { Post } from "../../util/types"

import "./post-data.css"

export const prerender = false
const durationTypes = [ 'video', 'audio' ]

interface Props { post: Post }
export default function PostData({ post }: Props) {
	
	const $dimensions = useStore(dimensions)
	const $size = useStore(size)
	const $duration = useStore(duration)

	let title = `${post.file.title}.${post.file.extension}`
	let sourceName = post.file.sourceUrl ? new URL(post.file.sourceUrl).hostname : null
	let newTab = true
	let sourceUrl = post.file.sourceUrl
	if (sourceName === 'discord.com') { sourceUrl = `discord://${post.file.sourceUrl}`; newTab = false }

	return (
		<div className="post-data">
			<span className="post-title">{title}</span>
			<div className="post-info">
				{ /* Post info */}
				<span className="post-info-field" id="post-id">ID: { post.id }</span>
				<span className="post-info-field" id="post-file-timestamp">Created: { displayTimestamp(post.file.timestamp) }</span>
				<span className="post-info-field" id="post-timestamp">Posted: { displayTimestamp(post.timestamp) }</span>
				{ /* File info */ }
				<span className="post-info-field" id="post-resolution">Resolution: {$dimensions.width}x{$dimensions.height}</span>
				<span className="post-info-field" id="post-size">Size: {formatFileSize($size)}</span>
				<span className="post-info-field" id="post-file-type">Type: {post.file.type}</span>
				<span className="post-info-field" id="post-file-extenstion">Extension: {post.file.extension}</span>
				{ durationTypes.includes(post.file.type) && <span className="post-info-field" id="post-duration">Duration: {formatDuration($duration)}</span> }
				{ /* URLs */ }
				{ sourceName && <span className="post-info-field" id="post-file-source">Source: <a href={sourceUrl} target={ newTab ? "_blank" : "_self" }>{sourceName}</a></span> }
			</div>
		</div>
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
	let momentDuration = moment.duration(duration, 'seconds')
	// Prioritize the 2 largest units
	let times = [ momentDuration.years(), momentDuration.months(), momentDuration.weeks(), momentDuration.days(),
		momentDuration.hours(), momentDuration.minutes(), momentDuration.seconds()
	]
	let units = [ 'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds' ]
	let unitString = ''
	for (let i = 0; i < times.length; i++) {
		if (times[i] > 0) {
			unitString += `${Math.floor(times[i])} ${units[i]}, `
		}
	}
	return unitString.slice(0, -2)
}