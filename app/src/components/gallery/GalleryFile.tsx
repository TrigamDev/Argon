import type { Post } from "../../util/types"

import "./gallery-file.css"

interface Props { post: Post }
export default function GalleryImage({ post }: Props) {
	return (
		<a className="gallery-file" href={`./post/${post.id}`}>
			{ post.file && <img className="file" src={encodeURI(post.file.thumbnailUrl)} alt={post.file.title} loading="lazy"/> }
		</a>
	)
}