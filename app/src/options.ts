import type { WritableAtom } from "nanostores"

import {
	handleNSFW, handleSuggestive, handleUntagged,
	animations, tagSuggestions, sortPosts,
	bumpscuous
} from "@argon/stores/options"
import { PostHandleType, SortDirection } from "@argon/stores/options"

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
	store: WritableAtom
}

export interface DropdownOption<SelectionType> extends Option {
	type: OptionType.Dropdown
	store: WritableAtom
	options: DropdownSelection<SelectionType>[]
}

export interface DropdownSelection<SelectionType> {
	label: string
	description: string
	value: SelectionType
	store: WritableAtom
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
				set: ( value: PostHandleType ) => {
					handleNSFW.set( value )
					localStorage.setItem( 'settings.handleNSFWPosts', value.toString() )
				},
				type: OptionType.Dropdown,
				store: handleNSFW,
				options: [{
					label: "Show NSFW Posts",
					description: "Show NSFW posts as normal",
					value: PostHandleType.Show,
					store: handleNSFW
				}, {
					label: "Blur NSFW Posts",
					description: "Apply a blur effect to the thumbnail of NSFW posts\n(post is unblurred when hovered over)",
					value: PostHandleType.Blur,
					store: handleNSFW
				}, {
					label: "Hide NSFW Posts",
					description: "Completely remove NSFW posts from the home page and search results",
					value: PostHandleType.Hide,
					store: handleNSFW
				}]
			} as DropdownOption<PostHandleType>,

			{
				label: "Handle Suggestive Posts",
				description: "Whether to show, blur, or hide posts with suggestive content",
				set: ( value: PostHandleType ) => {
					handleSuggestive.set( value )
					localStorage.setItem( 'settings.handleSuggestivePosts', value.toString() )
				},
				type: OptionType.Dropdown,
				store: handleSuggestive,
				options: [{
					label: "Show Suggestive Posts",
					description: "Show suggestive posts as normal",
					value: PostHandleType.Show,
					store: handleSuggestive
				}, {
					label: "Blur Suggestive Posts",
					description: "Apply a blur effect to the thumbnail of suggestive posts\n(post is unblurred when hovered over)",
					value: PostHandleType.Blur,
					store: handleSuggestive
				}, {
					label: "Hide Suggestive Posts",
					description: "Completely remove suggestive posts from the home page and search results",
					value: PostHandleType.Hide,
					store: handleSuggestive
				}]
			} as DropdownOption<PostHandleType>,
			
			{
				label: "Handle Untagged Posts",
				description: "Whether to show, blur, or hide posts that are yet to be tagged\n(could be potentially suggestive or NSFW)",
				set: ( value: PostHandleType ) => {
					handleUntagged.set( value )
					localStorage.setItem( 'settings.handleUntaggedPosts', value.toString() )
				},
				type: OptionType.Dropdown,
				store: handleUntagged,
				options: [{
					label: "Show Untagged Posts",
					description: "Show untagged posts as normal",
					value: PostHandleType.Show,
					store: handleUntagged
				}, {
					label: "Blur Untagged Posts",
					description: "Apply a blur effect to the thumbnail of untagged posts\n(post is unblurred when hovered over)",
					value: PostHandleType.Blur,
					store: handleUntagged
				}, {
					label: "Hide Untagged Posts",
					description: "Completely remove untagged posts from the home page and search results",
					value: PostHandleType.Hide,
					store: handleUntagged
				}]
			} as DropdownOption<PostHandleType>
		]
	} as Category,

	{
		label: "Sort Posts",
		description: "The method used to sort posts",
		set: ( value: SortDirection ) => {
			sortPosts.set( value )
			localStorage.setItem( 'settings.sortPosts', value.toString() )
		},
		type: OptionType.Dropdown,
		store: sortPosts,
		options: [{
			label: "Newest to Oldest",
			description: "Sort posts with the newest being first",
			value: SortDirection.timestamp,
			store: sortPosts
		}, {
			label: "Oldest to Newest",
			description: "Sort posts with the oldest being first",
			value: SortDirection.timestampReverse,
			store: sortPosts
		}, {
			label: "Highest Tag Count",
			description: "Sort posts with the posts with the most tags being first",
			value: SortDirection.tagCount,
			store: sortPosts
		}, {
			label: "Lowest Tag Count",
			description: "Sort posts with the posts with the least tags being first",
			value: SortDirection.tagCountReverse,
			store: sortPosts
		}, {
			label: "Highest ID to Lowest",
			description: "Sort posts with the posts with the highest ID being first",
			value: SortDirection.postId,
			store: sortPosts
		}, {
			label: "Lowest ID to Highest",
			description: "Sort posts with the posts with the lowest ID being first",
			value: SortDirection.postIdReverse,
			store: sortPosts
		}]
	} as DropdownOption<SortDirection>,

	{
		label: "Animations",
		description: "Whether or not to show animations on UI elements",
		set: (value: boolean) => {
			animations.set( value )
			localStorage.setItem( 'settings.animations', value.toString() )
		},
		type: OptionType.Toggle,
		store: animations
	} as ToggleOption,

	{
		label: "Suggest Tags",
		description: "When searching, show suggestions/autocomplete tags",
		set: (value: boolean) => {
			tagSuggestions.set( value )
			localStorage.setItem( 'settings.tagSuggestions', value.toString() )
		},
		type: OptionType.Toggle,
		store: tagSuggestions
	} as ToggleOption,

	{
		label: "Bumpscuous",
		description: ":)",
		set: (value: boolean) => {
			bumpscuous.set( value )
			localStorage.setItem( 'settings.bumpscuous', value.toString() )
		},
		type: OptionType.Toggle,
		store: bumpscuous
	} as ToggleOption
] as Option[]

export function labelToId(label: string) {
	return label.toLowerCase().replace(/ /g, '-')
}


// State
export function loadSettingsFromStorage() {
	let stored = {
		handleNSFWPosts: localStorage.getItem( 'settings.handleNSFWPosts' ),
		handleSuggestivePosts: localStorage.getItem( 'settings.handleSuggestivePosts' ),
		handleUntaggedPosts: localStorage.getItem( 'settings.handleUntaggedPosts' ),

		sortPosts: localStorage.getItem( 'settings.sortPosts' ),

		animations: localStorage.getItem( 'settings.animations' ),
		tagSuggestions: localStorage.getItem( 'settings.tagSuggestions' ),
		bumpscuous: localStorage.getItem( 'settings.bumpscuous' )
	}

	if ( stored.handleNSFWPosts )
		handleNSFW.set( PostHandleType[ stored.handleNSFWPosts as keyof typeof PostHandleType ] )
	if ( stored.handleSuggestivePosts )
		handleSuggestive.set( PostHandleType[ stored.handleSuggestivePosts as keyof typeof PostHandleType ] )
	if ( stored.handleUntaggedPosts )
		handleUntagged.set( PostHandleType[ stored.handleUntaggedPosts as keyof typeof PostHandleType ] )

	if ( stored.sortPosts )
		sortPosts.set( SortDirection[stored.sortPosts as keyof typeof SortDirection] )

	if ( stored.animations ) animations.set( stored.animations === 'true' )
	if ( stored.tagSuggestions ) tagSuggestions.set( stored.tagSuggestions === 'true' )
	if ( stored.bumpscuous ) bumpscuous.set( stored.bumpscuous === 'true' )
}