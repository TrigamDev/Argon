import { expect, test } from "bun:test"

import type { Tag } from "@argon/util/types"

import { parseTagString, removeDuplicates, tagsToTagString } from "@argon/util/tag"

test('Parse Tag String', () => {
	expect(
		parseTagString('trigam_(artist) error(meta) !amber_(character) the_creature_(character) broken_(meta the bruh (12)')
	).toMatchObject(
		[
			{
				name: 'trigam',
				type: 'artist',
				exclude: false
			},
			{
				name: 'amber',
				type: 'character',
				exclude: true
			},
			{
				name: 'the_creature',
				type: 'character',
				exclude: false
			}
		]
	)
})

test('Exclude Invalid Tags', () => {
	expect(
		parseTagString('error(meta) ben_&_jerrys_(object) -- feiaonfvi trigam_(artist) oe my balls broken_(meta the bruh (12) home-con_(character)')
	).toMatchObject(
		[
			{
				name: 'trigam',
				type: 'artist',
				exclude: false
			},
			{
				name: 'home-con',
				type: 'character',
				exclude: false
			}
		]
	)
})

test('Convert Tags Array to Tag String', () => {
	expect(
		tagsToTagString([{
			name: 'Trigam',
			type: 'artist',
			exclude: false
		}, {
			name: 'amber',
			type: 'Character',
			exclude: true
		}, {
			name: 'amber',
			type: 'character',
			exclude: false
		}])
	).toBe("trigam_(artist) !amber_(character)")
})

test.each([
	[
		[
			{ type: 'artist', name: 'trigam', exclude: false },
			{ type: "ARTIST", name: "TrIgAM", exclude: true },
			{ type: 'character', name: 'amber' },
			{ type: 'CHARACTER', name: 'amber', exclude: true }
		],
		[
			{ type: 'artist', name: 'trigam', exclude: false },
			{ type: 'character', name: 'amber' }
		]
	], [
		[
			{ name: 'spurhuns', type: 'artist' },
			{ name: 'spurhuns', type: 'artist' },
			{ name: 'spurhuns', type: 'character' }
		], 
		[
			{ name: 'spurhuns', type: 'artist' },
			{ name: 'spurhuns', type: 'character' }
		]
	]
])('Remove Duplicate Tags', (tags: Tag[], expected) => {
	expect(removeDuplicates(tags)).toMatchObject(expected)
})