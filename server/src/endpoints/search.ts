import Database from "bun:sqlite"
import { Context } from "elysia"
import { Sorts, searchPostsByTag } from "../util/database"

export default function search(context: Context, db: Database) {
	let query = context.body as any
	
	let posts = searchPostsByTag(
		parseTags(query.tags), Sorts.timestamp,
		query.page?.size ?? 50, query.page?.number ?? 1,
	db)

	return posts
}

function parseTags(tags: any[]) {
	let parsedTags = []
	for (let tag of tags) {
		parsedTags.push({
			name: tag.name ?? "",
			type: tag.type ?? "",
			exclude: tag.exclude ?? false
		})
	}
	return parsedTags
}