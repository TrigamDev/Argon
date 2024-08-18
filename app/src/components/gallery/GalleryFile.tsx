import type { Post } from "../../util/types"

import "./gallery-file.css"

interface Props { post: Post }
export default function GalleryImage({ post }: Props) {
	let thumbnailUrl = encodeURI(post.file.thumbnailUrl)
	return (
		<a className="gallery-file" href={`./post/${post.id}`}>
			{ post.file &&
				<img className="file"
					src={thumbnailUrl}
					alt={post.file.title}
					loading="lazy"
				/>
			}
		</a>
	)
}