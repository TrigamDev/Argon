import { Context } from "elysia"
import { decreaseTagUsages } from "@argon/database/tag"
import { Category, Status, log } from "@argon/util/debug"
import { getFileExtension, getFileName } from "@argon/files/data"
import { deletePostById, getPostById } from "@argon/database/posts"
import { deleteFile } from "@argon/files/fileSystem"

export default function deletePost( context: Context ) {
	// Input
	let id: number = ( context.params as any ).id
	if ( !id ) {
		context.set.status = 400
		return { error: "No id provided" }
	}

	// Get post
	let post = getPostById( id )
	if ( !post ) {
		context.set.status = 404
		return { error: "Post not found" }
	}

	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: `Deleting Post #${post.id}...`
	})

	// Decrease tag usages
	for ( let tag of post.tags ) decreaseTagUsages( tag )

	// Delete files
	deleteFile( post.id, {
		name: getFileName( post.file.url ).split( '_' ).slice( 1 ).join( '_' ),
		extension: post.file.extension,
		type: post.file.type
	})
	deleteFile( post.id, {
		name: getFileName( post.file.thumbnailUrl ).split( '_' ).slice( 1 ).join( '_' ),
		extension: 'webp',
		type: 'thumbnail'
	})
	if ( post.file.projectUrl ) deleteFile( post.id, {
		name: getFileName( post.file.projectUrl ).split( '_' ).slice( 1 ).join( '_' ),
		extension: getFileExtension( post.file.projectUrl ),
		type: 'project'
	})

	// Delete posts from database
	deletePostById( post.id )

	log({
		category: Category.database, status: Status.success,
		message: `Deleted Post #${post.id}!`
	})
	return { success: true }
}