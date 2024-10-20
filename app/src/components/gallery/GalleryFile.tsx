import type { Post } from "../../util/types"

import "./gallery-file.css"

interface Props { post: Post }
export default function GalleryImage({ post }: Props) {
	let thumbnailUrl = encodeURI(post.file.thumbnailUrl)
	return (
		<a className="gallery-file" href={`./post/${post.id}`}>
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