import Database from "bun:sqlite"
import { Context } from "elysia"
import { getRandomPostFromDB } from "../../util/database"

export default function getRandomPost(context: Context, db: Database) {
	let post = getRandomPostFromDB(db)

	if (!post) {
		context.set.status = 404
		return { error: "Post not found" }
	}
	return post
}