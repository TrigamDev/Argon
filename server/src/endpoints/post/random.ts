import { Context } from "elysia"
import { getRandomPostFromDB } from "@argon/database/posts"

export default function getRandomPost( context: Context ) {
	let post = getRandomPostFromDB()

	if (!post) {
		context.set.status = 404
		return { error: "Post not found" }
	}
	return post
}