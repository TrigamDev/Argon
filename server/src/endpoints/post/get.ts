import { Context } from "elysia"

import { getPostById } from "@argon/database/posts"

export default function getPost( context: Context ) {
	let id: number = parseInt( ( context.params as any ).id )
	let post = getPostById( id )

	if (!post) {
		context.set.status = 404
		return { error: "Post not found" }
	}
	return post
}