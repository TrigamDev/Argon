// import { useEffect, useState } from "react"

// import { get } from "@argon/util/api"
// import type { Tag } from "@argon/util/types"
// import { parseTagString, tagsToTagString } from "@argon/util/tag"

// import { filterTags } from "@argon/stores/postList"

// import "@argon/components/tag/tag-input.css"
// import TrigamAutocomplete from "@argon/libs/trigam-autocomplete/components/TrigamAutocomplete"

// interface Props {
// 	search?: boolean,
// 	multiline?: boolean,
// 	presetTags?: Tag[],
// 	onChange?: (value: string) => void
// }
// export default function Tags({ search = true, multiline = false, presetTags = [], onChange }: Props) {

// 	const [tags, setTags] = useState<Tag[]>([])

// 	useEffect(() => {
// 		async function loadTags() {
// 			await get(null, `tags/list`, async (res: Response) => {
// 				let loadedTags = await res.json() as Tag[]
// 				setTags(loadedTags)
// 			})
// 		}
// 		loadTags()
// 	}, [])

// 	function hackSolution(tag: Tag) {
// 		let typeRegex = /_\([^)]+\)/g
// 		let isTyped = (tag.name.match(typeRegex) != null)
// 		if (!isTyped) tag.name = `${tag.name}_(${tag.type})`
// 		return tag
// 	}

// 	const testTags = [{
// 		type: 'meta',
// 		name: 'tag_1',
// 		usages: 2
// 	}, {
// 		type: 'meta',
// 		name: 'tag_3',
// 		usages: 1
// 	}, {
// 		type: 'artist',
// 		name: 'trigam',
// 		usages: 6
// 	}, {
// 		type: 'artist',
// 		name: 'spurhuns',
// 		usages: 3
// 	}, {
// 		type: 'character',
// 		name: 'amber',
// 		usages: 4
// 	}]

// 	return (
// 		<div className="tag-input-container">
// 			{ tags && 
// 				<TrigamAutocomplete<Tag>
// 					className="search-bar"
// 					choices={ testTags }
// 					keys={ ['name', 'type'] }

// 					multiline={ multiline }
// 					multiInput={ true }
// 					splitter=" "

// 					defaultValue={ tagsToTagString(presetTags) }
// 				/>
// 			}
// 			{ search &&
// 				<div className="nav-button-container">
// 					<button id="search-button" className="button focusable" onClick={forceSearch}>
// 						<img src="/icons/nav/search.svg" alt="Search" className="nav-icon"/>
// 					</button>
// 				</div>
// 			}
// 			{/* { tags &&
// 				<ReactSearchAutocomplete<Tag>
// 					className="search-bar"
// 					items={tags.map(tag => hackSolution(tag) )}
// 					fuseOptions={{ keys: ["name", "type"] }}
					
// 					multi
// 					multiline={multiline}
// 					splitter=" "
// 					inputSearchString={tagsToTagString(presetTags)}

// 					onSearch={handleOnSearch}

// 					sortResults={sortResults}
// 					formatResult={formatResult}
// 					showIcon={false}
// 					showClear={false}

// 					styling={{
// 						boxShadow: "none",
// 						hoverBackgroundColor: "var(--accent)",
// 					}}
// 				/>
// 			}
// 			{ search &&
// 				<div className="nav-button-container">
// 					<button id="search-button" className="button focusable" onClick={forceSearch}>
// 						<img src="/icons/nav/search.svg" alt="Search" className="nav-icon"/>
// 					</button>
// 				</div>
// 			} */}
// 		</div>
// 	)

// 	function forceSearch() {
// 		let input: HTMLInputElement | null = document.querySelector('.search-bar input')
// 		if (input) handleOnSearch(input.value ?? "")
// 	}

// 	function handleOnSearch(search: string) {
// 		if (onChange) onChange(search)
// 		if (search || search == "") {
// 			filterTags.set(parseTagString(search))
// 		}
// 	}

// 	function sortResults(tags: Tag[]) {
// 		let sorted = tags.sort((tagA, tagB) => (tagB.usages ?? 0) - (tagA.usages ?? 0))
// 		return sorted
// 	}

// 	function formatResult(tag: Tag) {
// 		return (
// 			<div className="search-result">
// 				<div id="left">
// 					<img src={`/icons/tag/${tag.type}.svg`} alt={tag.name} title={tag.type} className="tag-icon"/>
// 					<span className="tag-name">{tag.name}</span>
// 				</div>
// 				<span className="tag-usages">({tag.usages})</span>
// 			</div>
// 		)
// 	}
// }