import Database from "bun:sqlite"
import { Context } from "elysia"

import { getWebPath } from "../../util/dir"

import { parseInput } from "./upload"
import { editPostByID } from "../../util/database"

export default function editPost(context: Context, db: Database) {
	// Input
	let id: number = parseInt((context.params as any).id)
	let input = parseInput(context.body as FormData)
	if (!id || isNaN(id)) {
		context.set.status = 400
		return { error: "Invalid post ID" }
	}

	const assetsPath = `${getWebPath(context)}/assets`

	let editedPost = editPostByID(id, db, {
		tags: input.tags ?? undefined,
		file: {
			timestamp: Number(input.timestamp),
			title: input.title ?? undefined,
			sourceUrl: input.sourceUrl ?? undefined
		}
	})

	return editedPost
}