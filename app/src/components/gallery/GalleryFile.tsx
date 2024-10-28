import type { Post } from "../../util/types"

import { useStore } from "@nanostores/react"
import { handleNSFW, handleSuggestive, handleUntagged, animations, tagSuggestions, PostHandleType } from "@argon/stores/options"

import "./gallery-file.css"
import { hasTag } from "@argon/util/tag"

interface Props { post: Post }
export default function GalleryImage({ post }: Props) {

	const $handleNSFW = useStore(handleNSFW)
	const $handleSuggestive = useStore(handleSuggestive)
	const $handleUntagged = useStore(handleUntagged)

	let thumbnailUrl = encodeURI(post.file.thumbnailUrl)

	let isNsfw = hasTag(post.tags, { name: 'nsfw', type: 'nsfw' })
	let isSuggestive = hasTag(post.tags, { name: 'suggestive', type: 'nsfw' })
	let isUntagged = post.tags.length < 1

	let blur =
		($handleNSFW == PostHandleType.Blur && isNsfw)
		|| ($handleSuggestive == PostHandleType.Blur && isSuggestive)
		|| ($handleUntagged == PostHandleType.Blur && isUntagged)

	return (
		<a className={`gallery-file ${blur ? 'blur' : ''}`} href={`./post/${post.id}`}>
			{ post.file &&
				<div className="file-container">
					{ post.file.type !== "image" &&
						<img className="file-type-icon" src={`/icons/file/${post.file.type}.svg`}/>
					}
					{ post.file.type == "image" && post.file.extension == "gif" &&
						<img className="file-type-icon" src={`/icons/file/${post.file.extension}.svg`}/>
					}
					<img className="file"
						src={thumbnailUrl}
						alt={post.file.title}
						loading="lazy"
					/>
				</div>
			}
		</a>
	)
}