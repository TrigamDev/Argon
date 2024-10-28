import { parseTagString, tagsToTagString } from "@argon/util/tag"
import { expect, test } from "bun:test"

test('Parse Tag String', () => {
	expect(
		parseTagString('trigam_(artist) error(meta) !amber_(character) broken_(meta')
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