import { useEffect, useRef, useState, type SyntheticEvent } from "react"

import type { Tag } from "@argon/util/types"

interface Props {
	tag: Tag
}
export default function TagIcon({ tag }: Props) {
	const [ useDefault, setUseDefault ] = useState<boolean>( false )

	const iconUrl = `/icons/tag/${ tag.type }.svg`
	const defaultIconUrl = `/icons/tag/unknown.svg`
	
	useEffect(() => {
		const checkImage = new Image()
		checkImage.src = iconUrl

		checkImage.onload = () => {
			setUseDefault( false )
		}
		checkImage.onerror = () => {
			console.log(`Error on: ${ iconUrl }`)
			setUseDefault( true )
		}
	}, [ iconUrl ])

	return (
		<img src={ !useDefault ? iconUrl : defaultIconUrl } alt={ tag.type }
			title={ tag.type } className="tag-icon"
		/>
	)
}