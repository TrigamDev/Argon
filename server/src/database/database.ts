import { database } from "@argon/index"

import { Category, Status, log } from "@argon/util/debug"


export function createTables() {
	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: "Creating tables..."
	})
	// Posts
	database.query(`
		CREATE TABLE IF NOT EXISTS Posts (
			id INTEGER PRIMARY KEY,
			timestamp INTEGER,
			tags TEXT
		)
	`).run()

	// Files
	database.query(`
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
	database.query(`
		CREATE TABLE IF NOT EXISTS Tags (
			tagId INTEGER PRIMARY KEY AUTOINCREMENT,
			type TEXT,
			name TEXT,
			usages INTEGER
		)
	`).run()

	log({
		category: Category.database, status: Status.success,
		message: "Tables created!"
	})
}

export function getSQLiteVersion(): string {
	let result: any = database.query(`
		SELECT sqlite_version() as version
	`).get()
	return result[ 'version' ]
}

export function clearDatabase() {
	log({
		category: Category.database, status: Status.loading,
		newLine: true,
		message: "Clearing database..."
	})

	database.query( `DELETE FROM posts` ).run()
	database.query( `DELETE FROM files` ).run()
	database.query( `DELETE FROM tags` ).run()

	log({
		category: Category.database, status: Status.success,
		message: "Database cleared!"
	})
}