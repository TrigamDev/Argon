import { useEffect, useState } from "react"

import { get } from "@argon/util/api"
import type { SearchTag, Tag } from "@argon/util/types"
import { getTagIcon, tagsToTagString, tagStringToSearchTags } from "@argon/util/tag"

import { ReactSearchAutocomplete } from "@argon/libs/react-search-autocomplete"

import { filterTags } from "@argon/stores/postList"

import "@argon/components/input/tags.css"

interface Props {
	search?: boolean,
	multiline?: boolean,
	presetTags?: SearchTag[] | Tag[],
	onChange?: (value: string) => void
}
export default function Tags({ search = true, multiline = false, presetTags = [], onChange }: Props) {

	const [tags, setTags] = useState<SearchTag[]>([])

	useEffect(() => {
		async function loadTags() {
			await get(null, `/tags/list`, async (res: Response) => {
				let loadedTags = await res.json() as SearchTag[]
				setTags(loadedTags)
			})
		}
		loadTags()
	}, [])

	function hackSolution(tag: SearchTag) {
		if (!tag.name.includes('_')) tag.name = `${tag.name}_(${tag.type})`
		return tag
	}

	return (
		<div className="search-bar-container">
			{ tags && tags.length > 0 &&
				<ReactSearchAutocomplete<SearchTag>
					className="search-bar"
					items={tags.map(tag => hackSolution(tag) )}
					fuseOptions={{ keys: ["name", "type"] }}
					
					multi
					multiline={multiline}
					splitter=" "
					inputSearchString={tagsToTagString(presetTags)}

					onSearch={handleOnSearch}

					sortResults={sortResults}
					formatResult={formatResult}
					showIcon={false}

					styling={{
						boxShadow: "none",
						hoverBackgroundColor: "var(--accent)",
					}}
				/>
			}
			{ search &&
				<div className="nav-button-container">
					<button id="search-button" className="nav-button" onClick={forceSearch}>
						<img src="/icons/nav/search.svg" alt="Search" className="nav-icon"/>
					</button>
				</div>
			}
		</div>
	)

	function forceSearch() {
		let input: HTMLInputElement | null = document.querySelector('.search-bar input')
		if (input) handleOnSearch(input.value ?? "")
	}

	function handleOnSearch(search: string) {
		if (onChange) onChange(search)
		if (search || search == "") {
			filterTags.set(tagStringToSearchTags(search))
		}
	}

	function sortResults(tags: SearchTag[]) {
		let sorted = tags.sort((tagA, tagB) => (tagB.usages ?? 0) - (tagA.usages ?? 0))
		return sorted
	}

	function formatResult(tag: SearchTag) {
		const icon = getTagIcon(tag)
		return (
			<div className="search-result">
				<div id="left">
					{ icon && <img src={icon} alt={tag.name} title={tag.type} className="tag-icon"/> }
					<span className="tag-name">{tag.name}</span>
				</div>
				<span className="tag-usages">({tag.usages})</span>
			</div>
		)
	}
}