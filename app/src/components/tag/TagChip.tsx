import type { Tag } from "@argon/util/types"

import '@argon/components/tag/tag-chip.css'
import '@argon/globals.css'
import TagIcon from "./TagIcon"

interface Props {
	tag: Tag
	href?: string
	usages?: boolean
}
export default function TagChip({ tag, href = '', usages = false }: Props) {
	return (
		<a className={ `tag-chip ${ href != '' ? 'clickable' : '' }` } href={ href != '' ? href : '#' }>
			<div className="tag-left">
				<TagIcon tag={ tag }/>
				<span className="tag-name">{ tag.name }</span>
			</div>
			<div>
				{ usages && <span className="tag-usages">({ tag.usages })</span> }
			</div>
		</a>
	)
}