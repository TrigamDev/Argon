import { handleNSFW, handleSuggestive, handleUntagged, animations, tagSuggestions, sortPosts, bumpscuous } from '@argon/stores/options'
import { PostHandleType, SortDirection } from '@argon/stores/options'

export enum OptionType {
	Toggle,
	Dropdown,
	Category
}

export interface Option {
	label: string
	description: string
	set: Function
	type: OptionType
}

export interface ToggleOption extends Option {
	set: (value: boolean) => {}
	type: OptionType.Toggle
	toggled: boolean
}

export interface DropdownOption<SelectionType> extends Option {
	type: OptionType.Dropdown
	options: DropdownSelection<SelectionType>[]
}

export interface DropdownSelection<SelectionType> {
	label: string
	description: string
	value: SelectionType
	selected: boolean
}

export interface Category extends Option {
	type: OptionType.Category
	open: boolean
	children: Option[]
}

export default [
	{
		label: "Post Types",
		description: "How to handle different types of posts",
		set: () => {},
		type: OptionType.Category,
		open: false,
		children: [
			{
				label: "Handle NSFW Posts",
				description: "Whether to show, blur, or hide posts with NSFW content",
				set: handleNSFW.set,
				type: OptionType.Dropdown,
				options: [{
					label: "Show NSFW Posts",
					description: "Show NSFW posts as normal",
					value: PostHandleType.Show,
					selected: handleNSFW.get() == PostHandleType.Show
				}, {
					label: "Blur NSFW Posts",
					description: "Apply a blur effect to the thumbnail of NSFW posts\n(post is unblurred when hovered over)",
					value: PostHandleType.Blur,
					selected: handleNSFW.get() == PostHandleType.Blur
				}, {
					label: "Hide NSFW Posts",
					description: "Completely remove NSFW posts from the home page and search results",
					value: PostHandleType.Hide,
					selected: handleNSFW.get() == PostHandleType.Hide
				}]
			} as DropdownOption<PostHandleType>,

			{
				label: "Handle Suggestive Posts",
				description: "Whether to show, blur, or hide posts with suggestive content",
				set: handleSuggestive.set,
				type: OptionType.Dropdown,
				options: [{
					label: "Show Suggestive Posts",
					description: "Show suggestive posts as normal",
					value: PostHandleType.Show,
					selected: handleSuggestive.get() == PostHandleType.Show
				}, {
					label: "Blur Suggestive Posts",
					description: "Apply a blur effect to the thumbnail of suggestive posts\n(post is unblurred when hovered over)",
					value: PostHandleType.Blur,
					selected: handleSuggestive.get() == PostHandleType.Blur
				}, {
					label: "Hide Suggestive Posts",
					description: "Completely remove suggestive posts from the home page and search results",
					value: PostHandleType.Hide,
					selected: handleSuggestive.get() == PostHandleType.Hide
				}]
			} as DropdownOption<PostHandleType>,
			
			{
				label: "Handle Untagged Posts",
				description: "Whether to show, blur, or hide posts that are yet to be tagged\n(could be potentially suggestive or NSFW)",
				set: handleUntagged.set,
				type: OptionType.Dropdown,
				options: [{
					label: "Show Untagged Posts",
					description: "Show untagged posts as normal",
					value: PostHandleType.Show,
					selected: handleUntagged.get() == PostHandleType.Show
				}, {
					label: "Blur Untagged Posts",
					description: "Apply a blur effect to the thumbnail of untagged posts\n(post is unblurred when hovered over)",
					value: PostHandleType.Blur,
					selected: handleUntagged.get() == PostHandleType.Blur
				}, {
					label: "Hide Untagged Posts",
					description: "Completely remove untagged posts from the home page and search results",
					value: PostHandleType.Hide,
					selected: handleUntagged.get() == PostHandleType.Hide
				}]
			} as DropdownOption<PostHandleType>
		]
	} as Category,

	{
		label: "Sort Posts",
		description: "The method used to sort posts",
		set: sortPosts.set,
		type: OptionType.Dropdown,
		options: [{
			label: "Newest to Oldest",
			description: "Sort posts with the newest being first",
			value: SortDirection.timestamp,
			selected: sortPosts.get() == SortDirection.timestamp
		}, {
			label: "Oldest to Newest",
			description: "Sort posts with the oldest being first",
			value: SortDirection.timestampReverse,
			selected: sortPosts.get() == SortDirection.timestampReverse
		}, {
			label: "Highest Tag Count",
			description: "Sort posts with the posts with the most tags being first",
			value: SortDirection.tagCount,
			selected: sortPosts.get() == SortDirection.tagCount
		}, {
			label: "Lowest Tag Count",
			description: "Sort posts with the posts with the least tags being first",
			value: SortDirection.tagCountReverse,
			selected: sortPosts.get() == SortDirection.tagCountReverse
		}, {
			label: "Highest ID to Lowest",
			description: "Sort posts with the posts with the highest ID being first",
			value: SortDirection.postId,
			selected: sortPosts.get() == SortDirection.postId
		}, {
			label: "Lowest ID to Highest",
			description: "Sort posts with the posts with the lowest ID being first",
			value: SortDirection.postIdReverse,
			selected: sortPosts.get() == SortDirection.postIdReverse
		}]
	} as DropdownOption<SortDirection>,

	{
		label: "Animations",
		description: "Whether or not to show animations on UI elements",
		set: (value: boolean) => { animations.set(value) },
		type: OptionType.Toggle,
		toggled: animations.get() == true
	} as ToggleOption,

	{
		label: "Sort Posts",
		description: "The method used to sort posts",
		set: sortPosts.set,
		type: OptionType.Dropdown,
		options: [{
			label: "Newest to Oldest",
			description: "Sort posts with the newest being first",
			value: SortDirection.timestamp,
			selected: sortPosts.get() == SortDirection.timestamp
		}, {
			label: "Oldest to Newest",
			description: "Sort posts with the oldest being first",
			value: SortDirection.timestampReverse,
			selected: sortPosts.get() == SortDirection.timestampReverse
		}, {
			label: "Highest Tag Count",
			description: "Sort posts with the posts with the most tags being first",
			value: SortDirection.tagCount,
			selected: sortPosts.get() == SortDirection.tagCount
		}, {
			label: "Lowest Tag Count",
			description: "Sort posts with the posts with the least tags being first",
			value: SortDirection.tagCountReverse,
			selected: sortPosts.get() == SortDirection.tagCountReverse
		}, {
			label: "Highest ID to Lowest",
			description: "Sort posts with the posts with the highest ID being first",
			value: SortDirection.postId,
			selected: sortPosts.get() == SortDirection.postId
		}, {
			label: "Lowest ID to Highest",
			description: "Sort posts with the posts with the lowest ID being first",
			value: SortDirection.postIdReverse,
			selected: sortPosts.get() == SortDirection.postIdReverse
		}]
	} as DropdownOption<SortDirection>,

	{
		label: "Suggest Tags",
		description: "When searching, show suggestions/autocomplete tags",
		set: (value: boolean) => tagSuggestions.set(value),
		type: OptionType.Toggle,
		toggled: animations.get() == true
	} as ToggleOption,

	{
		label: "Bumpscuous",
		description: ":)",
		set: (value: boolean) => bumpscuous.set(value),
		type: OptionType.Toggle,
		toggled: bumpscuous.get() == true
	} as ToggleOption
] as Option[]

export function labelToId(label: string) {
	return label.toLowerCase().replace(/ /g, '-')
}