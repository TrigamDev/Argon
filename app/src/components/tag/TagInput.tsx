import { useEffect, useState } from "react"

import { filterTags } from "@argon/stores/postList"

import type { Tag } from "@argon/util/types"

import { get } from "@argon/util/api"
import { areTagsEqual, parseTagString, sortTagsByUsages, tagsToTagString, } from "@argon/util/tag"

import { Multiselect } from "@argon/libs/multiselect-react-dropdown"
import TagChip from "@argon/components/tag/TagChip.tsx"
import TagIcon from "@argon/components/tag/TagIcon.tsx"

import "@argon/components/tag/tag-input.css"
import "@argon/globals.css"

interface Props {
	search?: boolean,
	multiline?: boolean,
	defaultValue?: Tag[],
	onChange?: ( value: Tag[] ) => void
}
export default function Tags ({ search = true, multiline = false, defaultValue = [], onChange, ...props }: Props) {
	
	const [tags, setTags] = useState<Tag[]>([])

	useEffect(() => {
		async function loadTags() {
			await get(null, `tags/list`, async (res: Response) => {
				let loadedTags = await res.json() as Tag[]
				setTags(loadedTags)
			})
		}
		loadTags()
	}, [])


	function onItemChange (selectedList: Tag[], selectedItem: Tag) {
		// Scroll input box
		let input: HTMLInputElement | null = document.querySelector('.searchBox')
		if (input && !multiline) {
			setTimeout(() => {
				input.scrollIntoView({ inline: 'start', behavior: 'smooth' })
			}, 50)
		}

		filterTags.set( tagsToTagString( selectedList ) )

		// Update
		if (onChange) onChange( selectedList )
	}

	function formatResult ( value: string, tag: Tag ) {
		return (
			<div className="search-result">
				{ tag &&
					<div id="left">
						<TagIcon tag={ tag }/>
						<span className="tag-name">{ tag.name }_({ tag.type })</span>
					</div>
				}
				{ tag?.usages && tag?.usages > 0 &&
					<span className="tag-usages">({ tag.usages })</span>
				}
			</div>
		)
	}
	function formatChip ( value: string, tag: Tag ) {
		return <TagChip tag={ tag }/>
	}

	function parseInput ( value: string ): Tag | null {
		let parsed = parseTagString( value )
		let parsedTag = parsed[0]
		if (parsedTag) {
			return parsedTag
		} else return null
	}

	return (
		<div className="tag-input-container">
			<div className="tag-input">
				<Multiselect
					className={`search-bar ${ multiline ? 'multiline' : '' }`}
		
					options={ tags }
					selectedValues={ defaultValue }

					displayValue="name"
					placeholder="Search"
					emptyRecordMsg="No Tags Available"
		
					onSelect={ onItemChange }
					onRemove={ onItemChange }

					selectedValueDecorator={ formatChip }
					optionValueDecorator={ formatResult }

					evaluateValue={ parseInput }
					areOptionsEqual={ areTagsEqual }
					sortOptions={ sortTagsByUsages }
				/>
			</div>
			{ /*search &&
				<div className="nav-button-container">
					<button id="search-button" className="button focusable" onClick={ () => {} }>
						<img src="/icons/nav/search.svg" alt="Search" className="nav-icon"/>
					</button>
				</div>*/
			}
		</div>
	)

}