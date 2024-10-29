import { expect, test } from "bun:test"
import Tag from "../src/data/tag"
import { getTagDifference, removeDuplicates } from "../src/util/tags"

// Test tags
const trigamArtist: Tag = { id: 0, name: 'trigam', type: 'artist' }
const trigamCharacter: Tag = { id: 1, name: 'trigam', type: 'character' }
const amberCharacter: Tag = { id: 2, name: 'amber', type: 'character' }
const austinCharacter: Tag = { id: 7, name: 'austin', type: 'character' }
const spurhunsArtist: Tag = { id: 3, name: 'spurhuns', type: 'artist' }
const spurhunsCharacter: Tag = { id: 4, name: 'spurhuns', type: 'character' }

const doodle: Tag = { id: 5, name: 'doodle', type: 'content' }
const discord: Tag = { id: 6, name: 'discord', type: 'source' }
const twitter: Tag = { id: 8, name: 'twitter', type: 'source' }
const digital: Tag = { id: 9, name: 'digital', type: 'medium' }

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
		[ spurhunsArtist, spurhunsArtist, spurhunsCharacter ], 
		[ spurhunsArtist, spurhunsCharacter ]
	]
])('Remove Duplicate Tags', (tags: Tag[], expected) => {
	expect(removeDuplicates(tags)).toMatchObject(expected)
})

test('Convert Tags Array to Tag String', () => {
	expect(
		getTagDifference([ trigamArtist, amberCharacter, doodle, discord ],
			[ trigamArtist, austinCharacter, doodle, twitter, digital ]
		)
	).toMatchObject({
		added: [ austinCharacter, twitter, digital ],
		removed: [ amberCharacter, discord ],
		unchanged: [ trigamArtist, doodle ]
	})
})