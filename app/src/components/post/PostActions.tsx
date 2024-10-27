import type { Post } from "../../util/types";

import './post-actions.css'

interface Props { post: Post }
export default function PostActions({ post }: Props) {
	return (
		<div className="post-actions">

			{ /* Open in New Tab */ }
			{ post?.file?.url &&
				<a className="post-action" id="post-action-open" href={post.file.url} target="_blank" rel="noreferrer">
					<img className="post-action-icon" src="/icons/actions/open_in_new_tab.svg" alt="Open in New Tab" title="Open in New Tab"/>
				</a>
			}

			{ /* Copy */ }
			{ post?.file?.url && post.file.type === 'image' &&
				<div className="post-action" id="post-action-copy" onClick={() => copyPostMedia(post)}>
					<img className="post-action-icon" src="/icons/actions/copy.svg" alt="Copy" title="Copy"/>
				</div>
			}

			{ /* Copy Post Url */}
			{ post?.file?.url &&
				<div className="post-action" id="post-action-copy-url" onClick={() => navigator.clipboard.writeText(post.file.url)}>
					<img className="post-action-icon" src="/icons/actions/copy_link.svg" alt="Copy File URL" title="Copy File URL"/>
				</div>
			}

			{ /* Download File */ }
			{ post?.file?.url &&
				<div className="post-action" id="post-action-download" onClick={() => downloadUrl(post.file.url, post.file.title) }>
					<img className="post-action-icon" src="/icons/actions/download.svg" alt="Download" title="Download"/>
				</div>
			}

			{ /* Download Project File */ }
			{ post?.file?.url && post?.file?.projectUrl &&
				<div className="post-action" id="post-action-download-project" onClick={() => downloadUrl(post.file.projectUrl, post.file.title) }>
					<img className="post-action-icon" src="/icons/actions/project.svg" alt="Download Project" title="Download Project"/>
				</div>
			}
		</div>
	)
}

async function copyPostMedia(post: Post) {
	const { ClipboardItem } = window
	if (!ClipboardItem) return clipboardError()
	try {
		let postBlob = await fetch(post.file.url).then(res => res.blob())
		await navigator.clipboard.write([
			new ClipboardItem({
				[postBlob.type]: postBlob
			})
		])
	} catch (err) { clipboardError(err) }
}

function clipboardError(error?: any) {
	if (error) console.error('Failed to copy: ', error)
	alert("Your browser may not support copying images!")
}

async function downloadUrl(url: string, fileName: string, inferExtension = true) {
	let file = await fetch(url).then(res => res.blob())
	let urlObject = window.URL.createObjectURL(file)
	let extension = getFileExtension(url)

	// Link element
	let a = document.createElement('a')
	a.href = urlObject
	a.download = `${fileName}${inferExtension ? `.${extension}` : ''}`
	a.click()
	a.remove()
	window.URL.revokeObjectURL(urlObject)
}

/**
 * Gets the file extension from a Url
 * @param { string } url The Url to get the file extension of
 * @returns { string } The file extension
 */
export function getFileExtension(url: string): string {
	if (!url) return ""
	return url.split(".").pop()?.split('?')[0] || ""
}