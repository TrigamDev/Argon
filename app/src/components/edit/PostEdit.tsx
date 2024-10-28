import { useState } from "react"

import type { Value } from "node_modules/react-datetime-picker/dist/cjs/shared/types"

import type { Post } from "@argon/util/types"
import { upload, post as apiPost } from "@argon/util/api"

import EditPostNav from "@argon/components/navbar/post/EditPostNav"
import Search from "@argon/components/input/Tags"
import Timestamp from "@argon/components/input/Timestamp"
import Text from "@argon/components/input/Text"

import "@argon/components/edit/post-edit.css"
import "@argon/globals.css"
import { parseTagString } from "@argon/util/tag"

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
	function updateTitle(value: string) {
		if (value) setNewTitle(value)
	}
	function updateSourceUrl(value: string) {
		if (value) setNewSourceUrl(value)
	}
	function updateTags(tagString: string) { setNewTags(parseTagString(tagString)) }

	// Saving
	function savePost() {
		let formdata = new FormData()
		formdata.append('title', newTitle)
		formdata.append('timestamp', newTimestamp.toString())
		formdata.append('sourceUrl', newSourceUrl || "")
		formdata.append('tags', JSON.stringify(newTags))

		upload(null, `post/edit/${post.id}`, formdata, () => {
			window.location.href = `.`
		})
	}
	
	function deletePost() {
		apiPost(null, `post/delete/${post.id}`, {}, () => {
			window.location.href = `../../`
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
				<span className="post-title">Edit { post?.file.title }.{post?.file.extension}</span>
				{ post &&
					<ul className="post-edit-fields">
						<li className="post-edit-title">
							<span className="post-edit-field-name">Title</span>
							<Text currentText={post.file.title} onChange={updateTitle} />
						</li>
						<li className="post-edit-timestamp">
							<span className="post-edit-field-name">Created</span>
							<Timestamp currentTimestamp={ post.file.timestamp } onChange={updateTimestamp} />
						</li>
						<li className="post-edit-source-url">
							<span className="post-edit-field-name">Source URL</span>
							<Text currentText={post.file.sourceUrl} onChange={updateSourceUrl} />
						</li>
						<li className="post-edit-tags">
							<span className="post-edit-field-name">Tags</span>
							<Search
								search={false}
								multiline={true}
								presetTags={post.tags}
								onChange={updateTags}
							/>
						</li>
					</ul>
				}
			</div>
		</div>
	)
}