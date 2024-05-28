import Database from "bun:sqlite";
import { Context } from "elysia";
import { decodeTags, decreaseTagUsages, deleteFileById, deletePostById, getPostById } from "../../util/database";
import { Category, Status, log } from "../../util/debug";

export default function deletePost(context: Context, db: Database) {
	// Input
	let id: number = (context.params as any).id
	if (!id) {
		context.set.status = 400
		return { error: "No id provided" }
	}

	// Get post
	let post = getPostById(id, db)
	if (!post) {
		context.set.status = 404
		return { error: "Post not found" }
	}

	log(Category.database, Status.loading, `Deleting post #${post.id}...`, true)

	// Decrease tag usages
	decreaseTagUsages(post.tags, db)

	// Delete post
	deletePostById(post.id, db)
	deleteFileById(post.id, db)

	log(Category.database, Status.success, `Deleted post #${post.id}!`)
	return { success: true }
}