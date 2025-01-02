import { database } from "@argon/index"
import { decodeTags, decreaseTagUsages, encodeTags, increaseTagUsages } from "@argon/database/tag"
import { deleteFileById } from "@argon/database/file"

import Post from "@argon/data/post"
import Tag from "@argon/data/tag"

import { notifError, notifPostEdit } from "@argon/notifs/webhook"
import { Category, log, Status } from "@argon/util/debug"

import { getTagDifference, removeDuplicates } from "@argon/data/tag"


export function getPostById( id: number ): Post | null {
	const post: any = database.query(`
		SELECT * FROM posts
		WHERE id = ?
	`).get( id )
	const file: any = database.query(`
		SELECT * FROM files
		WHERE postId = ?
	`).get( id )

	if ( !post || !file ) return null
	
	return {
		id: post.id,
		timestamp: post.timestamp,
		tags: decodeTags( post.tags ),
		file: {
			url: file.url,
			thumbnailUrl: file.thumbnailUrl,
			projectUrl: file.projectUrl,
			sourceUrl: file.sourceUrl,
			timestamp: file.timestamp,
			title: file.title,
			type: file.type,
			extension: file.extension
		}
	}
}

export function getLastPostId(): number {
	const result: any = database.query(
		`SELECT id FROM Posts ORDER BY id DESC LIMIT 1`
	).get()
	return result ? result.id : 0
}

export function getRandomPostFromDB(): Post | null {
	let post: any = database.query(`
		SELECT * FROM posts
		ORDER BY RANDOM()
		LIMIT 1
	`).get()
	if ( !post || !post.id ) return null
	
	let file: any = database.query(`
		SELECT * FROM files
		WHERE postId = ?
	`).get( post?.id )

	if (!post || !file) return null
	
	return {
		id: post.id,
		timestamp: post.timestamp,
		tags: decodeTags( post.tags ),
		file: {
			url: file.url,
			thumbnailUrl: file.thumbnailUrl,
			projectUrl: file.projectUrl,
			sourceUrl: file.sourceUrl,
			timestamp: file.timestamp,
			title: file.title,
			type: file.type,
			extension: file.extension
		}
	}
}

export function insertPost( post: Post ) {
	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: `Saving Post #${post.id}...`
	})

	// Remove duplicate tags
	let tags = removeDuplicates( post?.tags ) as Tag[]

	// Insert tags
	tags.forEach( tag => increaseTagUsages( tag ) )

	try {
		// Insert post
		database.query(`
			INSERT INTO Posts (id, timestamp, tags)
			VALUES (?, ?, ?)
		`).run( post.id, post.timestamp, encodeTags( tags ) )
	
		// Insert file
		database.query(`
			INSERT INTO files (postId, url, thumbnailUrl, projectUrl, sourceUrl, timestamp, title, type, extension)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).run(
			post.id, post.file.url, post.file.thumbnailUrl, post.file.projectUrl,
			post.file.sourceUrl, post.file.timestamp, post.file.title,
			post.file.type, post.file.extension
		)
	} catch ( error: any ) {
		log({
			category: Category.database, status: Status.error,
			message: `Error saving Post #${ post.id }!`
		})
		notifError( error )
	}
	
	log({
		category: Category.database, status: Status.success,
		message: `Saved Post #${ post.id }!`
	})
}

interface PostEditData {
	tags?: Tag[],
	file: {
		timestamp?: number,
		title?: string,
		sourceUrl?: string
	}
}
export function editPostByID( id: number, data: PostEditData ): Post | null {
	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: `Editing Post #${ id }...`
	})

	const post = getPostById( id )
	if ( !post ) {
		log({
			category: Category.database, status: Status.error,
			message: `Post #${ id } does not exist!`
		})
		return null
	}
	if ( !data.tags && !data.file.timestamp && !data.file.title ) {
		log({
			category: Category.database, status: Status.error,
			message: `No data provided to edit Post #${ id }!`
		})
		return null
	}

	const tagsNeedEditing = ( data.tags && data.tags !== post.tags )
	if ( tagsNeedEditing ) {
		let tagDifference = getTagDifference( post.tags, data.tags ?? [] )
		
		// Handle tags
		tagDifference.added.map( tag => increaseTagUsages( tag ) )
		tagDifference.removed.map( tag => decreaseTagUsages( tag ) )

		// Final tags
		let finalTags = [ ...tagDifference.unchanged, ...tagDifference.added ]
		finalTags = removeDuplicates( finalTags ) as Tag[]

		// Update post
		database.query(
			`UPDATE posts SET tags = ? WHERE id = ?`
		).run( encodeTags( finalTags ), id )
	}

	// Update file
	database.query(`
		UPDATE files
		SET timestamp = ?, title = ?, sourceUrl = ?
		WHERE postId = ?
	`).run(
		data.file.timestamp ?? 0,
		data.file.title ?? post.file.title,
		data.file.sourceUrl ?? "",
		id
	)

	notifPostEdit( post )
	return getPostById( id )
}

export function deletePostById( id: number ) {
	const post = getPostById( id )
	let tags = post?.tags
	if ( tags ) { for ( let tag of tags ) decreaseTagUsages( tag ) }

	database.query(
		`DELETE FROM posts WHERE id = ?`
	).run( id )
	deleteFileById( id )
}