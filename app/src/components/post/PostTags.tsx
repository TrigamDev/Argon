import type { Tag } from "../../util/types";

import '@argon/components/post/post-tags.css'
import '@argon/globals.css'

interface Props { tags: Tag[] }
export default function PostTags({ tags }: Props) {

	return (
		<div className="post-tags">
			{ tags?.map((tag: Tag) => {
				return <PostTag key={`${tag.name}_(${tag.type})`} tag={tag} />
			})}
		</div>
	)
}

/* Tags:
	artist, character, copyright, source, medium, meta, content, style,
	expression, clothing, object, location, characteristic, nsfw
*/

interface TagProps { tag: Tag }
export function PostTag({ tag }: TagProps) {
	return (
		<a className="post-tag" href={`/?q=${tag.name}_(${tag.type})`}>
			<img src={`/icons/tag/${tag.type}.svg`} alt={tag.type} title={tag.type} className="post-tag-icon"/>
			<span className="post-tag-name">{tag.name}</span>
		</a>
	)
}