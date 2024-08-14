import Database from "bun:sqlite"
import { Context } from "elysia"
import { getPostById } from "../../util/database"

export default function getPost(context: Context, db: Database) {
	let id: number = parseInt((context.params as any).id)
	let post = getPostById(id, db)

	if (!post) {
		context.set.status = 404
		return { error: "Post not found" }
	}
	return post
}