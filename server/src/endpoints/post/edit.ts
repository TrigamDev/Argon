import { Context } from "elysia"
import { parseInput } from "@argon/endpoints/post/upload"

import { editPostByID } from "@argon/database/posts"

import { validateUrl } from "@argon/util/url"

import { Category, log, Status } from "@argon/util/debug"

/* Fields
	timestamp: Number
	tags: Tag[]
	sourceUrl: String
	title: String
*/
export default function editPost( context: Context ) {
	// Input
	let id: number = parseInt((context.params as any).id)
	let input = parseInput(context.body as FormData)
	if (!id || isNaN(id)) {
		context.set.status = 400
		return { error: "Invalid post ID" }
	}

	let editedPost = editPostByID( id, {
		tags: input.tags ?? undefined,
		file: {
			timestamp: Number(input.timestamp),
			title: input.title ?? undefined,
			sourceUrl: validateUrl(input.sourceUrl)?.toString() ?? undefined
		}
	})

	log({
		category: Category.database, status: Status.success,
		message: `Edited Post #${ id }!`
	})

	return editedPost
}