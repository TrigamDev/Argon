import { database } from "@argon/index"

import ArgonFile from "@argon/data/file"

export function getFileById( id: number ): ArgonFile | null {
	let result: any = database.query("SELECT * FROM files WHERE postId = ?").get(id)
	if ( !result ) return null
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

export function deleteFileById( id: number ) {
	database.query(`
		DELETE FROM files WHERE postId = ?
	`).run(id)
}