import Database from "bun:sqlite"

import { Category, Status, log } from "./debug"

import type Post from "../data/post"
import Tag from "../data/tag"

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
export function createTables(db: Database) {
	log(Category.database, Status.loading, "Creating tables...")
	// Posts
	db.query(`
		CREATE TABLE IF NOT EXISTS Posts (
			postId INTEGER PRIMARY KEY,
			timestamp INTEGER,
			tags JSONB
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
			safe INTEGER,
			usages INTEGER
		)
	`)

	log(Category.database, Status.success, "Tables created!")
}

export function getSQLiteVersion(db: Database) {
	let result: any = db.query("SELECT sqlite_version() as version").get()
	return result['version']
}

//
//	Database functions
//
export async function insertPost(post: Post, db: Database) {
	log(Category.database, Status.loading, `Saving post #${post.id}...`, true)

	// Insert post
	db.query(`
		INSERT INTO posts (postId, timestamp, tags)
		VALUES (?, ?, ?)
	`).run(post.id, post.timestamp, JSON.stringify(post.tags))

	// Insert file
	db.query(`
		INSERT INTO files (postId, url, thumbnailUrl, projectUrl, sourceUrl, timestamp, title, type, extension)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(post.id, post.file.url, post.file.thumbnailUrl, post.file.projectUrl, post.file.sourceUrl, post.file.timestamp, post.file.title, post.file.type, post.file.extension)
	
	log(Category.database, Status.success, `Saved post #${post.id}!`)
}

export function clearPosts(db: Database) {
	log(Category.database, Status.loading, "Clearing posts...", true)
	db.query("DELETE FROM posts").run()
	db.query("DELETE FROM files").run()
	log(Category.database, Status.success, "Posts cleared!")

}

export function getLastPostId(db: Database) {
	let result: any = db.query("SELECT postId FROM posts ORDER BY postId DESC LIMIT 1").get()
	return result ? result.postId : 0
}

export function getPostById(id: number, db: Database): Post | null {
	let result: any = db.query(`
		SELECT * FROM posts
		JOIN files ON posts.postId = files.postId
		WHERE postId = ?
	`).get(id)

	if (!result) return null
	return {
		id: result.postId,
		timestamp: result.timestamp,
		tags: parseTags(result.tags),
		file: {
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

}

export function searchPostsByTag(tags: SearchTag[], sort: Sorts, db: Database): Post[] {
	// Search tags are in the format {name, type, exclude}
	// Post tags are in the format {name, type, safe}
	// except in the db, they're stored as a string list of {name:type:safe},{name:type:safe},...
	let query = `
		SELECT * FROM posts
		JOIN files ON posts.postId = files.postId
	`
	let results: any[] = db.query(query).all()
	return results.map(result => {
		return {
			id: result.id,
			timestamp: result.timestamp,
			tags: parseTags(result.tags),
			file: {
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
	})

}


//
//	Helper functions
//
export function stringifyTags(tags: Tag[]) {
	return tags.map(tag => `{${tag.name}:${tag.type}:${tag.safe}}`).join(",")
}

export function parseTags(tags: string): Tag[] {
	return tags.split(",").map(tag => {
		let [name, type, safe] = tag.slice(1, -1).split(":")
		return { name, type, safe: Boolean(safe) } as Tag
	})
}