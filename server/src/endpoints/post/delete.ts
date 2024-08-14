import Database from "bun:sqlite"
import { Context } from "elysia"
import { decreaseTagUsages, deletePostById, getPostById } from "../../util/database"
import { Category, Status, log } from "../../util/debug"
import { deleteFile, getFileExtension, getFileName } from "../../util/files"

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

	log(Category.database, Status.loading, `Deleting Post #${post.id}...`, true)

	// Decrease tag usages
	decreaseTagUsages(post.tags, db)

	// Delete files
	deleteFile(post.id, {
		name: getFileName(post.file.url).split('_').slice(1).join('_'),
		extension: post.file.extension,
		type: post.file.type
	})
	deleteFile(post.id, {
		name: getFileName(post.file.thumbnailUrl).split('_').slice(1).join('_'),
		extension: 'webp',
		type: 'thumbnail'
	})
	if (post.file.projectUrl) deleteFile(post.id, {
		name: getFileName(post.file.projectUrl).split('_').slice(1).join('_'),
		extension: getFileExtension(post.file.projectUrl),
		type: 'project'
	})

	// Delete posts from database
	deletePostById(post.id, db)

	log(Category.database, Status.success, `Deleted Post #${post.id}!`)
	return { success: true }
}