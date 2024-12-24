import { useRef } from "react"

import type { Tag } from "@argon/util/types"

interface Props {
	tag: Tag
}
export default function TagIcon({ tag }: Props) {
	const iconImg = useRef<HTMLImageElement>(null)

	return (
		<img src={ `/icons/tag/${ tag.type }.svg` } alt={ tag.type } title={ tag.type }
			ref={ iconImg } className="tag-icon"
			/* Use 'unknown' icon when tag icon doesn't exist */
			onError={ ({ currentTarget }) => {
				currentTarget.onerror = null
				currentTarget.src = `/icons/tag/unknown.svg`
			}}
		/>
	)
}