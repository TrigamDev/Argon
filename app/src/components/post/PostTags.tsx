import type { Tag } from "../../util/types";
import { getTagIcon } from '../../util/tag';

import './post-tags.css'

interface Props { tags: Tag[] }
export default function PostTags({ tags }: Props) {
	return (
		<div className="post-tags">
			{ tags.map((tag: Tag) => {
				return <PostTag key={`${tag.name}_${tag.type}`} tag={tag} />
			})}
		</div>
	)
}

interface TagProps { tag: Tag }
export function PostTag({ tag }: TagProps) {
	const icon = getTagIcon(tag);
	return (
		<div className="post-tag">
			{ icon && <img src={icon} alt={tag.name} title={tag.type} className="post-tag-icon"/> }
			<span className="post-tag-name">{tag.name}</span>
		</div>
	)
}