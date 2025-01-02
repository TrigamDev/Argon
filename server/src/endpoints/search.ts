import { SortDirection } from "@argon/data/post"
import { searchPostsByTag } from "@argon/database/search"
import Database from "bun:sqlite"
import { Context } from "elysia"

export default function search(context: Context, db: Database) {
	let query = context.body as any
	
	const sort = query?.sort ?? SortDirection.timestamp

	let posts = searchPostsByTag({
		tags: parseTags( query.tags ?? [] ),
		sort: sort,
		page: {
			size: query.page?.size ?? 60,
			number: query.page?.number ?? 1
		}
	}, db )

	return posts ?? []
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