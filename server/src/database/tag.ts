import { database } from "@argon/index"

import Tag from "@argon/data/tag"

import { Category, log, Status } from "@argon/util/debug"
import { notifError } from "@argon/notifs/webhook"

export function increaseTagUsages( tag: Tag ) {
	// If tag exists, increment usages, otherwise insert
	try {		
		const result: any = database.query(
			`SELECT * FROM tags WHERE name = ? AND type = ?`
		).get( tag.name, tag.type )

		if (result) {
			database.query(`
				UPDATE tags SET usages = usages + 1 WHERE tagId = ?
			`).run( result.tagId )
		} else {
			database.query(`
				INSERT INTO tags (type, name, usages) VALUES (?, ?, ?)
			`).run( tag.type, tag.name, 1 )
		}
	} catch ( error ) {
		log({
			category: Category.database, status: Status.error,
			message: `Error inserting tag: ${error}`
		})
		notifError(error as Error)
	}
}

export function decreaseTagUsages( tag: Tag ) {
	const result: any = database.query(`
		SELECT * FROM tags WHERE name = ? AND type = ?
	`).get( tag?.name, tag?.type )

	if (result) {
		// If tag is only used once, delete it
		if (result.usages <= 1) deleteTagById( result.tagId )
		else database.query(`
			UPDATE tags SET usages = usages - 1 WHERE tagId = ?
		`).run( result?.tagId )
	}
}

export function getTag( tag: Tag ): Tag | null {
	const result: any = database.query(`
		SELECT * FROM tags WHERE name = ? AND type = ?
	`).get( tag.name, tag.type )

	if ( !result ) return null
	return {
		id: result?.tagId ?? 0,
		name: result?.name ?? 'tag',
		type: result?.type ?? 'unknown',
		usages: result?.usages ?? 0
	}
}

export function getTags(): Tag[] {
	const results: any[] = database.query(`SELECT * FROM tags`).all()
	return results.map( result => {
		return {
			id: result?.tagId ?? 0,
			name: result?.name ?? 'tag',
			type: result?.type ?? 'unknown',
			usages: result?.usages ?? 0
		} as Tag
	})
}

export function getTagById( id: number ): Tag | null {
	const result: any = database.query(`
		SELECT * FROM tags WHERE tagId = ?
	`).get( id )

	if (!result) return null
	return {
		id: result?.tagId ?? 0,
		name: result?.name ?? 'tag',
		type: result?.type ?? 'unknown',
		usages: result?.usages ?? 0
	}
}

export function deleteTagById(id: number) {
	database.query(`DELETE FROM tags WHERE tagId = ?`).run( id )
}

export function encodeTags( tags: Tag[] ): string {
	// Get array of tag IDs
	let ids = tags.map(tag => {
		const result: any = database.query(`
			SELECT tagId FROM tags WHERE name = ? AND type = ?
		`).get( tag.name, tag.type )
		return result ? result.tagId : -1
	})
	// Encode IDs
	return `:${ ids.join(":") }:`
}

export function decodeTags( encoded: string ): Tag[] {
	// Get array of tag IDs
	let ids = encoded.split( ":" ).map( id => parseInt( id ) ).filter( id => !isNaN( id ) )

	// Get tags from IDs
	return ids.map( id => {
		let result: any = database.query(`
			SELECT * FROM tags WHERE tagId = ?
		`).get( id )
		return {
			id: result?.tagId ?? 0,
			name: result?.name ?? 'tag',
			type: result?.type ?? 'unknown',
			usages: result?.usages ?? 0
		}
	})
}