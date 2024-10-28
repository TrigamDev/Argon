import Database from "bun:sqlite"

import { Category, Status, log } from "./debug"

import type Post from "../data/post"
import type Tag from "../data/tag"
import type ArgonFile from "../data/file"
import { notifPostEdit } from "./webhook"
import { removeDuplicates } from "./tags"

export interface SearchTag {
	name: string
	type: string
	exclude: boolean
}

export enum Sorts {
	postId = "postId",
	postIdReverse = "postIdReverse",
	timestamp = "timestamp",
	timestampReverse = "timestampReverse",
	tagCount = "tagCount",
	tagCountReverse = "tagCountReverse"
}

//
//	Init
//
/**
 * Initializes the database's tables
 * @param { Database } db The database to create tables for 
 */
export function createTables(db: Database) {
	log(Category.database, Status.loading, "Creating tables...", true)
	// Posts
	db.query(`
		CREATE TABLE IF NOT EXISTS Posts (
			id INTEGER PRIMARY KEY,
			timestamp INTEGER,
			tags TEXT
		)
	`).run()

	// Files
	db.query(`
		CREATE TABLE IF NOT EXISTS Files (
			postId INTEGER PRIMARY KEY,
			url TEXT,
			thumbnailUrl TEXT,
			projectUrl TEXT,
			sourceUrl TEXT,
			timestamp INTEGER,
			title TEXT,
			type TEXT,
			extension TEXT
		)
	`).run()

	// Tags
	db.query(`
		CREATE TABLE IF NOT EXISTS Tags (
			tagId INTEGER PRIMARY KEY AUTOINCREMENT,
			type TEXT,
			name TEXT,
			usages INTEGER
		)
	`).run()

	log(Category.database, Status.success, "Tables created!")
}

/**
 * Gets the SQLite version of the database
 * @param { Database } db The database to get the SQLite version of 
 * @returns { string } The SQLite version of the database
 */
export function getSQLiteVersion(db: Database): string {
	let result: any = db.query("SELECT sqlite_version() as version").get()
	return result['version']
}

/**
 * Clears everything from the database
 * @param { Database } db The database to clear posts from
 */
export function clearDatabase(db: Database) {
	log(Category.database, Status.loading, "Clearing database...", true)

	db.query("DELETE FROM posts").run()
	db.query("DELETE FROM files").run()
	db.query("DELETE FROM tags").run()

	log(Category.database, Status.success, "Database cleared!")
}

//
//	Post
//
/**
 * Inserts a post into the database
 * @param { Post } post The post to insert
 * @param { Database } db The database to insert the post into
 */
export function insertPost(post: Post, db: Database) {
	log(Category.database, Status.loading, `Saving Post #${post.id}...`, true)

	// Remove duplicate tags
	let tags = removeDuplicates(post?.tags) as Tag[]

	// Insert tags
	tags.forEach(tag => insertTag(tag, db))
	
	// Insert post
	db.query(`
		INSERT INTO Posts (id, timestamp, tags)
		VALUES (?, ?, ?)
	`).run(post.id, post.timestamp, encodeTags(tags, db))

	// Insert file
	db.query(`
		INSERT INTO files (postId, url, thumbnailUrl, projectUrl, sourceUrl, timestamp, title, type, extension)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(post.id, post.file.url, post.file.thumbnailUrl, post.file.projectUrl, post.file.sourceUrl, post.file.timestamp, post.file.title, post.file.type, post.file.extension)
	
	log(Category.database, Status.success, `Saved Post #${post.id}!`)
}

export function editPostByID(id: number, db: Database, data: {
	tags?: Tag[], file: {
		timestamp?: number,
		title?: string,
		sourceUrl?: string,
	}
}): Post | null {
	log(Category.database, Status.loading, `Editing Post #${id}...`, true)

	let post = getPostById(id, db)
	if (!post) {
		log(Category.database, Status.error, `Post #${id} does not exist!`)
		return null
	}
	if (!data.tags && !data.file.timestamp && !data.file.title) {
		log(Category.database, Status.error, `No data provided to edit Post #${id}!`)
		return null
	}

	let tagsNeedEditing = (data.tags && data.tags !== post.tags)

	if (tagsNeedEditing) {
		// Get tag differences
		let oldTags = post.tags ?? []
		let newTags = data.tags ?? []
		let tagsToAdd = newTags.filter(tag => !oldTags.some(oldTag => oldTag?.name === tag?.name && oldTag?.type === tag?.type))
		let tagsToRemove = oldTags.filter(tag => !newTags.some(newTag => newTag?.name === tag?.name && newTag?.type === tag?.type))

		// Handle tags
		tagsToAdd.map(tag => insertTag(tag, db))
		tagsToRemove.map(tag => decreaseTagUsages([tag], db))

		// Final tags
		let tags = newTags.filter(tag => !tagsToRemove.some(removeTag => removeTag?.name === tag?.name && removeTag?.type === tag?.type))
		tags = removeDuplicates(tags) as Tag[]

		// Update post
		db.query("UPDATE posts SET tags = ? WHERE id = ?").run(encodeTags(tags, db), id)
	}

	// Update file
	db.query(`
		UPDATE files
		SET timestamp = ?, title = ?, sourceUrl = ?
		WHERE postId = ?
	`).run(
		data.file.timestamp ?? post.file.timestamp,
		data.file.title ?? post.file.title,
		data.file.sourceUrl ?? post.file.sourceUrl,
	id)

	notifPostEdit(post)
	log(Category.database, Status.success, `Edited Post #${id}!`)
	return getPostById(id, db)
}

/**
 * Gets the last post ID from the database
 * @param { Database } db The database to get the last post ID from 
 * @returns { number } The ID of the last post in the database
 */
export function getLastPostId(db: Database): number {
	let result: any = db.query("SELECT id FROM Posts ORDER BY id DESC LIMIT 1").get()
	return result ? result.id : 0
}

/**
 * Gets a post from the database by its ID
 * @param { number } id The ID of the post to get 
 * @param { Database } db The database to get the post from 
 * @returns { Post | null } The post if it exists, otherwise null
 */
export function getPostById(id: number, db: Database): Post | null {
	let post: any = db.query(`
		SELECT * FROM posts
		WHERE id = ?
	`).get(id)
	let file: any = db.query(`
		SELECT * FROM files
		WHERE postId = ?
	`).get(id)

	if (!post || !file) return null
	
	return {
		id: post.id,
		timestamp: post.timestamp,
		tags: decodeTags(post.tags, db),
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

/**
 * Searches for posts by tags
 * @param { SearchTag[] } tags A list of tags to search for 
 * @param { Sorts } sort How to sort the results 
 * @param { number } pageSize How large each page should be 
 * @param { number } pageNumber Which page to get 
 * @param { Database } db The database to search in 
 * @returns { Post[] } A list of posts that match the search criteria
 */
export function searchPostsByTag(tags: SearchTag[], sort: Sorts, pageSize: number, pageNumber: number, db: Database): Post[] {
	// Get tag IDs
	let searchTagIds: number[] = []
	let excludeTagIds: number[] = []

	tags.map(tag => {
		let real = getTag({ name: tag.name, type: tag.type }, db)
		if (!tag.exclude && real && real.id) searchTagIds.push(real.id)
		else if (tag.exclude && real && real.id) excludeTagIds.push(real.id)
	})
	let searching = searchTagIds.length > 0
	let excluding = excludeTagIds.length > 0

	// Get posts
	let posts: Post[] = []
	let results: any[] = []

	let searchQuery = `SELECT * FROM posts`

	// Construct search query (god that was hell)
	if (searching) searchQuery += ` WHERE tags LIKE '%:${searchTagIds[0]}:%' ${searchTagIds.slice(1).map(id => `AND tags LIKE '%:${id}:%'`).join(" ")}`
	if (excluding && !searching) searchQuery += ` WHERE tags NOT LIKE '%:${excludeTagIds[0]}:%' ${excludeTagIds.slice(1).map(id => `AND tags NOT LIKE '%:${id}:%'`).join(" ")}`
	if (excluding && searching) searchQuery += ` AND tags NOT LIKE '%:${excludeTagIds[0]}:%' ${excludeTagIds.slice(1).map(id => `AND tags NOT LIKE '%:${id}:%'`).join(" ")}`
	searchQuery += ` LIMIT ${pageNumber - 1},${pageSize}`

	results = db.query(searchQuery).all()
	
	// Parse results
	results.map(result => {
		let file = getFileById(result.id, db)
		if (!file) return
		posts.push({
			id: result.id,
			timestamp: result.timestamp,
			tags: decodeTags(result.tags, db),
			file: file
		})
	})

	// Sort posts
	switch (sort) {
		case Sorts.postId:
			posts.sort((a, b) => a.id - b.id)
			break
		case Sorts.postIdReverse:
			posts.sort((a, b) => b.id - a.id)
			break
		case Sorts.timestamp:
			posts.sort((a, b) => a.timestamp - b.timestamp)
			break
		case Sorts.timestampReverse:
			posts.sort((a, b) => b.timestamp - a.timestamp)
			break
		case Sorts.tagCount:
			posts.sort((a, b) => a.tags.length - b.tags.length)
			break
		case Sorts.tagCountReverse:
			posts.sort((a, b) => b.tags.length - a.tags.length)
			break
	}

	return posts
}

/**
 * Deletes a post by its ID
 * @param { number } id The ID of the post to delete 
 * @param { Database } db The database to delete the post from 
 */
export function deletePostById(id: number, db: Database) {
	db.query("DELETE FROM posts WHERE id = ?").run(id)
	deleteFileById(id, db)
}



//
//	File
//
/**
 * Gets a file by its post ID
 * @param { number } id The ID of the post to get the file of 
 * @param { Database } db The database to get the file from 
 * @returns The file if it exists, otherwise null
 */
export function getFileById(id: number, db: Database): ArgonFile | null {
	let result: any = db.query("SELECT * FROM files WHERE postId = ?").get(id)
	if (!result) return null
	return {
		url: result.url,
		thumbnailUrl: result.thumbnailUrl,
		projectUrl: result.projectUrl,
		sourceUrl: result.sourceUrl,
		timestamp: result.timestamp,
		title: result.title,
		type: result.type,
		extension: result.extension
	}
}

/**
 * Deletes a file by its post ID
 * @param { number } id The ID of the file to delete 
 * @param { Database } db The database to delete the file from 
 */
export function deleteFileById(id: number, db: Database) {
	db.query("DELETE FROM files WHERE postId = ?").run(id)
}


//
//	Tags
//
/**
 * Inserts a tag into the database
 * @param { Tag } tag The tag to insert 
 * @param { Database } db The database to insert the tag into 
 */
export function insertTag(tag: Tag, db: Database) {
	// If tag exists, increment usages, otherwise insert
	let result: any = db.query("SELECT * FROM tags WHERE name = ? AND type = ?").get(tag.name, tag.type)
	if (result) {
		db.query("UPDATE tags SET usages = usages + 1 WHERE tagId = ?").run(result.tagId)
	} else {
		db.query("INSERT INTO tags (type, name, usages) VALUES (?, ?, ?, ?)").run(tag.type, tag.name, 1)
	}
}

/**
 * Gets a tag from the database
 * @param { Tag } tag The tag to get
 * @param { Database } db The database to get the tag from 
 * @returns { Tag | null } The tag if it exists, otherwise null
 */
export function getTag(tag: Tag, db: Database): Tag | null {
	let result: any = db.query("SELECT * FROM tags WHERE name = ? AND type = ?").get(tag.name, tag.type)
	if (!result) return null
	return {
		id: result.tagId,
		name: result.name,
		type: result.type
	}
}

/**
 * Gets all tags from the database
 * @param { Database } db The database to get tags from 
 * @returns { Tag[] } An array of tags
 */
export function getTags(db: Database): Tag[] {
	let results: any[] = db.query("SELECT * FROM tags").all()
	return results.map(result => {
		return {
			id: result.tagId,
			name: result.name,
			type: result.type,
			usages: result.usages
		} as Tag
	})
}

/**
 * Gets a tag by its ID
 * @param { number } id The ID of the tag to get 
 * @param { Database } db The database to get the tag from 
 * @returns { Tag | null } The tag if it exists, otherwise null
 */
export function getTagById(id: number, db: Database): Tag | null {
	let result: any = db.query("SELECT * FROM tags WHERE tagId = ?").get(id)
	if (!result) return null
	return {
		name: result.name,
		type: result.type
	}
}

/**
 * Deletes a tag by its ID
 * @param { number } id The ID of the tag to delete 
 * @param { Database } db The database to delete the tag from 
 */
export function deleteTagById(id: number, db: Database) {
	db.query("DELETE FROM tags WHERE tagId = ?").run(id)
}

/**
 * Increases the usages of tags in the database
 * @param { Tag[] } tags The tags to increase usages of 
 * @param { Database } db The database to increase usages in
 */
export function increaseTagUsages(tags: Tag[], db: Database) {
	tags.map(tag => {
		let result: any = db.query("SELECT * FROM tags WHERE name = ? AND type = ?").get(tag.name, tag.type)
		if (result) db.query("UPDATE tags SET usages = usages + 1 WHERE tagId = ?").run(result.tagId)
	})
}

/**
 * Decreases the usages of tags in the database
 * @param { Tag[] } tags The tags to decrease usages of 
 * @param { Database } db The database to decrease usages in 
 */
export function decreaseTagUsages(tags: Tag[], db: Database) {
	tags.map(tag => {
		let result: any = db.query("SELECT * FROM tags WHERE name = ? AND type = ?").get(tag?.name, tag?.type)
		if (result) {
			// If tag is only used once, delete it
			if (result.usages <= 1) deleteTagById(result.tagId, db)
			else db.query("UPDATE tags SET usages = usages - 1 WHERE tagId = ?").run(result?.tagId)
		}
	})
}

/**
 * Encodes tags into a string to be used with the database
 * @param { Tag[] } tags The tags to encode 
 * @param { Database } db The database to encode the tags with
 * @returns { string } A database-encoded tag string
 */
export function encodeTags(tags: Tag[], db: Database): string {
	// Get array of tag IDs
	let ids = tags.map(tag => {
		let result: any = db.query("SELECT tagId FROM tags WHERE name = ? AND type = ?").get(tag.name, tag.type)
		return result ? result.tagId : -1
	})
	// Encode IDs
	return `:${ids.join(":")}:`
}

/**
 * Decodes a database-encoded tag string into an array of tags
 * @param { string } encoded The encoded tag string to decode
 * @param { Database } db The database to decode the tags with 
 * @returns { Tag[] } An array of tags
 */
export function decodeTags(encoded: string, db: Database): Tag[] {
	// Get array of tag IDs
	let ids = encoded.split(":").map(id => parseInt(id)).filter(id => !isNaN(id))
	// Get tags from IDs
	return ids.map(id => {
		let result: any = db.query("SELECT * FROM tags WHERE tagId = ?").get(id)
		return {
			name: result.name,
			type: result.type
		}
	})
}