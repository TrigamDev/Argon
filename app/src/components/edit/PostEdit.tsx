import { useState } from "react"

import type { Value } from "node_modules/react-datetime-picker/dist/cjs/shared/types"

import type { Post, Tag } from "@argon/util/types"
import { upload, post as apiPost } from "@argon/util/api"
import { parseTagString } from "@argon/util/tag"

import EditPostNav from "@argon/components/navbar/post/EditPostNav"
import Tags from "@argon/components/tag/TagInput"
import Timestamp from "@argon/components/input/Timestamp"
import Text from "@argon/components/input/Text"

import "@argon/components/edit/post-edit.css"
import "@argon/globals.css"

interface Props { post: Post }
export default function PostEdit({ post }: Props) {

	// Updating
	const [newTitle, setNewTitle] = useState(post.file.title)
	const [newTimestamp, setNewTimestamp] = useState(post.file.timestamp)
	const [newSourceUrl, setNewSourceUrl] = useState(post.file.sourceUrl)
	const [newTags, setNewTags] = useState(post.tags)

	function updateTimestamp(value: Value) {
		if (value) setNewTimestamp(value.getTime())
	}
	function updateTitle(value: string) { setNewTitle(value) }
	function updateSourceUrl(value: string) { setNewSourceUrl(value) }
	function updateTags(tags: Tag[]) { setNewTags( tags ) }

	// Saving
	function savePost() {
		let formdata = new FormData()
		formdata.append('title', newTitle)
		formdata.append('timestamp', newTimestamp.toString())
		formdata.append('sourceUrl', newSourceUrl || "")
		formdata.append('tags', JSON.stringify(newTags))

		upload(null, `post/edit/${post.id}`, formdata, async (response: Response) => {
			let res = await response.json()
			if ( res?.error ) alert( res?.error )
			else window.location.href = `.`
		})
	}
	
	function deletePost() {
		apiPost(null, `post/delete/${post.id}`, {}, async (response: Response) => {
			let res = await response.json()
			if ( res?.error ) alert( res?.error )
			else window.location.href = `/`
		})
	}

	return (
		<div className="post-edit-area">
			{ post && <EditPostNav
				savePost={ savePost }
				deletePost={ deletePost }
				/>
			}
			<div className="post-edit-content">
				<h1 className="post-title">Edit { post?.file.title }.{post?.file.extension}</h1>
				{ post &&
					<ul className="post-edit-fields">
						<li className="post-edit-title">
							<h2>Title</h2>
							<Text currentText={post.file.title} onChange={updateTitle} />
						</li>
						<li className="post-edit-timestamp">
							<h2>Created</h2>
							<Timestamp currentTimestamp={ post.file.timestamp } onChange={updateTimestamp} />
						</li>
						<li className="post-edit-source-url">
							<h2>Source URL</h2>
							<Text currentText={post.file.sourceUrl} onChange={updateSourceUrl} />
						</li>
						<li className="post-edit-tags">
							<h2>Tags</h2>
							<Tags
								search={false}
								multiline={true}
								defaultValue={ post.tags }
								onChange={updateTags}
							/>
						</li>
					</ul>
				}
			</div>
		</div>
	)
}